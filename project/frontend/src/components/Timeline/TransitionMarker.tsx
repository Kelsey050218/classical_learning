import React, { useState, useEffect, useRef } from 'react';

interface TransitionMarkerProps {
  text: string;
}

const TransitionMarker: React.FC<TransitionMarkerProps> = ({ text }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative flex items-center justify-center py-1" style={{ minWidth: '80px' }}>
      {/* Ink bloom effect */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: visible ? 0.6 : 0,
          transform: visible ? 'scale(3)' : 'scale(0.5)',
          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s ease',
        }}
      >
        <div
          className="w-8 h-6 rounded-full"
          style={{
            background: 'radial-gradient(ellipse 60% 40% at center, rgba(47,47,47,0.12) 0%, rgba(47,47,47,0.04) 40%, transparent 70%)',
          }}
        />
      </div>

      {/* Dot */}
      <div
        className="relative z-10 w-1.5 h-1.5 rounded-full transition-opacity duration-500"
        style={{ backgroundColor: '#5C5C5C', opacity: visible ? 0.8 : 0.3 }}
      />

      {/* Text tooltip on hover */}
      <div className="group absolute inset-0 flex items-center justify-center cursor-help">
        <span
          className="absolute top-full mt-1 text-center text-xs whitespace-nowrap transition-all duration-500 pointer-events-none"
          style={{
            color: '#5C5C5C',
            fontFamily: 'serif',
            opacity: visible ? 0.9 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(-4px)',
            maxWidth: '120px',
            whiteSpace: 'normal',
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
};

export default TransitionMarker;
