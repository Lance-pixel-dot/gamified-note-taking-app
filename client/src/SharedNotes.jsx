import React, { useEffect, useState, useRef } from 'react';
import ReadNotes from "./ReadNotes";
import EditNote from "./EditNotes";
import Icon from '@mdi/react';
import { mdiShareVariant } from '@mdi/js';
import { mdiTrophy } from '@mdi/js';
import { mdiMagnify } from '@mdi/js';

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

    async function displayNotes() {
  try {
    const [ownNotes, withMe] = await Promise.all([
      fetch(`${props.api}/notes/user/${user_id}`).then(r => r.json()),
      fetch(`${props.api}/shared_notes/with_me/${user_id}`).then(r => r.json())
    ]);

    setNotes(ownNotes);
    setSharedNotesWithMe(withMe);

    // fetch read status for all
    const merged = [...ownNotes, ...withMe];
    const uniqueNotes = Array.from(new Map(merged.map(n => [n.note_id, n])).values());
    fetchReadNotesStatus(uniqueNotes);

    // still fetch shared users for each of your notes
    ownNotes.forEach(note => fetchSharedUsers(note.note_id));

  } catch (err) {
    console.error(err.message);
  }
}

useEffect(() => {
  async function loadAllNotes() {
    try {
      const [ownNotes, byMe, withMe] = await Promise.all([
        fetch(`${props.api}/notes/user/${user_id}`).then(r => r.json()),
        fetch(`${props.api}/shared_notes/shared/by_me/${user_id}`).then(r => r.json()),
        fetch(`${props.api}/shared_notes/with_me/${user_id}`).then(r => r.json())
      ]);

      setNotes(ownNotes);
      setSharedNotesWithOthers(byMe);
      setSharedNotesWithMe(withMe);

      // fetch read status for ALL notes combined
      const merged = [...ownNotes, ...byMe, ...withMe];
      const uniqueNotes = Array.from(new Map(merged.map(n => [n.note_id, n])).values());
      fetchReadNotesStatus(uniqueNotes);

      // fetch shared users for each of your own notes
      ownNotes.forEach(note => fetchSharedUsers(note.note_id));

    } catch (err) {
      console.error(err);
    }
  }

  loadAllNotes();
}, []);

    function openUsers(){
        const dialog = document.querySelector("#users-dialog");
        const dialogShare = document.querySelector("#share-dialog");
        dialog.showModal();
        // dialogShare.close();
    }

    function closeUsers(){
        const dialog = document.querySelector("#users-dialog");
        const dialogShare = document.querySelector("#share-dialog");
        dialog.close();
        dialogShare.showModal();
    }

    async function displayUsers(){
        try {
            const response = await fetch(`${props.api}/users`);
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
            const res = await fetch(`${props.api}/shared_notes/${note_id}`);
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
            const res = await fetch(`${props.api}/shared_notes/shared/by_me/${user_id}`);
            const data = await res.json();
            setSharedNotesWithOthers(data);
        } catch (err) {
            console.error(err);
        }
    }

    async function fetchSharedNotesWithMe() {
        try {
            const res = await fetch(`${props.api}/shared_notes/with_me/${user_id}`);
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
    const response = await fetch(`${props.api}/shared_notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (response.ok) {
      //  Check if user already unlocked "Help a Friend" (achievement_id: 15)
      const checkRes = await fetch(`${props.api}/achievements/has-helped-friend?user_id=${user_id}`);
      const checkData = await checkRes.json();

      if (!checkData.hasAchievement) {
        //  Unlock achievement and grant XP
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
        const achievementXp = 70; // or fetch from backend if needed
        if (props.incrementXP) props.incrementXP(achievementXp);
        if (props.updateCoinsInBackend) props.updateCoinsInBackend(user_id, 10);

        await fetch(`${props.api}/achievements/unlock`, {
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
            const response = await fetch(`${props.api}/shared_notes`, {
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

    const readNoteRefs = useRef([]);

    const [readNotesToday, setReadNotesToday] = useState([]);
    
    async function fetchReadNotesStatus(notesList) {
      try {
        const readStatuses = await Promise.all(notesList.map(async (note) => {
          const res = await fetch(`${props.api}/read_notes/can-read-note?user_id=${user_id}&note_id=${note.note_id}`);
          const data = await res.json();
          return {
            note_id: note.note_id,
            isRead: !data.canRead
          };
        }));
    
        const readTodayIds = readStatuses
          .filter(status => status.isRead)
          .map(status => status.note_id);
    
        setReadNotesToday(readTodayIds);
      } catch (err) {
        console.error("Failed to fetch read statuses", err);
      }
    }
      
    function markNoteAsRead(noteId) {
        setReadNotesToday(prev => [...new Set([...prev, noteId])]);

          window.dispatchEvent(new CustomEvent("noteRead", {
            detail: { noteId }
          }));
    }

    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
      function handleNoteRead(event) {
        const { noteId } = event.detail;
        setReadNotesToday(prev => [...new Set([...prev, noteId])]);
      }
    
      window.addEventListener("noteRead", handleNoteRead);
    
      return () => {
        window.removeEventListener("noteRead", handleNoteRead);
      };
    }, []);

    const [shareDialogSearch, setShareDialogSearch] = useState("");
    const [userDialogSearch, setUserDialogSearch] = useState("");

    const [showToast, setShowToast] = useState(false);

    return(
        <>
            <section className={`p-3 pt-0 bg-[var(--bg-color)] flash-container ${props.shareNotesHidden} lg:w-9/12 lg:place-self-end`}>
                <section className="bg-[var(--accent-color)] rounded-b-xl h-full flex flex-col p-4 pt-0 border border-[var(--header-text-color)] border-t-0 lg:border-t lg:rounded-t-xl lg:h-full">
                    <section className="flex h-10 items-center">
                        <input id="search" className="border border-[var(--header-text-color)] border-r-0 text-[var(--header-text-color)]  rounded-l-xl h-7 w-full xl:text-lg focus:outline-none" onChange={(e) => setSearchTerm(e.target.value.toLowerCase())} placeholder='Search by Title or Tag' ></input>
                        <div className='border border-[var(--header-text-color)] border-l-0 rounded-r-xl h-7 items-center'>
                            <Icon path={mdiMagnify} size={1} />
                        </div>
                    </section>
                    <section id="note-container" className="border-2 border-[var(--header-text-color)] flex-1 overflow-y-auto rounded-xl p-4 flex flex-col gap-2 items-stretch">
                        {uniqueNotes.filter(note => 
                          note.title.toLowerCase().includes(searchTerm) ||
                          note.tag.toLowerCase().includes(searchTerm)
                        )
                        .map((note, index) => {
                        if (!readNoteRefs.current[index]) {
                          readNoteRefs.current[index] = React.createRef(); // assign ref if not yet assigned
                        }
                            
                        const isOwner = note.user_id == user_id;
                        const sharedWithMePermission = !isOwner ? note.permission : null; // From sharedNotesWithMe

                        const isRead = readNotesToday.includes(note.note_id);

                            return (
                                <div key={note.note_id} className={`border border-[var(--header-text-color)] text-[var(--header-text-color)] rounded-xl p-2 flex items-center gap-2 cursor-pointer ${
                                isRead ? 'bg-[var(--read-color)]' : 'bg-[var(--accent-color)]'
                              }`}
                              onClick={() => {
                                readNoteRefs.current[index]?.current?.open();
                              }}
                              >

                            <div
                                className={`rounded-xl w-3 h-full border-2 border-black ${
                                  isRead ? 'bg-red-500' : 'bg-green-500'
                                }`}
                              ></div>

                                    <div className="w-full">
                                        <h2 className="font-bold text-sm md:text-base xl:text-lg">{note.title}</h2>
                                        <span className="text-xs text-[var(tag-color)] italic md:text-sm xl:text-base">Tag: {note.tag}</span>
                                        <p className="text-xs text-[var(tag-color)] italic md:text-sm xl:text-base">
                                            {isOwner
                                                ? `Shared with: ${sharedUsersByNote[note.note_id]?.map(entry => {
                                                    const user = users.find(u => u.user_id === entry.shared_user_id);
                                                    return user ? `${user.username} (${entry.permission})` : "Unknown";
                                                }).join(", ") || "None"}`
                                                : `Owner: ${note.owner_username}`
                                            }
                                        </p>
                                    </div>
                                    
                                    <div className="flex flex-col items-end justify-center" onClick={(e) => e.stopPropagation()}>
                                        {isOwner || sharedWithMePermission === "edit" ? (
                                            <>
                                                <ReadNotes note={note} incrementXP={props.incrementXP} onCreated={props.onCreated} updateCoinsInBackend={props.updateCoinsInBackend} ref={readNoteRefs.current[index]}
                                                markNoteAsRead={markNoteAsRead} api={props.api}/>
                                                <EditNote
                                                    api={props.api}
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
                                            <ReadNotes note={note} incrementXP={props.incrementXP} onCreated={props.onCreated} updateCoinsInBackend={props.updateCoinsInBackend} ref={readNoteRefs.current[index]}
                                            markNoteAsRead={markNoteAsRead} api={props.api}/>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                        <button className="border border-[var(--header-text-color)] p-2 rounded-xl text-[var(--header-text-color)] bg-[var(--accent-color)] font-bold w-full flex justify-center items-center gap-2 xl:text-lg" onClick={() => openShare()}>
                                  <Icon path={mdiShareVariant} size={1} />Share Notes</button>
                    </section>
                </section>
            </section>

            <dialog id="share-dialog" className="place-self-center p-4 border border-[var(--text-color)] bg-[var(--bg-color)] tex rounded-xl h-5/6 w-10/12 text-[var(--text-color)]">
                <section className="h-full flex flex-col gap-4">
                    <h2 className='text-lg font-bold text-center'>Select a Note You Want to Share</h2>
                    <input type="text" name="search" id="search" className='border border-[var(--text-color)] text-[var(--text-color)] rounded-lg h-10 w-full text-sm xl:text-base' placeholder='Search by Title or Tag' onChange={(e) => setShareDialogSearch(e.target.value.toLowerCase())}/>
                    <div className="border-2 h-5/6 rounded-xl overflow-y-auto p-4 flex flex-col gap-2 text-sm md:text-base">
                        {notes.filter(note =>
                            note.title.toLowerCase().includes(shareDialogSearch) ||
                            note.tag.toLowerCase().includes(shareDialogSearch)
                            ).map(notes => (
                            <div className="border border-[var(--text-color)] rounded p-2 flex flex-col gap-2" key={notes.note_id}>
                                <div className="flex justify-between items-center">
                                    <div className='flex flex-col gap-2 w-full'>
                                        <h2 className='font-bold xl:text-lg'>{notes.title}</h2>
                                        <span className="text-sm text-[var(--text-color)] italic xl:text-base">Tag: {notes.tag}</span>
                                        {sharedUsersByNote[notes.note_id] && sharedUsersByNote[notes.note_id].length > 0 && (
                                        <div className="text-sm text-[var(--text-color)] italic xl:text-base">
                                            Shared with: {sharedUsersByNote[notes.note_id].map(entry => {
                                                const user = users.find(u => u.user_id === entry.shared_user_id);
                                                return user ? `${user.username} (${entry.permission})` : "Unknown";
                                            }).join(", ")}
                                        </div>
                                        )}
                                    </div>
                                    <button
                                        className="border border-black rounded p-1 bg-[var(--button-bg-color)] text-[var(--button-text-color)] xl:text-lg"
                                        onClick={() => {
                                            openUsers();
                                            setSharedNoteID(notes.note_id);
                                        }}
                                    >Share</button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="border border-black p-2 rounded-xl bg-[var(--cancel-btn-bg-color)] text-[var(--button-text-color)] font-bold" onClick={() => cancelShare()}>Close</button>
                </section>
            </dialog>

            <dialog id="users-dialog" className="place-self-center p-4 border border-[var(--text-color)] bg-[var(--bg-color)] text-[var(--text-color)] rounded-xl h-4/5 w-10/12">
                <section className="h-full flex flex-col gap-4">
                    <h2 className='text-lg font-bold text-center'>Select the Person who you want Share a Note</h2>
                    <input type="text" name="search" id="search" className='border border-[var(--text-color)] text-[var(--text-color)] rounded-lg h-10 w-full md:text-base xl:text-lg' placeholder='Search by Username' onChange={(e) => setUserDialogSearch(e.target.value.toLowerCase())}/>
                    <div className="border-2 h-5/6 rounded-xl overflow-y-auto p-4 flex flex-col gap-2 text-sm md:text-base xl:text-lg">
                        {users.filter(user =>
                        user.username.toLowerCase().includes(userDialogSearch)
                            ).map(user => {
                            if(user.user_id != user_id) {
                                const existingEntry = (sharedUsersByNote[sharedNoteID] || []).find(entry => entry.shared_user_id === user.user_id);
                                const isAdded = !!existingEntry;
                                const permission = existingEntry?.permission || "view";

                                return (
                                    <div className="border border-[var(--text-color)] rounded p-2 flex items-center" key={user.user_id}>
                                        <h2 className='w-full text-xs md:text-base xl:text-lg'>{user.username}</h2>
                                        <div className='flex justify-end flex-col gap-1 '>
                                            <button
                                                className={`border border-black rounded text-[var(--button-text-color)] ${!isAdded ? 'bg-[var(--button-bg-color)]' : 'bg-[var(--cancel-btn-bg-color)] '} text-[var(--button-text-color)] p-1 text-xs md:text-base xl:text-lg`}
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
                                            <select
                                                value={permission}
                                                onChange={(e) => {
                                                    saveSharedNote(sharedNoteID, user.user_id, e.target.value);
                                                }}
                                                className={`border rounded p-1 ${isAdded ? 'inline-block' : 'hidden'} text-center bg-[var(--bg-color)] text-xs md:text-sm xl:text-base`}
                                            >
                                                <option value="view">View</option>
                                                <option value="edit">View and Edit</option>
                                            </select>
                                        </div>
                                    </div>
                                );
                            }
                        })}
                    </div>
                    <button className="border border-black p-2 rounded-xl bg-[var(--button-bg-color)] text-[var(--button-text-color)] font-bold" onClick={() => closeUsers()}>Done</button>
                </section>
                {/*  Bottom-right toast */}
                {showToast && (
                  <dialog className="toast-dialog fixed place-self-end text-xs bottom-4 right-4 bg-[var(--bg-color)] border border-[var(--text-color)] text-[var(--text-color)] px-4 py-2 rounded-xl shadow-lg animate-slide-in z-[9999] flex items-center mb-15 gap-2 md:text-sm xl:text-base" open>
                    <Icon path={mdiTrophy} size={1} /> Help a Friend unlocked! +70 XP +10 <svg className="w-6" viewBox="0 -1.5 48 48" xmlns="http://www.w3.org/2000/">
                    <path id="coins" d="M320.857,468.479c-4.328-1.088-6.981-2.637-7.673-4.478H313v-7a3.265,3.265,0,0,1,1-2.257V450.1a4.711,4.711,0,0,1-1.816-2.1H312v-7c0-1.619,1.345-3.033,4-4.2V432c0-4.6,11.068-7,22-7s22,2.4,22,7v7h-.181c-.448,1.205-1.727,2.278-3.819,3.2v2.7a3.9,3.9,0,0,1,2,3.1v7h-.185a3.856,3.856,0,0,1-.895,1.337A2.92,2.92,0,0,1,357,457v7h-.184c-.692,1.841-3.346,3.39-7.673,4.478a66.515,66.515,0,0,1-28.286,0ZM334.88,468h.239c2.036,0,4.011-.087,5.881-.243V465h1v2.665A41.213,41.213,0,0,0,350.59,466H350v-3h1v2.861a16.562,16.562,0,0,0,1.762-.729A13.1,13.1,0,0,0,355,463.919V460.1a22.359,22.359,0,0,1-8.331,2.911,69.635,69.635,0,0,1-23.337,0A22.358,22.358,0,0,1,315,460.1v3.815a13.378,13.378,0,0,0,2.231,1.21,24.543,24.543,0,0,0,5.769,1.8V464h1v3.119a60.16,60.16,0,0,0,8,.822V465h1v2.974Q333.93,468,334.88,468ZM315,457c0,2.088,7.609,5,20,5a56.889,56.889,0,0,0,13.557-1.427c2.923-.724,5.041-1.652,5.962-2.613C350.6,459.864,343.678,461,336,461a64.428,64.428,0,0,1-12.541-1.156c-3.944-.813-6.809-1.993-8.284-3.412A1.111,1.111,0,0,0,315,457Zm20.88,2h.239c2.036,0,4.011-.087,5.881-.243V456h1v2.665a43.03,43.03,0,0,0,8-1.478V455h1v1.86a16.579,16.579,0,0,0,1.762-.728A13.209,13.209,0,0,0,356,454.919V451.1a22.346,22.346,0,0,1-8.331,2.912,69.64,69.64,0,0,1-23.338,0,24.04,24.04,0,0,1-7.914-2.638c-.125-.051-.257-.108-.418-.177v3.718a13.162,13.162,0,0,0,2.231,1.21,24.543,24.543,0,0,0,5.769,1.8V455h1v3h-.642a58.75,58.75,0,0,0,8.643.941V456h1v2.974Q334.93,459,335.88,459Zm-2-7h.239q.949,0,1.88-.026V449h1v2.941a58.734,58.734,0,0,0,8.646-.941H345v-3h1v2.93a24.484,24.484,0,0,0,5.777-1.806A13.171,13.171,0,0,0,354,447.918V444.1a22.352,22.352,0,0,1-8.331,2.912,69.635,69.635,0,0,1-23.337,0A22.36,22.36,0,0,1,314,444.1v3.814a13.127,13.127,0,0,0,2.218,1.205,16.543,16.543,0,0,0,1.781.737V447h1v3.186a43.042,43.042,0,0,0,8,1.478V449h1v2.756C329.869,451.913,331.844,452,333.88,452Zm20.572-2.237c1.012-.6,1.547-1.207,1.547-1.762h-.184A4.3,4.3,0,0,1,354.452,449.762ZM314,441c0,2.088,7.609,5,20,5a51.442,51.442,0,0,0,15.336-1.925A66.045,66.045,0,0,1,338,445a60.165,60.165,0,0,1-14.234-1.544c-4.278-1.088-6.9-2.628-7.583-4.457H316v-.012C314.709,439.658,314,440.369,314,441Zm23.881,2h.239c2.035,0,4.01-.087,5.88-.243V440h1v2.665A41.228,41.228,0,0,0,353.588,441H353v-3h1v2.859a16.568,16.568,0,0,0,1.775-.734A13.092,13.092,0,0,0,358,438.918V435.1c-3.675,2.569-11.875,3.9-20,3.9s-16.325-1.328-20-3.9v3.815a13.107,13.107,0,0,0,2.226,1.207,24.5,24.5,0,0,0,5.774,1.8V439h1v3.119a60.154,60.154,0,0,0,8,.821V440h1v2.974Q336.93,443,337.881,443ZM318,432c0,2.088,7.609,5,20,5s20-2.912,20-5-7.609-5-20-5S318,429.912,318,432Z" transform="translate(-312 -425)" fill="var(--button-text-color)"/>
                    </svg>
                  </dialog>
                )}
            </dialog>
        </>
    );
}

export default ShareNotes;
