ALTER TABLE `Order` ADD COLUMN `paidAt` DATETIME(3) NULL;
CREATE TABLE `Payment` (
 `id` VARCHAR(191) NOT NULL, `orderId` VARCHAR(191) NOT NULL,
 `status` ENUM('CREATING','READY','TOKEN_FAILED','CANCELED','FAILED','EXPIRED','VERIFYING','VERIFY_PENDING','SUCCEEDED','REFUND_PENDING','REFUNDING','REVERSED','REVIEW_REQUIRED') NOT NULL DEFAULT 'CREATING',
 `amountRials` BIGINT NOT NULL, `terminalId` VARCHAR(20) NOT NULL, `callbackKey` VARCHAR(64) NOT NULL, `sessionKey` INTEGER NOT NULL,
 `token` VARCHAR(512) NULL, `refNum` VARCHAR(100) NULL, `traceNumber` VARCHAR(100) NULL, `rrn` VARCHAR(100) NULL,
 `resultCode` INTEGER NULL, `reason` VARCHAR(50) NULL,
 `expiresAt` DATETIME(3) NOT NULL, `leaseUntil` DATETIME(3) NULL, `retryAt` DATETIME(3) NULL, `verifiedAt` DATETIME(3) NULL,
 `acceptedAt` DATETIME(3) NULL, `reversedAt` DATETIME(3) NULL,
 `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `updatedAt` DATETIME(3) NOT NULL,
 PRIMARY KEY (`id`), INDEX `Payment_orderId_createdAt_idx` (`orderId`,`createdAt`), INDEX `Payment_status_retryAt_idx` (`status`,`retryAt`), INDEX `Payment_refNum_idx` (`refNum`),
 CONSTRAINT `Payment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `PaymentReference` (
 `refNum` VARCHAR(100) NOT NULL, `paymentId` VARCHAR(191) NOT NULL, `amountRials` BIGINT NOT NULL,
 `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY (`refNum`), UNIQUE INDEX `PaymentReference_paymentId_key` (`paymentId`),
 CONSTRAINT `PaymentReference_paymentId_fkey` FOREIGN KEY (`paymentId`) REFERENCES `Payment` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
