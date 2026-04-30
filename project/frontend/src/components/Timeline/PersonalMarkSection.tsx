import React, { useState, useCallback } from 'react';
import type { ClassicWork } from '../../data/timelineEras';
import type { EraPersonalMark } from '../../hooks/useTimelineMarks';

interface PersonalMarkSectionProps {
  eraId: string;
  works: ClassicWork[];
  mark?: EraPersonalMark;
  onChange: (eraId: string, patch: Partial<EraPersonalMark>) => void;
}

const PersonalMarkSection: React.FC<PersonalMarkSectionProps> = ({
  eraId,
  works,
  mark,
  onChange,
}) => {
  const [localUnderstanding, setLocalUnderstanding] = useState(mark?.myUnderstanding || '');

  const handleFavoriteChange = (workId: string) => {
    const next = mark?.favoriteWorkId === workId ? undefined : workId;
    onChange(eraId, { favoriteWorkId: next });
  };

  const handleBlur = useCallback(() => {
    onChange(eraId, { myUnderstanding: localUnderstanding });
  }, [eraId, localUnderstanding, onChange]);

  return (
    <div className="space-y-5">
      {/* Favorite work selection */}
      <div>
        <h5 className="text-sm font-medium text-[#2F2F2F] mb-3">最感兴趣的作品</h5>
        <div className="flex flex-wrap gap-2">
          {works.map(work => {
            const isSelected = mark?.favoriteWorkId === work.id;
            return (
              <button
                key={work.id}
                onClick={() => handleFavoriteChange(work.id)}
                className="px-3 py-1.5 rounded border text-sm transition-all"
                style={{
                  borderColor: isSelected ? '#A52A2A' : '#D4A574',
                  backgroundColor: isSelected ? 'rgba(165, 42, 42, 0.08)' : 'transparent',
                  color: isSelected ? '#A52A2A' : '#2F2F2F',
                }}
              >
                {work.alias}
              </button>
            );
          })}
        </div>
      </div>

      {/* My understanding textarea */}
      <div>
        <h5 className="text-sm font-medium text-[#2F2F2F] mb-3">我的理解</h5>
        <div className="relative">
          <textarea
            value={localUnderstanding}
            onChange={(e) => setLocalUnderstanding(e.target.value)}
            onBlur={handleBlur}
            maxLength={200}
            placeholder="在此留下你的朱批……"
            className="w-full h-28 p-3 rounded text-sm resize-none outline-none focus:ring-1 focus:ring-[#D4A574]"
            style={{
              border: '1px dashed #D4A574',
              backgroundColor: 'rgba(245, 240, 232, 0.6)',
              fontFamily: "'STKaiti', 'KaiTi', '楷体', cursive",
              color: '#2F2F2F',
            }}
          />
          <span className="absolute bottom-2 right-2 text-xs text-[#8B7355]">
            {localUnderstanding.length}/200
          </span>
        </div>
      </div>
    </div>
  );
};

export default PersonalMarkSection;
