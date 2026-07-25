import React from 'react';

export const LoadingSkeleton: React.FC<{ type?: 'card' | 'table' | 'profile' }> = ({
  type = 'card',
}) => {
  if (type === 'table') {
    return (
      <div className="w-full space-y-3 animate-pulse">
        <div className="h-10 bg-slate-200/80 rounded-xl w-full" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 bg-slate-100 rounded-xl w-full flex items-center justify-between px-4 gap-4">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-1/6" />
            <div className="h-6 bg-slate-200 rounded-full w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'profile') {
    return (
      <div className="p-6 bg-white rounded-2xl border border-slate-200 animate-pulse space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-200" />
          <div className="space-y-2 flex-1">
            <div className="h-5 bg-slate-200 rounded w-1/3" />
            <div className="h-3 bg-slate-200 rounded w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-4">
          <div className="h-12 bg-slate-100 rounded-xl" />
          <div className="h-12 bg-slate-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200 animate-pulse space-y-3">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="w-8 h-8 rounded-xl bg-slate-200" />
      </div>
      <div className="h-7 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-200 rounded w-2/3" />
    </div>
  );
};
