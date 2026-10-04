CREATE TABLE `AdminSession` (
  `id` VARCHAR(191) NOT NULL, `adminId` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL, `revokedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`), INDEX `AdminSession_adminId_idx` (`adminId`), INDEX `AdminSession_expiresAt_idx` (`expiresAt`),
  CONSTRAINT `AdminSession_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `OrderStatusEvent` (
  `id` VARCHAR(191) NOT NULL, `orderId` VARCHAR(191) NOT NULL, `adminId` VARCHAR(191) NOT NULL,
  `fromStatus` ENUM('CREATED','PENDING_PAYMENT','PROCESSING','SHIPPED','DELIVERED','CANCELED') NOT NULL,
  `toStatus` ENUM('CREATED','PENDING_PAYMENT','PROCESSING','SHIPPED','DELIVERED','CANCELED') NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`), INDEX `OrderStatusEvent_orderId_createdAt_idx` (`orderId`,`createdAt`),
  CONSTRAINT `OrderStatusEvent_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `OrderStatusEvent_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `Admin` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
