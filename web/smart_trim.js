(function () {
  const V = "V32-Invisible-Mask-Deep";
  console.log(
    `%c[${V}] Initializing Selection Hook...`,
    "color: #00ffff; font-weight: bold;",
  );

  const STYLE_ID = "anki-smart-trim-mask";
  let injectedRoots = new Set(); // Keep track of exactly where we injected the mask

  // Function to create an invisible mask over the selection highlighting
  const toggleSelectionVisibility = (hide, event = null) => {
    const css = `
      ::selection { background: transparent !important; color: inherit !important; }
      *::selection { background: transparent !important; color: inherit !important; }
    `;

    const applyToRoot = (root, shouldHide) => {
      let styleEl = root.querySelector(`#${STYLE_ID}`);
      if (shouldHide) {
        if (!styleEl) {
          styleEl = document.createElement("style");
          styleEl.id = STYLE_ID;
          styleEl.textContent = css;
          if (root === document) {
            document.head.appendChild(styleEl);
          } else {
            root.appendChild(styleEl);
          }
        }
        injectedRoots.add(root);
      } else {
        if (styleEl) styleEl.remove();
        injectedRoots.delete(root);
      }
    };

    if (hide) {
      // 1. Always apply to main document
      applyToRoot(document, true);

      // 2. Pierce nested Shadow DOMs! (Crucial for Anki Editor)
      if (event) {
        const path = event.composedPath();
        for (let node of path) {
          if (node instanceof ShadowRoot) {
            applyToRoot(node, true);
          }
        }
      }
    } else {
      // 3. Clean up everywhere we injected it
      const rootsToClean = Array.from(injectedRoots);
      rootsToClean.forEach((root) => applyToRoot(root, false));
    }
  };

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
    try {
      const range = sel.getRangeAt(0);
      const content = range.cloneContents();
      const text = range.toString() || content.textContent || "";

      // 1. If selection is ONLY whitespace, it's VALID. Exit here.
      if (text.length > 0 && /^[\s\u00A0]+$/.test(text)) {
        return true;
      }

      // 2. If it's a word with a trailing space, trim the space.
      if (text.length > 1 && /[\s\u00A0]$/.test(text)) {
        sel.modify("extend", "backward", "character");
        console.log(`%c[${V}] Trimmed trailing space.`, "color: #00ff00;");
        return true;
      }
    } catch (err) {
      console.error(`%c[${V}] Modify failed:`, err);
    }
    return false;
  };

  let maskTimeout;

  window.addEventListener(
    "mousedown",
    (e) => {
      if (e.detail >= 2) {
        // Pass the event (e) so it can trace the nested shadow roots
        toggleSelectionVisibility(true, e);

        const sel = getSelectionFromEvent(e);
        const tasks = [0, 10, 50, 100];
        tasks.forEach((delay) => {
          setTimeout(() => attemptTrim(sel), delay);
        });

        clearTimeout(maskTimeout);
        maskTimeout = setTimeout(() => {
          toggleSelectionVisibility(false);
        }, 150);
      }
    },
    true,
  );

  document.addEventListener(
    "selectionchange",
    (e) => {
      let active = document.activeElement;
      let sel = window.getSelection();

      // Drill down safely into Anki's nested Editor components
      while (active && active.shadowRoot) {
        if (active.shadowRoot.getSelection) {
          const shadowSel = active.shadowRoot.getSelection();
          if (shadowSel && shadowSel.type !== "None") {
            sel = shadowSel;
          }
        }
        active = active.shadowRoot.activeElement;
      }

      if (active && active.tagName.includes("ANKI-EDITABLE")) {
        if (sel && !sel.isCollapsed) {
          const text = sel.toString();
          const isPureSpace = /^[\s\u00A0]+$/.test(text);
          if (!isPureSpace && /[\s\u00A0]$/.test(text)) {
            sel.modify("extend", "backward", "character");
          }
        }
      }
    },
    true,
  );

  console.log(
    `%c[${V}] Hooked deeply into anki-editable components.`,
    "color: #00ff00;",
  );
})();
