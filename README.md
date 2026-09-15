# TrekFit PWA

Aplicativo mobile-first para uma mulher de 30 anos, 1,67 m e 76 kg, com objetivo de hipertrofia, redução de gordura e preparação para trekking. O programa inclui cautelas para histórico em L4/L5/S1.

## O que já funciona

- 5 treinos A–E completos.
- Check-in de dor lombar e sinalização de dor irradiada.
- Registro por série: carga, repetições, RIR, dor e conclusão.
- Histórico local no navegador/celular.
- Sugestão simples de progressão de carga por dupla progressão.
- Registro de trekking: distância, duração, elevação, mochila, dor e esforço.
- Registro de peso e medidas.
- Meta nutricional inicial de 1.900 kcal / 145 g proteína / 195 g carboidrato / 60 g gordura.
- Manifest + Service Worker para instalação como PWA.
- Schema opcional de Supabase com RLS.
- Workflow para GitHub Pages.

## Rodar no computador

```bash
npm install
npm run dev
```

## Build de produção

```bash
npm run build
npm run preview
```

## Instalar no celular

A forma mais simples é publicar com GitHub Pages. Depois abra o endereço HTTPS no Chrome/Android e use **Adicionar à tela inicial / Instalar app**.

## GitHub Pages

1. Crie um repositório e envie estes arquivos para a branch `main`.
2. Em **Settings > Pages**, selecione **GitHub Actions** como Source.
3. O workflow `.github/workflows/deploy-pages.yml` fará build e publicação.

## Supabase (opcional)

A versão inicial usa `localStorage`, portanto funciona sem conta e sem banco.

Para preparar nuvem:

1. Crie um projeto no Supabase.
2. Execute `supabase/schema.sql` no SQL Editor.
3. Copie `.env.example` para `.env`.
4. Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

O cliente Supabase já está inicializado em `src/supabase.ts`. A sincronização autenticada pode ser ativada em uma próxima etapa sem alterar a ficha de treino.

## Segurança clínica

Este app não substitui avaliação médica, fisioterapêutica ou nutricional. Dor irradiada, dormência, fraqueza, alterações esfincterianas ou piora importante dos sintomas exigem avaliação profissional. Exercícios devem ser executados somente quando clinicamente liberados e tolerados.
