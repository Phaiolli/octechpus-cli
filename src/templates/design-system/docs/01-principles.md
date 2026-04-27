# 01 — Princípios de UX/UI

Estes são os princípios inegociáveis que toda interface gerada deve seguir.

## 1. Clareza acima de estética

A interface deve ser compreensível em **3 segundos**. Se o usuário precisa pensar onde clicar, o design falhou. Estética serve à clareza, nunca o contrário.

## 2. Hierarquia visual em três níveis

Todo layout tem no máximo três níveis de hierarquia:

- **Primário:** ação/informação principal da tela (1 por seção)
- **Secundário:** ações/informações de suporte
- **Terciário:** metadados, ações raras, links

Aplicado por: peso da fonte, cor, tamanho e espaço ao redor — nunca por todos ao mesmo tempo.

## 3. Densidade adequada para dashboards

- **Tabelas e listas:** densidade alta, padding vertical de 8–12px por linha
- **Forms:** densidade média, gap de 16–24px entre campos
- **Cards de KPI:** densidade baixa, breathing room generoso

## 4. Consistência > criatividade local

Se já existe um padrão para tabelas no projeto, novas tabelas seguem o mesmo padrão. Variação só por necessidade real comprovada.

## 5. Feedback imediato em toda ação

Todo clique, hover, foco e submissão deve ter resposta visual em **menos de 100ms**:

- Hover: mudança de `bg` ou `border`
- Click/active: pequena escala ou sombra interna
- Loading: skeleton ou spinner contextual (nunca full-page para ações pequenas)
- Sucesso: toast ou inline confirmation
- Erro: inline + cor `danger`, nunca alert nativo

## 6. Estados sempre completos

Todo componente deve ter os estados especificados:

- `default`, `hover`, `focus-visible`, `active`, `disabled`, `loading`, `error`, `empty`

Estado **empty** é frequentemente esquecido — deve ter ilustração/ícone, mensagem clara e CTA primária.

## 7. Mobile-first mesmo em dashboards

Mesmo que o público-alvo seja desktop, a experiência mobile deve ser **funcional**. Sidebar vira drawer, tabelas viram cards, KPIs empilham.

## 8. Acessibilidade não é opcional

- Contraste **AA mínimo** (4.5:1 para texto normal, 3:1 para texto grande)
- Foco visível com `focus-visible:ring-2 ring-accent`
- Todo input tem `<label>` associado
- Toda imagem decorativa tem `alt=""`, toda funcional tem `alt` descritivo
- Navegação por teclado funciona em **toda** interação

## 9. Glassmorphism com critério

Glassmorphism (fundo translúcido + blur) é usado **somente** em:

- Sidebar quando sobrepõe conteúdo (mobile drawer)
- Modals e popovers
- Cards flutuantes sobre imagem ou gradiente
- Topbar quando há scroll behind

**Nunca** em backgrounds grandes, cards normais ou áreas de conteúdo principal — gera fadiga visual e prejudica legibilidade.

## 10. Gradientes como destaque, não fundo

Gradientes (`gradient-accent`) usados em:

- Botão primário principal da página
- Badges de "Pro", "Beta", "Novo"
- Borda destacada de card de upgrade/destaque
- Áreas de gráfico com fill gradient

**Nunca** em fundos de página, sidebars inteiras ou cards padrão.

## 11. Movimento com propósito

Animações servem para:

- **Orientar:** elemento entrando/saindo (slide + fade)
- **Confirmar:** ação completada (check animation)
- **Guiar atenção:** pulse em notificação nova

Duração padrão: **200ms** com `ease-out`. Nunca `transition-all`. Animações longas (>400ms) só em onboarding.

## 12. Erros são oportunidades

Mensagem de erro deve:

1. Dizer **o que** aconteceu (em linguagem humana, não código)
2. Dizer **por que** (se útil)
3. Dizer **como resolver**

❌ "Error 401"
✅ "Sua sessão expirou. Faça login novamente para continuar."

## 13. Dados em destaque, chrome em segundo plano

Em dashboards, **os dados são as estrelas**. UI ao redor (bordas, fundos, ícones) deve recuar visualmente. Use `text-secondary` e `border-subtle` no chrome, contraste alto só nos números/gráficos.

## 14. Espaços em branco são funcionais

Espaço respira a interface e cria agrupamento. Sempre prefira **mais respiro entre grupos** do que mais decoração para separá-los. Regra geral: gap entre seções relacionadas = 24px; entre seções diferentes = 48px.
