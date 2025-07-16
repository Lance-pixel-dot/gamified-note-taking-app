import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomeScreen from "./WelcomeScreen";
import Dashboard from "./Dashboard";

// XP needed per level: 100 + 50 * (level - 1)
function getXPNeeded(level) {
  return 100 + (level - 1) * 1000; // e.g., Level 1 = 100, Level 2 = 150, Level 3 = 200,
}

function App() {
  const [stats, setStats] = useState({
    xp: 0,
    level: 1
  });

  function incrementXP(amount) {
    setStats(prev => {
      let newXP = prev.xp + amount;
      let newLevel = prev.level;
      let xpNeeded = getXPNeeded(newLevel);

      while (newXP >= xpNeeded) {
        newXP -= xpNeeded;
        newLevel += 1;
        xpNeeded = getXPNeeded(newLevel);
      }

      return {
        xp: newXP,
        level: newLevel
      };
    });
  }

  const xpNeeded = getXPNeeded(stats.level);
  const progress = Math.floor((stats.xp / xpNeeded) * 100);

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
