# Material de apoio (apostila A4) — HTML print-first -> PDF via Chromium.
import json, base64, os, html

D = "/tmp/claude-0/-home-user-nexus-estetica/fce28205-5f2e-5553-8b7d-75a2dd398951/scratchpad/deck"
M = json.load(open(os.path.join(D, "musculos.json"), encoding="utf-8"))

def png64(p):
    return "data:image/png;base64," + base64.b64encode(open(p, "rb").read()).decode()

# mapa em versao clara para impressao
import sys
sys.path.insert(0, D)
import face as F
import principios
import cairosvg
F.INK, F.BONE, F.EDGE = "#FFFFFF", "#EDEAE4", "#C9C3B8"
F.MUSC, F.HOT, F.HOTL = "#B4534D", "#963A35", "#7A2B27"
F.TEAL, F.REF = "#0A7D6C", "#8A8478"
cairosvg.svg2png(bytestring=F.svg(None, True).encode(), write_to="/tmp/mapa-print.png",
                 output_width=1000, output_height=1305)
MAPA = png64("/tmp/mapa-print.png")
# diagramas dos principios em versao clara
import principios as PR
PR.INK, PR.INK2, PR.INK3 = "#FFFFFF", "#F6F4F0", "#EDEAE4"
PR.EDGE, PR.BONE, PR.MUTE = "#C9C3B8", "#1D2025", "#6B7078"
PR.MUSC, PR.MUSC2 = "#B4534D", "#8E3A35"
PR.TEAL, PR.AMBER, PR.OSSO = "#0A7D6C", "#8A5A12", "#B5AEA1"
PRINC_IMG = {}
for _k, _fn in (("p1",PR.p1),("p2",PR.p2),("p3",PR.p3),("p4",PR.p4),("p5",PR.p5)):
    cairosvg.svg2png(bytestring=_fn().encode(), write_to="/tmp/pr-%s.png" % _k,
                     output_width=1120, output_height=800)
    PRINC_IMG[_k] = png64("/tmp/pr-%s.png" % _k)

MINI = {}
for i in F.MUS:
    cairosvg.svg2png(bytestring=F.svg(i, False).encode(), write_to="/tmp/mini-%d.png" % i,
                     output_width=420, output_height=548)
    MINI[i] = png64("/tmp/mini-%d.png" % i)

e = html.escape

CAMADAS = [("1","Pele","epiderme e derme"),
           ("2","Tecido subcutâneo","gordura superficial"),
           ("3","Camada musculoaponeurótica","SMAS e músculos mímicos"),
           ("4","Tecido areolar frouxo","espaços de deslizamento"),
           ("5","Periósteo e fáscia profunda","gordura profunda e osso")]

PRINCIPIOS = [
 ("p1","Origem fixa, inserção móvel","O movimento vai da inserção para a origem",
  "Todo músculo puxa a parte móvel em direção à parte fixa. Na face, a origem é o osso e a inserção é a pele — é por isso que a face tem expressão, e não apenas movimento. Achou de onde ele sai e onde ele chega, você deduziu a ação.",
  "Não pergunte o que o músculo faz. Pergunte de onde ele sai e onde ele chega — a ação é consequência."),
 ("p2","A ruga é perpendicular ao vetor","A ruga se forma sempre a 90° da fibra",
  "Fibra vertical produz ruga horizontal. Fibra horizontal produz ruga vertical. Fibra circular produz ruga radiada. E funciona nos dois sentidos: olhando a ruga da paciente você deduz o vetor; sabendo o vetor, você prevê a ruga.",
  "É o princípio que dispensa o mapa. A face da paciente já conta onde estão as fibras — basta saber ler."),
 ("p3","Todo músculo tem antagonista","O resultado é o saldo, não o músculo isolado",
  "A face é um sistema de elevadores contra depressores. Quando você enfraquece um lado da balança, o outro vence. No supercílio: frontal, o único elevador, contra corrugador, prócero e orbicular. Na comissura: zigomáticos e levantadores contra DAO e depressores.",
  "Tratar frontal sem tratar glabela derruba a sobrancelha. Não por dose alta — por ter tirado o único elevador."),
 ("p4","A profundidade acompanha a espessura","Músculo fino, plano superficial. Espesso, profundo",
  "Frontal e orbicular do olho são lâminas finas, quase dérmicas: bisel para cima, subdérmico. Cabeça do corrugador, mentual e masseter são espessos: profundo, alguns até tocar o osso. E o mesmo músculo muda de plano ao longo do trajeto.",
  "\u0022Qual a profundidade do corrugador?\u0022 não tem resposta única. Depende de que ponto dele você está falando."),
 ("p5","A difusão não respeita anatomia","Ela respeita distância, volume e plano",
  "Os quatro princípios anteriores descrevem o músculo. Este descreve o produto. A toxina não sabe onde o músculo termina — ela se espalha por gradiente de concentração. Segurança vem de três coisas mensuráveis: distância do vizinho, volume baixo por ponto e plano correto.",
  "Segurança não é aplicar com jeitinho. Por isso 1 cm do rebordo orbitário não é superstição — e massagear depois é difusão dirigida."),
]

princ_html = []
for _i,(k,tit,res,txt_,prat) in enumerate(PRINCIPIOS, 1):
    princ_html.append(f"""
<article class="princ">
  <div class="ph"><span class="num">{_i}</span>
    <div><h3>{e(tit)}</h3><p class="res">{e(res)}</p></div></div>
  <div class="pb">
    <div class="pt"><p>{e(txt_)}</p>
      <p class="prat"><b>Na prática</b>{e(prat)}</p></div>
    <img src="{PRINC_IMG[k]}" alt="Diagrama do princípio {_i}">
  </div>
</article>""")

fichas = []
for m in M:
    alvo = m["dose"] != "Não se aplica"
    fichas.append(f"""
<article class="ficha">
  <div class="fh">
    <span class="num">{m['n']}</span>
    <div>
      <h3>{e(m['nome'])}</h3>
      <p class="lat">{e(m['latim'])} · {e(m['regiao'])}</p>
    </div>
    <span class="dose {'' if alvo else 'off'}">{e(m['dose'])}</span>
  </div>
  <div class="fb">
    <img src="{MINI[m['n']]}" alt="Localização do {e(m['nome'])}">
    <dl>
      <dt>Ação</dt><dd>{e(m['acao'])}</dd>
      <dt>Pontos</dt><dd>{e(m['pontos'])}</dd>
      <dt>Plano</dt><dd><b>{e(m['plano'])}</b> — camada {m['camada']}</dd>
      <dt>Referência</dt><dd>{e(m['ref'])}</dd>
    </dl>
  </div>
  <p class="risco"><b>Onde erra</b>{e(m['risco'])}</p>
  <div class="notas"><span>Anotações</span></div>
</article>""")

CONV = [("Botox","onabotulinumtoxinA","1 : 1","Referência deste material"),
        ("Xeomin","incobotulinumtoxinA","≈ 1 : 1","Sem proteínas complexantes"),
        ("Dysport","abobotulinumtoxinA","≈ 1 : 2,5","Faixa relatada de 1:2 a 1:3 conforme indicação"),
        ("Jeuveau","prabotulinumtoxinA","≈ 1 : 1","Aprovado apenas para glabela"),
        ("Daxxify","daxibotulinumtoxinA","não conversível","Unidades próprias — usar sempre a bula")]

CHECK = [("Antes de puncionar", ["Avaliar em movimento, nunca em repouso — a força do músculo define a dose",
                                 "Marcar com a paciente sentada; deitada a anatomia se desloca",
                                 "Documentar assimetria prévia com foto, em contração e repouso",
                                 "Checar ptose ou dermatocálase preexistente — toxina no frontal piora"]),
         ("Durante", ["Volume baixo por ponto: mais volume difunde mais longe",
                      "Respeitar 1 cm do rebordo orbitário na região periorbital",
                      "Bisel para cima e plano superficial onde o músculo é fino",
                      "Aspirar não substitui conhecer o plano — a profundidade é a segurança"]),
         ("Depois", ["Não massagear a área — massagem é difusão dirigida",
                     "Manter a cabeça elevada nas primeiras 4 horas",
                     "Retorno em 14 dias para avaliar e retocar, nunca antes",
                     "Retoque é ajuste de assimetria, não segunda tentativa de dose"]),
         ("Sinais de alerta", ["Ptose palpebral: difusão ao levantador — apraclonidina como manejo",
                               "Queda de sobrancelha: frontal tratado sem equilibrar depressores",
                               "Sorriso assimétrico: zigomático ou risório atingidos",
                               "Disfagia após platisma: dose alta ou plano profundo no pescoço"])]

doc = f"""<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Anatomia da Toxina — Material de apoio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500;600&display=swap">
<style>
@page {{ size:A4; margin:14mm 13mm 15mm; }}
*{{box-sizing:border-box}}
body{{margin:0;font-family:'IBM Plex Sans',sans-serif;font-size:9.6pt;line-height:1.5;color:#1D2025;background:#fff}}
h1,h2,h3{{font-family:'Archivo',sans-serif;margin:0}}
.mono{{font-family:'IBM Plex Mono',monospace}}

/* capa */
.capa{{height:250mm;display:flex;flex-direction:column;justify-content:center;page-break-after:always}}
.capa .eb{{font-family:'IBM Plex Mono',monospace;font-size:8.5pt;letter-spacing:.2em;text-transform:uppercase;color:#0A7D6C;margin-bottom:9mm}}
.capa h1{{font-size:34pt;line-height:1.05;letter-spacing:-.02em;margin-bottom:6mm}}
.capa .dek{{font-size:12pt;color:#4A5058;max-width:120mm;line-height:1.55}}
.capa .cam{{margin-top:14mm;display:flex;flex-direction:column;gap:1.6mm;max-width:120mm}}
.capa .cam div{{display:flex;gap:4mm;align-items:baseline;padding:2.6mm 4mm;border:0.4pt solid #DDD8CF;border-radius:1.5mm}}
.capa .cam div.hot{{background:#F7ECEB;border-color:#B4534D}}
.capa .cam b{{font-family:'IBM Plex Mono',monospace;color:#8A8478;width:4mm}}
.capa .cam div.hot b{{color:#963A35}}
.capa .cam i{{font-style:normal;margin-left:auto;font-size:8pt;color:#8A8478}}

h2{{font-size:15pt;letter-spacing:-.01em;margin-bottom:1.5mm}}
.sub{{color:#6B7078;font-size:9pt;margin:0 0 5mm}}
section{{page-break-inside:avoid}}
.quebra{{page-break-before:always}}

/* mapa */
.mapa{{text-align:center;margin:4mm 0 6mm}}
.mapa img{{width:96mm}}
.mapa p{{font-size:8pt;color:#6B7078;margin:2mm auto 0;max-width:130mm}}

/* fichas */
.ficha{{border:0.5pt solid #DDD8CF;border-radius:2mm;padding:4.5mm;margin-bottom:4.5mm;page-break-inside:avoid}}
.fh{{display:flex;gap:3.5mm;align-items:flex-start;border-bottom:0.4pt solid #EDEAE4;padding-bottom:3mm;margin-bottom:3mm}}
.num{{flex:none;width:7mm;height:7mm;border-radius:50%;background:#0A7D6C;color:#fff;
  display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:9pt;font-weight:600}}
.fh h3{{font-size:12pt}}
.lat{{margin:.5mm 0 0;font-family:'IBM Plex Mono',monospace;font-size:7.6pt;color:#8A8478}}
.dose{{margin-left:auto;font-family:'IBM Plex Mono',monospace;font-size:10pt;font-weight:600;color:#0A7D6C;white-space:nowrap}}
.dose.off{{color:#8A5A12}}
.fb{{display:flex;gap:5mm;align-items:flex-start}}
.fb img{{flex:none;width:26mm;border:0.4pt solid #EDEAE4;border-radius:1.5mm}}
.fb dl{{margin:0;flex:1;display:grid;grid-template-columns:20mm 1fr;gap:1.6mm 3.5mm}}
.fb dt{{font-family:'IBM Plex Mono',monospace;font-size:7.2pt;letter-spacing:.06em;text-transform:uppercase;color:#8A8478;padding-top:.6mm}}
.fb dd{{margin:0;color:#33383F}}
.risco{{margin:3.5mm 0 0;padding:3mm 3.5mm;background:#FBF3E6;border-left:1.2pt solid #B8860B;border-radius:1mm;font-size:9pt;color:#3A3128}}
.risco b{{display:block;font-family:'IBM Plex Mono',monospace;font-size:7.2pt;letter-spacing:.08em;text-transform:uppercase;color:#8A5A12;margin-bottom:1mm}}
.notas{{margin-top:3mm;height:13mm;border:0.4pt dashed #D5CFC4;border-radius:1.5mm;position:relative}}
.notas span{{position:absolute;top:1.2mm;left:2.5mm;font-family:'IBM Plex Mono',monospace;font-size:6.8pt;letter-spacing:.08em;text-transform:uppercase;color:#B5AEA1}}

.princ{{border:0.5pt solid #DDD8CF;border-radius:2mm;padding:4.5mm;margin-bottom:4.5mm;page-break-inside:avoid}}
.ph{{display:flex;gap:3.5mm;align-items:flex-start;border-bottom:0.4pt solid #EDEAE4;padding-bottom:3mm;margin-bottom:3mm}}
.ph h3{{font-family:'Archivo',sans-serif;font-size:12.5pt;margin:0}}
.res{{margin:.6mm 0 0;font-size:8.6pt;color:#0A7D6C;font-weight:600}}
.pb{{display:flex;gap:5mm;align-items:flex-start}}
.pb .pt{{flex:1}}
.pb .pt p{{margin:0;font-size:9.2pt;color:#33383F}}
.pb img{{flex:none;width:64mm;border:0.4pt solid #EDEAE4;border-radius:1.5mm}}
.prat{{margin-top:3mm!important;padding:3mm 3.5mm;background:#EAF4F1;border-left:1.2pt solid #0A7D6C;border-radius:1mm;font-size:9pt}}
.prat b{{display:block;font-family:'IBM Plex Mono',monospace;font-size:7.2pt;letter-spacing:.08em;text-transform:uppercase;color:#0A7D6C;margin-bottom:1mm}}

table{{width:100%;border-collapse:collapse;font-size:9pt;margin-top:2mm}}
th{{text-align:left;font-family:'IBM Plex Mono',monospace;font-size:7.2pt;letter-spacing:.08em;text-transform:uppercase;color:#8A8478;font-weight:500;padding:2.5mm 3mm;border-bottom:0.8pt solid #DDD8CF}}
td{{padding:2.8mm 3mm;border-bottom:0.4pt solid #EDEAE4}}
tr.alerta td{{background:#FBF3E6}}
td.n{{font-family:'IBM Plex Mono',monospace;font-weight:600;color:#0A7D6C}}
tr.alerta td.n{{color:#8A5A12}}

.grid2{{display:grid;grid-template-columns:1fr 1fr;gap:4.5mm;margin-top:3mm}}
.chk{{border:0.5pt solid #DDD8CF;border-radius:2mm;padding:4mm;page-break-inside:avoid}}
.chk.a{{background:#FBF3E6;border-color:#E0C48A}}
.chk h4{{font-family:'Archivo',sans-serif;font-size:10pt;margin:0 0 2.5mm;color:#0A7D6C}}
.chk.a h4{{color:#8A5A12}}
.chk ul{{margin:0;padding-left:4.5mm;font-size:8.8pt;color:#33383F}}
.chk li{{margin-bottom:1.4mm}}

.aviso{{border:0.5pt solid #E0C48A;background:#FBF3E6;border-radius:2mm;padding:4mm;font-size:8.8pt;color:#3A3128;margin-bottom:6mm}}
.aviso b{{color:#1D2025}}
footer{{margin-top:8mm;padding-top:3.5mm;border-top:0.5pt solid #DDD8CF;font-size:7.6pt;color:#8A8478;line-height:1.55}}
</style></head><body>

<div class="capa">
  <div class="eb">Especialização em toxina botulínica · Material de apoio</div>
  <h1>Anatomia<br>da Toxina</h1>
  <p class="dek">A musculatura mímica facial em camadas: onde cada músculo está, em que plano se aplica, quanto se usa e o que a difusão cobra quando o plano erra.</p>
  <div class="cam">
    {"".join(f'<div class="{"hot" if n=="3" else ""}"><b>{n}</b><span>{nm}</span><i>{tg}</i></div>' for n,nm,tg in CAMADAS)}
  </div>
  <p class="dek" style="margin-top:10mm;font-size:9.5pt">A camada 3 é o endereço da toxina. Dose define intensidade; plano define quem recebe.</p>
</div>

<section>
  <h2>Os cinco princípios</h2>
  <p class="sub">Não são fatos para decorar. São regras de raciocínio: quem domina as cinco chega sozinha num músculo que nunca estudou.</p>
</section>
{"".join(princ_html)}

<div class="quebra"></div>
<section>
  <h2>Mapa muscular e pontos de punção</h2>
  <p class="sub">Vista anterior esquemática. Os números correspondem às fichas das páginas seguintes.</p>
  <div class="aviso"><b>Todas as doses estão em unidades de onabotulinumtoxinA.</b> Unidades não são intercambiáveis entre produtos — ver tabela de conversão ao final. Os valores são faixas de referência da literatura: a bula do produto e o julgamento clínico de quem aplica prevalecem sobre qualquer número deste material.</div>
  <div class="mapa">
    <img src="{MAPA}" alt="Mapa esquemático da musculatura mímica facial com pontos de aplicação numerados">
    <p>Diagrama esquemático, com proporções simplificadas para ensino de posição relativa e vizinhança de risco. Não substitui atlas anatômico nem dissecção.</p>
  </div>
</section>

<div class="quebra"></div>
<section>
  <h2>Fichas por músculo</h2>
  <p class="sub">Dose, plano de punção, referência de marcação e o erro que cada região castiga.</p>
</section>
{"".join(fichas)}

<div class="quebra"></div>
<section>
  <h2>Conversão entre produtos</h2>
  <p class="sub">Unidade mede potência biológica, não volume. Trocar de marca mantendo o número da dose é o erro mais caro da especialização.</p>
  <table>
    <thead><tr><th>Produto</th><th>Princípio ativo</th><th>Relação com ona</th><th>Observação</th></tr></thead>
    <tbody>
    {"".join(f'<tr class="{"alerta" if p=="Dysport" else ""}"><td><b>{p}</b></td><td>{a}</td><td class="n">{r}</td><td>{o}</td></tr>' for p,a,r,o in CONV)}
    </tbody>
  </table>
</section>

<section style="margin-top:9mm">
  <h2>Regras que evitam a maior parte das complicações</h2>
  <p class="sub">Quase todo evento adverso estético é difusão para um músculo vizinho.</p>
  <div class="grid2">
    {"".join(f'<div class="chk {"a" if t=="Sinais de alerta" else ""}"><h4>{t}</h4><ul>{"".join(f"<li>{e(i)}</li>" for i in its)}</ul></div>' for t,its in CHECK)}
  </div>
</section>

<footer>
  <b>Material de apoio didático.</b> Diagramas esquemáticos, com proporções simplificadas para ensino de posição relativa e vizinhança de risco — não substituem atlas anatômico, dissecção nem a bula do produto utilizado.
  Doses expressas como faixas de referência da literatura, em unidades de onabotulinumtoxinA.
  A indicação, a dose e a técnica são responsabilidade do profissional habilitado que aplica.
</footer>
</body></html>"""

open("apostila.html", "w", encoding="utf-8").write(doc)
print("apostila.html", len(doc), "chars")
