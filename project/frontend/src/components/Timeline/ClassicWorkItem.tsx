import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOutlined } from '@ant-design/icons';
import type { ClassicWork } from '../../data/timelineEras';

interface ClassicWorkItemProps {
  work: ClassicWork;
}

const ClassicWorkItem: React.FC<ClassicWorkItemProps> = ({ work }) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleRead = () => {
    navigate(`/reading?chapter=${work.chapterId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleRead();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`${work.name}，${work.positioning}`}
      className="relative rounded-lg border border-[#D4A574]/50 bg-white/80 p-4 transition-all cursor-pointer hover:shadow-md"
      style={{
        boxShadow: isHovered ? '0 4px 12px rgba(139, 69, 19, 0.12)' : 'none',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleRead}
      onKeyDown={handleKeyDown}
    >
      {/* Alias tag */}
      <span className="inline-block text-xs px-2 py-0.5 rounded bg-[#A52A2A]/10 text-[#A52A2A] mb-2">
        {work.alias}
      </span>

      {/* Name */}
      <h4 className="text-lg font-bold text-[#2F2F2F] mb-1">{work.name}</h4>

      {/* Period */}
      <p className="text-xs text-[#8B7355] mb-2">{work.period}</p>

      {/* Positioning */}
      <p className="text-sm text-[#2F2F2F]/80 leading-relaxed">{work.positioning}</p>

      {/* Hover overlay with zhuQuote preview and read button */}
      {isHovered && (
        <div className="absolute inset-0 rounded-lg bg-white/95 p-4 flex flex-col justify-between border border-[#A52A2A]/30 transition-opacity animate-fadeIn">
          <p className="text-sm text-[#2F2F2F] leading-relaxed line-clamp-4">
            {work.zhuQuote}
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRead();
            }}
            className="mt-2 self-end flex items-center gap-1 px-3 py-1.5 rounded text-sm text-white bg-[#A52A2A] hover:bg-[#8B1A1A] transition-colors"
          >
            <BookOutlined />
            阅读此章
          </button>
        </div>
      )}
    </div>
  );
};

export default ClassicWorkItem;
