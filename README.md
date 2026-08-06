# Simple Ops website

Static website for [simpleops.co.nz](https://simpleops.co.nz).

## Content sources

1. `Documents/simple-ops-website-product-brief-v1.md`
2. `brand/Simple-Ops-Living-Brand-Guide.md`
3. `brand/Simple-Ops-Visual-Identity-System.md`
4. `concepts/simple-ops-concept-b/`
5. `Documents/website-copy-v1/`

## Hosting

Designed for Cloudflare Pages. The qualified enquiry form is processed by Formspree.

## Local review

1. Run `npm test` to check every published route, internal link and required offer label.
2. Run `npm run preview` to start the local site.
3. Open `http://localhost:4173`.

The site remains deployable as static files with no build step. Existing AI Embedment and Agent Workflow file paths and form values are retained so published links and enquiry handling do not regress while the public offer names change.

## Before public launch

- Confirm the founder biography and any proof points.
- Confirm final Website Starter build price, deferral and cancellation terms.
- Complete and legally review privacy, website terms and service terms.
- Confirm `hello@simpleops.co.nz` and form notifications.
- Connect analytics only after the privacy and consent approach is agreed.

## Unlisted offer

`services/initial-review.html` is intentionally absent from navigation and the sitemap and uses `noindex, nofollow`.
