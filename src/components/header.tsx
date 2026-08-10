import { Link } from "@tanstack/react-router"

import { GithubIcon } from "@/components/icons/github"
import { ThemeToggle } from "@/components/theme-toggle"
import { buttonVariants } from "@/components/ui/button"
import { siteConfig } from "@/lib/site-config"
import { cn } from "@/lib/utils"

const navigation = [{ name: "Domů", href: "/" }] as const

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight transition-colors hover:text-primary"
        >
          {siteConfig.name}
        </Link>

        <div className="flex items-center gap-1">
          <nav aria-label="Hlavní navigace" className="flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                activeProps={{
                  className: "bg-primary/10 font-bold text-primary",
                }}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <a
            href={siteConfig.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
          >
            <GithubIcon className="size-4" aria-hidden="true" />
          </a>

          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
