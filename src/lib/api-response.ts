/**
 * unwrapApiData extracts the `data` field from a `{ success, data, meta, warnings }`
 * wrapper response, which is the standard format returned by the api-core proxy
 * layer (BASEBALL-PROD / BASEBALL-STG).
 *
 * It also handles nested access patterns:
 *   - data.players  → returns { players }
 *   - data.news     → returns { news }
 *   - data.games    → returns array → re-wraps as { items: [...] }
 *   - plain data    → returned as-is
 *   - plain array   → re-wraps as { items: [...] }
 */
export function unwrapApiData<T = any>(payload: any): T {
  if (!payload || typeof payload !== 'object') return payload as T

  // Step 1: unwrap { success, data, ... } → data
  const raw = payload?.data ?? payload

  if (raw === null || raw === undefined) return raw as T

  // Step 2: if raw is a plain array, re-wrap as { items }
  if (Array.isArray(raw)) {
    // If items are players/news/stadiums, keep as-is
    // otherwise wrap
    return { items: raw } as T
  }

  if (typeof raw === 'object') {
    // Common patterns:
    //   { players: [...], total: N, meta: {...} }
    //   { news: [...], total: N }
    //   { teams: [...], ... }
    // If it has a known collection key, return as-is (the consumer reads it directly)
    return raw as T
  }

  return raw as T
}

/**
 * Convenience: directly get an array of players from an API response.
 * Handles all the nesting variations we've seen across deployments.
 */
export function extractPlayers(payload: any): any[] {
  if (!payload || typeof payload !== 'object') return []

  const data = payload?.data ?? payload

  if (Array.isArray(data)) return data
  if (Array.isArray(data?.players)) return data.players

  // Nested in some legacy wrappers
  if (Array.isArray(data?.data?.players)) return data.data.players

  return []
}

/**
 * Convenience: get the "total" count if present in the response.
 */
export function extractTotal(payload: any): number | null {
  const data = payload?.data ?? payload
  if (data && typeof data === 'object') {
    if (typeof data.total === 'number') return data.total
    if (typeof data.total === 'string') return parseInt(data.total, 10) || null
  }
  return null
}

/**
 * Convenience: get the "meta" sub-object (last_updated, source, etc.)
 */
export function extractMeta(payload: any): Record<string, any> | null {
  const data = payload?.data ?? payload
  if (data?.meta && typeof data.meta === 'object') return data.meta
  return payload?.meta ?? null
}
