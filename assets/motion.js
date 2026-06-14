(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const filterButtons = Array.from(document.querySelectorAll("[data-archive-filter]"));
  const filterItems = Array.from(document.querySelectorAll("[data-archive-category]"));
  const filterMonths = Array.from(document.querySelectorAll("[data-archive-month-categories]"));
  const categoryRoutes = {
    "archive-notes": "notes",
    "archive-deep-dives": "deep-dives",
    "archive-build-logs": "build-logs"
  };
  const routeByCategory = {
    notes: "archive-notes",
    "deep-dives": "archive-deep-dives",
    "build-logs": "archive-build-logs"
  };

  function showArchiveCategory(category, updateHash = false) {
    if (!filterButtons.length) return;

    filterButtons.forEach((button) => {
      const isSelected = button.dataset.archiveFilter === category;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", String(isSelected));
    });

    filterItems.forEach((item) => {
      const shouldShow = category === "all" || item.dataset.archiveCategory === category;
      item.classList.toggle("is-hidden", !shouldShow);
    });

    filterMonths.forEach((month) => {
      const categories = (month.dataset.archiveMonthCategories || "").split(/\s+/);
      const shouldShow = category === "all" || categories.includes(category);
      month.classList.toggle("is-hidden", !shouldShow);
    });

    if (updateHash) {
      const route = category === "all" ? "archive" : routeByCategory[category];
      history.replaceState(null, "", `#${route || "archive"}`);
    }
  }

  function applyArchiveHashRoute() {
    if (!filterButtons.length) return;

    const hash = window.location.hash.slice(1);
    const routedCategory = categoryRoutes[hash];

    showArchiveCategory(routedCategory || "all", false);

    if (routedCategory) {
      window.requestAnimationFrame(() => {
        const feed = document.querySelector("#archive-feed");
        if (!feed) return;

        const stickyOffset = 92;
        const top = feed.getBoundingClientRect().top + window.scrollY - stickyOffset;
        window.scrollTo({ top });
      });
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      showArchiveCategory(button.dataset.archiveFilter, true);
    });
  });

  window.addEventListener("hashchange", applyArchiveHashRoute);
  applyArchiveHashRoute();

  if (prefersReduced) {
    document.documentElement.classList.add("motion-off");
    return;
  }

  const revealSelector = [
    ".section-head",
    ".page-title",
    ".feature-row",
    ".panel",
    ".archive-feed-head",
    ".archive-month",
    ".archive-item",
    ".material-row",
    ".resource",
    ".document-kicker"
  ].join(",");

  const items = Array.from(document.querySelectorAll(revealSelector));
  document.documentElement.classList.add("motion-ready");

  items.forEach((item, index) => {
    item.classList.add("motion-item");
    item.style.setProperty("--motion-delay", `${Math.min(index * 45, 220)}ms`);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  items.forEach((item) => observer.observe(item));

  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const isDownload = /\.(pptx|pdf|zip|md)$/i.test(href) || link.hasAttribute("download");
    const isAnchor = href.startsWith("#");
    const isExternal = link.origin && link.origin !== window.location.origin;

    if (isDownload || isAnchor || isExternal) return;

    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target) return;
      event.preventDefault();
      document.documentElement.classList.add("is-leaving");
      window.setTimeout(() => {
        window.location.href = link.href;
      }, 150);
    });
  });
})();
