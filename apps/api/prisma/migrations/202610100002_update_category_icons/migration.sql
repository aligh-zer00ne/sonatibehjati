-- Update the five existing categories without changing products or category membership.
UPDATE `Category` SET `image` = '/images/categories/tahini-icon.png' WHERE `slug` = 'tahini';
UPDATE `Category` SET `image` = '/images/categories/halva-icon.png' WHERE `slug` = 'halva';
UPDATE `Category` SET `title` = 'روغن های خوراکی', `image` = '/images/categories/oil-icon.png' WHERE `slug` = 'oil';
UPDATE `Category` SET `image` = '/images/categories/sweets-icon.png' WHERE `slug` = 'traditional-sweets';
UPDATE `Category` SET `image` = '/images/categories/sesame-icon.png' WHERE `slug` = 'sesame';
