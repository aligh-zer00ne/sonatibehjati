UPDATE `Category` SET `title` = 'روغن‌های خوراکی' WHERE `slug` = 'oil';
UPDATE `Category` SET `title` = 'سایر محصولات' WHERE `slug` = 'sesame';

INSERT INTO `Category` (`id`, `slug`, `title`, `image`)
SELECT 'traditional-sweets', 'traditional-sweets', 'شیرینی و محصولات سنتی', '/images/categories/sweets.svg'
WHERE NOT EXISTS (SELECT 1 FROM `Category` WHERE `slug` = 'traditional-sweets');

UPDATE `Category`
SET `title` = 'شیرینی و محصولات سنتی', `image` = '/images/categories/sweets.svg'
WHERE `slug` = 'traditional-sweets';
