ALTER TABLE `Admin` ADD COLUMN `permissions` JSON NULL;
UPDATE `Admin` SET `permissions` = JSON_ARRAY('ORDERS', 'ORDER_MAP', 'PRODUCTS', 'TICKETS', 'REVIEWS') WHERE `role` = 'STAFF';
CREATE TABLE `HomepageContent` (
  `id` VARCHAR(191) NOT NULL,
  `data` JSON NOT NULL,
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
