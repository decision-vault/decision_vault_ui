import { Slot } from '@radix-ui/react-slot'

export function Button({ variant = 'primary', className = '', asChild = false, ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold transition will-change-transform focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:ring-offset-0'
  const v =
    variant === 'primary'
      ? 'bg-blue-600 text-white shadow-sm hover:-translate-y-0.5 hover:bg-blue-700 active:translate-y-0'
      : 'bg-white text-zinc-900 ring-1 ring-zinc-200 hover:-translate-y-0.5 hover:bg-zinc-50'
  const Comp = asChild ? Slot : 'button'
  return <Comp className={`${base} ${v} ${className}`} {...props} />
}
