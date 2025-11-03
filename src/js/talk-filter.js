(function () {
  "use strict";

  function initTalkFilters() {
    const controls = Array.from(
      document.querySelectorAll("[data-talk-control]")
    );
    if (!controls.length) {
      return;
    }

    const items = Array.from(document.querySelectorAll("[data-talk-item]"));
    if (!items.length) {
      return;
    }

    let activeTag = null;

    function applyFilter(tag) {
      activeTag = tag;
      items.forEach(item => {
        const tags = (item.dataset.tags || "").split(/\s+/).filter(Boolean);
        const matches = !tag || tags.includes(tag);
        item.style.display = matches ? "" : "none";
      });

      controls.forEach(control => {
        const controlTag = control.dataset.tag;
        control.classList.toggle(
          "is-active",
          Boolean(tag) && controlTag === tag
        );
      });
    }

    controls.forEach(control => {
      control.addEventListener("click", event => {
        event.preventDefault();
        const tag = control.dataset.tag;
        applyFilter(activeTag === tag ? null : tag);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTalkFilters);
  } else {
    initTalkFilters();
  }
})();
