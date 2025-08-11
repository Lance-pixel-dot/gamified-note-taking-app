import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { isSameDay, parseISO } from "date-fns";

const ReviewFlashcard = forwardRef(function ReviewFlashcard({ flashcard, incrementXP, onCreated, updateCoinsInBackend, markFlashcardAsRead }, ref) {
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
    if (dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }

 function emergencyClose() {
  if (dialogRef.current?.open) {
    dialogRef.current.close();
    setIsFlipped(false)
    setDisplay("hidden");
  }
}

async function handleReview(baseXP, difficulty) {
  if (isAllowed && !hasGivenXP && incrementXP) {
    const bonusXP = await markReviewed(difficulty); 
    const totalXP = baseXP + bonusXP;

    incrementXP(totalXP);
    setHasGivenXP(true);
    markFlashcardAsRead(flashcard.flashcard_id);
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
      10: 100, 
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

    updateCoinsInBackend(user_id, 2); 

    onCreated();
    return bonusXP;

  } catch (err) {
    console.error("Failed to mark flashcard as reviewed", err);
    return 0;
  }
}

const [card, setCard] = useState(null); 

useImperativeHandle(ref, () => ({
  open: (flashcard) => {
    setCard(flashcard);
    checkIfReviewed(flashcard.flashcard_id);
    dialogRef.current?.showModal();
  },
}));

  useEffect(() => {
  window.dialogRef = dialogRef.current;
}, []);

  return (
    <>
      <button
        onClick={() => {
          reviewFlashcard();
          setDisplay("hidden");
          checkIfReviewed();
        }}
        className="border border-black rounded p-1 bg-blue-500 text-white ml-1 hidden"
      >
        Review
      </button>

      <dialog
        ref={dialogRef}
        className="place-self-center p-4 border border-[var(--text-color)] bg-[var(--bg-color)] text-[var(--text-color)] rounded-xl h-5/6 w-10/12"
      >
        <section className="flex flex-col justify-center items-center h-full gap-2 ">
          <h2 className="text-xl font-bold mb-2">{card?.title}</h2>
          <div
            className="w-60 h-48 perspective"
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
              <div className="absolute w-full h-full bg-white border text-black border-gray-300 rounded-xl shadow-md backface-hidden flex flex-col justify-center items-center p-4 text-center cursor-pointer">
                <h3>Question:</h3>
                <p className="text-gray-700 text-center">{card?.question}</p>
              </div>

              {/* Back */}
              <div className="absolute w-full h-full bg-blue-100 border text-black border-blue-300 rounded-xl shadow-md backface-hidden rotate-y-180 flex flex-col text-center justify-center items-center p-4 cursor-pointer">
                <h3>Answer:</h3>
                <p className="text-lg font-semibold text-center">{card?.answer}</p>
              </div>
            </div>
          </div>

          <div className={`${display} flex-col gap-1 items-center`}>
            {!isAllowed ? (
              <div className="flex flex-col gap-4 text-center">
                <p className="text-sm mt-2">You’ve already reviewed this flashcard today. Review this again tomorrow to earn xp and coins!</p>
                <button className="border border-black p-2 rounded-xl text-[var(--button-text-color)] bg-[var(--button-bg-color)] font-bold" onClick={() => {
                    setTimeout(() => {
                      emergencyClose();
                    }, 0);
                  }}>Ok</button>
              </div>
            ) : (
              <>
                <span>How well did you answer?</span>
                <section className="flex gap-2">
                  <button
                    className="mt-4 bg-green-500 text-white px-4 py-2 rounded border-1 border-black"
                    onClick={async () => {
                      await handleReview(5, "easy");
                      emergencyClose();
                      setIsAllowed(false);
                    }}
                  >
                    Easy
                  </button>
                  <button
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded border-1 border-black"
                    onClick={async () => {
                      await handleReview(4, "good"); 
                      emergencyClose();
                      setIsAllowed(false);
                    }}
                  >
                    Good
                  </button>
                  <button
                    className="mt-4 bg-red-500 text-white px-4 py-2 rounded border-1 border-black"
                    onClick={async () => {
                      await handleReview(3.5, "hard"); 
                      emergencyClose();
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
})

export default ReviewFlashcard;
