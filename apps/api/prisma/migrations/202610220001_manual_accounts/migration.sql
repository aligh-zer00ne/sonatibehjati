ALTER TABLE `OrderItem`
  ADD COLUMN `lineSubtotal` INTEGER NULL,
  ADD COLUMN `discountAmount` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `discountPercent` DOUBLE NULL;
UPDATE `OrderItem` SET `lineSubtotal` = `lineTotal`;
ALTER TABLE `OfflinePayment`
  MODIFY `method` ENUM('CASH', 'POS', 'CARD_TRANSFER', 'CHECK') NOT NULL,
  ADD COLUMN `accountEntryId` VARCHAR(36) NULL,
  ADD COLUMN `voided` BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE `CustomerAccountEntry` (
  `id` VARCHAR(36) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `direction` ENUM('RECEIPT', 'PAYMENT') NOT NULL,
  `amount` INTEGER NOT NULL,
  `remaining` INTEGER NOT NULL DEFAULT 0,
  `method` ENUM('CASH', 'POS', 'CARD_TRANSFER', 'CHECK') NOT NULL,
  `note` VARCHAR(500) NULL,
  `chequeNumber` VARCHAR(60) NULL,
  `chequeBank` VARCHAR(100) NULL,
  `chequeDueDate` DATETIME(3) NULL,
  `adminId` VARCHAR(191) NOT NULL,
  `adminEmail` VARCHAR(191) NOT NULL,
  `requestHash` VARCHAR(64) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  INDEX `CustomerAccountEntry_userId_createdAt_idx` (`userId`, `createdAt`),
  INDEX `CustomerAccountEntry_createdAt_idx` (`createdAt`),
  CONSTRAINT `CustomerAccountEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
INSERT INTO `CustomerAccountEntry` (`id`,`userId`,`direction`,`amount`,`remaining`,`method`,`adminId`,`adminEmail`,`requestHash`,`createdAt`)
SELECT p.`id`,o.`userId`,'RECEIPT',p.`amount`,IF(o.`status`='CANCELED',p.`amount`,0),p.`method`,p.`adminId`,p.`adminEmail`,SHA2(CONCAT('legacy:',p.`id`),256),p.`createdAt`
FROM `OfflinePayment` p JOIN `Order` o ON o.`id`=p.`orderId`;
UPDATE `OfflinePayment` p JOIN `Order` o ON o.`id`=p.`orderId`
SET p.`accountEntryId`=p.`id`,p.`voided`=(o.`status`='CANCELED');
CREATE INDEX `OfflinePayment_accountEntryId_idx` ON `OfflinePayment` (`accountEntryId`);
ALTER TABLE `OfflinePayment` ADD CONSTRAINT `OfflinePayment_accountEntryId_fkey` FOREIGN KEY (`accountEntryId`) REFERENCES `CustomerAccountEntry` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
