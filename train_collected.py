#!/usr/bin/env python3
"""
train_collected.py — Train the small ISHAARA sign classifier on a JSON dataset
exported from the in-app Sign Sample Recorder ("Export JSON").

Requires ONLY numpy (no PyTorch — keeps setup light on this machine).

Features: per-landmark mean + std over the 24-frame window, using the first
225 coordinates of each frame (pose 33 + left hand 21 + right hand 21
landmarks, x/y/z each) — matches MediaPipe output ordering used by
src/hooks/useLandmarkCapture.ts.

Model (real, tiny, runs 100% on-device in pure JS):
  Linear(450 -> 64) + ReLU  ->  Linear(64 -> C)  ->  softmax

Usage:
  .venv/bin/python train_collected.py
  .venv/bin/python train_collected.py --data path.json --out public/models/sign_model_v1.json --epochs 80

Output:
  public/models/sign_model_v1.json — plain-JSON weights consumed by
  src/workers/tflite.worker.ts (format "ishaara-sign-mlp-v1").
"""

import argparse
import json
import os
import random
import time
from collections import Counter

import numpy as np

INPUT_DIM = 225          # pose(33) + left hand(21) + right hand(21) landmarks * 3 coords
FEATURE_DIM = 2 * INPUT_DIM   # mean + std per coordinate
HIDDEN_DIM = 64
WINDOW = 24
MIN_SAMPLES_PER_CLASS = 3


def load_samples(path):
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    if isinstance(data, list):
        samples = data
    else:
        samples = data.get("samples", [])
    if not samples:
        raise RuntimeError(f"No samples found in '{path}'.")

    out = []
    for s in samples:
        label = str(s.get("label", "")).strip().upper()
        frames = s.get("frames") or []
        if not label or not frames:
            continue
        arr = np.asarray(frames, dtype=np.float32)
        arr = arr[:, :INPUT_DIM]
        if arr.shape[1] < INPUT_DIM:
            pad = np.zeros((arr.shape[0], INPUT_DIM - arr.shape[1]), dtype=np.float32)
            arr = np.concatenate([arr, pad], axis=1)
        if len(arr) < WINDOW:
            pad = np.zeros((WINDOW - len(arr), INPUT_DIM), dtype=np.float32)
            arr = np.concatenate([arr, pad], axis=0)
        else:
            arr = arr[:WINDOW]
        out.append((label, arr))
    return out


def extract_features(window):
    """window: (T, D) → (2D,) [per-coordinate mean, per-coordinate std]."""
    mean = window.mean(axis=0)
    std = window.std(axis=0)
    return np.concatenate([mean, std]).astype(np.float32)


def mlp_forward(x, W1, b1, W2, b2):
    """Same math as the JS worker (ishaara-sign-mlp-v1). Returns logits (N, C)."""
    z1 = x @ W1.T + b1
    a1 = np.maximum(z1, 0.0)
    z2 = a1 @ W2.T + b2
    return z2, a1


def predict(x, W1, b1, W2, b2):
    logits, _ = mlp_forward(x, W1, b1, W2, b2)
    return np.argmax(logits, axis=1)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", default="public/models/ishaara-dataset.json")
    parser.add_argument("--out", default="public/models/sign_model_v1.json")
    parser.add_argument("--epochs", type=int, default=80)
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--batch", type=int, default=16)
    args = parser.parse_args()

    random.seed(args.seed)
    np.random.seed(args.seed)

    if not os.path.exists(args.data):
        if os.path.exists(os.path.basename(args.data)):
            args.data = os.path.basename(args.data)
        else:
            print(f"❌ Dataset not found: '{args.data}'")
            print("   Open the app → 'Record Signs' → record at least 3-4 takes per sign → 'Export JSON'.")
            raise SystemExit(1)

    samples = load_samples(args.data)
    counts = Counter(label for label, _ in samples)
    print(f"📦 Loaded {len(samples)} sequence samples across {len(counts)} labels:")
    for label, n in counts.most_common():
        flag = "" if n >= MIN_SAMPLES_PER_CLASS else "  ⚠️ too few for training"
        print(f"   {n:>3}  {label}{flag}")

    usable = {lbl for lbl, n in counts.items() if n >= MIN_SAMPLES_PER_CLASS}
    for lbl in sorted(lbl for lbl, n in counts.items() if n < MIN_SAMPLES_PER_CLASS):
        print(f"   ⚠ Dropping '{lbl}' — only {counts[lbl]} takes (need ≥ {MIN_SAMPLES_PER_CLASS}).")

    if len(usable) < 2:
        print("❌ Need at least 2 labels with enough samples. Record more takes first.")
        raise SystemExit(1)

    labels = sorted(usable)
    lab2idx = {lbl: i for i, lbl in enumerate(labels)}
    C = len(labels)

    # stratified split by class
    kept = [s for s in samples if s[0] in usable]
    by_lbl = {lbl: [(i, s) for i, (lbl2, s) in enumerate(kept) if lbl2 == lbl] for lbl in labels}
    train_idx, test_idx = [], []
    for lbl, items in by_lbl.items():
        random.shuffle(items)
        n_test = min(int(len(items) * 0.2), len(items) - 1)
        n_test = max(n_test, 1)
        test_idx += [i for i, _ in items[:n_test]]
        train_idx += [i for i, _ in items[n_test:]]
    random.shuffle(train_idx)

    windows = np.stack([arr for _, arr in kept]).astype(np.float32)   # (N, WINDOW, 225)
    yenc = np.array([lab2idx[lbl] for lbl, _ in kept], dtype=np.int64)

    # frame-level z-normalization (from training windows only)
    mean = windows[train_idx].reshape(-1, INPUT_DIM).mean(axis=0)
    std = windows[train_idx].reshape(-1, INPUT_DIM).std(axis=0)
    std[std < 1e-6] = 1.0
    normed = (windows - mean) / std

    Ftr = np.stack([extract_features(normed[i]) for i in train_idx]).astype(np.float32)
    Fte = np.stack([extract_features(normed[i]) for i in test_idx]).astype(np.float32)
    Ytr = yenc[train_idx]
    Yte = yenc[test_idx]

    # numeric gradient check on a tiny probe before real init
    _check_gradients()

    def init(k):
        bound = k / np.sqrt(FEATURE_DIM)
        return (np.random.uniform(-bound, bound, (HIDDEN_DIM, FEATURE_DIM)).astype(np.float32),
                np.zeros(HIDDEN_DIM, dtype=np.float32),
                np.random.uniform(-bound, bound, (C, HIDDEN_DIM)).astype(np.float32),
                np.zeros(C, dtype=np.float32))

    W1, b1, W2, b2 = init(1.0)
    lr = 0.05
    t0 = time.time()

    # simple mini-batch SGD with momentum
    vW1 = np.zeros_like(W1); vb1 = np.zeros_like(b1)
    vW2 = np.zeros_like(W2); vb2 = np.zeros_like(b2)
    mom = 0.9

    for epoch in range(args.epochs):
        order = np.random.permutation(len(Ftr))
        running = 0.0
        for start in range(0, len(Ftr), args.batch):
            idx = order[start:start + args.batch]
            xb, yb = Ftr[idx], Ytr[idx]
            m = len(xb)

            z1 = xb @ W1.T + b1
            a1 = np.maximum(z1, 0.0)
            z2 = a1 @ W2.T + b2
            logits = z2 - z2.max(axis=1, keepdims=True)
            exps = np.exp(logits)
            probs = exps / exps.sum(axis=1, keepdims=True)
            loss = float(-np.log(probs[np.arange(m), yb] + 1e-9).mean())

            d2 = probs.copy()
            d2[np.arange(m), yb] -= 1.0
            d2 /= m
            dW2 = d2.T @ a1
            db2 = d2.sum(axis=0)
            da1 = d2 @ W2
            dz1 = da1 * (a1 > 0)
            dW1 = dz1.T @ xb
            db1 = dz1.sum(axis=0)

            vW1 = mom * vW1 + dW1; vb1 = mom * vb1 + db1
            vW2 = mom * vW2 + dW2; vb2 = mom * vb2 + db2
            W1 -= lr * vW1; b1 -= lr * vb1
            W2 -= lr * vW2; b2 -= lr * vb2

            running += loss

        if epoch % 10 == 0 or epoch == args.epochs - 1:
            tr_acc = float((predict(Ftr, W1, b1, W2, b2) == Ytr).mean())
            te_acc = float((predict(Fte, W1, b1, W2, b2) == Yte).mean())
            print(f"  epoch {epoch:>3}/{args.epochs}  loss {running / max(1, (len(Ftr) + args.batch - 1) // args.batch):.4f}  "
                  f"train_acc {tr_acc:.3f}  val_acc {te_acc:.3f}")

    print(f"\n⏱ Trained in {time.time() - t0:.1f}s on CPU (numpy, no GPU)")

    yp = predict(Fte, W1, b1, W2, b2)
    te_acc = float((yp == Yte).mean())
    print(f"✅ Final validation accuracy: {te_acc:.0%} on {len(Fte)} held-out takes")
    for lbl, i in lab2idx.items():
        mask = Yte == i
        if mask.sum():
            print(f"   {lbl:<14} {int((yp[mask] == i).sum())}/{int(mask.sum())} correct")

    if te_acc < 0.6:
        print("⚠ Accuracy below 60% — record more takes per sign (aim 8-12) and retrain.")

    # ---- export plain-JSON weights consumed by the JS worker ----
    def arr2list(a, decimals=6):
        return [float(round(v, decimals)) for v in a.reshape(-1)]

    payload = {
        "format": "ishaara-sign-mlp-v1",
        "labels": labels,
        "featureDim": FEATURE_DIM,
        "inputDim": INPUT_DIM,
        "hiddenDim": HIDDEN_DIM,
        "windowSize": WINDOW,
        "mean": arr2list(mean),
        "std": arr2list(std),
        "weights": {
            "w1": arr2list(W1), "b1": arr2list(b1),
            "w2": arr2list(W2), "b2": arr2list(b2),
        },
        "train": {"trainAcc": round(float((predict(Ftr, W1, b1, W2, b2) == Ytr).mean()), 4),
                  "valAcc": round(te_acc, 4),
                  "samples": len(samples), "epochs": args.epochs},
    }

    os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        json.dump(payload, f)

    kb = os.path.getsize(args.out) / 1024
    print(f"💾 Model exported → {args.out} ({kb:.0f} KB)")
    print(f"   Live inference will activate in the app for: {', '.join(labels)}")


def _check_gradients():
    """Finite-difference sanity check for the MLP gradient formulas."""
    rng = np.random.RandomState(0)
    F = 20
    Nh = 8
    Cc = 3
    W1 = rng.randn(Nh, F) * 0.1
    b1 = rng.randn(Nh) * 0.1
    W2 = rng.randn(Cc, Nh) * 0.1
    b2 = rng.randn(Cc) * 0.1
    x = rng.randn(5, F)
    y = rng.randint(0, Cc, 5)

    z1 = x @ W1.T + b1
    a1 = np.maximum(z1, 0.0)
    z2 = a1 @ W2.T + b2
    logits = z2 - z2.max(axis=1, keepdims=True)
    exps = np.exp(logits)
    probs = exps / exps.sum(axis=1, keepdims=True)
    loss = lambda p: -np.log(p[np.arange(len(y)), y] + 1e-9).mean()

    d2 = probs.copy(); d2[np.arange(len(y)), y] -= 1.0; d2 /= len(y)
    dW2 = d2.T @ a1
    da1 = d2 @ W2
    dz1 = da1 * (a1 > 0)
    dW1 = dz1.T @ x

    eps = 1e-5
    for name, analytic, ref in (("W1", dW1, W1), ("W2", dW2, W2)):
        for i, j in [(0, 0), (1, 2)]:
            ref[i, j] += eps
            z1 = x @ W1.T + b1
            a1 = np.maximum(z1, 0.0)
            z2 = a1 @ W2.T + b2
            logits = z2 - z2.max(axis=1, keepdims=True)
            exps = np.exp(logits)
            p1 = exps / exps.sum(axis=1, keepdims=True)
            l1 = loss(p1)
            ref[i, j] -= 2 * eps
            z1 = x @ W1.T + b1
            a1 = np.maximum(z1, 0.0)
            z2 = a1 @ W2.T + b2
            logits = z2 - z2.max(axis=1, keepdims=True)
            exps = np.exp(logits)
            p2 = exps / exps.sum(axis=1, keepdims=True)
            l2 = loss(p2)
            ref[i, j] += eps
            num = (l1 - l2) / (2 * eps)
            an = analytic[i, j]
            assert abs(num - an) < 5e-3, f"{name} grad mismatch: {num:.6f} vs {an:.6f}"
    print("✅ Gradient check passed (finite-difference vs analytic)")


if __name__ == "__main__":
    main()