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
    <section className={`h-5/6 border-b-2 border-r-2 border-l-2 border-black w-2/3 place-self-center pr-2 pl-2 pb-2 rounded-b-xl bg-gradient-to-r from-red-500 to-purple-500 ${props.achievementsHidden}`}>
      <section className="border-black border-b border-r border-l bg-white rounded-b-xl h-96 flex flex-col gap-5 p-4">
        <h2 className="text-3xl font-bold">Achievements</h2>
        <section id="achievements-container" className="border-2 h-70 rounded-xl overflow-y-auto p-4 flex flex-col gap-2">
          {achievements.map((ach) => {
            const isUnlocked = ach.unlocked;
            return (
              <div
                key={ach.achievement_id}
                className={
                  isUnlocked
                    ? "bg-gradient-to-r from-yellow-200 to-yellow-400 p-3 rounded-lg shadow-md flex items-center justify-between"
                    : "bg-gray-300 opacity-50 p-3 rounded-lg shadow-inner flex items-center justify-between"
                }
              >
                <div>
                  <h3 className="font-semibold text-lg">
                    {typeEmojis[ach.type] || typeEmojis.default} {ach.name}
                  </h3>
                  <p className="text-sm">{ach.description}</p>
                </div>
                <span className={`text-sm font-bold ${isUnlocked ? 'text-purple-700' : 'text-gray-500'}`}>
                  {isUnlocked ? `+${ach.xp_reward} XP` : "🔒 Locked"}
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
