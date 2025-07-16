import Header from "./Header";
import Nav from "./Nav";

function Dashboard({ xp, level, progress, incrementXP }) {
  return (
    <>
      <Header xp={xp} level={level} progress={progress} />
      <Nav incrementXP={incrementXP} />
    </>
  );
}

export default Dashboard;
