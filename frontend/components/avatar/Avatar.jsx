// TASK-01: Давхаргатай (layered) SVG дүр — энгийн, тод геометр хэлбэр (flat style).
// avatarConfig-ийн утга бүр нэг давхаргыг тодорхойлно; зураг файл ашиглахгүй, бүгдийг кодоор зурна.
// Давхаргын дараалал (доороос дээш):
//   1. хойд үс → 2. хөл, гутал → 3. их бие + хувцас → 4. гар → 5. хүзүү, толгой
//   → 6. нүүр → 7. урд үс → 8. нэмэлт (шил, чихэвч, малгай)
import { normalizeAvatar } from "./avatarCatalog";
import "./Avatar.css";

const CX = 60; // дүрийн голын x (viewBox 0 0 120 240)
const INK = "#2b2238";
const SHOE = "#2d2640";
const DENIM = "#3f4a7a";
const GOLD = "#f2c14e";
const BOOT = "#7a4a2a";

// Өнгийг хар руу (amount > 0) эсвэл цагаан руу (amount < 0) холино.
function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const target = amount > 0 ? 0 : 255;
  const a = Math.abs(amount);
  const mix = (c) => Math.round(c + (target - c) * a);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const MIRROR = `translate(${CX * 2} 0) scale(-1 1)`;

// Зүүн талын хэсгийг зураад баруун талд толин тусгалаар давтана.
function Pair({ children }) {
  return (
    <>
      <g>{children}</g>
      <g transform={MIRROR}>{children}</g>
    </>
  );
}

// sh: мөрний хагас өргөн, hh: ташааны хагас өргөн, leg: хөлний голоос зай
const BODY = {
  female: { sh: 17, hh: 19, leg: 7.5 },
  male: { sh: 21, hh: 19, leg: 8.5 },
};

// Бөөрөнхий төгсгөлтэй зузаан зураас — гар, хөлийг цэвэрхэн зурна
const Limb = ({ d, color, width = 10 }) => (
  <path d={d} stroke={color} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none" />
);

/* ---------- 1. Хойд үс ---------- */
function HairBack({ style, color }) {
  const fill = shade(color, 0.15);
  switch (style) {
    case "long":
      return <path d="M30 50 Q30 14 60 14 Q90 14 90 50 L92 112 Q60 122 28 112 Z" fill={fill} />;
    case "bun":
      return <circle cx="60" cy="12" r="13" fill={fill} />;
    case "ponytail":
      return <path d="M76 26 Q104 30 98 72 Q96 94 84 108 Q88 80 84 60 Q81 44 72 36 Z" fill={fill} />;
    case "curly":
      return (
        <g fill={fill}>
          {[[34, 40, 14], [46, 22, 15], [60, 16, 16], [74, 22, 15], [86, 40, 14], [32, 60, 10], [88, 60, 10]].map(
            ([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />,
          )}
        </g>
      );
    default:
      return null;
  }
}

/* ---------- 2. Хөл, гутал ---------- */
function Legs({ outfit, leg, skin }) {
  const x = CX - leg;
  if (outfit === "deel") {
    // Монгол гутал: дээлний доороос харагдана
    return (
      <Pair>
        <Limb d={`M${x} 196 L${x} 216`} color={BOOT} width={13} />
        <path d={`M${x - 10} 226 Q${x - 12} 216 ${x - 4} 216 L${x + 6} 216 L${x + 6} 226 Z`} fill={BOOT} />
      </Pair>
    );
  }
  const legColor = outfit === "dress" ? skin : DENIM;
  return (
    <Pair>
      <Limb d={`M${x} 148 L${x} 216`} color={legColor} width={12} />
      <ellipse cx={x - 2} cy="222" rx="9" ry="5.5" fill={SHOE} />
    </Pair>
  );
}

/* ---------- 3. Их бие + хувцас ---------- */
function torsoPath({ sh, hh }, bottom = 150, flare = 0) {
  return [
    `M${CX - sh} 100`,
    `Q${CX - sh} 84 ${CX - sh + 12} 84`,
    `L${CX + sh - 12} 84`,
    `Q${CX + sh} 84 ${CX + sh} 100`,
    `L${CX + hh + flare} ${bottom - 6}`,
    `Q${CX + hh + flare} ${bottom} ${CX + hh + flare - 6} ${bottom}`,
    `L${CX - hh - flare + 6} ${bottom}`,
    `Q${CX - hh - flare} ${bottom} ${CX - hh - flare} ${bottom - 6}`,
    "Z",
  ].join(" ");
}

function Outfit({ outfit, color, dims }) {
  const dark = shade(color, 0.22);

  if (outfit === "deel") {
    return (
      <g>
        <path d={torsoPath(dims, 200, 6)} fill={color} />
        {/* энгэр: хүзүүнээс суга руу ташуу зах */}
        <path d={`M54 86 Q57 104 ${CX + dims.sh - 3} 114`} stroke={GOLD} strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* бүс */}
        <rect x={CX - dims.hh - 1} y="120" width={dims.hh * 2 + 2} height="9" rx="3" fill={GOLD} />
      </g>
    );
  }

  if (outfit === "dress") {
    return (
      <g>
        <path d={torsoPath(dims, 180, 8)} fill={color} />
        <rect x={CX - dims.hh + 1} y="120" width={dims.hh * 2 - 2} height="5" rx="2.5" fill={dark} />
      </g>
    );
  }

  if (outfit === "tshirt") {
    return (
      <g>
        <path d={torsoPath(dims)} fill={color} />
        <path d="M51 84 Q60 94 69 84 Z" fill={dark} />
      </g>
    );
  }

  // hoodie: малгайн хүрээ мөрөн дээр
  return (
    <g>
      <path d={torsoPath(dims)} fill={color} />
      <path d="M44 86 Q60 100 76 86 Q76 80 60 80 Q44 80 44 86 Z" fill={dark} />
    </g>
  );
}

/* ---------- 4. Гар ---------- */
function Arms({ outfit, color, skin, sh }) {
  const longSleeve = outfit === "hoodie" || outfit === "deel";
  const top = `M${CX - sh + 3} 94`;
  return (
    <Pair>
      <Limb d={`${top} L${CX - sh - 5} 132`} color={longSleeve ? color : skin} width={11} />
      {!longSleeve && <Limb d={`${top} L${CX - sh - 1.6} 108`} color={color} width={12} />}
      {outfit === "deel" && <Limb d={`M${CX - sh - 4.2} 128 L${CX - sh - 4.8} 131`} color={GOLD} width={12} />}
      <circle cx={CX - sh - 5.5} cy="137" r="6" fill={skin} />
    </Pair>
  );
}

/* ---------- 5. Хүзүү, толгой ---------- */
function Head({ skin, hairStyle }) {
  // Урт үс чихийг далдална
  const earsVisible = hairStyle !== "long";
  return (
    <g>
      <rect x="53" y="68" width="14" height="20" rx="6" fill={shade(skin, 0.12)} />
      {earsVisible && (
        <Pair>
          <circle cx="33" cy="54" r="6" fill={skin} />
        </Pair>
      )}
      <ellipse cx="60" cy="48" rx="27" ry="28" fill={skin} />
    </g>
  );
}

/* ---------- 6. Нүүр ---------- */
function Face() {
  return (
    <g>
      <Pair>
        <g className="avatar-eye">
          <ellipse cx="50" cy="52" rx="3.6" ry="4.8" fill={INK} />
          <circle cx="51.3" cy="50.2" r="1.3" fill="#ffffff" />
        </g>
        <ellipse cx="42" cy="61" rx="5" ry="3" fill="#ff8fa3" opacity="0.4" />
      </Pair>
      <path d="M54 64 Q60 70 66 64" stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />
    </g>
  );
}

/* ---------- 7. Урд үс ---------- */
function HairFront({ style, color }) {
  switch (style) {
    case "buzz":
      return <path d="M34 44 Q34 19 60 19 Q86 19 86 44 Q76 32 60 32 Q44 32 34 44 Z" fill={color} />;
    case "long":
      return <path d="M31 66 Q28 16 60 16 Q92 16 89 66 L87 80 Q86 46 72 36 Q58 46 40 40 Q34 52 34 80 Z" fill={color} />;
    case "bun":
    case "ponytail":
      return <path d="M33 52 Q31 18 60 18 Q89 18 87 52 Q80 32 60 30 Q40 32 33 52 Z" fill={color} />;
    case "curly":
      return (
        <g fill={color}>
          {[[40, 34, 10], [52, 27, 11], [65, 26, 11], [77, 32, 10], [85, 42, 8]].map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />
          ))}
        </g>
      );
    default: // short — тод, бөөрөнхий оройтой богино үс
      return <path d="M32 54 Q29 16 60 16 Q91 16 88 54 Q86 38 76 34 Q62 42 46 34 Q35 40 32 54 Z" fill={color} />;
  }
}

/* ---------- 8. Нэмэлт ---------- */
function Accessory({ type, outfitColor }) {
  if (type === "glasses") {
    return (
      <g stroke={INK} strokeWidth="2.6" fill="#ffffff" fillOpacity="0.2">
        <circle cx="49.5" cy="52" r="7.5" />
        <circle cx="70.5" cy="52" r="7.5" />
        <path d="M57 52 L63 52" fill="none" />
      </g>
    );
  }
  if (type === "headphones") {
    return (
      <g>
        <path d="M30 52 Q30 10 60 10 Q90 10 90 52" stroke={SHOE} strokeWidth="5" fill="none" />
        <Pair>
          <rect x="25" y="44" width="12" height="20" rx="6" fill={outfitColor} />
        </Pair>
      </g>
    );
  }
  if (type === "cap") {
    const capColor = shade(outfitColor, 0.15);
    return (
      <g>
        <path d="M32 40 Q32 12 60 12 Q88 12 88 40 Z" fill={capColor} />
        <path d="M32 38 L94 38 Q100 42 94 46 L32 43 Z" fill={shade(capColor, 0.22)} />
      </g>
    );
  }
  return null;
}

const VIEWBOX = {
  full: "0 0 120 240",
  head: "14 0 92 92",
};

export default function Avatar({ config, variant = "full", animated = false, className = "", title, ...rest }) {
  const c = normalizeAvatar(config);
  const dims = BODY[c.body];
  const classes = ["avatar-svg", `avatar-${variant}`, animated ? "avatar-animated" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      viewBox={VIEWBOX[variant] || VIEWBOX.full}
      className={classes}
      role="img"
      aria-label={title || "Хэрэглэгчийн дүр"}
      data-hair={c.hairStyle}
      data-outfit={c.outfit}
      data-accessory={c.accessory}
      {...rest}
    >
      {title && <title>{title}</title>}
      {variant === "full" && <ellipse cx="60" cy="228" rx="28" ry="5" fill="#000000" opacity="0.18" />}
      <g className="avatar-body">
        <HairBack style={c.hairStyle} color={c.hairColor} />
        <Legs outfit={c.outfit} leg={dims.leg} skin={c.skinTone} />
        <Outfit outfit={c.outfit} color={c.outfitColor} dims={dims} />
        <Arms outfit={c.outfit} color={c.outfitColor} skin={c.skinTone} sh={dims.sh} />
        <Head skin={c.skinTone} hairStyle={c.hairStyle} />
        <Face />
        <HairFront style={c.hairStyle} color={c.hairColor} />
        <Accessory type={c.accessory} outfitColor={c.outfitColor} />
      </g>
    </svg>
  );
}
