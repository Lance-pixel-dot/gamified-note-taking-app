import { useRef, useState } from "react";

function ReadNotes({ note, incrementXP }) {
  const dialogRef = useRef(null); //  Create the ref

  function openDialog() {
    dialogRef.current?.showModal(); //  Use the ref to show dialog
  }

  function closeDialog() {
    dialogRef.current?.close(); //  Use the ref to close dialog
  }

  const [isRead, setIsRead] = useState(false);
  const [hasGivenXP, setHasGivenXP] = useState(false); // to prevent multiple XP gains

  function handleRead() {
    // setIsRead(!isRead)
    // Give XP only once per session per note
    // if (!hasGivenXP && incrementXP) {
        incrementXP(30); // XP for reading
        setHasGivenXP(true);
  // }
  }

  return (
    <>
      <button
        onClick={openDialog}
        className="border border-black rounded p-1 bg-blue-500 text-white ml-1"
      >
        Read
      </button>

      <dialog
        ref={dialogRef} //  Attach ref to dialog
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
              }
            }
          >
           {isRead ? "Read this tomorrow bitch!" : "Done"}
          </button>
        </section>
      </dialog>
    </>
  );
}

export default ReadNotes;
