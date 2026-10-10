# Changelog — TrekFit Coach

## 1.2.0 — Treino rápido + importação
- Registro por série simplificado para carga, repetições e check de conclusão.
- RIR e dor deixam de ser exigidos em cada série; dados antigos continuam compatíveis.
- Progressão de carga simplificada pela faixa de repetições concluída.
- Importação de fichas de treino em CSV e JSON.
- Treinos importados ficam salvos localmente e aparecem junto aos treinos padrão.
- Lista de treinos importados com seleção e exclusão.
- Cache PWA atualizado para a nova release.

## 1.1.0 — Coach UI foundation
- Navegação principal reorganizada para Início, Treino, Saúde, Coach e Conta.
- Nova área Saúde com Resumo, Body, Nutri e Trekking.
- Nova área Coach com check-in de sono, energia, fome, estresse, recuperação, dor e aderência.
- Geração de resumo copiável para levar à conversa com o coach no ChatGPT.
- Perfil local com nome, objetivo e meta semanal de treinos.
- Tema escuro próprio do TrekFit inspirado em apps fitness premium, sem replicar a identidade da Smart Fit.
- Atualização do cache PWA para facilitar recebimento de novas versões.
- Registros anteriores de treino, trekking e medidas continuam preservados.

## 1.0.0 — Baseline
- PWA publicada no GitHub Pages.
- Treinos A–E.
- Registro de carga, repetições, RIR, dor e séries concluídas.
- Histórico local por sessão.
- Sugestão simples de progressão de carga.
- Registro de trekking.
- Registro de peso e medidas.
- Meta nutricional inicial.
- Estrutura opcional para Supabase.
- Deploy automático via GitHub Actions.

## Processo de release
Toda nova versão deve:
1. passar por build/deploy;
2. registrar alterações neste changelog;
3. preservar dados existentes ou fornecer migração;
4. informar ao usuário o que mudou;
5. solicitar teste no app publicado;
6. incorporar feedback na próxima iteração.
