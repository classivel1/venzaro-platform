import {getPool} from "./db";
let initialized:Promise<void>|undefined;
export function ensureSchema():Promise<void>{
 if(!initialized)initialized=(async()=>{
 const client=await getPool().connect();
 try{
 await client.query("BEGIN");
 await client.query(`CREATE TABLE IF NOT EXISTS tenants (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL CHECK (char_length(name) BETWEEN 2 AND 120),
 slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]{3,60}$'),
 status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
 created_at timestamptz NOT NULL DEFAULT now())`);
 await client.query(`CREATE TABLE IF NOT EXISTS vehicles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
 title text NOT NULL CHECK (char_length(title) BETWEEN 5 AND 140),
 brand text NOT NULL,model text NOT NULL,
 category text NOT NULL CHECK (category IN ('carro','moto')),
 year integer NOT NULL CHECK (year BETWEEN 1900 AND 2100),
 price_cents bigint NOT NULL CHECK (price_cents > 0),
 mileage integer NOT NULL CHECK (mileage >= 0),
 fuel text NOT NULL,transmission text NOT NULL,city text NOT NULL,
 description text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now())`);
 await client.query("CREATE INDEX IF NOT EXISTS vehicles_tenant_status_idx ON vehicles(tenant_id,status,created_at DESC)");
 await client.query("CREATE INDEX IF NOT EXISTS vehicles_public_idx ON vehicles(status,created_at DESC) WHERE status='published'");
 await client.query(`CREATE TABLE IF NOT EXISTS vehicle_images (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
 url text NOT NULL CHECK (url ~ '^https://'),
 position integer NOT NULL DEFAULT 0 CHECK (position >= 0))`);
 await client.query("CREATE INDEX IF NOT EXISTS vehicle_images_vehicle_idx ON vehicle_images(vehicle_id,position)");
 await client.query(`CREATE TABLE IF NOT EXISTS dealer_users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
 email text NOT NULL UNIQUE,
 password_hash text NOT NULL,
 display_name text NOT NULL,
 is_active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now())`);
 await client.query(`CREATE TABLE IF NOT EXISTS dealer_sessions (
 token_hash text PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES dealer_users(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now())`);
 await client.query("CREATE INDEX IF NOT EXISTS dealer_sessions_expiry_idx ON dealer_sessions(expires_at)");
 await client.query(`CREATE TABLE IF NOT EXISTS master_users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 email text NOT NULL UNIQUE,
 display_name text NOT NULL,
 password_hash text NOT NULL,
 is_active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now())`);
 await client.query(`CREATE TABLE IF NOT EXISTS master_sessions (
 token_hash text PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES master_users(id) ON DELETE CASCADE,
 expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now())`);
 await client.query("CREATE INDEX IF NOT EXISTS master_sessions_expiry_idx ON master_sessions(expires_at)");
 await client.query(`CREATE TABLE IF NOT EXISTS vehicle_photo_blobs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
 mime_type text NOT NULL CHECK (mime_type IN ('image/jpeg','image/png','image/webp')),
 bytes bytea NOT NULL,
 position integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now())`);
 await client.query("CREATE INDEX IF NOT EXISTS vehicle_photo_blobs_vehicle_idx ON vehicle_photo_blobs(vehicle_id,position)");
 await client.query("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS whatsapp text");
 await client.query("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS plan_code text NOT NULL DEFAULT 'starter'");
 await client.query("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'trial'");
 await client.query("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS brand_color text NOT NULL DEFAULT '#e92338'");
 await client.query("ALTER TABLE tenants ADD COLUMN IF NOT EXISTS logo_url text");
 await client.query(`CREATE TABLE IF NOT EXISTS auth_attempts (
 key text PRIMARY KEY,
 failures integer NOT NULL DEFAULT 0,
 expires_at timestamptz NOT NULL)`);
 await client.query("COMMIT");
 }catch(e){await client.query("ROLLBACK");throw e}finally{client.release()}
 })().catch(e=>{initialized=undefined;throw e});
 return initialized;
}
