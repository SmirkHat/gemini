import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * Progressive-enhancement theme override.
 *
 * The baseline theme is pure CSS (prefers-color-scheme), so this button
 * is only an enhancement: it stores an explicit "light"/"dark" override
 * in localStorage and mirrors it as a class on <html>. Icon visibility
 * is driven by CSS (`dark:` variant), so there is no hydration mismatch.
 */
export function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const isDark = root.classList.contains("dark") || (systemDark && !root.classList.contains("light"))
    const next = isDark ? "light" : "dark"

    root.classList.remove("light", "dark")
    root.classList.add(next)
    try {
      localStorage.setItem("theme", next)
    } catch {
      // storage unavailable (private mode etc.)  -  override is session-only
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label="Přepnout motiv"
    >
      <Sun className="size-4 dark:hidden" aria-hidden="true" />
      <Moon className="hidden size-4 dark:block" aria-hidden="true" />
    </Button>
  )
}
