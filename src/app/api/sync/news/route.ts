import { proxyCentralApi } from '@/lib/central-api-proxy'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(request: Request) {
  return proxyCentralApi(request, '/api/baseball/sync/news')
}
