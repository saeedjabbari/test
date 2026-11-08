import { MedicalCenterReport } from '../types';
import { MEDICAL_CENTERS } from '../data/centers';

export const SHEETS_STORAGE_KEY = 'krf_sheets_webhook_url';

// Default / fallback webhook URL (permanently connected to user's Google Sheet)
export const DEFAULT_SHEETS_WEBHOOK_URL =
  'https://script.google.com/macros/s/AKfycby9pU0rPlBI8AKfXbkSJXodnBVY6PjVXUYHxfLZMynaIXoSNDci7ah4TimCfWZTgsN2cA/exec';

export function getSheetsWebhookUrl(): string {
  try {
    const custom = localStorage.getItem(SHEETS_STORAGE_KEY);
    if (custom && custom.trim().length > 15) {
      return custom.trim();
    }
    return DEFAULT_SHEETS_WEBHOOK_URL;
  } catch {
    return DEFAULT_SHEETS_WEBHOOK_URL;
  }
}

export function setSheetsWebhookUrl(url: string): void {
  try {
    localStorage.setItem(SHEETS_STORAGE_KEY, url.trim());
  } catch {}
}

/**
 * Submit report to Google Sheets Webhook.
 * Uses mode: 'no-cors' to avoid browser cross-origin redirects from script.google.com
 */
export async function submitReportToSheets(report: MedicalCenterReport): Promise<boolean> {
  const webhookUrl = getSheetsWebhookUrl();
  if (!webhookUrl) {
    console.warn('Google Sheets Webhook URL not configured yet.');
    return false;
  }

  const payload = {
    centerId: report.centerId,
    centerName: report.centerName,
    centerType: report.centerType || 'مرکز درمانی',
    reason: report.reason,
    reasonLabel: report.reasonLabel || report.reason,
    details: report.details || '',
    reporterContact: report.reporterContact || '',
    status: report.status || 'pending',
    createdAt: report.createdAt || new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (err) {
    console.error('Error posting to Google Sheets webhook:', err);
    return false;
  }
}

export interface InsurerDemandRecord {
  insurer: string;
  phone: string;
  createdAt?: string;
}

/**
 * Record user request for upcoming insurance providers to Google Sheets and Admin Panel
 */
export async function recordInsurerRequestToSheets(item: InsurerDemandRecord): Promise<boolean> {
  const webhookUrl = getSheetsWebhookUrl();
  if (!webhookUrl) return false;

  const payload = {
    type: 'insurer_request',
    insurer: item.insurer || 'نامشخص',
    phone: item.phone,
    createdAt: item.createdAt || new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (err) {
    console.warn('Error posting insurer request to sheets:', err);
    return false;
  }
}

/**
 * Fetch all reports from Google Sheets Webhook via GET
 */
export async function fetchReportsFromSheets(): Promise<MedicalCenterReport[]> {
  const webhookUrl = getSheetsWebhookUrl();
  if (!webhookUrl) return [];

  try {
    const fetchUrl = `${webhookUrl}${webhookUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(fetchUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    const list: any[] = Array.isArray(data) ? data : data.reports || [];

    // Filter out completely blank rows, empty ping tests, or rows with no center identity
    const validRows = list.filter((item) => {
      if (!item || typeof item !== 'object') return false;
      const rawName = String(item.centerName || item['نام مرکز'] || '').trim();
      const rawId = item.centerId !== undefined && item.centerId !== null && String(item.centerId).trim() !== '';
      const rawReason = String(item.reason || item.reasonLabel || '').trim();
      const rawDetails = String(item.details || '').trim();

      // If both name and id are empty, it is an empty blank row, discard it
      if (!rawName && !rawId) return false;
      // If name is placeholder string and there is no real numeric id, discard it
      if (rawName === 'مرکز درمانی' && (!rawId || Number(item.centerId) === 0)) return false;
      // If there is neither a name nor a reason nor details, discard it
      if (!rawName && !rawReason && !rawDetails) return false;

      return true;
    });

    return validRows.map((item, idx) => {
      const cId = Number(item.centerId) || 0;
      let cName = String(item.centerName || item['نام مرکز'] || '').trim();
      let cType = String(item.centerType || item['نوع مرکز'] || '').trim();

      // If center name is missing or placeholder 'مرکز درمانی', look up real name from MEDICAL_CENTERS
      if ((!cName || cName === 'مرکز درمانی') && cId > 0) {
        const found = MEDICAL_CENTERS.find((c) => c.k === cId);
        if (found) {
          cName = found.name;
          cType = found.type;
        } else {
          cName = `مرکز کد ${cId}`;
        }
      }

      return {
        id: item.id || `sheets-${idx}`,
        centerId: cId || 1,
        centerName: cName || 'مرکز نامشخص',
        centerType: cType || 'مرکز درمانی',
        reason: item.reason || 'other',
        reasonLabel: item.reasonLabel || item.reason || 'سایر',
        details: String(item.details || ''),
        reporterContact: String(item.reporterContact || ''),
        status: item.status || 'pending',
        createdAt: item.createdAt || new Date().toISOString(),
      };
    });
  } catch (err) {
    console.warn('Error fetching reports from Google Sheets:', err);
    throw err;
  }
}

/**
 * Record user search to Google Sheets Webhook in a separate "جستجوهای کاربران" tab
 */
export interface SearchRecord {
  term: string;
  resultCount: number;
  selectedStreet?: string;
  selectedType?: string;
  clickedCenter?: string;
  createdAt?: string;
}

export const OFFLINE_SEARCH_QUEUE_KEY = 'krf_offline_search_queue';

/**
 * Enqueue a search record into localStorage when device is offline
 */
function enqueueOfflineSearch(search: SearchRecord): void {
  try {
    const raw = localStorage.getItem(OFFLINE_SEARCH_QUEUE_KEY);
    const queue: SearchRecord[] = raw ? JSON.parse(raw) : [];
    // Avoid duplicate rapid saves of identical term
    if (queue.length === 0 || queue[queue.length - 1].term !== search.term) {
      queue.push(search);
      // Keep queue bounded
      if (queue.length > 150) queue.shift();
      localStorage.setItem(OFFLINE_SEARCH_QUEUE_KEY, JSON.stringify(queue));
    }
  } catch {}
}

/**
 * Flush all pending offline searches to Google Sheets when back online
 */
export async function flushOfflineSearchQueue(): Promise<number> {
  if (typeof window === 'undefined' || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return 0;
  }
  const webhookUrl = getSheetsWebhookUrl();
  if (!webhookUrl) return 0;

  let queue: SearchRecord[] = [];
  try {
    const raw = localStorage.getItem(OFFLINE_SEARCH_QUEUE_KEY);
    if (!raw) return 0;
    queue = JSON.parse(raw);
  } catch {
    return 0;
  }

  if (queue.length === 0) return 0;

  let flushedCount = 0;
  const remaining: SearchRecord[] = [];

  for (const item of queue) {
    try {
      const payload = {
        type: 'search',
        term: item.term,
        resultCount: item.resultCount,
        selectedStreet: item.selectedStreet || 'همه',
        selectedType: item.selectedType || 'همه',
        clickedCenter: item.clickedCenter || '',
        createdAt: item.createdAt || new Date().toISOString(),
      };

      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      flushedCount++;
      await new Promise((r) => setTimeout(r, 200));
    } catch {
      remaining.push(item);
    }
  }

  try {
    if (remaining.length > 0) {
      localStorage.setItem(OFFLINE_SEARCH_QUEUE_KEY, JSON.stringify(remaining));
    } else {
      localStorage.removeItem(OFFLINE_SEARCH_QUEUE_KEY);
    }
  } catch {}

  return flushedCount;
}

// Automatically flush queue whenever online event fires
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    flushOfflineSearchQueue().catch(() => {});
  });
}

export async function recordSearchToSheets(search: SearchRecord): Promise<boolean> {
  const webhookUrl = getSheetsWebhookUrl();
  const searchWithDate: SearchRecord = {
    ...search,
    createdAt: search.createdAt || new Date().toISOString(),
  };

  // If offline or no webhook, queue it locally
  if (!webhookUrl || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    enqueueOfflineSearch(searchWithDate);
    return true;
  }

  const payload = {
    type: 'search',
    term: searchWithDate.term,
    resultCount: searchWithDate.resultCount,
    selectedStreet: searchWithDate.selectedStreet || 'همه',
    selectedType: searchWithDate.selectedType || 'همه',
    clickedCenter: searchWithDate.clickedCenter || '',
    createdAt: searchWithDate.createdAt,
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    // Background flush of any previous offline items
    flushOfflineSearchQueue().catch(() => {});
    return true;
  } catch (err) {
    console.warn('Network issue saving search to sheets; queued offline:', err);
    enqueueOfflineSearch(searchWithDate);
    return true;
  }
}

/**
 * Fetch all searches from Google Sheets Webhook via GET
 */
export async function fetchSearchesFromSheets(): Promise<SearchRecord[]> {
  const webhookUrl = getSheetsWebhookUrl();
  if (!webhookUrl) return [];

  try {
    const fetchUrl = `${webhookUrl}${webhookUrl.includes('?') ? '&' : '?'}type=searches&_t=${Date.now()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(fetchUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list: any[] = Array.isArray(data) ? data : data.searches || [];

    return list.map((item) => ({
      term: String(item['عبارت جستجو شده'] || item.term || ''),
      resultCount: Number(item['تعداد نتایج یافت‌شده'] || item['تعداد نتایج'] || item.resultCount || 0),
      selectedStreet: String(item['فیلتر خیابان'] || item.selectedStreet || 'همه'),
      selectedType: String(item['فیلتر دسته‌بندی'] || item.selectedType || 'همه'),
      clickedCenter: String(item['مرکز انتخاب‌شده'] || item.clickedCenter || ''),
      createdAt: String(item['تاریخ و زمان'] || item['تاریخ و ساعت'] || item.createdAt || ''),
    }));
  } catch (err) {
    console.warn('Error fetching searches from Google Sheets:', err);
    return [];
  }
}

export interface VisitRecord {
  deviceId: string;
  deviceType: string;
  model: string;
  os: string;
  browser: string;
  isPWA: string;
  screenResolution: string;
  visitCount: number;
  timestamp?: string;
}

export async function recordVisitToSheets(visit: VisitRecord): Promise<boolean> {
  const webhookUrl = getSheetsWebhookUrl();
  if (!webhookUrl || (typeof navigator !== 'undefined' && !navigator.onLine)) {
    return false;
  }

  const payload = {
    type: 'visit',
    deviceId: visit.deviceId,
    deviceType: visit.deviceType,
    model: visit.model,
    os: visit.os,
    browser: visit.browser,
    isPWA: visit.isPWA,
    screenResolution: visit.screenResolution,
    visitCount: visit.visitCount,
    timestamp: visit.timestamp || new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (err) {
    console.warn('Network issue saving visit to sheets:', err);
    return false;
  }
}

export async function fetchVisitsFromSheets(): Promise<VisitRecord[]> {
  const webhookUrl = getSheetsWebhookUrl();
  if (!webhookUrl) return [];

  try {
    const fetchUrl = `${webhookUrl}${webhookUrl.includes('?') ? '&' : '?'}type=visits&_t=${Date.now()}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(fetchUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list: any[] = Array.isArray(data) ? data : data.visits || [];

    return list.map((item) => ({
      deviceId: String(item['شناسه دستگاه'] || item.deviceId || 'نامشخص'),
      deviceType: String(item['نوع دستگاه'] || item.deviceType || 'موبایل'),
      model: String(item['مدل گوشی و دستگاه'] || item.model || 'نامشخص'),
      os: String(item['سیستم عامل'] || item.os || 'نامشخص'),
      browser: String(item['مرورگر'] || item.browser || 'نامشخص'),
      isPWA: String(item['وضعیت نصب PWA'] || item['وضعیت PWA'] || item.isPWA || 'مرورگر وب'),
      screenResolution: String(item['رزولوشن صفحه'] || item.screenResolution || '—'),
      visitCount: Number(item['دفعات بازدید'] || item.visitCount || 1),
      timestamp: String(item['تاریخ و زمان'] || item['تاریخ و ساعت'] || item.timestamp || ''),
    }));
  } catch (err) {
    console.warn('Error fetching visits from Google Sheets:', err);
    return [];
  }
}

/**
 * Send Two-Factor Authentication OTP code to admin email via Google Apps Script (MailApp)
 */
export async function sendAdminOtpViaWebhook(email: string, code: string): Promise<boolean> {
  const webhookUrl = getSheetsWebhookUrl();
  if (!webhookUrl) return false;

  const payload = {
    type: 'send_otp',
    email,
    code,
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (err) {
    console.warn('Error sending OTP via webhook:', err);
    return false;
  }
}

/**
 * The exact Google Apps Script code template that admin can paste in their Google Sheet
 * Handles:
 * 1) Medical Center Reports (Saved in 'گزارشات مراکز' sheet)
 * 2) User Searches for Marketing (Saved in 'جستجوهای کاربران' sheet)
 * 3) User & Device Analytics (Saved in 'آمار کاربران و دستگاه‌ها' sheet)
 * 4) Two-Factor Authentication OTP Email Dispatch to saeedjabbari21@gmail.com
 */
export const GOOGLE_APPS_SCRIPT_CODE = `// ========================================================
// اسکریپت جامع اتصال اپلیکیشن مراکز درمانی کارآفرین به Google Sheets و سرویس ایمیل جیمیل
// شامل: ۱) گزارشات مراکز   ۲) جستجوهای کاربران   ۳) آمار دستگاه‌ها و کاربران   ۴) ارسال ایمیل کد تایید
// ========================================================

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    var item = JSON.parse(e.postData.contents);
    
    // ۱) ارسال ایمیل کد تایید دو مرحله‌ای به مدیر (2FA OTP)
    if (item.type === 'send_otp') {
      var targetEmail = "saeedjabbari21@gmail.com";
      var code = String(item.code || '');
      var subject = "🔐 کد تایید ورود به پنل مدیریت مراکز درمانی کارآفرین: " + code;
      var textBody = "کد یکبار مصرف دو مرحله‌ای ورود به پنل مدیریت مراکز درمانی کارآفرین:\n\n" +
                     code + "\n\n" +
                     "این کد به مدت ۵ دقیقه معتبر است.\n" +
                     "گروه صنعتی اسپوتا / بیمه کارآفرین استان آذربایجان غربی";
      var htmlBody = "<div dir='rtl' style='font-family: Tahoma, Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 18px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06);'>" +
        "<div style='background: #0a4c9a; padding: 26px; text-align: center; color: #ffffff;'>" +
          "<h2 style='margin: 0; font-size: 19px; font-weight: bold;'>بیمه کارآفرین</h2>" +
          "<p style='margin: 6px 0 0; font-size: 12.5px; color: #dbeafe;'>احراز هویت دو مرحله‌ای (2FA) پنل مدیریت مراکز</p>" +
        "</div>" +
        "<div style='padding: 26px; text-align: center; color: #1e293b;'>" +
          "<p style='font-size: 14px; margin-bottom: 22px;'>کد تایید یکبار مصرف شما جهت ورود به پنل مدیریت:</p>" +
          "<div style='background: #f8fafc; border: 2px dashed #0a4c9a; border-radius: 14px; padding: 18px; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #F15A31; font-family: monospace; display: inline-block; min-width: 220px;'>" +
            code +
          "</div>" +
          "<p style='font-size: 12.5px; color: #475569; margin-top: 22px;'>⏳ اعتبار کد: <strong>۵ دقیقه</strong></p>" +
          "<p style='font-size: 11.5px; color: #94a3b8; margin-top: 10px;'>اگر شما این درخواست را نداده‌اید، این پیام را نادیده بگیرید.</p>" +
        "</div>" +
      "</div>";

      MailApp.sendEmail({
        to: targetEmail,
        subject: subject,
        body: textBody,
        htmlBody: htmlBody
      });

      return ContentService.createTextOutput(JSON.stringify({ success: true, email: targetEmail }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // ۲) اگر داده از نوع ثبت جستجوی کاربر باشد
    if (item.type === 'search') {
      var searchSheet = ss.getSheetByName("جستجوهای کاربران");
      if (!searchSheet) {
        searchSheet = ss.insertSheet("جستجوهای کاربران");
      }
      
      // ساخت هدر در صورت خالی بودن شیت جستجوها
      if (searchSheet.getLastRow() === 0) {
        searchSheet.appendRow([
          'عبارت جستجو شده',
          'تعداد نتایج یافت‌شده',
          'مرکز انتخاب‌شده / اقدام',
          'فیلتر خیابان',
          'فیلتر دسته‌بندی',
          'تاریخ و زمان',
          'وضعیت تقاضا'
        ]);
        searchSheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#fed7aa');
      }
      
      var demandStatus = (Number(item.resultCount) === 0) ? '❌ ناموجود (فرصت قرارداد)' : '✅ یافت شد';
      var tehranTime = Utilities.formatDate(new Date(), "Asia/Tehran", "yyyy/MM/dd HH:mm:ss");
      
      searchSheet.appendRow([
        item.term || '',
        item.resultCount !== undefined ? item.resultCount : 0,
        item.clickedCenter || '—',
        item.selectedStreet || 'همه',
        item.selectedType || 'همه',
        tehranTime,
        demandStatus
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, target: 'search' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ۳) ثبت آمار کاربران، دستگاه‌ها و نصب PWA
    if (item.type === 'visit') {
      var visitSheet = ss.getSheetByName("آمار کاربران و دستگاه‌ها");
      if (!visitSheet) {
        visitSheet = ss.insertSheet("آمار کاربران و دستگاه‌ها");
      }
      
      if (visitSheet.getLastRow() === 0) {
        visitSheet.appendRow([
          'شناسه دستگاه',
          'نوع دستگاه',
          'مدل گوشی و دستگاه',
          'سیستم عامل',
          'مرورگر',
          'وضعیت نصب PWA',
          'رزولوشن صفحه',
          'دفعات بازدید',
          'تاریخ و زمان'
        ]);
        visitSheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#bbf7d0');
      }
      
      var tehranVisitTime = Utilities.formatDate(new Date(), "Asia/Tehran", "yyyy/MM/dd HH:mm:ss");
      
      visitSheet.appendRow([
        item.deviceId || 'نامشخص',
        item.deviceType || 'موبایل',
        item.model || 'نامشخص',
        item.os || 'نامشخص',
        item.browser || 'نامشخص',
        item.isPWA || 'مرورگر وب',
        item.screenResolution || '—',
        item.visitCount !== undefined ? item.visitCount : 1,
        tehranVisitTime
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({ success: true, target: 'visit' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // ۴) در غیر این صورت، گزارش مغایرت یا تغییر مشخصات مرکز است
    // بررسی الزامی بودن نام مرکز یا شناسه برای جلوگیری از ثبت سطرهای خالی ناشی از پینگ یا بدنه خالی
    if (!item || (!item.centerName && !item.centerId && !item.details)) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'سطر خالی رد شد (Missing centerName/centerId)' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var repSheet = ss.getSheetByName("گزارشات مراکز") || ss.getSheets()[0];
    if (repSheet.getName() === "جستجوهای کاربران" || repSheet.getName() === "آمار کاربران و دستگاه‌ها") {
      repSheet = ss.insertSheet("گزارشات مراکز");
    }
    
    // ساخت هدر در صورت خالی بودن شیت گزارشات
    if (repSheet.getLastRow() === 0) {
      repSheet.appendRow([
        'centerId',
        'centerName',
        'centerType',
        'reason',
        'reasonLabel',
        'details',
        'reporterContact',
        'status',
        'createdAt'
      ]);
      repSheet.getRange(1, 1, 1, 9).setFontWeight('bold').setBackground('#e2e8f0');
    }
    
    repSheet.appendRow([
      item.centerId || '',
      item.centerName || '',
      item.centerType || '',
      item.reason || '',
      item.reasonLabel || '',
      item.details || '',
      item.reporterContact || '',
      item.status || 'pending',
      item.createdAt || new Date().toISOString()
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ success: true, target: 'report' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var type = (e && e.parameter && e.parameter.type) ? e.parameter.type : 'reports';
  
  // ۱) بازگرداندن دیتای جستجوها
  if (type === 'searches') {
    var searchSheet = ss.getSheetByName("جستجوهای کاربران");
    if (!searchSheet || searchSheet.getLastRow() <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ searches: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var sData = searchSheet.getDataRange().getValues();
    var sHeaders = sData[0];
    var searches = [];
    for (var i = 1; i < sData.length; i++) {
      var sRow = sData[i];
      var sItem = {};
      for (var j = 0; j < sHeaders.length; j++) {
        sItem[sHeaders[j]] = sRow[j];
      }
      searches.push(sItem);
    }
    return ContentService.createTextOutput(JSON.stringify({ searches: searches }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // ۲) بازگرداندن دیتای آمار کاربران و دستگاه‌ها
  if (type === 'visits') {
    var visitSheet = ss.getSheetByName("آمار کاربران و دستگاه‌ها");
    if (!visitSheet || visitSheet.getLastRow() <= 1) {
      return ContentService.createTextOutput(JSON.stringify({ visits: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var vData = visitSheet.getDataRange().getValues();
    var vHeaders = vData[0];
    var visits = [];
    for (var k = 1; k < vData.length; k++) {
      var vRow = vData[k];
      var vItem = {};
      for (var m = 0; m < vHeaders.length; m++) {
        vItem[vHeaders[m]] = vRow[m];
      }
      visits.push(vItem);
    }
    return ContentService.createTextOutput(JSON.stringify({ visits: visits }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  // ۳) پیش‌فرض: بازگرداندن دیتای گزارشات مراکز
  var repSheet = ss.getSheetByName("گزارشات مراکز") || ss.getSheets()[0];
  if (!repSheet || repSheet.getLastRow() <= 1) {
    return ContentService.createTextOutput(JSON.stringify({ reports: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var data = repSheet.getDataRange().getValues();
  var headers = data[0];
  var reports = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rep = {};
    for (var j = 0; j < headers.length; j++) {
      rep[headers[j]] = row[j];
    }
    reports.push(rep);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ reports: reports }))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
