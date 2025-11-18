-- Minimal demo seed data for POS

INSERT INTO categories (id, name)
VALUES 
  (gen_random_uuid(), 'Drinks'),
  (gen_random_uuid(), 'Food'),
  (gen_random_uuid(), 'Dessert'),
  (gen_random_uuid(), 'Other')
ON CONFLICT (name) DO NOTHING;

-- Pick category ids dynamically to keep idempotent
WITH cat AS (
  SELECT id, name FROM categories WHERE name IN ('Drinks','Food','Dessert','Other')
)
INSERT INTO products (id, name, sku, price, image_url, category_id)
VALUES
  -- Drinks (5)
  (gen_random_uuid(), 'Americano', 'AMR-001', 65.00, NULL, (SELECT id FROM cat WHERE name='Drinks')),
  (gen_random_uuid(), 'Latte', 'LAT-001', 75.00, NULL, (SELECT id FROM cat WHERE name='Drinks')),
  (gen_random_uuid(), 'Cappuccino', 'CAP-001', 80.00, NULL, (SELECT id FROM cat WHERE name='Drinks')),
  (gen_random_uuid(), 'Thai Tea', 'THT-001', 60.00, NULL, (SELECT id FROM cat WHERE name='Drinks')),
  (gen_random_uuid(), 'Espresso', 'ESP-001', 55.00, NULL, (SELECT id FROM cat WHERE name='Drinks')),
  -- Food (5)
  (gen_random_uuid(), 'Fried Rice', 'FRD-001', 95.00, NULL, (SELECT id FROM cat WHERE name='Food')),
  (gen_random_uuid(), 'Pad Thai', 'PDT-001', 105.00, NULL, (SELECT id FROM cat WHERE name='Food')),
  (gen_random_uuid(), 'French Fries', 'FRI-001', 45.00, NULL, (SELECT id FROM cat WHERE name='Food')),
  (gen_random_uuid(), 'Fried Egg', 'EGG-001', 20.00, NULL, (SELECT id FROM cat WHERE name='Food')),
  (gen_random_uuid(), 'Green Curry Chicken', 'GRC-001', 120.00, NULL, (SELECT id FROM cat WHERE name='Food')),
  (gen_random_uuid(), 'Tom Yum Noodles', 'TOM-001', 110.00, NULL, (SELECT id FROM cat WHERE name='Food')),
  (gen_random_uuid(), 'Basil Pork Rice', 'BAS-001', 85.00, NULL, (SELECT id FROM cat WHERE name='Food')),
  -- Dessert (5)
  (gen_random_uuid(), 'Mango Sticky Rice', 'MSR-001', 85.00, NULL, (SELECT id FROM cat WHERE name='Dessert')),
  (gen_random_uuid(), 'Brownie', 'BRW-001', 55.00, NULL, (SELECT id FROM cat WHERE name='Dessert')),
  (gen_random_uuid(), 'Coconut Ice Cream', 'CCI-001', 45.00, NULL, (SELECT id FROM cat WHERE name='Dessert')),
  (gen_random_uuid(), 'Custard Bread', 'CST-001', 40.00, NULL, (SELECT id FROM cat WHERE name='Dessert')),
  (gen_random_uuid(), 'Cheesecake', 'CHS-001', 95.00, NULL, (SELECT id FROM cat WHERE name='Dessert')),
  -- Other (5)
  (gen_random_uuid(), 'Bottle Water', 'BTW-001', 20.00, NULL, (SELECT id FROM cat WHERE name='Other')),
  (gen_random_uuid(), 'Sparkling Water', 'SPW-001', 35.00, NULL, (SELECT id FROM cat WHERE name='Other')),
  (gen_random_uuid(), 'Orange Juice (Bottle)', 'OJB-001', 45.00, NULL, (SELECT id FROM cat WHERE name='Other')),
  (gen_random_uuid(), 'Potato Chips', 'PTC-001', 30.00, NULL, (SELECT id FROM cat WHERE name='Other')),
  (gen_random_uuid(), 'Paper Napkins', 'NPK-001', 15.00, NULL, (SELECT id FROM cat WHERE name='Other'))
ON CONFLICT (sku) DO NOTHING;

-- Insert an example combo set and its option group (Side: Fries/Fried Egg)
WITH p AS (
  SELECT id AS food_cat FROM categories WHERE name='Food'
)
INSERT INTO products (id, name, sku, price, image_url, category_id, is_combo)
VALUES
  (gen_random_uuid(), 'Set 1 - Fried Chicken Combo', 'SET-001', 159.00, NULL, (SELECT food_cat FROM p), true)
ON CONFLICT (sku) DO NOTHING;

-- Create combo group for 'Set 1'
WITH combo AS (
  SELECT id FROM products WHERE sku='SET-001'
), fries AS (
  SELECT id FROM products WHERE sku='FRI-001'
), egg AS (
  SELECT id FROM products WHERE sku='EGG-001'
)
INSERT INTO combo_groups (id, product_id, name, min_select, max_select, required, sort_order)
VALUES (gen_random_uuid(), (SELECT id FROM combo), 'Side', 1, 1, true, 0)
ON CONFLICT (product_id, name) DO NOTHING;

-- Options for the 'Side' group
WITH g AS (
  SELECT cg.id FROM combo_groups cg JOIN products p ON p.id = cg.product_id WHERE p.sku='SET-001' AND cg.name='Side'
), fries AS (
  SELECT id FROM products WHERE sku='FRI-001'
), egg AS (
  SELECT id FROM products WHERE sku='EGG-001'
)
INSERT INTO combo_group_options (id, group_id, item_product_id, upcharge, is_default, sort_order)
VALUES
  (gen_random_uuid(), (SELECT id FROM g), (SELECT id FROM fries), 0.00, true, 0),
  (gen_random_uuid(), (SELECT id FROM g), (SELECT id FROM egg),   0.00, false, 1)
ON CONFLICT (group_id, item_product_id) DO NOTHING;
