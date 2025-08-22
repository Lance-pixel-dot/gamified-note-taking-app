import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomeScreen from "./WelcomeScreen";
import Dashboard from "./Dashboard";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { getColorPalette } from "./themeUtil";
import Icon from '@mdi/react';
import { mdiTrophyAward } from '@mdi/js';

// XP needed per level: 100 + 50 * (level - 1)
function getXPNeeded(level) {
  return 100 + (level - 1) * 50;
}

 const api = "https://gamified-note-taking-app.onrender.com";

function App() {
  const [stats, setStats] = useState({
    xp: 0,
    level: 1
  });

  // Handler to refresh achievements after creating a note
  const achievementsRef = useRef();
  const handleCreated = () => {
    achievementsRef.current?.refreshAchievements();
  };

  const [streak, setStreak] = useState(0); // Make streak reactive
  const [coins, setCoins] = useState(0);

  const updateCoinsInBackend = async (userId, amount) => {

  try {
    const response = await fetch(`${api}/users/${userId}/coins`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update coins");
    setCoins(data.coins);

  } catch (err) {
    console.error("Failed to update coins:", err.message);
  }
};

const fetchCoins = async () => {
  const userId = localStorage.getItem("user_id");
  try {
    const res = await fetch(`${api}/users/${userId}/coins`);
    const data = await res.json();
    setCoins(data.coins);
  } catch (err) {
    console.error("Failed to fetch coins:", err.message);
  }
};

async function checkAndUnlockLevelAchievements(level) {
  const user_id = localStorage.getItem("user_id");

  const levelAchievements = [
    { id: 5, requiredLevel: 2, xp: 15 },
    { id: 16, requiredLevel: 30, xp: 70 },  //30
    { id: 17, requiredLevel: 50, xp: 100 }, //50
  ];

  for (const achievement of levelAchievements) {
    if (level >= achievement.requiredLevel) {
      try {
        const res = await fetch(
          `${api}/achievements/has?user_id=${user_id}&achievement_id=${achievement.id}`
        );
        const data = await res.json();

        if (!data.hasAchievement) {
          await fetch(`${api}/achievements/unlock`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id,
              achievement_id: achievement.id,
            }),
          });

          // grant XP without triggering achievement check again
          await incrementXP(achievement.xp, true);

          await updateCoinsInBackend(user_id, 10);

          handleCreated();
        }

      } catch (err) {
        console.error("Error unlocking achievement:", err);
      }
    }
  }
}

async function checkAndUnlockStreakAchievements(streakCount) {
  const userId = localStorage.getItem("user_id");

  const streakAchievements = [
    { id: 3, threshold: 7 },
    { id: 18, threshold: 14 }, //14
    { id: 19, threshold: 30 }, //30
  ];

  for (const achievement of streakAchievements) {
    if (streakCount >= achievement.threshold) {
      try {
        const res = await fetch(`${api}/achievements/has?user_id=${userId}&achievement_id=${achievement.id}`);
        const data = await res.json();

        if (!data.hasAchievement) {
          await fetch(`${api}/achievements/unlock`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: userId, achievement_id: achievement.id }),
          });

          // Fetch XP reward from backend or hardcode here (optional)
          let xpReward = 0;
          if (achievement.id === 3) xpReward = 50;
          else if (achievement.id === 18) xpReward = 70;
          else if (achievement.id === 19) xpReward = 100;

          await incrementXP(xpReward, true); // avoid infinite loop by skipping achievement check inside

          await updateCoinsInBackend(userId, 10);

          handleCreated();
        }
      } catch (err) {
        console.error("Error checking/unlocking streak achievement:", err.message);
      }
    }
  }
}

const [multiplier, setMultiplier] = useState(1);

// compute multiplier from streak and return rounded number (decimal)
function computeMultiplierFromStreak(streakCount) {
  const raw = 1.3 + 0.3 * (streakCount - 1);
  const clamped = Math.max(raw, 1.0);
  return Math.round(clamped * 100) / 100;
}

async function incrementXP(baseAmount, skipAchievements = false) {
  const userId = localStorage.getItem("user_id");
  const todayStr = format(new Date(), "yyyy-MM-dd");

  try {
    // Fetch current streak info
    const res = await fetch(`${api}/users/${userId}/streak`);
    const data = await res.json();

    const lastActiveDate = data.last_active ? parseISO(data.last_active) : null;
    let newStreak = data.streak_count || 0;

    if (isYesterday(lastActiveDate)) {
      newStreak += 1;
    } else if (isToday(lastActiveDate)) {
      // Do nothing
    } else {
      newStreak = 0;
    }

    const rawMultiplier = 1.3 + 0.3 * (newStreak - 1); 
    const roundedMultiplier = computeMultiplierFromStreak(newStreak);
    setMultiplier(roundedMultiplier);

    const finalXP = baseAmount * rawMultiplier;

    // Fetch user's current XP and level
    const res2 = await fetch(`${api}/users/${userId}`);
    const userData = await res2.json();
    let currentXP = parseFloat(userData.xp);
    let currentLevel = parseInt(userData.level);
    let xp = currentXP + finalXP;

    let coinsToAdd = 0;
    let leveledUpTo = null;

    // Level up calculation
    while (xp >= getXPNeeded(currentLevel)) {
      xp -= getXPNeeded(currentLevel);
      currentLevel += 1;
      coinsToAdd += currentLevel * 10; 

      leveledUpTo = currentLevel;
    }

    // Update XP/level/streak/last_active
    await updateXPInBackend(userId, xp, currentLevel, newStreak, todayStr);
    setStats({ xp, level: currentLevel });
    setStreak(newStreak);

    if (leveledUpTo !== null) {
      triggerLevelUpToast(leveledUpTo, coinsToAdd);
    }

    if (!skipAchievements && coinsToAdd > 0) {
      await updateCoinsInBackend(userId, coinsToAdd);
    }

    await checkAndUnlockStreakAchievements(newStreak);

    if (!skipAchievements) {
      await checkAndUnlockLevelAchievements(currentLevel);
    }

  } catch (err) {
    console.error("Failed to increment XP:", err.message);
  }
}

  const xpNeeded = getXPNeeded(stats.level);
  const progress = Math.floor((stats.xp / xpNeeded) * 100);

  const updateXPInBackend = async (userId, xp, level, streak_count, last_active) => {
    try {
      const response = await fetch(`${api}/users/${userId}/xp`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ xp, level, streak_count, last_active }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update XP and level");
      }

    } catch (err) {
      console.error("Failed to update XP and level:", err.message);
    }
  };

  useEffect(() => {
  const fetchXPAndStreak = async () => {
    const user_id = localStorage.getItem("user_id");
    const todayStr = format(new Date(), "yyyy-MM-dd");

    try {
      const res1 = await fetch(`${api}/users/${user_id}`);
      const data1 = await res1.json();
      setStats({ xp: data1.xp, level: data1.level });

      const res2 = await fetch(`${api}/users/${user_id}/streak`);
      const data2 = await res2.json();

      const lastActiveDate = data2.last_active ? parseISO(data2.last_active) : null;
      let newStreak = data2.streak_count || 0;

      if (isYesterday(lastActiveDate)) {
        // continue streak
      } else if (isToday(lastActiveDate)) {
        // do nothing
      } else {
        newStreak = 0;

        // Update backend with reset streak and last_active (to avoid repeating reset)
        await updateXPInBackend(
        user_id,
        parseFloat(data1.xp) || 0,
        parseInt(data1.level) || 1,
        newStreak,
        todayStr
        );
      }

      setStreak(newStreak);
      setMultiplier(computeMultiplierFromStreak(newStreak));
      fetchCoins();
    } catch (err) {
      console.error("Failed to fetch XP or streak:", err.message);
    }
  };

  fetchXPAndStreak();
}, []);

useEffect(() => {
  setMultiplier(computeMultiplierFromStreak(streak));
}, [streak]);

const [showLevelUp, setShowLevelUp] = useState(false);
const [levelUpData, setLevelUpData] = useState({ level: 0, coins: 0 });

const triggerLevelUpToast = (level, coins) => {
  setLevelUpData({ level, coins });
  setShowLevelUp(true);
  setTimeout(() => {
    setShowLevelUp(false);
  }, 4000); 
};

//  applying themes
useEffect(() => {
  const savedTheme = localStorage.getItem("selectedTheme");
  if (savedTheme) {
    const [
      bg, text, accent, headerText, readColor, tagColor,
      buttonBg, buttonText, cancelBtnBg, warningBtnBg,
      highlightClr, editClr, deleteClr, coinClr, fireClr, progressClr, logoClr
    ] = getColorPalette(savedTheme);
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
  }
}, []);

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<WelcomeScreen api={api} />} />
        <Route
          path="/Dashboard"
          element={
            <Dashboard
              xp={stats.xp}
              level={stats.level}
              progress={progress}
              incrementXP={incrementXP}
              streak={streak}
              coins={coins}
              handleCreated={handleCreated}
              achievementsRef={achievementsRef}
              multiplier={multiplier} 
              updateCoinsInBackend={updateCoinsInBackend}
              setCoins={setCoins} 
              api={api}
            />
          }
        />
        </Routes>
      </Router>
      {showLevelUp && (
         <div
           className="fixed bottom-16 right-4 pointer-events-none
                      bg-[var(--bg-color)] border border-[var(--text-color)]
                      text-[var(--text-color)] text-xs p-3 rounded-xl shadow-lg toast
                      animate-slide-in z-[9999] flex items-center gap-2 md:text-sm xl:text-base"
         >
           <Icon path={mdiTrophyAward} size={1} /> Level Up! You’re now Level {levelUpData.level}. +{levelUpData.coins} <svg className="w-6" viewBox="0 -1.5 48 48" xmlns="http://www.w3.org/2000/">
                    <path id="coins" d="M320.857,468.479c-4.328-1.088-6.981-2.637-7.673-4.478H313v-7a3.265,3.265,0,0,1,1-2.257V450.1a4.711,4.711,0,0,1-1.816-2.1H312v-7c0-1.619,1.345-3.033,4-4.2V432c0-4.6,11.068-7,22-7s22,2.4,22,7v7h-.181c-.448,1.205-1.727,2.278-3.819,3.2v2.7a3.9,3.9,0,0,1,2,3.1v7h-.185a3.856,3.856,0,0,1-.895,1.337A2.92,2.92,0,0,1,357,457v7h-.184c-.692,1.841-3.346,3.39-7.673,4.478a66.515,66.515,0,0,1-28.286,0ZM334.88,468h.239c2.036,0,4.011-.087,5.881-.243V465h1v2.665A41.213,41.213,0,0,0,350.59,466H350v-3h1v2.861a16.562,16.562,0,0,0,1.762-.729A13.1,13.1,0,0,0,355,463.919V460.1a22.359,22.359,0,0,1-8.331,2.911,69.635,69.635,0,0,1-23.337,0A22.358,22.358,0,0,1,315,460.1v3.815a13.378,13.378,0,0,0,2.231,1.21,24.543,24.543,0,0,0,5.769,1.8V464h1v3.119a60.16,60.16,0,0,0,8,.822V465h1v2.974Q333.93,468,334.88,468ZM315,457c0,2.088,7.609,5,20,5a56.889,56.889,0,0,0,13.557-1.427c2.923-.724,5.041-1.652,5.962-2.613C350.6,459.864,343.678,461,336,461a64.428,64.428,0,0,1-12.541-1.156c-3.944-.813-6.809-1.993-8.284-3.412A1.111,1.111,0,0,0,315,457Zm20.88,2h.239c2.036,0,4.011-.087,5.881-.243V456h1v2.665a43.03,43.03,0,0,0,8-1.478V455h1v1.86a16.579,16.579,0,0,0,1.762-.728A13.209,13.209,0,0,0,356,454.919V451.1a22.346,22.346,0,0,1-8.331,2.912,69.64,69.64,0,0,1-23.338,0,24.04,24.04,0,0,1-7.914-2.638c-.125-.051-.257-.108-.418-.177v3.718a13.162,13.162,0,0,0,2.231,1.21,24.543,24.543,0,0,0,5.769,1.8V455h1v3h-.642a58.75,58.75,0,0,0,8.643.941V456h1v2.974Q334.93,459,335.88,459Zm-2-7h.239q.949,0,1.88-.026V449h1v2.941a58.734,58.734,0,0,0,8.646-.941H345v-3h1v2.93a24.484,24.484,0,0,0,5.777-1.806A13.171,13.171,0,0,0,354,447.918V444.1a22.352,22.352,0,0,1-8.331,2.912,69.635,69.635,0,0,1-23.337,0A22.36,22.36,0,0,1,314,444.1v3.814a13.127,13.127,0,0,0,2.218,1.205,16.543,16.543,0,0,0,1.781.737V447h1v3.186a43.042,43.042,0,0,0,8,1.478V449h1v2.756C329.869,451.913,331.844,452,333.88,452Zm20.572-2.237c1.012-.6,1.547-1.207,1.547-1.762h-.184A4.3,4.3,0,0,1,354.452,449.762ZM314,441c0,2.088,7.609,5,20,5a51.442,51.442,0,0,0,15.336-1.925A66.045,66.045,0,0,1,338,445a60.165,60.165,0,0,1-14.234-1.544c-4.278-1.088-6.9-2.628-7.583-4.457H316v-.012C314.709,439.658,314,440.369,314,441Zm23.881,2h.239c2.035,0,4.01-.087,5.88-.243V440h1v2.665A41.228,41.228,0,0,0,353.588,441H353v-3h1v2.859a16.568,16.568,0,0,0,1.775-.734A13.092,13.092,0,0,0,358,438.918V435.1c-3.675,2.569-11.875,3.9-20,3.9s-16.325-1.328-20-3.9v3.815a13.107,13.107,0,0,0,2.226,1.207,24.5,24.5,0,0,0,5.774,1.8V439h1v3.119a60.154,60.154,0,0,0,8,.821V440h1v2.974Q336.93,443,337.881,443ZM318,432c0,2.088,7.609,5,20,5s20-2.912,20-5-7.609-5-20-5S318,429.912,318,432Z" transform="translate(-312 -425)" fill="var(--text-color)"/>
                    </svg>
         </div>
      )}
    </>
  );
}

export default App;