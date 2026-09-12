/* ISHAARA — content script
 * Shows a floating "Sign it" bubble when text is selected, and hosts the
 * player iframe panel. Talks to the player via postMessage; the toolbar
 * action toggles the panel with the full visible page text. */

(() => {
  if (window.__ISHAARA_CONTENT__) return;
  window.__ISHAARA_CONTENT__ = true;

  const PLAYER_URL = chrome.runtime.getURL("player.html");
  let panel = null;
  let pendingText = null;
  let playerReady = false;

  function getSelectionText() {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
    const text = sel.toString().trim();
    return text ? text : null;
  }

  function cleanPageText() {
    const raw = document.body?.innerText || document.title || "";
    return raw
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 600);
  }

  function sendToPlayer(msg) {
    if (!panel || !panel.contentWindow) return;
    panel.contentWindow.postMessage(msg, "*");
  }

  function openPanel(text) {
    ensurePanel();
    if (playerReady) {
      sendToPlayer({ type: "ISHAARA_SET_TEXT", text: text || cleanPageText() });
    } else {
      pendingText = text || cleanPageText();
    }
    panel.style.transform = "translateX(0)";
    panel.setAttribute("data-open", "true");
  }

  function closePanel() {
    if (!panel) return;
    panel.style.transform = "translateX(110%)";
    panel.setAttribute("data-open", "false");
  }

  function togglePanel(text) {
    if (panel && panel.getAttribute("data-open") === "true") {
      closePanel();
    } else {
      openPanel(text);
    }
  }

  function ensurePanel() {
    if (panel) return panel;
    panel = document.createElement("iframe");
    panel.src = PLAYER_URL;
    panel.title = "ISHAARA sign player";
    panel.setAttribute("data-open", "false");
    panel.setAttribute(
      "style",
      [
        "position:fixed",
        "top:0",
        "right:0",
        "width:min(360px,100vw)",
        "height:100vh",
        "height:100dvh",
        "border:none",
        "z-index:2147483647",
        "background:#09090b",
        "box-shadow:0 0 40px rgba(0,0,0,0.5)",
        "transform:translateX(110%)",
        "transition:transform 0.28s cubic-bezier(0.4,0,0.2,1)",
        "border-radius:16px 0 0 16px",
      ].join(";")
    );
    (document.body || document.documentElement).appendChild(panel);

    window.addEventListener(
      "message",
      (e) => {
        if (e.source !== panel.contentWindow) return;
        const d = e.data || {};
        if (d.type === "ISHAARA_READY") {
          playerReady = true;
          if (pendingText) {
            sendToPlayer({ type: "ISHAARA_SET_TEXT", text: pendingText });
            pendingText = null;
          }
        } else if (d.type === "ISHAARA_CLOSE") {
          closePanel();
        }
      },
      false
    );
    return panel;
  }

  /* Floating "Sign it" bubble, shown only while a selection exists. */
  let bubble = null;
  let bubbleTimer = null;

  function hideBubble() {
    if (!bubble) return;
    bubble.remove();
    bubble = null;
    bubbleTimer = null;
  }

  function showBubble() {
    const text = getSelectionText();
    if (!text) {
      hideBubble();
      return;
    }
    if (!bubble) {
      bubble = document.createElement("button");
      bubble.textContent = "✋ Sign it";
      bubble.setAttribute(
        "style",
        [
          "position:fixed",
          "bottom:20px",
          "right:20px",
          "z-index:2147483646",
          "background:linear-gradient(135deg,#34d399,#10b981)",
          "color:#09090b",
          "font:700 13px/1.2 system-ui,-apple-system,sans-serif",
          "padding:11px 16px",
          "border:none",
          "border-radius:9999px",
          "cursor:pointer",
          "box-shadow:0 8px 24px rgba(16,185,129,0.4)",
          "opacity:0",
          "transition:opacity 0.2s ease",
        ].join(";")
      );
      bubble.addEventListener("click", () => {
        openPanel(getSelectionText());
        hideBubble();
      });
      document.body.appendChild(bubble);
      requestAnimationFrame(() => {
        if (bubble) bubble.style.opacity = "1";
      });
    }
  }

  document.addEventListener(
    "selectionchange",
    () => {
      window.clearTimeout(bubbleTimer);
      bubbleTimer = window.setTimeout(showBubble, 350);
    },
    { passive: true }
  );

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === "ISHAARA_TOGGLE") {
      togglePanel();
    }
  });
})();