import { useState, useCallback } from 'react';

export interface EraPersonalMark {
  favoriteWorkId?: string;
  myUnderstanding: string;
  updatedAt: string;
}

const STORAGE_KEY = 'classic_timeline_marks_v1';

function useTimelineMarks() {
  const [marks, setMarks] = useState<Record<string, EraPersonalMark>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const updateMark = useCallback((eraId: string, patch: Partial<EraPersonalMark>) => {
    setMarks(prev => {
      const existing = prev[eraId] || { myUnderstanding: '', updatedAt: new Date().toISOString() };
      const next: EraPersonalMark = {
        ...existing,
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      const updated = { ...prev, [eraId]: next };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isMarked = useCallback((eraId: string): boolean => {
    const m = marks[eraId];
    return !!(m?.favoriteWorkId || (m?.myUnderstanding || '').trim());
  }, [marks]);

  const getMark = useCallback((eraId: string): EraPersonalMark | undefined => {
    return marks[eraId];
  }, [marks]);

  return { marks, updateMark, isMarked, getMark };
}

export default useTimelineMarks;
