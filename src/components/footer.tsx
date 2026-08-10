import { siteConfig } from "@/lib/site-config"

export function Footer() {
  return (
    <footer className="mt-auto border-t">
      <div className="container mx-auto flex flex-col items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <p>
            Vytvořeno{" "}
            <a
              href="https://smirkhat.org"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              SmirkHat.org
            </a>
          </p>
          <a
            href={siteConfig.github}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-primary"
          >
            Zdrojový kód
          </a>
        </div>
        <p className="text-xs text-muted-foreground/60 max-w-xl text-center leading-relaxed">
          Tento projekt není nijak spojený se společností Google, Google Gemini,
          ani žádnou jinou AI platformou. Jedná se o nezávislý edukativní projekt
          zkoumající vlastnosti AI vodoznaků. Všechny ochranné známky patří jejich
          vlastníkům.
        </p>
      </div>
    </footer>
  )
}
