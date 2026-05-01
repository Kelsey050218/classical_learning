export function useRepairLevel(completedCount: number, totalCount: number) {
  if (totalCount === 0) {
    return { name: '学徒', color: '#8B7355' }
  }

  const ratio = completedCount / totalCount

  if (ratio === 0) {
    return { name: '学徒', color: '#8B7355' }
  }
  if (ratio < 0.5) {
    return { name: '助手', color: '#2E5C8A' }
  }
  if (ratio < 0.8) {
    return { name: '匠人', color: '#556B2F' }
  }
  if (ratio < 1) {
    return { name: '专家', color: '#8B4513' }
  }
  return { name: '大师', color: '#C73E3A' }
}
