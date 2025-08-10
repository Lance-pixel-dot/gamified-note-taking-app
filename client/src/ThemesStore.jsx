import { useEffect, useState } from "react";
import { getColorPalette } from "./themeUtil";

function ThemesStore({ userCoins, storeHidden, setCoins }) {
  const [themes, setThemes] = useState([]);
  const [ownedThemes, setOwnedThemes] = useState([]);
  const [selectedThemeId, setSelectedThemeId] = useState(null);

  const userId = localStorage.getItem("user_id");

  // function getColorPalette(cssClass) {
  //   const palettes = {
  //     "theme-default": ["#1800ad", "#ffffff", "#000000"],
  //     "theme-dark": ["#1a1a1a", "#333333", "#fefefe"],
  //     "theme-light": ["#ffffff", "#f0f0f0", "#000000"],
  //     "theme-cyberpunk": ["#0f0c29", "#ff0080", "#00ffe5"],
  //     "theme-terminal": ["#000000", "#00ff00", "#222222"],
  //     "theme-forest": ["#2e4600", "#486b00", "#a2c523"],
  //     "theme-ocean": ["#003366", "#3399ff", "#66ccff"],
  //     "theme-sunset": ["#ff7e5f", "#feb47b", "#ffae70"],
  //     "theme-arcade": ["#1c1c1c", "#e60073", "#00ffcc"],
  //     "theme-pastel": ["#ffd1dc", "#c1f0f6", "#fff0f5"],
  //     "theme-metalgear": ["#2d2d2d", "#728c69", "#c9c9c9"],
  //   };

  //   return palettes[cssClass] || ["#ccc", "#eee", "#aaa"];
  // }

  useEffect(() => {
    fetchThemes();
  }, []);

async function fetchThemes() {
  try {
    const res = await fetch(`http://localhost:5000/themes/all/${userId}`);
    const data = await res.json();

    if (!res.ok || !data) throw new Error(data.error || "Failed to fetch themes");

    console.log("Fetched themes data:", data);

    // Defensive checks
    const allThemes = data.allThemes || [];
    const userThemes = data.userThemes || [];

    setThemes(allThemes);
    setOwnedThemes(userThemes.map((t) => String(t.theme_id)));

    const selected = userThemes.find((t) => t.is_selected);
    if (selected) setSelectedThemeId(selected.theme_id);
  } catch (err) {
    console.error("Error fetching themes:", err);
  }
}

  const handlePurchase = async (themeId) => {
    if (!userId || !themeId) return;

    const selectedTheme = themes.find((t) => t.id === themeId);
    if (!selectedTheme) return;

    if (userCoins < selectedTheme.price) {
      console.warn("Not enough coins!");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/themes/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, themeId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to purchase theme");

      setCoins((prev) => prev - selectedTheme.price);
      fetchThemes();
    } catch (err) {
      console.error("Error purchasing theme:", err);
    }
  };

const handleApply = async (themeId) => {
  try {
    const response = await fetch(`http://localhost:5000/themes/select`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId, themeId }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to apply theme");

    setSelectedThemeId(themeId);

    const selectedTheme = themes.find((t) => t.id === themeId);
    if (selectedTheme) {
      const [bg, text, accent, headerText, readColor, tagColor] = getColorPalette(selectedTheme.css_class);

      document.documentElement.style.setProperty("--bg-color", bg);
      document.documentElement.style.setProperty("--text-color", text);
      document.documentElement.style.setProperty("--accent-color", accent);
      document.documentElement.style.setProperty("--header-text-color", headerText);
      document.documentElement.style.setProperty("--read-color", readColor);
      document.documentElement.style.setProperty("--tag-color", tagColor);

      localStorage.setItem("selectedTheme", selectedTheme.css_class);
    }

  } catch (err) {
    console.error("Error applying theme:", err);
  }
};

  return (
    <section className={`p-3 pt-0 bg-[var(--bg-color)] flash-container ${storeHidden}`}>
      <section className="bg-[var(--accent-color)] rounded-b-xl h-5/6 flex flex-col p-4 pt-0">
        <section
          id="themes-container"
          className="border-2 border-[var(--header-text-color)] flex-1 overflow-y-auto rounded-xl p-4 flex flex-col gap-2 items-stretch mt-1"
        >
          {themes.map((theme) => {
            const isOwned = ownedThemes.includes(String(theme.id));
            const isSelected = theme.id === selectedThemeId;

            return (
              <div
                key={theme.id}
                className="flex justify-between items-center p-3 border border-[var(--header-text-color)] rounded-lg bg-[var(--accent-color)] text-[var(--header-text-color)]"
              >
                <div className="flex flex-col w-2/4">
                  <span className="font-semibold text-sm">{theme.name}</span>
                  <div className="flex mt-1 gap-1">
                    {getColorPalette(theme.css_class).map((color, index) => (
                      <div
                        key={index}
                        className="w-5 h-5 rounded border border-[var(--header-text-color)]"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                {isOwned ? (
                isSelected ? (
                  <span className="text-sm font-semibold text-green-600">
                    ✅ Selected
                  </span>
                ) : (
                  <button
                    className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
                    onClick={() => handleApply(theme.id)}
                  >
                    Apply
                  </button>
                )
              ) : theme.price === 0 ? (
                <button
                  className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
                  onClick={() => handlePurchase(theme.id)}
                >
                  Apply
                </button>
              ) : (
                <button
                  className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
                  onClick={() => handlePurchase(theme.id)}
                >
                  Buy ({theme.price}🪙)
                </button>
              )}
              </div>
            );
          })}
        </section>
      </section>
    </section>
  );
}

export default ThemesStore;
