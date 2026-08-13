import { ImageResponse } from "next/og";

/**
 * The social preview card — what LinkedIn, X, WhatsApp and Slack render when
 * someone shares a link to the site.
 *
 * Generated rather than hand-designed so it can never drift out of sync with
 * the site, and so there is no binary asset to maintain. 1200×630 is the size
 * every platform crops from; anything else gets letterboxed or cropped badly.
 *
 * ImageResponse supports only a subset of CSS — flexbox but no grid, and any
 * element with more than one child needs an explicit `display: flex`.
 */

export const alt = "Robotics Academy — learn robotics from zero to advanced by building real projects";

/**
 * Rendered at 2× the 1200×630 standard.
 *
 * Social platforms re-encode whatever you give them, and a dark background
 * behind thin light text is the worst case for that — compression rings around
 * every high-contrast edge and the result looks soft. Supplying twice the
 * pixels means their downscale resolves sharp instead of their upscale
 * resolving blurry. The aspect ratio is unchanged at 1.91:1, which is the part
 * that actually has to match.
 */
const SCALE = 2;
export const size = { width: 1200 * SCALE, height: 630 * SCALE };
export const contentType = "image/png";

/** Scales a design value from the 1200×630 layout to the rendered size. */
const s = (value: number) => value * SCALE;

const SIGNAL = "#35d6e8";
const SURFACE = "#080b10";
const TEXT = "#e8edf5";
const MUTED = "#9aa8bd";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: SURFACE,
          // Blueprint grid, echoing the site's hero. Repeating gradients are
          // the only way to draw a pattern here without an image asset.
          backgroundImage:
            "linear-gradient(rgba(148,178,210,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(148,178,210,0.07) 1px, transparent 1px)",
          backgroundSize: `${s(48)}px ${s(48)}px`,
          padding: `${s(64)}px ${s(72)}px`,
        }}
      >
        {/* Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: s(18) }}>
          <svg width={s(52)} height={s(52)} viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7.5" fill={SIGNAL} />
            <path
              d="M10.5 23.5 L13.2 14.2 L23 10.4"
              stroke="#07141b"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="23" cy="10.4" r="3.1" fill="#07141b" />
            <rect x="5.6" y="23.6" width="10.4" height="3.4" rx="1.7" fill="#07141b" />
          </svg>
          <div style={{ display: "flex", fontSize: s(30), fontWeight: 700, color: TEXT }}>
            Robotics
            <span style={{ color: SIGNAL }}>Academy</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", maxWidth: s(940) }}>
          <div
            style={{
              fontSize: s(68),
              fontWeight: 700,
              color: TEXT,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            Learn robotics from zero to advanced
          </div>
          <div
            style={{
              fontSize: s(68),
              fontWeight: 700,
              color: SIGNAL,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginTop: s(6),
              display: "flex",
            }}
          >
            by building real projects.
          </div>
        </div>

        {/* Substance, not slogans: the actual scale of the thing. */}
        <div style={{ display: "flex", alignItems: "center", gap: s(40) }}>
          {[
            ["16", "levels"],
            ["28", "lessons"],
            ["10", "simulators"],
            ["74", "glossary terms"],
          ].map(([value, label]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontSize: s(42), fontWeight: 700, color: TEXT }}>{value}</div>
              <div style={{ fontSize: s(20), color: MUTED, marginTop: s(2) }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
