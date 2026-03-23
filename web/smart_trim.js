(function () {
  const V = "V23-Pro-Native";
  console.log(
    `%c[${V}] Logic Loaded (No-Flicker Mode)`,
    "color: #00ffff; font-weight: bold;",
  );

  const getDeepSelection = (target) => {
    const root = target ? target.getRootNode() : document;
    return (root instanceof ShadowRoot || root === document) &&
      root.getSelection
      ? root.getSelection()
      : window.getSelection();
  };

  const handleSelection = (e) => {
    // detail === 2 indicates a double-click
    if (e.detail !== 2) return;

    const leafTarget = e.composedPath()[0];
    const sel = getDeepSelection(leafTarget);

    // We run this synchronously.
    // By mouseup of the second click, Chromium has already calculated the range.
    const text = sel.toString();

    // Check for trailing whitespace (standard space, non-breaking space, or newline)
    if (text.length > 1 && /\s$/.test(text)) {
      try {
        // 'extend' moves the focus (the moving end)
        // 'backward' by one 'character'
        sel.modify("extend", "backward", "character");
      } catch (err) {
        // Fallback for environments where modify() might fail
        const range = sel.getRangeAt(0);
        range.setEnd(range.endContainer, range.endOffset - 1);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  };

  // Use capture: true to ensure we catch it before other listeners
  window.addEventListener("mouseup", handleSelection, true);
})();
(function () {
  const V = "V23-Pro-Native";
  let isDoubleSelection = false;

  const getDeepSelection = (target) => {
    const root = target ? target.getRootNode() : document;
    return (root instanceof ShadowRoot || root === document) &&
      root.getSelection
      ? root.getSelection()
      : window.getSelection();
  };

  const trimTrailingSpace = () => {
    // Find the active element to handle Anki's Shadow DOM (Editor)
    const sel = getDeepSelection(document.activeElement);
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const text = sel.toString();
    // Check for any trailing whitespace (space, nbsp, etc.)
    if (text.length > 1 && /\s$/.test(text)) {
      // sel.modify is usually flicker-free if called inside selectionchange
      sel.modify("extend", "backward", "character");
    }
  };

  // 1. Detect when a double-click starts
  document.addEventListener(
    "mousedown",
    (e) => {
      if (e.detail === 2) {
        isDoubleSelection = true;
      } else {
        isDoubleSelection = false;
      }
    },
    true,
  );

  // 2. Intercept the selection calculation BEFORE paint
  document.addEventListener("selectionchange", () => {
    if (isDoubleSelection) {
      // We use a Promise microtask to run immediately after the browser
      // updates the selection but before the next animation frame (paint).
      Promise.resolve().then(trimTrailingSpace);
      isDoubleSelection = false; // Only run once per double-click
    }
  });

  // 3. Cleanup logic
  document.addEventListener("mouseup", () => {
    isDoubleSelection = false;
  });

  console.log(
    `%c[${V}] Native Selection Logic Loaded.`,
    "color: #00ffff; font-weight: bold;",
  );
})();
