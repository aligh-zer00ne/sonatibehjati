ALTER TABLE `ProductImage` ADD COLUMN `position` INTEGER NOT NULL DEFAULT 0;
CREATE INDEX `ProductImage_productId_position_idx` ON `ProductImage`(`productId`, `position`);
