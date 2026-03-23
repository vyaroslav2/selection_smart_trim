// web/smart_trim.js
(function () {
  const V = "V23-Pro";
  console.log(
    `%c[${V}] Obsidian-Style Logic Loaded.`,
    "color: #00ffff; font-weight: bold;",
  );

  window.trimSelection = function () {};

  const getDeepSelection = (target) => {
    const root = target ? target.getRootNode() : document;
    return root && root.getSelection
      ? root.getSelection()
      : window.getSelection();
  };

  const handleSelection = (e) => {
    if (e.detail !== 2) return;

    const leafTarget = e.composedPath()[0];
    const sel = getDeepSelection(leafTarget);

    setTimeout(() => {
      const text = sel.toString();
      if (text.length > 1 && /\S\s$/.test(text)) {
        try {
          sel.modify("extend", "backward", "character");
        } catch (err) {
          const range = sel.getRangeAt(0);
          range.setEnd(range.endContainer, range.endOffset - 1);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    }, 0);
  };

  window.addEventListener("mouseup", handleSelection, true);
})();
