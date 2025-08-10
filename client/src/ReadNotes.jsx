import { useRef, useState, useImperativeHandle, forwardRef } from "react";

const ReadNotes = forwardRef(({ note, userId, incrementXP, onCreated, updateCoinsInBackend, markNoteAsRead }, ref) => {
  const dialogRef = useRef(null);
  const [isRead, setIsRead] = useState(false);
  const [hasCheckedRead, setHasCheckedRead] = useState(false);

  const user_id = localStorage.getItem("user_id");

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

  useImperativeHandle(ref, () => ({
    open: () => {
      checkIfReadToday();
      dialogRef.current?.showModal();
    },
  }));

  function closeDialog() {
    dialogRef.current?.close();
  }

  async function handleRead() {
    if (!isRead && incrementXP) {
      try {
        const response = await fetch("http://localhost:5000/read_notes/mark-read", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id, note_id: note.note_id }),
        });

        const data = await response.json();

        let totalXP = 3.5;
        let coinsToAdd = 2;

        const achievementXPMap = {
          11: 10,  // First read
          13: 30,  // Read 10 notes
          14: 70   // Read 50 notes
        };

        if (data.newAchievements && Array.isArray(data.newAchievements)) {
          data.newAchievements.forEach(id => {
            totalXP += achievementXPMap[id] || 0;
            coinsToAdd += 10;
          });
        }

        if (updateCoinsInBackend) {
          await updateCoinsInBackend(user_id, coinsToAdd);
        }

        incrementXP(totalXP);
        setIsRead(true);
        markNoteAsRead(note.note_id);
        onCreated();
      } catch (err) {
        console.error("Failed to mark read", err);
      }
    }
  }

  return (
    <>
      <dialog
        ref={dialogRef}
        className="place-self-center p-4 border border-[var(--text-color)] bg-[var(--bg-color)] text-[var(--text-color)] rounded-xl h-5/6 w-10/12"
      >
        <section className="flex flex-col justify-between h-full gap-4">
          <h1 className="text-lg font-bold">{note.title}</h1>
          <span className="text-sm italic">Tag: {note.tag}</span>
          <p className="border border-[var(--text-color)] rounded p-2 break-words h-4/5 text-xs">
            {note.content}
          </p>
          <span className="text-[var(--text-color)] text-xs" >{isRead ? "Read this again tomorrow to earn xp and coins!" : ""}</span>
          <button
            className="border border-black p-2 rounded-xl text-[var(--button-text-color)] bg-[var(--button-bg-color)] font-bold text-sm"
            onClick={async () => {
              await handleRead(); 
              closeDialog(); 
            }}
            disabled={!hasCheckedRead}
          >
            {isRead ? "Ok" : "Done +3.5xp +2coins"}
          </button>
        </section>
      </dialog>
    </>
  );
});

export default ReadNotes;
