-- AlterTable
ALTER TABLE `User` ADD COLUMN `acquisitionSource` ENUM('WEBSITE', 'INSTAGRAM', 'IN_PERSON') NOT NULL DEFAULT 'WEBSITE',
    ADD COLUMN `createdByAdminId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Product` ADD COLUMN `shippingAdditionalKgCost` INTEGER NULL,
    ADD COLUMN `shippingBaseCost` INTEGER NULL,
    ADD COLUMN `shippingWeightGrams` INTEGER NULL;

-- AlterTable
ALTER TABLE `Order` ADD COLUMN `createdByAdminEmail` VARCHAR(191) NULL,
    ADD COLUMN `createdByAdminId` VARCHAR(191) NULL,
    ADD COLUMN `offlinePaidAmount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `salesChannel` ENUM('WEBSITE', 'INSTAGRAM', 'IN_PERSON') NOT NULL DEFAULT 'WEBSITE',
    ADD COLUMN `shippingAdditionalKgCost` INTEGER NULL,
    ADD COLUMN `shippingBaseCost` INTEGER NULL,
    ADD COLUMN `shippingMethod` ENUM('POST', 'TIPAX', 'COURIER') NULL DEFAULT 'POST',
    ADD COLUMN `shippingWeightGrams` INTEGER NULL,
    MODIFY `addressId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `OrderItem` ADD COLUMN `shippingWeightGrams` INTEGER NULL;

-- CreateTable
CREATE TABLE `OfflinePayment` (
    `id` VARCHAR(36) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `method` ENUM('CASH', 'POS', 'CARD_TRANSFER') NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `adminEmail` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `OfflinePayment_orderId_createdAt_idx`(`orderId`, `createdAt`),
    INDEX `OfflinePayment_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Order_salesChannel_createdAt_idx` ON `Order`(`salesChannel`, `createdAt`);

-- CreateIndex
CREATE INDEX `Order_shippingMethod_createdAt_idx` ON `Order`(`shippingMethod`, `createdAt`);

-- AddForeignKey
ALTER TABLE `OfflinePayment` ADD CONSTRAINT `OfflinePayment_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

