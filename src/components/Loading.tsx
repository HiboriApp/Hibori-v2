
import LeafLogo from "./LeafLogo"

const getStoredThemeColor = () => {
  if (typeof window === "undefined") {
    return "#4caf50"
  }

  return window.localStorage.getItem("hibori-theme-primary") || "#4caf50"
}

const Loading = () => {
  const themeColor = getStoredThemeColor()

  return (
<div className="w-full h-screen overflow-hidden relative flex justify-center items-center">
<div className="flex justify-center">
    <LeafLogo color={themeColor} className="h-36 w-36 fade-animation" />
    </div>
      </div>
)
}


export default Loading

