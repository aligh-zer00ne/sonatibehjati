# فاز ۵ — ورود پیامکی و نشست کاربر

ورود با شمارهٔ موبایل ایرانی در `/login`، تأیید در `/verify` و نمایش نشست در `/account` پیاده‌سازی شده‌اند. تأیید موفق، کاربر جدید را ثبت می‌کند یا کاربر موجود را وارد می‌کند. مسیر داخلی `next` حفظ می‌شود؛ مسیر خارجی، مسیر API و حلقهٔ login/verify رد می‌شوند. مرور فروشگاه و سبد مهمان ورود اجباری ندارند. Checkout فاز ۶ و امکانات کامل حساب فاز ۷ هستند.

## قرارداد و رابط

Schema اصلی GraphQL دارای `me` و mutationهای `requestOtp`, `verifyOtp`, `refreshToken`, `logout` است. خروجی ورود اطلاعات کاربر، accessToken و زمان پایان access است؛ refresh فقط از Set-Cookie عبور می‌کند. تایپ‌ها و documentهای frontend با Codegen ساخته می‌شوند و اعتبارسنجی شماره، کد و مسیر بازگشت در `packages/shared` مشترک است. ارقام فارسی و عربی پذیرفته و به ASCII تبدیل می‌شوند.

رابط RTL با Card، Input و Button از primitiveهای shadcn، classNameهای Tailwind، لوگوی اصلاح‌شده، وکتورهای کنجد و تم فعلی ساخته شده است. خطای ارسال، کد اشتباه، انقضا، ارسال مجدد، countdown، loading و retry نمایش داده می‌شوند. فقط اطلاعات challenge در sessionStorage برای reload ذخیره می‌شود؛ کد OTP persist نمی‌شود و access فقط در حافظهٔ ماژول کلاینت نگهداری می‌شود؛ هیچ توکنی persist نمی‌شود و refresh برای جاوااسکریپت قابل خواندن نیست. قاب و فرم اولیهٔ ورود SSR دارند؛ عملیات پیامک به JavaScript نیاز دارد.

## سرویس پیامک ارسالی کاربر

آداپتور `apps/api/src/services/meliPayamakSms.ts` از نمونهٔ `/home/zer00ne/Downloads/Telegram Desktop/SmsService.ts` اقتباس شده است. قرارداد مستقل `SMSService.sendOTP(phoneNumber, code)` حفظ شده و وابستگی NestJS نمونه برای API مبتنی بر Express لازم نیست.

درخواست HTTPS با `POST`، مسیر پیش‌فرض `/api/send/shared/{apiKey}` و بدنهٔ `{ to, bodyId, args: [code] }` ارسال می‌شود. کلید در مسیر encode می‌شود؛ timeout ده ثانیه است، redirect پذیرفته نمی‌شود و پاسخ فقط با `recId` عدد صحیح مثبت معتبر است. متن خطا، پاسخ provider و کلید در خروجی یا log منتشر نمی‌شوند.

| متغیر API                  | مقدار / کاربرد                                             |
| -------------------------- | ---------------------------------------------------------- |
| `SMS_PROVIDER`             | `melipayamak` در production؛ توسعه همیشه mock است          |
| `DEV_OTP_CODE`             | کد شش‌رقمی موقت توسعه؛ نمونه `123456`، خالی برای کد تصادفی |
| `MELI_PAYAMAK_HOSTNAME`    | پیش‌فرض `console.melipayamak.com`                          |
| `MELI_PAYAMAK_PATH`        | پیش‌فرض `/api/send/shared/{apiKey}`                        |
| `MELI_PAYAMAK_API_KEY`     | کلید خصوصی سرویس؛ بدون پیشوند `NEXT_PUBLIC`                |
| `MELI_PAYAMAK_OTP_BODY_ID` | شناسهٔ مثبت الگوی OTP با آرگومان کد ورود                   |

نام‌های قدیمی `MELI_PAYMAK_PATH` و `MELI_PAYMAK_API_KEY` نمونه نیز fallback دارند. پورت سرویس ۴۴۳ است. کلید و شناسهٔ الگوی واقعی در اختیار پروژه قرار نگرفته‌اند؛ درخواست زندهٔ پیامک اجرا نشده است. قالب درخواست و پاسخ با fetch کنترل‌شده آزموده شده است. Mock فقط در development/test مجاز است و کد را در کنسول API نشان می‌دهد؛ production با Mock شروع نمی‌شود و هیچ OTP را log نمی‌کند.

## OTP و محدودیت‌ها

در production کد شش‌رقمی با مولد تصادفی رمزنگاری ساخته می‌شود. گزینهٔ موقت `DEV_OTP_CODE` فقط در `NODE_ENV=development` کد ثابت می‌سازد؛ `.env.example` و فرمان setup مقدار `123456` را برای توسعه پیشنهاد می‌کنند. مقدار خالی این گزینه کد تصادفی توسعه را برمی‌گرداند. test و production مقدار ثابت را نادیده می‌گیرند. در development/test همواره mock انتخاب می‌شود و حتی با تنظیم provider واقعی هیچ پیامکی ارسال نمی‌شود.

کد ثابت نیز به challenge و شماره متصل است؛ ورود همچنان به درخواست کد، اعتبار سه دقیقه و حداکثر پنج تلاش نیاز دارد. ذخیره فقط HMAC است و مقایسه ثابت‌زمان انجام می‌شود. ارسال یا پذیرش mock ثبت می‌شود؛ challenge ناموفق قابل تأیید نیست. ارسال مجدد کد قبلی را مصرف می‌کند؛ تأیید موفق و تلاش پنجم نیز challenge را مصرف می‌کنند. قفل سطر MySQL از تأیید هم‌زمان یک کد جلوگیری می‌کند. ثبت کاربر و ایجاد نشست در همان transaction تأیید انجام می‌شوند. تایمر دقیقه و ثانیه هر دو ارقام فارسی دارند و جهت زمان با `bdi` از متن RTL جدا شده است.

محدودیت‌های پایدار در `AuthThrottle` نگهداری می‌شوند؛ کلید bucket هش است و افزایش شمارنده با قفل سطر انجام می‌شود:

- دریافت کد: یک بار در دقیقه و پنج بار در ساعت برای هر شماره؛ سی بار در ساعت برای هر IP.
- تأیید: پنجاه درخواست در پانزده دقیقه برای هر IP، علاوه بر سقف پنج تلاش هر challenge.
- تمدید نشست: صدوبیست درخواست در پانزده دقیقه برای هر IP.

## توکن و کوکی

Access پانزده دقیقه و refresh با پایان مطلق سی روز هستند. JWTهای HS256 با `jose` امضا می‌شوند؛ issuer، audience، kind، typ، زمان و شناسهٔ خانواده اعتبارسنجی می‌شوند. اسرار access، refresh، OTP و اسرار مدیر مستقل‌اند. فقط هش refresh در دیتابیس ذخیره می‌شود. فقط refresh در کوکی `behjati_user_refresh`، host-only، `HttpOnly`، `SameSite=Lax` و `Path=/` نگهداری می‌شود. Access در حافظه است و با `Authorization: Bearer` ارسال می‌شود. کوکی access نسخهٔ قبلی پاک می‌شود و API آن را برای احراز هویت قبول نمی‌کند؛ در production نیز `Secure` دارند و HTTPS الزامی است.

هر refresh یک توکن جدید و ابطال توکن قبلی می‌سازد و پایان سی‌روزه را تمدید نمی‌کند. بازپخش refresh مصرف‌شده تمام خانواده را باطل می‌کند. رکورد `UserSession` در rotation و logout قفل می‌شود تا خروج هم‌زمان نشست را دوباره فعال نکند. `me` علاوه بر امضا و انقضای access، فعال‌بودن خانواده در دیتابیس را بررسی می‌کند؛ بنابراین logout و تشخیص replay دسترسی را بلافاصله قطع می‌کنند.

الگوی rotation و تشخیص replay با [RFC 9700، بخش 4.14](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14) همسو است. امضا و اعتبارسنجی از [مستندات رسمی jose](https://github.com/panva/jose) استفاده می‌کنند. احراز هویت مدیر، توکن‌ها و کوکی‌های آن به این مسیر متصل نیستند و در فاز ۸ اجرا خواهند شد.

## پراکسی Next و استقرار

مرورگر فقط `/api/auth` همان دامنه را فراخوانی می‌کند. این route مبدأ و Fetch Metadata را بررسی می‌کند، JSON محدود و ورودی مشترک می‌پذیرد و فقط پنج عملیات ثابت تولیدشده با Codegen را به API می‌فرستد. کوکی‌های مدیر و GraphQL دلخواه عبور نمی‌کنند. پاسخ‌ها `no-store` هستند و خطای داخلی API به پیام عمومی فارسی تبدیل می‌شود. API نیز Origin mutationهای ورود را بررسی می‌کند.

کلاینت در شروع و نزدیک انقضای access، از طریق refresh-cookie یک access تازه می‌گیرد؛ پراکسی به‌جای refresh خودکار، هدر Authorization را منتقل می‌کند. Web Locks درخواست‌های نشست را میان تب‌ها سری می‌کند تا rotation هم‌زمان به‌عنوان replay شناخته نشود؛ BroadcastChannel تغییر ورود و خروج را به تب‌های دیگر اعلام می‌کند. مرورگرهای فاقد Web Locks همچنان ورود دارند، اما تضمین سری‌شدن refresh میان تب‌ها را ندارند. برنامه در شروع، بازگشت به تب و هر پنج دقیقهٔ فعال، نشست را بررسی می‌کند.

`AUTH_PROXY_SECRET` باید در API و محیط server-only فروشگاه یکسان باشد. `AUTH_TRUST_PROXY_HEADERS` پیش‌فرض `false` است؛ در این حالت IP اتصال Next به API ملاک rate limit خواهد بود و کاربران پشت همان پراکسی bucket مشترک دارند. برای IP واقعی، فقط پشت پراکسی معتبری که `X-Forwarded-For` ارسالی کاربر را بازنویسی می‌کند این گزینه را در هر دو برنامه `true` کنید. API فقط همراه کلید صحیح پراکسی و IP معتبر، `X-Client-IP` را می‌پذیرد. هیچ کلید خصوصی را در متغیر `NEXT_PUBLIC` قرار ندهید.

Production اسرار مستقل حداقل ۳۲ کاراکتر، کلید پراکسی، Origin HTTPS و provider واقعی لازم دارد. فرمان `npm run setup:auth` مخصوص محیط محلی است و اسرار موجود را حفظ می‌کند؛ فایل‌ها با مجوز 0600 و خارج از Git نوشته می‌شوند. بدون اسرار تنظیم‌شده، توسعه از اسرار تصادفی موقت استفاده می‌کند و restart نشست‌های آن را نامعتبر می‌کند.

## Migration و بررسی

Migration `202610020001_authentication`، زمان ارسال OTP، جدول محدودیت و خانوادهٔ نشست با رابطهٔ refresh را اضافه می‌کند و خانواده‌های موجود را backfill می‌کند. روی MySQL 8.4 آزمایشی اعمال و بررسی شده است.

```sh
nvm use
npm run db:generate
npm run db:migrate
npm run setup:auth
npm run codegen
npm run lint
npm run typecheck
npm test
npm run build
npm run format:check
# دیتابیس آزمایشی migrated؛ داده‌های آزمون به‌صورت موقت ساخته و پاک می‌شوند
DATABASE_URL='mysql://USER:PASSWORD@HOST:PORT/TEST_DATABASE' npm run verify:auth
DATABASE_URL='mysql://USER:PASSWORD@HOST:PORT/TEST_DATABASE' npm run verify:auth-ui
# حفظ رفتار کاتالوگ؛ دیتابیس آزمایشی seeded لازم است
npm run verify:home
npm run verify:commerce
DATABASE_URL='mysql://USER:PASSWORD@HOST:PORT/TEST_DATABASE' npm run verify:api
```

۵۶ آزمون واحد شامل قرارداد پیامک، خرابی provider، نادیده‌گرفتن کد ثابت در production/test، قطع ارسال واقعی در توسعه، جداسازی/انقضای توکن، کوکی‌ها، HMAC، ورودی OTP و مسیرهای امن، به‌علاوهٔ آزمون‌های قبلی کاتالوگ و سبد هستند. بررسی API روی MySQL شامل expiry، cooldown، محدودیت ساعتی، پنج تلاش، مصرف یک‌باره، ثبت خودکار، ورود کاربر موجود، rotation، replay، logout، هم‌زمانی و رد IP جعلی است. اجرای فرمان‌های `verify:auth` و `verify:auth-ui` با `AUTH_VERIFY_DEVELOPMENT=true` همین جریان‌ها را با کد ثابت توسعه بررسی می‌کند؛ آزمون مرورگر فارسی‌بودن هر دو بخش تایمر را نیز کنترل می‌کند.

بررسی Chrome شامل شماره/کد فارسی، خطای پیامک و retry، challenge پس از reload، کد اشتباه و resend، بازگشت به سبد و حفظ آن، HttpOnly، refresh/logout دو تب، CSRF، allowlist، حالت challenge ناموجود و عرض‌های ۳۲۰، ۳۹۰، ۷۶۸ و ۱۴۴۰ است. تصاویر بازبینی محلی در `/tmp/behjati-phase5-*` ساخته می‌شوند. آزمون‌های صفحهٔ اصلی و Commerce نیز مجدداً گذشته‌اند. وابستگی‌های آسیب‌پذیر Vitest و deepmerge-ts به نسخه‌های اصلاح‌شده ارتقا یافتند و npm audit بدون مورد است.
