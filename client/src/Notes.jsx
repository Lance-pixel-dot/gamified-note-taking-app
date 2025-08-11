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
                        <input id="search" className="border border-[var(--header-text-color)] text-[var(--header-text-color)]  rounded-xl h-7 w-full" onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}></input>
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
                                }}>
                                  <svg className='w-7' viewBox="0 0 24 24" fill="var(--delete-color)" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M10 12V17" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M14 12V17" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M4 7H20" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M6 10V18C6 19.6569 7.34315 21 9 21H15C16.6569 21 18 19.6569 18 18V10" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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

                    <button className="border border-black p-2 rounded-xl text-[var(--button-text-color)] bg-[var(--button-bg-color)] font-bold text-sm" type="submit">Save +3.5xp +1coin</button>
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