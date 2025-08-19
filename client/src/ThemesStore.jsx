import { useEffect, useState, useRef } from "react";
import { getColorPalette } from "./themeUtil";

function ThemesStore({ userCoins, storeHidden, setCoins, api }) {
  const [themes, setThemes] = useState([]);
  const [ownedThemes, setOwnedThemes] = useState([]);
  const [selectedThemeId, setSelectedThemeId] = useState(null);

  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    fetchThemes();
  }, []);

async function fetchThemes() {
  try {
    const res = await fetch(`${api}/themes/all/${userId}`);
    const data = await res.json();

    if (!res.ok || !data) throw new Error(data.error || "Failed to fetch themes");

    console.log("Fetched themes data:", data);

    // Defensive checks
    const allThemes = data.allThemes || [];
    const userThemes = data.userThemes || [];

    setThemes(allThemes);
    setOwnedThemes(userThemes.map((t) => String(t.theme_id)));

    const selected = userThemes.find((t) => t.is_selected);

    if (selected) {
      setSelectedThemeId(selected.theme_id);
    } else {
      // fallback to default theme
      const defaultTheme = allThemes.find((t) => t.css_class === "theme-default");
      if (defaultTheme) {
        setSelectedThemeId(defaultTheme.id);
        handleApply(defaultTheme.id);
      }
    }
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
      errorActivate();
      return;
    }

    try {
      const response = await fetch(`${api}/themes/purchase`, {
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
    const response = await fetch(`${api}/themes/select`, {
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
      const [bg, text, accent, headerText, readColor, tagColor, buttonBg, buttonText, cancelBtnBg, warningBtnBg, highlightClr, editClr, deleteClr, coinClr, fireClr, progressClr, logoClr] = getColorPalette(selectedTheme.css_class);

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
      document.documentElement.style.setProperty("--logo-color", logoClr);

      localStorage.setItem("selectedTheme", selectedTheme.css_class);
    }

  } catch (err) {
    console.error("Error applying theme:", err);
  }
};

  const errorRef = useRef(null);

  function errorActivate(){
    errorRef.current.showModal();
  }

  function closeError(){
    errorRef.current.close();
  }

  return (
    <>
    <section className={`p-3 pt-0 bg-[var(--bg-color)] flash-container ${storeHidden} lg:w-9/12 lg:place-self-end`}>
      <section className="bg-[var(--accent-color)] rounded-b-xl h-5/6 flex flex-col p-4 pt-0 border border-[var(--header-text-color)] border-t-0 lg:border-t lg:rounded-t-xl lg:h-full">
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
                  <div className="flex mt-1 border border-[var(--header-text-color)] md:w-max">
                    {getColorPalette(theme.css_class).map((color, index) => {
                      // fallback if empty, undefined, or a filter string
                      const isFilter = typeof color === "string" && color.includes("(");
                      const safeColor = !color || isFilter ? "#0025cc" : color;
                    
                      return (
                        <div
                          key={index}
                          className="w-5 h-5"
                          style={{ backgroundColor: safeColor }}
                        />
                      );
                    })}
                  </div>
                </div>
                {isOwned ? (
                isSelected ? (
                  <span className="text-sm font-semibold text-[var(--text-color)] md:text-base">
                    Selected
                  </span>
                ) : (
                  <button
                    className="bg-green-600 text-[var(--text-color)] text-sm px-3 py-1 rounded md:text-base"
                    onClick={() => handleApply(theme.id)}
                  >
                    Apply
                  </button>
                )
              ) : theme.price === 0 ? (
                <button
                  className="bg-green-600 text-[var(--text-color)] text-sm px-3 py-1 rounded md:text-base"
                  onClick={() => handlePurchase(theme.id)}
                >
                  Apply
                </button>
              ) : (
                <button
                  className="bg-[var(--button-bg-color)] text-[var(--button-text-color)] text-xs w-2/5 px-1 py-1 rounded md:text-base md:w-2/12"
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

    <dialog id="error-purchase" className="place-self-center p-4 border border-[var(--text-color)] text-[var(--text-color)] bg-[var(--bg-color)] rounded-xl text-center" ref={errorRef}>
        <div className="flex flex-col gap-4">
          <p className="w-50">You don't have enough coins!</p>
          <button className="font-bold h-10 bg-[var(--warning-btn-bg-color)] text-[var(--button-text-color)] rounded border border-black" onClick={closeError}>Ok</button>
        </div>
    </dialog>
    </>
  );
}

export default ThemesStore;
