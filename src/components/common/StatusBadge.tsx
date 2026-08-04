import React from 'react';
import { ProductStatus } from '../../types/product';
import { getStatusColor, cn } from '../../lib/utils';

interface StatusBadgeProps {
  status: ProductStatus;
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showDot = true,
}) => {
  const info = getStatusColor(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium border transition-colors',
        info.bg,
        info.text,
        info.border,
        className
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full', info.dot)} />}
      {info.label}
    </span>
  );
};
