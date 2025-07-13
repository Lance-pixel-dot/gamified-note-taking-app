function ReadNotes({ note }){

    function readNote(){
        const dialog = document.querySelector(`#read-id${note.note_id}`);

        dialog.showModal();
    }

    function closeNote(){
        const dialog = document.querySelector(`#read-id${note.note_id}`);

        dialog.close();
    }

    return(
        <> 

            <button onClick={() => readNote()} className="border border-black rounded p-1 bg-blue-500 text-white ml-1">Read</button>

            <dialog id={`read-id${note.note_id}`} className="place-self-center p-4 border border-black rounded-xl h-5/6 w-10/12">
                <section className="flex flex-col justify-between h-full">
                    <h1 className="text-xl font-bold">{note.title}</h1>
                    <span>Tag: {note.tag}</span>
                    <p className=" border border-black rounded p-2 break-words h-4/5">{note.content}</p>
                    <button className="border border-black p-2 rounded-xl text-white bg-green-500 font-bold" onClick={() => closeNote()}>Done</button>
                </section>
            </dialog>
        </>
    );
}

export default ReadNotes