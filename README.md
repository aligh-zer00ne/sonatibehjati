# حلواارده سنتی بهجتی اردکان

فازهای ۱ و ۲، صفحهٔ اصلی فاز ۳ و فاز ۴ Commerce پیاده‌سازی شده‌اند. فروشگاه، دسته‌بندی، محصول، جستجو، سبد مهمان و علاقه‌مندی‌ها آماده‌اند؛ ورود، ثبت سفارش و مدیریت عملیاتی در فازهای بعد ساخته می‌شوند.

## معماری

- `apps/storefront`: Next.js App Router، RSC، TypeScript، Tailwind 4، primitiveهای shadcn/Radix، Vazirmatn محلی، Zustand برای سبد مهمان.
- `apps/admin`: React / Vite / Ant Design، مستقل از رابط فروشگاه؛ فعلاً پوستهٔ پنل، بدون API مدیریتی عمومی.
- `apps/api`: Express / GraphQL Yoga / Prisma / MySQL؛ کاتالوگ خواندنی با مدل‌های پایهٔ همهٔ دامنه‌ها.
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
| `SHIPPING_COST`                                           | هزینهٔ پایهٔ mock، تومان؛ اتصال به checkout در فاز ۶                          |
| `USER_ACCESS_TOKEN_SECRET`, `USER_REFRESH_TOKEN_SECRET`   | اسرار مستقل کاربر، حداقل ۳۲ کاراکتر در production                             |
| `ADMIN_ACCESS_TOKEN_SECRET`, `ADMIN_REFRESH_TOKEN_SECRET` | اسرار مستقل مدیر، متفاوت از اسرار کاربر                                       |
| `DEV_ADMIN_EMAIL`, `DEV_ADMIN_PASSWORD`                   | ایجاد اختیاری مدیر توسعه در seed؛ رمز حداقل ۱۲ کاراکتر                        |

در این فاز فروشگاه به‌صورت پیش‌فرض کاتالوگ نمونه دارد. تنظیم `CATALOG_SOURCE=api` باید هنگام build نیز انجام شود. تولید رمز/توکن، ورود و rotation در فاز ۵ و ۸ پیاده‌سازی می‌شود؛ اسرار اینجا تنها اعتبارسنجی زیرساخت هستند.

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
```

برای تولید: `npm run start -w @behjati/storefront` و `npm run start -w @behjati/api`؛ پنل admin خروجی static در `apps/admin/dist` دارد. build و typecheck دیتابیس زنده لازم ندارند.

## رابط و وضعیت فعلی

صفحهٔ اصلی SSR است؛ تعاملات جداگانهٔ client برای منو، جستجو، علاقه‌مندی و سبد مهمان هستند. محصول اضافه‌شده کنترل تعداد می‌گیرد، سبد و علاقه‌مندی persist می‌شوند؛ checkout فعال نیست. نوار پایین فقط موبایل است. انتخاب دسته‌بندی، صفحهٔ مستقل محصولات آن دسته را باز می‌کند. مسیرها: `/shop`، `/category/[slug]`، `/product/[slug]`، `/search`، `/cart` و `/favorites`. جستجو، فیلتر قیمت و مرتب‌سازی همراه صفحه‌بندی در URL نگهداری می‌شوند. صفحه‌های کاتالوگ و محصول سمت سرور رندر می‌شوند؛ تعاملات سبد و علاقه‌مندی در مرورگر اجرا می‌شوند. سبد تنها شناسه و تعداد را ذخیره می‌کند و اطلاعات و قیمت جاری را مجدداً از سرور می‌گیرد.

تصاویر نمونه مستقیماً از مرجع کاربر بریده شده‌اند و وضوح محدودی دارند؛ نسخهٔ سایت از لوگوی PDF مشتق شده است؛ بنا به درخواست کاربر، عبارت «روغن (ارده) کنجد ممتاز» از روبان پایین حذف شده است و فایل PDF اصلی برای مرجع حفظ شده است. پیش از انتشار باید عکس‌های اصلی محصولات و اطلاعات واقعی برند، قیمت، نشانی و سیاست ارسال دریافت شوند. هیچ ادعای قدمت یا کیفیت تأییدنشده درج نشده است. جزییات در `docs/asset-provenance.md` و `docs/design-system.md`.

فایل robots فعلاً خزیدن را مسدود می‌کند، چون نسخهٔ توسعه حاوی قیمت نمونه است. SEO/GEO کامل و structured data معتبر در فاز ۹ اجرا می‌شود.

جزئیات قراردادهای کاتالوگ، محدودیت‌های سبد و وضعیت آزمون‌ها در [docs/phase4.md](docs/phase4.md) ثبت شده است.

## فازهای بعد

۵: OTP و tokens؛ ۶: آدرس، نقشه، ارسال، تخفیف، سفارش؛ ۷: حساب؛ ۸: مدیریت؛ ۹: SEO/GEO. هیچ پرداخت موفق ساختگی یا درگاه فعالی در این پروژه وجود ندارد.

## روند Git

هر ویژگی کامل پس از بررسی با پیام مناسب روی برنچ `dev` کامیت و به `origin/dev` پوش می‌شود. نام و ایمیل Git با دسترسی GitHub مستقل‌اند؛ پوش نیازمند احراز هویت حساب است.

## قرارداد استایل فروشگاه

همهٔ استایل‌های کامپوننت‌ها در `className` با Tailwind نوشته می‌شوند. primitiveهای shadcn شامل Button، Input، Dialog، Card، Badge و Skeleton هستند. `globals.css` فقط import مربوط به Tailwind و توکن‌های تم shadcn دارد؛ پوشهٔ استایل جدا، کلاس CSS اختصاصی کامپوننت و inline style در کد فروشگاه ایجاد نکنید. عنوان کوتاه برند «سنتی بهجتی» است و عنوان کامل «حلواارده سنتی بهجتی اردکان» حفظ می‌شود.
