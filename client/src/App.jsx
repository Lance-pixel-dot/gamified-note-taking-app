import Header from "./Header"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomeScreen from "./WelcomeScreen"

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/Dashboard" element={<Header />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
