import { useEffect, useState } from "react";

function Achievements(props) {
    const [achievements, setAchievements] = useState([]);

    useEffect(() => {
        async function fetchAchievements() {
            try {
                const response = await fetch("http://localhost:5000/achievements");
                const data = await response.json();
                setAchievements(data);
            } catch (err) {
                console.error("Failed to fetch achievements:", err);
            }
        }

        fetchAchievements();
    }, []);

    const typeEmojis = {
        note: "📝",
        review: "📚",
        streak: "🔥",
        lvl: "⭐",
        share: "🤝",
        default: "🎖️"
    };


    return (
        <>
            <section className={`h-5/6 border-b-2 border-r-2 border-l-2 border-black w-2/3 place-self-center pr-2 pl-2 pb-2 rounded-b-xl bg-gradient-to-r from-red-500 to-purple-500 ${props.achievementsHidden}`}>
                <section className="border-black border-b border-r border-l bg-white rounded-b-xl h-96 flex flex-col gap-5 p-4">
                    <h2 className="text-3xl font-bold">Achievements</h2>
                    <section id="achievements-container" className="border-2 h-70 rounded-xl overflow-y-auto p-4 flex flex-col gap-2">
                        {achievements.length === 0 ? (
                            <p className="text-gray-500">No achievements to display yet.</p>
                        ) : (
                            achievements.map((ach) => (
                                <div key={ach.achievement_id} className="bg-gradient-to-r from-yellow-200 to-yellow-400 p-3 rounded-lg shadow-md flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-lg">{typeEmojis[ach.type]}{ach.name}</h3>
                                        <p className="text-sm">{ach.description}</p>
                                    </div>
                                    <span className="text-sm font-bold text-purple-700">+{ach.xp_reward} XP</span>
                                </div>
                            ))
                        )}
                    </section>
                </section>
            </section>
        </>
    );
}

export default Achievements;
