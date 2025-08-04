import { useEffect, useState } from "react";
import ReadNotes from "./ReadNotes";
import EditNote from "./EditNotes";

function ShareNotes(props){

    function openShare(){
        const dialog = document.querySelector("#share-dialog");
        displayNotes();
        dialog.showModal();
    }

    function cancelShare(){
        const dialog = document.querySelector("#share-dialog");
        dialog.close();
    }

    const user_id = localStorage.getItem("user_id");

    const [notes, setNotes] = useState([]);
    const [users, setUsers] = useState([]);
    const [sharedNoteID, setSharedNoteID] = useState("");
    const [sharedUsersByNote, setSharedUsersByNote] = useState({});
    const [sharedNotesWithOthers, setSharedNotesWithOthers] = useState([]);
    const [sharedNotesWithMe, setSharedNotesWithMe] = useState([]);

    async function displayNotes(){
        try {
            const response = await fetch(`http://localhost:5000/notes/user/${user_id}`);
            const jsonData = await response.json();
            setNotes(jsonData);
            jsonData.forEach(note => {
                fetchSharedUsers(note.note_id);
            });
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        displayNotes();
    }, []);

    function openUsers(){
        const dialog = document.querySelector("#users-dialog");
        const dialogShare = document.querySelector("#share-dialog");
        dialog.showModal();
        dialogShare.close();
    }

    function closeUsers(){
        const dialog = document.querySelector("#users-dialog");
        const dialogShare = document.querySelector("#share-dialog");
        dialog.close();
        dialogShare.showModal();
    }

    async function displayUsers(){
        try {
            const response = await fetch(`http://localhost:5000/users`);
            const jsonData = await response.json();
            setUsers(jsonData);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        displayUsers();
    }, []);

    async function fetchSharedUsers(note_id) {
        try {
            const res = await fetch(`http://localhost:5000/shared_notes/${note_id}`);
            if (!res.ok) throw new Error("Failed to fetch shared users");
            const data = await res.json();
            setSharedUsersByNote(prev => ({
                ...prev,
                [note_id]: data.map(user => ({
                    shared_user_id: user.shared_user_id,
                    permission: user.permission
                }))
            }));
        } catch (err) {
            console.error(err.message);
        }
    }

    async function fetchSharedNotesWithOthers() {
        try {
            const res = await fetch(`http://localhost:5000/shared_notes/shared/by_me/${user_id}`);
            const data = await res.json();
            setSharedNotesWithOthers(data);
        } catch (err) {
            console.error(err);
        }
    }

    async function fetchSharedNotesWithMe() {
        try {
            const res = await fetch(`http://localhost:5000/shared_notes/with_me/${user_id}`);
            const data = await res.json();
            setSharedNotesWithMe(data);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        fetchSharedNotesWithOthers();
        fetchSharedNotesWithMe();

        const handleNoteUpdate = () => {
            fetchSharedNotesWithMe();
            fetchSharedNotesWithOthers();
        };

        window.addEventListener("noteUpdated", handleNoteUpdate);
        window.addEventListener("noteDeleted", handleNoteUpdate);

        return () => {
            window.removeEventListener("noteUpdated", handleNoteUpdate);
            window.removeEventListener("noteDeleted", handleNoteUpdate);
        };
    }, []);

async function saveSharedNote(note_id, shared_user_id, permission = "view") {
  try {
    const body = { note_id, shared_user_id, permission };
    const response = await fetch("http://localhost:5000/shared_notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      //  Check if user already unlocked "Help a Friend" (achievement_id: 15)
      const checkRes = await fetch(`http://localhost:5000/achievements/has-helped-friend?user_id=${user_id}`);
      const checkData = await checkRes.json();

      if (!checkData.hasAchievement) {
        //  Unlock achievement and grant XP
        const achievementXp = 70; // or fetch from backend if needed
        if (props.incrementXP) props.incrementXP(achievementXp);
        if (props.updateCoinsInBackend) props.updateCoinsInBackend(user_id, 20);

        await fetch("http://localhost:5000/achievements/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id,
            achievement_id: 15,
          }),
        });
      }

      props.onCreated();

      setSharedUsersByNote((prev) => {
        const current = prev[note_id] || [];
        const existingIndex = current.findIndex(u => u.shared_user_id === shared_user_id);
        let updated;

        if (existingIndex !== -1) {
          updated = [...current];
          updated[existingIndex] = { shared_user_id, permission };
        } else {
          updated = [...current, { shared_user_id, permission }];
        }

        return {
          ...prev,
          [note_id]: updated
        };
      });

      await fetchSharedNotesWithMe();
      await fetchSharedNotesWithOthers();
      window.dispatchEvent(new CustomEvent("noteUpdated"));
    }
  } catch (err) {
    console.error(err.message);
  }
}

    async function unshareNote(note_id, shared_user_id) {
        try {
            const response = await fetch("http://localhost:5000/shared_notes", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note_id, shared_user_id })
            });

            if (response.ok) {
            setSharedUsersByNote((prev) => {
            const updated = (prev[note_id] || []).filter(entry => entry.shared_user_id !== shared_user_id);
        
            // Update state and return
            const newState = {
            ...prev,
            [note_id]: updated
            };

        return newState;
    });

    // Update displayed notes
    await fetchSharedNotesWithMe();
    await fetchSharedNotesWithOthers();
    window.dispatchEvent(new CustomEvent("noteUpdated"));
            }
        } catch (err) {
            console.error(err.message);
        }
    }

    const mergedNotes = [...sharedNotesWithOthers, ...sharedNotesWithMe];
    const uniqueNotesMap = new Map();
    mergedNotes.forEach(note => {
        if (!uniqueNotesMap.has(note.note_id)) {
            uniqueNotesMap.set(note.note_id, note);
        }
    });
    const uniqueNotes = Array.from(uniqueNotesMap.values()).filter(note => {
    // If I am the owner, only show if there are still users shared with
    if (note.user_id == user_id) {
        return (sharedUsersByNote[note.note_id] || []).length > 0;
    }
    return true; // Notes shared *with* me should always be shown
    });

    const [sharedUsers, setSharedUsers] = useState([]);

    return(
        <>
            <section className={`p-3 pt-0 bg-[#1800ad] flash-container ${props.shareNotesHidden}`}>
                <section className="bg-white rounded-b-xl h-5/6 flex flex-col p-4 pt-0">
                    <section className="flex h-10 gap-2 items-center">
                        <input id="search" className="border border-black rounded-xl h-7 w-full"></input>
                    </section>
                    <section id="note-container" className="border-2 flex-1 overflow-y-auto rounded-xl p-4 flex flex-col gap-2 items-stretch">
                        {uniqueNotes.map(note => {
                            const isOwner = note.user_id == user_id;
                            const sharedWithMePermission = !isOwner ? note.permission : null; // From sharedNotesWithMe

                            return (
                                <div key={note.note_id} className="border p-2 rounded flex">
                                    <div className="w-full">
                                        <h2 className="font-bold">{note.title}</h2>
                                        <span className="text-sm text-gray-600 italic">Tag: {note.tag}</span>
                                        <p className="text-sm text-gray-600 italic">
                                            {isOwner
                                                ? `Shared with: ${sharedUsersByNote[note.note_id]?.map(entry => {
                                                    const user = users.find(u => u.user_id === entry.shared_user_id);
                                                    return user ? `${user.username} (${entry.permission})` : "Unknown";
                                                }).join(", ") || "None"}`
                                                : `Owner: ${note.owner_username}`
                                            }
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col items-end justify-center">
                                        {isOwner || sharedWithMePermission === "edit" ? (
                                            <>
                                                <ReadNotes note={note} incrementXP={props.incrementXP} onCreated={props.onCreated} updateCoinsInBackend={props.updateCoinsInBackend}/>
                                                <EditNote
                                                    note={note}
                                                    updateNotesDisplay={(updatedNote) =>
                                                        setNotes((prev) =>
                                                            prev.map((n) =>
                                                                n.note_id === updatedNote.note_id ? updatedNote : n
                                                            )
                                                        )
                                                    }
                                                />
                                            </>
                                        ) : sharedWithMePermission === "view" ? (
                                            <ReadNotes note={note} incrementXP={props.incrementXP} onCreated={props.onCreated} updateCoinsInBackend={props.updateCoinsInBackend}/>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                        <button className="border border-black p-2 rounded-xl text-white bg-blue-500 font-bold w-full" onClick={() => openShare()}>Share Notes</button>
                    </section>
                </section>
            </section>

            <dialog id="share-dialog" className="place-self-center p-4 border border-black rounded-xl h-5/6 w-10/12">
                <section className="h-full flex flex-col gap-4">
                    <h2>Select Notes You Want to Share</h2>
                    <div className="border-2 h-5/6 rounded-xl overflow-y-auto p-4 flex flex-col gap-2">
                        {notes.map(notes => (
                            <div className="border border-black rounded p-2 flex flex-col gap-2" key={notes.note_id}>
                                <div className="flex justify-between items-center">
                                    <h2>{notes.title}</h2>
                                    <button
                                        className="border border-black rounded p-1 bg-blue-500 text-white mt-1 ml-1"
                                        onClick={() => {
                                            openUsers();
                                            setSharedNoteID(notes.note_id);
                                        }}
                                    >Share</button>
                                </div>
                                {sharedUsersByNote[notes.note_id] && sharedUsersByNote[notes.note_id].length > 0 && (
                                    <div className="text-sm text-gray-700">
                                        Shared with: {sharedUsersByNote[notes.note_id].map(entry => {
                                            const user = users.find(u => u.user_id === entry.shared_user_id);
                                            return user ? `${user.username} (${entry.permission})` : "Unknown";
                                        }).join(", ")}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <button className="border border-black p-2 rounded-xl text-white bg-orange-500 font-bold" onClick={() => cancelShare()}>Close</button>
                </section>
            </dialog>

            <dialog id="users-dialog" className="place-self-center p-4 border border-black rounded-xl h-4/6 w-10/12">
                <section className="h-full flex flex-col gap-4">
                    <h2>Select the Person who you want Share with</h2>
                    <div className="border-2 h-5/6 rounded-xl overflow-y-auto p-4 flex flex-col gap-2">
                        {users.map(user => {
                            if(user.user_id != user_id) {
                                const existingEntry = (sharedUsersByNote[sharedNoteID] || []).find(entry => entry.shared_user_id === user.user_id);
                                const isAdded = !!existingEntry;
                                const permission = existingEntry?.permission || "view";

                                return (
                                    <div className="border border-black rounded p-2 flex justify-between items-center" key={user.user_id}>
                                        <h2>{user.username}</h2>
                                        <div>
                                            <select
                                                value={permission}
                                                onChange={(e) => {
                                                    saveSharedNote(sharedNoteID, user.user_id, e.target.value);
                                                }}
                                                className={`border rounded p-1 mr-2 ${isAdded ? 'inline-block' : 'hidden'} text-center`}
                                            >
                                                <option value="view">View</option>
                                                <option value="edit">View and Edit</option>
                                            </select>
                                            <button
                                                className={`border border-black rounded p-1 ${!isAdded ? 'bg-green-500' : 'bg-red-500'} text-white mt-1 ml-1`}
                                                onClick={() => {
                                                    if (!isAdded) {
                                                        saveSharedNote(sharedNoteID, user.user_id, permission);
                                                        setSharedUsers((prev) => [...prev, user.user_id]);
                                                    } else {
                                                        unshareNote(sharedNoteID, user.user_id);
                                                        setSharedUsers((prev) => prev.filter(id => id !== user.user_id));
                                                    }
                                                }}
                                            >
                                                {!isAdded ? "Add" : "Undo"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>
                    <button className="border border-black p-2 rounded-xl text-white bg-blue-500 font-bold" onClick={() => closeUsers()}>Done</button>
                </section>
            </dialog>
        </>
    );
}

export default ShareNotes;
