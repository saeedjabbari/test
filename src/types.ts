export type TabType = 'centers' | 'saved' | 'guide';

export type SortOption = 'default' | 'name' | 'phone';

export interface FilterState {
  query: string;
  type: string;
  street: string;
  onlyNightShift: boolean;
  onlySaved: boolean;
  ownership: string;
  sortBy: SortOption;
}

export type ReportReason = 'phone' | 'address' | 'contract' | 'timing' | 'other';
export type ReportStatus = 'pending' | 'verified' | 'applied' | 'rejected';

export interface MedicalCenterReport {
  id?: string;
  centerId: number;
  centerName: string;
  centerType?: string;
  reason: ReportReason;
  reasonLabel?: string;
  details?: string;
  reporterContact?: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt?: string;
}
