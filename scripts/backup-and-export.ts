/**
 * Phase 1: Data Backup & PostgreSQL/PostGIS Seed Generator
 * Safely extracts authoritative medical centers from src/data/centers.ts
 * and generates clean JSON backups as well as production-ready SQL seed scripts for Liara PostgreSQL.
 */
import fs from 'fs';
import path from 'path';
import { MEDICAL_CENTERS, MedicalCenter } from '../src/data/centers';
import { URMIA_STREETS_MAP, parseCoordinates } from '../src/utils/centerStore';
import { norm, squash } from '../src/utils/persian';

const BACKUP_DIR = path.resolve(process.cwd(), 'backup');
const SERVER_DB_DIR = path.resolve(process.cwd(), 'server/db');

// Ensure directories exist
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });
if (!fs.existsSync(SERVER_DB_DIR)) fs.mkdirSync(SERVER_DB_DIR, { recursive: true });

console.log(`[Backup] Processing ${MEDICAL_CENTERS.length} authoritative centers...`);

// 1. Save pristine JSON backup
const backupFilePath = path.join(BACKUP_DIR, 'centers-backup.json');
fs.writeFileSync(backupFilePath, JSON.stringify(MEDICAL_CENTERS, null, 2), 'utf-8');
console.log(`[Backup] Pristine JSON backup written to: ${backupFilePath}`);

// 2. Extract unique categories
const categoriesMap = new Map<string, string>();
MEDICAL_CENTERS.forEach((c) => {
  if (c.type && !categoriesMap.has(c.type)) {
    categoriesMap.set(c.type, c.type);
  }
});

// 3. Build SQL seed content
const sqlLines: string[] = [];
sqlLines.push('-- =================================================================');
sqlLines.push('-- TAKMILI ONLINE (تکمیلی آنلاین) - PostgreSQL + PostGIS Seed Data');
sqlLines.push(`-- Generated: ${new Date().toISOString()}`);
sqlLines.push(`-- Total Centers: ${MEDICAL_CENTERS.length}`);
sqlLines.push('-- =================================================================\n');

sqlLines.push('BEGIN;\n');

// Provinces & Cities
sqlLines.push('-- 1. استان‌ها و شهرها');
sqlLines.push(`INSERT INTO provinces (id, name, slug) VALUES 
  (1, 'آذربایجان غربی', 'west-azerbaijan'),
  (2, 'آذربایجان شرقی', 'east-azerbaijan'),
  (3, 'تهران', 'tehran')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;\n`);

sqlLines.push(`INSERT INTO cities (id, province_id, name, slug, lat, lng, is_active) VALUES 
  (1, 1, 'ارومیه', 'urmia', 37.5528, 45.0761, TRUE),
  (2, 2, 'تبریز', 'tabriz', 38.0800, 46.2919, FALSE),
  (3, 3, 'تهران', 'tehran', 35.6892, 51.3890, FALSE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;\n`);

// Insurers
sqlLines.push('-- 2. شرکت‌های بیمه تکمیلی');
sqlLines.push(`INSERT INTO insurers (id, code, name, official_portal_url, support_phone, is_active) VALUES
  (1, 'karafarin', 'بیمه کارآفرین', 'https://sinad.karafarin-insurance.ir', '02123560', TRUE),
  (2, 'dana', 'بیمه دانا', 'https://dana-insurance.com', '02188888888', FALSE),
  (3, 'iran', 'بیمه ایران', 'https://iraninsurance.ir', '09668', FALSE),
  (4, 'asia', 'بیمه آسیا', 'https://bimehasia.com', '0218707', FALSE),
  (5, 'alborz', 'بیمه البرز', 'https://alborzinsurance.ir', '0211574', FALSE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, is_active = EXCLUDED.is_active;\n`);

// Categories
sqlLines.push('-- 3. دسته‌بندی مراکز درمانی');
let catId = 1;
const categoryIdMap = new Map<string, number>();
for (const [key, title] of categoriesMap.entries()) {
  categoryIdMap.set(key, catId);
  sqlLines.push(`INSERT INTO medical_categories (id, key_name, title) VALUES (${catId}, '${escapeSql(key)}', '${escapeSql(title)}') ON CONFLICT (id) DO NOTHING;`);
  catId++;
}
sqlLines.push('');

// Streets for Urmia
sqlLines.push('-- 4. معابر و خیابان‌های اصلی ارومیه');
let streetId = 1;
const streetIdMap = new Map<string, number>();
for (const [streetName, coords] of Object.entries(URMIA_STREETS_MAP)) {
  streetIdMap.set(streetName, streetId);
  const geomSql = `ST_SetSRID(ST_MakePoint(${coords.lng}, ${coords.lat}), 4326)`;
  sqlLines.push(`INSERT INTO streets (id, city_id, name, normalized_name, center_location) VALUES (${streetId}, 1, '${escapeSql(streetName)}', '${escapeSql(norm(streetName))}', ${geomSql}) ON CONFLICT (id) DO NOTHING;`);
  streetId++;
}
sqlLines.push('');

// Medical Centers & Branches & Contracts
sqlLines.push('-- 5. مراکز درمانی، شعبات و قراردادهای بیمه کارآفرین در ارومیه');
MEDICAL_CENTERS.forEach((c) => {
  const centerCatId = categoryIdMap.get(c.type) || 1;
  const ownership = c.ownership && c.ownership.trim() ? c.ownership.trim() : 'خصوصی';
  const centerUuid = `c0000000-0000-0000-0000-${String(c.k).padStart(12, '0')}`;
  const branchUuid = `b0000000-0000-0000-0000-${String(c.k).padStart(12, '0')}`;
  const contractUuid = `a0000000-0000-0000-0000-${String(c.k).padStart(12, '0')}`;

  // Find matching street
  let matchedStreetId: number | null = null;
  if (c.streets && c.streets.length > 0) {
    for (const s of c.streets) {
      if (streetIdMap.has(s)) {
        matchedStreetId = streetIdMap.get(s)!;
        break;
      }
    }
  }

  // Determine Coordinates (prefer explicit lat/lng, otherwise street fallback)
  let lat = c.lat;
  let lng = c.lng;
  if ((!lat || !lng) && c.streets && c.streets.length > 0) {
    const sName = c.streets[0];
    if (URMIA_STREETS_MAP[sName]) {
      lat = URMIA_STREETS_MAP[sName].lat;
      lng = URMIA_STREETS_MAP[sName].lng;
    }
  }

  const geomValue = (lat && lng && lat > 30 && lng > 40)
    ? `ST_SetSRID(ST_MakePoint(${lng.toFixed(6)}, ${lat.toFixed(6)}), 4326)`
    : 'NULL';

  const cleanPhone = (c.phone || '').trim();
  const phoneWarn = (c.phoneWarn || '').trim();

  // Insert Center
  sqlLines.push(`INSERT INTO medical_centers (id, legacy_k, official_name, category_id, ownership_type, description) VALUES ('${centerUuid}', ${c.k}, '${escapeSql(c.name)}', ${centerCatId}, '${escapeSql(ownership)}', '${escapeSql(phoneWarn)}') ON CONFLICT (legacy_k) DO UPDATE SET official_name = EXCLUDED.official_name;`);

  // Insert Branch
  const streetIdSql = matchedStreetId ? String(matchedStreetId) : 'NULL';
  sqlLines.push(`INSERT INTO medical_center_branches (id, center_id, city_id, street_id, branch_name, full_address, normalized_address, phone_primary, is_night_shift, place_id_google, location) VALUES ('${branchUuid}', '${centerUuid}', 1, ${streetIdSql}, 'شعبه مرکزی', '${escapeSql(c.address || '')}', '${escapeSql(norm(c.address || ''))}', '${escapeSql(cleanPhone)}', ${c.isNightShift ? 'TRUE' : 'FALSE'}, '${escapeSql(c.pid || '')}', ${geomValue}) ON CONFLICT (id) DO NOTHING;`);

  // Insert Karafarin Insurance Contract
  sqlLines.push(`INSERT INTO insurance_contracts (id, branch_id, insurer_id, status, is_online_deduction, verification_source, last_verified_at) VALUES ('${contractUuid}', '${branchUuid}', 1, 'active', TRUE, 'official_karafarin_registry_urmia', NOW()) ON CONFLICT (branch_id, insurer_id) DO NOTHING;`);
});

sqlLines.push('\nCOMMIT;\n');

const seedFilePath = path.join(SERVER_DB_DIR, 'seed.sql');
fs.writeFileSync(seedFilePath, sqlLines.join('\n'), 'utf-8');
console.log(`[Backup] PostgreSQL seed file generated: ${seedFilePath} (${sqlLines.length} lines)`);

function escapeSql(str: string): string {
  if (!str) return '';
  return str.replace(/'/g, "''");
}
