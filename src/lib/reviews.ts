import { getSheetsWebhookUrl } from './sheets';

export interface CenterReview {
  id: string;
  centerId: number;
  centerName: string;
  rating: number; // 1 to 5
  authorName?: string;
  phone?: string;
  comment: string;
  serviceCategory?: string;
  directDeduction?: 'yes' | 'no' | 'unknown'; // کسر آنلاین یا فاکتور دستی
  waitingTime?: 'short' | 'medium' | 'long'; // معطلی کم، متوسط، زیاد
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const STORAGE_KEY = 'krf_center_reviews';

// Default authentic sample reviews to demonstrate the feature with high quality
const DEFAULT_REVIEWS: CenterReview[] = [
  {
    id: 'rev-seed-1',
    centerId: 1, // بیمارستان امام رضا (ع)
    centerName: 'مرکز آموزشی و درمانی امام رضا (ع)',
    rating: 5,
    authorName: 'بیمه‌شده محترم',
    comment: 'پذیرش در بخش درمانگاه سریع انجام شد و با ثبت کدملی فرانشیز بیمه تکمیلی بدون معطلی کسر گردید. برخورد کادر پرستاری بسیار محترمانه بود.',
    directDeduction: 'yes',
    waitingTime: 'short',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'rev-seed-2',
    centerId: 2, // بیمارستان تخصصی و فوق تخصصی میلاد
    centerName: 'بیمارستان تخصصی و فوق تخصصی میلاد ارومیه',
    rating: 5,
    authorName: 'مراجعه‌کننده',
    comment: 'امکانات و تجهیزات عالی و مدرن بود. برای بستری و ترخیص هماهنگی با بیمه خیلی سریع انجام شد.',
    directDeduction: 'yes',
    waitingTime: 'short',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'rev-seed-3',
    centerId: 10,
    centerName: 'داروخانه شبانه‌روزی دکتر افشار',
    rating: 5,
    authorName: 'شهروند ارومیه‌ای',
    comment: 'داروهای خاص و نایاب رو موجود داشتن و تایید داروها در سامانه بیمه بدون مشکل ثبت شد.',
    directDeduction: 'yes',
    waitingTime: 'short',
    status: 'approved',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

/**
 * Get all reviews from localStorage, seeding with defaults if empty
 */
export function getAllReviews(): CenterReview[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REVIEWS));
      return DEFAULT_REVIEWS;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_REVIEWS;
  }
}

/**
 * Save reviews list to localStorage
 */
export function saveReviews(reviews: CenterReview[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  } catch (err) {
    console.warn('Error saving reviews to localStorage:', err);
  }
}

/**
 * Get approved reviews for a specific center (plus any pending reviews created by current user session)
 */
export function getCenterReviews(centerId: number): CenterReview[] {
  const all = getAllReviews();
  return all.filter((r) => r.centerId === centerId && (r.status === 'approved' || r.status === 'pending'));
}

/**
 * Calculate average rating and total approved review count for a center
 */
export function getCenterRatingSummary(centerId: number): { average: number; count: number } {
  const all = getAllReviews();
  const approved = all.filter((r) => r.centerId === centerId && r.status === 'approved');
  if (approved.length === 0) {
    return { average: 5.0, count: 0 };
  }
  const sum = approved.reduce((acc, r) => acc + r.rating, 0);
  const avg = Math.round((sum / approved.length) * 10) / 10;
  return { average: avg, count: approved.length };
}

/**
 * Submit a new review from a user
 */
export async function submitCenterReview(data: {
  centerId: number;
  centerName: string;
  rating: number;
  comment: string;
  authorName?: string;
  phone?: string;
  serviceCategory?: string;
  directDeduction?: 'yes' | 'no' | 'unknown';
  waitingTime?: 'short' | 'medium' | 'long';
}): Promise<CenterReview> {
  const newReview: CenterReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    centerId: data.centerId,
    centerName: data.centerName,
    rating: data.rating,
    comment: data.comment.trim(),
    authorName: (data.authorName && data.authorName.trim()) || 'بیمه‌شده محترم',
    phone: data.phone?.trim() || '',
    serviceCategory: data.serviceCategory || '',
    directDeduction: data.directDeduction || 'unknown',
    waitingTime: data.waitingTime || 'short',
    status: 'pending', // Requires admin approval
    createdAt: new Date().toISOString(),
  };

  const all = getAllReviews();
  all.unshift(newReview);
  saveReviews(all);

  // Sync to Google Sheets webhook in background
  const webhookUrl = getSheetsWebhookUrl();
  if (webhookUrl) {
    try {
      fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          type: 'center_review',
          centerId: newReview.centerId,
          centerName: newReview.centerName,
          rating: newReview.rating,
          comment: newReview.comment,
          authorName: newReview.authorName,
          phone: newReview.phone,
          status: newReview.status,
          createdAt: newReview.createdAt,
        }),
      }).catch(() => {});
    } catch {}
  }

  return newReview;
}

/**
 * Admin action: update review status (approve or reject)
 */
export function updateReviewStatus(reviewId: string, status: 'approved' | 'rejected'): void {
  const all = getAllReviews();
  const target = all.find((r) => r.id === reviewId);
  if (target) {
    target.status = status;
    saveReviews(all);
  }
}

/**
 * Admin action: delete review
 */
export function deleteReview(reviewId: string): void {
  const all = getAllReviews();
  const filtered = all.filter((r) => r.id !== reviewId);
  saveReviews(filtered);
}
