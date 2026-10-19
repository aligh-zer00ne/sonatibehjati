# Retained conversation context

Recovered on 2026-10-12 from local Codex history for “اجرای فازهای ۱ و ۲ و Homepage”, original thread `01a0f872-e297-7580-ac53-20a2aeb43770` and its continuation records. This is a durable project note, not a claim of account-wide ChatGPT memory.

## Explicit ongoing instructions

- The user said: “میخوام هر تغییر که به عنوان یک فچیر محسوب میشه و لایق پوش شدن روی گیت رو داره خودت با کامیت مسیج مناسب روی برنچ dev پوش کنی”. Commit independent changes on `dev` and attempt the push without asking again.
- Use npm and Bun instead of pnpm.
- Keep styling in component `className` using the existing Tailwind/shadcn system.
- Use “سنتی بهجتی” as the brand name. The correct product name is “حلواارده شکری”, not “شیرینی ارده‌ای”.
- Complete implementation and required checks before reporting success. The prior workflow reported lint, typecheck, build and relevant browser/API tests, plus commit/push status and a preview where applicable.
- The user has requested local runs to inspect changes and instructions for updating production. A local preview, Git push and production deployment are separate actions; report their actual status.

## Established deployment

- Repository: `https://github.com/aligh-zer00ne/sonatibehjati`, branch `dev`.
- Production uses Ubuntu, Nginx and PM2. Storefront: `sonatibehjati.ir`; admin: `admin.sonatibehjati.ir`.
- Established root: `/var/www/sonatibehjati`, project user `sonatibehjati`; verify actual paths if server evidence changes.
- Storefront internal port `3100`, API internal port `4100`. Other sites exist on the server; port `4000` belongs to another project.
- Established server update commands, run by the user on the server:

```bash
sudo -iu sonatibehjati
cd /var/www/sonatibehjati
git switch dev
git pull --ff-only origin dev && bash deploy/update-production.sh
```

- The deployment script handles dependencies when needed, generated clients, lint/typecheck/build, migrations and restarting only this project's services. Admin is served as static files.
- Preserve server `.env`, existing database and uploads. Do not run seed/photo imports or reset administrator passwords as part of routine deployment.
- The original chat repeatedly encountered missing GitHub authentication. Retry rather than assume that historical failure still applies, and report the actual result.
- Latest accepted public preview configuration allowed storefront browsing and admin login without Basic Auth while customer login/ordering remained disabled pending real SMS configuration. Do not silently change that deployment mode.

## Latest accepted UI direction

- Mobile-first, Persian RTL, warm traditional palette; five category strips.
- Footer only on homepage; footer spans page width. Information on the right, child mascot on the left, centered brand logo above. Menu label: “درباره ما”.
- Hero and about section in mobile match the search bar width; previous instructions about half width were superseded by corrections about height.
- Categories: ارده، حلواارده، روغن‌های خوراکی، سایر محصولات، شیرینی و محصولات سنتی. Use the user's latest supplied category icons.
- Use actual product images; each product has four gallery photos. Preserve established admin features and permissions.
- Latest request: compact the homepage discount strip, remove campaign title and discount amount below the product price, place a timer with icon on the upper edge of a product frame, and enlarge trust/payment icons while reducing corner radius.

## Work completed in this continuation

- Latest discount/footer corrections implemented; storefront typecheck, focused lint, production build and `verify:promotions` passed.
- Local development startup was repaired: `npm run dev` starts the dedicated MySQL on 3307, applies local migrations, then starts storefront on 3000, admin on 3001 and API on 4000. Check live state before reusing these addresses.
- The old MySQL data directory was under `/tmp` and was missing on 2026-10-12. Data was recovered from the available local 2026-10-05 backup, with migrations applied and the previously requested development admin credentials restored. The new data directory is `~/tmp/sonatibehjati-dev-mysql/data`, which persists across reboots. Existing databases are not reseeded by the development runner.
- Commit/push had been omitted before recovering this workflow; remedy that and report the result.

## Latest correction: main-storefront checkout test (2026-10-15)

- The user explicitly rejected a separate release / owner-only test route as their requested workflow. They want the same storefront customer login and normal checkout with fixed OTP **123456 (six digits)**, no SMS, and real SEP payments until MeliPayamak is ready.
- Use `payments:checkout-test` on the production server and the existing `payment-live.conf` Nginx configuration to open `/api/auth`. `CHECKOUT_PAYMENT_TEST_ENABLED=true` is an explicit temporary setting, default false; production security/cookies remain enabled. Normal real SMS retains five digits. `--activate` clears the test flag and requires real SMS settings.
- Payment testing through the normal storefront creates normal orders and successful real payments are retained (unlike owner-only auto-reversal). No actual charge was made during local verification.
- The user subsequently explicitly approved pushing changes and `docs/conversation-context.md` to `origin/dev` (“بله، تغییرات و یادداشت‌های پروژه را پوش کن”). That supersedes the earlier local-only restriction; continue the established commit/push workflow without reasking. Commit `40f4939` was verified on GitHub.
- Verification: lint, all-workspace typecheck/build, 133 unit tests, auth API/UI, fixed-code storefront checkout/payment browser tests and production profile/fresh local migration checks passed. Browser bank requests were simulated. Private development env remains unchanged; server activation commands are in `docs/payments.md`.

## Production login origin correction (2026-10-16)

- The user reported “درخواست مجاز نیست” immediately after submitting the phone on the deployed storefront. The `/api/auth` guard compared browser Origin to `request.url`; Next.js constructs that URL from its internal listening host (`127.0.0.1:3100` in PM2), including the forwarded protocol, so a valid public-domain request was rejected. Reproduced locally with Nginx-style headers.
- Validate Origin against the private configured `STOREFRONT_ORIGIN` (fallback `NEXT_PUBLIC_SITE_URL`, then the request URL for existing local setups). Keep cross-site rejection and ignore client-supplied host / forwarded headers as authorization sources. Normal Git deployment applies the fix; no additional Nginx or SMS/payment setting change is required.
- Verification: lint, all-workspace typecheck, 146 unit tests, storefront production build, auth browser tests with a loopback listener / HTTPS forwarding / forged origins, and the full fixed-code checkout/payment browser tests passed. Bank traffic was simulated; no real SMS or payment was sent.

## Mobile account redesign (2026-10-16)

- The user confirmed the real SEP gateway works on the deployed site. Keep the existing fixed-code 123456 payment-test profile until they request real SMS activation.
- The user disliked the mobile account design and requested a redesign with a hamburger menu. Use the existing cream/burgundy storefront identity: a compact account toolbar; right-side drawer with active navigation, profile, orders, addresses, tickets, shop return and logout; a refreshed customer card, real counts, support shortcut and recent orders. Keep desktop sidebar navigation and the existing mobile bottom nav.
- The drawer extends the existing shadcn/Radix Dialog with an optional right placement. Centered dialogs retain their current default. Support Escape/outside-click/link close, focus trapping/return, scroll locking, reduced motion and closing at the desktop breakpoint. Private pages, login, real payment and stored customer data retain their behavior.
- Verification: lint, all-workspace typecheck, storefront production build and 146 unit tests passed, along with full account, auth and support browser checks (320/390/768/1440 widths, 320x480 drawer, keyboard/focus/resize/reduced-motion behavior, profile/address/order workflows and ticket create/reply). Account and drawer screenshots were visually reviewed. Services on localhost 3000/3001/4000 were checked; no new migration or production config is needed.

## Latest correction: remove account drawer identity (2026-10-16)

- The user requested removing the entire “همراه سنتی بهجتی” identity section from the account hamburger menu. Remove its avatar, customer name/fallback and subtitle together, including for customers with saved profile names. Keep the desktop sidebar identity and dashboard profile card.
- Lint, all-workspace typecheck, storefront build and full account browser checks passed, including absence of this section in the drawer and existing navigation/focus/profile/address/order behavior.

## Latest correction: supplied navy QR landing page (2026-10-16)

- Replace the independent `/QR` landing page with the user's `sonati-behjati-navy (1).html`: embedded brand logo, navy sky/day-night themes, online shop, Instagram, Neshan navigation, phone and creator credit links. Keep the supplied content, styling and scripts rather than reinterpreting the design as the commerce shell.
- `public/qr.html` is served by the existing `/QR` route. Optional local-only font faces keep the file's declared fallbacks; omit requests for the unprovided IranNastaliq / BTitr font files to avoid broken asset URLs. Revalidate the page on subsequent requests instead of caching it for an hour.
- Lint/typecheck/build passed; live browser verification compared the served HTML to the supplied file (only the optional missing font references/comment adapted), checked links/logo, 320–1440px layouts, all four sky themes and absence of missing local assets/runtime errors. The printed branded QR still decodes to `https://sonatibehjati.ir/QR` at 128–720px in color and grayscale; existing labels/invoices need no QR regeneration. Screenshots were visually inspected. No production config or migration is required.

## QR refinements: stable left arrow (2026-10-16)

- The user requested the online-order arrow point left. Replace the bidi-mirrored text glyph with a decorative SVG arrow, with explicit stroke and centering. The rendered arrow must remain left-facing in RTL layouts.
- Lint, all-workspace typecheck, storefront production build and browser checks at 320–1440px passed; SVG screen coordinates confirm the arrow points left.

## QR refinements: Instagram handle typography (2026-10-16)

- Match the Instagram handle to the existing Vazirmatn font family with weight 600, preserving its LTR isolation and an adaptive font size that fits mobile cards. Keep the actual Instagram URL and handle unchanged.
- Browser checks confirmed the handle inherits the page font, remains LTR and fits one line at 320/390/768/1440px; lint, typecheck and storefront build passed with the full QR refinements.

## QR refinements: Ardakan skyline (2026-10-16)

- Redesign the lower skyline as layered navy architecture with stepped four-sided windcatchers, recessed ventilation slats, side faces, arched roofs and entrances, soft blue depth and subtle champagne trim/window lights. Keep it decorative and non-interactive; retain the supplied page's sky themes, branding and links.
- Add a Next.js rewrite so lowercase `/qr` serves the same landing page as the existing printed `/QR` URL. Both paths were verified with HTTP 200 on a temporary production Next server, without redirects or API/database dependencies.
- Lint/typecheck/build and browser checks passed: responsive 320–1440px including a short 320x480 viewport, four sky themes, working logo/links, unchanged CTA touch areas, and no runtime errors or missing local assets. Mobile and desktop screenshots were visually reviewed. No server config or migration change is required.

## Latest correction: restore the accepted QR design (2026-10-17)

- The user rejected the latest QR redesign and requested restoring the QR page to the third-most-recent commit, which was `38c49fb` (`fix(qr): keep the order arrow pointing left in RTL`) when the request arrived. Restore `public/qr.html` byte-for-byte from that commit in a new commit; preserve subsequent unrelated project changes and Git history.
- This supersedes the Instagram typography and Ardakan skyline refinements above. Preserve the original supplied page typography and overall design. Future requested changes to windcatchers and traditional decoration must stay confined to those lower decorative elements; do not change page fonts or reinterpret the whole design. No new decorative redesign is part of this restoration.
- Keep the working lowercase `/qr` alias alongside the printed `/QR` URL.
- Verification: exact source/served-HTML comparison against `38c49fb`, lint, all-workspace typecheck, storefront production build and browser checks at 320–1440px passed. Original fonts and skyline, left arrow, action links/logo and all sky themes were retained; mobile/desktop screenshots were reviewed. No production configuration or migration change is required.

## SEO and GEO phase (2026-10-17)

- The user requested implementing SEO and GEO before real SMS approval. GEO here means public content discoverability/understanding by generative search, alongside the existing Ardakan business identity. Preserve current design and the accepted QR file; do not reactivate SMS or alter payment-test login.
- Replace the blanket robots block in real production/API mode with public crawl access and a dynamic full-catalog sitemap. Development, mock catalog and production staging with `SEO_INDEXING_ENABLED=false` stay excluded. Public URLs use the stable `https://sonatibehjati.ir` canonical identity. Filters/search are noindex, real pagination has its own canonical and missing pages return not found.
- Add server-rendered metadata/social previews and safe JSON-LD for the actual brand, products, offers, breadcrumbs, collections and public informational pages. Convert catalog toman prices to ISO IRR ×10 and include only currently valid promotions. Do not invent ratings, stock counts/availability, full street address, coordinates, hours, shipping/return promises or medical benefits.
- Add `/about` using the existing editable brand story and known contact details, `/faq` with matching visible answers/schema, links from the homepage and an optional `/llms.txt` discovery index. Private account/support/checkout/payment routes and the unchanged QR landing are excluded by meta/HTTP headers. Opening robots is not an access-control change.
- Ownership verification tokens for Search Console/Bing are optional environment inputs; no external account verification/submission has been performed without owner access. Deployment uses the existing Git update script without migration/Nginx changes. Details and post-deployment ownership/sitemap steps are in `docs/seo.md`; ranking and AI citations are not guaranteed.
- Verification: 151 unit tests, lint, all-workspace typecheck and storefront production build passed. `verify:seo` checks real API catalog output on temporary production servers: initial HTML without JavaScript, unique titles/canonicals/social metadata, real prices/IRR schema, visible FAQ/schema parity, sitemap, missing-product/pagination HTTP 404, private/QR HTTP noindex, byte-identical QR HTML, 320/390/1440px layouts and production staging opt-out. About/FAQ mobile screenshots were visually reviewed. No SMS, payment or data mutations were performed.

## Real SMS and production release (2026-10-17)

- The user now explicitly requests real SMS and ending all public testing. This supersedes the earlier instruction to retain fixed OTP `123456` while waiting for SMS approval. They provided the approved template text and, after clarification, numeric console bodyId **559650**. The template has exactly one `{0}` argument: website name, login code, `sonatibehjati.ir`, and unsubscribe line `لغو۱۱`. The API key was already supplied and remains private; do not expose it in output or Git.
- Store bodyId in the ignored local API env while preserving development mode. Configure the server with `npm run production:configure -- --body-id=559650 --terminal-id=15855486`, then the existing deployment script. This enables production/MeliPayamak, five-digit random SMS OTP, normal SEP checkout and SEO; clears fixed-code/admin payment testing and simulator settings. Preserve all existing authentication secrets, DB, uploads, customers, orders and prices. Synchronize only stale test/SEO flags in higher-priority storefront env files; refuse conflicting endpoint/security settings before writing.
- SMS production tokens carry signed `amr: ['sms']` and require that proof on access and refresh. Old test/development tokens are rejected once the real production profile is active, without deleting data or rotating admin secrets. Customers log in once using real SMS. Discard stale six-digit trial challenges in the browser after the switch.
- Hide the disabled admin gateway-test menu and redirect its page to the dashboard. Keep historical payment records and reconciliation. Remove unconfigured social links/coming-soon messaging; keep the confirmed official Instagram. Present the exact legacy import placeholder description as recorded product name/weight, preserving custom descriptions and stored values.
- `docs/production.md` contains the complete release procedure. Legacy testing documents are labeled historical. No SSH/server deployment or real SMS delivery is implied by local/mock verification; actual receipt must be checked with the owner's number after server activation.
- Verification: 157 unit tests, lint, all-workspace typecheck/build and the isolated production-profile check passed. Auth browser checks cover five-digit login, stale six-digit challenge removal, cookies, resend/failure, reload and multi-tab logout; full admin checks cover hidden disabled gateway tools, permissions, product/order workflows, responsive layouts and Persian PDFs; normal checkout/payment browser checks passed with an intercepted bank. The responsive admin sweep uses client navigation while separate reload checks remain. No real SMS or bank charge was generated. Local services are available on 3000/3001/4000 using the existing database and development SMS.

## Production SMS failure diagnosis (2026-10-18)

- After deploying, the user reported the generic SMS failure message. This alone does not identify the root cause; the prior adapter discarded every provider/transport detail. Do not assert a key, credit, template or network problem without server evidence.
- Add a server-only `[SMS delivery failed]` warning with reason, HTTP status, negative provider code, redacted provider status and known transport code. Keep the public error generic; never log API keys/URLs, phone numbers, OTPs or raw provider responses/errors. Preserve five-digit OTP and positive-recId acceptance without retries/fallback sends.
- After ordinary Git deployment, ask for the new warning from `pm2 logs sonatibehjati-api --err --lines 80 --nostream` following one owner login attempt. No server access or real SMS receipt is implied by local checks.
- Verification: 160 unit tests, repository lint, API typecheck/build and diff checks passed. Added cases distinguish provider rejection, non-JSON/HTTP failures, DNS and timeouts, and assert no key, phone, OTP, URL, raw body or raw transport error in logs. No real SMS request was sent.

## QR English typography only (2026-10-18)

- The user approved the proposal to harmonize English text with the existing Persian card typography: locally served Vazirmatn Latin glyphs, weight 600, natural letter spacing and single-line LTR addresses. This authorizes this narrowly scoped typography change after the previous QR restoration; preserve all Persian fonts/styles, skyline, logo, sky themes, links, scripts and overall design.
- Apply the local face only to the store domain, Instagram handle and creator domain. Keep the phone number and Persian text untouched. Instagram size adapts to the existing card at 320px and wider without wrapping/clipping. The WOFF2 is copied unchanged from the already installed/locked `@fontsource-variable/vazirmatn` package; its OFL license is included beside the public font. No new package or external font dependency is added for English text.
- Verification: repository lint, all-workspace typecheck and storefront production build passed. Browser checks at 320/390/768/1440px confirmed actual custom-font glyphs, weight 600, LTR, single-line fit, both QR paths, original links/left arrow/logo/skyline and four sky themes. English font still loads with Google fonts blocked; Persian/phone computed typography matches the accepted baseline. Mobile/desktop screenshots were visually reviewed. Use the normal Git deployment; no migration or environment changes.

## Admin menu fit and desktop toggle (2026-10-18)

- The user requested removing internal sidebar scrolling, sizing the menu so labels do not wrap, and correcting the desktop hamburger position. Widen the expanded sidebar to 248px (264px at xl), keep labels on one line, compact the logo/header and row spacing, and place the skyline behind the menu without reserving vertical space. Remove the fixed viewport-height/inner scroll container. At desktop heights below 700px, use ordinary page flow so every link remains reachable; at taller heights the sidebar stays sticky. Preserve permissions and the disabled gateway-test filter.
- Put the desktop toggle at the right/start of the main header beside the panel identity, in one consistent position for expanded/collapsed states, with accessible labels/expanded/control attributes. Keep collapsed tooltips, a 44px mobile toggle and drawer navigation. Close an open mobile drawer when crossing the desktop breakpoint.
- Verification: repository lint and admin typecheck/production build passed. Browser geometry covered 992–1920px desktop widths, 480–1080px heights, all 12 live owner links plus a browser-only optional thirteenth link, full single-line labels, no nested sidebar scroll containers, short-height page access, stable header-relative toggle placement and Enter/Space controls. Mobile checks at 320/390/768/991px covered labels, drawer link navigation, Escape, active item and breakpoint closure. Desktop, laptop, collapsed and mobile screenshots were reviewed; no customer/product/order data was changed. Deploy with the normal Git update script; no migration/config change.
- The local machine exhausted inotify file watchers while running preview. Restarted the existing development stack with temporary `CHOKIDAR_USEPOLLING=true WATCHPACK_POLLING=1000` environment flags; no system limits or project configuration were changed. Reuse the live preview on 3000/3001/4000 instead of starting duplicate services.

## Console-generated OTP integration (2026-10-19)

- The deployed shared adapter returned HTTP 400 with `providerStatus: کلید کنسول معتبر نیست`; the user then supplied their console-generated Node HTTPS sample for `/api/send/otp/{apiKey}` with JSON `{to}` and a new key. Store the new key only in private local env and preserve development/mock mode. No key or secret URL belongs in tracked files/logs.
- Verified the public console application's own OTP documentation: request only `to`, response `code`/`status`; its OTP settings expose enablement, length, message/title and dedicated/shared line mode. This differs from `/api/send/shared/{apiKey}` (`to`, `bodyId`, `args` -> positive `recId`). The OTP endpoint does not accept a bodyId; do not invent that parameter or claim the approved template `559650` is selected by it. Keep shared mode available explicitly for that template. Changing endpoint does not itself validate an API key.
- `SMSService.sendOTP` may return the actual delivered code for console OTP; persist only that code's hash with `sentAt`. The unused locally generated code must fail verification. Require exactly five ASCII digits as a string, preserve leading zeros, keep expiry/throttling/attempt limits/single use and signed SMS authentication. Reject incompatible provider responses without fallback/repeated sends; never return or log the OTP. Diagnostics include only mode/length and safe errors.
- Configure the server with `npm run production:configure -- --sms-mode=otp --terminal-id=15855486`, then the normal Git deployment script. Update `MELI_PAYAMAK_API_KEY` privately to the key from the latest console sample and enable OTP with length **5** in the console. `--sms-mode=shared --body-id=559650` retains the prior template flow. Re-running configuration without a mode preserves the currently configured path; OTP permits absent bodyId. Docs are updated in `docs/production.md` and `docs/sms-adapter.md`.
- Verification: 175 unit tests, root lint, API typecheck/build, both production configuration/runtime fixtures, full auth API checks and auth browser checks passed. A separate isolated production API with real local MySQL and intercepted provider requests verified returned-code hashing, rejected unused local code, valid SMS-authenticated session, replay denial and invalid-length challenge consumption; temporary data was cleaned. No real SMS or bank request was sent, and server activation/delivery still needs owner confirmation.

## SOAP approved-template SMS (2026-10-19)

- The console OTP service returned HTTP 400 `مستلزم تنظیم و تأیید مدیر`. The user explicitly abandoned that approach and requested developing their Node `MelipayamakApi(...).sms('soap').sendByBaseNumber(text[], to, bodyId)` sample. They answered that they will place the panel username and web-service password/API key in the private **server** env themselves; do not ask again or treat placeholder strings/previous console keys as these credentials.
- Registry inspection found `melipayamak-api@0.1.0` lacks `sendByBaseNumber` and its SOAP module has a duplicate `let to` syntax error. This was explained to the user. Implement the requested SOAP operation directly over HTTPS instead of installing that broken SDK. The live official WSDL at `https://api.payamak-panel.com/post/send.asmx?wsdl` confirms `SendByBaseNumber`, the `http://tempuri.org/` namespace/action, `text` as ArrayOfString, a single recipient, integer bodyId and a string result.
- `meliPayamakSoap.ts` sends `[fiveDigitCode]`, the normalized customer phone and bodyId **559650**, using private `MELI_PAYAMAK_USERNAME` and `MELI_PAYAMAK_PASSWORD`. Select with `MELI_PAYAMAK_TRANSPORT=soap`; leave console configuration untouched but unused. The ordinary site-generated OTP hash/expiry/single-use flow is retained. XML construction/parsing uses the new locked `fast-xml-parser` dependency; npm and Bun locks are synchronized. No other package versions changed.
- Treat only a positive numeric receipt as accepted; preserve large receipt IDs with BigInt strings. Reject nonpositive provider codes, SOAP Fault, malformed/ambiguous XML, DTD/ENTITY and oversize responses. Keep a ten-second timeout, no redirects/retries/fallback, generic public errors and safe server diagnostics. Never log XML/fault text/raw exceptions, panel credentials, phone or OTP.
- Activation: privately fill the two panel credential variables on the server, then `npm run production:configure -- --sms-mode=soap --body-id=559650 --terminal-id=15855486 && bash deploy/update-production.sh` after the usual Git pull. The configure tool validates before writing, requires credentials/bodyId without requiring a console key, preserves data/authentication secrets and retains SOAP on subsequent runs without a mode. No database migration, seed or Nginx change is needed. Docs/production.md and docs/sms-adapter.md describe the new selected method; previous console modes remain available only by explicit selection.
- Verification: 195 unit tests, repository lint, API typecheck/build, production profile/runtime fixtures for SOAP and both console contracts, full auth API and browser checks passed. An isolated production API with real local MySQL and intercepted SOAP requests verified pattern payload, actual-code hashing/login, wrong-code rejection, SMS session claims, replay denial and provider rejection consuming the challenge; fixtures were cleaned. No real SMS/bank request or server deployment was performed. The owner's panel credentials and real delivery still require server-side activation/verification.

## Homepage pre-footer links removed (2026-10-19)

- The user requested removing the homepage links immediately above the footer: `دربارهٔ سنتی بهجتی و راه‌های تماس` and `پرسش‌های متداول خرید`. Remove that navigation block and its unused Link import. Preserve the existing brand story, footer, independent About/FAQ pages and their SEO metadata.
- Verification: repository lint, storefront typecheck and production build passed. Browser checks at 390px and 1440px confirmed both links absent from the main content, the footer visible and no horizontal overflow; `/about` and `/faq` still return HTTP 200. Reuse the local preview on 3000/3001/4000. No production deployment, environment or database changes are required beyond the ordinary Git update script.
