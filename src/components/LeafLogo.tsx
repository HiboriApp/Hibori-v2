type LeafLogoProps = {
  color?: string
  className?: string
}

function normalizeHex(color: string) {
  const trimmed = color.trim()
  if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(trimmed)) {
    return "#4caf50"
  }

  if (trimmed.length === 4) {
    return `#${trimmed[1]}${trimmed[1]}${trimmed[2]}${trimmed[2]}${trimmed[3]}${trimmed[3]}`.toLowerCase()
  }

  return trimmed.toLowerCase()
}

function hexToRgb(color: string) {
  const normalized = normalizeHex(color)
  return {
    red: parseInt(normalized.slice(1, 3), 16),
    green: parseInt(normalized.slice(3, 5), 16),
    blue: parseInt(normalized.slice(5, 7), 16),
  }
}

function rgbToHex(red: number, green: number, blue: number) {
  return `#${[red, green, blue]
    .map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0"))
    .join("")}`
}

function luminance(color: string) {
  const { red, green, blue } = hexToRgb(color)
  return (0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255
}

function adjustColor(color: string, amount: number) {
  const { red, green, blue } = hexToRgb(color)
  const target = amount >= 0 ? 255 : 0
  const mix = Math.abs(amount)

  return rgbToHex(
    red + (target - red) * mix,
    green + (target - green) * mix,
    blue + (target - blue) * mix,
  )
}

function getLeafShadowColor(color: string) {
  return luminance(color) <= 0.12 ? adjustColor(color, 0.2) : adjustColor(color, -0.2)
}

export default function LeafLogo({ color = "#4caf50", className = "h-8 w-8" }: LeafLogoProps) {
  const normalized = normalizeHex(color)
  const shadowColor = getLeafShadowColor(normalized)

  return (
    <svg
      viewBox="0 0 504.125 504.125"
      className={className}
      aria-hidden="true"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={shadowColor}
        d="M339.772 0s44.536 108.954-146.337 182.138C89.719 221.893 10.059 323.789 105.173 481.193c7.877-70.357 41.653-225.485 186.888-260.884 0 0-135.176 50.546-147.117 279.347 69.459 9.752 232.361 16.305 280.726-125.062C489.536 187.817 339.772 0 339.772 0Z"
      />
      <path
        fill={normalized}
        d="M145.007 498.704c147.456-58.849 254.748-196.71 269.556-361.283C384.418 56.107 339.772 0 339.772 0s44.536 108.954-146.337 182.138C89.719 221.893 10.059 323.789 105.173 481.193c7.877-70.357 41.653-225.485 186.888-260.884 0 0-134.774 50.42-147.054 278.395Z"
      />
      <circle cx="90.459" cy="171.985" r="13.785" fill={shadowColor} />
      <circle cx="133.782" cy="158.2" r="9.846" fill={normalized} />
      <circle cx="124.921" cy="64.662" r="24.615" fill={normalized} />
      <circle cx="200.736" cy="120.785" r="7.877" fill={normalized} />
      <circle cx="266.713" cy="76.477" r="22.646" fill={normalized} />
    </svg>
  )
}