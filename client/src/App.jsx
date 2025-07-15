import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import WelcomeScreen from "./WelcomeScreen";
import Dashboard from "./Dashboard"; // new component

function App() {
  const [xp, setXP] = useState(0);
  const [level, setLevel] = useState(1);

  function incrementXP(amount) {
    setXP(prev => {
      const totalXP = prev + amount;
      if (totalXP >= 100) {
        setLevel(lvl => lvl + 1);
        return totalXP - 100; // rollover
      }
      return totalXP;
    });
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route
          path="/Dashboard"
          element={<Dashboard xp={xp} level={level} incrementXP={incrementXP} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
