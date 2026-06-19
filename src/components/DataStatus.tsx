interface DataStatusProps {
  source?: string
  snapshot?: string
  generatedAt?: string
  compact?: boolean
}

export default function DataStatus({ source, snapshot, generatedAt, compact = true }: DataStatusProps) {
  if (!source && !snapshot && !generatedAt) return null

  const parts: string[] = []
  if (source) parts.push(`Source ${source}`)
  if (snapshot) parts.push(`Snapshot ${snapshot}`)
  if (generatedAt) parts.push(`Generated ${generatedAt}`)

  return (
    <div className={['flex flex-wrap items-center gap-x-2 gap-y-1 text-slate-400', compact ? 'text-[10px]' : 'text-xs'].join(' ')}>
      {parts.map((part, i) => (
        <span key={i} className="rounded-full bg-slate-100 px-2 py-1">
          {part}
        </span>
      ))}
    </div>
  )
}
