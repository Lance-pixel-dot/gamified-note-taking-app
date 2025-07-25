import { useEffect, useRef, useState } from "react";
import { isSameDay, parseISO } from "date-fns";

function ReviewFlashcard({ flashcard, incrementXP, onCreated, updateCoinsInBackend }) {
  const dialogRef = useRef(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [display, setDisplay] = useState("hidden");

  const [isAllowed, setIsAllowed] = useState(true);
  const [hasGivenXP, setHasGivenXP] = useState(false);
  const user_id = localStorage.getItem("user_id");

  async function checkIfReviewed() {
    try {
      const res = await fetch(`http://localhost:5000/review_flashcards/can-review?user_id=${user_id}&flashcard_id=${flashcard.flashcard_id}`);
      const data = await res.json();
      setIsAllowed(data.canReview);
    } catch (err) {
      console.error("Failed to check review status", err);
    }
  }

  function reviewFlashcard() {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  }

  function emergencyClose() {
    if (dialogRef.current) {
      dialogRef.current.close();
      setIsFlipped(false);
      setDisplay("hidden");
    }
  }

async function handleReview(baseXP, difficulty) {
  if (isAllowed && !hasGivenXP && incrementXP) {
    const bonusXP = await markReviewed(difficulty); // now passes difficulty
    const totalXP = baseXP + bonusXP;

    incrementXP(totalXP);
    setHasGivenXP(true);
  }
}

async function markReviewed(difficulty) {
  try {
    const res = await fetch("http://localhost:5000/review_flashcards/mark-reviewed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id,
        flashcard_id: flashcard.flashcard_id,
        difficulty,
      }),
    });

    const data = await res.json();
    const newAchievements = data.newAchievements || [];

    const achievementXPMap = {
      8: 20,
      9: 70,
      4: 100,
      10: 100, // This is Easy!
    };

    let bonusXP = 0;
    for (const id of newAchievements) {
      if (achievementXPMap[id]) {
        bonusXP += achievementXPMap[id];
      }
    }

    if (typeof updateCoinsInBackend === "function" && newAchievements.length > 0) {
      await updateCoinsInBackend(user_id, newAchievements.length * 10);
    }

    updateCoinsInBackend(user_id, 2); // Add coins for reviewing a flashcard

    onCreated();
    return bonusXP;

  } catch (err) {
    console.error("Failed to mark flashcard as reviewed", err);
    return 0;
  }
}

  return (
    <>
      <button
        onClick={() => {
          reviewFlashcard();
          setDisplay("hidden");
          checkIfReviewed();
        }}
        className="border border-black rounded p-1 bg-blue-500 text-white ml-1"
      >
        Review
      </button>

      <dialog
        ref={dialogRef}
        className="place-self-center p-4 border border-black rounded-xl h-5/6 w-10/12"
      >
        <section className="flex flex-col justify-center items-center h-full gap-2">
          <h2 className="text-xl font-bold mb-2">{flashcard.title}</h2>
          <div
            className="w-80 h-48 perspective"
            onClick={() => {
              setIsFlipped((prev) => !prev);
              setDisplay("flex");
            }}
          >
            <div
              className={`relative w-full h-full duration-500 transform-style preserve-3d ${
                isFlipped ? "rotate-y-180" : ""
              }`}
            >
              {/* Front */}
              <div className="absolute w-full h-full bg-white border border-gray-300 rounded-xl shadow-md backface-hidden flex flex-col justify-center items-center p-4 text-center cursor-pointer">
                <h3>Question:</h3>
                <p className="text-gray-700 text-center">{flashcard.question}</p>
              </div>

              {/* Back */}
              <div className="absolute w-full h-full bg-blue-100 border border-blue-300 rounded-xl shadow-md backface-hidden rotate-y-180 flex flex-col text-center justify-center items-center p-4 cursor-pointer">
                <h3>Answer:</h3>
                <p className="text-lg font-semibold text-center">{flashcard.answer}</p>
              </div>
            </div>
          </div>

          <div className={`${display} flex-col gap-1 items-center`}>
            {!isAllowed ? (
              <div className="flex flex-col">
                <p className="text-red-500 text-sm mt-2">You’ve already reviewed this flashcard today.</p>
                <button className="border border-black p-2 rounded-xl text-white bg-green-500 font-bold" onClick={emergencyClose}>Ok</button>
              </div>
            ) : (
              <>
                <span>How well did you answer?</span>
                <section className="flex gap-2">
                  <button
                    className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
                    onClick={() => {
                      emergencyClose();
                      handleReview(5, "easy");  // <-- now sends "easy"
                      setIsAllowed(false);
                    }}
                  >
                    Easy
                  </button>
                  <button
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => {
                      emergencyClose();
                      handleReview(4, "good"); 
                      setIsAllowed(false);
                    }}
                  >
                    Good
                  </button>
                  <button
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
                    onClick={() => {
                      emergencyClose();
                      handleReview(3.5, "hard"); 
                      setIsAllowed(false);
                    }}
                  >
                    Hard
                  </button>
                </section>
              </>
            )}
          </div>
        </section>
      </dialog>
    </>
  );
}

export default ReviewFlashcard;
