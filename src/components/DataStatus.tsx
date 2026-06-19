interface DataStatusProps {
  source?: string
  snapshot?: string
  generatedAt?: string
  compact?: boolean
}

export default function DataStatus({ source, snapshot, generatedAt, compact = true }: DataStatusProps) {
  if (!source && !snapshot && !generatedAt) return null

  const parts: string[] = []
  if (source) parts.push(`Source: ${source}`)
  if (snapshot) parts.push(`Snapshot: ${snapshot}`)
  if (generatedAt) parts.push(`Generated: ${generatedAt}`)

  return (
    <div className={`flex items-center gap-1.5 text-stone-gray/40 ${compact ? 'text-[10px]' : 'text-xs'}`}>
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-1">·</span>}
          {part}
        </span>
      ))}
    </div>
  )
}
