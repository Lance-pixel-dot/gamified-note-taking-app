import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomeScreen from "./WelcomeScreen";
import Dashboard from "./Dashboard";
import { format, isToday, isYesterday, parseISO } from "date-fns";

// XP needed per level: 100 + 50 * (level - 1)
function getXPNeeded(level) {
  return 100 + (level - 1) * 50;
}

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
    const response = await fetch(`http://localhost:5000/users/${userId}/coins`, {
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
    const res = await fetch(`http://localhost:5000/users/${userId}/coins`);
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
          `http://localhost:5000/achievements/has?user_id=${user_id}&achievement_id=${achievement.id}`
        );
        const data = await res.json();

        if (!data.hasAchievement) {
          await fetch("http://localhost:5000/achievements/unlock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id,
              achievement_id: achievement.id,
            }),
          });

          // Now grant XP without triggering achievement check again
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
        const res = await fetch(`http://localhost:5000/achievements/has?user_id=${userId}&achievement_id=${achievement.id}`);
        const data = await res.json();

        if (!data.hasAchievement) {
          await fetch("http://localhost:5000/achievements/unlock", {
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

async function incrementXP(baseAmount, skipAchievements = false) {
  const userId = localStorage.getItem("user_id");
  const todayStr = format(new Date(), "yyyy-MM-dd");

  try {
    // Fetch current streak info
    const res = await fetch(`http://localhost:5000/users/${userId}/streak`);
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

    // Apply streak-based XP multiplier
    const multiplier = 1.3 + 0.3 * (newStreak - 1);
    const finalXP = baseAmount * multiplier;

    console.log(`Incrementing XP for user ${userId}: base=${baseAmount}, multiplier=${multiplier}, finalXP=${finalXP}`);

    // Fetch user's current XP and level
    const res2 = await fetch(`http://localhost:5000/users/${userId}`);
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
      const response = await fetch(`http://localhost:5000/users/${userId}/xp`, {
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
      const res1 = await fetch(`http://localhost:5000/users/${user_id}`);
      const data1 = await res1.json();
      setStats({ xp: data1.xp, level: data1.level });

      const res2 = await fetch(`http://localhost:5000/users/${user_id}/streak`);
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
      fetchCoins();
    } catch (err) {
      console.error("Failed to fetch XP or streak:", err.message);
    }
  };

  fetchXPAndStreak();
}, []);

const [showLevelUp, setShowLevelUp] = useState(false);
const [levelUpData, setLevelUpData] = useState({ level: 0, coins: 0 });

const triggerLevelUpToast = (level, coins) => {
  setLevelUpData({ level, coins });
  setShowLevelUp(true);
  setTimeout(() => {
    setShowLevelUp(false);
  }, 4000); 
};

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
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
              updateCoinsInBackend={updateCoinsInBackend}
            />
          }
        />
        </Routes>
      </Router>
      {showLevelUp && (
        <div className="text-sm fixed bottom-16 right-4 z-[61] bg-white text-black border border-black p-3 rounded shadow-lg transition-all duration-300 ease-in-out animate-slide-in">
    ⭐ Level Up! You’re now Level {levelUpData.level}. +{levelUpData.coins} 💰
        </div>
    )}
    </>
  );
}

export default App;