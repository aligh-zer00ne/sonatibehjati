ALTER TABLE `Order`
  ADD COLUMN `clientRequestId` VARCHAR(36) NULL,
  ADD COLUMN `requestHash` VARCHAR(64) NULL,
  ADD UNIQUE INDEX `Order_userId_clientRequestId_key` (`userId`, `clientRequestId`);
