-- Check current product prices
SELECT id, name, price, pricePerMl FROM product;

-- Fix products with zero or null prices
-- Example: Set pricePerMl to 350 (Rp 350/ml) and price to 35000 (for 100ml bottle)
UPDATE product 
SET 
    pricePerMl = CASE 
        WHEN pricePerMl IS NULL OR pricePerMl = 0 THEN 350 
        ELSE pricePerMl 
    END,
    price = CASE 
        WHEN price IS NULL OR price = 0 THEN 35000 
        ELSE price 
    END
WHERE pricePerMl IS NULL OR pricePerMl = 0 OR price IS NULL OR price = 0;

-- Verify the update
SELECT id, name, price, pricePerMl FROM product;
