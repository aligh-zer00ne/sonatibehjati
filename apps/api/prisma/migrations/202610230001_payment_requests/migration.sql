CREATE TABLE `PaymentRequest` (
  `id` VARCHAR(36) NOT NULL, `key` VARCHAR(64) NOT NULL,
  `requestHash` VARCHAR(64) NOT NULL, `scope` VARCHAR(30) NOT NULL,
  `customerId` VARCHAR(191) NULL, `title` VARCHAR(200) NOT NULL,
  `amount` INTEGER NOT NULL, `payerName` VARCHAR(100) NULL, `payerPhone` VARCHAR(20) NULL,
  `createdByAdminId` VARCHAR(191) NOT NULL, `createdByEmail` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `expiresAt` DATETIME(3) NOT NULL,
  `canceledAt` DATETIME(3) NULL, `paidAt` DATETIME(3) NULL, `acceptedPaymentId` VARCHAR(191) NULL,
  PRIMARY KEY (`id`), UNIQUE INDEX `PaymentRequest_acceptedPaymentId_key` (`acceptedPaymentId`),
  INDEX `PaymentRequest_customerId_createdAt_idx` (`customerId`,`createdAt`),
  INDEX `PaymentRequest_createdAt_idx` (`createdAt`), INDEX `PaymentRequest_paidAt_idx` (`paidAt`),
  CONSTRAINT `PaymentRequest_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `Payment` ADD COLUMN `paymentRequestId` VARCHAR(36) NULL,
  ADD INDEX `Payment_paymentRequestId_createdAt_idx` (`paymentRequestId`,`createdAt`),
  ADD CONSTRAINT `Payment_paymentRequestId_fkey` FOREIGN KEY (`paymentRequestId`) REFERENCES `PaymentRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `CustomerAccountEntry` MODIFY `method` ENUM('CASH','POS','CARD_TRANSFER','CHECK','ONLINE') NOT NULL,
  ADD COLUMN `paymentId` VARCHAR(191) NULL,
  ADD UNIQUE INDEX `CustomerAccountEntry_paymentId_key` (`paymentId`),
  ADD CONSTRAINT `CustomerAccountEntry_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `OfflinePayment` MODIFY `method` ENUM('CASH','POS','CARD_TRANSFER','CHECK','ONLINE') NOT NULL;
