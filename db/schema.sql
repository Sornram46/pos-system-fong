-- POS System Database Schema (PostgreSQL / Neon)
-- Safe to run multiple times thanks to IF NOT EXISTS guards where possible.

-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto; -- for gen_random_uuid()

-- Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('paid', 'refunded', 'void');
  END IF;
END $$;

-- Tables
CREATE TABLE IF NOT EXISTS categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  sku          text NOT NULL UNIQUE,
  price        numeric(10,2) NOT NULL CHECK (price >= 0),
  image_url    text,
  category_id  uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  is_combo     boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  phone       text UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number      text NOT NULL UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  status      order_status NOT NULL DEFAULT 'paid',
  subtotal    numeric(10,2) NOT NULL CHECK (subtotal >= 0),
  tax         numeric(10,2) NOT NULL CHECK (tax >= 0),
  total       numeric(10,2) NOT NULL CHECK (total >= 0),
  customer_id uuid REFERENCES customers(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  qty         int NOT NULL CHECK (qty > 0),
  price       numeric(10,2) NOT NULL CHECK (price >= 0), -- unit price at time of sale
  product_id  uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  order_id    uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  CONSTRAINT order_items_unique_per_product UNIQUE (order_id, product_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products((lower(name)));
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Simple helpers (optional): view for order totals detail
CREATE OR REPLACE VIEW v_order_summary AS
SELECT 
  o.id,
  o.number,
  o.created_at,
  o.status,
  o.subtotal,
  o.tax,
  o.total,
  c.name AS customer_name
FROM orders o
LEFT JOIN customers c ON c.id = o.customer_id;

-- Combo set support
CREATE TABLE IF NOT EXISTS combo_groups (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name         text NOT NULL,
  min_select   int  NOT NULL DEFAULT 1 CHECK (min_select >= 0),
  max_select   int  NOT NULL DEFAULT 1 CHECK (max_select >= 0),
  required     boolean NOT NULL DEFAULT true,
  sort_order   int  NOT NULL DEFAULT 0,
  CONSTRAINT combo_groups_unique_name UNIQUE (product_id, name)
);

CREATE TABLE IF NOT EXISTS combo_group_options (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        uuid NOT NULL REFERENCES combo_groups(id) ON DELETE CASCADE,
  item_product_id uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  upcharge        numeric(10,2) NOT NULL DEFAULT 0 CHECK (upcharge >= 0),
  is_default      boolean NOT NULL DEFAULT false,
  sort_order      int  NOT NULL DEFAULT 0,
  CONSTRAINT combo_group_options_unique UNIQUE (group_id, item_product_id)
);

CREATE INDEX IF NOT EXISTS idx_combo_groups_product ON combo_groups(product_id);
CREATE INDEX IF NOT EXISTS idx_combo_group_options_group ON combo_group_options(group_id);

-- Track chosen components for a combo in orders
CREATE TABLE IF NOT EXISTS order_item_components (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_order_item_id  uuid NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
  product_id            uuid NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  qty                   int NOT NULL DEFAULT 1 CHECK (qty > 0),
  unit_price            numeric(10,2) NOT NULL DEFAULT 0 CHECK (unit_price >= 0),
  upcharge              numeric(10,2) NOT NULL DEFAULT 0 CHECK (upcharge >= 0),
  note                  text
);

CREATE INDEX IF NOT EXISTS idx_order_item_components_parent ON order_item_components(parent_order_item_id);
