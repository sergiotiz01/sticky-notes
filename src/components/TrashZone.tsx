type TrashZoneProps = {
  active: boolean
}

export function TrashZone({ active }: TrashZoneProps) {
  return (
    <div className={active ? 'trash is-active' : 'trash'} aria-label="Trash zone">
      <svg className="trash__icon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v8h-2V9zm4 0h2v8h-2V9zM7 9h2v8H7V9z"
        />
      </svg>
      <span>{active ? 'Release to delete' : 'Drop here to delete'}</span>
    </div>
  )
}
