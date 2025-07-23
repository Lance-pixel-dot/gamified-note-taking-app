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

    const multiplier = 1.3 + 0.3 * (newStreak - 1);
    const finalXP = baseAmount * multiplier;

    console.log(baseAmount);
    console.log(multiplier);
    console.log(finalXP);

    let newXP = 0;
    let newLevel = 0;

    setStats(prev => {
      newXP = parseFloat(prev.xp) + finalXP;
      newLevel = prev.level;
      let xpNeeded = getXPNeeded(newLevel);

      while (newXP >= xpNeeded) {
        newXP -= xpNeeded;
        newLevel += 1;
        xpNeeded = getXPNeeded(newLevel);
      }

      updateXPInBackend(userId, newXP, newLevel, newStreak, todayStr);
      setStreak(newStreak);

      return {
        xp: newXP,
        level: newLevel,
      };
    });

    await checkAndUnlockStreakAchievements(newStreak);

    // After stats update, check achievements (if allowed)
    if (!skipAchievements) {
      await checkAndUnlockLevelAchievements(newLevel);
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

    } catch (err) {
      console.error("Failed to fetch XP or streak:", err.message);
    }
  };

  fetchXPAndStreak();
}, []);

  return (
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
              handleCreated={handleCreated}
              achievementsRef={achievementsRef}
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;