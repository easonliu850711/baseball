function getCentralApiBaseUrl(): string {
  const configured =
    process.env.CENTRAL_API_BASE_URL ||
    process.env.API_CORE_BASE_URL ||
    process.env.NEXT_PUBLIC_CENTRAL_API_BASE_URL

  if (configured) return configured.replace(/\/$/, '')

  return ''
}

function getCentralApiKey(): string {
  return (
    process.env.CENTRAL_API_KEY ||
    process.env.X_IMORI_API_KEY ||
    process.env.IMORI_API_KEY ||
    ''
  )
}

function buildCentralUrl(pathname: string, request?: Request): string {
  const base = getCentralApiBaseUrl()
  if (!base || !getCentralApiKey()) throw new Error('Central API configuration is unavailable')
  const origin = new URL(base)
  if (!['http:', 'https:'].includes(origin.protocol) || origin.username || origin.password ||
      origin.search || origin.hash || origin.pathname !== '/') throw new Error('Invalid Central API origin')
  if (!pathname.startsWith('/api/') || pathname.includes('..') || pathname.includes('\\')) {
    throw new Error('Invalid Central API path')
  }
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`
  const url = new URL(`${base}${path}`)

  if (request) {
    const incomingUrl = new URL(request.url)
    incomingUrl.searchParams.forEach((value, key) => {
      url.searchParams.set(key, value)
    })
  }

  return url.toString()
}

function buildForwardHeaders(requestHeaders?: HeadersInit): Headers {
  const headers = new Headers(requestHeaders)
  headers.delete('host')
  headers.delete('content-length')
  headers.delete('connection')
  headers.delete('accept-encoding')
  headers.delete('cookie')
  headers.delete('authorization')

  // Browser callers of baseball.studio-imori.com do not know the internal key.
  // The facade route must inject it server-side before calling api-core.
  headers.set('x-imori-api-key', getCentralApiKey())

  return headers
}

export async function proxyCentralApi(
  request: Request,
  pathname: string,
  init?: RequestInit,
): Promise<Response> {
  let url: string
  try { url = buildCentralUrl(pathname, request) }
  catch {
    return Response.json({ success: false, error: { code: 'SERVICE_UNAVAILABLE', message: '中央 API 設定尚未就緒' } },
      { status: 503, headers: { 'cache-control': 'no-store' } })
  }
  const headers = buildForwardHeaders(init?.headers || request.headers)
  const method = init?.method || request.method
  const hasBody = !['GET', 'HEAD'].includes(method.toUpperCase())

  const response = await fetch(url, {
    ...init,
    method,
    headers,
    body: hasBody ? await request.text() : undefined,
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(10000),
  })

  const responseHeaders = new Headers(response.headers)
  responseHeaders.delete('set-cookie')
  responseHeaders.set('Cache-Control', 'no-store, max-age=0')

  return new Response(['HEAD'].includes(method.toUpperCase()) || [204, 205, 304].includes(response.status) ? null : await response.arrayBuffer(), {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })
}

export async function fetchCentralApi<T>(
  pathname: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(buildCentralUrl(pathname), {
    ...init,
    headers: buildForwardHeaders(init?.headers),
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(10000),
  })

  if (!response.ok) {
    throw new Error(`Central API request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}
