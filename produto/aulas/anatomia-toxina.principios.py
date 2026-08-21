# Diagramas dos 5 princípios — SVG -> PNG, na paleta do deck.
import cairosvg

INK   = "#10131A"
INK2  = "#1B212A"
INK3  = "#252D38"
EDGE  = "#3A434F"
BONE  = "#E8E6E1"
MUTE  = "#9AA3AF"
MUSC  = "#C9524C"
MUSC2 = "#E0817A"
TEAL  = "#00BFA5"
AMBER = "#E0A33F"
OSSO  = "#4A5361"

W, H = 700, 500
FT = "DejaVu Sans, sans-serif"

def head(): return [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">',
                    f'<rect width="{W}" height="{H}" fill="{INK}"/>']

def txt(x, y, s, size=15, fill=MUTE, anchor="middle", weight="400"):
    return (f'<text x="{x}" y="{y}" font-family="{FT}" font-size="{size}" fill="{fill}" '
            f'text-anchor="{anchor}" font-weight="{weight}">{s}</text>')

def arrow(x1, y1, x2, y2, color, w=3, mid=""):
    return (f'<defs><marker id="a{mid}" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">'
            f'<path d="M0 0 L9 4.5 L0 9 Z" fill="{color}"/></marker></defs>'
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{w}" '
            f'marker-end="url(#a{mid})"/>')

# ---------------------------------------------------------------- P1
def p1():
    o = head()
    o.append(f'<rect x="70" y="86" width="560" height="7" rx="3" fill="{EDGE}"/>')
    o.append(txt(70, 74, "PELE — inserção móvel", 14, MUTE, "start", "600"))
    o.append(f'<rect x="70" y="392" width="560" height="34" rx="5" fill="{OSSO}"/>')
    o.append(txt(70, 452, "OSSO — origem fixa", 14, MUTE, "start", "600"))
    # músculo
    o.append(f'<path d="M250 95 L300 95 L330 392 L270 392 Z" fill="{MUSC}" opacity=".85"/>')
    for i in range(4):
        x1 = 258 + i*12; x2 = 279 + i*13
        o.append(f'<line x1="{x1}" y1="98" x2="{x2}" y2="389" stroke="{MUSC2}" stroke-width="1.2" opacity=".55"/>')
    o.append(txt(290, 250, "músculo", 14, BONE, "middle", "600"))
    # vetor de tração
    o.append(arrow(430, 120, 430, 370, TEAL, 4, "1"))
    o.append(txt(452, 240, "a pele vem", 15, TEAL, "start", "700"))
    o.append(txt(452, 262, "até o osso", 15, TEAL, "start", "700"))
    o.append(f'<circle cx="285" cy="95" r="7" fill="{TEAL}"/>')
    o.append(f'<rect x="292" y="384" width="14" height="14" fill="{TEAL}"/>')
    o.append("</svg>")
    return "".join(o)

# ---------------------------------------------------------------- P2
def p2():
    o = head()
    cells = [
        ("Frontal", "fibra vertical", "ruga horizontal", "v"),
        ("Corrugador", "fibra horizontal", "ruga vertical", "h"),
        ("Orbicular", "fibra circular", "ruga radiada", "c"),
    ]
    cw, gap = 190, 22
    x0 = (W - (cw*3 + gap*2)) / 2
    for i, (nome, f, r, tipo) in enumerate(cells):
        x = x0 + i*(cw+gap); y = 108; s = 158
        o.append(f'<rect x="{x}" y="{y}" width="{cw}" height="{s}" rx="7" fill="{INK2}" stroke="{EDGE}"/>')
        cx, cy = x + cw/2, y + s/2
        if tipo == "v":
            for k in range(-3, 4):
                o.append(f'<line x1="{cx+k*20}" y1="{y+16}" x2="{cx+k*20}" y2="{y+s-16}" stroke="{MUSC}" stroke-width="3"/>')
            for k in range(-1, 2):
                o.append(f'<line x1="{x+18}" y1="{cy+k*34}" x2="{x+cw-18}" y2="{cy+k*34}" stroke="{TEAL}" stroke-width="3.5"/>')
        elif tipo == "h":
            for k in range(-3, 4):
                o.append(f'<line x1="{x+18}" y1="{cy+k*20}" x2="{x+cw-18}" y2="{cy+k*20}" stroke="{MUSC}" stroke-width="3"/>')
            for k in range(-1, 2):
                o.append(f'<line x1="{cx+k*34}" y1="{y+16}" x2="{cx+k*34}" y2="{y+s-16}" stroke="{TEAL}" stroke-width="3.5"/>')
        else:
            for rr in (30, 46, 62):
                o.append(f'<circle cx="{cx}" cy="{cy}" r="{rr}" fill="none" stroke="{MUSC}" stroke-width="3"/>')
            import math
            for k in range(8):
                a = k * math.pi / 4
                o.append(f'<line x1="{cx+math.cos(a)*66:.1f}" y1="{cy+math.sin(a)*66:.1f}" '
                         f'x2="{cx+math.cos(a)*84:.1f}" y2="{cy+math.sin(a)*84:.1f}" stroke="{TEAL}" stroke-width="3.5"/>')
        o.append(txt(cx, y+s+30, nome, 16, BONE, "middle", "700"))
        o.append(txt(cx, y+s+52, f, 13, MUSC2))
        o.append(txt(cx, y+s+72, r, 13, TEAL))
    o.append(f'<rect x="{W/2-165}" y="378" width="330" height="42" rx="6" fill="{INK3}" stroke="{TEAL}"/>')
    o.append(txt(W/2, 405, "a ruga é sempre 90° da fibra", 17, TEAL, "middle", "700"))
    o.append(f'<rect x="60" y="52" width="12" height="12" fill="{MUSC}"/>')
    o.append(txt(80, 63, "fibra do músculo", 13, MUTE, "start"))
    o.append(f'<rect x="230" y="52" width="12" height="12" fill="{TEAL}"/>')
    o.append(txt(250, 63, "ruga que aparece", 13, MUTE, "start"))
    o.append("</svg>")
    return "".join(o)

# ---------------------------------------------------------------- P3
def p3():
    o = head()
    def gangorra(cy, tilt, elev_op, rotulo, cor_rotulo):
        import math
        dx, dy = 190, tilt
        o.append(f'<path d="M{W/2-22} {cy+30} L{W/2+22} {cy+30} L{W/2} {cy-2} Z" fill="{EDGE}"/>')
        o.append(f'<line x1="{W/2-dx}" y1="{cy-dy}" x2="{W/2+dx}" y2="{cy+dy}" '
                 f'stroke="{BONE}" stroke-width="5" stroke-linecap="round"/>')
        o.append(f'<circle cx="{W/2-dx}" cy="{cy-dy}" r="26" fill="{TEAL}" opacity="{elev_op}"/>')
        o.append(f'<path d="M{W/2-dx} {cy-dy-11} l9 12 h-18 Z" fill="#06231E" opacity="{elev_op}"/>')
        o.append(f'<circle cx="{W/2+dx}" cy="{cy+dy}" r="26" fill="{MUSC}"/>')
        o.append(f'<path d="M{W/2+dx} {cy+dy+11} l9 -12 h-18 Z" fill="#FFF"/>')
        o.append(txt(W/2-dx, cy-dy+50, "elevador", 13, TEAL, "middle", "600"))
        o.append(txt(W/2+dx, cy+dy+50, "depressor", 13, MUSC2, "middle", "600"))
        o.append(txt(W/2, cy+78, rotulo, 15, cor_rotulo, "middle", "700"))
    gangorra(120, 0, "1", "equilíbrio: a sobrancelha fica onde está", MUTE)
    o.append(f'<line x1="90" y1="238" x2="{W-90}" y2="238" stroke="{EDGE}" stroke-width="1"/>')
    gangorra(330, 46, "0.32", "frontal enfraquecido: o depressor vence", AMBER)
    o.append("</svg>")
    return "".join(o)

# ---------------------------------------------------------------- P4
def p4():
    CAM = ["Pele", "Subcutâneo", "Músculo / SMAS", "Areolar", "Periósteo"]
    o = head()
    def pilha(x, hi, titulo, sub, cor=BONE):
        bw, bh, y0 = 230, 52, 128
        o.append(txt(x+bw/2, 96, titulo, 16, cor, "middle", "700"))
        for i, c in enumerate(CAM):
            on = (i == hi)
            yy = y0 + i*(bh+5)
            fill = MUSC if on else INK3
            o.append(f'<rect x="{x}" y="{yy}" width="{bw}" height="{bh}" rx="4" fill="{fill}" '
                     f'stroke="{MUSC2 if on else EDGE}" stroke-width="{1.6 if on else 1}"/>')
            o.append(txt(x+14, yy+bh/2+5, str(i+1), 13, "#FFF" if on else MUTE, "start", "700"))
            o.append(txt(x+34, yy+bh/2+5, c, 13.5, "#FFF" if on else BONE, "start", "600" if on else "400"))
        # agulha
        ny = y0 + hi*(bh+5) + bh/2
        o.append(f'<line x1="{x+bw+52}" y1="{y0-16}" x2="{x+bw+8}" y2="{ny}" stroke="{TEAL}" stroke-width="3.5"/>')
        o.append(f'<circle cx="{x+bw+8}" cy="{ny}" r="8" fill="{TEAL}"/>')
        o.append(txt(x+bw/2, y0+5*(bh+5)+30, sub, 13.5, MUTE))
    pilha(58, 1, "músculo fino", "frontal, orbicular do olho — superficial")
    pilha(412, 4, "músculo espesso", "mentual, masseter — profundo")
    o.append("</svg>")
    return "".join(o)

def p4fix():  # wrapper: cor do título
    return p4().replace('fill="None"', f'fill="{BONE}"')

# ---------------------------------------------------------------- P5
def p5():
    o = head()
    cx, cy = 250, 250
    for r, op in ((132, ".08"), (104, ".13"), (76, ".22"), (48, ".38")):
        o.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{TEAL}" opacity="{op}"/>')
    o.append(f'<rect x="{cx-46}" y="{cy-92}" width="92" height="184" rx="10" fill="{MUSC}" opacity=".75"/>')
    o.append(txt(cx, cy-104, "músculo-alvo", 14, MUSC2, "middle", "600"))
    o.append(f'<circle cx="{cx}" cy="{cy}" r="9" fill="{TEAL}"/>')
    o.append(f'<line x1="{cx+40}" y1="{cy-84}" x2="{cx+6}" y2="{cy-8}" stroke="{TEAL}" stroke-width="3"/>')
    # vizinho
    vx = 470
    o.append(f'<rect x="{vx}" y="{cy-92}" width="86" height="184" rx="10" fill="none" '
             f'stroke="{AMBER}" stroke-width="2.5" stroke-dasharray="7 5"/>')
    o.append(txt(vx+43, cy-104, "vizinho", 14, AMBER, "middle", "600"))
    o.append(txt(vx+43, cy+2, "que você", 12.5, AMBER))
    o.append(txt(vx+43, cy+20, "não quer", 12.5, AMBER))
    o.append(txt(vx+43, cy+38, "atingir", 12.5, AMBER))
    # distancia
    o.append(f'<line x1="{cx+132}" y1="{cy+128}" x2="{vx}" y2="{cy+128}" stroke="{BONE}" stroke-width="1.6"/>')
    for xx in (cx+132, vx):
        o.append(f'<line x1="{xx}" y1="{cy+120}" x2="{xx}" y2="{cy+136}" stroke="{BONE}" stroke-width="1.6"/>')
    o.append(txt((cx+132+vx)/2, cy+152, "distância", 14, BONE, "middle", "700"))
    o.append(txt(W/2, 62, "a nuvem não sabe onde o músculo acaba", 17, TEAL, "middle", "700"))
    o.append(txt(W/2, 452, "distância  ·  volume por ponto  ·  plano correto", 15, MUTE, "middle", "600"))
    o.append("</svg>")
    return "".join(o)

if __name__ == "__main__":
    for n, fn in (("p1", p1), ("p2", p2), ("p3", p3), ("p4", p4), ("p5", p5)):
        cairosvg.svg2png(bytestring=fn().encode(), write_to=f"princ-{n}.png",
                         output_width=1400, output_height=1000)
    print("5 diagramas gerados")
