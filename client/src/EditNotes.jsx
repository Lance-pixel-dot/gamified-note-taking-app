import { useState } from "react";

function EditNote({ note }){

    const [title, setTitle] = useState(note.title);

    async function updateTitle(e){
        e.preventDefault();
        try {
            const body = { title }
            const response = await fetch(`http://localhost:5000/notes/${note.note_id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            })

            window.location = "/";
        } catch (err) {
            console.error(err.message);
        }
    }

    function viewNote(){
        const dialog = document.querySelector(`#id${note.note_id}`);

        dialog.showModal();
    }

    function cancelNote(){
        const noteForm = document.querySelector('#view-note-form');
        const dialog = document.querySelector(`#id${note.note_id}`);

        noteForm.addEventListener('submit', e => {
            e.preventDefault();
        })

        setTitle(note.title);
        dialog.close();
    }

    return(
        <>
            <button onClick={() => viewNote() } className="border border-black rounded p-1 bg-blue-500 text-white mt-1">Edit</button>

            <dialog id={`id${note.note_id}`} className="place-self-center p-4 border border-black rounded-xl h-5/6 w-10/12">
                <form id="view-note-form" className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
                    <h2>Create new Note</h2>

                    <section className="flex flex-col">
                        <label htmlFor="view-title">Title</label>
                        <input type="text" id="view-title" className="border border-black rounded p-2" value={title} onChange={e => setTitle(e.target.value)}/>
                    </section>

                    <section className="flex flex-col">
                        <label htmlFor="view-content">Content</label>
                        <textarea name="view-content" id="view-content" className="border border-black rounded p-2 resize-none h-55"></textarea>
                    </section>

                    <section className="flex flex-col">
                        <label htmlFor="view-tag">Tag</label>
                        <input type="text" id="view-tag" className="border border-black rounded p-2"/>
                    </section>

                    <button className="border border-black p-2 rounded-xl text-white bg-green-500 font-bold" type="reset"
                        onClick={e => updateTitle(e)}
                    >Save</button>
                    <button className="border border-black p-2 rounded-xl text-white bg-red-500 font-bold" type="reset" onClick={() => cancelNote()}>Close</button>
                </form>
            </dialog>
        </>
    );
}

export default EditNote