"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useSettings } from "@/context/settings-context"
import { useEffect, useState } from "react"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { translate, settings, updateSettings } = useSettings()
  const [mounted, setMounted] = useState(false)

  // Evitar problemas de hidratación
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    updateSettings({ ...settings, theme: newTheme as any })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full w-8 h-8 dark:hover:bg-muted/30"
      title={theme === "dark" ? translate("theme.switch_to_light") : translate("theme.switch_to_dark")}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">
        {theme === "dark" ? translate("theme.switch_to_light") : translate("theme.switch_to_dark")}
      </span>
    </Button>
  )
}

