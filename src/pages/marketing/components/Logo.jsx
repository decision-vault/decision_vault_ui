import logo from '../../../assets/logo.svg'

export function Logo({ size = 28 }) {
  return (
    <div className="inline-flex items-center gap-2">
      <img src={logo} alt="Kavi AI logo" width={size} height={size} style={{ borderRadius: 6 }} />
      <span className="text-sm font-semibold tracking-tight text-zinc-900">Kavi AI</span>
    </div>
  )
}
