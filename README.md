# fundstash.app

The website for [Fundstash](https://fundstash.app), the private expense tracker that runs on your phone.

A static site with no build step and nothing loaded from other servers: no web fonts, analytics or third-party scripts. three.js, GSAP + ScrollTrigger, Lenis and the Inter font are vendored in `vendor/` and `fonts/`.

| Path | What |
| --- | --- |
| `/` | Landing page: 3D hero (`js/hero3d.js`), scroll story and animations (`js/motion.js`) |
| `/privacy/`, `/terms/`, `/support/` | Policies and help (linked from the app and the store listings) |
| `/split/#d=…` | Shared bill viewer; decodes the split in the browser, the data never reaches the server |
| `/shortcut` | Redirect to the iPhone "Import bank SMS" automation (`_redirects`) |
| `/.well-known/` | iOS Universal Links and Android App Links verification |
| `_headers` | Security headers and CSP for Cloudflare Pages |

## Run locally

```bash
python -m http.server 8090
```

Cloudflare's `_headers` and `_redirects` only apply once deployed.

## Deploy (Cloudflare Pages)

```bash
npx wrangler pages deploy . --project-name fundstash
```

Or connect this repository in Cloudflare Pages with no build command and `/` as the output directory.

## Licence

[PolyForm Strict 1.0.0](LICENSE). Not for copying, modification, redistribution or commercial use.
