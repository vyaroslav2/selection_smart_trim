(function () {
  const V = "V30-Deep-Diver-Keep-Space";
  console.log(
    `%c[${V}] Initializing Selection Hook...`,
    "color: #00ffff; font-weight: bold;",
  );

  const getSelectionFromEvent = (e) => {
    const path = e.composedPath();
    for (let node of path) {
      if (node instanceof ShadowRoot) {
        return node.getSelection ? node.getSelection() : null;
      }
    }
    return window.getSelection();
  };

  const attemptTrim = (sel) => {
    if (!sel || sel.rangeCount === 0) return false;

    const range = sel.getRangeAt(0);
    const content = range.cloneContents();
    const text = range.toString() || content.textContent || "";

    // 1. If selection is ONLY whitespace, it's VALID. Exit here.
    if (text.length > 0 && /^[\s\u00A0]+$/.test(text)) {
      return true;
    }

    // 2. If it's a word with a trailing space, trim the space.
    if (text.length > 1 && /[\s\u00A0]$/.test(text)) {
      try {
        sel.modify("extend", "backward", "character");
        console.log(
          `%c[${V}] Trimmed trailing space from word.`,
          "color: #00ff00;",
        );
        return true;
      } catch (err) {
        console.error(`%c[${V}] Modify failed:`, err);
      }
    }
    return false;
  };

  window.addEventListener(
    "mousedown",
    (e) => {
      if (e.detail >= 2) {
        const sel = getSelectionFromEvent(e);
        const tasks = [0, 10, 50, 100];
        tasks.forEach((delay) => {
          setTimeout(() => attemptTrim(sel), delay);
        });
      }
    },
    true,
  );

  document.addEventListener(
    "selectionchange",
    (e) => {
      const active = document.activeElement;
      if (active && active.tagName.includes("ANKI-EDITABLE")) {
        const sel = active.shadowRoot ? active.shadowRoot.getSelection() : null;
        if (sel && !sel.isCollapsed) {
          const text = sel.toString();

          // Same logic: If it's just a space, leave it alone.
          const isPureSpace = /^[\s\u00A0]+$/.test(text);
          if (!isPureSpace && text.length > 1 && /[\s\u00A0]$/.test(text)) {
            sel.modify("extend", "backward", "character");
          }
        }
      }
    },
    true,
  );

  console.log(
    `%c[${V}] Hooked into anki-editable components.`,
    "color: #00ff00;",
  );
})();
