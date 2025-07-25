import { useEffect, useState } from 'react';
import EditNote from './EditNotes';
import ReadNotes from './ReadNotes';

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
  
    return(
        <>
            <section className={`h-5/6 border-b-2 border-r-2 border-l-2 border-black w-2/3 place-self-center pr-2 pl-2 pb-2 rounded-b-xl bg-gradient-to-r from-red-500 to-purple-500 ${props.notesHidden}`}>
                <section className="border-black border-b border-r border-l bg-white rounded-b-xl h-96 flex flex-col gap-5 p-4">
                    <section className="flex h-10 gap-2 items-center">
                        <label htmlFor="search">Search</label>
                        <input id="search" className="border border-black rounded-xl w-auto h-7"></input>
                        <button className="border border-black p-2 rounded-xl ml-15 text-white bg-blue-500 font-bold" onClick={() => createNote()}>Create New Note</button>
                    </section>
                    <h2 className="text-3xl font-bold">Notes</h2>
                    <section id="note-container" className="border-2 h-70 rounded-xl overflow-y-auto p-4 flex flex-col gap-2">
                        {/* fills with notes */}
                        {notes.map(notes => (
                            <div className="border border-black rounded p-2" key={notes.note_id}>
                                <h2>{notes.title}</h2>
                                <ReadNotes note={notes} incrementXP={props.incrementXP} onCreated={props.onCreated} updateCoinsInBackend={props.updateCoinsInBackend}></ReadNotes>
                                <EditNote note={notes} updateNotesDisplay={
                                    (updatedNote) => {
                                        setNotes(prev => prev.map(note => note.note_id === updatedNote.note_id ? updatedNote : note))
                                    }
                                }
                                ></EditNote>
                                <button className="border border-black rounded p-1 bg-red-500 text-white ml-1"
                                onClick={() => deleteNote(notes.note_id)}
                                >Delete</button>
                            </div>
                        ))}
                    </section>
                </section>
            </section>

            <dialog id="new-note" className="place-self-center p-4 border border-black rounded-xl h-5/6 w-10/12">
                <form id="note-form" className="flex flex-col gap-4" onSubmit={(e) => {e.preventDefault(); saveNote()}}>
                    <h2>Create new Note</h2>

                    <section className="flex flex-col">
                        <label htmlFor="title">Title</label>
                        <input 
                        type="text" 
                        id="title" 
                        className="border border-black rounded p-2" 
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
                            <label htmlFor="content">Content</label>
                            <span>{content.length}/{MAX_CHARS}</span>
                        </section>
                        <textarea name="content" id="content" className="border border-black rounded p-2 resize-none h-55"
                        placeholder="Type your Content here (max 500 Characters)"
                        value={content}
                        onChange={handleChange}
                        rows={10}
                        required
                        ></textarea>
                    </section>

                    <section className="flex flex-col">
                        <label htmlFor="tag">Tag</label>
                        <input type="text" id="tag" className="border border-black rounded p-2"
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

                    <button className="border border-black p-2 rounded-xl text-white bg-blue-500 font-bold" type="submit">Save</button>
                    <button className="border border-black p-2 rounded-xl text-white bg-red-500 font-bold" type="reset" onClick={() => cancelNote()}>Cancel</button>
                </form>
            </dialog>
        </>
    );
}

export default Notes