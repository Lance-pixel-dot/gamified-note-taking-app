export function getColorPalette(className) {
  switch (className) {
    case "theme-dark":
      return [
        "#1a1a1a", "#ffffff", "#4f46e5", "#ffffff", "#2d2d3f", "#9ca3af", "#4f46e5", "#ffffff", "#dc2626", "#f59e0b",
        "#fde047", "#60a5fa", "#ef4444", "#fbbf24", "orange", "#10b981"
      ];
    case "theme-cyberpunk":
      return [
        "#0f0c29", "#ffffff", "#ff0080", "black", "#d64d92", "#ff99cc", "#ff0080", "#ffffff", "#ff0033", "#ffcc00",
        "#ffff66", "#ff33ff", "#ff3366", "black", "#33ff99", "#33ff99"
      ];
    case "theme-forest":
      return [
        "#2e4600", "#ffffff", "#a2c523", "#000000", "#0eb321", "#d0ff8a", "#a2c523", "#000000", "#e53e3e", "#dd6b20",
        "#ffee99", "#4ade80", "#dc2626", "#facc15", "#f97316", "#16a34a"
      ];
    case "theme-ocean":
      return [
        "#003366", "#ffffff", "#66ccff", "#000000", "#628df0", "#cceeff", "#66ccff", "#000000", "#e53e3e", "#f6ad55",
        "#fef9c3", "#3b82f6", "#ef4444", "#facc15", "#f97316", "#0ea5e9"
      ];
    case "theme-sunset":
      return [
        "#ff7e5f", "#1a1a1a", "#ffae42", "#000000", "#ffd9b3", "#ffe4b8", "#ffae42", "#1a1a1a", "#e53e3e", "#f6ad55",
        "#fde68a", "#f97316", "#dc2626", "#fbbf24", "#ea580c", "#fb923c"
      ];
    case "theme-arcade":
      return [
        "#2b2b2b", "#ffffff", "#00ffcc", "#000000", "#48d9c5", "#99fff2", "#00ffcc", "#000000", "#ff0044", "#ffbb33",
        "#ffff33", "#00ffff", "#ff0044", "#ffdd00", "#ff6600", "#00ff00"
      ];
    case "theme-pastel":
      return [
        "#f8d7e0", "#1a1a1a", "#b3e5fc", "#000000", "#efd0d9", "#a4d4f0", "#b3e5fc", "#1a1a1a", "#f28b82", "#fbbc04",
        "#fff3b0", "#a5d8ff", "#f28b82", "#ffdd00", "#f4a261", "#81b29a"
      ];
    case "theme-metalgear":
      return [
        "#2d2d2d", "#ffffff", "#c9c9c9", "#000000", "#b8aeae", "#e0e0e0", "#c9c9c9", "#000000", "#ff4444", "#ffbb33",
        "#fef9c3", "#9ca3af", "#ff3333", "#ffdd00", "#f97316", "#a3a3a3"
      ];
    case "theme-retro-terminal":
      return [
        "#d1ffcc", "#1a1a1a", "#00aa00", "#ffffff", "#b0e6b0", "#008800", "#00aa00", "#ffffff", "#cc0000", "#ffaa00",
        "#ffff66", "#00ff00", "#ff0000", "#ffcc00", "#ff6600", "#33ff33"
      ];
    case "theme-terminal":
      return [
        "#676b6b", "#ffffff", "#000000", "#00ff00", "#4a4f4f", "#80ff80", "#00aa00", "#ffffff", "#cc0000", "#ffaa00",
        "#ffff99", "#00ff00", "#ff3333", "#ffdd00", "#ff6600", "#00ff00"
      ];
    default:
      return [
        "#1800ad", "#ffffff", "#ffffff", "#000000", "#d1d5db", "#6b7280", "green", "white", "red", "orange",
        "lightyellow", "blue", "red", "#ada624", "orange", "limegreen"
      ]; // fallback
  }
}

// 1–10 → original colors
// 11 → Highlight
// 12 → Edit icon
// 13 → Delete icon
// 14 → Coins icon
// 15 → Fire icon
// 16 → Level progress bar
