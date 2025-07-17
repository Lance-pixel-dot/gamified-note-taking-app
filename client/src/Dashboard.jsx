import Header from "./Header";
import Nav from "./Nav";

function Dashboard({ xp, level, progress, incrementXP, streak }) {
  return (
    <>
      <Header xp={xp} level={level} progress={progress} streak={streak}/>
      <Nav incrementXP={incrementXP} />
    </>
  );
}

export default Dashboard;
