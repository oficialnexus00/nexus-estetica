import { CORES, FONTE } from "../lib/tema";

/** Assinatura discreta no topo. Nao rouba atencao do gancho. */
export const Marca: React.FC = () => (
  <div
    style={{
      position: "absolute",
      top: 96,
      left: 0,
      right: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      fontFamily: FONTE,
    }}
  >
    <div
      style={{
        width: 14,
        height: 14,
        borderRadius: 4,
        backgroundColor: CORES.teal,
      }}
    />
    <span
      style={{
        color: CORES.textoSuave,
        fontSize: 30,
        fontWeight: 600,
        letterSpacing: 6,
      }}
    >
      NEXUS
    </span>
  </div>
);
