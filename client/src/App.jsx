import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomeScreen from "./WelcomeScreen";
import Dashboard from "./Dashboard";

// XP needed per level: 100 + 50 * (level - 1)
function getXPNeeded(level) {
  return 100 + (level - 1) * 50; // e.g., Level 1 = 100, Level 2 = 150, Level 3 = 200...,
}

function App() {
  const [stats, setStats] = useState({
    xp: 0,
    level: 1
  });

function incrementXP(amount) {
  setStats(prev => {
    const currentXP = parseFloat(prev.xp);           // Ensure numeric
    const gainedXP = parseFloat(amount);             // Ensure numeric
    let newXP = currentXP + gainedXP;

    let newLevel = parseInt(prev.level);             // Ensure integer
    let xpNeeded = getXPNeeded(newLevel);

    while (newXP >= xpNeeded) {
      newXP -= xpNeeded;
      newLevel += 1;
      xpNeeded = getXPNeeded(newLevel);
    }

    // Get userId from localStorage or props/context
    const userId = localStorage.getItem("user_id"); // Or use props.userId if passed
    updateXPInBackend(userId, newXP, newLevel);

    return {
      xp: newXP,
      level: newLevel
    };
  });
}

  const xpNeeded = getXPNeeded(stats.level);
  const progress = Math.floor((stats.xp / xpNeeded) * 100);

const updateXPInBackend = async (userId, xp, level) => {
  try {
    // Force numeric conversion
    const xpNumber = parseFloat(xp);
    const levelNumber = parseInt(level);

    const response = await fetch(`http://localhost:5000/users/${userId}/xp`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ xp: xpNumber, level: levelNumber }),
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
      const res = await fetch(`http://localhost:5000/users/${user_id}`);
      const data = await res.json();
      setStats({ xp: data.xp, level: data.level });
    } catch (err) {
      console.error("Failed to fetch XP and level:", err.message);
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
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
