# train_pipeline.py
import os
import json
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader

# Bounding box landmarks configuration matching useMediaPipe
NUM_POSE = 33
NUM_HAND = 21
NUM_FACE = 468
COORDINATE_COUNT = 1629 # 543 landmarks * 3

class SignLanguageDataset(Dataset):
    def __init__(self, dataset_path, sequence_length=30):
        """
        Args:
            dataset_path: Path to extracted archive containing PSL_dataset.
            sequence_length: Number of frames per gesture sequence.
        """
        self.sequence_length = sequence_length
        self.data = []
        self.labels = []
        
        # Check subfolder words_dataset inside the extracted archive
        words_dir = os.path.join(dataset_path, "PSL_dataset", "datasets", "words_dataset")
        if not os.path.exists(words_dir):
            words_dir = dataset_path # Fallback to path directly
            
        if not os.path.exists(words_dir):
            raise FileNotFoundError(f"Dataset path '{words_dir}' not found.")
            
        self.classes = sorted([d for d in os.listdir(words_dir) if os.path.isdir(os.path.join(words_dir, d))])
        self.class_to_idx = {cls_name: i for i, cls_name in enumerate(self.classes)}
        
        print(f"📦 Found {len(self.classes)} sign gloss classes in words_dataset: {self.classes}")
        self._load_and_normalize_dataset(words_dir)

    def _load_and_normalize_dataset(self, words_dir):
        for cls_name in self.classes:
            cls_dir = os.path.join(words_dir, cls_name)
            
            # Subdirectories are timestamp sequences representing individual video recordings
            seq_folders = sorted([d for d in os.listdir(cls_dir) if os.path.isdir(os.path.join(cls_dir, d))])
            
            for seq_folder in seq_folders:
                folder_path = os.path.join(cls_dir, seq_folder)
                json_files = sorted([f for f in os.listdir(folder_path) if f.endswith('.json')])
                
                if len(json_files) == 0:
                    continue
                    
                sequence_frames = []
                for json_file in json_files:
                    file_path = os.path.join(folder_path, json_file)
                    with open(file_path, 'r', encoding='utf-8') as f:
                        frame_data = json.load(f)
                    
                    # Convert OpenPose JSON frame coordinates to normalized 1629 float array
                    flat_frame = self._parse_and_normalize_frame(frame_data)
                    sequence_frames.append(flat_frame)
                
                # Format coordinates array to match window size exactly
                if len(sequence_frames) < self.sequence_length:
                    # Pad missing frames with trailing zero arrays
                    padding = [np.zeros(COORDINATE_COUNT) for _ in range(self.sequence_length - len(sequence_frames))]
                    sequence_frames.extend(padding)
                else:
                    # Truncate
                    sequence_frames = sequence_frames[:self.sequence_length]
                    
                self.data.append(np.array(sequence_frames))
                self.labels.append(self.class_to_idx[cls_name])
                
        print(f"✅ Loaded {len(self.data)} total sequence samples.")

    def _parse_and_normalize_frame(self, frame_data):
        # Initialize default zeroed arrays
        pose_pts = [0.0] * (NUM_POSE * 3)
        lh_pts = [0.0] * (NUM_HAND * 3)
        rh_pts = [0.0] * (NUM_HAND * 3)
        face_pts = [0.0] * (NUM_FACE * 3)
        
        people = frame_data.get("people", [])
        if len(people) > 0:
            person = people[0]
            
            # OpenPose outputs flat 2D coordinate lists [x, y, confidence]
            openpose_pose = person.get("pose_keypoints_2d", [])
            openpose_lh = person.get("hand_left_keypoints_2d", [])
            openpose_rh = person.get("hand_right_keypoints_2d", [])
            openpose_face = person.get("face_keypoints_2d", [])
            
            # Normalize coordinates relative to shoulders
            # OpenPose BODY_25 indices: 2 = RShoulder, 5 = LShoulder
            shoulder_width = 1.0
            origin_x, origin_y = 0.0, 0.0
            
            if len(openpose_pose) >= 18:
                r_shoulder_x = openpose_pose[6]
                r_shoulder_y = openpose_pose[7]
                l_shoulder_x = openpose_pose[15]
                l_shoulder_y = openpose_pose[16]
                
                dx = l_shoulder_x - r_shoulder_x
                dy = l_shoulder_y - r_shoulder_y
                shoulder_width = np.sqrt(dx * dx + dy * dy) or 1.0
                
                origin_x = (l_shoulder_x + r_shoulder_x) / 2
                origin_y = (l_shoulder_y + r_shoulder_y) / 2
                
            # Maps 2D coordinates into normalized 3D coordinates (z = 0.0)
            def normalize_list(op_list, target_count):
                norm_pts = []
                for i in range(target_count):
                    if i * 3 + 1 < len(op_list):
                        x = op_list[i * 3]
                        y = op_list[i * 3 + 1]
                        
                        x_norm = (x - origin_x) / shoulder_width if x != 0.0 else 0.0
                        y_norm = (y - origin_y) / shoulder_width if y != 0.0 else 0.0
                        
                        norm_pts.extend([x_norm, y_norm, 0.0])
                    else:
                        norm_pts.extend([0.0, 0.0, 0.0])
                return norm_pts

            pose_pts = normalize_list(openpose_pose, NUM_POSE)
            lh_pts = normalize_list(openpose_lh, NUM_HAND)
            rh_pts = normalize_list(openpose_rh, NUM_HAND)
            face_pts = normalize_list(openpose_face, NUM_FACE)
            
        return pose_pts + lh_pts + rh_pts + face_pts

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        return (
            torch.tensor(self.data[idx], dtype=torch.float32),
            torch.tensor(self.labels[idx], dtype=torch.long)
        )

# --- Spatiotemporal Transformer Architecture ---
class SpatiotemporalTransformer(nn.Module):
    def __init__(self, num_classes, d_model=256, nhead=8, num_layers=3, seq_len=30, input_dim=1629):
        super(SpatiotemporalTransformer, self).__init__()
        self.embedding = nn.Linear(input_dim, d_model)
        self.pos_embedding = nn.Parameter(torch.randn(1, seq_len, d_model))
        
        encoder_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=nhead,
            batch_first=True
        )
        self.transformer = nn.TransformerEncoder(encoder_layer, num_layers=num_layers)
        self.fc_out = nn.Linear(d_model, num_classes)

    def forward(self, x):
        # x shape: (batch_size, seq_len, input_dim)
        x = self.embedding(x) + self.pos_embedding
        x = self.transformer(x)
        # Average pooling across time frames
        x = x.mean(dim=1)
        return self.fc_out(x)

if __name__ == "__main__":
    DATASET_DIR = "./archive"
    
    if os.path.exists(DATASET_DIR):
        try:
            dataset = SignLanguageDataset(DATASET_DIR)
            dataloader = DataLoader(dataset, batch_size=16, shuffle=True)
            
            # Compile spatiotemporal transformer
            model = SpatiotemporalTransformer(num_classes=len(dataset.classes))
            print("✅ Spatiotemporal Transformer model compiled successfully.")
            
            # Print sequence and batch shapes
            inputs, labels = next(iter(dataloader))
            print(f"📊 Input Tensor Batch Shape: {inputs.shape}  [Batch size, Sequence frames, Coordinates]")
            print(f"📊 Label Tensor Batch Shape: {labels.shape}")
        except Exception as e:
            print(f"❌ Error during training pipeline: {e}")
    else:
        print(f"⚠️ Directory '{DATASET_DIR}' not found. Please ensure dataset is extracted.")
