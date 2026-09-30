export function Loading({ label = 'Loading' }) {
  return <div className="inline-loading"><span className="loader" />{label}</div>;
}

export function ErrorMessage({ children }) {
  return children ? <p className="form-error" role="alert">{children}</p> : null;
}

export function EmptyState({ title, detail, action }) {
  return <div className="empty-state"><span className="empty-glyph">✳</span><h3>{title}</h3><p>{detail}</p>{action}</div>;
}
