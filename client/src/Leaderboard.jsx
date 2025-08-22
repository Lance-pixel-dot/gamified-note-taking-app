import { useEffect, useState } from "react";
import Icon from "@mdi/react";
import { mdiTrophy, mdiTrophyAward, mdiMedal, mdiNoteText, mdiCardMultiple, mdiFire, mdiStar } from "@mdi/js";

function LeaderBoard(props) {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetch(`${props.api}/leaderboard/level`)
      .then((res) => res.json())
      .then((data) => setLeaderboard(data))
      .catch((err) => console.error("Error fetching leaderboard:", err));
  }, []);

  // Style helper
  const getRankStyle = (index) => {
    switch (index) {
      case 0: return "bg-gradient-to-r from-yellow-300 to-yellow-500 text-black font-bold"; // 1st
      case 1: return "bg-gradient-to-r from-gray-200 to-gray-400 text-black font-bold"; // 2nd
      case 2: return "bg-gradient-to-r from-amber-600 to-amber-800 text-white font-bold"; // 3rd
      default: return "bg-[var(--bg-color)] text-[var(--text-color)]";
    }
  };

  // Icon helper
  const getRankIcon = (index) => {
    switch (index) {
      case 0: return mdiTrophy;
      case 1: return mdiTrophyAward;
      case 2: return mdiMedal;
      default: return null;
    }
  };

  return (
    <>
      <section className={`p-3 pt-0 bg-[var(--bg-color)] flash-container ${props.leaderboardHidden} lg:w-9/12 lg:place-self-end`}>
        <section className="bg-[var(--accent-color)] rounded-b-xl h-full flex flex-col p-4 pt-0 border border-[var(--header-text-color)] border-t-0 lg:border-t lg:rounded-t-xl lg:h-full">
          <section id="leaderboard-container" className="border-2 border-[var(--header-text-color)] flex-1 overflow-y-auto rounded-xl p-2 flex flex-col gap-2 items-stretch mt-1">
            
            {leaderboard.map((user, index) => (
              <div key={user.user_id} className={`p-3 rounded-xl flex justify-between items-center ${getRankStyle(index)} border border-[var(--header-text-color)]`}>
                <div className="flex items-center gap-2 w-full justify-between">
                  
                  {/* User Info & Stats */}
                  <div className="flex flex-col gap-1">
                    <span className="font-extrabold text-lg md:text-xl">{user.username}</span>
                    <span className="text-base font-bold md:text-lg">Level {user.level}</span>
                    
                    <span className="text-xs font-mono flex gap-1 items-center md:text-base">
                      <Icon path={mdiNoteText} size={1} /> {user.total_read_notes} notes read
                    </span>
                    <span className="text-xs font-mono flex gap-1 items-center md:text-base">
                      <Icon path={mdiCardMultiple} size={1} /> {user.total_reviewed_flashcards} flashcards reviewed
                    </span>
                    <span className="text-xs font-mono flex gap-1 items-center md:text-base">
                      <Icon path={mdiFire} size={1} /> {user.streak_count} day streak
                    </span>
                    <span className="text-xs font-mono flex gap-1 items-center md:text-base">
                      <Icon path={mdiStar} size={1} /> {user.total_achievements} achievements unlocked
                    </span>
                  </div>

                  {/* Rank Icon */}
                  {getRankIcon(index) && <Icon path={getRankIcon(index)} size={1.5} />}
                </div>
              </div>
            ))}

          </section>
        </section>
      </section>

      <dialog id="new-note" className="place-self-center p-4 bg-[var(--bg-color)] text-[var(--text-color)] border border-[var(--text-color)] rounded-xl h-5/6 w-10/12"></dialog>
    </>
  );
}

export default LeaderBoard;
