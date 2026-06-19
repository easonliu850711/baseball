export function unwrapApiData<T = any>(payload: any): T {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.data as T
  }
  return payload as T
}

export function extractMeta(payload: any): Record<string, any> {
  const data = unwrapApiData<any>(payload)
  return {
    ...(payload?.meta || {}),
    ...(data?.meta || {}),
    source: data?.source ?? data?.meta?.source ?? payload?.source,
    snapshot_date: data?.snapshot_date ?? data?.meta?.snapshot_date ?? payload?.snapshot_date,
    generatedAt: data?.generatedAt ?? payload?.meta?.generatedAt ?? payload?.generatedAt,
  }
}

export function extractPlayers(payload: any): any[] {
  const data = unwrapApiData<any>(payload)
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.players)) return data.players
  if (Array.isArray(data?.data?.players)) return data.data.players
  return []
}

export function extractNews(payload: any): any[] {
  const data = unwrapApiData<any>(payload)
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.news)) return data.news
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.data?.news)) return data.data.news
  if (Array.isArray(data?.data?.items)) return data.data.items
  return []
}

export function extractStandingsBlocks(payload: any): any[] {
  const data = unwrapApiData<any>(payload)
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.blocks)) return data.blocks
  if (Array.isArray(data?.standings)) return data.standings
  if (data?.teams && Array.isArray(data.teams)) return [data]
  return []
}
