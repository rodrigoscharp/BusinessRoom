# Retratos dos fundadores

A sala mostra cada assento como um busto caricato em 3D, no estilo Pixar. Cada pessoa tem quatro quadros, e a sala troca entre eles para fazer a boca mexer e os olhos piscarem:

| Arquivo | O que mostra |
|---|---|
| `app/public/portraits/<chave>-base.webp` | rosto neutro, sorriso leve de boca fechada |
| `app/public/portraits/<chave>-mid.webp` | boca meio aberta |
| `app/public/portraits/<chave>-open.webp` | boca bem aberta, como no meio de uma palavra |
| `app/public/portraits/<chave>-blink.webp` | olhos fechados, resto igual ao base |

Bezos, Graham e Hormozi já têm os quatro. Faltam Musk (`musk`), Zuckerberg (`zuckerberg`), Huang (`huang`) e Ek (`ek`). Enquanto os arquivos não existem, a sala mostra um círculo com as iniciais. Quando os arquivos aparecem na pasta, a sala usa eles sozinha. Não precisa mudar código.

## Como os retratos atuais são feitos

Medido nos arquivos que já existem:

- **Tamanho:** 560 × 560 px, `.webp` com transparência, cerca de 25 a 45 KB por arquivo.
- **Fundo:** transparente. Nada atrás da pessoa.
- **Enquadramento:** busto de frente, cabeça e ombros até o meio do peito. O topo da cabeça fica sempre a 39 px do topo da imagem. O corpo ocupa quase toda a largura (cerca de 500 px) e é cortado reto na borda de baixo.
- **Pose:** olhando direto para a câmera, cabeça reta, sorriso leve de boca fechada.
- **Estilo:** caricatura 3D tipo Pixar. Cabeça um pouco grande, olhos grandes e brilhantes, pele com textura suave, traços reconhecíveis exagerados com carinho (orelhas do Bezos, barba do Hormozi).
- **Luz:** luz de estúdio suave e frontal, sem sombra dura, sem contraluz colorido.
- **Roupa:** a roupa marca de cada um, simples e lisa (Bezos de blazer azul-marinho e camisa azul clara; Graham de camisa azul; Hormozi de camiseta preta e boné). Logos só quando fazem parte da imagem pública da pessoa.

O script no fim deste guia cuida do tamanho, do enquadramento e do fundo. No gerador, o que importa é acertar o estilo, a pose e a roupa.

## Passo a passo

1. Abra uma conversa nova no gerador (ChatGPT, Gemini ou Midjourney) para cada fundador.
2. Cole o prompt do quadro base desse fundador (abaixo). Gere até gostar do resultado.
3. **Na mesma conversa**, sobre a imagem base escolhida, rode os três prompts de edição (mid, open, blink). Assim o rosto, a roupa e o enquadramento ficam iguais nos quatro quadros.
4. Baixe as quatro imagens em PNG e salve numa pasta, por exemplo `~/Desktop/retratos/`, com estes nomes exatos:
   ```
   musk-base.png  musk-mid.png  musk-open.png  musk-blink.png
   ```
   Troque `musk` por `zuckerberg`, `huang` ou `ek` para os outros.
5. Rode o script (seção "Pós-processamento").
6. Abra a sala e confira.

Os prompts estão em inglês porque os geradores seguem melhor em inglês.

### Se o gerador recusar

Alguns geradores recusam imagens de pessoas públicas reais, ou recusam só algumas pessoas. Se isso acontecer, **tente outro gerador** (ChatGPT, Gemini, Midjourney) com o mesmo prompt. Não tente enganar o filtro: se nenhum aceitar, deixe o assento com as iniciais por enquanto.

## Prompt do quadro base

Todos usam o mesmo bloco de estilo. Só muda a linha da pessoa. Cole o prompt inteiro de uma vez.

### Musk

```
A 3D Pixar-style caricature portrait of Elon Musk as a friendly animated character.
Head-and-shoulders bust, facing the camera straight on, head level, looking directly at the viewer, gentle closed-mouth smile.
Short dark brown hair swept back, strong square jaw, slightly oversized head, big expressive eyes.
Wearing a plain black crew-neck t-shirt, no logos.
Soft even frontal studio lighting, no harsh shadows, smooth skin texture, high detail, warm and likable.
Framing: square image, the whole head visible with a small gap above the hair, shoulders and upper chest visible, body cut off at the bottom edge, figure centered.
Plain solid white background, nothing else in the image, no text, no props.
```

### Zuckerberg

```
A 3D Pixar-style caricature portrait of Mark Zuckerberg as a friendly animated character.
Head-and-shoulders bust, facing the camera straight on, head level, looking directly at the viewer, gentle closed-mouth smile.
Short curly brown hair, pale skin, light eyes, slightly oversized head, big expressive eyes.
Wearing a plain heather-gray crew-neck t-shirt, no logos.
Soft even frontal studio lighting, no harsh shadows, smooth skin texture, high detail, warm and likable.
Framing: square image, the whole head visible with a small gap above the hair, shoulders and upper chest visible, body cut off at the bottom edge, figure centered.
Plain solid white background, nothing else in the image, no text, no props.
```

### Huang

```
A 3D Pixar-style caricature portrait of Jensen Huang as a friendly animated character.
Head-and-shoulders bust, facing the camera straight on, head level, looking directly at the viewer, gentle closed-mouth smile.
Salt-and-pepper gray hair combed back, warm friendly face, slightly oversized head, big expressive eyes.
Wearing his signature black leather jacket over a plain black t-shirt, no logos.
Soft even frontal studio lighting, no harsh shadows, smooth skin texture, high detail, warm and likable.
Framing: square image, the whole head visible with a small gap above the hair, shoulders and upper chest visible, body cut off at the bottom edge, figure centered.
Plain solid white background, nothing else in the image, no text, no props.
```

### Ek

```
A 3D Pixar-style caricature portrait of Daniel Ek, the Spotify founder, as a friendly animated character.
Head-and-shoulders bust, facing the camera straight on, head level, looking directly at the viewer, gentle closed-mouth smile.
Shaved head, short light stubble beard, calm focused look, slightly oversized head, big expressive eyes.
Wearing a plain dark charcoal crew-neck sweater, no logos.
Soft even frontal studio lighting, no harsh shadows, smooth skin texture, high detail, warm and likable.
Framing: square image, the whole head visible with a small gap above the head, shoulders and upper chest visible, body cut off at the bottom edge, figure centered.
Plain solid white background, nothing else in the image, no text, no props.
```

**Dica:** se o gerador oferecer fundo transparente (o ChatGPT às vezes oferece), pode pedir "transparent background" no lugar de "plain solid white background". O script aceita os dois.

**No Midjourney:** cole só o texto do prompt (sem as quebras de linha) e acrescente `--ar 1:1 --style raw` no fim. Para os quadros de edição, use o editor da imagem (Vary Region) e marque só a boca ou só os olhos.

## Prompts de edição (mid, open, blink)

Rode cada um sobre a imagem base aprovada, na mesma conversa. Os três são iguais para todos os fundadores.

### mid (boca meio aberta)

```
Edit this exact image. Change only the mouth: lips slightly parted, mouth half open as if softly saying "ah", a little of the upper teeth visible.
Keep everything else identical: same face, eyes, expression, hair, clothes, pose, framing, lighting, image size and background. Do not move or zoom the character.
```

### open (boca aberta)

```
Edit this exact image. Change only the mouth: mouth wide open as if in the middle of saying a word with energy, upper teeth and tongue visible, jaw dropped a little.
Keep everything else identical: same face, eyes, expression, hair, clothes, pose, framing, lighting, image size and background. Do not move or zoom the character.
```

### blink (olhos fechados)

```
Edit this exact image. Change only the eyes: both eyes fully closed with relaxed eyelids, as in a natural blink. Keep the same gentle closed-mouth smile.
Keep everything else identical: same face, mouth, hair, clothes, pose, framing, lighting, image size and background. Do not move or zoom the character.
```

**Confira antes de baixar:** os quatro quadros precisam ter o mesmo tamanho e a pessoa no mesmo lugar. Se uma edição mexeu no enquadramento, no cabelo ou na roupa, peça de novo. O script usa a posição do quadro base para os quatro, então um quadro deslocado faz o rosto "pular" na sala.

## Pós-processamento

O script `app/scripts/prepare-portraits.mjs` faz tudo de uma vez:

- remove o fundo (com o recurso de recorte do próprio macOS) se a imagem ainda não tiver transparência;
- acha o busto no quadro base, redimensiona para o mesmo tamanho dos retratos atuais (560 × 560, topo da cabeça a 39 px, corpo com cerca de 500 px de largura, centralizado);
- aplica a mesma posição aos quatro quadros, para o rosto não pular;
- converte para `.webp` e salva em `app/public/portraits/` com o nome certo.

### O que precisa no Mac

- macOS 14 ou mais novo.
- Node 20 ou mais novo (já usado pela sala).
- Xcode Command Line Tools. Se não tiver, rode:
  ```bash
  xcode-select --install
  ```
- Um codificador webp. O mais simples:
  ```bash
  brew install webp
  ```

### Rodar

Da pasta do BusinessRoom, apontando para a pasta onde você salvou os PNGs:

```bash
node app/scripts/prepare-portraits.mjs ~/Desktop/retratos
```

Ele processa todos os fundadores que achar na pasta. Na primeira vez ele compila um ajudante e demora cerca de um minuto. Depois é rápido.

Opções úteis:

| Opção | Para quê |
|---|---|
| `--only musk` | processa só um fundador |
| `--force` | sobrescreve retratos que já existem (sem isso, ele pula e avisa) |
| `--bg keep` | não remove fundo (use se você já tirou o fundo à mão) |
| `--bg remove` | força a remoção de fundo mesmo se a imagem já tiver transparência |
| `--width 470` | busto um pouco menor no quadro (padrão 500) |
| `--out pasta` | salva em outra pasta, para testar sem mexer na sala |

Os nomes de entrada aceitam `.png`, `.jpg`, `.jpeg`, `.webp` e `.heic`.

### Se o recorte automático ficar ruim

Tire o fundo à mão no Preview do Mac: abra a imagem, menu **Ferramentas › Remover Fundo**, salve como PNG. Faça isso nos quatro quadros e rode o script com `--bg keep`.

## Conferir na sala

1. Inicie a sala com `npm start` (se já estiver aberta, não precisa reiniciar).
2. Abra http://localhost:4740 e recarregue com Cmd+Shift+R para limpar o cache.
3. Confira que o retrato aparece no lugar das iniciais e que, quando o fundador fala, a boca mexe sem o rosto pular.

Se algo ficar estranho (cabeça grande demais, cortada, deslocada), ajuste no gerador e rode o script de novo com `--force`.
