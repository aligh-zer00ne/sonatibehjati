# اتصال www به دامنهٔ اصلی

فروشگاه روی `https://sonatibehjati.ir` باقی می‌ماند. هر دو نشانی HTTP و HTTPSِ `www.sonatibehjati.ir` با پاسخ دائمی 308 به همان مسیر و query در دامنهٔ اصلی منتقل می‌شوند؛ متد درخواست هم حفظ می‌شود. ورود، درگاه و پنل به تغییر نشانی نیاز ندارند.

در بررسی زندهٔ ۲۱ اکتبر ۲۰۲۶، دامنهٔ اصلی، www و app.taghdar.ir همگی به IPv4 برابر `193.242.125.202` رسیدند؛ HTTPSِ www خطای عدم تطابق نام گواهی داشت. کانفیگ‌های قبلی پروژه server_name مربوط به www نداشتند؛ Nginx برای نام ناشناخته، سایت پیش‌فرض همان پورت را انتخاب می‌کند. [مستندات Nginx](https://nginx.org/en/docs/http/request_processing.html)

## دریافت نسخه

با کاربر پروژه، روال معمول دریافت و استقرار را انجام دهید:

```bash
sudo -iu sonatibehjati
cd /var/www/sonatibehjati
git switch dev
git pull --ff-only origin dev && bash deploy/update-production.sh
exit
```

اسکریپت استقرار، Nginx را نصب یا تغییر نمی‌دهد؛ مراحل زیر یک بار با کاربر SSH دارای sudo لازم‌اند. فایل‌های اصلی سایت و سایت‌های دیگر جایگزین نمی‌شوند. این اصلاح به تنظیم پیامک، migration، seed یا restart برنامه‌ها نیاز ندارد؛ اگر همین نسخه قبلاً دریافت و مستقر شده، دریافت/بیلد دوباره لازم نیست.

## فعال‌سازی یک‌باره روی سرور

۱. در DNS، رکورد `www` باید CNAME به `sonatibehjati.ir` یا A به آی‌پی فعلی سرور باشد. فایل‌های آماده مانند کانفیگ فعلی IPv4 هستند؛ رکورد AAAA برای www نگذارید مگر IPv6 و listenهای مربوط را هم پیکربندی کرده باشید.

پیش از نصب، تنظیم فعال را ببینید:

```bash
sudo nginx -T 2>&1 | less
```

نام `www.sonatibehjati.ir` نباید در server block سایت دیگر تعریف شده باشد. اگر تعریف تکراری موجود است، فقط همان نام اشتباه را پس از پشتیبان‌گیری از آن فایل اصلاح کنید؛ سایت app.taghdar.ir را غیرفعال نکنید. با مشاهدهٔ هشدار `conflicting server name` ادامه ندهید، حتی اگر syntax موفق باشد.

۲. ابتدا فقط HTTP را فعال کنید تا Certbot بتواند مالکیت www را بررسی کند. فرمان‌های زیر برای اولین نصب‌اند؛ فایل `sonatibehjati-www.conf` نباید از قبل وجود داشته باشد:

```bash
sudo test ! -e /etc/nginx/sites-available/sonatibehjati-www.conf && \
sudo test ! -L /etc/nginx/sites-available/sonatibehjati-www.conf && \
sudo test ! -e /etc/nginx/sites-enabled/sonatibehjati-www.conf && \
sudo test ! -L /etc/nginx/sites-enabled/sonatibehjati-www.conf && \
sudo install -d -m 755 /var/www/sonatibehjati-acme && \
sudo install -m 644 /var/www/sonatibehjati/deploy/nginx/www-http.conf /etc/nginx/sites-available/sonatibehjati-www.conf && \
sudo ln -s /etc/nginx/sites-available/sonatibehjati-www.conf /etc/nginx/sites-enabled/sonatibehjati-www.conf && \
sudo nginx -t && sudo systemctl reload nginx
```

اگر فایل از قبل هست، محتوایش را بررسی کنید؛ در نصب موفق قبلی این مرحله نیاز به تکرار ندارد. اگر تست Nginx ناموفق شد، reload انجام نمی‌شود؛ خطا را رفع کنید یا فقط symlink جدید این مرحله را طبق بخش بازگشت بردارید.

۳. برای www گواهی جدا بگیرید تا گواهی فعلی فروشگاه/ادمین و دامنه‌های دیگر تغییر نکند:

```bash
sudo certbot certonly --webroot -w /var/www/sonatibehjati-acme \
  --cert-name sonatibehjati-www -d www.sonatibehjati.ir \
  --deploy-hook 'nginx -t && systemctl reload nginx'
```

Certbot باید موفق شود و گواهی را در `/etc/letsencrypt/live/sonatibehjati-www/` بسازد. تا پیش از موفقیت، مرحلهٔ بعد را اجرا نکنید. `certonly --webroot` کانفیگ سایت‌های دیگر را بازنویسی نمی‌کند. hook پس از صدور و تمدید موفق، گواهی را با reload به Nginx می‌رساند. سرویس/تایمر تمدید خودکار Certbot موجود سرور باید فعال بماند. [راهنمای رسمی Certbot](https://eff-certbot.readthedocs.io/en/stable/using.html)

۴. همان فایل HTTP را با نسخهٔ نهایی HTTP+HTTPS جایگزین کنید؛ هر دو قالب را هم‌زمان فعال نکنید:

```bash
sudo install -m 644 /var/www/sonatibehjati/deploy/nginx/www.conf /etc/nginx/sites-available/sonatibehjati-www.conf && \
sudo nginx -t && sudo systemctl reload nginx
```

در HTTPS، اعتبار گواهی قبل از پاسخ redirect بررسی می‌شود؛ به همین دلیل صرفاً افزودن ریدایرکت بدون گرفتن گواهی www کافی نیست. [مستندات HTTPS در Nginx](https://nginx.org/en/docs/http/configuring_https_servers.html)

## بررسی نتیجه

```bash
curl -I 'http://www.sonatibehjati.ir/QR?source=www'
curl -I 'https://www.sonatibehjati.ir/QR?source=www'
curl -IL --max-redirs 3 'https://www.sonatibehjati.ir/'
curl -I https://sonatibehjati.ir/
curl -I https://admin.sonatibehjati.ir/admin
curl -I https://app.taghdar.ir/
sudo certbot renew --cert-name sonatibehjati-www --dry-run
```

دو فرمان اول باید `308` و `Location: https://sonatibehjati.ir/QR?source=www` بدهند. فرمان سوم باید بدون خطای SSL و بدون حلقهٔ انتقال به فروشگاه اصلی برسد. سایت اصلی، پنل و app.taghdar.ir را در مرورگر هم بررسی کنید. از `curl -k` برای تأیید سلامت استفاده نکنید.

## بازگشت تنظیم جدید

اگر بعد از اولین نصب نیاز به غیرفعال کردن این تغییر بود، فقط symlink همین افزونه را بردارید:

```bash
sudo rm /etc/nginx/sites-enabled/sonatibehjati-www.conf
sudo nginx -t && sudo systemctl reload nginx
```

در شکست مرحلهٔ HTTPS می‌توان ابتدا قالب `www-http.conf` را دوباره در همان فایل نصب و پس از تست reload کرد تا HTTP و مسیر تمدید برقرار بمانند. گواهی‌ها و فایل‌های سایت اصلی یا سایت‌های دیگر را حذف نکنید. پس از نصب موفق، دیپلوی‌های معمول به تکرار این مراحل نیاز ندارند.
