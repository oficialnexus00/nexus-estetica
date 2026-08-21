# Mapa muscular facial — vista anterior esquemática.
# Cada músculo é desenhado só do lado esquerdo; o lado direito é espelhado
# por transform, o que garante simetria perfeita.
import cairosvg

INK  = "#10131A"
BONE = "#262C35"
EDGE = "#3D4653"
MUSC = "#8E3B37"
HOT  = "#D9736B"
HOTL = "#FFA79F"
TEAL = "#00BFA5"
REF  = "#8B939E"

FACE = ("M230 64 C302 64 350 112 354 192 C358 244 352 292 342 326 "
        "C331 378 318 416 298 446 C278 474 254 492 230 492 "
        "C206 492 182 474 162 446 C142 416 129 378 118 326 "
        "C108 292 102 244 106 192 C110 112 158 64 230 64 Z")

# nome, tipo, dados, pontos do lado esquerdo, ponto(s) na linha média
MUS = {
 1: dict(nome="Frontal", paths=[
        "M150 100 C176 92 204 92 218 100 L222 202 C202 210 172 210 152 202 Z"],
        fibras=[(166,104,170,202),(184,100,186,204),(202,100,204,204)],
        pts=[(184,132)], mid=[(230,112)]),
 2: dict(nome="Prócero", paths=[
        "M218 192 C224 188 236 188 242 192 L244 254 C238 260 222 260 216 254 Z"],
        fibras=[(226,196,225,252),(236,196,236,252)], pts=[], mid=[(230,220)], nomirror=True),
 3: dict(nome="Corrugador do supercílio", paths=[
        "M212 216 C194 202 166 192 144 194 C138 200 136 212 139 220 "
        "C163 218 192 224 210 234 Z"],
        fibras=[], pts=[(178,210)], mid=[]),
 4: dict(nome="Orbicular do olho", ring=(170,250,54,38,19), paths=[],
        fibras=[], pts=[(126,226),(121,252),(126,278)], mid=[]),
 5: dict(nome="Nasal", paths=[
        "M214 284 C204 300 199 320 201 338 L226 338 L226 284 Z"],
        fibras=[(210,292,206,334),(219,288,216,336)], pts=[(206,300)], mid=[]),
 6: dict(nome="Zigomáticos", paths=[
        "M138 286 C146 277 160 277 167 286 L214 372 C209 384 196 389 187 382 Z"],
        fibras=[], pts=[], mid=[]),
 7: dict(nome="Orbicular da boca", ring=(230,398,48,26,16), paths=[],
        fibras=[], pts=[(212,376)], mid=[], nomirror_ring=True),
 8: dict(nome="Depressor do ângulo da boca", paths=[
        "M184 406 C180 430 174 454 168 472 C177 477 188 477 196 472 "
        "C198 450 200 426 202 408 Z"],
        fibras=[], pts=[(189,456)], mid=[]),
 9: dict(nome="Mentual", paths=[
        "M210 438 C205 454 205 470 210 480 C216 484 223 482 226 477 L226 438 Z"],
        fibras=[], pts=[(217,464)], mid=[]),
 10: dict(nome="Masseter", paths=[
        "M120 302 C142 292 162 296 168 306 L172 388 C166 404 140 408 128 396 "
        "C118 368 114 330 120 302 Z"],
        fibras=[(134,306,140,398),(150,302,155,394)], pts=[(141,334),(147,370)], mid=[]),
 11: dict(nome="Platisma", paths=[
        "M174 490 C170 518 160 542 143 560 L180 560 C190 532 193 508 192 492 Z"],
        fibras=[], pts=[(174,526)], mid=[], fora=True),
}

def _mirror(g):  # espelha um bloco de svg em torno de x=230
    return '<g transform="translate(460,0) scale(-1,1)">%s</g>' % g

def svg(destaque=None, numeros=True):
    o = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 600" width="460" height="600">',
         '<rect width="460" height="600" fill="%s"/>' % INK,
         '<defs><clipPath id="c"><path d="%s"/></clipPath></defs>' % FACE,
         # pescoço
         '<path d="M188 448h84v44c0 30 34 42 62 54H114c28-12 62-24 62-54Z" fill="%s" opacity=".6"/>' % BONE,
         '<path d="%s" fill="%s" stroke="%s" stroke-width="1.6"/>' % (FACE, BONE, EDGE)]

    dentro, fora = [], []
    for i, m in MUS.items():
        on = (destaque == i)
        fill = HOT if on else MUSC
        op = "1" if on else (".34" if destaque else ".82")
        st = ' stroke="%s" stroke-width="1.8"' % HOTL if on else ''
        blk = []
        for d in m["paths"]:
            blk.append('<path d="%s" fill="%s" opacity="%s"%s/>' % (d, fill, op, st))
        for (x1,y1,x2,y2) in m.get("fibras", []):
            blk.append('<line x1="%s" y1="%s" x2="%s" y2="%s" stroke="%s" stroke-width="1" opacity="%s"/>'
                       % (x1,y1,x2,y2, HOTL if on else "#C05B55", "0.75" if on else "0.35"))
        s = "".join(blk)
        piece = s if m.get("nomirror") else s + _mirror(s)
        if m.get("ring"):
            cx,cy,rx,ry,sw = m["ring"]
            r = ('<ellipse cx="%s" cy="%s" rx="%s" ry="%s" fill="none" stroke="%s" '
                 'stroke-width="%s" opacity="%s"/>' % (cx,cy,rx,ry,fill,sw,op))
            piece = r if m.get("nomirror_ring") else r + _mirror(r)
        (fora if m.get("fora") else dentro).append(piece)

    o.append('<g clip-path="url(#c)">%s</g>' % "".join(dentro))
    o.extend(fora)

    # referências: olhos, nariz, boca
    ref = ('<g fill="none" stroke="%s" stroke-width="1.7" opacity=".65">'
           '<path d="M146 250c12-12 36-12 48 0-12 12-36 12-48 0Z"/>'
           '<path d="M266 250c12-12 36-12 48 0-12 12-36 12-48 0Z"/>'
           '<path d="M230 262v56c0 9-9 14-18 14"/>'
           '<path d="M188 398c13-9 28-13 42-13s29 4 42 13c-13 10-28 15-42 15s-29-5-42-15Z"/>'
           '<path d="M212 344c11-5 25-5 36 0"/>'
           '</g>') % REF
    o.append(ref)

    # pontos de aplicação
    for i, m in MUS.items():
        if destaque and i != destaque:
            continue
        r = 12 if destaque else 10
        fs = 13 if destaque else 11
        todos = [(x, y) for (x, y) in m["pts"]] + \
                [(460 - x, y) for (x, y) in m["pts"]] + list(m["mid"])
        for (x, y) in todos:
            o.append('<circle cx="%s" cy="%s" r="%s" fill="%s"/>' % (x, y, r, TEAL))
            if numeros:
                o.append('<text x="%s" y="%s" font-family="DejaVu Sans, sans-serif" '
                         'font-size="%s" font-weight="700" text-anchor="middle" '
                         'fill="#06231E">%s</text>' % (x, y + fs*0.35, fs, i))
    o.append("</svg>")
    return "".join(o)

if __name__ == "__main__":
    cairosvg.svg2png(bytestring=svg(None, True).encode(),
                     write_to="mapa-full.png", output_width=1000, output_height=1305)
    for i in MUS:
        cairosvg.svg2png(bytestring=svg(i, False).encode(),
                         write_to="mapa-%d.png" % i, output_width=600, output_height=783)
    print("mapa-full.png + %d miniaturas" % len(MUS))
