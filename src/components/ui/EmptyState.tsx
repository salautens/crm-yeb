interface EmptyStateProps {
  message?: string
  icon?: React.ReactNode
}

export function EmptyState({ message = 'Nenhum resultado encontrado', icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-[#9ca3af]">
      {icon && <div className="mb-3 opacity-40">{icon}</div>}
      <p className="text-sm">{message}</p>
    </div>
  )
}
