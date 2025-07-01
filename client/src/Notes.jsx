import { useEffect, useState } from 'react';
import EditNote from './EditNotes';

function Notes(props)
{

    function createNote(){
        const dialog = document.querySelector('#new-note');

        dialog.showModal();
    }

    const [title, setTitle] = useState('');

    async function saveNote(){
        try {
            const body = { title };
            const response = await fetch("http://localhost:5000/notes", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            });

            console.log(response);
            setTitle(""); // clear input
        } catch (err) {
            console.error(err.message);
        }
        document.querySelector('#new-note').close();
    }

    const [notes, setNotes] = useState([]);

    async function displayNotes(){
        try {
            const response = await fetch("http://localhost:5000/notes");
            const jsonData = await response.json();

            setNotes(jsonData);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        displayNotes();
    }, []);

    // console.log(notes);

    async function deleteNote(id) {
        try {
            const deleteNote = await fetch(`http://localhost:5000/notes/${id}`, {
                method: "DELETE"
            });

            setNotes(notes.filter(notes => notes.note_id !== id));
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

        dialog.close();
    }
  

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
                                <EditNote note={notes}></EditNote>
                                <button className="border border-black rounded p-1 bg-red-500 text-white ml-1"
                                onClick={() => deleteNote(notes.note_id)}
                                >Delete</button>
                            </div>
                        ))}
                    </section>
                </section>
            </section>

            <dialog id="new-note" className="place-self-center p-4 border border-black rounded-xl h-5/6 w-10/12">
                <form id="note-form" className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                    <h2>Create new Note</h2>

                    <section className="flex flex-col">
                        <label htmlFor="title">Title</label>
                        <input 
                        type="text" 
                        id="title" 
                        className="border border-black rounded p-2" 
                        value={title} 
                        onChange={(e) => {
                            setTitle(e.target.value)
                            }
                        }
                        />
                    </section>

                    <section className="flex flex-col">
                        <label htmlFor="content">Content</label>
                        <textarea name="content" id="content" className="border border-black rounded p-2 resize-none h-55"></textarea>
                    </section>

                    <section className="flex flex-col">
                        <label htmlFor="tag">Tag</label>
                        <input type="text" id="tag" className="border border-black rounded p-2"/>
                    </section>

                    <button className="border border-black p-2 rounded-xl text-white bg-blue-500 font-bold" onClick={saveNote}>Save</button>
                    <button className="border border-black p-2 rounded-xl text-white bg-red-500 font-bold" type="reset" onClick={() => cancelNote()}>Cancel</button>
                </form>
            </dialog>
        </>
    );
}

export default Notes