import katex from "katex";

/**
 * KaTeX renders to HTML strings on the server. Robotics is maths-heavy enough
 * that shipping a client-side renderer would delay every lesson's first paint,
 * and none of these expressions change after render.
 */
export function renderMath(latex: string, displayMode = true): string {
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      // Shows the offending source in red rather than blanking the block, so a
      // typo in one formula is visible and fixable instead of silently absent.
      errorColor: "#c0334c",
      strict: false,
      trust: false,
      macros: {
        "\\R": "\\mathbb{R}",
        "\\T": "^{\\mathsf{T}}",
      },
    });
  } catch {
    return `<code>${latex.replace(/</g, "&lt;")}</code>`;
  }
}
