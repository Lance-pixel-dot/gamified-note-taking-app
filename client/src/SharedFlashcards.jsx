import React, { useEffect, useState, useRef } from 'react';
import ReviewFlashcard from "./ReviewFlashcards";
import EditFlashcard from "./EditFlashcards";

function ShareFlashcards(props) {
  const user_id = localStorage.getItem("user_id");

  const [flashcards, setFlashcards] = useState([]);
  const [users, setUsers] = useState([]);
  const [sharedFlashcardID, setSharedFlashcardID] = useState("");
  const [sharedUsersByFlashcard, setSharedUsersByFlashcard] = useState({});
  const [sharedFlashcardsWithOthers, setSharedFlashcardsWithOthers] = useState([]);
  const [sharedFlashcardsWithMe, setSharedFlashcardsWithMe] = useState([]);
  const [sharedUsers, setSharedUsers] = useState([]);

  async function displayFlashcards() {
    const res = await fetch(`http://localhost:5000/flashcards/user/${user_id}`);
    const data = await res.json();
    setFlashcards(data);
    fetchReadStatus(data);
    data.forEach(fc => fetchSharedUsers(fc.flashcard_id));
  }

  async function displayUsers() {
    const res = await fetch("http://localhost:5000/users");
    const data = await res.json();
    setUsers(data);
  }

  async function fetchSharedUsers(flashcard_id) {
    const res = await fetch(`http://localhost:5000/shared_flashcards/${flashcard_id}`);
    const data = await res.json();
    setSharedUsersByFlashcard(prev => ({
      ...prev,
      [flashcard_id]: data.map(user => ({
        shared_user_id: user.shared_user_id,
        permission: user.permission
      }))
    }));
  }

  async function fetchSharedFlashcardsWithOthers() {
    const res = await fetch(`http://localhost:5000/shared_flashcards/shared/by_me/${user_id}`);
    const data = await res.json();
    setSharedFlashcardsWithOthers(data);
  }

  async function fetchSharedFlashcardsWithMe() {
    const res = await fetch(`http://localhost:5000/shared_flashcards/with_me/${user_id}`);
    const data = await res.json();
    setSharedFlashcardsWithMe(data);
  }

  useEffect(() => {
    displayFlashcards();
    displayUsers();
    fetchSharedFlashcardsWithOthers();
    fetchSharedFlashcardsWithMe();

    const handleFlashcardUpdate = () => {
      fetchSharedFlashcardsWithMe();
      fetchSharedFlashcardsWithOthers();
    };

    window.addEventListener("flashcardUpdated", handleFlashcardUpdate);
    window.addEventListener("flashcardDeleted", handleFlashcardUpdate);

    return () => {
      window.removeEventListener("flashcardUpdated", handleFlashcardUpdate);
      window.removeEventListener("flashcardDeleted", handleFlashcardUpdate);
    };
  }, []);

  async function saveSharedFlashcard(flashcard_id, shared_user_id, permission = "view") {
  const body = { flashcard_id, shared_user_id, permission };

  const response = await fetch("http://localhost:5000/shared_flashcards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (response.ok) {

    if (!user_id) {
      console.error("User ID not found in localStorage");
      return;
    }

    try {
      //  Check if user already has the "Help a Friend" achievement
      const check = await fetch(`http://localhost:5000/achievements/has-helped-friend?user_id=${user_id}`);
      const checkData = await check.json();

      if (!checkData.hasAchievement) {
        //  Unlock the achievement and grant XP
        await fetch("http://localhost:5000/achievements/unlock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id,
            achievement_id: 15,
          }),
        });

        props.incrementXP(70);
        props.updateCoinsInBackend(user_id, 10);
      } 

        props.onCreated();

    } catch (err) {
      console.error("Error checking/unlocking achievement:", err);
    }

    // Update shared flashcard state
    setSharedUsersByFlashcard(prev => {
      const current = prev[flashcard_id] || [];
      const existingIndex = current.findIndex(u => u.shared_user_id === shared_user_id);
      const updated =
        existingIndex !== -1
          ? [...current.slice(0, existingIndex), { shared_user_id, permission }, ...current.slice(existingIndex + 1)]
          : [...current, { shared_user_id, permission }];
      return { ...prev, [flashcard_id]: updated };
    });

    await fetchSharedFlashcardsWithOthers();
    await fetchSharedFlashcardsWithMe();
    window.dispatchEvent(new CustomEvent("flashcardUpdated"));
  }
}

  async function unshareFlashcard(flashcard_id, shared_user_id) {
    const res = await fetch("http://localhost:5000/shared_flashcards", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flashcard_id, shared_user_id })
    });

    if (res.ok) {
      setSharedUsersByFlashcard(prev => {
        const updated = (prev[flashcard_id] || []).filter(entry => entry.shared_user_id !== shared_user_id);
        return { ...prev, [flashcard_id]: updated };
      });
      await fetchSharedFlashcardsWithMe();
      await fetchSharedFlashcardsWithOthers();
      window.dispatchEvent(new CustomEvent("flashcardUpdated"));
    }
  }

  const mergedFlashcards = [...sharedFlashcardsWithOthers, ...sharedFlashcardsWithMe];
  const uniqueFlashcardsMap = new Map();
  mergedFlashcards.forEach(fc => {
    if (!uniqueFlashcardsMap.has(fc.flashcard_id)) {
      uniqueFlashcardsMap.set(fc.flashcard_id, fc);
    }
  });
  const uniqueFlashcards = Array.from(uniqueFlashcardsMap.values()).filter(fc => {
    if (fc.user_id == user_id) {
      return (sharedUsersByFlashcard[fc.flashcard_id] || []).length > 0;
    }
    return true;
  });

  function openShare() {
    const dialog = document.querySelector("#share-dialog-flashcard");
    displayFlashcards();
    dialog.showModal();
  }

  function cancelShare() {
    const dialog = document.querySelector("#share-dialog-flashcard");
    dialog.close();
  }

  function openUsers() {
    const dialog = document.querySelector("#users-dialog-flashcard");
    const shareDialog = document.querySelector("#share-dialog-flashcard");
    dialog.showModal();
    shareDialog.close();
  }

  function closeUsers() {
    const dialog = document.querySelector("#users-dialog-flashcard");
    const shareDialog = document.querySelector("#share-dialog-flashcard");
    dialog.close();
    shareDialog.showModal();
  }

  useEffect(() => {
        function handleFlashcardRead(event) {
          const { flashcardId } = event.detail;
          setReadFlashcardsToday(prev => [...new Set([...prev, flashcardId])]);
        }
  
        window.addEventListener("flashcardRead", handleFlashcardRead);
  
        return () => {
          window.removeEventListener("flashcardRead", handleFlashcardRead);
        };
      }, []);
  
useEffect(() => {
  if (uniqueFlashcards.length > 0) {
    fetchReadStatus(uniqueFlashcards);
  }
}, [uniqueFlashcards]);
  
  const [readFlashcardsToday, setReadFlashcardsToday] = useState([]);
  const reviewFlashcardRefs = useRef([]);
  
   async function fetchReadStatus(flashcardsList) {
      try {
        const readStatuses = await Promise.all(flashcardsList.map(async (card) => {
          const res = await fetch(`http://localhost:5000/flashcards/can-review?user_id=${user_id}&flashcard_id=${card.flashcard_id}`)
          const data = await res.json();
          return {
            flashcard_id: card.flashcard_id,
            isRead: !data.canReview
          };
        }));
  
        const readIds = readStatuses.filter(f => f.isRead).map(f => f.flashcard_id);
        setReadFlashcardsToday(readIds);
      } catch (err) {
        console.error("Failed to fetch read status", err);
      }
    }
  
    function markFlashcardAsRead(flashcardId) {
      setReadFlashcardsToday(prev => [...new Set([...prev, flashcardId])]);
      window.dispatchEvent(new CustomEvent("flashcardRead", { detail: { flashcardId } }));
    }
  
    const [searchTerm, setSearchTerm] = useState('');

    // state for searches
    const [searchTermMain, setSearchTermMain] = useState('');
    const [searchTermShareDialog, setSearchTermShareDialog] = useState('');
    const [searchTermUsersDialog, setSearchTermUsersDialog] = useState('');


  return (
    <>
      <section className={`p-3 pt-0 bg-[var(--bg-color)] flash-container ${props.shareFlashcardsHidden}`}>
        <section className="bg-[var(--accent-color)] rounded-b-xl h-5/6 flex flex-col p-4 pt-0 border border-[var(--header-text-color)] border-t-0">
          <section className="flex h-10 gap-2 items-center">
            <input id="search" className="border border-[var(--header-text-color)] text-[var(--header-text-color)]  rounded-xl h-7 w-full" onChange={(e) => setSearchTerm(e.target.value.toLowerCase())} placeholder='Search by Title or Tag' />
          </section>
          <section id="note-container" className="border-2 border-[var(--header-text-color)] flex-1 overflow-y-auto rounded-xl p-4 flex flex-col gap-2 items-stretch">
            {uniqueFlashcards.filter(f => f.title.toLowerCase().includes(searchTerm) || f.tag.toLowerCase().includes(searchTerm))
            .map((fc, index) => {
              if (!reviewFlashcardRefs.current[index]) {
                  reviewFlashcardRefs.current[index] = React.createRef();
              }

              const isReview = readFlashcardsToday.includes(fc.flashcard_id);
              const isOwner = fc.user_id == user_id;
              const sharedWithMePermission = !isOwner ? fc.permission : null;

              return (
                <div key={fc.flashcard_id} className={`border border-[var(--header-text-color)] text-[var(--header-text-color)] rounded-xl p-2 flex items-center gap-2 ${isReview ? 'bg-[var(--read-color)]' : 'bg-[var(--accent-color)]'}`} 
                onClick={() => {
                reviewFlashcardRefs.current[index]?.current?.open(fc);
                }}
                >
                  <div className={`rounded-xl w-3 h-full border-2 border-black ${isReview ? 'bg-red-500' : 'bg-green-500'}`} />

                  <div className='w-full'>
                    <h2>{fc.title}</h2>
                    <span>Tag {fc.tag}</span>
                    <p className="text-sm text-[var(tag-color)] italic">
                      {isOwner
                        ? `Shared with: ${sharedUsersByFlashcard[fc.flashcard_id]?.map(entry => {
                          const user = users.find(u => u.user_id === entry.shared_user_id);
                          return user ? `${user.username} (${entry.permission})` : "Unknown";
                        }).join(", ") || "None"}`
                        : `Owner: ${fc.owner_username}`}
                    </p>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    {isOwner || sharedWithMePermission === "edit" ? (
                      <>
                        <ReviewFlashcard flashcard={fc} incrementXP={props.incrementXP} onCreated={props.onCreated} updateCoinsInBackend={props.updateCoinsInBackend} ref={reviewFlashcardRefs.current[index]} markFlashcardAsRead={markFlashcardAsRead}/>
                        <EditFlashcard
                          flashcard={fc}
                          updateFlashcardsDisplay={(updated) =>
                            setFlashcards(prev => prev.map(n =>
                              n.flashcard_id === updated.flashcard_id ? updated : n
                            ))
                          }
                        />
                      </>
                    ) : sharedWithMePermission === "view" ? (
                      <ReviewFlashcard flashcard={fc} incrementXP={props.incrementXP} onCreated={props.onCreated} updateCoinsInBackend={props.updateCoinsInBackend} ref={reviewFlashcardRefs.current[index]} markFlashcardAsRead={markFlashcardAsRead}/>
                    ) : null}
                  </div>
                </div>
              );
            })}
            <button className="border border-[var(--header-text-color)] p-2 rounded-xl text-[var(--header-text-color)] bg-[var(--accent-color)] font-bold w-full" onClick={openShare}>Share Flashcards</button>
          </section>
        </section>
      </section>

      <dialog id="share-dialog-flashcard" className="place-self-center p-4 border border-[var(--text-color)] bg-[var(--bg-color)] tex rounded-xl h-5/6 w-10/12 text-[var(--text-color)]">
        <section className="h-full flex flex-col gap-4">
          <h2 className='text-lg font-bold text-center'>Select a Flashcard You Want to Share</h2>
          <input type="text" name="search" id="search" className='border border-[var(--text-color)] text-[var(--text-color)] rounded-lg h-10 w-full text-sm' placeholder='search by title or tag' onChange={(e) => setSearchTermMain(e.target.value.toLowerCase())}/>
          <div className="border-2 h-5/6 rounded-xl overflow-y-auto p-4 flex flex-col gap-2 text-sm">
            {flashcards.filter(f =>
              f.title.toLowerCase().includes(searchTermMain) ||
              f.tag.toLowerCase().includes(searchTermMain)
              ).map(fc => (
              <div className="border border-[var(--text-color)] rounded p-2 flex justify-center items-center" key={fc.flashcard_id}>
                <div className="flex flex-col gap-2 w-full">
                  <h2 className='font-bold'>{fc.title}</h2>
                  <span className="text-sm text-[var(--text-color)] italic">Tag: {fc.tag}</span>
                  {sharedUsersByFlashcard[fc.flashcard_id]?.length > 0 && (
                  <div className="text-sm text-[var(--text-color)] italic">
                    Shared with: {sharedUsersByFlashcard[fc.flashcard_id].map(entry => {
                      const user = users.find(u => u.user_id === entry.shared_user_id);
                      return user ? `${user.username} (${entry.permission})` : "Unknown";
                    }).join(", ")}
                  </div>
                )}
                </div>
                <button
                    className="border border-black rounded p-1 bg-[var(--button-bg-color)] text-[var(--button-text-color)]"
                    onClick={() => {
                      openUsers();
                      setSharedFlashcardID(fc.flashcard_id);
                    }}
                  >Share</button>
              </div>
            ))}
          </div>
          <button className="border border-black p-2 rounded-xl bg-[var(--cancel-btn-bg-color)] text-[var(--button-text-color)]  font-bold" onClick={cancelShare}>Close</button>
        </section>
      </dialog>

      <dialog id="users-dialog-flashcard" className="place-self-center p-4 border border-[var(--text-color)] bg-[var(--bg-color)] text-[var(--text-color)] rounded-xl h-4/6 w-10/12">
        <section className="h-full flex flex-col gap-4">
          <h2 className='text-lg font-bold text-center'>Select the Person who you want Share with</h2>
          <input type="text" name="search" id="search" className='border border-[var(--text-color)] text-[var(--text-color)] rounded-lg h-10 w-full text-sm' placeholder='search by username' onChange={(e) => setSearchTermUsersDialog(e.target.value.toLowerCase())}/>
          <div className="border-2 h-5/6 rounded-xl overflow-y-auto p-4 flex flex-col gap-2 text-sm">
            {users.filter(user => user.username.toLowerCase().includes(searchTermUsersDialog)).map(user => {
              if (user.user_id != user_id) {
                const existingEntry = (sharedUsersByFlashcard[sharedFlashcardID] || []).find(entry => entry.shared_user_id === user.user_id);
                const isAdded = !!existingEntry;
                const permission = existingEntry?.permission || "view";

                return (
                  <div className="border border-[var(--text-color)] rounded p-2 flex items-center" key={user.user_id}>
                    <h2 className='w-full text-xs'>{user.username}</h2>
                    <div className='flex justify-end flex-col gap-1 '>
                      <button
                        className={`border border-black rounded p-1 ${!isAdded ? 'bg-[var(--button-bg-color)]' : 'bg-[var(--cancel-btn-bg-color)]'} text-[var(--button-text-color)] text-xs`}
                        onClick={() => {
                          if (!isAdded) {
                            saveSharedFlashcard(sharedFlashcardID, user.user_id, permission);
                            setSharedUsers(prev => [...prev, user.user_id]);
                          } else {
                            unshareFlashcard(sharedFlashcardID, user.user_id);
                            setSharedUsers(prev => prev.filter(id => id !== user.user_id));
                          }
                        }}
                      >
                        {!isAdded ? "Add" : "Undo"}
                      </button>
                      <select
                        value={permission}
                        onChange={(e) => {
                          saveSharedFlashcard(sharedFlashcardID, user.user_id, e.target.value);
                        }}
                        className={`border rounded p-1 ${isAdded ? 'inline-block' : 'hidden'} text-center bg-[var(--bg-color)] text-xs`}
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
          <button className="border border-black p-2 rounded-xl text-white bg-blue-500 font-bold" onClick={closeUsers}>Done</button>
        </section>
      </dialog>
    </>
  );
}

export default ShareFlashcards;
