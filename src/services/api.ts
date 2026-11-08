/**
 * Takmili Online - API Client Service
 * Connects to the Express & Liara backend with automatic local offline fallback.
 */
import { MEDICAL_CENTERS, MedicalCenter } from '../data/centers';
import { MedicalCenterReport } from '../types';

export interface ApiHealthResponse {
  status: string;
  version: string;
  platform: string;
  database: {
    connected: boolean;
    type: string;
    message: string;
    totalCenters: number;
  };
}

export interface InsurerItem {
  id: number;
  code: string;
  name: string;
  status: 'active' | 'coming_soon';
  contractedCentersCount: number;
  activeCity: string;
  description: string;
  logo?: string;
}

const API_BASE = '/api/v1';

/**
 * Check backend health & database status
 */
export async function checkApiHealth(): Promise<ApiHealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch supported insurers list
 */
export async function fetchInsurers(): Promise<InsurerItem[]> {
  try {
    const res = await fetch(`${API_BASE}/insurers`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const data = await res.json();
      if (data.insurers && Array.isArray(data.insurers)) {
        return data.insurers;
      }
    }
  } catch (err) {
    console.debug('Fallback to local insurers list');
  }

  // Local fallback
  return [
    {
      id: 1,
      code: 'karafarin',
      name: 'بیمه کارآفرین',
      status: 'active',
      contractedCentersCount: 140,
      activeCity: 'ارومیه',
      description: 'سامانه یکپارچه مراکز طرف قرارداد کارآفرین (ارومیه)',
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
}

/**
 * Submit discrepancy report to the backend API
 */
export async function submitReportToApi(report: MedicalCenterReport): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        centerId: report.centerId,
        centerName: report.centerName,
        reason: report.reason,
        reasonLabel: report.reasonLabel,
        details: report.details,
        reporterContact: report.reporterContact,
      }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok;
  } catch (err) {
    console.debug('API submit failed, fallback to sheets');
    return false;
  }
}
