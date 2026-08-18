export const TEXT_SIZES = ["compact", "normal", "large", "xlarge"] as const;
export type TextSize = (typeof TEXT_SIZES)[number];

export const TEXT_SIZE_LABELS: Record<TextSize, string> = {
  compact: "Compact",
  normal: "Normal",
  large: "Large",
  xlarge: "Largest",
};

/**
 * "compact" is the shipped default and is represented by the absence of the
 * attribute, so the common case costs nothing. Everything else is an override.
 */
export const DEFAULT_TEXT_SIZE: TextSize = "compact";
const OVERRIDES: TextSize[] = ["normal", "large", "xlarge"];

export const STORAGE_KEYS = {
  textSize: "cp.textSize",
  contrast: "cp.highContrast",
} as const;

/**
 * Runs before first paint so a reader's saved preferences are already applied
 * when the page appears — no flash of default-size text. An unrecognised stored
 * value (say, one written by an older build) simply falls through to the
 * default rather than being applied blindly.
 */
export const a11yInitScript = `(function(){
/* Marks that scripting is alive. Scroll reveals hide their content with
   opacity, so they must only ever do so when there is JavaScript around to
   reveal it again — otherwise a failed or blocked bundle silently hides real
   content. This class is what gates the hiding, and it is set before paint. */
document.documentElement.classList.add("js");
try{
var allowed=${JSON.stringify(OVERRIDES)};
var t=localStorage.getItem("${STORAGE_KEYS.textSize}");
if(allowed.indexOf(t)>-1)document.documentElement.setAttribute("data-text-size",t);
if(localStorage.getItem("${STORAGE_KEYS.contrast}")==="true")document.documentElement.classList.add("hc");
}catch(e){}})();`;
