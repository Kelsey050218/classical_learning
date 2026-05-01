import React from 'react';

interface ZhuQuoteBlockProps {
  quote: string;
  source?: string;
  className?: string;
}

const ZhuQuoteBlock: React.FC<ZhuQuoteBlockProps> = ({
  quote,
  source = '朱自清《经典常谈》',
  className = '',
}) => {
  return (
    <div
      className={`relative rounded-lg border border-[#D4A574] bg-[#FAF8F3] pl-4 pr-4 py-4 ${className}`}
      style={{ borderLeftWidth: '3px', borderLeftColor: '#A52A2A' }}
    >
      <span
        className="absolute top-1 left-2 text-4xl leading-none select-none"
        style={{ color: 'rgba(139, 69, 19, 0.3)', fontFamily: 'serif' }}
      >
        &#8220;
      </span>
      <p
        className="relative z-10 text-[#2F2F2F] text-base leading-relaxed pt-4"
        style={{ lineHeight: 1.8 }}
      >
        {quote}
      </p>
      <p className="text-right text-xs italic text-[#8B4513] mt-2">
        ——{source}
      </p>
    </div>
  );
};

export default ZhuQuoteBlock;
