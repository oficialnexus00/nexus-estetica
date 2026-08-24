// Roteiros espelhados de `comercial/reels-conteudo.md`.
// A fonte de verdade editorial continua sendo o markdown — aqui fica a versão
// estruturada que o Remotion consome pra renderizar.

export type Roteiro = {
  id: string;
  tema: string;
  gancho: string;
  desenvolvimento: string;
  cta: string;
  /**
   * Caminho do vídeo gravado (relativo a `public/`), ex.: "gravacoes/reel-1.mp4".
   * Sem isso o template renderiza um slot vazio marcando onde a gravação entra.
   */
  videoSrc?: string;
};

export const ROTEIROS: Roteiro[] = [
  {
    id: "reel-1-resposta",
    tema: "resposta",
    gancho:
      "Deixa eu adivinhar por que aquela paciente sumiu do teu WhatsApp. E não, não foi o preço.",
    desenvolvimento:
      "Você tava atendendo. Ela mandou mensagem tipo duas da tarde, você só viu lá pras cinco, entre um paciente e outro. Respondeu oi, tudo bem… e ela nunca mais apareceu. Nesse meio tempo ela já tinha mandado pra outras três clínicas. E fechou com a que respondeu na hora. Não foi teu preço. Foi o tempo que ela ficou esperando.",
    cta: "Comenta RESPOSTA aqui embaixo que eu te conto como a gente resolve isso.",
  },
  {
    id: "reel-2-perde-atendendo",
    tema: "perde atendendo",
    gancho: "Isso aqui já te aconteceu essa semana. Eu aposto.",
    desenvolvimento:
      "Você tá ali, concentrado no procedimento, e o celular vibra. Vibra de novo. Você não pode parar, óbvio. Aí no fim do dia você abre o WhatsApp: três mensagens perguntando sobre harmonização. Você responde oi, ainda tem interesse… silêncio. Cada uma daquelas era um paciente de alto ticket. Foi embora enquanto você fazia o teu trabalho.",
    cta: "Salva esse aqui se você já viveu isso. E comenta AGENDA que eu te mostro a saída.",
  },
  {
    id: "reel-3-case-jennifer",
    tema: "case Jennifer",
    gancho:
      "Mil quinhentos e cinquenta e cinco reais. Foi o que uma clínica investiu. Adivinha quanto voltou.",
    desenvolvimento:
      "Vou te falar sem enrolação. A gente subiu o tráfego pra uma clínica de harmonização glútea, com um criativo feito pra chamar quem realmente quer fazer. E quando a pessoa mandava mensagem, uma IA respondia na hora, tirava a dúvida e já jogava a avaliação na agenda. Deu 26 consultas marcadas em 30 dias. Isso não é sorte, é sistema.",
    cta: "Se você quer entender como isso rodaria na tua clínica, comenta CASE ou me chama no direct.",
  },
  {
    id: "reel-4-trafego-sistema",
    tema: "tráfego + sistema",
    gancho: "Te vendem lead barato e esquecem de te contar a parte chata.",
    desenvolvimento:
      "É o seguinte: lead sozinho não paga conta. Você já deve ter contratado alguém que te entregou um monte de contato e sumiu. Aí sobrou pra você responder quarenta pessoas no meio do atendimento. Responde uma, esquece dez, o resto esfria. Virou dinheiro no lixo. Por isso a gente não faz só tráfego. O anúncio enche, o sistema segura.",
    cta: "Comenta SISTEMA que eu te explico como as duas se juntam.",
  },
];
