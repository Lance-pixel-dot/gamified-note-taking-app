function Flashcard(props){

    return(
        <>
            <section className={`h-5/6 border-b-2 border-r-2 border-l-2 border-black w-2/3 place-self-center pr-2 pl-2 pb-2 rounded-b-xl bg-gradient-to-r from-red-500 to-purple-500 ${props.flashcardHidden}`}>
                <section className="border-black border-b border-r border-l bg-white rounded-b-xl h-96 flex flex-col gap-5 p-4">
                    <section className="flex h-10 gap-2 items-center">
                        <label htmlFor="search">Search</label>
                        <input id="search" className="border border-black rounded-xl w-auto h-7"></input>
                        <button className="border border-black p-2 rounded-xl ml-15 text-white bg-blue-500 font-bold"
                        //  onClick={() => createNote()}
                         >Create New FLashcard</button>
                    </section>
                    <h2 className="text-3xl font-bold">Flashcards</h2>
                    <section id="note-container" className="border-2 h-70 rounded-xl overflow-y-auto p-4 flex flex-col gap-2">
                        {/* fills with flashcards */}
                    </section>
                </section>
            </section>
        </>
    );
}

export default Flashcard