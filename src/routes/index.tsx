import { createFileRoute } from "@tanstack/react-router"
import { ShieldCheck, Sparkles, Zap } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { WatermarkTool } from "@/components/watermark-tool"
import { siteConfig } from "@/lib/site-config"

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: siteConfig.title },
      { name: "description", content: siteConfig.description },
    ],
  }),
  component: HomePage,
})

const features = [
  {
    icon: Sparkles,
    title: "Viditelný vodoznak",
    description:
      "Automaticky přidá na obrázek vodoznak. Vybere se správná šablona podle poměru stran.",
  },
  {
    icon: ShieldCheck,
    title: "100% lokálně",
    description:
      "Všechno běží v prohlížeči. Obrázky se nikam neodesílají.",
  },
  {
    icon: Zap,
    title: "Přetáhni, vlož, nebo vyber",
    description:
      "Přetáhni obrázek myší, vlož ho Ctrl+V, nebo klikni na výběr ze souborů. Výsledek je hned hotový.",
  },
] as const

function HomePage() {
  return (
    <div className="mx-auto max-w-4xl">
      {/* Hero */}
      <section className="py-10 text-center md:py-16">
        <p className="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          SmirkHat.org
        </p>
        <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-5xl">
          Gemini Watermark
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">
          Přetáhni obrázek, vlož ho Ctrl+V, nebo klikni — a rovnou ho stáhni s vodoznakem.
          Jakýkoliv formát, všechno v prohlížeči.
        </p>
      </section>

      {/* Noscript fallback  -  required per SmirkHat.org progressive enhancement policy */}
      <noscript>
        <Card className="mb-8 border-primary/50 bg-primary/5">
          <CardContent className="p-6 text-center">
            <p className="font-medium text-primary">
              Pro přidání vodoznaku je potřeba JavaScript.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Práce s obrázky na Canvasu vyžaduje JavaScript  -  bez něj to bohužel
              nejde. Povol JavaScript nebo použij moderní prohlížeč.
            </p>
          </CardContent>
        </Card>
      </noscript>

      {/* Interactive watermark tool (client-side only) */}
      <WatermarkTool />

      {/* Features */}
      <section aria-label="Vlastnosti" className="mt-16 grid gap-6 pb-16 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="text-center">
            <CardContent className="p-6">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="size-5 text-primary" aria-hidden="true" />
              </div>
              <h2 className="mb-2 font-semibold">{feature.title}</h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
