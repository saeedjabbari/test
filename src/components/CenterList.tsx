import React from 'react';
import { CenterCard } from './CenterCard';
import { MedicalCenter } from '../data/centers';

interface CenterListProps {
  centers: MedicalCenter[];
  saved: Set<number>;
  onToggleSave: (k: number) => void;
  onOpenDetail: (center: MedicalCenter) => void;
  onCopyPhone: (phone: string, e: React.MouseEvent) => void;
}

export const CenterList: React.FC<CenterListProps> = React.memo(({
  centers,
  saved,
  onToggleSave,
  onOpenDetail,
  onCopyPhone,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {centers.map((center) => (
        <CenterCard
          key={center.k}
          center={center}
          isSaved={saved.has(center.k)}
          onToggleSave={onToggleSave}
          onOpenDetail={onOpenDetail}
          onCopyPhone={onCopyPhone}
        />
      ))}
    </div>
  );
});
