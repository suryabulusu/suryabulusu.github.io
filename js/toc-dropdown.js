document.addEventListener("DOMContentLoaded", function () {
  // Get all the section headings from the TOC
  const tocLinks = document.querySelectorAll("d-contents nav a");
  if (tocLinks.length === 0) {
    return;
  }

  // Create the dropdown container
  const dropdownContainer = document.createElement("div");
  dropdownContainer.className = "toc-dropdown-container";
  dropdownContainer.style.cssText = `
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 1000;
    background: white;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 220px;
    transition: opacity 0.5s ease, transform 0.5s ease;
    opacity: 0;
    transform: translateY(-10px);
  `;

  // Create the dropdown button - with section name and down symbol
  const dropdownButton = document.createElement("button");
  dropdownButton.className = "toc-dropdown-button";
  dropdownButton.innerHTML =
    '<span class="section-name"></span> <span class="arrow">▼</span>';
  dropdownButton.style.cssText = `
    width: 100%;
    padding: 3px 6px;
    background: #f8f8f8;
    border: 1px solid #ddd;
    border-radius: 4px;
    text-align: left;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `;
  dropdownContainer.appendChild(dropdownButton);

  // Create the dropdown content
  const dropdownContent = document.createElement("div");
  dropdownContent.className = "toc-dropdown-content";
  dropdownContent.style.cssText = `
    display: none;
    padding: 2px 0;
    max-height: 70vh;
    overflow-y: auto;
    border: 1px solid #ddd;
    border-top: none;
    border-radius: 0 0 4px 4px;
    background: white;
    width: 100%;
  `;

  // Add links to the dropdown
  tocLinks.forEach(link => {
    const linkContainer = document.createElement("div");

    // Check if this is a sub-item (in a ul)
    const isSubItem = link.closest("ul") !== null;

    linkContainer.style.cssText = `
      padding: 1px 6px;
      ${isSubItem ? "padding-left: 12px;" : ""}
      font-size: 14px;
      transition: background-color 0.2s ease;
      line-height: 1.2;
    `;

    const newLink = document.createElement("a");
    newLink.href = link.getAttribute("href");
    newLink.textContent = link.textContent;
    newLink.style.cssText = `
      color: #333;
      text-decoration: none;
      display: block;
    `;

    linkContainer.appendChild(newLink);
    dropdownContent.appendChild(linkContainer);

    // Add hover effect
    linkContainer.addEventListener("mouseover", function () {
      this.style.backgroundColor = "#f5f5f5";
    });

    linkContainer.addEventListener("mouseout", function () {
      this.style.backgroundColor = "transparent";
    });

    // Close dropdown when link is clicked
    newLink.addEventListener("click", function () {
      dropdownContent.style.display = "none";
    });
  });

  dropdownContainer.appendChild(dropdownContent);

  // Add the dropdown to the page
  document.body.appendChild(dropdownContainer);

  // Toggle dropdown on button click
  dropdownButton.addEventListener("click", function (event) {
    event.stopPropagation();
    if (
      dropdownContent.style.display === "none" ||
      !dropdownContent.style.display
    ) {
      dropdownContent.style.display = "block";
    } else {
      dropdownContent.style.display = "none";
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (event) {
    if (!dropdownContainer.contains(event.target)) {
      dropdownContent.style.display = "none";
    }
  });

  // Track scroll direction for mobile
  let lastScrollTop = 0;
  let isMobile = window.innerWidth < 768;

  // Add active state for current section
  window.addEventListener("scroll", highlightCurrentSection);

  function highlightCurrentSection() {
    // Get h2 sections first, fall back to h3 if none exist
    const h2Sections = document.querySelectorAll("h2[id]");
    const h3Sections = document.querySelectorAll("h3[id]");

    // Determine which headings to use (h2 preferred, h3 as fallback)
    const sections = h2Sections.length > 0 ? h2Sections : h3Sections;
    const headingType = h2Sections.length > 0 ? "h2" : "h3";

    const appendix = document.querySelector("d-appendix");
    let currentSectionId = null;
    let currentSectionText = "";
    let isInAppendix = false;
    let hasReachedFirstSection = false;

    // Find the current section
    const scrollPosition = window.scrollY + 100;

    // Get the position of the first section
    const firstSection = sections.length > 0 ? sections[0] : null;
    if (firstSection && scrollPosition >= firstSection.offsetTop) {
      hasReachedFirstSection = true;
    }

    // Check if we're in the appendix section
    if (appendix && appendix.offsetTop <= scrollPosition) {
      isInAppendix = true;
      currentSectionText = "Appendix";
    } else {
      // Otherwise check regular sections
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (section.offsetTop <= scrollPosition) {
          currentSectionId = section.id;
          currentSectionText = section.textContent;
        }
      }
    }

    // Always update button text first, before any visibility changes
    // But ONLY if we've reached a section
    if (currentSectionText && hasReachedFirstSection) {
      dropdownButton.querySelector(".section-name").textContent =
        currentSectionText;
    }

    // Handle scroll direction for mobile
    if (isMobile) {
      const st = window.pageYOffset || document.documentElement.scrollTop;

      // Don't show dropdown at all if we haven't reached first section
      if (!hasReachedFirstSection) {
        dropdownContainer.style.opacity = "0";
        dropdownContainer.style.transform = "translateY(-10px)";
        lastScrollTop = st <= 0 ? 0 : st;
        return;
      }

      if (st > lastScrollTop) {
        // Scrolling down - hide on mobile
        dropdownContainer.style.opacity = "0";
        dropdownContainer.style.transform = "translateY(-10px)";
      } else {
        // Scrolling up - show on mobile
        if (currentSectionId || isInAppendix) {
          dropdownContainer.style.opacity = "1";
          dropdownContainer.style.transform = "translateY(0)";
        }
      }

      lastScrollTop = st <= 0 ? 0 : st;
      return;
    }

    // Normal behavior for desktop
    // Hide dropdown when at the top with no section and not in appendix
    if (!currentSectionId && !isInAppendix) {
      dropdownContainer.style.opacity = "0";
      dropdownContainer.style.transform = "translateY(-10px)";
      return;
    }

    // Show dropdown when in a section or appendix
    dropdownContainer.style.opacity = "1";
    dropdownContainer.style.transform = "translateY(0)";
  }

  // Add mobile-specific adjustments
  function adjustForMobile() {
    isMobile = window.innerWidth < 768;
    if (isMobile) {
      dropdownContainer.style.left = "8px";
      dropdownContainer.style.right = "10px";
      dropdownContainer.style.width = "calc(100% - 18px)";
    } else {
      dropdownContainer.style.left = "12px";
      dropdownContainer.style.right = "auto";
      dropdownContainer.style.width = "220px";
    }
  }

  // Run initial setup
  adjustForMobile();
  // Force running highlight function after a small delay to ensure sections are properly measured
  setTimeout(highlightCurrentSection, 100);
  // Also run it immediately
  highlightCurrentSection();

  // Adjust on window resize
  window.addEventListener("resize", adjustForMobile);
});
