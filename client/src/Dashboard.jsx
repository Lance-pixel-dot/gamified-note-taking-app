import Header from "./Header";
import Nav from "./Nav";

function Dashboard({ xp, level, progress, incrementXP, streak, handleCreated, achievementsRef }) {
  return (
    <>
      <Header xp={xp} level={level} progress={progress} streak={streak}/>
      <Nav incrementXP={incrementXP} handleCreated={handleCreated} achievementsRef={achievementsRef}  />
    </>
  );
}

export default Dashboard;
