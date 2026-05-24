import { readFileSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const pkgPath = join(process.cwd(), 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

  return Response.json({
    name: pkg.name,
    version: pkg.version,
    description: pkg.description,
    environment: process.env.NODE_ENV || 'development',
    updatedAt: new Date().toISOString(),
  })
}
