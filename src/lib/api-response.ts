export function unwrapApiData<T = any>(payload: any): T {
  if (payload && typeof payload === 'object' && 'success' in payload && 'data' in payload) {
    return payload.data as T
  }
  return payload as T
}
