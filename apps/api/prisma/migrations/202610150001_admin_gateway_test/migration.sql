ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_orderId_fkey`;
ALTER TABLE `Payment` MODIFY `orderId` VARCHAR(191) NULL, ADD COLUMN `gatewayTestAdminId` VARCHAR(191) NULL;
CREATE INDEX `Payment_gatewayTestAdminId_createdAt_idx` ON `Payment` (`gatewayTestAdminId`, `createdAt`);
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
