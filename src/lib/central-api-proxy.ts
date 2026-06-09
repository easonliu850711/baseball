const CENTRAL_API_BASE_URL = process.env.CENTRAL_API_BASE_URL

function getCentralApiBaseUrl(): string {
  if (!CENTRAL_API_BASE_URL) {
    throw new Error('CENTRAL_API_BASE_URL is not configured')
  }
  return CENTRAL_API_BASE_URL.replace(/\/$/, '')
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

export async function proxyCentralApi(
  request: Request,
  pathname: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers || request.headers)
  headers.delete('host')
  headers.delete('content-length')
  headers.delete('connection')
  headers.delete('accept-encoding')

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
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Central API request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}
