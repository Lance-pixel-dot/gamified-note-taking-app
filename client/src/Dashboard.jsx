import Header from "./Header";
import Nav from "./Nav";

function Dashboard({ xp, level, progress, incrementXP, streak, coins,  handleCreated, achievementsRef, updateCoinsInBackend, setCoins, multiplier, api }) {
  return (
    <>
      <Header xp={xp} level={level} progress={progress} streak={streak} coins={coins} multiplier={multiplier}/>
      <Nav incrementXP={incrementXP} handleCreated={handleCreated} achievementsRef={achievementsRef} updateCoinsInBackend={updateCoinsInBackend} userCoins={coins} setCoins={setCoins} api={api}/>
    </>
  );
}

export default Dashboard;
