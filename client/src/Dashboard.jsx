import Header from "./Header";
import Nav from "./Nav";

function Dashboard({ xp, level, incrementXP }) {
  return (
    <>
      <Header xp={xp} level={level} />
      <Nav incrementXP={incrementXP} />
    </>
  );
}

export default Dashboard;
