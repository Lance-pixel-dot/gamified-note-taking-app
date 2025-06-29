function Notes()
{

    function createNote(){
        const dialog = document.querySelector('#new-note');

        dialog.showModal();
    }

    function saveNote(){
        const noteForm = document.querySelector('#note-form');
        noteForm.addEventListener('submit', e => {
            e.preventDefault();
        })
        const dialog = document.querySelector('#new-note');
        dialog.close();

        const getNoteTitle = document.querySelector('#title');
        const noteContainer = document.querySelector("#note-container");
        
        const noteDiv = document.createElement('div');
        noteDiv.setAttribute('class', 'border border-black p-2 rounded-xl');
        const noteTitle = document.createElement('h2');
        noteTitle.textContent = getNoteTitle.value;
        const viewBTN = document.createElement('button');
        viewBTN.textContent = 'View Note';
        viewBTN.setAttribute('class', 'border border-black p-2 rounded-xl text-white bg-blue-500 font-bold')
        viewBTN.addEventListener('click', () => {
            const viewDialog = document.querySelector('#view-note');

            viewDialog.showModal();
        })

        noteDiv.appendChild(noteTitle);
        noteDiv.appendChild(viewBTN);
        noteContainer.appendChild(noteDiv);
    }

    function cancelNote(){
        const noteForm = document.querySelector('#note-form');
        const dialog = document.querySelector('#new-note');
        const viewDialog = document.querySelector('#view-note');

        noteForm.addEventListener('submit', e => {
            e.preventDefault();
        })

        dialog.close();
        viewDialog.close();
    }
  

    return(
        <>
            <section className="h-5/6 border-b-2 border-r-2 border-l-2 border-black w-2/3 place-self-center pr-2 pl-2 pb-2 rounded-b-xl bg-gradient-to-r from-red-500 to-purple-500">
                <section className="border-black border-b border-r border-l bg-white rounded-b-xl h-96 flex flex-col gap-5 p-4">
                    <section className="flex h-10 gap-2 items-center">
                        <label htmlFor="search">Search</label>
                        <input id="search" className="border border-black rounded-xl w-auto h-7"></input>
                        <button className="border border-black p-2 rounded-xl ml-15 text-white bg-blue-500 font-bold" onClick={() => createNote()}>Create New Note</button>
                    </section>
                    <h2 className="text-3xl font-bold">Notes</h2>
                    <section id="note-container" className="border-2 h-70 rounded-xl overflow-y-auto p-4 flex flex-col gap-2">
                        {/* fills with notes */}
                    </section>
                </section>
            </section>

            <dialog id="new-note" className="place-self-center p-4 border border-black rounded-xl h-5/6 w-10/12">
                <form id="note-form" className="flex flex-col gap-4">
                    <h2>Create new Note</h2>

                    <section className="flex flex-col">
                        <label htmlFor="title">Title</label>
                        <input type="text" id="title" className="border border-black rounded p-2"/>
                    </section>

                    <section className="flex flex-col">
                        <label htmlFor="content">Content</label>
                        <textarea name="content" id="content" className="border border-black rounded p-2 resize-none h-55"></textarea>
                    </section>

                    <section className="flex flex-col">
                        <label htmlFor="tag">Tag</label>
                        <input type="text" id="tag" className="border border-black rounded p-2"/>
                    </section>

                    <button className="border border-black p-2 rounded-xl text-white bg-blue-500 font-bold" onClick={() => saveNote()}>Save</button>
                    <button className="border border-black p-2 rounded-xl text-white bg-red-500 font-bold" type="reset" onClick={() => cancelNote()}>Cancel</button>
                </form>
            </dialog>

            <dialog id="view-note" className="place-self-center p-4 border border-black rounded-xl h-5/6 w-10/12">
                <form id="note-form" className="flex flex-col gap-4">
                    <h2>Create new Note</h2>

                    <section className="flex flex-col">
                        <label htmlFor="view-title">Title</label>
                        <input type="text" id="view-title" className="border border-black rounded p-2"/>
                    </section>

                    <section className="flex flex-col">
                        <label htmlFor="view-content">Content</label>
                        <textarea name="view-content" id="view-content" className="border border-black rounded p-2 resize-none h-55"></textarea>
                    </section>

                    <section className="flex flex-col">
                        <label htmlFor="view-tag">Tag</label>
                        <input type="text" id="view-tag" className="border border-black rounded p-2"/>
                    </section>

                    <button className="border border-black p-2 rounded-xl text-white bg-red-500 font-bold" type="reset" onClick={() => cancelNote()}>Close</button>
                </form>
            </dialog>
        </>
    );
}

export default Notes