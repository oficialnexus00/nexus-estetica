const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE";           // 13.3 x 7.5
const W = 13.3, H = 7.5;

/* ---------- paleta ---------- */
const INK   = "10131A";   // fundo profundo
const INK2  = "1B212A";   // superficie
const INK3  = "252D38";   // superficie 2
const BONE  = "E8E6E1";   // texto claro
const MUTE  = "9AA3AF";   // texto secundario
const MUSC  = "C9524C";   // musculo carmim
const MUSC2 = "E0817A";
const TEAL  = "00BFA5";   // acento / marcador
const AMBER = "E0A33F";   // risco

const TITLE = "Century Schoolbook";
const BODY  = "Calibri";

const sh = () => ({ type:"outer", color:"000000", blur:14, offset:3, angle:90, opacity:0.35 });

/* ---------- helpers ---------- */
function base(bg){ const s = p.addSlide(); s.background = { color: bg || INK }; return s; }

// selo numerado — motivo visual do deck
function badge(s, n, x, y, d){
  d = d || 0.58;
  s.addShape(p.ShapeType.ellipse, { x, y, w:d, h:d, fill:{color:TEAL} });
  s.addText(String(n), { x, y, w:d, h:d, align:"center", valign:"middle",
    fontFace:BODY, fontSize:d>0.5?16:12, bold:true, color:"06231E", margin:0 });
}

// pilha das 5 camadas — motivo recorrente. hi = 'sup' | 'mus' | 'prof' | null
const CAMADAS = [
  { n:"1", nome:"Pele",                     tag:"epiderme + derme" },
  { n:"2", nome:"Tecido subcutâneo",        tag:"gordura superficial" },
  { n:"3", nome:"Camada musculoaponeurótica", tag:"SMAS + músculos mímicos" },
  { n:"4", nome:"Tecido areolar frouxo",    tag:"espaços de deslizamento" },
  { n:"5", nome:"Periósteo e fáscia profunda", tag:"gordura profunda + osso" },
];

function stack(s, x, y, w, hBand, hi, opts){
  opts = opts || {};
  CAMADAS.forEach((c, i) => {
    const on = hi === c.n;
    const yy = y + i * (hBand + 0.06);
    s.addShape(p.ShapeType.rect, {
      x, y:yy, w, h:hBand,
      fill:{ color: on ? (c.n==="3" ? MUSC : TEAL) : INK3 },
      line:{ color: on ? (c.n==="3" ? MUSC2 : TEAL) : "313A46", width:0.75 },
    });
    s.addText(c.n, { x:x+0.08, y:yy, w:0.3, h:hBand, align:"center", valign:"middle",
      fontFace:BODY, fontSize:10, bold:true, margin:0,
      color: on ? (c.n==="3" ? "FFFFFF" : "06231E") : MUTE });
    if (opts.labels !== false){
      s.addText(c.nome, { x:x+0.42, y:yy, w:w-0.5, h:hBand, valign:"middle",
        fontFace:BODY, fontSize:10.5, bold:on, margin:0,
        color: on ? (c.n==="3" ? "FFFFFF" : "06231E") : BONE });
    }
  });
}

function titulo(s, txt, sup){
  if (sup) s.addText(sup.toUpperCase(), { x:0.7, y:0.42, w:11.9, h:0.26,
    fontFace:BODY, fontSize:10.5, bold:true, charSpacing:2.6, color:TEAL, margin:0 });
  s.addText(txt, { x:0.7, y:sup?0.72:0.55, w:11.9, h:0.72,
    fontFace:TITLE, fontSize:34, bold:true, color:BONE, margin:0 });
}

/* =====================================================================
   1 — CAPA
   ===================================================================== */
{
  const s = base(INK);

  // corte estratificado como arte de capa (referencia a anatomia em camadas)
  const bx = 7.55, bw = 5.0, bh = 0.72;
  CAMADAS.forEach((c,i)=>{
    const yy = 1.32 + i*(bh+0.13);
    const is3 = c.n === "3";
    s.addShape(p.ShapeType.rect, {
      x:bx, y:yy, w:bw, h:bh,
      fill:{ color: is3 ? MUSC : INK2 },
      line:{ color: is3 ? MUSC2 : "2E3742", width: is3 ? 1.4 : 0.75 },
      shadow: is3 ? sh() : undefined,
    });
    s.addText(c.n, { x:bx+0.16, y:yy, w:0.34, h:bh, align:"center", valign:"middle",
      fontFace:BODY, fontSize:12.5, bold:true, margin:0, color: is3 ? "FFFFFF" : MUTE });
    s.addText(c.nome, { x:bx+0.62, y:yy+0.06, w:bw-0.8, h:0.3, valign:"middle",
      fontFace:BODY, fontSize:12.5, bold:is3, margin:0, color: is3 ? "FFFFFF" : BONE });
    s.addText(c.tag, { x:bx+0.62, y:yy+0.34, w:bw-0.8, h:0.28, valign:"middle",
      fontFace:BODY, fontSize:9.5, margin:0, color: is3 ? "F4D7D4" : MUTE });
  });

  // marcador da agulha, dentro da faixa da camada 3
  const y3 = 1.32 + 2*(bh+0.13);
  s.addShape(p.ShapeType.ellipse, { x:bx+bw-0.56, y:y3+(bh-0.3)/2, w:0.3, h:0.3, fill:{color:TEAL} });
  s.addText("A toxina para aqui — camada 3, onde vive o músculo mímico",
    { x:bx, y:1.32+5*(bh+0.13)+0.1, w:bw, h:0.36, valign:"middle",
      fontFace:BODY, fontSize:10.5, bold:true, color:TEAL, margin:0 });

  s.addText("ESPECIALIZAÇÃO EM TOXINA BOTULÍNICA", { x:0.85, y:1.55, w:6.2, h:0.3,
    fontFace:BODY, fontSize:11, bold:true, charSpacing:2.6, color:TEAL, margin:0 });
  s.addText("Anatomia\nda Toxina", { x:0.85, y:1.95, w:6.4, h:2.1,
    fontFace:TITLE, fontSize:58, bold:true, color:BONE, margin:0, lineSpacing:60 });
  s.addText("A musculatura mímica facial em camadas — onde cada músculo está, em que plano se aplica e o que a difusão cobra quando o plano erra.",
    { x:0.85, y:4.2, w:6.0, h:1.0, fontFace:BODY, fontSize:14.5, color:MUTE, margin:0, lineSpacing:22 });
  s.addText("Modelo estratificado da face · 11 músculos · doses em unidades de onabotulinumtoxinA",
    { x:0.85, y:5.55, w:6.2, h:0.5, fontFace:BODY, fontSize:11, color:TEAL, margin:0, lineSpacing:16 });

  s.addNotes("Abrir pela camada, não pelo músculo. A pergunta que organiza a aula inteira é 'em que plano eu estou?' — não 'qual músculo eu quero'. Quem domina profundidade não causa difusão.");
}

/* =====================================================================
   2 — AS CINCO CAMADAS
   ===================================================================== */
{
  const s = base(INK);
  titulo(s, "A face é lida em camadas, não em regiões", "Fundamento");
  s.addText("A anatomia estratificada organiza a face em cinco camadas constantes. Elas existem em toda a face — o que muda de região para região é a espessura de cada uma e o quanto estão aderidas entre si. Toda a segurança em toxina e preenchedor vem de saber em qual delas a agulha está.",
    { x:0.7, y:1.65, w:6.1, h:1.6, fontFace:BODY, fontSize:14, color:MUTE, margin:0, lineSpacing:22 });

  const items = [
    ["Toxina botulínica", "Camada 3 — o músculo mímico está aqui", TEAL],
    ["Preenchedor estrutural", "Camada 5 — apoiado no periósteo", BONE],
    ["Preenchedor superficial", "Camada 2 — compartimentos de gordura", BONE],
  ];
  items.forEach((it, i) => {
    const yy = 3.5 + i*0.82;
    s.addShape(p.ShapeType.roundRect, { x:0.7, y:yy, w:6.1, h:0.68, rectRadius:0.06,
      fill:{color:INK2}, line:{color:"2E3742", width:0.75} });
    s.addText(it[0], { x:0.95, y:yy+0.03, w:2.6, h:0.32, valign:"middle",
      fontFace:BODY, fontSize:12.5, bold:true, color:it[2], margin:0 });
    s.addText(it[1], { x:0.95, y:yy+0.33, w:5.1, h:0.3, valign:"middle",
      fontFace:BODY, fontSize:10.5, color:MUTE, margin:0 });
  });

  // pilha grande, camada 3 destacada
  s.addShape(p.ShapeType.roundRect, { x:7.35, y:1.5, w:5.25, h:4.9, rectRadius:0.08,
    fill:{color:INK2}, line:{color:"2E3742", width:0.75}, shadow:sh() });
  s.addText("CORTE ESTRATIFICADO", { x:7.7, y:1.78, w:4.6, h:0.28,
    fontFace:BODY, fontSize:9.5, bold:true, charSpacing:2.2, color:MUTE, margin:0 });
  stack(s, 7.7, 2.2, 4.55, 0.72, "3");
  s.addText("A camada 3 é o alvo. As camadas 2 e 4 são por onde o produto escapa quando o volume é alto ou o plano está errado.",
    { x:7.7, y:6.28, w:4.55, h:0.5, fontFace:BODY, fontSize:9.5, color:MUTE, margin:0, lineSpacing:13 });

  s.addNotes("Insistir: complicação estética quase nunca é dose errada, é plano errado. A dose define intensidade; o plano define quem recebe.");
}

/* =====================================================================
   3 — MAPA DOS MUSCULOS (indice)
   ===================================================================== */
const M = [
  {n:1, nome:"Frontal", latim:"m. frontalis", regiao:"Terço superior",
   acao:"Único elevador da sobrancelha. Produz as linhas horizontais da testa.",
   pontos:"4 a 8 pontos, em V ou linha, na altura média do ventre",
   dose:"10 – 20 U no total", plano:"Superficial — subcutâneo", camada:"2",
   ref:"No mínimo 2 cm acima do rebordo orbitário. Não tratar o terço inferior isoladamente.",
   risco:"Ptose de sobrancelha e testa pesada. Nunca tratar o frontal sem equilibrar o complexo glabelar: sem antagonista, o depressor vence e a sobrancelha cai. Poupar as fibras laterais gera a sobrancelha em vírgula."},
  {n:2, nome:"Prócero", latim:"m. procerus", regiao:"Complexo glabelar",
   acao:"Traciona a sobrancelha medial para baixo. Gera a linha horizontal da raiz nasal.",
   pontos:"1 ponto na linha média, no cruzamento das diagonais entre os cantos internos",
   dose:"4 – 6 U", plano:"Profundo — intramuscular", camada:"3",
   ref:"Raiz nasal, entre as cabeças dos corrugadores.",
   risco:"Ponto muito inferior atinge a musculatura nasal. Tratar sempre junto com os corrugadores — o complexo glabelar clássico são 20 U em 5 pontos."},
  {n:3, nome:"Corrugador do supercílio", latim:"m. corrugator supercilii", regiao:"Complexo glabelar",
   acao:"Aproxima e abaixa as sobrancelhas. Responsável pelas linhas verticais da glabela.",
   pontos:"2 pontos por lado — cabeça e corpo do músculo",
   dose:"4 – 6 U por lado", plano:"Profundo na cabeça, superficializa lateralmente", camada:"3",
   ref:"Pedir contração para localizar o ventre. Injetar acima do rebordo orbitário.",
   risco:"É aqui que nasce a ptose palpebral: a toxina difunde pelo septo orbitário até o levantador da pálpebra superior. Manter no mínimo 1 cm acima do rebordo, volume baixo, e não deslocar o produto para baixo."},
  {n:4, nome:"Orbicular do olho", latim:"m. orbicularis oculi", regiao:"Periorbital",
   acao:"Esfíncter palpebral. A porção orbitária produz as linhas laterais — os pés de galinha.",
   pontos:"3 pontos por lado, em C vertical na porção lateral",
   dose:"8 – 12 U por lado", plano:"Muito superficial — subdérmico, bisel para cima", camada:"2",
   ref:"No mínimo 1 cm lateral ao rebordo orbitário ósseo.",
   risco:"Ponto inferior ou anterior demais difunde para o zigomático maior e derruba o lábio superior. Na pálpebra inferior, excesso causa lagoftalmo e ectrópio. Difusão profunda pode atingir o reto lateral e causar diplopia."},
  {n:5, nome:"Nasal", latim:"m. nasalis", regiao:"Terço médio",
   acao:"Enruga o dorso do nariz. Gera as bunny lines.",
   pontos:"1 ponto por lado, na parede lateral do dorso nasal",
   dose:"2 – 4 U por lado", plano:"Superficial", camada:"2",
   ref:"Acima do sulco nasofacial, sobre o osso nasal.",
   risco:"Ponto baixo ou lateral demais atinge o levantador do lábio superior e da asa do nariz, derrubando o lábio e achatando o sorriso."},
  {n:6, nome:"Zigomáticos maior e menor", latim:"mm. zygomatici", regiao:"Estrutura a proteger",
   acao:"Elevam a comissura labial. São o sorriso.",
   pontos:"Não são alvo em estética — são a estrutura que se protege",
   dose:"Não se aplica", plano:"Camada 3, trajeto oblíquo", camada:"3",
   ref:"Da eminência zigomática à comissura oral.",
   risco:"A maior parte dos sorrisos assimétricos pós-toxina vem de difusão até aqui — vinda do orbicular do olho ou do masseter. Conhecer o trajeto é o que define os limites seguros das duas regiões vizinhas."},
  {n:7, nome:"Orbicular da boca", latim:"m. orbicularis oris", regiao:"Perioral",
   acao:"Esfíncter oral. Produz as rugas verticais periorais — o código de barras.",
   pontos:"2 a 4 pontos no lábio superior, simétricos, próximos ao vermelhão",
   dose:"1 – 2 U por ponto, até cerca de 4 U", plano:"Muito superficial, quase intradérmico", camada:"2",
   ref:"Respeitar o arco do cupido e a coluna filtral.",
   risco:"Incompetência oral: dificuldade de assobiar, beber em canudo e articular P e B. Dose mínima sempre. Na prática, contraindicado em músicos de sopro e profissionais da voz."},
  {n:8, nome:"Depressor do ângulo da boca", latim:"m. depressor anguli oris", regiao:"Terço inferior",
   acao:"Abaixa a comissura labial. Responsável pelo canto da boca caído.",
   pontos:"1 ponto por lado", dose:"2 – 5 U por lado", plano:"Profundo", camada:"3",
   ref:"Sobre a borda mandibular, lateral à linha vertical da comissura. Pedir contração para isolar o ventre.",
   risco:"Ponto medial demais atinge o depressor do lábio inferior e gera assimetria evidente ao falar e sorrir. Errar aqui aparece em toda conversa da paciente."},
  {n:9, nome:"Mentual", latim:"m. mentalis", regiao:"Terço inferior",
   acao:"Eleva e projeta o lábio inferior. Produz o queixo em casca de laranja.",
   pontos:"1 ponto na linha média ou 2 simétricos, na ponta do mento",
   dose:"4 – 8 U no total", plano:"Profundo, junto ao periósteo", camada:"5",
   ref:"Porção inferior do mento, bem abaixo do sulco mentolabial.",
   risco:"Ponto superior demais atinge o orbicular da boca e causa incompetência labial. Manter-se baixo, próximo ao osso."},
  {n:10, nome:"Masseter", latim:"m. masseter", regiao:"Terço inferior",
   acao:"Elevador da mandíbula. Alvo em bruxismo e em contorno do terço inferior.",
   pontos:"3 pontos por lado, em triângulo, dentro da área segura",
   dose:"20 – 30 U por lado", plano:"Profundo — tocar o osso e recuar", camada:"5",
   ref:"Área segura: borda anterior do masseter, borda posterior do ramo, borda inferior da mandíbula e a linha do trago à comissura.",
   risco:"Ponto anterior ou superficial demais atinge risório e zigomáticos e gera sorriso assimétrico. Ponto superior demais atinge a parótida. Pode ocorrer abaulamento paradoxal por hipertrofia compensatória de feixes não tratados."},
  {n:11, nome:"Platisma", latim:"m. platysma", regiao:"Cervical",
   acao:"Tensiona a pele cervical e traciona o terço inferior para baixo. Forma as bandas platismais.",
   pontos:"Múltiplos pontos ao longo de cada banda, pinçando a banda entre os dedos",
   dose:"2 – 3 U por ponto, 20 – 30 U no total", plano:"Superficial — o platisma é subcutâneo", camada:"3",
   ref:"Pedir contração forçada para evidenciar as bandas antes de marcar.",
   risco:"Dose alta ou plano profundo no pescoço pode causar disfagia e fraqueza cervical. É a região onde o excesso tem a consequência mais sistêmica — dose conservadora sempre."},
];

{
  const s = base(INK);
  titulo(s, "Os onze músculos da aula", "Mapa");
  const cols = 3, cw = 3.92, chh = 1.16;
  M.forEach((m, i) => {
    const c = i % cols, r = Math.floor(i / cols);
    const x = 0.7 + c*(cw+0.24), y = 1.72 + r*(chh+0.22);
    s.addShape(p.ShapeType.roundRect, { x, y, w:cw, h:chh, rectRadius:0.06,
      fill:{color:INK2}, line:{color:"2E3742", width:0.75} });
    badge(s, m.n, x+0.24, y+0.24, 0.46);
    s.addText(m.nome, { x:x+0.86, y:y+0.2, w:cw-1.05, h:0.36, valign:"middle",
      fontFace:BODY, fontSize:13, bold:true, color:BONE, margin:0 });
    s.addText(m.regiao, { x:x+0.86, y:y+0.55, w:cw-1.05, h:0.26, valign:"middle",
      fontFace:BODY, fontSize:9.5, color:MUTE, margin:0 });
    s.addText(m.dose === "Não se aplica" ? "estrutura a proteger" : m.dose,
      { x:x+0.86, y:y+0.79, w:cw-1.05, h:0.26, valign:"middle",
        fontFace:BODY, fontSize:10, bold:true, color: m.dose==="Não se aplica" ? AMBER : TEAL, margin:0 });
  });
  s.addNotes("O número 6 não é alvo — está na lista de propósito. Metade dos erros do terço médio e inferior é difusão até o zigomático.");
}

/* =====================================================================
   4..14 — UM MUSCULO POR SLIDE
   ===================================================================== */
M.forEach(m => {
  const s = base(INK);
  const alvo = m.dose !== "Não se aplica";

  badge(s, m.n, 0.7, 0.5, 0.62);
  s.addText(m.regiao.toUpperCase(), { x:1.52, y:0.5, w:8.0, h:0.24,
    fontFace:BODY, fontSize:9.5, bold:true, charSpacing:2.4, color: alvo?TEAL:AMBER, margin:0 });
  s.addText(m.nome, { x:1.52, y:0.72, w:8.6, h:0.52,
    fontFace:TITLE, fontSize:29, bold:true, color:BONE, margin:0 });
  s.addText(m.latim, { x:1.52, y:1.26, w:8.6, h:0.28,
    fontFace:BODY, fontSize:12, italic:true, color:MUTE, margin:0 });

  // coluna esquerda — ficha
  const linhas = [
    ["Ação",        m.acao],
    ["Pontos",      m.pontos],
    ["Dose",        m.dose],
    ["Plano",       m.plano],
    ["Referência",  m.ref],
  ];
  let y = 1.86;
  linhas.forEach(l => {
    const alta = l[0]==="Ação" || l[0]==="Referência" || l[0]==="Pontos";
    const h = alta ? 0.70 : 0.44;
    s.addText(l[0].toUpperCase(), { x:0.7, y, w:1.22, h:0.26,
      fontFace:BODY, fontSize:9, bold:true, charSpacing:1.4, color:MUTE, margin:0 });
    s.addText(l[1], { x:2.0, y:y-0.04, w:5.5, h:h,
      fontFace:BODY, fontSize: l[0]==="Dose" ? 15 : 12.5,
      bold: l[0]==="Dose", color: l[0]==="Dose" ? (alvo?TEAL:AMBER) : BONE,
      margin:0, lineSpacing: l[0]==="Dose" ? 20 : 17 });
    y += h + 0.09;
  });

  // coluna direita — profundidade
  s.addShape(p.ShapeType.roundRect, { x:8.0, y:1.86, w:4.6, h:3.30, rectRadius:0.07,
    fill:{color:INK2}, line:{color:"2E3742", width:0.75}, shadow:sh() });
  s.addText("EM QUE CAMADA A AGULHA PARA", { x:8.3, y:2.06, w:4.0, h:0.26,
    fontFace:BODY, fontSize:9, bold:true, charSpacing:1.6, color:MUTE, margin:0 });
  stack(s, 8.3, 2.44, 4.0, 0.46, m.camada);

  // faixa de risco
  s.addShape(p.ShapeType.roundRect, { x:0.7, y:5.55, w:11.9, h:1.42, rectRadius:0.07,
    fill:{color:"2A2015"}, line:{color:AMBER, width:1} });
  s.addText("ONDE ERRA", { x:1.0, y:5.73, w:2.6, h:0.26,
    fontFace:BODY, fontSize:9, bold:true, charSpacing:1.6, color:AMBER, margin:0 });
  s.addText(m.risco, { x:1.0, y:6.01, w:11.3, h:0.86,
    fontFace:BODY, fontSize:12, color:BONE, margin:0, lineSpacing:17 });

  s.addNotes(`${m.nome} — ${m.plano}. ${alvo ? "Dose: " + m.dose + "." : "Não é alvo: é estrutura a proteger."} Ponto de atenção: ${m.risco.split(".")[0]}.`);
});

/* =====================================================================
   15 — CONVERSAO ENTRE PRODUTOS
   ===================================================================== */
{
  const s = base(INK);
  titulo(s, "Unidade não é volume — é potência do produto", "Segurança");
  s.addText("Trocar de marca mantendo o número da dose é o erro mais caro da especialização. As unidades medem atividade biológica e não são intercambiáveis entre produtos.",
    { x:0.7, y:1.62, w:11.9, h:0.6, fontFace:BODY, fontSize:14, color:MUTE, margin:0, lineSpacing:21 });

  const rows = [
    ["Botox",   "onabotulinumtoxinA",  "1 : 1",           "Referência deste material"],
    ["Xeomin",  "incobotulinumtoxinA", "≈ 1 : 1",         "Sem proteínas complexantes"],
    ["Dysport", "abobotulinumtoxinA",  "≈ 1 : 2,5",       "Faixa relatada de 1:2 a 1:3 conforme indicação"],
    ["Jeuveau", "prabotulinumtoxinA",  "≈ 1 : 1",         "Aprovado apenas para glabela"],
    ["Daxxify", "daxibotulinumtoxinA", "não conversível", "Unidades próprias — usar sempre a bula"],
  ];
  const hdr = ["PRODUTO","PRINCÍPIO ATIVO","RELAÇÃO COM ONA","OBSERVAÇÃO"];
  const cx = [0.7, 3.0, 6.2, 8.9], cwd = [2.2, 3.1, 2.6, 3.7];
  hdr.forEach((h,i)=> s.addText(h, { x:cx[i], y:2.5, w:cwd[i], h:0.3,
    fontFace:BODY, fontSize:9, bold:true, charSpacing:1.6, color:MUTE, margin:0 }));

  rows.forEach((r, i) => {
    const yy = 2.92 + i*0.76;
    s.addShape(p.ShapeType.roundRect, { x:0.7, y:yy, w:11.9, h:0.64, rectRadius:0.05,
      fill:{color: r[0]==="Dysport" ? "2A2015" : INK2},
      line:{color: r[0]==="Dysport" ? AMBER : "2E3742", width: r[0]==="Dysport" ? 1 : 0.75} });
    s.addText(r[0], { x:cx[0]+0.28, y:yy, w:cwd[0]-0.4, h:0.64, valign:"middle",
      fontFace:BODY, fontSize:13, bold:true, color:BONE, margin:0 });
    s.addText(r[1], { x:cx[1], y:yy, w:cwd[1], h:0.64, valign:"middle",
      fontFace:BODY, fontSize:11.5, italic:true, color:MUTE, margin:0 });
    s.addText(r[2], { x:cx[2], y:yy, w:cwd[2], h:0.64, valign:"middle",
      fontFace:BODY, fontSize:13, bold:true, color: r[0]==="Dysport" ? AMBER : TEAL, margin:0 });
    s.addText(r[3], { x:cx[3], y:yy, w:cwd[3], h:0.64, valign:"middle",
      fontFace:BODY, fontSize:11, color:BONE, margin:0 });
  });
  s.addText("Todas as doses citadas neste material estão em unidades de onabotulinumtoxinA.",
    { x:0.7, y:6.82, w:11.9, h:0.3, fontFace:BODY, fontSize:10.5, color:MUTE, margin:0 });

  s.addNotes("Perguntar à turma quanto de Dysport equivale a 20 U de Botox na glabela. A resposta 50 U costuma surpreender — e é justamente o cálculo que ninguém faz de cabeça na hora.");
}

/* =====================================================================
   16 — REGRAS
   ===================================================================== */
{
  const s = base(INK);
  titulo(s, "Quase todo evento adverso é difusão", "Prática");
  s.addText("Diluição, volume por ponto e distância do rebordo ósseo evitam mais complicação do que qualquer técnica sofisticada.",
    { x:0.7, y:1.62, w:11.9, h:0.4, fontFace:BODY, fontSize:14, color:MUTE, margin:0 });

  const blocos = [
    ["Antes de puncionar", ["Avaliar em movimento, nunca em repouso","Marcar com a paciente sentada","Documentar assimetria prévia com foto","Checar ptose ou dermatocálase preexistente"]],
    ["Durante",            ["Volume baixo por ponto — mais volume difunde mais longe","Respeitar 1 cm do rebordo orbitário","Bisel para cima onde o músculo é fino","Saber o plano é a segurança, não aspirar"]],
    ["Depois",             ["Não massagear — massagem é difusão dirigida","Cabeça elevada nas primeiras 4 horas","Retorno em 14 dias, nunca antes","Retoque ajusta assimetria, não repete dose"]],
    ["Sinais de alerta",   ["Ptose palpebral — difusão ao levantador","Queda de sobrancelha — frontal sem antagonista","Sorriso assimétrico — zigomático ou risório","Disfagia após platisma — dose ou plano"]],
  ];
  blocos.forEach((b, i) => {
    const c = i % 2, r = Math.floor(i / 2);
    const x = 0.7 + c*6.14, y = 2.32 + r*2.28;
    s.addShape(p.ShapeType.roundRect, { x, y, w:5.76, h:2.04, rectRadius:0.07,
      fill:{color: i===3 ? "2A2015" : INK2}, line:{color: i===3 ? AMBER : "2E3742", width: i===3?1:0.75} });
    s.addText(b[0], { x:x+0.32, y:y+0.18, w:5.1, h:0.32,
      fontFace:BODY, fontSize:13, bold:true, color: i===3 ? AMBER : TEAL, margin:0 });
    s.addText(b[1].map((t,j)=>({ text:t, options:{ bullet:true, breakLine: j < b[1].length-1 } })),
      { x:x+0.32, y:y+0.56, w:5.1, h:1.34, fontFace:BODY, fontSize:11, color:BONE,
        margin:0, paraSpaceAfter:4, lineSpacing:15 });
  });
  s.addNotes("Fechar a aula aqui. A pergunta de prova é sempre 'em que camada você estava'.");
}

/* =====================================================================
   17 — ENCERRAMENTO
   ===================================================================== */
{
  const s = base(INK);
  s.addText("Em que camada\nvocê estava?", { x:0.9, y:1.9, w:7.4, h:2.2,
    fontFace:TITLE, fontSize:46, bold:true, color:BONE, margin:0, lineSpacing:52 });
  s.addText("Dose define intensidade. Plano define quem recebe. Quando a resposta a essa pergunta é imediata, a complicação deixa de ser sorte.",
    { x:0.9, y:4.3, w:6.6, h:1.0, fontFace:BODY, fontSize:15, color:MUTE, margin:0, lineSpacing:23 });

  s.addShape(p.ShapeType.roundRect, { x:8.1, y:1.9, w:4.4, h:3.7, rectRadius:0.08,
    fill:{color:INK2}, line:{color:"2E3742", width:0.75}, shadow:sh() });
  stack(s, 8.45, 2.3, 3.7, 0.50, "3");
  s.addText("A camada 3 é o endereço da toxina.", { x:8.45, y:5.14, w:3.7, h:0.36,
    fontFace:BODY, fontSize:10.5, bold:true, color:TEAL, margin:0, lineSpacing:14 });

  s.addShape(p.ShapeType.roundRect, { x:0.9, y:5.78, w:11.5, h:1.06, rectRadius:0.06,
    fill:{color:INK2}, line:{color:"2E3742", width:0.75} });
  s.addText("Material de apoio didático. Diagramas esquemáticos, com proporções simplificadas para ensino de posição relativa e vizinhança de risco — não substituem atlas anatômico, dissecção nem a bula do produto. Doses expressas como faixas de referência da literatura em unidades de onabotulinumtoxinA. A indicação, a dose e a técnica são responsabilidade do profissional habilitado que aplica.",
    { x:1.18, y:5.94, w:10.94, h:0.78, fontFace:BODY, fontSize:10, color:MUTE, margin:0, lineSpacing:14 });

  s.addNotes("Deixar o disclaimer visível no encerramento. Se o material circular entre alunos, ele viaja junto.");
}

p.writeFile({ fileName: "Anatomia-da-Toxina.pptx" }).then(f => console.log("gerado:", f));
