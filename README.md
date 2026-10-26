# حلواارده سنتی بهجتی اردکان

فازهای ۱ و ۲، صفحهٔ اصلی فاز ۳ و فازهای ۴ تا ۸ پیاده‌سازی شده‌اند. فروشگاه، محصول، سبد مهمان، ورود پیامکی، نشانی و نقشه، تخفیف و ثبت سفارش آماده‌اند؛ پروفایل، نشانی‌ها و سابقهٔ سفارش در حساب فعال‌اند؛ پنل مستقل مدیریت با داشبورد، محصول، سفارش، کاربران، نقشه، گزارش و فاکتور A5 آماده است.

## معماری

- `apps/storefront`: Next.js App Router، RSC، TypeScript، Tailwind 4، primitiveهای shadcn/Radix، Vazirmatn محلی، Zustand برای سبد مهمان.
- `apps/admin`: React / Vite / Ant Design، مستقل از رابط فروشگاه؛ پنل حفاظت‌شده با نمودارهای Recharts و نقشه Leaflet.
- `apps/api`: Express / GraphQL Yoga / Prisma / MySQL؛ کاتالوگ خواندنی و ورود پیامکی با نشست‌های کاربر.
- `packages/shared`, `graphql`, `types`, `config`: اعتبارسنجی، ابزارهای مشترک، کلاینت تایپ‌شده و قراردادها.
- منبع قرارداد API: `apps/api/src/graphql/schema.graphql`. تایپ‌های GraphQL با Codegen ساخته می‌شوند.

## پیش‌نیاز و نصب

Node >= 22.15 (فایل `.nvmrc`: نسخهٔ ۲۶)، npm >= 10، Bun >= 1.3 برای اجرای اختیاری اسکریپت‌ها، Docker برای MySQL.

```sh
nvm use
npm ci
npm run db:generate
npm run codegen
```

npm مدیر اصلی نصب و `package-lock.json` فایل قفل مرجع است. Bun نیز از npm workspaces پشتیبانی می‌کند؛ برای اجرای اسکریپت‌ها `bun run dev`، `bun run lint` و `bun run typecheck` قابل استفاده است. فایل قفل pnpm وجود ندارد. برای نصب با Bun نیز `bun install --frozen-lockfile` و فایل `bun.lock` موجود است؛ پس از تغییر وابستگی با npm، `bun install --lockfile-only` را برای همگام‌سازی اجرا کنید.

## محیط اجرا

فایل `.env.example` هر برنامه را در همان پوشه به `.env` کپی کنید (فروشگاه: `.env.local` هم پشتیبانی می‌شود).

| متغیر                                                     | کاربرد                                                                        |
| --------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `DATABASE_URL`                                            | اتصال MySQL برای Prisma و API                                                 |
| `PORT`                                                    | پورت API، پیش‌فرض ۴۰۰۰                                                        |
| `STOREFRONT_ORIGIN`, `ADMIN_ORIGIN`                       | CORS مجاز                                                                     |
| `API_URL`                                                 | اتصال سرور فروشگاه به GraphQL                                                 |
| `CATALOG_SOURCE`                                          | `mock` برای کاتالوگ نمونه، `api` برای دیتابیس؛ خطای API به mock تبدیل نمی‌شود |
| `NEXT_PUBLIC_SITE_URL`                                    | دامنهٔ canonical و metadata                                                   |
| `VITE_API_URL`                                            | endpoint پنل مدیریت                                                           |
| `SHIPPING_COST`                                           | هزینهٔ ارسال ثابت توسعه، تومان؛ محاسبه در سرور Checkout                       |
| `USER_ACCESS_TOKEN_SECRET`, `USER_REFRESH_TOKEN_SECRET`   | اسرار مستقل کاربر، حداقل ۳۲ کاراکتر در production                             |
| `ADMIN_ACCESS_TOKEN_SECRET`, `ADMIN_REFRESH_TOKEN_SECRET` | اسرار مستقل مدیر، متفاوت از اسرار کاربر                                       |
| `DEV_ADMIN_EMAIL`, `DEV_ADMIN_PASSWORD`                   | ایجاد اختیاری مدیر توسعه در seed؛ رمز حداقل ۱۲ کاراکتر                        |

فروشگاه به‌صورت پیش‌فرض کاتالوگ نمونه دارد. تنظیم `CATALOG_SOURCE=api` باید هنگام build نیز انجام شود. ورود کاربر، توکن‌ها و rotation در فاز ۵ فعال‌اند؛ احراز هویت مستقل مدیر در فاز ۸ فعال است؛ جزئیات در [docs/phase8.md](docs/phase8.md).

پس از آماده‌شدن دیتابیس، `npm run setup:auth` اسرار تصادفی توسعه را در فایل‌های خصوصی و gitignored ایجاد می‌کند و کلید پراکسی API و Next را هماهنگ می‌کند. مقادیر موجود حفظ می‌شوند؛ تعیین صریح `DATABASE_URL` هنگام اجرای این فرمان اتصال محلی را عوض می‌کند. این فرمان برای production نیست. گزینهٔ موقت `DEV_OTP_CODE=123456` ورود توسعه با کد ثابت را فعال می‌کند؛ مقدار خالی کد تصادفی توسعه را برمی‌گرداند. در development/test هیچ پیامک واقعی ارسال نمی‌شود، حتی اگر provider واقعی تنظیم شده باشد. در production این گزینه نادیده گرفته می‌شود و کد تصادفی با سرویس واقعی ارسال و اعتبارسنجی می‌شود. برای production، `SMS_PROVIDER=melipayamak`، `MELI_PAYAMAK_API_KEY` و `MELI_PAYAMAK_OTP_BODY_ID` را در محیط API تنظیم کنید؛ راهنمای کامل در [docs/phase5.md](docs/phase5.md) است.

## دیتابیس، Migration و Seed

```sh
docker compose up -d
npm run db:generate
npm run db:migrate
npm run db:seed
```

Seed فقط با `NODE_ENV=development` اجرا می‌شود. شامل دسته‌ها، محصولات، کاربر و سفارش نمونه و کد تخفیف `DEV10` است؛ مدیر تنها با متغیرهای محیطی بالا ساخته می‌شود. هیچ مدیر پیش‌فرض production وجود ندارد. Migration MySQL در ریپو موجود است. Migration و Seed روی MySQL 8.4 محلیِ جدا بررسی شده‌اند و اجرای دوبارهٔ Seed دادهٔ تکراری ایجاد نمی‌کند. برای اجرای آن‌ها MySQL فعال نیاز است.

قیمت‌ها عدد صحیح تومان هستند. OrderItem اطلاعات محصول را snapshot می‌کند؛ روابط سفارش با محصول و نشانی `Restrict` هستند. سبد مرورگر مرجع مالی سفارش نیست. محاسبات قیمت، تخفیف و ارسال در checkout باید روی سرور اجرا شوند.

## اجرا

```sh
npm run dev
# یا اجرای مستقل
npm run dev:storefront  # localhost:3000
npm run dev:admin       # localhost:3001
npm run dev:api         # localhost:4000/graphql
# Bun
bun run dev
```

اجرای گروهی `npm run dev` (یا `bun run dev`) پیش از شروع برنامه‌ها پورت‌های فروشگاه ۳۰۰۰، پنل ۳۰۰۱ و API ۴۰۰۰ را بررسی می‌کند. اگر پورتی اشغال باشد، اولین پورت آزاد بعدی انتخاب می‌شود؛ آدرس API، پروکسی پنل، پیش‌نمایش محصول و Originهای مجاز فقط در محیط فرایندهای توسعه هماهنگ می‌شوند. آدرس‌های واقعی در خروجی ترمینال نمایش داده می‌شوند. برای پورت ترجیحی از `DEV_STOREFRONT_PORT`، `DEV_ADMIN_PORT` و `DEV_API_PORT` در محیط دستور استفاده کنید. اجرای مستقل برنامه‌ها این هماهنگی گروهی را انجام نمی‌دهد.

در تنظیم محلی `mysql://root@127.0.0.1:3307/behjati`، دستور `npm run dev` ابتدا MySQL اختصاصی توسعه را اجرا می‌کند و migrationهای موجود را اعمال می‌کند. برای پورت دیگری، در فایل خصوصی `apps/api/.env` مقدار `DEV_MYSQL_PORT` را برابر پورت آزاد انتخابی قرار دهید و پورت `DATABASE_URL` را با آن هماهنگ کنید. در این حالت `DATABASE_URL` می‌تواند کاربر اختصاصی دیتابیس را داشته باشد و رمز مدیر MySQL جداگانه در `DEV_MYSQL_ROOT_PASSWORD` نگهداری شود. اگر باینری MySQL 8.4 در PATH نیست، مسیر اجرایی آن را با `DEV_MYSQLD_BIN` در همان فایل مشخص کنید. ابزار `mysql` نیز باید در PATH باشد. پیش از migration، مسیر دادهٔ سرور بررسی می‌شود تا سرویس پروژهٔ دیگری تغییر نکند.

داده‌ها در `~/tmp/sonatibehjati-dev-mysql/data` باقی می‌مانند. اگر دیتابیس وجود نداشته باشد، جدیدترین `current-data.sql.gz` در `.deployment` بازیابی می‌شود؛ نصب کاملاً تازه بدون بکاپ با دیتابیس خالی آغاز می‌شود. دیتابیس موجود بازنویسی یا seed نمی‌شود. اتصال‌های دیگر باید از قبل آماده باشند؛ اجرای مستقل هر برنامه دیتابیس را راه نمی‌اندازد.

این انتخاب پورت فقط در اسکریپت توسعه انجام می‌شود و هیچ فایل محیطی را بازنویسی نمی‌کند. فایل‌های خصوصی `.env` وارد Git نمی‌شوند. تنظیمات PM2، Nginx و اسکریپت استقرار تغییر نمی‌کنند؛ پورت‌های پروداکشن فروشگاه ۳۱۰۰ و API ۴۱۰۰ باقی می‌مانند.

`/health` وضعیت پروسه را نشان می‌دهد؛ سلامت اتصال دیتابیس را تضمین نمی‌کند. queries `products`, `product`, `categories`, `catalog` و `productsByIds` از MySQL می‌خوانند.

## کیفیت و Build

```sh
npm run codegen
npm run lint
npm run typecheck
npm test
npm run build
npm run format:check
# نیاز به Google Chrome محلی دارد؛ مسیر دیگر با CHROME_PATH
npm run verify:home
npm run verify:commerce
# با DATABASE_URL دیتابیس آزمایشی migrated و seeded
npm run verify:api
npm run verify:auth
npm run verify:auth-ui
npm run verify:checkout
npm run verify:checkout-ui
npm run verify:account
npm run verify:account-ui
npm run verify:admin-auth
npm run verify:admin
npm run verify:admin-ui
```

برای تولید: `npm run start -w @behjati/storefront` و `npm run start -w @behjati/api`؛ پنل admin خروجی static در `apps/admin/dist` دارد. build و typecheck دیتابیس زنده لازم ندارند.

## رابط و وضعیت فعلی

صفحهٔ اصلی SSR است؛ تعاملات جداگانهٔ client برای منو، جستجو، علاقه‌مندی و سبد مهمان هستند. محصول اضافه‌شده کنترل تعداد می‌گیرد و سبد و علاقه‌مندی persist می‌شوند. نوار پایین فقط موبایل است. مسیرهای Commerce: `/shop`، `/category/[slug]`، `/product/[slug]`، `/search`، `/cart` و `/favorites`. جستجو، فیلتر قیمت و مرتب‌سازی همراه صفحه‌بندی در URL نگهداری می‌شوند. کاتالوگ و محصول سمت سرور رندر می‌شوند؛ تعاملات سبد و علاقه‌مندی در مرورگر اجرا می‌شوند. سبد تنها شناسه و تعداد را ذخیره می‌کند و اطلاعات و قیمت جاری را مجدداً از سرور می‌گیرد.

`/checkout` پس از ورود باز می‌شود؛ نشانی، موقعیت اختیاری روی نقشه، ارسال، تخفیف و خلاصهٔ معتبر سرور را نشان می‌دهد. سفارش با وضعیت `PENDING_PAYMENT` ثبت می‌شود؛ هیچ پرداختی انجام نمی‌شود. در توسعه Seed، شناسه‌های کاتالوگ نمونهٔ رابط را نیز در دیتابیس ایجاد می‌کند؛ production باید با `CATALOG_SOURCE=api` ساخته شود. جزئیات و آزمون‌ها در [docs/phase6.md](docs/phase6.md) هستند.

تصاویر نمونه مستقیماً از مرجع کاربر بریده شده‌اند و وضوح محدودی دارند؛ نسخهٔ سایت از لوگوی PDF مشتق شده است؛ بنا به درخواست کاربر، عبارت «روغن (ارده) کنجد ممتاز» از روبان پایین حذف شده است و فایل PDF اصلی برای مرجع حفظ شده است. پیش از انتشار باید عکس‌های اصلی محصولات و اطلاعات واقعی برند، قیمت، نشانی و سیاست ارسال دریافت شوند. هیچ ادعای قدمت یا کیفیت تأییدنشده درج نشده است. جزییات در `docs/asset-provenance.md` و `docs/design-system.md`.

SEO/GEO شامل متادیتای صفحات، sitemap پویا، داده‌های ساختاریافتهٔ برند و محصول، معرفی مجموعه و پرسش‌های متداول پیاده شده است. تولید با کاتالوگ API قابل ایندکس است؛ توسعه و mock بسته می‌مانند. راهنمای استقرار، بررسی و تأیید مالکیت موتورهای جست‌وجو در [docs/seo.md](docs/seo.md) است.

جزئیات کاتالوگ و سبد در [docs/phase4.md](docs/phase4.md) و ورود، پیامک، نشست‌ها و آزمون‌های احراز هویت در [docs/phase5.md](docs/phase5.md) ثبت شده است. مسیرهای جدید `/login`، `/verify` و `/account` هستند. حساب شامل نمای کلی، ویرایش پروفایل، مدیریت نشانی‌ها، فهرست صفحه‌بندی‌شده و فیلتر وضعیت سفارش‌ها و جزئیات snapshot سفارش است. شمارهٔ ورود در پروفایل فقط خواندنی است و ایمیل اختیاری تأییدشده محسوب نمی‌شود. مسیرها و آزمون‌ها در [docs/phase7.md](docs/phase7.md) ثبت شده‌اند. مرور و سبد همچنان برای مهمان قابل استفاده‌اند.

پنل مدیریت در `/admin` برنامهٔ مستقل `localhost:3001` اجرا می‌شود. پس از migration، `npm run setup:admin` مدیر توسعه را می‌سازد؛ مشخصات ورود در فایل خصوصی `apps/api/.env` با کلیدهای `DEV_ADMIN_EMAIL` و `DEV_ADMIN_PASSWORD` قرار می‌گیرند. برای اتصال تغییرات محصولات پنل به فروشگاه، آن را با `CATALOG_SOURCE=api` بسازید. راهنمای امنیت، پروکسی production، گزارش و چاپ در [docs/phase8.md](docs/phase8.md) است.

## فازهای بعد

سئو و GEO فاز ۹ پیاده شده‌اند؛ تأیید مالکیت Search Console و Bing و پایش دادهٔ واقعی پس از استقرار در [راهنمای سئو](docs/seo.md) توضیح داده شده است. پروفایل انتشار با پیامک واقعی پنج‌رقمی و درگاه سامان در [انتشار واقعی](docs/production.md) آمده است؛ سابقهٔ دورهٔ تست در [docs/payments.md](docs/payments.md) حفظ شده است.

## روند Git

هر ویژگی کامل پس از بررسی با پیام مناسب روی برنچ `dev` کامیت و به `origin/dev` پوش می‌شود. نام و ایمیل Git با دسترسی GitHub مستقل‌اند؛ پوش نیازمند احراز هویت حساب است.

## قرارداد استایل فروشگاه

همهٔ استایل‌های کامپوننت‌ها در `className` با Tailwind نوشته می‌شوند. primitiveهای shadcn شامل Button، Input، Dialog، Card، Badge و Skeleton هستند. `globals.css` فقط import مربوط به Tailwind و توکن‌های تم shadcn دارد؛ پوشهٔ استایل جدا، کلاس CSS اختصاصی کامپوننت و inline style در کد فروشگاه ایجاد نکنید. عنوان کوتاه برند «سنتی بهجتی» است و عنوان کامل «حلواارده سنتی بهجتی اردکان» حفظ می‌شود.
