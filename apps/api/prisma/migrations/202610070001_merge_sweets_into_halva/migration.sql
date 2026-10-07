-- «حلواارده شکری» is a halva product. Move every remaining product out of
-- the obsolete sweets category before removing that category.
UPDATE `Product` AS p
INNER JOIN `Category` AS old_category
  ON old_category.`id` = p.`categoryId`
  AND old_category.`slug` = 'sweets'
INNER JOIN `Category` AS halva_category
  ON halva_category.`slug` = 'halva'
SET p.`categoryId` = halva_category.`id`;

-- Preserve any administrator-defined title and only repair the known old names.
UPDATE `Product`
SET `title` = 'حلواارده شکری'
WHERE `slug` = 'tahini-sweets-500'
  AND `title` IN ('شیرینی ارده‌ای', 'شیرینی ارده ای');

DELETE FROM `Category`
WHERE `slug` = 'sweets';
