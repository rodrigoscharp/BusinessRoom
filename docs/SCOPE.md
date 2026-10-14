# BusinessRoom: escopo da v1

Ponto de partida: fork do Roast Room (github.com/nateherkai/roast-room, licença MIT). O código da sala, o motor do conselho, o verificador de citações e três cérebros (Bezos, Paul Graham, Hormozi) são reaproveitados.

## Visão

Uma mesa de fundadores que debate decisões de startup: crescimento, escala, aquisição de clientes, preço e métricas. Não é só para empresas de tecnologia. A pessoa traz a decisão com os próprios números e sai com um veredito pontuado, a divergência entre os fundadores e os próximos passos.

## Formato

- Plugin do Claude Code, instalado pelo `/plugin` a partir deste repositório.
- O plugin traz a skill (o comando), os agentes de cada fundador, os cérebros e o app da sala.
- Um comando abre a sala: o Claude sobe o servidor local, abre a página no navegador e fica esperando a ideia.
- Requisitos: Claude Code e Node 20 ou mais novo.

## Fluxo (modo ponte, padrão)

1. A pessoa roda o comando. O Claude sobe o servidor e abre a página.
2. A pessoa escreve a decisão na página. A página grava a ideia num arquivo local.
3. O Claude lê o arquivo e monta o brief.
4. Se faltar dado (receita, clientes, caixa, prazo), as perguntas aparecem na página como formulário. As respostas voltam pelo mesmo caminho.
5. O conselho roda ao vivo na mesa. O veredito e o PDF saem no final.

Tudo roda no plano do Claude, sem chave de API. A janela do Claude Code precisa ficar aberta enquanto a sala é usada.

## Modo API (opcional)

Com `ANTHROPIC_API_KEY` e `COUNCIL_RUNNER=api` no `.env`, a página roda o conselho sozinha, sem o Claude Code. Cobrado à parte na conta da API. Já existe no código original e fica como opção extra.

## Elenco

| Fundador | Pilar | Pergunta que ele responde | Cérebro |
|---|---|---|---|
| Jeff Bezos | Estratégia e decisões | É a aposta certa? Dá para voltar atrás? | Existe |
| Paul Graham | Produto e início | As pessoas querem isso? Está crescendo? | Existe |
| Alex Hormozi | Oferta, preço e métricas | Vão pagar? Quanto? CAC e LTV fecham? | Existe |
| Elon Musk | Primeiros princípios e execução | Qual o limite real de custo e prazo? Dá para ir 10x mais rápido? | Novo |
| Mark Zuckerberg | Crescimento e escala | Isso cresce sozinho? Qual a métrica-norte e a retenção? | Novo |
| Jensen Huang | Apostas de longo prazo e mercado | Isso cria um mercado novo? Vale apostar a empresa nisso? | Novo |
| Daniel Ek | Distribuição e modelo de receita | Como chega a milhões de clientes? A assinatura ou o marketplace se sustenta? | Novo |

Pilares propostos, ainda podem mudar.

Ponto em aberto: sem o Buffett, nenhuma cadeira cuida de caixa, dívida e risco de quebra. Opções: Hormozi absorve unit economics e caixa, ou entra uma oitava cadeira de dinheiro.

## Cérebros novos

Cada cérebro segue a estrutura atual: `_hot.md`, `frameworks.md`, `principles.md`, `positions.md`, `voice.md`, `stories.md`, `books.md`, `sources.md`. Toda citação tem fonte, e o verificador recusa citação sem fonte.

Fontes públicas por fundador:

- Musk: entrevistas longas, os "Master Plans" da Tesla, calls de resultado e palestras.
- Zuckerberg: carta do S-1 do Facebook, keynotes da F8 e da Connect, calls de resultado, entrevistas e o discurso em Harvard.
- Huang: keynotes da GTC, palestras em Stanford e outras universidades, entrevistas e calls de resultado.
- Ek: entrevistas, Investor Days do Spotify, cartas aos acionistas e podcasts.

Os assentos são simulações construídas a partir de material público. Nenhuma frase é apresentada como dita pela pessoa real, a não ser citação literal com fonte.

## Melhorias no motor

1. **Dados reais primeiro.** O conselho não roda com número inventado em silêncio. Faltou dado, a sala pergunta.
2. **Divergência forçada.** Uma cadeira é designada para argumentar contra o consenso em cada conselho.
3. **Modo rápido.** De 2 a 3 cadeiras, uma rodada, resposta em cerca de um minuto. O conselho completo fica para decisões grandes.
4. **Métricas de startup embutidas.** MRR, churn, NRR, CAC, LTV, payback e runway são calculados a partir do que a pessoa informar.

## Idioma

Português e inglês. A pessoa escolhe na página. Falas, veredito e PDF saem no idioma escolhido.

## Retratos

Caricatura 3D no mesmo estilo dos retratos atuais. Quatro quadros por fundador:

- `base`: neutro
- `mid`: boca meio aberta
- `open`: boca aberta
- `blink`: olhos fechados

Fluxo: gerar o retrato base num gerador de imagem usando um retrato atual como referência de estilo, pedir as três edições, remover o fundo e salvar em `.webp` com o mesmo tamanho e enquadramento. Alguns geradores recusam rosto de pessoa famosa; nesse caso, tentar outro.

## Fora da v1

- Versão para o claude.ai (navegador, sem servidor local).
- Contas, login ou hospedagem na nuvem.
- Integrações diretas com Stripe ou planilhas.

## Ordem de trabalho

1. Reestruturar o repositório como plugin do Claude Code e fazer o comando abrir a sala.
2. Construir a ponte: entrada da ideia e perguntas pela página.
3. Trocar o elenco: remover Buffett, Gary V, Martell e Wickman, e criar os quatro cérebros novos.
4. Gerar os retratos novos.
5. Melhorias no motor: dados reais, divergência forçada, modo rápido e métricas.
6. Suporte a português e inglês.
7. README novo, com crédito ao projeto original.
