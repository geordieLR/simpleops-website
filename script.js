const path = location.pathname.replace(/index\.html$/, "");
const normalizedPath = path.replace(/\.html$/, "") || "/";
const offerByPath = {
  "/services/review": "business_review",
  "/services/sprint": "sprint",
  "/services/roadmap": "roadmap",
  "/services/ai-embedment": "ai_foundations",
  "/services/agent-workflow": "workflow",
  "/services/custom-application": "custom_application",
  "/services/website-starter": "website_starter",
  "/services/initial-review": "initial_review"
};
const allowedContactInterests = new Set([
  "not-sure",
  "review",
  "sprint",
  "roadmap",
  "ai-embedment",
  "agent-workflow",
  "custom-application",
  "website",
  "other"
]);

const publicText = element => element?.textContent?.replace(/\s+/g, " ").trim().slice(0, 120) || "unknown";
const interactionLocation = element => {
  if (element.closest(".site-header")) return "header";
  if (element.closest(".footer")) return "footer";
  if (element.closest(".page-hero")) return "hero";
  if (element.closest(".cta-band")) return "closing_cta";
  if (element.closest("form")) return "form";
  return "page";
};
const analyticsSet = (key, value) => {
  if (value === undefined || value === null || value === "") return;
  const safeValue = String(value);
  window.clarity?.("set", key, safeValue);
  window.gtag?.("set", { [key]: safeValue });
};
const analyticsEvent = (name, tags = {}) => {
  Object.entries(tags).forEach(([key, value]) => analyticsSet(key, value));
  window.clarity?.("event", name);
  window.gtag?.("event", name === "enquiry_complete" ? "generate_lead" : name, tags);
};

analyticsSet("page_type", normalizedPath === "/" ? "home" : normalizedPath.split("/").filter(Boolean).join("_"));
if (offerByPath[normalizedPath]) analyticsSet("offer", offerByPath[normalizedPath]);
const nav = [
  ["/", "Home"],
  ["/services.html", "Services"],
  ["/faq.html", "FAQ"],
  ["/about.html", "About"],
  ["/contact.html", "Contact"]
];

const isCurrent = href => {
  if (href === "/") return path === "/";
  if (href === "/about.html") return path === href || path === "/work-and-experience.html" || path === "/who-we-work-with.html";
  return path === href || (href === "/services.html" && path.startsWith("/services/"));
};

document.querySelector("[data-header]")?.replaceChildren();
document.querySelector("[data-header]")?.insertAdjacentHTML("beforeend", `
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/" aria-label="Simple Ops home">
        <img src="/assets/brand/simple-ops-logo.svg" alt="Simple Ops">
        <span class="brand-tagline">Make work simple</span>
      </a>
      <nav class="main-nav" id="main-nav" aria-label="Main navigation">
        ${nav.map(([href, label]) => `<a href="${href}"${isCurrent(href) ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
      </nav>
      <a class="shop-link" href="/shop.html" aria-label="View the product shop"${path === "/shop.html" ? ' aria-current="page"' : ""}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.6L20.3 8H6.1M9.5 20a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0Zm8 0a.8.8 0 1 1-1.6 0 .8.8 0 0 1 1.6 0Z"/></svg>
        <span class="sr-only">Shop</span>
      </a>
      <a class="button outline nav-cta" href="/services.html">See how we can help</a>
      <button class="menu-button" aria-label="Open menu" aria-expanded="false" aria-controls="main-nav">☰</button>
    </div>
  </header>
`);

document.querySelector("[data-footer]")?.insertAdjacentHTML("beforeend", `
  <footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <a class="brand" href="/"><img src="/assets/brand/simple-ops-logo-reverse.svg" alt="Simple Ops"></a>
          <p>Make work simple</p>
          <a href="mailto:hello@simpleops.co.nz">hello@simpleops.co.nz</a>
        </div>
        <nav aria-label="Services">
          <strong>Simple Ops</strong>
          <a href="/services/review.html">Business Review</a>
          <a href="/services/sprint.html">Sprint</a>
          <a href="/services/roadmap.html">Roadmap</a>
          <strong class="footer-subhead">Just Happens by Simple Ops</strong>
          <a href="/services/ai-embedment.html">AI Foundations</a>
          <a href="/services/agent-workflow.html">AI Workflow</a>
          <a href="/services/custom-application.html">Custom Application</a>
        </nav>
        <nav aria-label="Company">
          <strong>Company</strong>
          <a href="/faq.html">FAQ</a>
          <a href="/about.html">About</a>
          <a href="/insights.html">Insights</a>
          <a href="/work-and-experience.html">Work and experience</a>
          <a href="/who-we-work-with.html">Who we work with</a>
          <a href="/shop.html">Product shop</a>
          <a href="/insights/responsible-ai-assurance.html">Responsible AI insight</a>
          <a href="/book.html">Book a conversation</a>
          <a href="/contact.html">Contact</a>
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
        </nav>
      </div>
      <div class="footer-bottom">
        <span>© ${new Date().getFullYear()} Simple Ops. All rights reserved.</span>
        <span>Auckland, New Zealand</span>
      </div>
    </div>
  </footer>
`);

const menuButton = document.querySelector(".menu-button");
const menu = document.querySelector(".main-nav");
menuButton?.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.textContent = open ? "×" : "☰";
  analyticsEvent("menu_toggle", { menu_state: open ? "open" : "closed" });
});

document.querySelectorAll(".faq details").forEach(detail => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    analyticsEvent("faq_open", { faq_question: publicText(detail.querySelector("summary")) });
    document.querySelectorAll(".faq details").forEach(other => {
      if (other !== detail) other.open = false;
    });
  });
});

const testimonialSlider = document.querySelector("[data-testimonial-slider]");
if (testimonialSlider) {
  const shell = testimonialSlider.closest(".testimonial-shell");
  const cards = [...testimonialSlider.querySelectorAll(".testimonial-card")];
  const status = shell.querySelector("[data-slider-status]");
  const previous = shell.querySelector("[data-slider-previous]");
  const next = shell.querySelector("[data-slider-next]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeIndex = 0;
  let timer;

  const showCard = index => {
    activeIndex = (index + cards.length) % cards.length;
    cards.forEach((card, cardIndex) => {
      const active = cardIndex === activeIndex;
      card.classList.toggle("is-active", active);
      card.setAttribute("aria-hidden", String(!active));
    });
    status.textContent = `${activeIndex + 1} of ${cards.length}`;
  };

  const stopRotation = () => clearInterval(timer);
  const startRotation = () => {
    stopRotation();
    if (!reducedMotion) timer = setInterval(() => showCard(activeIndex + 1), 7000);
  };

  previous.addEventListener("click", () => {
    showCard(activeIndex - 1);
    startRotation();
  });
  next.addEventListener("click", () => {
    showCard(activeIndex + 1);
    startRotation();
  });
  shell.addEventListener("mouseenter", stopRotation);
  shell.addEventListener("mouseleave", startRotation);
  shell.addEventListener("focusin", stopRotation);
  shell.addEventListener("focusout", startRotation);
  showCard(0);
  startRotation();
}

const productFilterButtons = [...document.querySelectorAll("[data-product-filter]")];
const productCards = [...document.querySelectorAll("[data-product-categories]")];
if (productFilterButtons.length && productCards.length) {
  productFilterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const category = button.dataset.productFilter;
      productFilterButtons.forEach(item => item.setAttribute("aria-pressed", String(item === button)));
      productCards.forEach(card => {
        const categories = card.dataset.productCategories.split(" ");
        card.hidden = category !== "all" && !categories.includes(category);
      });
      analyticsEvent("catalogue_filter", { catalogue_category: category });
    });
  });
}

document.querySelectorAll("[data-service-select]").forEach(select => {
  const value = new URLSearchParams(location.search).get("service");
  if (value && allowedContactInterests.has(value) && [...select.options].some(option => option.value === value)) {
    select.value = value;
    analyticsSet("contact_interest", value);
  }
});

document.addEventListener("click", event => {
  const link = event.target.closest("a");
  if (!link) return;
  const href = link.getAttribute("href") || "";
  const tags = {
    interaction_label: publicText(link),
    interaction_location: interactionLocation(link)
  };

  if (href.startsWith("mailto:")) return analyticsEvent("email_select", tags);
  if (href.startsWith("#")) return analyticsEvent("section_jump", tags);
  if (link.classList.contains("button")) return analyticsEvent("cta_select", tags);
  if (link.closest(".site-header, .footer")) return analyticsEvent("nav_select", tags);

  const targetPath = new URL(link.href, location.href).pathname.replace(/\.html$/, "");
  if (offerByPath[targetPath]) analyticsEvent("service_select", { ...tags, selected_offer: offerByPath[targetPath] });
});

const contactForm = document.querySelector(".contact-form");
if (contactForm) {
  let contactStarted = false;
  const engagedFields = new Set();

  contactForm.addEventListener("focusin", event => {
    const field = event.target.closest("input, select, textarea");
    if (!field || field.type === "hidden" || field.name === "_gotcha") return;
    if (!contactStarted) {
      contactStarted = true;
      analyticsEvent("contact_start");
    }
    if (!engagedFields.has(field.name)) {
      engagedFields.add(field.name);
      analyticsEvent("contact_field_engaged", { contact_field: field.name });
    }
  });

  contactForm.addEventListener("invalid", event => {
    const field = event.target;
    if (field?.name && field.name !== "_gotcha") analyticsEvent("contact_validation_error", { contact_field: field.name });
  }, true);

  contactForm.querySelector("[name='service']")?.addEventListener("change", event => {
    const value = event.target.value;
    if (allowedContactInterests.has(value)) {
      analyticsSet("contact_interest", value);
      analyticsEvent("contact_service_selected");
    }
  });

  contactForm.addEventListener("submit", () => {
    try {
      sessionStorage.setItem("simpleops_contact_submitted", String(Date.now()));
    } catch {}
    analyticsEvent("contact_submit");
  });
}

if (normalizedPath === "/thanks") {
  try {
    const submittedAt = Number(sessionStorage.getItem("simpleops_contact_submitted"));
    if (submittedAt && Date.now() - submittedAt < 30 * 60 * 1000) {
      analyticsEvent("enquiry_complete");
      sessionStorage.removeItem("simpleops_contact_submitted");
    }
  } catch {}
}
