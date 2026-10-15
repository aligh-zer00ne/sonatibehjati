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
- The user's last explicit publishing preference was local commits only (“فعلاً فقط کامیت محلی بماند”). Do not silently publish pending history or conversation notes; distinguish committed, pushed and deployed state.
- Verification: lint, all-workspace typecheck/build, 133 unit tests, auth API/UI, fixed-code storefront checkout/payment browser tests and production profile/fresh local migration checks passed. Browser bank requests were simulated. Private development env remains unchanged; server activation commands are in `docs/payments.md`.
