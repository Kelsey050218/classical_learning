import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Popover } from 'antd';
import type { StreamConnection } from '../../data/timelineEras';

interface StreamLayerProps {
  eraRefs: Record<string, HTMLDivElement | null>;
  connections: StreamConnection[];
  highlightedEraId: string | null;
}

interface LineCoords {
  connection: StreamConnection;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const StreamLayer: React.FC<StreamLayerProps> = ({
  eraRefs,
  connections,
  highlightedEraId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<LineCoords[]>([]);

  const calculateCoords = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newCoords: LineCoords[] = [];

    for (const conn of connections) {
      const fromEl = eraRefs[conn.fromEraId];
      const toEl = eraRefs[conn.toEraId];
      if (!fromEl || !toEl) continue;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      newCoords.push({
        connection: conn,
        x1: fromRect.left + fromRect.width / 2 - containerRect.left,
        y1: fromRect.top + fromRect.height / 2 - containerRect.top,
        x2: toRect.left + toRect.width / 2 - containerRect.left,
        y2: toRect.top + toRect.height / 2 - containerRect.top,
      });
    }

    setCoords(newCoords);
  }, [eraRefs, connections]);

  useEffect(() => {
    calculateCoords();
    const timer = setTimeout(calculateCoords, 300); // wait for layout settle

    let ro: ResizeObserver | null = null;
    if (containerRef.current) {
      ro = new ResizeObserver(() => {
        window.requestAnimationFrame(calculateCoords);
      });
      ro.observe(containerRef.current);
    }

    window.addEventListener('resize', calculateCoords);
    return () => {
      clearTimeout(timer);
      ro?.disconnect();
      window.removeEventListener('resize', calculateCoords);
    };
  }, [calculateCoords]);

  const isHighlighted = (conn: StreamConnection) => {
    if (!highlightedEraId) return false;
    return conn.fromEraId === highlightedEraId || conn.toEraId === highlightedEraId;
  };

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-0">
      <svg className="w-full h-full">
        {coords.map(({ connection, x1, y1, x2, y2 }) => {
          const highlighted = isHighlighted(connection);
          const midX = (x1 + x2) / 2;
          const midY = (y1 + y2) / 2;
          // Control point for bezier curve
          const cpX = midX;
          const cpY = Math.max(y1, y2) + 40;

          return (
            <g key={connection.id} className="pointer-events-auto">
              <path
                d={`M ${x1} ${y1} Q ${cpX} ${cpY} ${x2} ${y2}`}
                fill="none"
                stroke={highlighted ? '#8B4513' : '#D4A574'}
                strokeWidth={highlighted ? 2 : 1}
                strokeDasharray={highlighted ? '0' : '4 4'}
                opacity={highlighted ? 0.9 : 0.4}
                style={{ transition: 'all 0.4s ease' }}
              />
              {highlighted && (
                <Popover
                  content={
                    <div className="max-w-xs">
                      <div className="font-medium text-[#2F2F2F] mb-2">{connection.label}</div>
                      <div className="text-sm text-[#2F2F2F] leading-relaxed">
                        {connection.zhuEvidence}
                      </div>
                      <div className="text-xs text-[#8B7355] mt-2 text-right">
                        ——朱自清《经典常谈》
                      </div>
                    </div>
                  }
                  trigger="click"
                >
                  <circle
                    cx={midX}
                    cy={midY + 20}
                    r={8}
                    fill="white"
                    stroke="#8B4513"
                    strokeWidth={1.5}
                    className="cursor-pointer"
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}
                  />
                </Popover>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default StreamLayer;
