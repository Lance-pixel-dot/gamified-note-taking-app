import { useEffect, useState } from "react";

function ThemesStore({ userCoins, storeHidden }) {
  const [themes, setThemes] = useState([]);
  const [ownedThemes, setOwnedThemes] = useState([]);
  const [selectedThemeId, setSelectedThemeId] = useState(null);

  const userId = localStorage.getItem("user_id");

  function getColorPalette(cssClass) {
  const palettes = {
    "theme-default": ["#1800ad", "#ffffff", "#000000"],
    "theme-dark": ["#1a1a1a", "#333333", "#fefefe"],
    "theme-light": ["#ffffff", "#f0f0f0", "#000000"],
    "theme-cyberpunk": ["#0f0c29", "#ff0080", "#00ffe5"],
    "theme-terminal": ["#000000", "#00ff00", "#222222"],
    "theme-forest": ["#2e4600", "#486b00", "#a2c523"],
    "theme-ocean": ["#003366", "#3399ff", "#66ccff"],
    "theme-sunset": ["#ff7e5f", "#feb47b", "#ffae70"],
    "theme-arcade": ["#1c1c1c", "#e60073", "#00ffcc"],
    "theme-pastel": ["#ffd1dc", "#c1f0f6", "#fff0f5"],
    "theme-metalgear": ["#2d2d2d", "#728c69", "#c9c9c9"],
  };

  return palettes[cssClass] || ["#ccc", "#eee", "#aaa"];
}

  useEffect(() => {
    fetchThemes();
  }, []);

  async function fetchThemes() {
  try {
    const resAll = await fetch("http://localhost:5000/themes");
    const allThemes = await resAll.json();

    const resUser = await fetch(`http://localhost:5000/themes/user/${userId}`);
    const userThemes = await resUser.json();

    setThemes(allThemes);
    setOwnedThemes(userThemes.map((t) => t.theme_id));

    const selected = userThemes.find((t) => t.is_selected);
    if (selected) setSelectedThemeId(selected.theme_id);
  } catch (err) {
    console.error("Error fetching themes:", err);
  }
}

  async function handlePurchase(themeId, price) {
    if (userCoins < price) {
      alert("Not enough coins!");
      return;
    }

    try {
      const res = await fetch("/themes/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, themeId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Purchase failed.");
        return;
      }

      if (onThemePurchase) onThemePurchase(price); // Notify parent to deduct coins
      fetchThemes(); // Refresh state
    } catch (err) {
      console.error("Error purchasing theme:", err);
    }
  }

  return (
    <section className={`p-3 pt-0 bg-[#1800ad] flash-container ${storeHidden}`}>
      <section className="bg-white rounded-b-xl h-5/6 flex flex-col p-4 pt-0">
        <section
          id="themes-container"
          className="border-2 flex-1 overflow-y-auto rounded-xl p-4 flex flex-col gap-2 items-stretch mt-1"
        >
          {themes.map((theme) => {
            const isOwned = ownedThemes.includes(theme.id);
            const isSelected = theme.id === selectedThemeId;

            return (
              <div
                key={theme.id}
                className="flex justify-between items-center p-3 border rounded-lg bg-gray-300"
              >
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{theme.name}</span>
                  <div className="flex mt-1 gap-1">
                    {getColorPalette(theme.css_class).map((color, index) => (
                      <div
                        key={index}
                        className="w-5 h-5 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {isOwned ? (
                  <span className="text-sm font-semibold text-green-600">
                    {isSelected ? "✅ Selected" : "🎉 Owned"}
                  </span>
                ) : (
                  <button
                    className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700"
                    onClick={() => handlePurchase(theme.id, theme.price)}
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
