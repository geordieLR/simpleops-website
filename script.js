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
const clarityEvent = (name, tags = {}) => {
  if (typeof window.clarity !== "function") return;
  Object.entries(tags).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") window.clarity("set", key, String(value));
  });
  window.clarity("event", name);
};

window.clarity?.("set", "page_type", normalizedPath === "/" ? "home" : normalizedPath.split("/").filter(Boolean).join("_"));
if (offerByPath[normalizedPath]) window.clarity?.("set", "offer", offerByPath[normalizedPath]);
const nav = [
  ["/", "Home"],
  ["/services.html", "Services"],
  ["/faq.html", "FAQ"],
  ["/about.html", "About"],
  ["/contact.html", "Contact"]
];

const isCurrent = href => {
  if (href === "/") return path === "/";
  return path === href || (href === "/services.html" && path.startsWith("/services/"));
};

document.querySelector("[data-header]")?.replaceChildren();
document.querySelector("[data-header]")?.insertAdjacentHTML("beforeend", `
  <header class="site-header">
    <div class="container header-inner">
      <a class="brand" href="/" aria-label="Simple Ops home">
        <img src="/assets/brand/simple-ops-logo.svg" alt="Simple Ops">
      </a>
      <nav class="main-nav" id="main-nav" aria-label="Main navigation">
        ${nav.map(([href, label]) => `<a href="${href}"${isCurrent(href) ? ' aria-current="page"' : ""}>${label}</a>`).join("")}
      </nav>
      <a class="button outline nav-cta" href="/services/review.html">Start a Review</a>
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
          <p>Make your business easier to run.</p>
          <a href="mailto:hello@simpleops.co.nz">hello@simpleops.co.nz</a>
        </div>
        <nav aria-label="Services">
          <strong>Simple Ops</strong>
          <a href="/services/review.html">Business Review</a>
          <a href="/services/sprint.html">Sprint</a>
          <a href="/services/roadmap.html">Roadmap</a>
          <strong class="footer-subhead">Just Happens by Simple Ops</strong>
          <a href="/services/ai-embedment.html">AI Foundations</a>
          <a href="/services/agent-workflow.html">Workflow</a>
          <a href="/services/custom-application.html">Custom Application</a>
          <strong class="footer-subhead">Supporting offer</strong>
          <a href="/services/website-starter.html">Website Starter</a>
        </nav>
        <nav aria-label="Company">
          <strong>Company</strong>
          <a href="/faq.html">FAQ</a>
          <a href="/about.html">About</a>
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
  clarityEvent("menu_toggle", { menu_state: open ? "open" : "closed" });
});

document.querySelectorAll(".faq details").forEach(detail => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    clarityEvent("faq_open", { faq_question: publicText(detail.querySelector("summary")) });
    document.querySelectorAll(".faq details").forEach(other => {
      if (other !== detail) other.open = false;
    });
  });
});

document.querySelectorAll("[data-service-select]").forEach(select => {
  const value = new URLSearchParams(location.search).get("service");
  if (value && allowedContactInterests.has(value) && [...select.options].some(option => option.value === value)) {
    select.value = value;
    window.clarity?.("set", "contact_interest", value);
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

  if (href.startsWith("mailto:")) return clarityEvent("email_select", tags);
  if (href.startsWith("#")) return clarityEvent("section_jump", tags);
  if (link.classList.contains("button")) return clarityEvent("cta_select", tags);
  if (link.closest(".site-header, .footer")) return clarityEvent("nav_select", tags);

  const targetPath = new URL(link.href, location.href).pathname.replace(/\.html$/, "");
  if (offerByPath[targetPath]) clarityEvent("service_select", { ...tags, selected_offer: offerByPath[targetPath] });
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
      clarityEvent("contact_start");
    }
    if (!engagedFields.has(field.name)) {
      engagedFields.add(field.name);
      clarityEvent("contact_field_engaged", { contact_field: field.name });
    }
  });

  contactForm.addEventListener("invalid", event => {
    const field = event.target;
    if (field?.name && field.name !== "_gotcha") clarityEvent("contact_validation_error", { contact_field: field.name });
  }, true);

  contactForm.querySelector("[name='service']")?.addEventListener("change", event => {
    const value = event.target.value;
    if (allowedContactInterests.has(value)) {
      window.clarity?.("set", "contact_interest", value);
      clarityEvent("contact_service_selected");
    }
  });

  contactForm.addEventListener("submit", () => {
    try {
      sessionStorage.setItem("simpleops_contact_submitted", String(Date.now()));
    } catch {}
    clarityEvent("contact_submit");
  });
}

if (normalizedPath === "/thanks") {
  try {
    const submittedAt = Number(sessionStorage.getItem("simpleops_contact_submitted"));
    if (submittedAt && Date.now() - submittedAt < 30 * 60 * 1000) {
      clarityEvent("enquiry_complete");
      sessionStorage.removeItem("simpleops_contact_submitted");
    }
  } catch {}
}
