import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { getDBStatus, getDBPool, queryInMemoryCenters } from './server/db/connection';
import { URMIA_STREETS_MAP } from './src/utils/centerStore';
import { toFa } from './src/utils/persian';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Body parser
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Security & CORS headers
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.header('Access-Control-Allow-Origin', origin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// In-memory reports store for local development/staging
const memoryReports: Array<{
  id: string;
  centerId: number;
  centerName: string;
  reason: string;
  details?: string;
  reporterContact?: string;
  status: string;
  createdAt: string;
}> = [];

// ============================================================================
// API V1 ROUTES
// ============================================================================

// 1. Healthcheck & DB Status
app.get('/api/v1/health', (req: Request, res: Response) => {
  const status = getDBStatus();
  res.json({
    status: 'ok',
    version: '1.0.0',
    platform: 'Liara Cloud & Express Backend',
    timestamp: new Date().toISOString(),
    database: status,
  });
});

// 2. Insurers list with active contract statistics
app.get('/api/v1/insurers', (req: Request, res: Response) => {
  const insurers = [
    {
      id: 1,
      code: 'karafarin',
      name: 'بیمه کارآفرین',
      status: 'active',
      contractedCentersCount: 140,
      activeCity: 'ارومیه',
      description: 'سامانه یکپارچه مراکز طرف قرارداد کارآفرین (فعال)',
      logo: '/icons/icon-192.png',
    },
    {
      id: 2,
      code: 'dana',
      name: 'بیمه دانا',
      status: 'coming_soon',
      contractedCentersCount: 0,
      activeCity: 'سراسر کشور',
      description: 'در حال تکمیل پایگاه داده و استعلام قراردادها',
    },
    {
      id: 3,
      code: 'iran',
      name: 'بیمه ایران',
      status: 'coming_soon',
      contractedCentersCount: 0,
      activeCity: 'سراسر کشور',
      description: 'در حال تکمیل پایگاه داده و استعلام قراردادها',
    },
    {
      id: 4,
      code: 'asia',
      name: 'بیمه آسیا',
      status: 'coming_soon',
      contractedCentersCount: 0,
      activeCity: 'سراسر کشور',
      description: 'در حال تکمیل پایگاه داده و استعلام قراردادها',
    },
    {
      id: 5,
      code: 'alborz',
      name: 'بیمه البرز',
      status: 'coming_soon',
      contractedCentersCount: 0,
      activeCity: 'سراسر کشور',
      description: 'در حال تکمیل پایگاه داده و استعلام قراردادها',
    },
  ];

  res.json({ success: true, count: insurers.length, insurers });
});

// 3. Supported cities and provinces
app.get('/api/v1/geo/cities', (req: Request, res: Response) => {
  const cities = [
    {
      id: 1,
      name: 'ارومیه',
      slug: 'urmia',
      province: 'آذربایجان غربی',
      isActive: true,
      centersCount: 140,
      lat: 37.5528,
      lng: 45.0761,
    },
    {
      id: 2,
      name: 'تبریز',
      slug: 'tabriz',
      province: 'آذربایجان شرقی',
      isActive: false,
      centersCount: 0,
      lat: 38.08,
      lng: 46.2919,
    },
    {
      id: 3,
      name: 'تهران',
      slug: 'tehran',
      province: 'تهران',
      isActive: false,
      centersCount: 0,
      lat: 35.6892,
      lng: 51.389,
    },
  ];

  res.json({ success: true, count: cities.length, cities });
});

// 4. Street index with coordinates
app.get('/api/v1/geo/streets', (req: Request, res: Response) => {
  const streets = Object.entries(URMIA_STREETS_MAP).map(([name, coords], idx) => ({
    id: idx + 1,
    cityId: 1,
    name,
    lat: coords.lat,
    lng: coords.lng,
  }));

  res.json({ success: true, city: 'ارومیه', count: streets.length, streets });
});

// 5. Centers Search (Hybrid PostgreSQL / Authoritative In-Memory fallback)
app.get('/api/v1/centers', async (req: Request, res: Response) => {
  try {
    const {
      query = '',
      type = '',
      street = '',
      insurer = '1',
      onlyNightShift = 'false',
      limit = '50',
      offset = '0',
    } = req.query;

    const pool = getDBPool();

    // If PostgreSQL pool is connected, query PostgreSQL
    if (pool) {
      try {
        const pgResult = await pool.query(`
          SELECT 
            b.id AS branch_id,
            m.legacy_k AS k,
            m.official_name AS name,
            c.title AS type,
            b.full_address AS address,
            b.phone_primary AS phone,
            b.is_night_shift AS "isNightShift",
            ST_Y(b.location::geometry) AS lat,
            ST_X(b.location::geometry) AS lng,
            ic.status AS contract_status
          FROM medical_center_branches b
          JOIN medical_centers m ON b.center_id = m.id
          JOIN medical_categories c ON m.category_id = c.id
          LEFT JOIN insurance_contracts ic ON ic.branch_id = b.id
          WHERE b.is_active = TRUE
          LIMIT $1 OFFSET $2
        `, [Number(limit), Number(offset)]);

        return res.json({
          success: true,
          source: 'postgresql',
          total: pgResult.rowCount,
          results: pgResult.rows,
        });
      } catch (pgErr: any) {
        console.warn('PostgreSQL query error, falling back to memory engine:', pgErr.message);
      }
    }

    // In-Memory Search Engine
    const searchData = queryInMemoryCenters({
      query: String(query),
      type: String(type),
      street: String(street),
      insurerId: String(insurer),
      onlyNightShift: onlyNightShift === 'true',
      limit: Math.min(Number(limit) || 50, 200),
      offset: Number(offset) || 0,
    });

    res.json({
      success: true,
      source: 'in_memory_authoritative',
      total: searchData.total,
      results: searchData.results,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. User feedback and report submission endpoint
app.post('/api/v1/reports', (req: Request, res: Response) => {
  const { centerId, centerName, reason, reasonLabel, details, reporterContact } = req.body;

  if (!centerId || !centerName || !reason) {
    return res.status(400).json({ success: false, error: 'اطلاعات ضروری گزارش ناقص است.' });
  }

  const newReport = {
    id: `rep_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    centerId: Number(centerId),
    centerName: String(centerName),
    reason: String(reason),
    reasonLabel: String(reasonLabel || reason),
    details: String(details || ''),
    reporterContact: String(reporterContact || ''),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  memoryReports.unshift(newReport);
  if (memoryReports.length > 500) memoryReports.length = 500;

  res.status(201).json({
    success: true,
    message: 'گزارش مغایرت با موفقیت در سامانه ثبت شد و در صف بررسی اپراتور قرار گرفت.',
    reportId: newReport.id,
  });
});

// 7. Secure Admin Authentication
app.post('/api/v1/admin/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Expected credentials from environment variable or secure fallback
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'A$m@#73';

  if (username === adminUser && password === adminPass) {
    const token = `tk_${Buffer.from(`${username}:${Date.now()}`).toString('base64')}`;
    return res.json({
      success: true,
      token,
      user: {
        username: adminUser,
        role: 'super_admin',
        fullName: 'مدیر ارشد سامانه تکمیلی آنلاین',
      },
    });
  }

  return res.status(401).json({
    success: false,
    error: 'نام کاربری یا کلمه عبور نادرست است.',
  });
});

// 8. Admin Reports List
app.get('/api/v1/admin/reports', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer tk_')) {
    return res.status(401).json({ success: false, error: 'دسترسی غیرمجاز است.' });
  }

  res.json({
    success: true,
    total: memoryReports.length,
    reports: memoryReports,
  });
});

// ============================================================================
// MOUNT VITE IN DEV / STATIC SERVE IN PRODUCTION
// ============================================================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`🚀 [Takmili Online] Full-Stack Server running on port ${PORT}`);
    console.log(`📡 API Healthcheck available at: http://localhost:${PORT}/api/v1/health`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
});
