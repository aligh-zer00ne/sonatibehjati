-- Shipping methods become store-defined codes (POST, CHAPAR, TIPAX, COURIER and CUSTOM_*).
-- Existing enum values convert to the same text, so historical orders keep their carrier.
ALTER TABLE `Order` MODIFY `shippingMethod` VARCHAR(40) NULL DEFAULT 'POST';
