# Virtuoso — Landing Page

New webpage design by bedhabits on 2026

## Estrutura de arquivos

```
virtuoso-landing/
├── index.html          ← Página principal
├── css/
│   └── styles.css      ← Todos os estilos (tokens, fontes, componentes)
├── js/
│   └── main.js         ← Slideshow, galeria scroll-driven, ano no footer
├── img/                ← Imagens servidas pelo site (projetos, conceito)
├── menu/
│   └── menu.pdf        ← Cardápio (linkado na seção Menu)
└── public/
    └── fonts/          ← Bandit Condensed + Awesome Serif (self-hosted)
```

> **`imgs/`** fica fora da estrutura do site: é pasta local de staging (fotos brutas, materiais de trabalho). Não é referenciada no HTML/JS/CSS e está no `.gitignore`.

## Como usar no projeto Next.js (Cursor)

1. Copie a pasta `public/fonts/` para o `public/` do seu projeto Next.js
2. Extraia os `@font-face` do `styles.css` para seu arquivo de fonte global
3. Os tokens CSS (`:root { ... }`) podem virar `tailwind.config.js` colors
4. O JS de galeria scroll-driven pode ser reescrito como componente React com `useEffect` + `useRef`

## Adicionar fotos reais

### Hero (slideshow)
Substitua os `<div class="hero-slide" style="background:...">` por:
```html
<div class="hero-slide is-active" style="background-image: url('img/hero/01.jpg')"></div>
<div class="hero-slide" style="background-image: url('img/hero/02.jpg')"></div>
```
Ou via `<img>` com `object-fit: cover` dentro de cada `.hero-slide`.

### Galeria de projetos
Cada projeto vive em `img/projetos/{slug}/` com fotos numeradas `01.jpg`, `02.jpg`, … até `10.jpg` (ou `.png`/`.webp`). O JS detecta automaticamente quais existem e faz crossfade a cada ~4,5s.

```
img/projetos/
├── o-bar/
├── mesa/
├── collabs/
└── eventos/
```

Para adicionar fotos a um projeto, basta soltar arquivos numerados na pasta — sem editar HTML.

### Conceito
Coloque a bandeira em `img/conceito/01.jpg`.

## Paleta de cores (Brand Book 2024)

| Nome          | Hex       | Papel                              |
|---------------|-----------|------------------------------------|
| Verde Escuro  | `#00341C` | Fundo principal, chrome escuro     |
| Salmão        | `#FF888B` | CTAs, destaques, footer            |
| Roxo Profundo | `#4A0049` | Seção da carta, tom editorial      |
| Lilás         | `#9A80FA` | Eyebrows, detalhes sutis           |
| Verde Água    | `#3BC6AB` | Eyebrows no fundo escuro           |
| Vinho         | `#750016` | Acento secundário reserva          |
| Off-white     | `#F8F1F0` | Texto principal, backgrounds claros|

**Regra cromática (modelo LOEWE):** cor saturada < 20% de qualquer viewport.
A fotografia carrega a emoção cromática; a interface fica sóbria.

## Menu

O PDF do cardápio fica em `menu/menu.pdf` e é linkado em `index.html` (`href="menu/menu.pdf"`). Para atualizar, substitua esse arquivo mantendo o mesmo nome.

## Fontes web

As fontes estão em `public/fonts/`. Para performance em produção:
- Use apenas os pesos necessários (Light, Regular, Bold para Awesome Serif; Condensed para Bandit)
- Adicione `font-display: swap` (já configurado)
- Considere subsetting para reduzir o tamanho dos arquivos .otf

## Referências de design aplicadas

- **LOEWE** → disciplina cromática: a cor saturada é dose, não base
- **Brunello Cucinelli** → calor, espaço negativo, "ambiente sobre interface"
- **Death & Co** → carta de vinhos como lista editorial tipográfica, sem fotos por item
- **Hermès 2026** → ilustrações hand-drawn SVG (as criaturas no hero) como sinal de autenticidade
- **Noma/EMP** → slideshow cross-fade lento, sem parallax agressivo
- **Ace/Hoxton** → reserva sempre acessível na nav (botão "Reservar")
- **Aesop** → motion lento e "caro" (transitions 1.1–1.8s)
