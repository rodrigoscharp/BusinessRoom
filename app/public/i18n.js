// English and Portuguese for the room. The page is written in English; in Portuguese mode
// this file swaps every interface string as it appears (text, placeholders, titles), so new
// lines from the player are translated too. Council content (the founders' lines, the
// verdict) arrives already in the founder's language from Claude Code and passes through.
// The page is marked translate="no" so a browser's own translator does not mix the two.

const KEY = "businessroom-lang";
export const LANG = (() => {
  // ?lang=en or ?lang=pt in the address wins, for links and screenshots
  const q = new URLSearchParams(location.search).get("lang");
  if (q === "pt" || q === "en") return q;
  try { const v = localStorage.getItem(KEY); if (v === "pt" || v === "en") return v; } catch {}
  return /^pt/i.test(navigator.language || "") ? "pt" : "en";
})();

export function setLang(l) {
  try { localStorage.setItem(KEY, l); } catch {}
  location.reload();
}

const PT = {
  // top bar, stepper, dialogs
  "How it works": "Como funciona",
  "Past sessions": "Sessões anteriores",
  "New question": "Nova pergunta",
  "Brief": "Briefing",
  "Openings": "Aberturas",
  "Fault lines": "Divergências",
  "Debate": "Debate",
  "Vote": "Votação",
  "Verdict": "Veredito",
  "Close": "Fechar",
  "Replay a council exactly as it happened.": "Reveja um conselho exatamente como aconteceu.",
  "On the table": "Na mesa",
  "Skip ahead": "Pular",
  "Simulated advisors built from each person's public work and drawn as caricatures. They are not the people and do not speak for them.":
    "Conselheiros simulados a partir do trabalho público de cada pessoa e desenhados como caricaturas. Não são as pessoas e não falam por elas.",
  // the empty room and the chat
  "The room is open": "A sala está aberta",
  "What decision is on the table?": "Qual decisão está na mesa?",
  "Write it in the chat below. The founders debate it here, live.": "Escreva no chat abaixo. Os fundadores debatem aqui, ao vivo.",
  "What to put in your question": "O que colocar na sua pergunta",
  "Paste your pitch or bring a decision...": "Cole seu pitch ou traga uma decisão...",
  "Message": "Mensagem",
  "Send": "Enviar",
  "Write your decision below: the options, a few numbers (revenue, customers, cash), and which way you are leaning.":
    "Escreva sua decisão abaixo: as opções, alguns números (receita, clientes, caixa) e para onde você está pendendo.",
  "The room runs the council itself (API mode).": "A sala roda o conselho sozinha (modo API).",
  "Claude Code is listening.": "O Claude Code está ouvindo.",
  "The council is in session.": "O conselho está reunido.",
  "Claude Code is not listening. Run /business-room open in Claude Code.": "O Claude Code não está ouvindo. Rode /business-room open no Claude Code.",
  "Give the council a real decision, at least a sentence.": "Dê ao conselho uma decisão de verdade, pelo menos uma frase.",
  "Could not start the council.": "Não foi possível iniciar o conselho.",
  "Could not send.": "Não foi possível enviar.",
  "Copied. Paste it into Claude Code.": "Copiado. Cole no Claude Code.",
  "Copy didn't work here. Select the text and copy it.": "A cópia não funcionou aqui. Selecione o texto e copie.",
  // API-mode composer
  "What decision do you need help with?": "Com qual decisão você precisa de ajuda?",
  "Full council": "Conselho completo",
  "Quick": "Rápido",
  "Quick council": "Conselho rápido",
  "Council": "Conselho",
  "Deep council": "Conselho profundo",
  "The debate scores are final": "As notas do debate são as finais",
  "7 seats, 3 rounds": "7 assentos, 3 rodadas",
  "4 seats, 2 rounds": "4 assentos, 2 rodadas",
  "Convene the council": "Convocar o conselho",
  // the player
  "The council": "O conselho",
  "The council is taking their seats": "O conselho está tomando seus lugares",
  "Round 1: opening positions": "Rodada 1: posições iniciais",
  "Round 2: the debate": "Rodada 2: o debate",
  "Round 3: the vote": "Rodada 3: a votação",
  "The floor is open": "A palavra está aberta",
  "The Chair": "O Chair",
  "Changed position": "Mudou de posição",
  "Spoke": "Falou",
  "Yes, if": "Sim, se",
  "Yes": "Sim",
  "No": "Não",
  "Strong yes": "Sim, forte",
  "Strong no": "Não, forte",
  "I'll put it in my card.": "Vou colocar no meu cartão.",
  "Too much agreement. The Chair pushes back.": "Concordância demais. O Chair contesta.",
  "What they're fighting about": "O que eles estão disputando",
  "The fight:": "A disputa:",
  "Up for a vote": "Em votação",
  "Up for a vote:": "Em votação:",
  "Weight on this decision": "Peso nesta decisão",
  "This seat has not spoken yet.": "Este assento ainda não falou.",
  "Not in this council": "Fora deste conselho",
  "verified in the brain": "verificada no cérebro",
  "not found in the brain": "não encontrada no cérebro",
  "lines up next": "falas a seguir",
  // waiting between rounds
  "Setting the table": "Arrumando a mesa",
  "The Chair is seating the council.": "O Chair está acomodando o conselho.",
  "The advisors are writing their opening positions.": "Os conselheiros estão escrevendo suas posições iniciais.",
  "The advisors are reading each other's openings and firing back.": "Os conselheiros estão lendo as aberturas uns dos outros e rebatendo.",
  "The advisors are voting on the Chair's proposal.": "Os conselheiros estão votando a proposta do Chair.",
  "The advisors all write at the same time in Claude Code. Their lines play here as soon as the round is in.":
    "Os conselheiros escrevem ao mesmo tempo no Claude Code. As falas aparecem aqui assim que a rodada termina.",
  "Between rounds": "Entre rodadas",
  "The Chair is reading the openings and finding where they disagree.": "O Chair está lendo as aberturas e achando onde eles discordam.",
  "The fight shows up here next, then the debate starts.": "A disputa aparece aqui em seguida, e então começa o debate.",
  "The Chair is turning the debate into a proposal for the vote.": "O Chair está transformando o debate numa proposta para votação.",
  "Next, every advisor votes on it.": "Em seguida, cada conselheiro vota.",
  "Last step": "Última etapa",
  "The Chair is scoring the room and writing the verdict.": "O Chair está pontuando a mesa e escrevendo o veredito.",
  "When it lands, you can download it as a PDF.": "Quando sair, você pode baixar em PDF.",
  "Working": "Trabalhando",
  "The council is working.": "O conselho está trabalhando.",
  "Nothing new for a while? Check Claude Code. It may be waiting for you to answer or approve something.":
    "Nada de novo há um tempo? Confira o Claude Code. Ele pode estar esperando você responder ou aprovar algo.",
  // the verdict
  "The council's verdict": "O veredito do conselho",
  "Download PDF": "Baixar PDF",
  "Back to the table": "Voltar para a mesa",
  "Read the verdict": "Ler o veredito",
  "Replay this council": "Rever este conselho",
  "Scores": "Notas",
  "Why": "Por quê",
  "Watch out": "Atenção",
  "Next steps": "Próximos passos",
  "Kill it if:": "Desista se:",
  "Full detail": "Detalhes completos",
  "Where they fought": "Onde eles divergiram",
  "Conditions": "Condições",
  "Scorecard": "Placar",
  "Seat": "Assento",
  "Weight": "Peso",
  "Their line": "A frase de cada um",
  "Cheapest test": "Teste mais barato",
  "Revisit": "Revisitar",
  "The strongest objection in full": "A objeção mais forte, completa",
  "Amendments": "Emendas",
  "Adopted": "Adotada",
  "Not adopted": "Não adotada",
  "Making PDF...": "Gerando PDF...",
  "This council has no verdict yet.": "Este conselho ainda não tem veredito.",
  "Download the verdict as a PDF": "Baixar o veredito em PDF",
  "No sessions yet. Convene the council once and it shows up here.": "Nenhuma sessão ainda. Convoque o conselho uma vez e ela aparece aqui.",
  // the how-to guide
  "How to use the BusinessRoom": "Como usar o BusinessRoom",
  "In Claude Code, run ": "No Claude Code, rode ",
  ". It opens this room and listens to the chat.": ". Ele abre esta sala e escuta o chat.",
  "Write your decision in the chat below the table.": "Escreva sua decisão no chat abaixo da mesa.",
  "Answer the Chair's questions in the chat. Then watch the founders argue it out here.": "Responda às perguntas do Chair no chat. Depois assista aos fundadores debaterem aqui.",
  "When the verdict lands, download it as a PDF.": "Quando o veredito sair, baixe em PDF.",
  "The decision": "A decisão",
  " in one line.": " em uma linha.",
  "Your options.": "Suas opções.",
  " Two or three. \"Keep doing what I do now\" counts.": " Duas ou três. \"Continuar como estou\" conta.",
  "Your numbers.": "Seus números.",
  " Revenue, cash, and team size.": " Receita, caixa e tamanho do time.",
  "Your limits.": "Seus limites.",
  " Deadline, hours, and budget.": " Prazo, horas e orçamento.",
  "What success looks like": "Como é o sucesso",
  ", and by when.": ", e até quando.",
  "Which way you're leaning": "Para onde você está pendendo",
  ", and why. The council tests it.": ", e por quê. O conselho testa isso.",
  "Left something out? The Chair asks before the council starts.": "Esqueceu algo? O Chair pergunta antes de o conselho começar.",
  "Example": "Exemplo",
  "Copy this example": "Copiar este exemplo",
  "Good to know": "Bom saber",
  "Full council:": "Conselho completo:",
  " 7 advisors, 3 rounds. For big calls that are hard to undo.": " 7 conselheiros, 3 rodadas. Para decisões grandes e difíceis de desfazer.",
  "Council:": "Conselho:",
  "Voice off": "Voz desligada",
  "Voice on": "Voz ligada",
  "Read the founders' lines out loud": "Ler as falas dos fundadores em voz alta",
  "Attach a file": "Anexar arquivo",
  "Attach a pitch deck or one-pager (PDF, image, text)": "Anexe um pitch deck ou one-pager (PDF, imagem, texto)",
  "The Chair brings this to the table before the next round.": "O Chair leva isso para a mesa antes da próxima rodada.",
  "Attachments go to Claude Code. Run /business-room open there.": "Anexos vão para o Claude Code. Rode /business-room open lá.",
  "That file is over 15 MB.": "Esse arquivo passa de 15 MB.",
  "Could not attach the file.": "Não foi possível anexar o arquivo.",
  "Answers you": "Responde você",
  "Out": "Fora",
  "Leave this council": "Sair deste conselho",
  "This council stopped before the verdict. Bring your pitch in the chat to start a new one.": "Este conselho parou antes do veredito. Traga seu pitch no chat para começar outro.",
  "The Chair picked this council up again": "O Chair retomou este conselho",
  "In": "Dentro",
  "IN": "DENTRO",
  "OUT": "FORA",
  "I'M IN": "TÔ DENTRO",
  "I'M OUT": "TÔ FORA",
  "The deals": "As propostas",
  "Share image": "Compartilhar imagem",
  "This council has no verdict yet.": "Este conselho ainda não tem veredito.",
  "Couldn't make the image.": "Não foi possível gerar a imagem.",
  "Option": "Opção",
  "Simulated founders built from public work. Not the people.": "Fundadores simulados a partir de obras públicas. Não são as pessoas.",
  "Shark Tank:": "Shark Tank:",
  " after your pitch, each founder says if they're in or out, and on what terms.": " depois do pitch, cada fundador diz se entra ou não, e em que condições.",
  "Ask one founder:": "Pergunte a um fundador:",
  " click a founder, then \"Ask\". One founder answers, quick and cheap.": " clique num fundador e depois em \"Perguntar\". Um só responde, rápido e barato.",
  "Jump in:": "Entre na conversa:",
  " write during the debate and the Chair brings it to the next round.": " escreva durante o debate e o Chair leva para a próxima rodada.",
  "The Chair remembers your company": "O Chair lembra da sua empresa",
  " and checks in on past decisions, so you don't repeat your numbers.": " e acompanha decisões passadas, para você não repetir seus números.",
  " Open Past sessions to replay one, download its PDF, or share an image.": " Abra Sessões anteriores para rever um conselho, baixar o PDF ou compartilhar uma imagem.",
  "Pick ": "Escolha ",
  "Bring your pitch": "Trazer seu pitch",
  " and paste a few lines, or attach a deck with the clip.": " e cole algumas linhas, ou anexe um deck pelo clipe.",
  "Deep": "Profundo",
  "7 seats, 2 rounds": "7 assentos, 2 rodadas",
  " all 7 founders, 2 rounds: opening, then debate.": " os 7 fundadores, 2 rodadas: abertura e debate.",
  "Deep:": "Profundo:",
  " for a third round where they vote. Uses far more of your plan.": " para uma terceira rodada de votação. Usa bem mais do seu plano.",
  "Quick:": "Rápido:",
  " add ": " adicione ",
  " for 4 advisors and 2 rounds. Uses far less of your plan.": " para 4 conselheiros e 2 rodadas. Usa bem menos do seu plano.",
  "Every council is saved.": "Todo conselho fica salvo.",
  " Open Past sessions to replay one or download its PDF.": " Abra Sessões anteriores para rever um conselho ou baixar o PDF.",
  // seats: roles, pillars, questions
  "Founder": "Fundador",
  "Co-founder": "Cofundador",
  "CEO": "CEO",
  "Founder and CEO": "Fundador e CEO",
  "Co-founder and CEO": "Cofundador e CEO",
  "Strategy and decisions": "Estratégia e decisões",
  "Product and startups": "Produto e startups",
  "Offers, pricing, metrics, and cash": "Oferta, preço, métricas e caixa",
  "First principles and execution": "Primeiros princípios e execução",
  "Growth and scale": "Crescimento e escala",
  "Long bets and market creation": "Apostas longas e criação de mercado",
  "Distribution and business model": "Distribuição e modelo de negócio",
  "Is this the right bet, and how reversible is it?": "É a aposta certa, e dá para voltar atrás?",
  "Is this something people actually want, and is it growing?": "As pessoas querem mesmo isso, e está crescendo?",
  "Will people pay, do the unit economics work, and does the cash last?": "As pessoas vão pagar, a conta por cliente fecha, e o caixa aguenta?",
  "What do physics and cost really allow, and how fast can this actually ship?": "O que a física e o custo permitem de verdade, e quão rápido isso sai?",
  "Does this grow on its own, and how fast are we learning what users want?": "Isso cresce sozinho, e quão rápido estamos aprendendo o que o usuário quer?",
  "Does this create a market that does not exist yet, and can the company endure until it pays?": "Isso cria um mercado que ainda não existe, e a empresa aguenta até dar retorno?",
  "How does this reach millions, and does the revenue model hold up per user?": "Como isso chega a milhões, e o modelo de receita se sustenta por usuário?",
  // PDF
  "Founders' verdict": "Veredito dos fundadores",
  "Untitled decision": "Decisão sem título",
  "advisors": "conselheiros",
  "rounds": "rodadas",
  "Each advisor scores every option from 1 to 10, weighted by how much their area matters to this decision.":
    "Cada conselheiro dá nota de 1 a 10 a cada opção, com peso pela importância da sua área nesta decisão.",
  "Why the council landed here": "Por que o conselho chegou aqui",
  "How each advisor scored it": "Como cada conselheiro pontuou",
  "Advisor": "Conselheiro",
  "What to do next": "O que fazer agora",
  "Kill it if": "Desista se",
  "Simulated advisors built from each person's public work. They are not the people and do not speak for them.":
    "Conselheiros simulados a partir do trabalho público de cada pessoa. Não são as pessoas e não falam por elas.",
};

// Strings with a variable part.
const PATTERNS = [
  [/^Round (\d) of (\d)$/, (m) => `Rodada ${m[1]} de ${m[2]}`],
  [/^Pushes back on (.+)$/, (m) => `Rebate ${m[1]}`],
  [/^Highest score: option (.+)$/, (m) => `Maior nota: opção ${m[1]}`],
  [/^(\d+) lines up next$/, (m) => `${m[1]} falas a seguir`],
  [/^Confidence (.+)$/, (m) => `Confiança ${m[1]}`],
  [/^Proposal: (.+?) on option (\w+)\. (.*)$/, (m) => `Proposta: ${m[1]} na opção ${m[2]}. ${m[3]}`],
  [/^ on option (\w+)\.$/, (m) => ` na opção ${m[1]}.`],
  [/^Verdict: (.+)$/, (m) => `Veredito: ${m[1]}`],
  [/^Ask (.+) a question$/, (m) => `Perguntar a ${m[1]}`],
  [/^In: (.+)$/, (m) => `Dentro: ${m[1]}`],
  [/^(\d+) in, (\d+) out$/, (m) => `${m[1]} dentro, ${m[2]} fora`],
  [/^(\d+) seat runs on (.+)$/, (m) => `${m[1]} execuções de fundadores no ${m[2]}`],
  [/^(.*) · Remembers (.+)$/, (m) => `${tr(m[1])} · Lembra de ${m[2]}`],
  [/^The council stopped: (.+)$/, (m) => `O conselho parou: ${m[1]}`],
  [/^Weight (\d) of 3: (.*)$/, (m) => `Peso ${m[1]} de 3: ${m[2]}`],
  [/^Owns the question: (.+)$/, (m) => `Pergunta que responde: ${PT[m[1]] || m[1]}`],
  [/^For this to be right: (.+)$/, (m) => `Para isto estar certo: ${m[1]}`],
  [/^Weighted by how much each pillar matters here\. (.*)$/, (m) => `Com peso pela importância de cada pilar aqui. ${m[1]}`],
  [/^(\d+) endorse, (\d+) amend, (\d+) dissent$/, (m) => `${m[1]} apoiam, ${m[2]} emendam, ${m[3]} discordam`],
  [/^Couldn't make the PDF: (.+)$/, (m) => `Não foi possível gerar o PDF: ${m[1]}`],
  [/^Verdict report · (.+)$/, (m) => `Relatório do veredito · ${m[1]}`],
];

/** Translate one string (exact match or pattern); unknown text passes through. */
export function tr(s) {
  if (LANG !== "pt" || !s) return s;
  if (PT[s] !== undefined) return PT[s];
  const t = s.trim();
  if (t !== s && PT[t] !== undefined) return s.replace(t, PT[t]);
  for (const [rx, fn] of PATTERNS) { const m = t.match(rx); if (m) return s.replace(t, fn(m)); }
  return s;
}

const ATTRS = ["placeholder", "title", "aria-label"];
function translateTree(root) {
  if (root.nodeType === Node.TEXT_NODE) {
    const n = tr(root.nodeValue);
    if (n !== root.nodeValue) root.nodeValue = n;
    return;
  }
  if (root.nodeType !== Node.ELEMENT_NODE || root.closest?.("pre, .bubble")) return;
  for (const a of ATTRS) if (root.hasAttribute?.(a)) { const v = root.getAttribute(a); const n = tr(v); if (n !== v) root.setAttribute(a, n); }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.parentElement?.closest("pre, .bubble")) continue;
      const n = tr(node.nodeValue);
      if (n !== node.nodeValue) node.nodeValue = n;
    } else {
      for (const a of ATTRS) if (node.hasAttribute(a)) { const v = node.getAttribute(a); const n = tr(v); if (n !== v) node.setAttribute(a, n); }
    }
  }
}

/** Translate the page now and keep translating whatever the app adds later. */
export function startI18n() {
  document.documentElement.lang = LANG === "pt" ? "pt-BR" : "en";
  const btn = document.getElementById("langBtn");
  if (btn) {
    btn.textContent = LANG === "pt" ? "EN" : "PT";
    btn.title = LANG === "pt" ? "Switch to English" : "Mudar para português";
    btn.addEventListener("click", () => setLang(LANG === "pt" ? "en" : "pt"));
  }
  if (LANG !== "pt") return;
  translateTree(document.body);
  new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === "characterData") translateTree(m.target);
      else if (m.type === "attributes") translateTree(m.target);
      else m.addedNodes.forEach(translateTree);
    }
  }).observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}
