# راه‌اندازی همین نسخه به‌صورت پیش‌نمایش خصوصی

این راهنما برای انتخاب تأییدشدهٔ شماست: فروشگاه و پنل با رمز موقت Nginx، حفظ کد ثابت ورود، بدون ارسال پیامک و انتقال کامل داده‌های همین سیستم. کد برنامه، تصاویر، اطلاعات محصول و حساب مدیر تغییر نمی‌کنند. تنظیمات اتصال دیتابیس، دامنه و پورت متناسب با سرور تنظیم می‌شوند.

| بخش     | نشانی / اجرا                                                     |
| ------- | ---------------------------------------------------------------- |
| فروشگاه | `https://sonatibehjati.ir` — Next.js با PM2 روی `127.0.0.1:3100` |
| پنل     | `https://admin.sonatibehjati.ir` — خروجی Vite از طریق Nginx      |
| API     | PM2 روی پورت `4100`، فقط برای دسترسی داخلی                       |
| دیتابیس | یک دیتابیس جدید مخصوص این پروژه، با بازیابی کامل snapshot        |

سرور از همین Nginx موجود استفاده می‌کند. دو سایت فعلی، تنظیمات آن‌ها، نسخهٔ Node آن‌ها و پردازش‌های PM2 آن‌ها دست‌نخورده می‌مانند. دستورها برای Ubuntu، پوستهٔ Bash، یک کاربر SSH دارای sudo و یک کاربر مستقل اجرای پروژه به نام `sonatibehjati` نوشته شده‌اند. جای `SSH_USER` و `SERVER_IP` را با مشخصات خودتان عوض کنید. دسترسی SSH از این محیط در اختیار نیست؛ اجرای مرحله‌های سرور با شماست.

1. **DNS و بررسی سرور — با کاربر SSH روی سرور**

   رکورد A برای `@` و `admin` را به IP سرور متصل کنید. کانفیگ آمادهٔ این راهنما IPv4 است؛ رکورد AAAA این دو نام را حذف کنید، مگر آنکه خودتان listenهای IPv6 را هم به همین کانفیگ اضافه و بررسی کنید. پورت‌های 80 و 443 باید از اینترنت قابل دسترسی باشند. این راهنما نشانی `www` را اضافه نمی‌کند.

   ```bash
   ssh SSH_USER@SERVER_IP
   sudo nginx -t
   sudo ss -ltnp
   free -h
   df -h /var/www
   mysql --version
   sudo ufw status verbose
   sudo nginx -T 2>/dev/null | rg 'server_name|listen'
   ```

   اگر `rg` روی سرور نیست، برای دستور آخر از `grep -E 'server_name|listen'` استفاده کنید. مطمئن شوید پورت‌های 3100 و 4100 و نام‌های دو دامنه قبلاً برای سایت دیگری استفاده نشده‌اند. Build روی سرور به RAM آزاد نیاز دارد؛ در صورت کمبود منابع، ابتدا ظرفیت سرور را بررسی کنید.

   دیتابیس مبدا MySQL 8.4 است. ترجیحاً مقصد هم MySQL 8.4 باشد. اگر MySQL موجود نسخهٔ دیگری است، قبل از ادامه سازگاری بازیابی snapshot را در دیتابیس جدید بررسی کنید؛ برای این پروژه MySQL مشترک دو سایت دیگر را ارتقا ندهید. اگر دیتابیس روی سرور ندارید، ابتدا یک MySQL سازگار با دسترسی داخلی تهیه کنید. دستورهای پایین فرض می‌کنند MySQL از `127.0.0.1:3306` در دسترس است و `sudo mysql` دسترسی مدیریتی محلی دارد؛ اگر سیستم شما متفاوت است، فقط روش اتصال را تطبیق دهید.

2. **ساخت بستهٔ انتقال — در ریشهٔ پروژه روی سیستم فعلی**

   فایل‌های deploy باید ابتدا commit شده باشند؛ آرشیو سورس از `HEAD` ساخته می‌شود. تا پایان export، محصولات و اطلاعات دیتابیس محلی را ویرایش نکنید. ابزارهای `mysqldump` و `mysql` سازگار با نسخهٔ مبدا باید نصب باشند.

   ```bash
   node deploy/export-current-data.mjs
   ```

   ابزار در `.deployment/<زمان-export>/` چهار فایل خصوصی می‌سازد:

   - `current-source.tar.gz`: سورس همان commit و همهٔ تصاویر ثبت‌شده در Git.
   - `current-data.sql.gz`: همهٔ جدول‌ها، اطلاعات و تاریخچهٔ migration، شامل محصولات، تصاویر، کاربران، سفارش‌ها و مدیران.
   - `api.env`: تنظیمات خصوصی فعلی برای حفظ کلیدها و کد ثابت ورود.
   - `counts.json`: تعداد رکوردها برای مقایسه پس از انتقال.

   این مسیر از Git مستثنا شده است. فایل دیتابیس و env را در مخزن، مسیر عمومی وب یا چت قرار ندهید. رمز مدیر موجود از دیتابیس منتقل می‌شود؛ لازم نیست مدیر جدید بسازید.

   روی سرور، فقط برای دریافت فایل‌ها:

   ```bash
   mkdir -m 700 ~/sonatibehjati-transfer
   exit
   ```

   روی سیستم فعلی، مسیر واقعی خروجی export را جایگزین کنید:

   ```bash
   scp .deployment/EXPORT_FOLDER/{current-source.tar.gz,current-data.sql.gz,api.env,counts.json} SSH_USER@SERVER_IP:~/sonatibehjati-transfer/
   ```

3. **مسیر و کاربر مستقل — با کاربر SSH روی سرور**

   ```bash
   ssh SSH_USER@SERVER_IP
   sudo adduser --disabled-password --gecos "" sonatibehjati
   sudo install -d -o sonatibehjati -g sonatibehjati -m 755 /var/www/sonatibehjati
   sudo mv ~/sonatibehjati-transfer /var/www/sonatibehjati-transfer
   sudo chown -R sonatibehjati:sonatibehjati /var/www/sonatibehjati-transfer
   sudo chmod 700 /var/www/sonatibehjati-transfer
   ```

   این مسیرها باید جدید و خالی باشند. اگر از قبل پروژه‌ای در آن‌ها دارید، روی آن overwrite نکنید. Nginx باید بتواند فایل‌های عمومی admin/dist و storefront/public/images را بخواند؛ env و فایل‌های انتقال فقط برای کاربر پروژه قابل خواندن می‌مانند.

4. **ساخت دیتابیس مستقل — با کاربر SSH روی سرور**

   ```bash
   sudo mysql
   ```

   داخل MySQL، یک رمز اختصاصی قوی جای `REPLACE_WITH_NEW_DATABASE_PASSWORD` بگذارید. می‌توانید از یک رمز طولانی شامل حروف و عدد استفاده کنید تا در URL هم نیاز به escape نداشته باشد.

   ```sql
   CREATE DATABASE sonatibehjati CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   CREATE USER 'sonatibehjati'@'localhost' IDENTIFIED BY 'REPLACE_WITH_NEW_DATABASE_PASSWORD';
   GRANT ALL PRIVILEGES ON sonatibehjati.* TO 'sonatibehjati'@'localhost';
   EXIT;
   ```

   بازیابی فقط داخل این دیتابیس جدید انجام می‌شود. نام دیتابیس دو سایت فعلی را در این دستورها وارد نکنید.

5. **انتقال سورس و داده‌ها — با کاربر پروژه**

   از نشست SSH فعلی وارد کاربر پروژه شوید:

   ```bash
   sudo -iu sonatibehjati
   cd /var/www/sonatibehjati
   gzip -t /var/www/sonatibehjati-transfer/current-source.tar.gz
   gzip -t /var/www/sonatibehjati-transfer/current-data.sql.gz
   tar -xzf /var/www/sonatibehjati-transfer/current-source.tar.gz -C /var/www/sonatibehjati
   install -m 600 /var/www/sonatibehjati-transfer/api.env apps/api/.env
   set -o pipefail
   gzip -dc /var/www/sonatibehjati-transfer/current-data.sql.gz | mysql --host=127.0.0.1 --user=sonatibehjati --password sonatibehjati
   nano apps/api/.env
   ```

   `mysql` رمز دیتابیس مقصد را تعاملی می‌پرسد؛ آن را داخل command line ننویسید. در `.env` فقط `DATABASE_URL` را به اتصال مقصد تغییر دهید:

   ```dotenv
   DATABASE_URL="mysql://sonatibehjati:YOUR_DATABASE_PASSWORD@127.0.0.1:3306/sonatibehjati"
   ```

   اگر رمز نویسهٔ ویژه مثل `@` یا `#` دارد، قسمت رمز در URL باید percent-encode شود. سایر کلیدها و `DEV_OTP_CODE` فعلی را حفظ کنید. هیچ‌کدام از دستورهای `db:seed`، `photos:import`، `setup:auth`، `setup:admin` یا `admin:create` را اجرا نکنید؛ snapshot کامل از قبل schema، migration و حساب مدیر را دارد.

6. **Node، وابستگی‌ها و تنظیم محیط — همچنان با کاربر پروژه**

   اگر این کاربر nvm ندارد، روش زیر از [مستندات رسمی nvm](https://github.com/nvm-sh/nvm#installing-and-updating) است و فقط در حساب این کاربر نصب می‌شود:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh -o /tmp/sonatibehjati-nvm-install.sh
   bash /tmp/sonatibehjati-nvm-install.sh
   source ~/.nvm/nvm.sh
   cd /var/www/sonatibehjati
   nvm install
   nvm use
   npm ci
   npm run db:generate
   node deploy/configure-preview-env.mjs
   node deploy/verify-current-data.mjs > /var/www/sonatibehjati-transfer/restored-counts.json
   diff -u /var/www/sonatibehjati-transfer/counts.json /var/www/sonatibehjati-transfer/restored-counts.json
   ```

   `.nvmrc` نسخهٔ Node پروژه را تعیین می‌کند. دستور diff باید بدون اختلاف تمام شود. ابزار تنظیم محیط، کلیدها و OTP را حفظ می‌کند، پیامک را mock نگه می‌دارد و فقط اتصال دامنه‌ها و پورت‌ها را تنظیم می‌کند. فایل‌های storefront و admin با env دامنه ساخته می‌شوند. API برای حفظ رفتار فعلی کد ثابت در `development` اجرا می‌شود؛ فروشگاه با build و `next start` در `production` اجرا می‌شود.

7. **اجرای API و build — با کاربر پروژه**

   ```bash
   npm install -g pm2
   npm run build -w @behjati/api
   pm2 start deploy/ecosystem.config.js --only sonatibehjati-api
   curl -fsS http://127.0.0.1:4100/health
   npm run codegen
   npm run lint
   npm run typecheck
   npm run build
   pm2 start deploy/ecosystem.config.js --only sonatibehjati-storefront
   pm2 status
   curl -I http://127.0.0.1:3100
   pm2 save
   pm2 startup
   command -v node
   ```

   API باید قبل از build فروشگاه بالا باشد تا داده‌های همین دیتابیس در صفحه‌های ساخته‌شده استفاده شوند. فرمان `pm2 startup` یک دستور sudo متناسب با مسیر Node و کاربر پروژه چاپ می‌کند. مسیر خروجی `command -v node` را هم برای مرحلهٔ بعد یادداشت کنید.

   سپس از کاربر پروژه خارج شوید، و با کاربر SSH دارای sudo **همان فرمان چاپ‌شدهٔ PM2** را اجرا کنید:

   ```bash
   exit
   # اینجا دستور sudo چاپ‌شده توسط pm2 startup را اجرا کنید.
   ```

   [PM2](https://pm2.keymetrics.io/docs/usage/startup/) با startup و save، همین دو پردازش را پس از reboot بازمی‌گرداند. پنل خروجی static است و پردازش PM2 جدا لازم ندارد. برای این پروژه هیچ `pm2 restart all` یا `pm2 delete all` اجرا نکنید.

8. **بستن دسترسی مستقیم API — با کاربر SSH روی سرور**

   API نسخهٔ فعلی روی همهٔ interfaceها گوش می‌دهد. برای اینکه رمز پیش‌نمایش قابل دور زدن نباشد، ورودی اینترنتی پورت `4100` باید در firewall فعلی سرور و firewall شرکت میزبان بسته باشد؛ اتصال loopback سرور همچنان لازم است. Next فقط روی `127.0.0.1:3100` گوش می‌دهد.

   اگر UFW هم‌اکنون فعال است و قانون متعارض allow برای 4100 ندارید:

   ```bash
   sudo ufw deny 4100/tcp
   sudo ufw status numbered
   ```

   اگر firewall دیگری استفاده می‌کنید، همین محدودیت را در آن اعمال کنید. UFW غیرفعال را بدون بررسی دسترسی SSH و پورت‌های سایت‌های فعلی فعال یا reset نکنید. از سیستم خودتان این درخواست **نباید به API برسد**:

   ```bash
   curl --connect-timeout 5 http://SERVER_IP:4100/health
   ```

   اگر پاسخ API می‌آید، پیش از انتشار دامنه قانون firewall را اصلاح کنید. این محدودیت برای حالت کد ثابت الزامی است.

9. **Nginx موقت برای گرفتن HTTPS — با کاربر SSH روی سرور**

   این مراحل از Nginx موجود استفاده می‌کنند. اگر ابزار `htpasswd` نیست، فقط بستهٔ مربوط به آن را نصب کنید:

   ```bash
   sudo apt install apache2-utils
   sudo install -d -m 755 /var/www/sonatibehjati-acme
   sudo install -m 644 /var/www/sonatibehjati/deploy/nginx/http.conf /etc/nginx/sites-available/sonatibehjati.conf
   sudo ln -s /etc/nginx/sites-available/sonatibehjati.conf /etc/nginx/sites-enabled/sonatibehjati.conf
   sudo nginx -t
   sudo systemctl reload nginx
   ```

   نام کانفیگ بالا باید جدید باشد. فایل‌های دو سایت فعلی را حذف یا overwrite نکنید. تا دریافت certificate، این کانفیگ فقط ACME challenge را سرو می‌کند و به سایر درخواست‌ها 503 می‌دهد.

   اگر Certbot موجود است، همان را استفاده کنید. اگر نیست، مطابق [راهنمای رسمی Certbot](https://certbot.eff.org/instructions?ws=nginx&os=snap) نسخهٔ مناسب سرور را نصب کنید. سپس:

   ```bash
   sudo certbot certonly --webroot -w /var/www/sonatibehjati-acme --cert-name sonatibehjati-ir -d sonatibehjati.ir -d admin.sonatibehjati.ir
   ```

   Certbot ایمیل و پذیرش شرایط را تعاملی می‌پرسد. این روش فایل‌های Nginx سایت‌های دیگر را تغییر نمی‌دهد. دریافت certificate باید قبل از فعال کردن کانفیگ نهایی موفق شده باشد.

10. **رمز موقت و کانفیگ نهایی — با کاربر SSH روی سرور**

    رمز جداگانهٔ پیش‌نمایش را تعاملی تعیین کنید؛ `preview` نام کاربری این لایه است و با حساب مدیر برنامه تفاوت دارد:

    ```bash
    sudo htpasswd -c /etc/nginx/sonatibehjati-preview.htpasswd preview
    sudo chown root:www-data /etc/nginx/sonatibehjati-preview.htpasswd
    sudo chmod 640 /etc/nginx/sonatibehjati-preview.htpasswd
    ```

    `www-data` کاربر worker متعارف Nginx در Ubuntu است؛ اگر کانفیگ فعلی `user` دیگری دارد، گروه را متناسب با آن تغییر دهید. مسیر کامل Node یادداشت‌شده در مرحلهٔ 7 را جای `FULL_NODE_PATH` بگذارید:

    ```bash
    sudo FULL_NODE_PATH /var/www/sonatibehjati/deploy/render-preview-access.mjs
    sudo install -m 644 /var/www/sonatibehjati/deploy/nginx/site.conf /etc/nginx/sites-available/sonatibehjati.conf
    sudo nginx -t
    sudo systemctl reload nginx
    ```

    خروجی `nginx -t` باید علاوه بر موفقیت syntax، برای این دامنه‌ها بدون هشدار `conflicting server name` باشد. وجود این هشدار یعنی نام دامنه روی همان آدرس و پورت در چند server block فعال تعریف شده است. قبل از reload، طبق بخش عیب‌یابی پایین فایل تکراری را مشخص کنید؛ موفقیت syntax به‌تنهایی به معنی انتخاب کانفیگ موردنظر نیست.

    ابزار سه snippet خصوصی در `/etc/nginx` می‌سازد؛ توکن پیش‌نمایش را چاپ نمی‌کند. [Basic Authentication در Nginx](https://nginx.org/en/docs/http/ngx_http_auth_basic_module.html) صفحات و فایل‌های عمومی را با رمز محافظت می‌کند. پس از ورود صحیح یک cookie محدود یک‌ساعته برای عبور از محافظ پیش‌نمایش صادر می‌شود؛ مسیر API از آن استفاده می‌کند تا هدر `Authorization: Bearer` برنامه به‌درستی عبور کند. پاسخ 401 این cookie را صادر نمی‌کند.

    رمز هر دو دامنه یکی است اما ممکن است مرورگر روی هر دامنه جداگانه آن را بپرسد. برای تمدید دسترسی پس از یک ساعت، صفحه را reload کنید. اجرای دوبارهٔ ابزار snippet توکن را عوض می‌کند و باز کردن مجدد صفحه لازم می‌شود.

11. **بررسی نهایی**

    روی سیستم خودتان، بدون وارد کردن رمز:

    ```bash
    curl -I https://sonatibehjati.ir
    curl -I https://admin.sonatibehjati.ir
    curl -I https://sonatibehjati.ir/api/auth
    curl -I https://admin.sonatibehjati.ir/api/admin
    ```

    دو درخواست اول باید 401 و دو API باید 403 بدهند. سپس هر دو دامنه را در مرورگر باز کنید، با `preview` و رمز تعیین‌شده وارد شوید، و ورود فروشگاه را با همان `DEV_OTP_CODE` موجود امتحان کنید. ورود پنل با حساب و رمز مدیر فعلی است. تصاویر محصولات، چهار عکس هر محصول، اسلایدرها و تعداد داده‌ها را بررسی کنید. دو سایت قبلی را هم باز کنید.

    روی سرور، فرمان‌ها را با کاربر پروژه اجرا کنید:

    ```bash
    sudo -iu sonatibehjati
    source ~/.nvm/nvm.sh
    cd /var/www/sonatibehjati
    pm2 status
    pm2 logs sonatibehjati-api --lines 30 --nostream
    pm2 logs sonatibehjati-storefront --lines 30 --nostream
    node deploy/verify-current-data.mjs
    exit
    ```

    نمایش تعداد رکوردها شامل داده‌های شخصی یا رمز نیست. خروجی لاگ را قبل از اشتراک‌گذاری بررسی کنید. API فعلی محدودکنندهٔ نرخ عمومی مشترک برای درخواست‌های پشت proxy دارد؛ این نسخه برای پیش‌نمایش محدود تیم مناسب است. تنظیم TLS، دسترسی بیرونی پورت API و ورود مرورگر باید روی سرور واقعی هم تأیید شوند.

    صدور مجدد خودکار certificate به timer/cron نصب Certbot وابسته است. چون حالت webroot نیاز به reload بعد از تمدید دارد، با کاربر sudo یک hook مخصوص همین سرور اضافه کنید:

    ```bash
    sudo install -d -m 755 /etc/letsencrypt/renewal-hooks/deploy
    printf '#!/bin/sh\n/usr/sbin/nginx -t && /bin/systemctl reload nginx\n' | sudo tee /etc/letsencrypt/renewal-hooks/deploy/sonatibehjati-nginx-reload >/dev/null
    sudo chmod 755 /etc/letsencrypt/renewal-hooks/deploy/sonatibehjati-nginx-reload
    sudo certbot renew --cert-name sonatibehjati-ir --dry-run
    systemctl list-timers --all | grep -i certbot
    ```

    اگر نصب شما از cron استفاده می‌کند، به‌جای timer همان cron موجود را بررسی کنید. hook فقط Nginx را پس از آزمون موفق reload می‌کند.

بستهٔ اولیهٔ انتقال را در محل خصوصی نگه دارید. این snapshot مربوط به زمان export است؛ ویرایش‌های بعدی سیستم محلی خودکار به سرور منتقل نمی‌شوند. بعد از راه‌اندازی هم از دیتابیس سرور نسخهٔ پشتیبان خصوصی بگیرید. برای انتشار عمومی بعدی، ابتدا تنظیم واقعی پیامک و حالت production API آماده می‌شود و سپس محافظ موقت برداشته خواهد شد.

## عیب‌یابی کانفیگ تکراری و خطای ۵۰۲

هشدار نام تکراری و خطای ۵۰۲ الزاماً یک علت ندارند. هشدار به تعریف تکراری دامنه در listener یکسان مربوط است. برای ۵۰۲ باید خطای اتصال یا پاسخ upstream در لاگ بررسی شود. انتخاب server block بر اساس آدرس، پورت و نام دامنه انجام می‌شود؛ [مستندات Nginx](https://nginx.org/en/docs/http/request_processing.html) این ترتیب را توضیح می‌دهد.

با کاربر SSH دارای sudo، فقط خلاصهٔ تنظیمات فعال را ببینید؛ خروجی کامل `nginx -T` شامل توکن خصوصی پیش‌نمایش است و نباید در چت قرار گیرد:

```bash
sudo nginx -T 2>&1 | grep -E '^# configuration file|^[[:space:]]*(listen|server_name|proxy_pass|root|error_log)[[:space:]]'
ls -l /etc/nginx/sites-enabled/
sudo ss -ltnp
sudo tail -n 30 /var/log/nginx/error.log
curl -I --max-time 5 http://127.0.0.1:3100
curl --max-time 5 http://127.0.0.1:4100/health
```

اگر دستور `error_log` مسیر دیگری تعیین کرده است، لاگ همان virtual host را هم بررسی کنید. پیش از اشتراک‌گذاری لاگ، رمز و توکن احتمالی در URLها را حذف کنید. مسیر فایل هر بخش در خط `# configuration file` مشخص است. فقط تعریف یکسان دامنه روی **همان آدرس و پورت** تکراری محسوب می‌شود؛ وجود یک server block روی 80 و دیگری روی 443 برای همان دامنه طبیعی است. در کنار `sites-enabled`، فایل‌های `conf.d` و includeهای دیگر هم ممکن است تعریف فعال داشته باشند. فایل backup داخل مسیر includeشده هم ممکن است دوباره بارگذاری شود.

کانفیگ نهایی این پروژه باید فروشگاه را به `127.0.0.1:3100` وصل کند. پنل از `apps/admin/dist` به‌صورت static سرو می‌شود و فقط `/api/admin` به `127.0.0.1:4100/graphql` وصل می‌شود. اگر خود صفحهٔ پنل ۵۰۲ می‌دهد، بررسی کنید درخواست واقعاً به همین server block می‌رسد. قبل از رفع تکرار، معلوم کنید فایل قدیمی مختص این پروژه است یا server blockهای سایت‌های دیگر را هم دارد. هیچ فایل ناشناخته یا کانفیگ سایت دیگر را حذف نکنید؛ نسخهٔ پشتیبان باید خارج از مسیر includeهای فعال نگه داشته شود.

برای وضعیت و خطای PM2، از همان کاربری استفاده کنید که پردازش‌ها را اجرا کرده است. اجرای `sudo pm2 status` فهرست کاربر root را نشان می‌دهد و الزاماً وضعیت برنامهٔ این پروژه نیست. اگر کاربر مستقل راهنما را ساخته‌اید:

```bash
sudo -iu sonatibehjati
source ~/.nvm/nvm.sh
cd /var/www/sonatibehjati
node -v
pm2 status
pm2 logs sonatibehjati-storefront --lines 30 --nostream
pm2 logs sonatibehjati-api --lines 30 --nostream
exit
```

اگر اتصال به پورت 3100 یا 4100 رد می‌شود، ابتدا لاگ و وضعیت همان برنامه را بررسی کنید؛ build جدید یا restart بدون شناخت خطا ممکن است علت را پنهان کند. اگر هر دو پورت جواب می‌دهند ولی دامنه هنوز ۵۰۲ دارد، `proxy_pass` فعال و خطای upstream در لاگ تعیین‌کننده‌اند. اگر دو سایت قبلی هم خراب شده‌اند، پورت‌های upstream و PM2 کاربران آن سایت‌ها را جداگانه بررسی کنید؛ هشدار تکرار نام این دامنه به‌تنهایی علت خرابی همهٔ سایت‌ها را ثابت نمی‌کند.

پس از اصلاح **فقط فایل شناسایی‌شده**، `sudo nginx -t` را اجرا کنید. اگر خطا یا هشدار نام تکراری برای این دامنه‌ها باقی است، reload نکنید. بعد از آزمون موفق و بدون آن هشدار، `sudo systemctl reload nginx` و بررسی مجدد هر سه سایت انجام می‌شود. از `pm2 restart all`، `pm2 delete all` و بازنویسی عمومی کانفیگ‌های سرور برای این عیب‌یابی استفاده نکنید.

## بازدید عمومی برای بررسی درگاه، با ورود و ثبت سفارش غیرفعال

این حالت برای انتخاب تأییدشدهٔ بازدید عمومی است: دامنهٔ فروشگاه، محصولات، تصاویر و سبد خرید بدون رمز پیش‌نمایش باز می‌شوند. مسیر `/api/catalog/selection` برای خواندن اطلاعات محصولات سبد خرید باز است. مسیر `/api/auth` پاسخ JSON با وضعیت 503 و پیام فارسی می‌دهد؛ در نتیجه ورود با OTP ثابت، نشست کاربران و عملیات حساب و ثبت سفارش موقتاً در دسترس نیستند. پنل و API مدیر همان محافظ پیش‌نمایش را حفظ می‌کنند. این کانفیگ به‌تنهایی ورود یا پرداخت واقعی را فعال نمی‌کند.

فایل `deploy/nginx/payment-review.conf` برای این حالت آماده است. نیازی به تغییر کد برنامه، داده‌ها، env، build مجدد یا restart پردازش‌های PM2 نیست. محدودیت دسترسی اینترنتی پورت 4100 باید برقرار بماند، چون API داخلی همچنان رفتار توسعه و کد ثابت دارد. برای فعال شدن ورود عمومی بعداً پیامک واقعی و production API تنظیم می‌شوند.

اگر فایل جدید هنوز روی سرور نیست، در ریشهٔ پروژه روی سیستم خودتان آن را منتقل کنید؛ این روش وابسته به push یا pull مخزن نیست:

```bash
scp deploy/nginx/payment-review.conf SSH_USER@SERVER_IP:~/payment-review.conf
```

روی سرور، با همان کاربر SSH دارای sudo، نسخهٔ فعلی کانفیگ را خارج از مسیر includeها نگه دارید و فقط فایل این پروژه را جایگزین کنید:

```bash
sudo install -d -m 700 /root/nginx-backups
sudo cp -a /etc/nginx/sites-available/sonatibehjati.conf "/root/nginx-backups/sonatibehjati.conf-$(date +%Y%m%d-%H%M%S)"
sudo install -m 644 ~/payment-review.conf /etc/nginx/sites-available/sonatibehjati.conf
sudo nginx -t
```

بعد از موفقیت آزمون، و در نبود هشدار تکرار نام دامنه:

```bash
sudo systemctl reload nginx
curl -I --max-time 10 https://sonatibehjati.ir
curl -I --max-time 10 https://admin.sonatibehjati.ir
curl -i --max-time 10 -X POST https://sonatibehjati.ir/api/auth -H 'Content-Type: application/json' --data '{"operation":"RequestOtp","variables":{}}'
```

دامنهٔ اصلی باید بدون هدر WWW-Authenticate باز شود؛ پاسخ متعارف صفحهٔ اصلی 200 است. پنل بدون رمز همچنان 401 می‌دهد. درخواست ورود باید 503 و پیام «ورود و ثبت سفارش تا فعال‌سازی پیامک واقعی موقتاً در دسترس نیست.» بدهد. با پنجرهٔ خصوصی مرورگر فروشگاه، صفحهٔ محصول، افزودن به سبد و تصاویر را بررسی کنید. حساب مدیر بعد از عبور از محافظ پیش‌نمایش همچنان قابل استفاده است.

فایل‌های snippet، htpasswd و certificate موجود را حفظ کنید؛ پنل هنوز از آن‌ها استفاده می‌کند. فایل قدیمی `/etc/nginx/sites-enabled/behjati.conf` که قبلاً باعث تداخل و اتصال به 3000 بود باید غیرفعال بماند. فایل‌های `karinonik` و `landing`، و API سایت قبلی روی پورت 4000، در این تغییر دست‌نخورده می‌مانند.
