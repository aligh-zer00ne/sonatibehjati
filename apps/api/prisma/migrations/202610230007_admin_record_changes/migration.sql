CREATE TABLE `AdminRecordChange` (
 `id` VARCHAR(36) NOT NULL, `entityType` VARCHAR(30) NOT NULL,
 `entityId` VARCHAR(191) NOT NULL, `adminId` VARCHAR(191) NOT NULL,
 `adminEmail` VARCHAR(254) NOT NULL, `requestHash` VARCHAR(64) NOT NULL,
 `before` JSON NOT NULL, `after` JSON NOT NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
 PRIMARY KEY (`id`), INDEX `AdminRecordChange_entityType_entityId_createdAt_idx` (`entityType`,`entityId`,`createdAt`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
