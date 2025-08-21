import { useEffect, useState } from "react";

function LeaderBoard(props){

      const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetch(`${props.api}/leaderboard/level`) // adjust base URL if needed
      .then((res) => res.json())
      .then((data) => setLeaderboard(data))
      .catch((err) => console.error("Error fetching leaderboard:", err));
  }, []);

    return(
        <>
            <section className={`p-3 pt-0 bg-[var(--bg-color)] flash-container ${props.leaderboardHidden} lg:w-9/12 lg:place-self-end`}>
                            <section className="bg-[var(--accent-color)] rounded-b-xl h-full flex flex-col p-4 pt-0 border border-[var(--header-text-color)] border-t-0 lg:border-t lg:rounded-t-xl lg:h-full">
                                <section
                                    id="leaderboard-container"
                                    className="border-2 border-[var(--header-text-color)] flex-1 overflow-y-auto rounded-xl p-2 flex flex-col gap-2 items-stretch mt-1"
                                >
                                    {/* insert here! */}
                                    {leaderboard.length > 0 ? (
                                      leaderboard.map((player, index) => (
                                        <div
                                          key={player.user_id}
                                          className="flex justify-between items-center bg-[var(--bg-color)] border border-[var(--text-color)] rounded-lg p-3"
                                        >
                                          {/* Rank + Username */}
                                          <div className="flex items-center gap-3">
                                            <span className="font-bold text-lg">{index + 1}.</span>
                                            <span className="font-semibold">{player.username}</span>
                                          </div>
                                    
                                          {/* Stats */}
                                          <div className="text-sm text-[var(--text-color)] flex gap-4">
                                            <span>Lvl: {player.level}</span>
                                            <span>XP: {player.xp}</span>
                                            <span>Streak: {player.streak_count}🔥</span>
                                            <span>Read Notes: {player.total_read_notes}</span>
                                            <span>Reviewed Flashcards: {player.total_reviewed_flashcards}</span>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <p className="text-center text-[var(--text-color)]">No players yet.</p>
                                    )}
                                </section>
                            </section>
                        </section>
        </>
    );
}

export default LeaderBoard;