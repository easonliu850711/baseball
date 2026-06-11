function getCentralApiBaseUrl(): string {
  const configured =
    process.env.CENTRAL_API_BASE_URL ||
    process.env.API_CORE_BASE_URL ||
    process.env.NEXT_PUBLIC_CENTRAL_API_BASE_URL

  if (configured) return configured.replace(/\/$/, '')

  // Safe local fallback for Studio Imori server deployment.
  // STG baseball normally listens on 4004, PROD baseball on 3004.
  const port = process.env.PORT || ''
  return port.startsWith('4') ? 'http://127.0.0.1:4005' : 'http://127.0.0.1:3005'
}

function getCentralApiKey(): string {
  return (
    process.env.CENTRAL_API_KEY ||
    process.env.X_IMORI_API_KEY ||
    process.env.IMORI_API_KEY ||
    'imori-api-key-202606'
  )
}

function buildCentralUrl(pathname: string, request?: Request): string {
  const base = getCentralApiBaseUrl()
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

  // Browser callers of baseball.studio-imori.com do not know the internal key.
  // The facade route must inject it server-side before calling api-core.
  if (!headers.has('x-imori-api-key')) {
    headers.set('x-imori-api-key', getCentralApiKey())
  }

  return headers
}

export async function proxyCentralApi(
  request: Request,
  pathname: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = buildForwardHeaders(init?.headers || request.headers)
  const method = init?.method || request.method
  const hasBody = !['GET', 'HEAD'].includes(method.toUpperCase())

  const response = await fetch(buildCentralUrl(pathname, request), {
    ...init,
    method,
    headers,
    body: hasBody ? await request.text() : undefined,
    cache: 'no-store',
  })

  const responseHeaders = new Headers(response.headers)
  responseHeaders.set('Cache-Control', 'no-store, max-age=0')

  return new Response(await response.arrayBuffer(), {
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
  })

  if (!response.ok) {
    throw new Error(`Central API request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}
