export function getColorPalette(className) {
  switch (className) {
    case "theme-default":
      return [
        "#1800ad", "#ffffff", "#ffffff", "#000000", "#d1d5db", "#6b7280", "green", "white", "red", "orange",
        "#b6a1a1ff", "blue", "red", "#ada624", "orange", "limegreen"
      ];
    case "theme-dark":
      return [
        "#1a1a1a", "#ffffff", "#4f46e5", "#ffffff", "#2d2d3f", "#9ca3af", "#4f46e5", "#ffffff", "#dc2626", "#f59e0b",
        "#acb694ff", "#f6f6f6ff", "#ef4444", "#fbbf24", "orange", "#10b981"
      ];
    case "theme-cyberpunk":
      return [
        "#0f0c29", "#ffffff", "#ff0080", "black", "#d64d92", "#ff99cc", "#ff0080", "#ffffff", "#ff0033", "#ffcc00",
        "#ffff66", "#000000ff", "#070707ff", "#000000ff", "#33ff99", "#33ff99"
      ];
    case "theme-forest":
      return [
        "#2e4600", "#ffffff", "#a2c523", "#000000", "#0eb321", "#d0ff8a", "#a2c523", "#000000", "#e53e3e", "#dd6b20",
        "#ffee99", "#050710ff", "#7b0c0cff", "#917816ff", "#8c4512ff", "#16a34a"
      ];
    case "theme-ocean":
      return [
        "#003366", "#ffffff", "#66ccff", "#000000", "#628df0", "#cceeff", "#66ccff", "#000000", "#e53e3e", "#f6ad55",
        "#fef9c3", "#000000ff", "#ae0505ff", "#a28514ff", "#ab4f0eff", "#0ea5e9"
      ];
    case "theme-sunset":
      return [
        "#ff7e5f", "#1a1a1a", "#ffae42", "#000000", "#ffd9b3", "#ffe4b8", "#ffae42", "#1a1a1a", "#e53e3e", "#f6ad55",
        "#fde68a", "#000000ff", "#000000ff", "#020202ff", "#853206ff", "#fb923c"
      ];
    case "theme-arcade":
      return [
        "#2b2b2b", "#ffffff", "#00ffcc", "#000000", "#48d9c5", "#99fff2", "#00ffcc", "#000000", "#ff0044", "#ffbb33",
        "#ffff33", "#4c00ffff", "#ff0044", "#827417ff", "#acae10ff", "#00ff00"
      ];
    case "theme-pastel":
      return [
        "#f8d7e0", "#1a1a1a", "#b3e5fc", "#000000", "#efd0d9", "#a4d4f0", "#b3e5fc", "#1a1a1a", "#f28b82", "#fbbc04",
        "#fff3b0", "#1b9cffff", "#fb7165ff", "#b6a640ff", "#c07f4aff", "#81b29a"
      ];
    case "theme-metalgear":
      return [
        "#2d2d2d", "#ffffff", "#c9c9c9", "#000000", "#b8aeae", "#e0e0e0", "#c9c9c9", "#000000", "#ff4444", "#ffbb33",
        "#fef9c3", "#525761ff", "#ac2222ff", "#ad9a19ff", "#9d4b11ff", "#a3a3a3"
      ];
    case "theme-retro-terminal":
      return [
        "#d1ffcc", "#1a1a1a", "#00aa00", "#ffffff", "#b0e6b0", "#008800", "#00aa00", "#ffffff", "#cc0000", "#ffaa00",
        "#a2a270ff", "#00ff00", "#ff0000", "#ffcc00", "#ff6600", "#33ff33"
      ];
    case "theme-terminal":
      return [
        "#676b6b", "#ffffff", "#000000", "#00ff00", "#4a4f4f", "#80ff80", "#00aa00", "#ffffff", "#cc0000", "#ffaa00",
        "#56564fff", "#00ff00", "#ff3333", "#ffdd00", "#ff6600", "#00ff00"
      ];
    default:
      return [
        "#1800ad", "#ffffff", "#ffffff", "#000000", "#d1d5db", "#6b7280", "green", "white", "red", "orange",
        "#b6a1a1ff", "blue", "red", "#ada624", "orange", "limegreen"
      ]; // fallback
  }
}

export const applyDefaultTheme = () => {
  localStorage.setItem("selectedTheme", "theme-default");
  const [
    bg, text, accent, headerText, readColor, tagColor,
    buttonBg, buttonText, cancelBtnBg, warningBtnBg,
    highlightClr, editClr, deleteClr, coinClr, fireClr, progressClr
  ] = getColorPalette("default");

  document.documentElement.style.setProperty("--bg-color", bg);
  document.documentElement.style.setProperty("--text-color", text);
  document.documentElement.style.setProperty("--accent-color", accent);
  document.documentElement.style.setProperty("--header-text-color", headerText);
  document.documentElement.style.setProperty("--read-color", readColor);
  document.documentElement.style.setProperty("--tag-color", tagColor);
  document.documentElement.style.setProperty("--button-bg-color", buttonBg);
  document.documentElement.style.setProperty("--button-text-color", buttonText);
  document.documentElement.style.setProperty("--cancel-btn-bg-color", cancelBtnBg);
  document.documentElement.style.setProperty("--warning-btn-bg-color", warningBtnBg);
  document.documentElement.style.setProperty("--highlight-color", highlightClr);
  document.documentElement.style.setProperty("--edit-color", editClr);
  document.documentElement.style.setProperty("--delete-color", deleteClr);
  document.documentElement.style.setProperty("--coin-color", coinClr);
  document.documentElement.style.setProperty("--fire-color", fireClr);
  document.documentElement.style.setProperty("--progress-color", progressClr);

};

// 1–10 → original colors
// 11 → Highlight
// 12 → Edit icon
// 13 → Delete icon
// 14 → Coins icon
// 15 → Fire icon
// 16 → Level progress bar
