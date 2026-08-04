import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-slate-900/90 border border-slate-800 rounded-lg shadow-sm overflow-hidden',
        className
      )}
      {...props}
    >
      {header && <div className="px-6 py-4 border-b border-slate-800/80">{header}</div>}
      <div className="p-6">{children}</div>
      {footer && <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/40">{footer}</div>}
    </div>
  );
};
