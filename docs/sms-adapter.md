# آداپتور پیامک ملی‌پیامک

منبع پیاده‌سازی نمونهٔ `SmsService.ts` ارائه‌شده توسط کاربر از مسیر `/home/zer00ne/Downloads/Telegram Desktop/SmsService.ts` است. فایل اصلی شامل NestJS بود؛ آداپتور Express پروژه در `apps/api/src/services/meliPayamakSms.ts` همان قرارداد قالب پیامک را پشت interface مستقل `SMSService.sendOTP` اجرا می‌کند.

درخواست HTTPS به `console.melipayamak.com:443/api/send/shared/{apiKey}` با بدنهٔ `{ to, bodyId, args: [code] }` می‌رود. کلید، مسیر و شناسهٔ الگو در constructor تنظیم می‌شوند. timeout ده ثانیه، رد redirect، بررسی `recId` مثبت و خطای عمومی بدون افشای پاسخ/کلید حفظ شده‌اند. تست‌ها fetch کنترل‌شده دارند و پیامک واقعی ارسال نمی‌کنند. کلید و شناسهٔ الگوی واقعی هنوز ارائه نشده‌اند.

استفاده در احراز هویت و متغیرهای محیطی در `docs/phase5.md` توضیح داده می‌شوند.
