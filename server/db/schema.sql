-- ============================================================================
-- TAKMILI ONLINE (تکمیلی آنلاین) - PRODUCTION DATABASE SCHEMA (PostgreSQL + PostGIS)
-- Target Platform: Liara Cloud PostgreSQL (پایگاه داده مقیاس‌پذیر در لیارا)
-- Version: 1.0.0
-- ============================================================================

-- ۱. اکستنشن‌های مورد نیاز
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ۲. ساختار استان‌ها و شهرها (Geographic Hierarchy)
CREATE TABLE IF NOT EXISTS provinces (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    province_id INT NOT NULL REFERENCES provinces(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    lat NUMERIC(9, 6),
    lng NUMERIC(9, 6),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(province_id, slug)
);
CREATE INDEX IF NOT EXISTS idx_cities_province_active ON cities(province_id, is_active);

CREATE TABLE IF NOT EXISTS streets (
    id SERIAL PRIMARY KEY,
    city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    normalized_name VARCHAR(150) NOT NULL,
    center_location GEOMETRY(Point, 4326),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_streets_city ON streets(city_id);
CREATE INDEX IF NOT EXISTS idx_streets_trgm ON streets USING gin(normalized_name gin_trgm_ops);

-- ۳. شرکت‌های بیمه و طرح‌های بیمه تکمیلی (Insurers & Plans)
CREATE TABLE IF NOT EXISTS insurers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    official_portal_url TEXT,
    logo_path TEXT,
    support_phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS insurance_plans (
    id SERIAL PRIMARY KEY,
    insurer_id INT NOT NULL REFERENCES insurers(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ۴. دسته‌بندی و مراکز درمانی (Medical Centers & Categories)
CREATE TABLE IF NOT EXISTS medical_categories (
    id SERIAL PRIMARY KEY,
    key_name VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    icon_name VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS medical_centers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legacy_k INT UNIQUE,
    official_name VARCHAR(250) NOT NULL,
    category_id INT NOT NULL REFERENCES medical_categories(id),
    ownership_type VARCHAR(50) DEFAULT 'private',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_medical_centers_name_trgm ON medical_centers USING gin(official_name gin_trgm_ops);

CREATE TABLE IF NOT EXISTS medical_center_branches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    center_id UUID NOT NULL REFERENCES medical_centers(id) ON DELETE CASCADE,
    city_id INT NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
    street_id INT REFERENCES streets(id) ON DELETE SET NULL,
    branch_name VARCHAR(200) NOT NULL DEFAULT 'شعبه مرکزی',
    full_address TEXT NOT NULL,
    normalized_address TEXT NOT NULL,
    phone_primary VARCHAR(50) NOT NULL,
    phone_secondary VARCHAR(100),
    is_night_shift BOOLEAN DEFAULT FALSE,
    place_id_google VARCHAR(150),
    location GEOMETRY(Point, 4326),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_branches_city_active ON medical_center_branches(city_id, is_active);
CREATE INDEX IF NOT EXISTS idx_branches_location_gist ON medical_center_branches USING gist(location);
CREATE INDEX IF NOT EXISTS idx_branches_address_trgm ON medical_center_branches USING gin(normalized_address gin_trgm_ops);

-- ۵. قراردادهای بیمه و وضعیت استعلام (Contracts Lifecycle)
DO $$ BEGIN
    CREATE TYPE contract_status AS ENUM (
        'active', 
        'pending_verification', 
        'temporarily_suspended', 
        'expired', 
        'terminated'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS insurance_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID NOT NULL REFERENCES medical_center_branches(id) ON DELETE CASCADE,
    insurer_id INT NOT NULL REFERENCES insurers(id) ON DELETE RESTRICT,
    plan_id INT REFERENCES insurance_plans(id) ON DELETE SET NULL,
    contract_number VARCHAR(100),
    status contract_status NOT NULL DEFAULT 'active',
    is_online_deduction BOOLEAN DEFAULT TRUE,
    verification_source VARCHAR(100) NOT NULL DEFAULT 'official_list',
    last_verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(branch_id, insurer_id)
);
CREATE INDEX IF NOT EXISTS idx_contracts_lookup ON insurance_contracts(insurer_id, status);

-- ۶. خدمات تحت پوشش هر قرارداد (Covered Services)
CREATE TABLE IF NOT EXISTS contract_covered_services (
    id SERIAL PRIMARY KEY,
    contract_id UUID NOT NULL REFERENCES insurance_contracts(id) ON DELETE CASCADE,
    service_name VARCHAR(150) NOT NULL,
    is_covered BOOLEAN DEFAULT TRUE,
    requires_pre_authorization BOOLEAN DEFAULT FALSE
);

-- ۷. گزارش‌های مغایرت و بازخورد مردمی (User Reports)
CREATE TABLE IF NOT EXISTS user_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id UUID REFERENCES medical_center_branches(id) ON DELETE SET NULL,
    legacy_center_id INT,
    center_name VARCHAR(250) NOT NULL,
    reason VARCHAR(50) NOT NULL,
    reason_label VARCHAR(150),
    details TEXT,
    reporter_contact VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'verified', 'resolved', 'rejected'
    operator_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status, created_at DESC);

-- ۸. آمار جستجو و علایق کاربران (Search Demand Analytics)
CREATE TABLE IF NOT EXISTS search_analytics_logs (
    id BIGSERIAL PRIMARY KEY,
    city_id INT REFERENCES cities(id),
    query_text VARCHAR(250),
    selected_category VARCHAR(100),
    selected_street VARCHAR(150),
    selected_insurer_code VARCHAR(50),
    result_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_search_logs_created ON search_analytics_logs(created_at DESC);

-- ۹. کاربران مدیر سامانه و دسترسی‌ها (Admin Users & Audit Logs)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'operator', -- 'super_admin', 'city_manager', 'operator'
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id BIGSERIAL PRIMARY KEY,
    admin_id UUID REFERENCES admin_users(id),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
