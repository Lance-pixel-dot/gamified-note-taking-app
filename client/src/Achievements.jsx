import { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react";
import Icon from '@mdi/react';
import { mdiNoteText } from '@mdi/js';
import { mdiCardMultiple } from '@mdi/js';
import { mdiTrophy } from '@mdi/js';
import { mdiTrophyAward } from '@mdi/js';
import { mdiFire } from '@mdi/js';
import { mdiHandshake } from '@mdi/js';
import { mdiLock } from '@mdi/js';

const Achievements = forwardRef(function Achievements(props, ref) {
  const [achievements, setAchievements] = useState([]);
  const [achievementMessage, setAchievementMessage] = useState(null);
  const [showToast, setShowToast] = useState(false);

  const prevUnlockedRef = useRef([]);
  const firstFetchDone = useRef(false); 

  async function fetchAchievements() {
    try {
      const userId = localStorage.getItem("user_id");
      const response = await fetch(`${props.api}/achievements/user/${userId}`);
      const data = await response.json();

      const prevUnlockedIds = prevUnlockedRef.current;
      const newlyUnlocked = data.filter(
        (ach) => ach.unlocked && !prevUnlockedIds.includes(ach.achievement_id)
      );

      //  Skip toasting on the first fetch (initial page load)
      if (firstFetchDone.current && newlyUnlocked.length > 0) {
        const firstNew = newlyUnlocked[0];
        setAchievementMessage(`${firstNew.name} unlocked! +${firstNew.xp_reward} XP`);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      }

      // Update state + refs
      setAchievements(data);
      prevUnlockedRef.current = data.filter((a) => a.unlocked).map((a) => a.achievement_id);
      firstFetchDone.current = true; 
    } catch (err) {
      console.error("Failed to fetch achievements:", err);
    }
  }

  useEffect(() => {
    fetchAchievements();
  }, []);

  useImperativeHandle(ref, () => ({
    refreshAchievements: fetchAchievements,
  }));

  const typeEmojis = {
    note: <Icon path={mdiNoteText} size={1} />,
    flashcard: <Icon path={mdiCardMultiple} size={1} />,
    streak: <Icon path={mdiFire} size={1} />,
    lvl: <Icon path={mdiTrophyAward} size={1} />,
    share: <Icon path={mdiHandshake} size={1} />,
    default: <Icon path={mdiTrophy} size={1} />,
  };

  return (
    <>
      {/*  Bottom-right toast */}
      {showToast && (
        <div className="fixed text-xs bottom-4 right-4 z-50 bg-[var(--bg-color)] border border-black-500 border-[var(--header-text-color)] text-[var(--text-color)] px-4 py-2 rounded-xl shadow-lg animate-slide-in">
          🏆 {achievementMessage} +10 coins!
        </div>
      )}

      <section className={`p-3 pt-0 bg-[var(--bg-color)] flash-container ${props.achievementsHidden}`}>
        <section className="bg-[var(--accent-color)] rounded-b-xl h-5/6 flex flex-col p-4 pt-0 border border-[var(--header-text-color)] border-t-0">
          <section
            id="achievements-container"
            className="border-2 border-[var(--header-text-color)] flex-1 overflow-y-auto rounded-xl p-2 flex flex-col gap-2 items-stretch mt-1"
          >
            {achievements.map((ach) => {
              const isUnlocked = ach.unlocked;
              return (
                <div
                  key={ach.achievement_id}
                  className={
                    isUnlocked
                      ? "bg-gradient-to-r from-yellow-200 to-yellow-400 p-2 rounded-lg shadow-md flex items-center justify-between"
                      : "bg-gray-300 opacity-50 p-2 rounded-lg shadow-inner flex items-center justify-between"
                  }
                >
                  <div>
                    <h3 className="font-semibold text-sm flex gap-2">
                      {typeEmojis[ach.type] || typeEmojis.default} {ach.name}
                    </h3>
                    <p className="text-xs">{ach.description}</p>
                  </div>
                  <span
                    className={`text-xs font-bold w-5/12 text-end flex items-center justify-end ${
                      isUnlocked ? "text-purple-700" : "text-gray-500"
                    }`}
                  >
                    {isUnlocked ? "" : <Icon path={mdiLock} size={1} />}
                    {isUnlocked ? `+${ach.xp_reward} XP` : "Locked"}
                  </span>
                </div>
              );
            })}
          </section>
        </section>
      </section>
    </>
  );
});

export default Achievements;
