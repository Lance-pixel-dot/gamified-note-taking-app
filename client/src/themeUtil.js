export function getColorPalette(className) {
  switch (className) {
    case "theme-dark":
      return ["#1a1a1a", "#fefefe", "#4f46e5"]; // bg, text, accent
    case "theme-light":
      return ["#ffffff", "#000000", "#4f46e5"];
    case "theme-forest":
      return ["#1b2b2b", "#d6ffd6", "#16a34a"];
    // add more themes here
    default:
      return ["#1800ad", "black", "white"]; // fallback
  }
}