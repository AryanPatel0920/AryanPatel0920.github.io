const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector("#nav-menu");
const navLinks = document.querySelectorAll(".nav-links a");
const siteHeader = document.querySelector(".site-header");
const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];

function updateHeaderState() {
  siteHeader?.classList.toggle("is-scrolled", window.scrollY > 12);
}

updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        sectionLinks.forEach((link) => {
          if (link.hash === `#${entry.target.id}`) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      });
    },
    { rootMargin: "-28% 0px -58% 0px" }
  );

  const navigableSectionIds = new Set(sectionLinks.map((link) => link.hash.slice(1)));
  document.querySelectorAll("main section[id]").forEach((section) => {
    if (navigableSectionIds.has(section.id)) {
      sectionObserver.observe(section);
    }
  });
}

function closeMenu() {
  if (!navToggle || !navMenu) {
    return;
  }

  navToggle.setAttribute("aria-expanded", "false");
  navMenu.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!isOpen));
    navMenu.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

const zoomScrollLinks = document.querySelectorAll("[data-zoom-scroll]");

zoomScrollLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.dataset.zoomScroll);

    if (!target) {
      return;
    }

    event.preventDefault();
    closeMenu();
    link.classList.add("is-zooming");

    window.setTimeout(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      link.classList.remove("is-zooming");
    }, 170);
  });
});

const projectCards = document.querySelectorAll(".project-card[href]");
const motionLinks = document.querySelectorAll(".project-card[href], .button[href]");
const parallaxTargets = document.querySelectorAll("[data-parallax]");
const parallaxSections = document.querySelectorAll("[data-parallax-section]");
const pageTransition = document.querySelector(".page-transition");

function addPointerParallax(element) {
  element.addEventListener("pointermove", (event) => {
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const strength = element.classList.contains("project-card") ? 7 : 4;

    element.style.setProperty("--tilt-x", `${(-y * strength).toFixed(2)}deg`);
    element.style.setProperty("--tilt-y", `${(x * strength).toFixed(2)}deg`);
    element.style.setProperty("--spot-x", `${(x + 0.5) * 100}%`);
    element.style.setProperty("--spot-y", `${(y + 0.5) * 100}%`);
  });

  element.addEventListener("pointerleave", () => {
    element.style.removeProperty("--tilt-x");
    element.style.removeProperty("--tilt-y");
    element.style.removeProperty("--spot-x");
    element.style.removeProperty("--spot-y");
    element.style.removeProperty("--click-scale");
  });

  element.addEventListener("pointerdown", () => {
    element.style.setProperty("--click-scale", "0.985");
  });

  element.addEventListener("pointerup", () => {
    element.style.removeProperty("--click-scale");
  });
}

const canUseParallax =
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canUseParallax) {
  motionLinks.forEach(addPointerParallax);
}

const canUseScrollMotion =
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
  parallaxTargets.length + parallaxSections.length > 0;

if (canUseScrollMotion) {
  let ticking = false;

  function updateScrollMotion() {
    const viewportHeight = window.innerHeight || 1;

    parallaxTargets.forEach((target) => {
      const rect = target.getBoundingClientRect();
      const centerOffset = (rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight;
      const strength = target.dataset.parallax === "hero" ? -34 : -22;
      target.style.setProperty("--parallax-y", `${(centerOffset * strength).toFixed(2)}px`);
    });

    parallaxSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const clamped = Math.max(0, Math.min(1, progress));
      section.style.setProperty("--section-parallax", `${(clamped * 52).toFixed(2)}px`);
    });

    ticking = false;
  }

  function requestScrollMotion() {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollMotion);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestScrollMotion, { passive: true });
  window.addEventListener("resize", requestScrollMotion);
  updateScrollMotion();
}

projectCards.forEach((card) => {
  card.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return;
    }

    event.preventDefault();
    card.classList.add("is-zooming");
    card.style.removeProperty("--click-scale");
    document.body.classList.add("is-page-leaving");

    window.setTimeout(() => {
      window.location.href = card.href;
    }, pageTransition ? 360 : 180);
  });
});

window.addEventListener("pageshow", () => {
  document.body.classList.remove("is-page-leaving");
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

const canUseTrail =
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (canUseTrail) {
  const cursorGlow = document.createElement("span");
  cursorGlow.className = "cursor-trail";
  document.body.appendChild(cursorGlow);

  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate(-50%, -50%)`;
    document.body.classList.add("trail-active");
  });

  window.addEventListener("pointerleave", () => {
    document.body.classList.remove("trail-active");
    cursorGlow.classList.remove("is-hovering");
  });

  document.addEventListener("pointerover", (event) => {
    if (event.target.closest("a, button, .zoomable-image, .project-card")) {
      cursorGlow.classList.add("is-hovering");
    }
  });

  document.addEventListener("pointerout", (event) => {
    const fromInteractive = event.target.closest("a, button, .zoomable-image, .project-card");
    const toInteractive = event.relatedTarget?.closest?.("a, button, .zoomable-image, .project-card");

    if (fromInteractive && !toInteractive) {
      cursorGlow.classList.remove("is-hovering");
    }
  });

}

const revealItems = [...document.querySelectorAll(".reveal-card, [data-reveal]")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          window.setTimeout(() => entry.target.style.removeProperty("--reveal-delay"), 800);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 }
  );

  revealItems.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${Math.min(index % 4, 3) * 55}ms`);
    revealObserver.observe(item);
  });
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const modal = document.querySelector(".image-modal");
const modalImage = document.querySelector(".modal-image");
const modalCaption = document.querySelector(".modal-caption");
const closeModalButtons = document.querySelectorAll("[data-close-modal]");
const zoomableImages = document.querySelectorAll(".zoomable-image");
let lastFocusedElement = null;

function openImageModal(image) {
  if (!modal || !modalImage || !modalCaption) {
    return;
  }

  lastFocusedElement = document.activeElement;
  modalImage.src = image.currentSrc || image.src;
  modalImage.alt = image.alt || "";
  modalCaption.textContent = image.dataset.caption || image.alt || "";
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");

  const backButton = modal.querySelector(".modal-back");
  if (backButton) {
    backButton.focus();
  }
}

function closeImageModal() {
  if (!modal || !modalImage) {
    return;
  }

  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  modalImage.src = "";

  if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
    lastFocusedElement.focus();
  }
}

zoomableImages.forEach((image) => {
  image.setAttribute("tabindex", "0");
  image.setAttribute("role", "button");
  image.setAttribute("aria-label", `Expand image: ${image.alt}`);

  image.addEventListener("click", () => openImageModal(image));
  image.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openImageModal(image);
    }
  });
});

closeModalButtons.forEach((button) => {
  button.addEventListener("click", closeImageModal);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal?.classList.contains("is-open")) {
    closeImageModal();
  }
});

const documentModal = document.querySelector(".document-modal");
const closeDocumentButtons = document.querySelectorAll("[data-close-document]");
const resumeLinks = document.querySelectorAll("[data-resume-link]");
let lastDocumentFocus = null;

function openDocumentModal(trigger) {
  if (!documentModal) {
    return;
  }

  lastDocumentFocus = document.activeElement;

  if (trigger) {
    trigger.classList.add("is-zooming");
    window.setTimeout(() => trigger.classList.remove("is-zooming"), 240);
  }

  documentModal.classList.add("is-open");
  documentModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("document-open");

  const backButton = documentModal.querySelector(".modal-back");
  if (backButton) {
    backButton.focus();
  }
}

function closeDocumentModal() {
  if (!documentModal) {
    return;
  }

  documentModal.classList.remove("is-open");
  documentModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("document-open");

  if (lastDocumentFocus && typeof lastDocumentFocus.focus === "function") {
    lastDocumentFocus.focus();
  }
}

resumeLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    closeMenu();
    openDocumentModal(link);
  });
});

closeDocumentButtons.forEach((button) => {
  button.addEventListener("click", closeDocumentModal);
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && documentModal?.classList.contains("is-open")) {
    closeDocumentModal();
  }
});
