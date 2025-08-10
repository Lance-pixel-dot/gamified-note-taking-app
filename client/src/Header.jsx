import React, { useEffect } from "react";
import Nav from "./Nav";

function Header({ xp, level, progress, streak, coins }) {
  
  const Player = localStorage.getItem("username");

  return (
    <>
      <section className={`place-self-center p-3 bg-[var(--bg-color)] w-full h-30 mb-1`}>
        <div className="bg-[var(--accent-color)] h-full text-[var(--header-text-color)] border border-[var(--header-text-color)] p-2 rounded-lg flex flex-col gap-2 justify-between">
          <section className="flex justify-between font-bold items-center">
            <h1 className="text-xl">Welcome {Player}!</h1>
            <span className="text-xs">Coins {coins}</span>
          </section>
          <div>
            <section className="flex justify-between items-center font-bold text-xs">
              <span>Level {level}</span>
              <span>Streaks {streak}</span>
            </section>
            <div className="border border-black h-3 rounded-full bg-gray-300">
              <div
                className="bg-[#ffb13d] h-3 rounded-full transition-all duration-300 border-1 border-black ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default Header;
