function Flashcard(props){

     function createFlashcard(){
        const dialog = document.querySelector('#new-flashcard');

        dialog.showModal();
    }

    function saveFlashcard(){
        const flashcardForm = document.querySelector('#flashcard-form');
        flashcardForm.addEventListener('submit', e => {
            e.preventDefault();
        })
        const dialog = document.querySelector('#new-flashcard');
        dialog.close();

        const getFlashcardTitle = document.querySelector('#flashcard-title');
        const flashcardContainer = document.querySelector("#flashcard-container");
        
        const flashcardDiv = document.createElement('div');
        flashcardDiv.setAttribute('class', 'border border-black p-2 rounded-xl');
        const flashcardTitle = document.createElement('h2');
        flashcardTitle.textContent = getFlashcardTitle.value;

        const viewBTN = document.createElement('button');
        viewBTN.textContent = 'View flashcard';
        viewBTN.setAttribute('class', 'border border-black p-2 rounded-xl text-white bg-blue-500 font-bold')
        viewBTN.addEventListener('click', () => {
            const viewDialog = document.querySelector('#view-flashcard');

            viewDialog.showModal();
        })

        flashcardDiv.appendChild(flashcardTitle);
        flashcardDiv.appendChild(viewBTN);
        flashcardContainer.appendChild(flashcardDiv);
    }

    function cancelFlashcard(){
        const flashcardForm = document.querySelector('#flashcard-form');
        const dialog = document.querySelector('#new-flashcard');
        const viewDialog = document.querySelector('#view-flashcard');

        flashcardForm.addEventListener('submit', e => {
            e.preventDefault();
        })

        dialog.close();
        viewDialog.close();
    }

    return(
        <>
            <section className={`h-5/6 border-b-2 border-r-2 border-l-2 border-black w-2/3 place-self-center pr-2 pl-2 pb-2 rounded-b-xl bg-gradient-to-r from-red-500 to-purple-500 ${props.flashcardHidden}`}>
                <section className="border-black border-b border-r border-l bg-white rounded-b-xl h-96 flex flex-col gap-5 p-4">
                    <section className="flex h-10 gap-2 items-center">
                        <label htmlFor="search">Search</label>
                        <input id="search" className="border border-black rounded-xl w-auto h-7"></input>
                        <button className="border border-black p-2 rounded-xl ml-15 text-white bg-blue-500 font-bold"
                         onClick={() => createFlashcard()}
                         >Create New FLashcard</button>
                    </section>
                    <h2 className="text-3xl font-bold">Flashcards</h2>
                    <section id="flashcard-container" className="border-2 h-70 rounded-xl overflow-y-auto p-4 flex flex-col gap-2">
                        {/* fills with flashcards */}
                    </section>
                </section>
            </section>

            <dialog id="new-flashcard" className="place-self-center p-4 border border-black rounded-xl h-5/6 w-10/12">
                <form id="flashcard-form" className="flex flex-col gap-4">
                    <h2>Create new Flashcard</h2>

                    <section className="flex flex-col">
                        <label htmlFor="flashcard-title">Title</label>
                        <input type="text" id="flashcard-title" className="border border-black rounded p-2"/>
                    </section>

                    <section className="flex flex-col">
                        <label htmlFor="front">Front</label>
                        <textarea name="front" id="front" className="border border-black rounded p-2 resize-none h-30"></textarea>
                    </section>

                    <section className="flex flex-col">
                        <label htmlFor="back">Back</label>
                        <textarea name="back" id="back" className="border border-black rounded p-2 resize-none h-30"></textarea>
                    </section>

                    <section className="flex flex-col">
                        <label htmlFor="flashcard-tag">Tag</label>
                        <input type="text" id="flashcard-tag" className="border border-black rounded p-2"/>
                    </section>

                    <button className="border border-black p-2 rounded-xl text-white bg-blue-500 font-bold" onClick={() => saveFlashcard()}>Save</button>
                    <button className="border border-black p-2 rounded-xl text-white bg-red-500 font-bold" type="reset" onClick={() => cancelFlashcard()}>Cancel</button>
                </form>
            </dialog>

            <dialog id="view-flashcard" className="place-self-center p-4 border border-black rounded-xl h-5/6 w-10/12">
                <form id="flashcard-form" className="flex flex-col gap-4">
                    <h2>Flashcard Details</h2>

                    <section className="flex flex-col">
                        <label htmlFor="flashcard-view-title">Title</label>
                        <input type="text" id="flashcard-view-title" className="border border-black rounded p-2"/>
                    </section>

                    <section className="flex flex-col">
                        <label htmlFor="flashcard-view-front">Front</label>
                        <textarea name="flashcard-view-front" id="flashcard-view-front" className="border border-black rounded p-2 resize-none h-30"></textarea>
                    </section>

                    <section className="flex flex-col">
                        <label htmlFor="flashcard-view-back">Back</label>
                        <textarea name="flashcard-view-back" id="flashcard-view-back" className="border border-black rounded p-2 resize-none h-30"></textarea>
                    </section>

                    <section className="flex flex-col">
                        <label htmlFor="flashcard-view-tag">Tag</label>
                        <input type="text" id="flashcard-view-tag" className="border border-black rounded p-2"/>
                    </section>

                    <button className="border border-black p-2 rounded-xl text-white bg-red-500 font-bold" type="reset" onClick={() => cancelFlashcard()}>Close</button>
                </form>
            </dialog>
        </>
    );
}

export default Flashcard