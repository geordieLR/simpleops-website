const path = location.pathname.replace(/index\.html$/, "");
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
          <strong>Services</strong>
          <a href="/services/review.html">Simple Ops Review</a>
          <a href="/services/sprint.html">Simple Ops Sprint</a>
          <a href="/services/roadmap.html">Simple Ops Roadmap</a>
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
});

document.querySelectorAll(".faq details").forEach(detail => {
  detail.addEventListener("toggle", () => {
    if (!detail.open) return;
    document.querySelectorAll(".faq details").forEach(other => {
      if (other !== detail) other.open = false;
    });
  });
});

document.querySelectorAll("[data-service-select]").forEach(select => {
  const value = new URLSearchParams(location.search).get("service");
  if (value && [...select.options].some(option => option.value === value)) select.value = value;
});
