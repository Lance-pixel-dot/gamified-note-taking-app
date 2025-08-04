import { useEffect, useState, forwardRef, useImperativeHandle } from "react";

const Achievements = forwardRef(function Achievements(props, ref) {
  const [achievements, setAchievements] = useState([]);

  async function fetchAchievements() {
    try {
      const userId = localStorage.getItem("user_id");
      const response = await fetch(`http://localhost:5000/achievements/user/${userId}`);
      const data = await response.json();
      setAchievements(data);
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
    note: "📝",
    flashcard: "📚",
    streak: "🔥",
    lvl: "⭐",
    share: "🤝",
    default: "🎖️",
  };

  return (
    <section className={`p-3 pt-0 bg-[#1800ad] flash-container ${props.achievementsHidden}`}>
      <section className="bg-white rounded-b-xl h-5/6 flex flex-col p-4 pt-0">
        <section id="achievements-container" className="border-2 flex-1 overflow-y-auto rounded-xl p-2 flex flex-col gap-2 items-stretch mt-1">
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
                  <h3 className="font-semibold text-sm">
                    {typeEmojis[ach.type] || typeEmojis.default} {ach.name}
                  </h3>
                  <p className="text-xs">{ach.description}</p>
                </div>
                <span className={`text-xs font-bold w-5/12 text-end ${isUnlocked ? 'text-purple-700' : 'text-gray-500'}`}>
                  {isUnlocked ? `+${ach.xp_reward} XP` : "🔒Locked"}
                </span>
              </div>
            );
          })}
        </section>
      </section>
    </section>
  );
});

export default Achievements;
