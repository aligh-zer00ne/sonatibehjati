ALTER TABLE `OtpCode` ADD COLUMN `sentAt` DATETIME(3) NULL;
CREATE TABLE `AuthThrottle` (
  `key` VARCHAR(64) NOT NULL,
  `count` INTEGER NOT NULL DEFAULT 0,
  `expiresAt` DATETIME(3) NOT NULL,
  INDEX `AuthThrottle_expiresAt_idx` (`expiresAt`),
  PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE TABLE `UserSession` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `revokedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `UserSession_userId_idx` (`userId`),
  INDEX `UserSession_expiresAt_idx` (`expiresAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `UserSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
INSERT INTO `UserSession` (`id`, `userId`, `expiresAt`, `revokedAt`)
SELECT `familyId`, MIN(`userId`), MAX(`expiresAt`), IF(SUM(`revokedAt` IS NULL) > 0, NULL, MAX(`revokedAt`)) FROM `RefreshToken` GROUP BY `familyId`;
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_familyId_fkey` FOREIGN KEY (`familyId`) REFERENCES `UserSession` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
