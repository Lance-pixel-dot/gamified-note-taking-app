import { useState, useEffect } from "react";
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

  const [streak, setStreak] = useState(0); // Make streak reactive

  async function incrementXP(baseAmount) {
    const userId = localStorage.getItem("user_id");
    const todayStr = format(new Date(), "yyyy-MM-dd");
    
    try {
      const res = await fetch(`http://localhost:5000/users/${userId}/streak`);
      const data = await res.json();

      const lastActiveDate = data.last_active ? parseISO(data.last_active) : null;
      let newStreak = data.streak_count || 0;

      if (isYesterday(lastActiveDate)) {
        newStreak += 1; // Continue streak
      } else if(isToday(lastActiveDate)) {
        newStreak += 0; // don't decrement or increment if the user is active today  
      }
      else {
        newStreak = 0; // Reset streak
      }

      const multiplier = 1.3 + 0.3 * (newStreak - 1);
      const finalXP = baseAmount * multiplier;

      console.log(baseAmount);
      console.log(multiplier);
      console.log(finalXP); 

      setStats(prev => {
        let newXP = parseFloat(prev.xp) + finalXP;
        let newLevel = prev.level;
        let xpNeeded = getXPNeeded(newLevel);

        while (newXP >= xpNeeded) {
          newXP -= xpNeeded;
          newLevel += 1;
          xpNeeded = getXPNeeded(newLevel);
        }

        updateXPInBackend(userId, newXP, newLevel, newStreak, todayStr);
        setStreak(newStreak); // update streak state

        return {
          xp: newXP,
          level: newLevel
        };
      });

    } catch (err) {
      console.error("Failed to increment XP with streak:", err.message);
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
    const fetchXP = async () => {
      const user_id = localStorage.getItem("user_id");
      try {
        const res1 = await fetch(`http://localhost:5000/users/${user_id}`);
        const data1 = await res1.json();
        setStats({ xp: data1.xp, level: data1.level });

        const res2 = await fetch(`http://localhost:5000/users/${user_id}/streak`);
        const data2 = await res2.json();
        setStreak(data2.streak_count || 0); // Fetch and set streak initially

      } catch (err) {
        console.error("Failed to fetch XP or streak:", err.message);
      }
    };

    fetchXP();
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
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
