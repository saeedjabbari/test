import pg from 'pg';
import dotenv from 'dotenv';
import { MEDICAL_CENTERS, MedicalCenter } from '../../src/data/centers';
import { URMIA_STREETS_MAP } from '../../src/utils/centerStore';
import { norm, squash } from '../../src/utils/persian';

dotenv.config();

const { Pool } = pg;

export interface DBStatus {
  connected: boolean;
  type: 'postgresql' | 'in_memory_authoritative';
  message: string;
  totalCenters: number;
}

let pool: pg.Pool | null = null;
let isPgConnected = false;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.query('SELECT NOW()')
      .then(() => {
        isPgConnected = true;
        console.log('✅ [PostgreSQL] Connected successfully to database');
      })
      .catch((err) => {
        isPgConnected = false;
        console.warn('⚠️ [PostgreSQL] Connection fallback to in-memory store:', err.message);
      });
  } catch (err: any) {
    console.warn('⚠️ [PostgreSQL] Pool initialization skipped:', err?.message);
  }
}

export function getDBPool(): pg.Pool | null {
  return isPgConnected ? pool : null;
}

export function getDBStatus(): DBStatus {
  return {
    connected: isPgConnected,
    type: isPgConnected ? 'postgresql' : 'in_memory_authoritative',
    message: isPgConnected
      ? 'متصل به پایگاه داده PostgreSQL (لیارا / کلاود)'
      : 'استفاده از مخزن پایدار درون‌حافظه‌ای کلاینت (۱۴۰ مرکز درمانی ارومیه)',
    totalCenters: MEDICAL_CENTERS.length,
  };
}

// In-memory query engine (Zero-downtime fallback)
export interface SearchCentersParams {
  query?: string;
  type?: string;
  street?: string;
  insurerId?: string | number;
  onlyNightShift?: boolean;
  lat?: number;
  lng?: number;
  limit?: number;
  offset?: number;
}

export function queryInMemoryCenters(params: SearchCentersParams) {
  const {
    query = '',
    type = '',
    street = '',
    insurerId = '1', // Default: Karafarin (1)
    onlyNightShift = false,
    limit = 50,
    offset = 0,
  } = params;

  // Active insurer validation: Currently Karafarin (1 or 'karafarin') has active centers
  const isKarafarin = insurerId === 1 || insurerId === '1' || insurerId === 'karafarin';
  if (!isKarafarin) {
    return {
      total: 0,
      results: [],
      insurerNotice: 'مراکز طرف قرارداد برای این شرکت بیمه در مرحله بارگذاری است.',
    };
  }

  const nq = norm(query);
  const tokens = nq ? nq.split(' ').filter(Boolean) : [];

  let filtered = MEDICAL_CENTERS.filter((c) => {
    // Type filter
    if (type) {
      const matchType =
        c.type === type ||
        (type === 'بیمارستان' && c.type.includes('بیمارستان')) ||
        (type.includes('عینک') && c.type.includes('عینک')) ||
        (type.includes('کودک') && (c.type.includes('کودک') || (c.specialty && c.specialty.includes('کودک'))));
      if (!matchType) return false;
    }

    // Street filter
    if (street && (!c.streets || !c.streets.includes(street))) {
      return false;
    }

    // Night shift filter
    if (onlyNightShift && !c.isNightShift) {
      return false;
    }

    // Token query search
    if (tokens.length > 0) {
      const fullText = [
        norm(c.name),
        norm(c.type),
        norm(c.specialty || ''),
        norm(c.address || ''),
        ...(c.streets || []).map((s) => norm(s)),
        ...(c.alt || []).map((a) => norm(a)),
      ].join(' ');

      const ph = [c.phone, c.id, ...(c.alt || [])].filter(Boolean).join(' ');
      const compoundFields = [norm(c.name), norm(c.type), norm(c.specialty || ''), ...(c.streets || []).map((s) => norm(s))].map((f) => squash(f));

      for (const tok of tokens) {
        if (/^\d{3,}$/.test(tok)) {
          if (!ph.includes(tok)) return false;
        } else {
          const inFull = fullText.includes(tok);
          const inCompound = tok.length >= 3 && compoundFields.some((cf) => cf.includes(squash(tok)));
          if (!inFull && !inCompound) return false;
        }
      }
    }

    return true;
  });

  const total = filtered.length;
  const paginated = filtered.slice(offset, offset + limit);

  return {
    total,
    results: paginated.map((c) => ({
      ...c,
      insurer: 'بیمه کارآفرین',
      contractStatus: 'active',
      verifiedAt: '1403/08/15',
    })),
  };
}
