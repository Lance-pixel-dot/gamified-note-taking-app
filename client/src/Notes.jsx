import React, { useEffect, useState, useRef } from 'react';
import EditNote from './EditNotes';
import ReadNotes from './ReadNotes';
import deleteIcon from './assets/icons/delete.svg';

function Notes(props)
{

    function createNote(){
        const dialog = document.querySelector('#new-note');

        dialog.showModal();
    }

    //add notes
    const [title, setTitle] = useState('');
    const [content, setContent] = useState("");
    const [tag, setTag] = useState("");
    const user_id = localStorage.getItem("user_id");

    async function saveNote() {
    try {
    const body = { user_id, title, content, tag };

    const response = await fetch("http://localhost:5000/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    const createdNote = result.note;
    const unlockedAchievements = result.newAchievements || [];

    // Set note in state
    setNotes([...notes, createdNote]);
    setTitle("");
    setContent("");
    setTag("");
    props.onCreated(); 

    // Base XP for creating a note
    let totalXP = 3.5;

    // XP values for achievements
    const achievementXPMap = {
      1: 10,   // First Note
      2: 20,   // 10 Notes
      12: 50   // 50 Notes
    };

    for (let id of unlockedAchievements) {
      totalXP += achievementXPMap[id] || 0; // default to 0 if not found
    }

    if (props.updateCoinsInBackend && unlockedAchievements.length > 0) {
      await props.updateCoinsInBackend(user_id, unlockedAchievements.length * 10);
    }

    props.incrementXP(totalXP); // Final XP with achievement bonus
    props.updateCoinsInBackend(user_id, 1); 

  } catch (err) {
    console.error(err.message);
  }

  document.querySelector("#new-note").close();
}


    //display note
    const [notes, setNotes] = useState([]);

    async function displayNotes(){
        try {
            const response = await fetch(`http://localhost:5000/notes/user/${user_id}`);
            const jsonData = await response.json();

            setNotes(jsonData);
            fetchReadNotesStatus(jsonData);
        } catch (err) {
            console.error(err.message);
        }
    }

useEffect(() => {

    displayNotes();

    const handleNoteUpdate = () => {
        displayNotes();
    };

    window.addEventListener("noteUpdated", handleNoteUpdate);

    return () => {
        window.removeEventListener("noteUpdated", handleNoteUpdate);
    };
}, []);

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

    //delete note
    async function deleteNote(id) {
        try {
            const deleteNote = await fetch(`http://localhost:5000/notes/${id}`, {
                method: "DELETE"
            });

            window.location = "/dashboard";

            setNotes(notes.filter(notes => notes.note_id !== id));

            // Dispatch custom event
            window.dispatchEvent(new CustomEvent("noteDeleted", { detail: { id } }));
        } catch (err) {
            console.error(err.message);
        }
    }

    const [deleNoteId, setDeleteNoteId] = useState('');

    function deleteDialog(){
      const dialog = document.querySelector('#delete-note');

      dialog.showModal();
    }
    function cancelDelete(){
      const dialog = document.querySelector('#delete-note');

      dialog.close();
    }

    function cancelNote(){
        const noteForm = document.querySelector('#note-form');
        const dialog = document.querySelector('#new-note');

        noteForm.addEventListener('submit', e => {
            e.preventDefault();
        })

        setTitle("");
        setContent("");
        setTag("");
        dialog.close();
    }

    //char counter
    const MAX_CHARS = 500;
    const MAX_TITLE_CHARS = 50;
    const MAX_TAG_CHARS = 50;

    const handleChange = (e) => {
        const input = e.target.value;

        // Only allow up to MAX_CHARS characters
        if (input.length <= MAX_CHARS) {
        setContent(input);
        } else {
        setContent(input.slice(0, MAX_CHARS)); //force-trim if pasted
        }
  };

  const readNoteRefs = useRef([]);

  const [readNotesToday, setReadNotesToday] = useState([]);

  async function fetchReadNotesStatus(notesList) {
  try {
    const readStatuses = await Promise.all(notesList.map(async (note) => {
      const res = await fetch(`http://localhost:5000/read_notes/can-read-note?user_id=${user_id}&note_id=${note.note_id}`);
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

    return(
        <>
            <section className={`p-3 pt-0 bg-[var(--bg-color)] flash-container ${props.notesHidden}`}>
                <section className="bg-[var(--accent-color)] rounded-b-xl h-5/6 flex flex-col p-4 pt-0 border border-[var(--header-text-color)] border-t-0">
                    <section className="flex h-10 gap-2 items-center">
                        <input id="search" className="border border-[var(--header-text-color)] text-[var(--header-text-color)]  rounded-xl h-7 w-full" onChange={(e) => setSearchTerm(e.target.value.toLowerCase())} placeholder='Search by Title or Tag'></input>
                    </section>
                    <section id="note-container" className="border-2 border-[var(--header-text-color)] flex-1 overflow-y-auto rounded-xl p-4 flex flex-col gap-2 items-stretch">
                        {/* fills with notes */}
                        {notes
                        .filter(note =>
                          note.title.toLowerCase().includes(searchTerm) ||
                          note.tag.toLowerCase().includes(searchTerm)
                        )
                        .map((note, index) => {
                          if (!readNoteRefs.current[index]) {
                            readNoteRefs.current[index] = React.createRef(); // assign ref if not yet assigned
                          }
                        
                          const isRead = readNotesToday.includes(note.note_id);
                        
                          return (
                            <div
                              className={`border border-[var(--header-text-color)] text-[var(--header-text-color)] rounded-xl p-2 flex items-center gap-2 ${
                                isRead ? 'bg-[var(--read-color)]' : 'bg-[var(--accent-color)]'
                              }`}
                              key={note.note_id}
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
                                <h2 className="font-bold text-sm">{note.title}</h2>
                                <span className="text-xs text-[var(tag-color)] italic">Tag: {note.tag}</span>
                              </div>
                            
                              <div
                                className="flex flex-col gap-2 items-end"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <EditNote
                                  note={note}
                                  updateNotesDisplay={(updatedNote) => {
                                    setNotes((prev) =>
                                      prev.map((n) =>
                                        n.note_id === updatedNote.note_id ? updatedNote : n
                                      )
                                    );
                                  }}
                                />
                                <button onClick={() => {
                                  setDeleteNoteId(note.note_id);
                                  deleteDialog();
                                }}
                                className='hover:bg-[var(--highlight-color)] rounded p-1'
                                >
                                  <svg className='w-7' viewBox="0 0 24 24" fill="var(--delete-color)" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M10 12V17" stroke="var(--delete-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M14 12V17" stroke="var(--delete-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M4 7H20" stroke="var(--delete-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke="var(--delete-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="var(--delete-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              </div>
                                
                              <ReadNotes
                                note={note}
                                incrementXP={props.incrementXP}
                                onCreated={props.onCreated}
                                updateCoinsInBackend={props.updateCoinsInBackend}
                                ref={readNoteRefs.current[index]}
                                markNoteAsRead={markNoteAsRead}
                              />
                            </div>
                          );
                        })}
                        <button className="border border-[var(--header-text-color)] p-2 rounded-xl text-[var(--header-text-color)] bg-[var(--accent-color)] font-bold w-full" onClick={() => createNote()}> + Create New Note</button>
                    </section>
                </section>
            </section>

            <dialog id="new-note" className="place-self-center p-4 bg-[var(--bg-color)] text-[var(--text-color)] border border-[var(--text-color)] rounded-xl h-5/6 w-10/12">
                <form id="note-form" className="flex flex-col gap-4" onSubmit={(e) => {e.preventDefault(); saveNote()}}>
                    <h2 className='font-bold text-lg'>Create new Note</h2>

                    <section className="flex flex-col">
                        <label htmlFor="title" className='font-bold text-sm'>Title</label>
                        <input 
                        type="text" 
                        id="title" 
                        className="border rounded p-2 text-xs border-[var(--text-color)] text-[var(--text-color)]" 
                        value={title} 
                        onChange={(e) => {
                                const input = e.target.value;
                                if (input.length <= MAX_TITLE_CHARS) {
                                  setTitle(input);
                                }else{
                                  setTitle(input.slice(0, MAX_TITLE_CHARS));
                                }
                            }
                        }
                        placeholder='Type your Title here (max 50 Characters)'
                        required
                        />
                    </section>

                    <section className="flex flex-col">
                        <section className="flex justify-between">
                            <label htmlFor="content" className='font-bold text-sm'>Content</label>
                            <span>{content.length}/{MAX_CHARS}</span>
                        </section>
                        <textarea name="content" id="content" className="border border-[var(--text-color)] text-[var(--text-color)] rounded p-2 resize-none h-55 text-xs"
                        placeholder="Type your Content here (max 500 Characters)"
                        value={content}
                        onChange={handleChange}
                        rows={10}
                        required
                        ></textarea>
                    </section>

                    <section className="flex flex-col">
                        <label htmlFor="tag" className='font-bold text-sm'>Tag</label>
                        <input type="text" id="tag" className="border border-[var(--text-color)] text-[var(--text-color)] rounded p-2 text-xs"
                        value={tag}
                        onChange={(e) => {
                                const input = e.target.value;
                                if (input.length <= MAX_TAG_CHARS) {
                                  setTag(input);
                                }else{
                                  setTag(input.slice(0, MAX_TAG_CHARS));
                                }
                            }
                        }
                        placeholder='Type your Tag here (max 50 Characters)'
                        required
                        />
                    </section>

                    <button className="border border-black p-2 rounded-xl text-[var(--button-text-color)] bg-[var(--button-bg-color)] font-bold text-sm flex justify-center gap-2" type="submit">Save + 3.5xp +1<svg className="w-6" viewBox="0 -1.5 48 48" xmlns="http://www.w3.org/2000/">
                    <path id="coins" d="M320.857,468.479c-4.328-1.088-6.981-2.637-7.673-4.478H313v-7a3.265,3.265,0,0,1,1-2.257V450.1a4.711,4.711,0,0,1-1.816-2.1H312v-7c0-1.619,1.345-3.033,4-4.2V432c0-4.6,11.068-7,22-7s22,2.4,22,7v7h-.181c-.448,1.205-1.727,2.278-3.819,3.2v2.7a3.9,3.9,0,0,1,2,3.1v7h-.185a3.856,3.856,0,0,1-.895,1.337A2.92,2.92,0,0,1,357,457v7h-.184c-.692,1.841-3.346,3.39-7.673,4.478a66.515,66.515,0,0,1-28.286,0ZM334.88,468h.239c2.036,0,4.011-.087,5.881-.243V465h1v2.665A41.213,41.213,0,0,0,350.59,466H350v-3h1v2.861a16.562,16.562,0,0,0,1.762-.729A13.1,13.1,0,0,0,355,463.919V460.1a22.359,22.359,0,0,1-8.331,2.911,69.635,69.635,0,0,1-23.337,0A22.358,22.358,0,0,1,315,460.1v3.815a13.378,13.378,0,0,0,2.231,1.21,24.543,24.543,0,0,0,5.769,1.8V464h1v3.119a60.16,60.16,0,0,0,8,.822V465h1v2.974Q333.93,468,334.88,468ZM315,457c0,2.088,7.609,5,20,5a56.889,56.889,0,0,0,13.557-1.427c2.923-.724,5.041-1.652,5.962-2.613C350.6,459.864,343.678,461,336,461a64.428,64.428,0,0,1-12.541-1.156c-3.944-.813-6.809-1.993-8.284-3.412A1.111,1.111,0,0,0,315,457Zm20.88,2h.239c2.036,0,4.011-.087,5.881-.243V456h1v2.665a43.03,43.03,0,0,0,8-1.478V455h1v1.86a16.579,16.579,0,0,0,1.762-.728A13.209,13.209,0,0,0,356,454.919V451.1a22.346,22.346,0,0,1-8.331,2.912,69.64,69.64,0,0,1-23.338,0,24.04,24.04,0,0,1-7.914-2.638c-.125-.051-.257-.108-.418-.177v3.718a13.162,13.162,0,0,0,2.231,1.21,24.543,24.543,0,0,0,5.769,1.8V455h1v3h-.642a58.75,58.75,0,0,0,8.643.941V456h1v2.974Q334.93,459,335.88,459Zm-2-7h.239q.949,0,1.88-.026V449h1v2.941a58.734,58.734,0,0,0,8.646-.941H345v-3h1v2.93a24.484,24.484,0,0,0,5.777-1.806A13.171,13.171,0,0,0,354,447.918V444.1a22.352,22.352,0,0,1-8.331,2.912,69.635,69.635,0,0,1-23.337,0A22.36,22.36,0,0,1,314,444.1v3.814a13.127,13.127,0,0,0,2.218,1.205,16.543,16.543,0,0,0,1.781.737V447h1v3.186a43.042,43.042,0,0,0,8,1.478V449h1v2.756C329.869,451.913,331.844,452,333.88,452Zm20.572-2.237c1.012-.6,1.547-1.207,1.547-1.762h-.184A4.3,4.3,0,0,1,354.452,449.762ZM314,441c0,2.088,7.609,5,20,5a51.442,51.442,0,0,0,15.336-1.925A66.045,66.045,0,0,1,338,445a60.165,60.165,0,0,1-14.234-1.544c-4.278-1.088-6.9-2.628-7.583-4.457H316v-.012C314.709,439.658,314,440.369,314,441Zm23.881,2h.239c2.035,0,4.01-.087,5.88-.243V440h1v2.665A41.228,41.228,0,0,0,353.588,441H353v-3h1v2.859a16.568,16.568,0,0,0,1.775-.734A13.092,13.092,0,0,0,358,438.918V435.1c-3.675,2.569-11.875,3.9-20,3.9s-16.325-1.328-20-3.9v3.815a13.107,13.107,0,0,0,2.226,1.207,24.5,24.5,0,0,0,5.774,1.8V439h1v3.119a60.154,60.154,0,0,0,8,.821V440h1v2.974Q336.93,443,337.881,443ZM318,432c0,2.088,7.609,5,20,5s20-2.912,20-5-7.609-5-20-5S318,429.912,318,432Z" transform="translate(-312 -425)" fill="var(--button-text-color)"/>
                    </svg>
                    </button>
                    <button className="border border-black p-2 rounded-xl text-[var(--button-text-color)] bg-[var(--cancel-btn-bg-color)] font-bold text-sm" type="reset" onClick={() => cancelNote()}>Cancel</button>
                </form>
            </dialog>

            <dialog id='delete-note' className='place-self-center p-4 bg-[var(--bg-color)] text-[var(--text-color)] border border-[var(--text-color)] rounded-xl w-full'>
                <div className='flex flex-col gap-4 text-center'>
                  <h3>Delete This Note?</h3>
                  <button className='border border-black p-2 rounded-xl text-[var(--button-text-color)] bg-[var(--warning-btn-bg-color)]  font-bold text-sm' onClick={() => {
                    deleteNote(deleNoteId)
                  }}>Yes</button>
                  <button className='border border-black p-2 rounded-xl text-[var(--button-text-color)] bg-[var(--cancel-btn-bg-color)] font-bold text-sm' onClick={() => {
                    cancelDelete();
                  }}>Cancel</button>
                </div>
            </dialog>
        </>
    );
}

export default Notes