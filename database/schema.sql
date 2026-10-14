-- VENZARO database foundation. Run once on PostgreSQL 15+.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS tenants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
 slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]{3,60}$'),
 status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS vehicles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
 title text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 140),
 brand text NOT NULL,
 model text NOT NULL,
 category text NOT NULL CHECK (category IN ('carro','moto')),
 year integer NOT NULL CHECK (year BETWEEN 1900 AND 2100),
 price_cents bigint NOT NULL CHECK (price_cents > 0),
 mileage integer NOT NULL CHECK (mileage >= 0),
 fuel text NOT NULL,
 transmission text NOT NULL,
 city text NOT NULL,
 description text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS vehicles_tenant_status_idx ON vehicles(tenant_id,status,created_at DESC);
CREATE INDEX IF NOT EXISTS vehicles_public_idx ON vehicles(status,created_at DESC) WHERE status='published';
CREATE TABLE IF NOT EXISTS vehicle_images (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
 url text NOT NULL CHECK (url ~ '^https://'),
 position integer NOT NULL DEFAULT 0 CHECK (position >= 0)
);
CREATE INDEX IF NOT EXISTS vehicle_images_vehicle_idx ON vehicle_images(vehicle_id,position);
-- No default master user or public seed credentials.
