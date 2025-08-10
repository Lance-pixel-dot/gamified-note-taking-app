export function getColorPalette(className) {
  switch (className) {
    case "theme-dark":
      return ["#1a1a1a", "#ffffff", "#4f46e5", "#ffffff", "#2d2d3f", "#9ca3af"];
    case "theme-cyberpunk":
      return ["#0f0c29", "#ffffff", "#ff0080", "black", "#d64d92", "#ff99cc"];
    case "theme-terminal":
      return ["#676b6b", "#ffffff", "#000000", "#00ff00", "#4a4f4f", "#80ff80"];
    case "theme-forest":
      return ["#2e4600", "#ffffff", "#a2c523", "#000000", "#0eb321", "#d0ff8a"]; 
    case "theme-ocean":
      return ["#003366", "#ffffff", "#66ccff", "#000000", "#628df0", "#cceeff"]; 
    case "theme-sunset":
      return ["#ff7e5f", "#1a1a1a", "#ffae42", "#000000", "#ffd9b3", "#ffe4b8"];
    case "theme-arcade":
      return ["#2b2b2b", "#ffffff", "#00ffcc", "#000000", "#48d9c5", "#99fff2"]; 
    case "theme-retro-terminal":
      return ["#d1ffcc", "#1a1a1a", "#00aa00", "#ffffff", "#b0e6b0", "#008800"]; 
    case "theme-pastel":
      return ["#f8d7e0", "#1a1a1a", "#b3e5fc", "#000000", "#efd0d9", "#a4d4f0"]; 
    case "theme-metalgear":
      return ["#2d2d2d", "#ffffff", "#c9c9c9", "#000000", "#b8aeae", "#e0e0e0"]; 
    default:
      return ["#1800ad", "#ffffff", "#ffffff", "#000000", "#d1d5db", "#6b7280"]; // fallback
  }
}