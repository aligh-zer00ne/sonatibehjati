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
