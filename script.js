const path = location.pathname;
const root = "/";
const nav = [
  ["/how-we-help.html","How we help"],
  ["/services.html","Services & pricing"],
  ["/about.html","About"],
  ["/contact.html","Contact"]
];
const active = href => path === href ? ' aria-current="page"' : "";
document.querySelector("[data-header]").innerHTML = `
<header class="site-header"><div class="container header-inner">
  <a class="brand" href="${root}" aria-label="SimpleOps home"><span class="brand-mark">SO</span><span>SimpleOps</span></a>
  <nav class="main-nav" id="main-nav" aria-label="Main navigation">${nav.map(([h,l])=>`<a href="${h}"${active(h)}>${l}</a>`).join("")}</nav>
  <a class="button outline nav-cta" href="/services/business-tune-up.html">Book a Tune-Up</a>
  <button class="menu-button" aria-label="Open menu" aria-expanded="false" aria-controls="main-nav">☰</button>
</div></header>`;
document.querySelector("[data-footer]").innerHTML = `
<footer class="footer"><div class="container">
  <div class="footer-grid"><div><a class="brand" href="/"><span class="brand-mark">SO</span><span>SimpleOps</span></a><p>Make your business easier to run.</p><p>Simple. Streamlined. Smart. Scalable. Sensible.</p></div>
  <nav aria-label="Footer navigation"><b>Explore</b><a href="/how-we-help.html">How we help</a><a href="/services.html">Services & pricing</a><a href="/about.html">About</a><a href="/contact.html">Contact</a></nav>
  <nav><b>Start small</b><a href="/services/business-tune-up.html">Business Tune-Up</a><a href="/services/website-starter.html">Website Starter</a><a href="mailto:hello@simpleops.co.nz">hello@simpleops.co.nz</a></nav></div>
  <div class="footer-bottom"><span>© ${new Date().getFullYear()} SimpleOps. All rights reserved.</span><span><a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a></span></div>
</div></footer>`;
const btn=document.querySelector(".menu-button"), menu=document.querySelector(".main-nav");
btn.addEventListener("click",()=>{const open=menu.classList.toggle("open");btn.setAttribute("aria-expanded",open);btn.textContent=open?"×":"☰"});
document.querySelectorAll(".faq details").forEach(d=>d.addEventListener("toggle",()=>{if(d.open)document.querySelectorAll(".faq details").forEach(o=>{if(o!==d)o.open=false})}));
