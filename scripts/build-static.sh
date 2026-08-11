#!/bin/bash
set -e
CLIENT_DIR="dist/client"
ASSETS_DIR="$CLIENT_DIR/assets"
JS=$(ls $ASSETS_DIR/index-*.js | head -1 | sed 's|dist/client/||')
CSS=$(ls $ASSETS_DIR/app-*.css | head -1 | sed 's|dist/client/||')

cat > "$CLIENT_DIR/index.html" << ENDHTML
<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Gemini Watermark</title>
<meta name="description" content="Experimentální nástroj pro studium AI vodoznaků.">
<meta name="author" content="SmirkHat.org">
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#f7f7f5">
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#171717">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/$CSS">
<script>(function(){try{var t=localStorage.getItem("theme");if(t==="dark"||t==="light")document.documentElement.classList.add(t)}catch(e){}})()</script>
</head>
<body>
<a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground">Přeskočit na obsah</a>
<header class="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur"><div class="container mx-auto flex h-14 items-center justify-between gap-4 px-4"><a class="text-lg font-bold tracking-tight transition-colors hover:text-primary" href="/">Gemini Watermark</a><div class="flex items-center gap-1"><nav aria-label="Hlavní navigace" class="flex items-center gap-1"><a class="rounded-full px-4 py-2 text-sm font-medium bg-primary/10 font-bold text-primary" href="/">Domů</a></nav></div></div></header>
<main id="main" class="container mx-auto px-4 py-10"><div class="mx-auto max-w-4xl"><section class="py-10 text-center md:py-16"><p class="mb-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">SmirkHat.org</p><h1 class="mb-6 text-balance text-4xl font-bold tracking-tight md:text-5xl">Gemini Watermark</h1><p class="mx-auto mb-8 max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground">Přetáhni obrázek, vlož ho Ctrl+V, nebo klikni - a rovnou ho stáhni s vodoznakem. Jakýkoliv formát, všechno v prohlížeči.</p></section>
<div class="mx-auto max-w-4xl"><div class="relative rounded-xl border-2 border-dashed p-12 text-center cursor-pointer border-border hover:border-muted-foreground/50" role="button" tabindex="0" aria-label="Nahrát obrázek"><div class="flex flex-col items-center gap-3"><svg class="lucide lucide-upload size-10 text-muted-foreground" aria-hidden="true"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg><div><p class="text-lg font-medium">Přetáhni sem obrázek nebo klikni</p><p class="mt-1 text-sm text-muted-foreground">Jakýkoliv obrázek · max 50 MB</p></div></div></div></div>
<section aria-label="Vlastnosti" class="mt-16 grid gap-6 pb-16 md:grid-cols-3"><div class="rounded-lg border bg-card text-card-foreground shadow-sm text-center"><div class="p-6"><div class="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-primary/10"><svg class="lucide lucide-sparkles size-5 text-primary" aria-hidden="true"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/></svg></div><h2 class="mb-2 font-semibold">Viditelný vodoznak</h2><p class="text-sm leading-relaxed text-muted-foreground">Automaticky přidá na obrázek vodoznak. Vybere se správná šablona podle poměru stran.</p></div></div><div class="rounded-lg border bg-card text-card-foreground shadow-sm text-center"><div class="p-6"><div class="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-primary/10"><svg class="lucide lucide-shield-check size-5 text-primary" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg></div><h2 class="mb-2 font-semibold">100% lokálně</h2><p class="text-sm leading-relaxed text-muted-foreground">Všechno běží v prohlížeči. Obrázky se nikam neodesílají.</p></div></div><div class="rounded-lg border bg-card text-card-foreground shadow-sm text-center"><div class="p-6"><div class="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-primary/10"><svg class="lucide lucide-zap size-5 text-primary" aria-hidden="true"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg></div><h2 class="mb-2 font-semibold">Přetáhni, vlož, nebo vyber</h2><p class="text-sm leading-relaxed text-muted-foreground">Přetáhni obrázek myší, vlož ho Ctrl+V, nebo klikni na výběr ze souborů. Výsledek je hned hotový.</p></div></div></section></div></main>
<footer class="mt-auto border-t"><div class="container mx-auto flex flex-col items-center gap-2 px-4 py-6 text-sm text-muted-foreground"><div class="flex flex-wrap items-center justify-center gap-x-4 gap-y-1"><p>Vytvořeno <a href="https://smirkhat.org" target="_blank" rel="noopener noreferrer" class="font-medium text-primary hover:underline">SmirkHat.org</a></p><a href="https://github.com/SmirkHat/gemini" target="_blank" rel="noopener noreferrer" class="transition-colors hover:text-primary">Zdrojový kód</a></div><p class="text-xs text-muted-foreground/60 max-w-xl text-center leading-relaxed">Tento projekt není nijak spojený se společností Google, Google Gemini, ani žádnou jinou AI platformou. Jedná se o nezávislý edukativní projekt zkoumající vlastnosti AI vodoznaků.</p></div></footer>
<script type="module" src="/$JS"></script>
</body>
</html>
ENDHTML
echo "Generated static index.html with SSR shell ($(wc -c < $CLIENT_DIR/index.html) bytes) [$JS / $CSS]"
