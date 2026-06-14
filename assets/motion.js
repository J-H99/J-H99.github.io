(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    document.documentElement.classList.add("motion-off");
    return;
  }

  const revealSelector = [
    ".section-head",
    ".page-title",
    ".feature-row",
    ".panel",
    ".material-row",
    ".resource",
    ".document-kicker",
    ".document"
  ].join(",");

  const items = Array.from(document.querySelectorAll(revealSelector));
  document.documentElement.classList.add("motion-ready");

  items.forEach((item, index) => {
    item.classList.add("motion-item");
    item.style.setProperty("--motion-delay", `${Math.min(index * 45, 220)}ms`);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.16,
    rootMargin: "0px 0px -8% 0px"
  });

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
