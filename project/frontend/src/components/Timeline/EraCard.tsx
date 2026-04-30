import React from 'react';
import type { TimelineEra } from '../../data/timelineEras';

interface EraCardProps {
  era: TimelineEra;
  isSelected: boolean;
  isMarked: boolean;
  icon: React.ReactNode;
  gradient: string;
  borderColor: string;
  onClick: () => void;
}

const EraCard: React.FC<EraCardProps> = ({
  era,
  isSelected,
  isMarked,
  icon,
  gradient,
  borderColor,
  onClick,
}) => {
  return (
    <div className="flex flex-col items-center relative" style={{ minWidth: '180px', maxWidth: '200px' }}>
      {/* Mark badge */}
      {isMarked && (
        <div
          className="absolute -top-2 -right-2 z-20 w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
          style={{ backgroundColor: '#A52A2A' }}
          title="已标记"
        >
          记
        </div>
      )}

      {/* Card */}
      <div
        className={`w-full rounded-xl border-2 bg-gradient-to-br ${gradient} ${borderColor} overflow-hidden transition-all cursor-pointer hover:shadow-lg ${
          isSelected ? 'ring-2 ring-[#C73E3A] scale-105 shadow-xl' : 'shadow-md'
        }`}
        onClick={onClick}
        style={{ backgroundColor: 'rgba(255, 253, 248, 0.9)' }}
      >
        {/* Image area */}
        <div className="h-28 w-full bg-gradient-to-b from-[#FAF8F3] to-white flex items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M0 0h20v20H0V0zm10 17a7 7 0 1 0 0-14 7 7 0 0 0 0 14z\'/%3E%3C/g%3E%3C/svg%3E")',
            }}
          />
          <div className="text-4xl opacity-40 text-[#C73E3A]">{icon}</div>
          {/* Decorative corners */}
          <div className="absolute top-1 right-1 w-6 h-6 border-t-2 border-r-2 border-[#C73E3A]/20 rounded-tr-md" />
          <div className="absolute bottom-1 left-1 w-6 h-6 border-b-2 border-l-2 border-[#C73E3A]/20 rounded-bl-md" />
        </div>

        {/* Content */}
        <div className="p-3 text-center">
          <span className="text-sm font-medium text-[#2F2F2F] block leading-tight">
            {era.name}
          </span>
          <span className="text-xs text-[#8B7355] mt-1 block">{era.periodRange}</span>
        </div>
      </div>
    </div>
  );
};

export default EraCard;
