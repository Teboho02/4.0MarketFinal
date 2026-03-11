-- Migration: Add Yoco payment support to orders table
-- Date: 2025-12-06
-- Description: Adds 'yoco' to payment_method enum and adds yoco_checkout_id column

-- Add 'yoco' to payment_method enum
ALTER TABLE orders 
MODIFY COLUMN payment_method enum('cash','card','eft','credit','yoco') NOT NULL;

-- Add yoco_checkout_id column for tracking Yoco checkout sessions
ALTER TABLE orders 
ADD COLUMN yoco_checkout_id VARCHAR(255) DEFAULT NULL AFTER payment_status;

-- Add index for faster lookups by checkout ID
CREATE INDEX idx_yoco_checkout ON orders(yoco_checkout_id);
