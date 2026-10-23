CREATE TABLE `ShippingSettings` (
 `id` VARCHAR(191) NOT NULL, `data` JSON NOT NULL, `updatedAt` DATETIME(3) NOT NULL,
 PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `Order` ADD COLUMN `shippingPolicySnapshot` JSON NULL;
