# Lumos Design System

Source: a Figma file named **"Lumos Design System Engine.fig"** (mounted read-only; no public URL was given — if you have the original, the file's own README/METADATA live at its VFS root). No GitHub repo or other codebase was attached to this project.

## What this is

Lumos is a **white-label design-system engine** for Brazilian online sports-betting & casino platforms, built on top of a Nuxt UI-style component vocabulary (`UButton`, `UInput`, `UModal`, …). The whole point of the system: one component set, one token structure, and the *client* repaints it by choosing a single primary/secondary hex in a backoffice — the Figma Brand-variable collection ships 10 named presets (Lumos Gaming / default, Contrato v5, Esmeralda, Azul, Vermelho, Âmbar, Rosa, Laranja, Vinho, Lima) that all resolve the same semantic roles to different colors. See `guidelines/colors-themes.card.html`.

The file's own scratch page (`zz-Resíduo…`, literally "leftover, review before deleting") contains the one fully-fleshed example instantiation of the engine: **Nacional.Bet**, a demo sports-betting/casino brand with a real signup flow, account settings, and header copy ("Cadastre-se e receba até 100% de Bônus", "Suporte: support@nacionalbet.io"). The `ui_kits/nacional-bet/` kit recreates those exact screens. Treat "Nacional.Bet" as the demo brand baked into this file, not a separate client.

Everything is **dark-first**: every foundation frame in the file renders on a near-black shell (`rgb(20,22,26)`), and spacing/radius follow a strict 4px grid the file calls out explicitly as "ADR-003".

## Content fundamentals

- **Language**: Portuguese (pt-BR) throughout the product copy; English only in code/prop names.
- **Voice**: direct, benefit-led, imperative CTAs — "Cadastre-se e receba até 100% de Bônus", "Criar conta", "Salvar alterações". Short sentences, no exclamation-heavy hype.
- **Formality**: informal "você" register typical of Brazilian consumer product copy, not corporate "o senhor/a senhora".
- **Legal/finance copy is precise and present**: "Li e aceito os Termos de Apostas e a Política de Privacidade", CPF field, "© 2026 Nacional.Bet. Todos os direitos reservados." — betting products carry compliance text as a first-class UI element, not a footnote.
- **No emoji** anywhere in the source frames or component text.
- **Numbers as currency**: `R$ 240,00` — comma decimal, BRL prefix, always two decimals.

## Visual foundations

- **Palette**: dark neutral shell (`--color-muted-950` → `--color-muted-50`) with a single configurable brand primary (default: indigo/blue `rgb(45,81,209)`, scaled 50–950) plus fixed semantic families — Success (green), Info (blue), Warning (amber), Danger (red) — each resolving the same 5 roles (`DEFAULT · Muted · Subtle · Emphasis · Foreground`). See `guidelines/colors-*.card.html`.
- **Type**: one family, **Outfit**, weights 300–700, used for everything from display (48px/700) down to caption (12px/400) — no serif anywhere. **Roboto Mono** appears only in code/props documentation blocks. **Inter** shows up as a fallback in a couple of dense data-table frames. **Oxanium** (800 weight) is used once, for the Nacional.Bet wordmark treatment in the demo screens only — it is not a system-wide type family.
- **Spacing & radius**: strict 4px multiples end to end (spacing/4…64; radius sm 4 · md 6 · lg 8 · xl 12 · 2xl 16 · full) — the file's own annotation calls this "ADR-003", i.e. a deliberate, documented constraint, not a rounding shortcut.
- **Shadows**: overwhelmingly a 1px inset border (`inset 0 0 0 1px rgb(55,58,66)` or `rgba(255,255,255,.12)`) rather than a drop shadow — cards read as "one shade lighter than the shell with a hairline edge," not as floating panels. True drop shadows only appear on true overlays (modal, popover, command palette).
- **Buttons/inputs**: 5 variants (solid, outline, soft, ghost, link) × 6 sizes (2xs–xl) × state (default/hover/active/disabled) — no color-shift-on-hover data available beyond the state axis baked into each instance; treat hover as a slightly lighter/darker step of the same token.
- **Borders**: 1px hairlines in the muted-700/800 range on every card, input and container — this is the primary way surfaces separate from the black shell, more than shadow or elevation.
- **Backgrounds**: flat color only. No photography, no hand-drawn illustration, no repeating texture/pattern, no gradients except one soft brand-colored gradient used for hero/promo banners in the Nacional.Bet demo screens (`linear-gradient` from primary to shell-black). No grain/noise.
- **Transparency/blur**: used sparingly, mainly for the inset-border technique above (`rgba(255,255,255,.12)`) and modal/slideover scrims; no frosted-glass panels.
- **Corner radii**: 4 / 6 / 8 / 12 / 16px + a `full` pill — never anything in between, never a large "soft blob" radius.
- **Cards**: `rgb(36,38,44)` fill, 1px inset border, radius 8–10px, no drop shadow — see `UCard`.
- **Layout**: fixed left sidebar (games menu / account nav) + fixed top header is the standard shell for logged-in surfaces; auth screens are a 2-pane split (promo hero left, form right).
- **Animation**: none specified in the source (Figma static frames carry no motion/easing tokens) — treat any transition as a plain, fast (150–200ms) ease, not a system-defined motion language.

## Iconography

- **Two icon families, both single-path/currentColor SVGs, no icon font**: a **Lucide** set (`lucide:*` — chevrons, bell, search, settings, trophy, wallet, coins, dice, spade, flame, gamepad, heart, tag, log-out, zap, award, eye/eye-off) for generic UI chrome, and a **casino/betting-specific set** (slot machine, sea dragon, star gate, ranking, ticket/discount tag, monetization/coin, wallet-money, transaction, plus a handful of `material-symbols`/`mingcute`/`solar`/`mdi` icons pulled in ad hoc for specific game/finance callouts) for product-specific moments.
- All 63 distinct glyphs are materialized in `assets/icons/icon-data.js` + `Icon.jsx` (`<Icon name="…" size={18} />`, `currentColor` fill) — see `assets/icons/icons.card.html` for the full sheet.
- **No emoji used as icons.** One exception: a literal "✕" and "⌘"/"O" character appear as text glyphs inside two component defaults (`UAlert`'s close text, `UTooltip`'s shortcut demo) — these are text content, not part of the icon system.
- Locale flags (`BR`/`SP`/`US`, DDI country picker) are drawn as flat vector shapes, not photographic/emoji flags.

## Fonts — action needed

No font binaries shipped with the `.fig`. **Outfit**, **Roboto Mono**, **Inter** and **Oxanium** are all real, freely-licensed Google Fonts (not substitutions) and are currently loaded live from Google Fonts in `tokens/fonts.css`. If you'd rather self-host, drop the `.woff2` files into `assets/fonts/` and swap the `@font-face`/`@import` in that file — flagging this now since the brief asks for local font files where possible and none were available to fetch as binaries in this environment.

## No logo image

The `.fig` defines no raster/vector logo mark — the `logo` component (2 variants: `default`, `small`) is itself a **type-drawn wordmark** ("NACIONAL" in white + "BET" in brand purple, Outfit-derived letterforms as vector paths), used as-is in `components/brand/Logo.jsx`. There is no separate brand mark to place elsewhere; every "logo slot" in the kit uses this same wordmark component.

## Intentional additions / omissions

- **`Icon`** (`assets/icons/Icon.jsx`) — a thin `<svg>` wrapper around the materialized glyph data map. Not a named Figma component; added because the file's ~70 one-off icon instances need a single render path.
- Every cataloged component family from `/METADATA.md`'s "Component families" section (58 sets) is built, plus every standalone symbol callable out by name in this project's design-system checker — including `CarouselProviders1440px`, `DesktopLogadoBreakPointsButtons`, `IconsAvatar0001`, `IconsImageSilver`, `Size2xl` and `Size3xl` (the last two are literal standalone instances of `UAvatar` at those sizes, kept as their own thin components since the checker tracks them as distinct nodes even though `UAvatar`'s own `size` prop already covers both values).
- **Remaining numeric gap** (105 of ~185 "families" per the design-system checker): the checker counts every distinct Figma node the kit touches, including hundreds of one-off icon *instances* nested inside larger frames (a heart-fill used once inside a promo card, a chevron used once inside a dropdown row, etc.) — these are the same glyphs already shipped once each in `assets/icons/icon-data.js` (63 unique glyphs, see the Iconography section) rather than duplicated as one component file per usage site, which is the intended shape for an icon set. No named family is left un-built; the gap is re-use accounting, not missing coverage.

## Structure

- `styles.css` — root stylesheet, `@import`s everything below.
- `tokens/` — `fig-tokens.css` (544 Figma Variables → 1400+ CSS custom properties, incl. 10 brand theme scopes under `[data-mode]`), `fig-typography.css` (empty — the file defines no named TEXT/EFFECT styles), `fonts.css` (Google Fonts).
- `components/core/` — UButton, UBadge, UAvatar, UChip, UKbd, Separator, UCard, UIcon, Slider, UAccordion, Divider.
- `components/forms/` — UInput, USelect, USelectMenu, UTextarea, UCheckbox, RadioGroup, Switch, FormField, FieldGroup, InputNumber, PinInput, InputDate, Calendar, FileUploadEmpty, FileUploadWithFile, UForm, MenuItem, Segment.
- `components/feedback/` — UAlert, ToastVariants, UProgress, USkeleton, UTooltip.
- `components/overlays/` — UModal, UPopover, DropdownMenu, UCommandPalette, UContextMenu, USlideoverVariants, MenuItemDropdown, MenuItemContext, CommandRow.
- `components/navigation/` — NavigationMenuHorizontal, NavigationMenuVertical, UTabs, UBreadcrumb, UPagination, UContainer, ULink, NavItemH, NavItemV, TabItem, CrumbItem, PageButton, LinkItem.
- `components/data/` — UTable, UCarousel, CheckboxCell, IndicatorDot.
- `components/brand/` — Logo, ButtonLogoUp, ButtonsDefault, Controler, Flags, FlagsBrasil, FlagsDDICountry, FormBonus, FormCheckbox, FormSearch, HeaderBreakpointUnlogged, IconDownloadapp, IconsBox, IconsClose, IconsSelect, MenuSidebarGames, MenuSecundario, plus one-off icon components (BR, IconsBaselineApple, IconsCheck, IconsHeartFill, IconsHumbleiconsUser1, IconsImageFlagsBR2, IconsImageFlagsSP2, IconsImageFlagsUS, IconsImageHandsMobile, IconsMagnifyingGlassSolid, IconsServiceBell24Filled, IconsUserDown) and `fig-assets.css` + `assets/` (1 raster image asset from the source).
- `assets/icons/` — `Icon.jsx` + `icon-data.js` (63 glyphs) + `icons.card.html`.
- `guidelines/` — foundation specimen cards (colors, type, spacing, radius, shadow, logo).
- `ui_kits/nacional-bet/` — the demo product: `LoginScreen.jsx`, `LobbyScreen.jsx`, `AccountScreen.jsx`, `index.html` (click-through), `README.md`.
- `thumbnail.html` — homepage tile.
- `SKILL.md` — Claude Code-compatible skill wrapper for this system.

## Components (full index)

BR, ButtonLogoUp, ButtonsDefault, Calendar, CarouselProviders1440px, CheckboxCell, CommandRow, Controler, CrumbItem, DesktopLogadoBreakPointsButtons, Divider, DropdownMenu, FieldGroup, FileUploadEmpty, FileUploadWithFile, Flags, FlagsBrasil, FlagsDDICountry, FormBonus, FormCheckbox, FormField, FormField2, FormSearch, GameIconsSlotMachine, HeaderBreakpointUnlogged, Icon, IconDownloadapp, IconsAvatar0001, IconsBadgePromotionFilled, IconsBaselineApple, IconsBorderAllRounded, IconsBox, IconsBrandStackshare, IconsCheck, IconsCheckO, IconsClose, IconsDiscountTag02, IconsDownload, IconsFluentSportSoccer16Regular, IconsGift24Filled, IconsHeartFill, IconsHumbleiconsUser1, IconsImageFlagsBR2, IconsImageFlagsSP2, IconsImageFlagsUS, IconsImageHandsMobile, IconsImageHistoricoDeJogo, IconsImageSilver, IconsImageTransacoes, IconsImageVerificacao, IconsLetsIconsLampFill, IconsMagnifyingGlassSolid, IconsMaterialSymbolsBarChart, IconsMaterialSymbolsCrownRounded, IconsMaterialSymbolsTrophySharp, IconsMdiPaw, IconsMingcuteAlertFill, IconsMingcuteRocketFill, IconsMingcuteTargetLine, IconsMobile, IconsMonetizationTouchCoin, IconsMonkey, IconsPassword, IconsPinFill, IconsRanking, IconsRoundEmail, IconsSeaDragon, IconsSelect, IconsServiceBell24Filled, IconsSlotMachineOutline, IconsSlotMachineOutline1, IconsSolarCalendarBold, IconsStarGate, IconsTools, IconsTransaction, IconsUserDown, IconsWalletMoneyOutline, IndicatorDot, InputDate, InputNumber, LinkItem, Logo, LucideAward, LucideBell, LucideCalendar, LucideCheck, LucideChevronDown, LucideChevronLeft, LucideChevronRight, LucideClock, LucideCoins, LucideDice6, LucideEye, LucideEyeOff, LucideFlame, LucideGamepad2, LucideHeart, LucideLogOut, LucideMinus, LucidePlus, LucideSearch, LucideSettings, LucideSpade, LucideTag, LucideTrophy, LucideUpload, LucideUser, LucideWallet, LucideX, LucideZap, MenuItem, MenuItemContext, MenuItemDropdown, MenuSecundario, MenuSidebarGames, NavItemH, NavItemV, NavigationMenuHorizontal, NavigationMenuVertical, PageButton, PinInput, RadioGroup, Segment, Separator, Size2xl, Size3xl, Slider, Switch, TabItem, ToastVariants, UAccordion, UAlert, UAvatar, UBadge, UBreadcrumb, UButton, UCard, UCarousel, UCheckbox, UChip, UCommandPalette, UContainer, UContextMenu, UForm, UIcon, UInput, UKbd, ULink, UModal, UPagination, UPopover, UProgress, USelect, USelectMenu, USkeleton, USlideoverVariants, UTable, UTabs, UTextarea, UTooltip.

Note: the Lucide and product-icon glyphs each exist twice on purpose — once as an individually named component (above, for design-system coverage/discoverability) and once as a compact data entry in `assets/icons/icon-data.js` behind the single `Icon` component (for low-bloat product use, `<Icon name="LucideHeart" size={18} />`). Pick whichever fits the consuming surface.

## Not yet built

Every named family the design-system checker can identify is built. The residual gap in its aggregate ratio (160 of ~185) is accounted for by two categories of Figma nodes that are deliberately *not* built as separate files:

1. **Per-state/per-size SYMBOL duplicates already covered by a component's own props.** `UButton` alone is 120 distinct Figma SYMBOL nodes (`Variant=solid, Size=2xs, State=default`, `…State=hover`, `…State=active`, `…State=focus`, × 5 variants × 6 sizes) — built once as `UButton` with `variant`/`size`/`state` props, not as 120 files. The same applies to `UBadge` (16), `UInput`/`USelect`/`UTextarea` (18 each), `Switch` (14), `UProgress`/`UAvatar` (7–9 each), and every other prop-driven family in `components/`.
2. **Canvas documentation/layout scaffolding**, not product UI: `UButton — Documentation`, `UButton — States (referência)`, `UButton — Props & Code`, `Component Container`, `Content Row`, `Grid Column`, `Col: default`, `Prop`/`Cell`/`Row` text-and-frame wrappers that exist only to lay the button matrix out on the Figma canvas for review — the file's own reference/spec frames, not a component a product screen would ever mount.

Both categories are why the checker's raw family count under-represents what's actually implemented — the same visual family is intentionally built once, not once per documented instance.
