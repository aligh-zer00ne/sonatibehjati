# فاز ۸ — پنل مدیریت

پنل مستقل React/Vite/Ant Design در `localhost:3001` با فونت محلی Vazirmatn و RTL ساخته شد. قالب حرفه‌ای خاکستری و منوی مدیریت از طراحی فروشگاه مستقل است؛ componentها با Ant Design و utilityهای Tailwind در `className` پیاده شده‌اند. CSS عمومی فقط پایهٔ فونت و چاپ A5 را تعریف می‌کند.

## اجرا و حساب مدیر

```sh
npm run db:generate
npm run db:migrate
npm run setup:admin
npm run dev:api
npm run dev:admin
```

`setup:admin` فقط برای development است: اسرار مستقل مدیر و مشتری را در فایل‌های خصوصی gitignored حفظ یا تولید می‌کند و حساب مدیر توسعه را seed می‌کند. ایمیل و رمز تولیدشده در `apps/api/.env` با نام `DEV_ADMIN_EMAIL` و `DEV_ADMIN_PASSWORD` هستند؛ هیچ رمز یا توکنی در خروجی فرمان چاپ نمی‌شود. اجرای دوباره رمز مدیر موجود را عوض نمی‌کند. برای مدیر production، متغیرهای `DATABASE_URL`، `ADMIN_EMAIL` و `ADMIN_PASSWORD` را امن در محیط فرآیند قرار دهید و `npm run admin:create` اجرا کنید. رمز باید ۱۲ تا ۱۲۸ کاراکتر باشد؛ این فرمان فقط حساب جدید می‌سازد. ثبت‌نام عمومی مدیر وجود ندارد.

پروکسی Vite در توسعه و preview، `/api/admin` را به `/graphql` در `API_PROXY_TARGET` (پیش‌فرض API محلی ۴۰۰۰) می‌فرستد و Origin را حفظ می‌کند. در production همین مسیر باید در reverse proxy دامنهٔ پنل به API متصل شود؛ مسیرهای `/admin/*` باید fallback به `index.html` داشته باشند. `VITE_API_URL` فقط endpoint عمومی پنل است و هیچ secret نباید `VITE_` شود. `ADMIN_ORIGIN` باید دقیقاً origin پنل و در production HTTPS باشد.

## احراز هویت و مجوز

- Access مدیر: JWT مستقل ۱۰ دقیقه، در حافظهٔ مرورگر، ارسال با `Authorization: Bearer`؛ در localStorage/sessionStorage ذخیره نمی‌شود.
- Refresh مدیر: JWT مستقل با سقف مطلق نشست ۸ ساعت؛ کوکی `behjati_admin_refresh` با HttpOnly، SameSite=Lax و Secure در production. فقط hash توکن در DB ذخیره می‌شود.
- secret، audience، typ و kind مدیر از مشتری جدا هستند. حتی با secret مشترک اشتباه، JWT نقش دیگر معتبر نمی‌شود؛ config استفادهٔ مجدد از secretها را رد می‌کند.
- هر query و mutation مدیریتی مجوز را روی سرور بررسی می‌کند. نشست DB در هر درخواست کنترل می‌شود؛ logout و کشف استفادهٔ دوبارهٔ refresh، accessهای همان خانواده را فوراً باطل می‌کنند. نشست مشتری مستقل می‌ماند.
- rotation در transaction و با قفل خانواده انجام می‌شود. Web Locks درخواست‌های پنل و refresh را بین تب‌ها هماهنگ می‌کند؛ BroadcastChannel تنها تغییر نشست را اعلام می‌کند و توکن حمل نمی‌کند. fallback داخل یک تب صف می‌سازد؛ مرورگر فاقد Web Locks هنگام رقابت refresh ممکن است به ورود مجدد نیاز داشته باشد.
- login محدود به ۵ تلاش برای ایمیل و ۲۰ تلاش IP در ۱۵ دقیقه است؛ خطای ایمیل ناشناخته و رمز غلط یکسان است. رمز با scrypt `N=32768,r=8,p=1` و salt تصادفی hash می‌شود؛ hash قدیمی seed نیز قابل بررسی است.
- mutationهای پنل علاوه بر bearer، Origin مجاز و POST را بررسی می‌کنند. پاسخ خصوصی no-store است. پنل noindex است.

## مسیرها و رفتار

| مسیر                        | کاربرد                                                                                         |
| --------------------------- | ---------------------------------------------------------------------------------------------- |
| `/login`                    | ورود مستقل مدیر و بازگشت به مسیر درخواستی                                                      |
| `/admin`                    | تعداد کل، امروز و ماه شمسی جاری، ارزش و میانگین سفارش، درآمد، آخرین ۵ سفارش و نمودارهای ۳۰ روز |
| `/admin/products`           | ایجاد، ویرایش، فعال/غیرفعال، حذف امن، جستجو، دسته، مرتب‌سازی و صفحه‌بندی                       |
| `/admin/orders`             | جستجو، وضعیت، مشتری با جستجوی موبایل/نام، شماره، شهر snapshot، بازهٔ روز و چهار ترتیب          |
| `/admin/orders/:id`         | اقلام و نشانی تاریخی، مبالغ، تغییر وضعیت مجاز و تاریخچهٔ مدیر/زمان                             |
| `/admin/orders/map`         | نشانگرهای سفارش‌های صفحهٔ جاری و popup شماره، مشتری، مبلغ، وضعیت، نشانی و لینک جزئیات          |
| `/admin/users`              | فهرست و جستجوی کاربران، زمان عضویت، تعداد و ارزش سفارش‌ها و لینک سفارش‌های کاربر               |
| `/admin/reports`            | گزارش بازهٔ حداکثر ۳۶۶ روز و وضعیت، نمودار روزانه/توزیع، جدول و CSV UTF-8 با BOM               |
| `/admin/orders/:id/invoice` | فاکتور RTL، لوگو و جزئیات تاریخی، چاپ A5 عمودی و Save as PDF مرورگر                            |

ورودی تاریخ فیلترها صریحاً میلادی است؛ نمایش تاریخ شمسی و مرز روز تهران است. ماه داشبورد ماه شمسی جاری است. درآمد تأییدشده صفر باقی می‌ماند زیرا پرداختی ثبت نشده است؛ مبلغ سفارش با درآمد یکسان فرض نمی‌شود. ارزش و میانگین سفارش، سفارش‌های لغوشده را کنار می‌گذارد؛ تعداد شامل تمام وضعیت‌هاست.

حجم هر صفحه تا ۵۰ رکورد محدود است؛ فهرست‌ها ۲۰ و نقشه ۵۰ رکورد می‌گیرند. نقشه بارگذاری نامحدود همهٔ سفارش‌ها ندارد و تعداد سفارش بدون موقعیت را صریح نشان می‌دهد. adapter فعلی Leaflet/OpenStreetMap و قابل جایگزینی است؛ متن popup با DOM textContent ساخته می‌شود. سرویس tile برای استفادهٔ production تابع سیاست ارائه‌دهنده است.

## یکپارچگی داده

ویرایش محصول با قفل DB و `expectedUpdatedAt` انجام می‌شود؛ نسخهٔ زمان حداقل یک میلی‌ثانیه افزایش می‌یابد تا رقابت در یک میلی‌ثانیه هم قابل تشخیص باشد. نامک تکراری و category نامعتبر رد می‌شوند. محصول دارای OrderItem غیرفعال می‌شود؛ محصول بدون این رابطه hard delete می‌شود و تصاویر cascade هستند. اطلاعات سفارش قبلی تغییر نمی‌کند.

ترتیب تصاویر با ستون `ProductImage.position` ذخیره می‌شود و کاتالوگ، محصول و snapshot checkout همان ترتیب را می‌خوانند. مسیر محلی یا HTTPS بدون credentials برای تصویر مجاز است؛ URL دلخواه در سرور fetch نمی‌شود. تصاویر HTTPS در فروشگاه مستقیم در مرورگر بارگذاری می‌شوند تا وابسته به allowlist بهینه‌ساز Next نباشند؛ باید URL واقعی و پایدار تصویر محصول درج شود. بارگذاری فایل و سرویس storage در این فاز تعریف نشده است. **برای دیده‌شدن تغییرات مدیر در فروشگاه، `CATALOG_SOURCE=api` باید هنگام build فروشگاه تنظیم شود.**

تغییر وضعیت سفارش با قفل رکورد و `expectedStatus` انجام می‌شود؛ هر موفقیت یک OrderStatusEvent ثبت می‌کند. انتقال‌ها: CREATED → PENDING_PAYMENT/CANCELED، PENDING_PAYMENT → PROCESSING/CANCELED، PROCESSING → SHIPPED/CANCELED، SHIPPED → DELIVERED. DELIVERED و CANCELED نهایی هستند. این عملیات تأیید پرداخت نیست.

دو migration افزایشی، AdminSession/OrderStatusEvent و ترتیب تصویر، دادهٔ موجود را حفظ می‌کنند. AdminRefreshToken موجود به خانوادهٔ AdminSession متصل منطقی است و سرویس شناسه/مالک/expiry را کنترل می‌کند.

## چاپ و بررسی

فاکتور از query حفاظت‌شدهٔ جزئیات سفارش استفاده می‌کند. فونت و لوگو قبل از چاپ آماده می‌شوند؛ منو، دکمه و راهنما از چاپ حذف می‌شوند. `@page { size: A5 portrait; margin: 10mm }` و حفظ سطر جدول هنگام page break تعریف شده است. برای PDF واقعی از پنجرهٔ چاپ مرورگر Save as PDF انتخاب کنید؛ برای سفارش طولانی جدول در چند صفحه ادامه می‌یابد. هیچ endpoint عمومی برای فایل شامل نشانی مشتری وجود ندارد.

```sh
npm run codegen
npm run lint
npm run typecheck
npm test
npm run build
npm run format:check
# با Node >= 22.15، DATABASE_URL آزمایشی، MySQL migrated/seeded و Chrome محلی
node --env-file=apps/api/.env scripts/verify-admin-auth.mjs
node --env-file=apps/api/.env scripts/verify-admin-commerce.mjs
node --env-file=apps/api/.env scripts/verify-admin-ui.mjs
```

integrationها سرورهای آزمایشی API۴۰۰۳/فروشگاه۳۰۰۴/پنل۳۰۰۵ را اجرا می‌کنند و فقط fixtureهای خود را پاک می‌کنند؛ هم‌زمان اجرا نکنید. آزمون امنیتی جداسازی نقش/کوکی، Origin، rotation/replay، logout و brute-force را بررسی می‌کند. آزمون commerce اعتبارسنجی، رقابت تغییر محصول/وضعیت، حذف امن، snapshot و گزارش با مرز تهران را پوشش می‌دهد. آزمون UI ورود و reload، CRUD محصول، وضعیت و تاریخچه، نشانگر، جستجوی کاربر، CSV، خطا/retry، عرض‌های ۳۹۰/۷۶۸/۱۴۴۰، خروج چندتب، اتصال تغییر محصول به فروشگاه، تصویر HTTPS و PDF A5 تک‌صفحه و چندصفحه را بررسی می‌کند. فایل PDF و screenshotهای بازبینی در `/tmp/behjati-phase8-*` تولید می‌شوند؛ شامل fixtureهای آزمون هستند و وارد Git نمی‌شوند.

منابع پیاده‌سازی: [Ant Design Table](https://ant.design/components/table/)، [Recharts](https://recharts.github.io/en-US/examples/SimpleLineChart/)، [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)، [MDN اندازه چاپ](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@page/size).
