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

  const purchaseRef = useRef(null);

  const [purchaseTheme, setPurchaseTheme] = useState();

  function confirmPurchase(themeId){
    setPurchaseTheme(themeId);
    purchaseRef.current.showModal();
  }

  function closePurchase(){
    purchaseRef.current.close();
  }

  return (
    <>
    <section className={`p-3 pt-0 bg-[var(--bg-color)] flash-container ${storeHidden} lg:w-9/12 lg:place-self-end`}>
      <section className="bg-[var(--accent-color)] rounded-b-xl h-full flex flex-col p-4 pt-0 border border-[var(--header-text-color)] border-t-0 lg:border-t lg:rounded-t-xl lg:h-full">
        <section
          id="themes-container"
          className="border-2 border-[var(--header-text-color)] flex-1 overflow-y-auto rounded-xl p-4 flex flex-col gap-2 items-stretch mt-1"
        >
          {themes.map((theme) => {
  const isOwned = ownedThemes.includes(String(theme.id));
  const isSelected = theme.id === selectedThemeId;

  const rawColors = getColorPalette(theme.css_class);

  const colors = rawColors.filter(c =>
  typeof c === "string" &&
  (/^#([0-9A-Fa-f]{3,8})$/.test(c) || c.startsWith("rgb") || c.startsWith("hsl"))
  );

  const step = 100 / colors.length;

  const gradientStyle = {
    background: colors.length
      ? `linear-gradient(to right, ${colors
          .map((c, i) => `${c} ${i * step}% ${(i + 1) * step}%`)
          .join(", ")})`
      : "transparent",
  };

  return (
    <div
      key={theme.id}
      className="flex justify-between items-center p-3 border border-[var(--header-text-color)] rounded-lg bg-[var(--accent-color)] text-[var(--header-text-color)]"
    >
      <div className="flex flex-col w-2/4">
        <span className="font-semibold text-sm xl:text-base">{theme.name}</span>

        <div
          className="mt-1 w-full h-5 rounded border border-[var(--header-text-color)]"
          style={gradientStyle}
        />
      </div>

      {isOwned ? (
        isSelected ? (
          <span className="text-sm font-semibold text-[var(--header-text-color)] md:text-base xl:text-lg">
            Selected
          </span>
        ) : (
          <button
            className="bg-green-600 text-white text-sm px-3 py-1 rounded md:text-base xl:text-lg"
            onClick={() => handleApply(theme.id)}
          >
            Apply
          </button>
        )
      ) : theme.price === 0 ? (
        <button
          className="bg-green-600 text-white text-sm px-3 py-1 rounded md:text-base xl:text-lg"
          onClick={() => handlePurchase(theme.id)}
        >
          Apply
        </button>
      ) : (
        <button
          className="bg-[var(--bg-color)] border border-[var(--header-text-color)] text-[var(--text-color)] text-xs w-2/5 px-1 py-1 rounded md:text-base md:w-2/12 flex justify-center items-center gap-1"
          onClick={() => {confirmPurchase(theme.id)}}
        >
          Buy ({theme.price} <svg className="w-6" viewBox="0 -1.5 48 48" xmlns="http://www.w3.org/2000/">
                    <path id="coins" d="M320.857,468.479c-4.328-1.088-6.981-2.637-7.673-4.478H313v-7a3.265,3.265,0,0,1,1-2.257V450.1a4.711,4.711,0,0,1-1.816-2.1H312v-7c0-1.619,1.345-3.033,4-4.2V432c0-4.6,11.068-7,22-7s22,2.4,22,7v7h-.181c-.448,1.205-1.727,2.278-3.819,3.2v2.7a3.9,3.9,0,0,1,2,3.1v7h-.185a3.856,3.856,0,0,1-.895,1.337A2.92,2.92,0,0,1,357,457v7h-.184c-.692,1.841-3.346,3.39-7.673,4.478a66.515,66.515,0,0,1-28.286,0ZM334.88,468h.239c2.036,0,4.011-.087,5.881-.243V465h1v2.665A41.213,41.213,0,0,0,350.59,466H350v-3h1v2.861a16.562,16.562,0,0,0,1.762-.729A13.1,13.1,0,0,0,355,463.919V460.1a22.359,22.359,0,0,1-8.331,2.911,69.635,69.635,0,0,1-23.337,0A22.358,22.358,0,0,1,315,460.1v3.815a13.378,13.378,0,0,0,2.231,1.21,24.543,24.543,0,0,0,5.769,1.8V464h1v3.119a60.16,60.16,0,0,0,8,.822V465h1v2.974Q333.93,468,334.88,468ZM315,457c0,2.088,7.609,5,20,5a56.889,56.889,0,0,0,13.557-1.427c2.923-.724,5.041-1.652,5.962-2.613C350.6,459.864,343.678,461,336,461a64.428,64.428,0,0,1-12.541-1.156c-3.944-.813-6.809-1.993-8.284-3.412A1.111,1.111,0,0,0,315,457Zm20.88,2h.239c2.036,0,4.011-.087,5.881-.243V456h1v2.665a43.03,43.03,0,0,0,8-1.478V455h1v1.86a16.579,16.579,0,0,0,1.762-.728A13.209,13.209,0,0,0,356,454.919V451.1a22.346,22.346,0,0,1-8.331,2.912,69.64,69.64,0,0,1-23.338,0,24.04,24.04,0,0,1-7.914-2.638c-.125-.051-.257-.108-.418-.177v3.718a13.162,13.162,0,0,0,2.231,1.21,24.543,24.543,0,0,0,5.769,1.8V455h1v3h-.642a58.75,58.75,0,0,0,8.643.941V456h1v2.974Q334.93,459,335.88,459Zm-2-7h.239q.949,0,1.88-.026V449h1v2.941a58.734,58.734,0,0,0,8.646-.941H345v-3h1v2.93a24.484,24.484,0,0,0,5.777-1.806A13.171,13.171,0,0,0,354,447.918V444.1a22.352,22.352,0,0,1-8.331,2.912,69.635,69.635,0,0,1-23.337,0A22.36,22.36,0,0,1,314,444.1v3.814a13.127,13.127,0,0,0,2.218,1.205,16.543,16.543,0,0,0,1.781.737V447h1v3.186a43.042,43.042,0,0,0,8,1.478V449h1v2.756C329.869,451.913,331.844,452,333.88,452Zm20.572-2.237c1.012-.6,1.547-1.207,1.547-1.762h-.184A4.3,4.3,0,0,1,354.452,449.762ZM314,441c0,2.088,7.609,5,20,5a51.442,51.442,0,0,0,15.336-1.925A66.045,66.045,0,0,1,338,445a60.165,60.165,0,0,1-14.234-1.544c-4.278-1.088-6.9-2.628-7.583-4.457H316v-.012C314.709,439.658,314,440.369,314,441Zm23.881,2h.239c2.035,0,4.01-.087,5.88-.243V440h1v2.665A41.228,41.228,0,0,0,353.588,441H353v-3h1v2.859a16.568,16.568,0,0,0,1.775-.734A13.092,13.092,0,0,0,358,438.918V435.1c-3.675,2.569-11.875,3.9-20,3.9s-16.325-1.328-20-3.9v3.815a13.107,13.107,0,0,0,2.226,1.207,24.5,24.5,0,0,0,5.774,1.8V439h1v3.119a60.154,60.154,0,0,0,8,.821V440h1v2.974Q336.93,443,337.881,443ZM318,432c0,2.088,7.609,5,20,5s20-2.912,20-5-7.609-5-20-5S318,429.912,318,432Z" transform="translate(-312 -425)" fill="var(--text-color)"/>
                    </svg>)
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

    <dialog id="error-purchase" className="place-self-center p-4 border border-[var(--text-color)] text-[var(--text-color)] bg-[var(--bg-color)] rounded-xl text-center" ref={purchaseRef}>
        <div className="flex flex-col gap-4">
          <p className="w-50">Purchase this Theme?</p>
          <button className="font-bold h-10 bg-[var(--button-bg-color)] text-[var(--button-text-color)] rounded border border-black" onClick={() => {handlePurchase(purchaseTheme); closePurchase()}}>Yes</button>
          <button className="font-bold h-10 bg-[var(--warning-btn-bg-color)] text-[var(--button-text-color)] rounded border border-black" onClick={closePurchase}>Cancel</button>
        </div>
    </dialog>
    </>
  );
}

export default ThemesStore;
