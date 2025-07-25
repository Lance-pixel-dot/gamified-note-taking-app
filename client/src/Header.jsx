import Nav from "./Nav";

function Header({ xp, level, progress, streak, coins }) {
  
  const Player = localStorage.getItem("username");

  return (
    <>
      <section className={`w-2/3 place-self-center p-4 flex flex-col gap-1 text-white bg-gradient-to-r from-red-500  to-purple-500 rounded-xl border-2 border-black`}>
        <section className="flex justify-between">
          <h1>Welcome {Player}</h1>
          <span>Coins {coins}</span>
        </section>
        <section className="flex justify-between">
          <span>Level {level}</span>
          <span>Streaks {streak}</span>
        </section>
        <div className="border border-black h-4 rounded-full bg-gray-300">
          <div
            className="bg-blue-500 h-4 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </section>
    </>
  );
}

export default Header;
