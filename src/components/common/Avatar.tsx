interface Props {
  url: string | null
  name: string
  size?: number
}

export default function Avatar({ url, name, size = 32 }: Props) {
  const style = { width: size, height: size, fontSize: size / 2.5 }
  if (url) return <img src={url} alt="" style={style} className="shrink-0 rounded-full object-cover" />
  return (
    <span style={style} aria-hidden="true" className="flex shrink-0 items-center justify-center rounded-full bg-emerald-600 font-semibold text-white">
      {name.charAt(0).toUpperCase()}
    </span>
  )
}
