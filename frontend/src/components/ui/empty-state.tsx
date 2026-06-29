interface EmptyStateProps {
  message: string;
  description?: string;
}

export function EmptyState({ message, description }: EmptyStateProps) {
  return (
    <div className="flex-center flex-col gap-2 py-12">
      <p className="text-balance">{message}</p>
      {description && <p className="text-muted">{description}</p>}
    </div>
  );
}
