import React from 'react';
import { Typography, Tag, Popover } from 'antd';
import { BookOutlined, VideoCameraOutlined } from '@ant-design/icons';
import ZhuQuoteBlock from './ZhuQuoteBlock';
import ClassicWorkItem from './ClassicWorkItem';
import PersonalMarkSection from './PersonalMarkSection';
import type { TimelineEra } from '../../data/timelineEras';
import type { EraPersonalMark } from '../../hooks/useTimelineMarks';
import type { TimelineNode } from '../../api/timelineNodes';

const { Title, Text } = Typography;

interface EraDetailPanelProps {
  era: TimelineEra;
  prevEra?: TimelineEra;
  mark?: EraPersonalMark;
  onMarkChange: (eraId: string, patch: Partial<EraPersonalMark>) => void;
  node?: TimelineNode;
  keyPointDetails?: Record<string, string>;
}

const EraDetailPanel: React.FC<EraDetailPanelProps> = ({
  era,
  prevEra,
  mark,
  onMarkChange,
  node,
  keyPointDetails,
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

      {/* Original node content (from API) */}
      {node && (
        <div className="mt-6 pt-6 border-t border-dashed border-[#D4A574]/50">
          <div className="flex items-center gap-3 mb-3">
            <Tag color="red">{node.era}</Tag>
            <Text className="text-danmo">{node.period}</Text>
          </div>
          <Title level={4} className="font-display !mb-3">
            {node.title}
          </Title>
          <div className="text-mohei leading-relaxed whitespace-pre-line mb-4">
            {node.content}
          </div>
          {node.key_points && node.key_points.length > 0 && keyPointDetails && (
            <div className="flex flex-wrap gap-2 mb-4">
              {node.key_points.map((point) => {
                const detail = keyPointDetails[point];
                const tag = (
                  <Tag
                    key={point}
                    icon={<BookOutlined />}
                    color="red"
                    className={detail ? 'cursor-help' : ''}
                  >
                    {point}
                  </Tag>
                );
                if (!detail) return tag;
                return (
                  <Popover
                    key={point}
                    content={
                      <div className="max-w-sm text-mohei leading-relaxed whitespace-pre-line">
                        {detail}
                      </div>
                    }
                    title={
                      <div className="flex items-center gap-2 font-display">
                        <BookOutlined className="text-[#C73E3A]" />
                        {point}
                      </div>
                    }
                    placement="top"
                    trigger="hover"
                  >
                    {tag}
                  </Popover>
                );
              })}
            </div>
          )}
          {node.video_urls && node.video_urls.length > 0 && (
            <div className="space-y-3 pt-2">
              <Text className="font-medium text-mohei flex items-center gap-2">
                <VideoCameraOutlined className="text-zhusha" />
                相关视频
              </Text>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {node.video_urls.map((url, idx) => {
                  const [bvidRaw, pageStr] = url.split('&');
                  const bvid = bvidRaw?.trim() || '';
                  const page = pageStr ? pageStr.replace('page=', '') : '1';
                  if (!/^BV[A-Za-z0-9]+$/.test(bvid)) {
                    return (
                      <div key={idx} className="rounded-lg border border-danmo-light p-4 text-danmo text-sm">
                        视频链接格式异常
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="rounded-lg overflow-hidden border border-danmo-light bg-black">
                      <iframe
                        src={`https://player.bilibili.com/player.html?bvid=${encodeURIComponent(bvid)}&page=${encodeURIComponent(page)}&high_quality=1&danmaku=0`}
                        scrolling="no"
                        frameBorder={0}
                        allowFullScreen
                        title={`B站视频 ${bvid}`}
                        className="w-full"
                        style={{ height: '220px' }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EraDetailPanel;
