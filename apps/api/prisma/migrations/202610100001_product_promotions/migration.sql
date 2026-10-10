ALTER TABLE `Product`
  ADD COLUMN `discountPercent` INTEGER NULL,
  ADD COLUMN `discountTitle` VARCHAR(191) NULL,
  ADD COLUMN `discountStartsAt` DATETIME(3) NULL,
  ADD COLUMN `discountEndsAt` DATETIME(3) NULL;
