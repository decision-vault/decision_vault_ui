export function Button({ variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition will-change-transform focus:outline-none focus:ring-2 focus:ring-cyan-300/50 focus:ring-offset-0'
  const v =
    variant === 'primary'
      ? 'bg-zinc-900 text-white shadow-soft hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0 dark:bg-white dark:text-zinc-950'
      : 'bg-zinc-950/5 text-zinc-900 ring-1 ring-zinc-900/10 hover:bg-zinc-950/8 hover:-translate-y-0.5 dark:bg-white/5 dark:text-white dark:ring-white/10 dark:hover:bg-white/8'
  return <button className={`${base} ${v} ${className}`} {...props} />
}

