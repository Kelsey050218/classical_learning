import React from 'react';
import ZhuQuoteBlock from './ZhuQuoteBlock';
import ClassicWorkItem from './ClassicWorkItem';
import PersonalMarkSection from './PersonalMarkSection';
import type { TimelineEra } from '../../data/timelineEras';
import type { EraPersonalMark } from '../../hooks/useTimelineMarks';

interface EraDetailPanelProps {
  era: TimelineEra;
  prevEra?: TimelineEra;
  mark?: EraPersonalMark;
  onMarkChange: (eraId: string, patch: Partial<EraPersonalMark>) => void;
}

const EraDetailPanel: React.FC<EraDetailPanelProps> = ({
  era,
  prevEra,
  mark,
  onMarkChange,
}) => {
  return (
    <div className="animate-fadeIn rounded-xl border border-[#D4A574]/50 bg-white/60 p-6 backdrop-blur-sm">
      {/* Transition narrative from prev era */}
      {prevEra?.transitionToNext && (
        <div className="text-center py-3 mb-4 border-b border-dashed border-[#D4A574]/50">
          <span className="text-sm text-[#8B7355] italic" style={{ fontFamily: 'serif' }}>
            {prevEra.transitionToNext}
          </span>
        </div>
      )}

      {/* Era summary quote */}
      <ZhuQuoteBlock quote={era.eraQuote} className="mb-6" />

      {/* Two column layout: works grid + personal mark */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Works grid - takes 2/3 */}
        <div className="md:col-span-2">
          <h4 className="text-base font-medium text-[#2F2F2F] mb-3">核心典籍</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {era.works.map(work => (
              <ClassicWorkItem key={work.id} work={work} />
            ))}
          </div>
        </div>

        {/* Personal mark section - takes 1/3 */}
        <div className="md:col-span-1">
          <PersonalMarkSection
            eraId={era.id}
            works={era.works}
            mark={mark}
            onChange={onMarkChange}
          />
        </div>
      </div>
    </div>
  );
};

export default EraDetailPanel;
