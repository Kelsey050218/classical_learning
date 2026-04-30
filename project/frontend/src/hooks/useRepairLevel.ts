const LEVELS = [
  { min: 0, max: 0, name: '学徒', color: '#8B7355' },
  { min: 1, max: 3, name: '学徒', color: '#8B7355' },
  { min: 4, max: 6, name: '助手', color: '#2E5C8A' },
  { min: 7, max: 9, name: '匠人', color: '#556B2F' },
  { min: 10, max: 12, name: '专家', color: '#8B4513' },
  { min: 13, max: 13, name: '大师', color: '#C73E3A' },
]

export function useRepairLevel(completedCount: number) {
  const level = LEVELS.find(l => completedCount >= l.min && completedCount <= l.max) || LEVELS[0]
  return { name: level.name, color: level.color }
}
