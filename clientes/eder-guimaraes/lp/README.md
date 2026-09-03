# LP — Dr. Eder Guimarães · Ultrassonografia

Arquivo: `index.html` — página única, sem build, sem dependência externa
(só as duas fontes do Google). Sobe em Vercel, Netlify, Hostinger ou Lovable
jogando o arquivo.

## Papel dela no funil

Diferente da LP de estética: aqui a LP **é o destino do tráfego pago**.

O canal recomendado é **Google Busca** (`../04-funil.md`) — quem clica já tem o
pedido médico na mão e está procurando onde fazer. Mandar esse clique direto pro
WhatsApp perde a pessoa que quer ver antes se o exame dela está na lista, quanto
custa e se aceita o convênio dela. A LP responde isso em 10 segundos e só então
manda pro WhatsApp.

Também é o destino do link da bio e da ficha do Google Maps.

## A decisão de design que sustenta a página

**O CTA principal é "manda a foto do pedido", não "agende sua consulta".**

A paciente muitas vezes não sabe o nome do exame — está escrito num papel que ela
não entende. Pedir que ela digite "ultrassom de abdome total" é fricção. Pedir uma
foto é o clique mais fácil que existe, e ainda entrega pro agente exatamente o dado
que ele precisa pra cotar e agendar.

Isso precisa estar refletido no `05-agente-ia.md`: o agente tem que saber **ler
imagem de pedido médico** e responder com exame + valor + preparo.

## Seções, e por que cada uma existe

| Seção | Trabalho que faz |
|---|---|
| Hero | Promete velocidade e remove a barreira do nome do exame |
| 3 fatos | Laudo no mesmo dia · sem fila · feito pelo médico |
| **Lista de exames** | É o motivo nº 1 da visita: "vocês fazem o meu?" |
| Como funciona | Mostra que o primeiro passo custa 10 segundos |
| **Preparo** | Reduz falta e exame perdido — o maior custo operacional |
| O médico | Vira "recém-formado" em vantagem (ver abaixo) |
| Convênio e valores | Segunda maior objeção depois de "vocês fazem?" |
| FAQ | Tira o medo: dói? posso grávida? quando sai o laudo? |
| Local | Google Busca é local — endereço e horário têm que estar visíveis |

## O posicionamento

Não vender experiência que ele ainda não tem. A página vende o que é **verdade e é
melhor** que o laboratório grande:

> Em laboratório grande, um técnico faz as imagens e outro profissional lauda depois,
> sem ter visto você. Aqui quem passa o transdutor é quem assina o papel.

E transforma a agenda vazia de recém-formado em benefício: *"a agenda é curta de
propósito, cada exame tem o tempo que precisa ter"*.

## Como preencher (bloco CONFIG)

Tudo que varia está num **único bloco no topo do `<script>`**, no fim do arquivo.
Não precisa caçar texto no meio do HTML.

```js
var CONFIG = {
  clinica:  "Dr. Eder Guimarães",
  eyebrow:  "Ultrassonografia · Blumenau/SC",
  whatsapp: "5547999999999",          // só números, com o 55
  telefone: "554733333333",
  ...
  exames: ["Abdome total","Tireoide","Transvaginal"]
};
```

**Campo em branco mantém o que já está na página.** Dá pra preencher aos poucos:
hoje só o WhatsApp e a cidade, semana que vem os exames e o endereço — a página
nunca quebra no meio.

Os 6 links de WhatsApp e os 4 de telefone são reescritos sozinhos a partir de
`whatsapp` e `telefone`. O texto pré-preenchido de cada botão é preservado
(o do hero já vem com "vou mandar a foto do pedido").

`exames: []` mantém a lista atual. Preenchendo o array, substitui a lista inteira.

### Campos

| Campo | O que é |
|---|---|
| `clinica` | Nome no topo da página |
| `eyebrow` | "Ultrassonografia · Cidade/UF" |
| `medico` / `crm` / `iniciais` | Bloco do profissional |
| `whatsapp` / `telefone` / `telefoneTexto` | Contato (números só com dígitos) |
| `endereco` / `horarioCurto` / `horarioCompleto` | Local e horário (aceita `<br>`) |
| `laudoTitulo` | **Trocar se "mesmo dia" não for real** |
| `convenios` | Texto do card de convênio |
| `responsavel` | Linha do rodapé: responsável técnico + CNPJ |
| `exames` | Lista de exames que ele faz |

O texto que está hoje no HTML é o **fallback** — serve de exemplo e mantém a
página apresentável enquanto o CONFIG estiver vazio.

## O que trocar (também marcado com ✎ no HTML)

Fora do CONFIG, só sobram três coisas, e todas exigem decisão humana:

- **Foto do Eder** no lugar do círculo com as iniciais
- **Valores particulares** — se ele quiser mostrar preço na página
  (checar antes a regra do CRM do estado dele sobre divulgação de preço)
- **Os textos de preparo** — são clínicos, ele valida e assina

## Antes de publicar

- [ ] **Prazo do laudo confere?** A página promete "mesmo dia" — se não for real,
      trocar. Promessa quebrada em saúde vira avaliação ruim no Google
- [ ] **Preparos revisados pelo Eder.** Esse conteúdo é clínico e está na página
      dele — ele assina, ele valida
- [ ] Lista de exames enxugada pro que ele realmente faz
- [ ] 5 links de WhatsApp e 4 de telefone testados no celular
- [ ] Convênios conferidos com o contrato
- [ ] Conversão ligada — os `data-cta` já disparam `gtag` e `fbq`, falta carregar a
      tag (`../07-crm-integracao.md`)
- [ ] Testado em tela pequena e nos dois temas

## Nota de compliance (CFM)

Publicidade médica tem regra mais dura que estética. O rodapé já traz responsável
técnico e a ressalva de que a página não substitui consulta. Antes de subir, checar
com o Eder as vedações do CFM aplicáveis — em especial promessa de resultado,
autopromoção comparativa e divulgação de preço, que varia conforme o entendimento
do CRM do estado dele.

## Notas técnicas

- Fontes: Newsreader (títulos) + IBM Plex Sans (operacional)
- Tema claro e escuro completos
- SVG do setor de varredura do ultrassom no fundo do hero (~600 bytes, inline)
- Sem imagem externa — carrega rápido em 4G, que é onde a página vive
- `data-cta` identifica de onde veio o clique: hero, hero-tel, local, final,
  dock, dock-tel
