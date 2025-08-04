import { useRef, useState, useEffect } from "react";

function ReadNotes({ note, userId, incrementXP, onCreated, updateCoinsInBackend }) {
  const dialogRef = useRef(null);
  const [isRead, setIsRead] = useState(false);
  const [hasCheckedRead, setHasCheckedRead] = useState(false);

  const user_id = localStorage.getItem("user_id");

  // Check if the note was already read today
    async function checkIfReadToday() {
      try {
        const res = await fetch(`http://localhost:5000/read_notes/can-read-note?user_id=${user_id}&note_id=${note.note_id}`);
        const data = await res.json();
        setIsRead(!data.canRead);
        setHasCheckedRead(true);
      } catch (err) {
        console.error("Failed to check read status", err);
      }
    }

  function openDialog() {
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  async function handleRead() {
  if (!isRead && incrementXP) {
    try {
      const response = await fetch("http://localhost:5000/read_notes/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user_id, note_id: note.note_id })
      });

      const data = await response.json();

      // Base XP for reading a note
      let totalXP = 3.5;

      // Bonus XP for unlocking reading achievements
      const achievementXPMap = {
        11: 10,  // First read
        13: 30,  // Read 10 notes
        14: 70   // Read 50 notes
      };

      let coinsToAdd = 2;

      if (data.newAchievements && Array.isArray(data.newAchievements)) {
        data.newAchievements.forEach(id => {
          if (achievementXPMap[id]) {
            totalXP += achievementXPMap[id];
            coinsToAdd += 10;
          }
        });
      }

      if (updateCoinsInBackend) {
          await updateCoinsInBackend(user_id, coinsToAdd);
      }

      incrementXP(totalXP);  // Apply XP
      setIsRead(true);
      onCreated();
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  }
}

  return (
    <>
      <button
        onClick={() => {openDialog(); checkIfReadToday()}}
        className="border border-black rounded p-1 bg-blue-500 text-white ml-1 hidden"
      >
        Read
      </button>

      <dialog
        ref={dialogRef}
        className="place-self-center p-4 border border-black rounded-xl h-5/6 w-10/12"
      >
        <section className="flex flex-col justify-between h-full">
          <h1 className="text-xl font-bold">{note.title}</h1>
          <span>Tag: {note.tag}</span>
          <p className="border border-black rounded p-2 break-words h-4/5">
            {note.content}
          </p>
          <button
            className="border border-black p-2 rounded-xl text-white bg-green-500 font-bold"
            onClick={() => {
              closeDialog();
              handleRead();
            }}
            disabled={!hasCheckedRead}
          >
            {isRead ? "Read this tomorrow!" : "Done"}
          </button>
        </section>
      </dialog>
    </>
  );
}

export default ReadNotes;
