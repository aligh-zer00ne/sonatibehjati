# تصاویر واقعی محصولات سنتی بهجتی

منبع: ۷۶ عکس JPG ارائه‌شدهٔ کاربر در `/home/zer00ne/Downloads/تصاویر محصولات`؛ فایل‌های دوربین دست‌نخورده باقی مانده‌اند. تصاویر منتخب با ابزار داخلی `imagegen`، در حالت ویرایش و خروجی شفاف، برای کارت‌ها و گالری‌ها آماده شدند؛ CLI یا سرویس خارجی دیگری استفاده نشده است. تبدیل نهایی به WebP با Sharp، کیفیت ۹۲ و alphaQuality برابر ۱۰۰ انجام شده است.

## انتخاب عکس‌ها

| فایل مصرفی در `apps/storefront/public/images/products/` | محصول              | عکس اصلی                      | نمای دوم                      |
| ------------------------------------------------------- | ------------------ | ----------------------------- | ----------------------------- |
| tahini-blue.webp                                        | ارده کنجدی         | ارده/DSC00385.JPG             | ارده/DSC00386.JPG             |
| halva-classic.webp                                      | حلواارده سنتی      | حلواارده/DSC00373.JPG         | حلواارده/DSC00388.JPG         |
| sesame-oil-glass.webp                                   | روغن کنجد شیشه‌ای  | روغن کنجد/DSC00358.JPG        | روغن کنجد/DSC00360.JPG        |
| premium-tahini.webp                                     | ارده ممتاز         | ارده/DSC00382.JPG             | ارده/DSC00384.JPG             |
| chocolate-tahini.webp                                   | ارده شکلاتی        | ارده شکلاتی/DSC00380.JPG      | ارده شکلاتی/DSC00381.JPG      |
| hazelnut-tahini.webp                                    | ارده فندقی         | ارده فندقی/DSC00335.JPG       | ارده فندقی/DSC00337.JPG       |
| tahini-cream.webp                                       | کرم ارده           | کرم ارده/DSC00390.JPG         | فقط یک عکس موجود است          |
| pistachio-halva.webp                                    | حلواارده پسته‌ای   | حلواارده پسته ای/DSC00413.JPG | حلواارده پسته ای/DSC00411.JPG |
| tahini-sweets.webp                                      | شیرینی ارده‌ای     | شیرینی ارده ای/DSC00344.JPG   | شیرینی ارده ای/DSC00345.JPG   |
| sesame-seeds.webp                                       | کنجد بسته‌بندی     | کنجد بسته بندی/DSC00353.JPG   | کنجد بسته بندی/DSC00354.JPG   |
| sesame-oil-one-liter.webp                               | روغن کنجد یک لیتری | روغن کنجد/DSC00363.JPG        | روغن کنجد/DSC00366.JPG        |
| sesame-oil-family.webp                                  | روغن کنجد خانواده  | روغن کنجد/DSC00351.JPG        | روغن کنجد/DSC00346.JPG        |

نماهای دوم در زیرپوشهٔ `gallery/` قرار دارند. نسخه‌های کوچک‌شدهٔ عکس دوربین برای مقایسهٔ نوشته‌ها، با زمینهٔ اصلی، در `reference/` حفظ شده‌اند؛ این پوشه در UI مصرف نمی‌شود. ویرایش مولد ممکن است جزئیات ریز چاپ را بازسازی کند؛ مبنای خواندن مشخصات، بارکد و تاریخ، عکس دوربین است. متن مشخصات محصول از چاپ بازسازی‌شده استخراج نشده است.

## صفحهٔ اصلی

فایل‌های مصرفی در `apps/storefront/public/images/home/`:

- `tahini-family.webp`: عکس گروهی ارده ها/DSC00395.JPG؛ هیرو و لایهٔ محصول در بخش اردکان.
- `oil-family.webp`: عکس گروهی روغن ها/DSC00372.JPG؛ هیرو.
- `flavored-family.webp`: عکس گروهی ارده های طعم دار/DSC00393.JPG؛ هیرو. در بخش داستان، تصاویر تکی ارده شکلاتی، کرم ارده و ارده فندقی در نوار مستقلی زیر کاسه نمایش داده می‌شوند.
- `tahini-pour.webp`: ارده/DSC00407.JPG؛ قاشق، ریزش ارده و کاسهٔ آبی در داستان برند.
- `ardakan-courtyard.webp`: فضاسازی معماری تولیدشده با imagegen؛ عکس مستند یک بنای تاریخی مشخص نیست. محصولات واقعی به‌صورت لایهٔ مستقل HTML روی آن نمایش داده می‌شوند.

سه تصویر هیرو و معماری ۱۵۳۶×۱۰۲۴ هستند. کارت‌ها حداکثر ۱۲۰۰×۱۲۰۰ و تصویر ریزش ارده ۱۱۲۲×۱۴۰۲ است. بسته‌بندی‌ها با object-contain نمایش داده می‌شوند تا در و برچسب بریده نشود. رنگ و سایهٔ زمینه و نقش‌های کنجد با className و اجزای موجود سایت تعریف شده‌اند.

## تعریف و ورود محصولات

تعریف مشترک کاتالوگ در `packages/shared/src/photo-catalog.ts` است. طبق اجازهٔ کاربر، وزن و قیمت محصولات جدید موقت‌اند؛ قیمت و وزن رکوردهای موجود هنگام ورود دوباره بازنویسی نمی‌شوند. مدیران می‌توانند همهٔ این فیلدها و تصاویر را از صفحهٔ محصولات پنل تغییر دهند.

```sh
NODE_ENV=development npm run photos:import
```

این دستور تنها در توسعه اجرا می‌شود، وجود فایل‌های لازم را پیش از هر تغییر بررسی می‌کند، از کاتالوگ فعلی در پوشهٔ خصوصی و ignored به نام `apps/api/.photo-import-backups/` پشتیبان می‌گیرد و تغییرات را در یک تراکنش ثبت می‌کند. اجرای دوباره محصول یا تصویر تکراری ایجاد نمی‌کند. فقط تصاویر placeholder شناخته‌شده جایگزین می‌شوند؛ تصاویر و فیلدهای ویرایش‌شدهٔ مدیر حفظ می‌شوند. نمونه‌های دست‌نخوردهٔ قدیمی و دو نمونهٔ بدون عکس متناظر، با حفظ رکورد و ارجاع سفارش، غیرفعال می‌شوند. اردهٔ شکلاتی یک محصول مستقل است و به نام حلوااردهٔ شکلاتی ثبت نشده است.

## پرامپت‌ها

پرامپت مشترک تصاویر اصلی، با تأکیدهای ویژهٔ حذف پس‌زمینهٔ داخل دسته در روغن‌ها و حذف محصولات پشت‌صحنه در حلواارده:

```text
Use case: background-extraction. Asset type: transparent ecommerce product photograph. Remove ONLY the room/tabletop/background/extra products, cast shadows and reflections. Preserve EXACT foreground photographed product, original angle, geometry, contents, cap, colors, Persian and English label and logo; do not redraw packaging or reconstruct text. Center complete product with 10 percent margin on a square truly transparent RGBA canvas. Clean realistic edges including clear plastic. No added objects or watermark. Photo extraction, not a redesigned mockup.
```

پرامپت نماهای دوم:

```text
Use case: background-extraction. Asset type: second transparent ecommerce product photograph for the same product gallery. Edit target supplied photograph, already visually inspected in photo contact sheet. Remove ONLY the entire room/tabletop/cast shadow/reflections outside the product. Preserve the complete EXACT photographed foreground product, original angle, cap, clear packaging, contents, all printed Persian and English text, original label colors and logos without repainting. Do not rotate, redesign or invent packages or text. Center the complete uncut subject with 10 percent margin on a square truly transparent RGBA canvas. Carefully remove disconnected stray white pixels and background specks; smooth natural edges. No objects or watermark.
```

پرامپت عکس‌های گروهی:

```text
Use case: background-extraction. Asset type: transparent website hero photograph of a real product family. Edit target supplied photograph. Remove ONLY entire room, wall and tabletop, surrounding shadows and reflections. Preserve ALL original photographed product packages, their number, relative sizes, camera perspective, colors, caps, labels and logos verbatim without repainting/reconstructing. Do not change packaging design, invent products or add props. Keep every original bottle/jar fully visible, as a centered group with 8 percent breathing room on a landscape 3:2 truly transparent RGBA canvas. Clean antialiased silhouette including handle holes. No additional text or watermark.
```

اصلاح تک‌مرحله‌ای عکس‌های گروهی:

```text
Use case: background-extraction. Edit target: this previous cutout image. Single targeted correction: REMOVE ALL colored glow, halo, light bloom, background colors and soft shadows surrounding the product group. Everything outside the physical jar/bottle silhouettes MUST have alpha exactly 0, including gaps and handle holes. This is a hard clean studio photo cutout, not a glowing graphic. Keep the product pixels/labels, relative arrangement, perspective, package count, sizes and canvas dimensions unchanged. Do not redraw text, add glow, relight, invent or modify any product. Preserve realistic antialiasing only at the immediate physical edge. Genuine transparent RGBA output, NOT black background.
```

پرامپت داستان برند:

```text
Use case: background-extraction. Asset type: transparent photographic cutout for a Persian sesame shop brand story section. Edit target: supplied photograph. Keep the EXACT photographed dark blue ceramic bowl with pale creamy tahini, continuous falling tahini stream and the original silver spoon. Remove the hand, all room/background and stainless steel countertop including reflections and shadows. Do not invent, thicken or redesign bowl, contents, spoon or stream. Frame the bowl toward the bottom and spoon above, complete scene centered, portrait 4:5 transparent RGBA canvas with safe margin and clean edges. Genuine transparency around and between objects. No props, labels, typography or watermark. Preserve realistic original food texture.
```

پرامپت معماری:

```text
Use case: photorealistic-natural. Asset type: high-resolution decorative architecture photograph for a traditional Persian sesame product storefront heritage section. Landscape 3:2, at least 1536x1024. A beautiful sunlit ochre mud-brick courtyard evoking Ardakan, Iran: understated traditional rectangular Persian windcatcher above softly weathered adobe walls, simple arched passage, natural desert sky, warm late afternoon honey light, authentic local materials without fantasy ornament. Composition architecture concentrated upper half and edges; foreground is an empty broad warm sandy stone ledge in the lower third, reserved for real product cutouts added later in HTML. No product packages, no people, no signs, no text, no logos, no watermark. Refined architectural editorial photography, realistic believable proportions, crisp detail, warm cream and clay palette. This is decorative imagery evoking Ardakan, not documentation of a named historical monument.
```
