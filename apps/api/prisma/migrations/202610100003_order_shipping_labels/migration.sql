CREATE TABLE `OrderShippingLabel` (
  `orderId` VARCHAR(191) NOT NULL,
  `data` JSON NOT NULL,
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`orderId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `OrderShippingLabel` ADD CONSTRAINT `OrderShippingLabel_orderId_fkey`
  FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
