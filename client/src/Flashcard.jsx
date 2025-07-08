import { useEffect, useState } from "react";
import EditFlashcard from "./EditFlashcards";
import ReviewFlashcard from "./ReviewFlashcards";

function Flashcard(props){

    function createFlashcard(){
        const dialog = document.querySelector('#new-flashcard');

        dialog.showModal();
    }

    const [title, setTitle] = useState("");
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [tag, setTag] = useState("");

    const user_id = localStorage.getItem("user_id");

    async function saveFlashcard(){
        try {
            const body = {user_id ,title, question, answer, tag };
            const response = await fetch("http://localhost:5000/flashcards", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            });

            const newFlashcard = await response.json();

            //Append it to the current state
            setFlashcards([...flashcards, newFlashcard]);

            setTitle(""); // clear input
            setQuestion("");
            setAnswer("");
            setTag("");
        } catch (err) {
            console.error(err.message);
        }
        document.querySelector('#new-flashcard').close();
    }

    //display flashcards
    const [flashcards, setFlashcards] = useState([]);

    async function displayFlashcards(){
        try {
            const response = await fetch(`http://localhost:5000/flashcards/user/${user_id}`);
            const jsonData = await response.json();

            setFlashcards(jsonData);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        displayFlashcards();
    }, []);

    //delete flashcard
    async function deleteFlashcard(id) {
        try {
            const deleteFlashcard = await fetch(`http://localhost:5000/flashcards/${id}`, {
                method: "DELETE"
            });

            setFlashcards(flashcards.filter(flashcard => flashcard.flashcard_id !== id));
        } catch (err) {
            console.error(err.message);
        }
    }

    function cancelFlashcard(){
        const flashcardForm = document.querySelector('#flashcard-form');
        const dialog = document.querySelector('#new-flashcard');

        flashcardForm.addEventListener('submit', e => {
            e.preventDefault();
        })

        setTitle("");
        setQuestion("");
        setAnswer("");
        setTag("");
        dialog.close();
    }

    //char counter
    const MAX_TITLE_CHARS = 50;
    const MAX_QUESTION_CHARS = 100;
    const MAX_ANSWER_CHARS = 100;
    const MAX_TAG_CHARS = 50;

    return(
        <>
            <section className={`h-5/6 border-b-2 border-r-2 border-l-2 border-black w-2/3 place-self-center pr-2 pl-2 pb-2 rounded-b-xl bg-gradient-to-r from-red-500 to-purple-500 ${props.flashcardHidden}`}>
                <section className="border-black border-b border-r border-l bg-white rounded-b-xl h-96 flex flex-col gap-5 p-4">
                    <section className="flex h-10 gap-2 items-center">
                        <label htmlFor="search">Search</label>
                        <input id="search" className="border border-black rounded-xl w-auto h-7"></input>
                        <button className="border border-black p-2 rounded-xl ml-9 text-white bg-blue-500 font-bold"
                         onClick={() => createFlashcard()}
                         >Create New FLashcard</button>
                    </section>
                    <h2 className="text-3xl font-bold">Flashcards</h2>
                    <section id="flashcard-container" className="border-2 h-70 rounded-xl overflow-y-auto p-4 flex flex-col gap-2">
                        {/* fills with flashcards */}
                        {flashcards.map(flashcard => (
                            <div className="border border-black rounded p-2" key={flashcard.flashcard_id}>
                                <h2>{flashcard.title}</h2>
                                <ReviewFlashcard flashcard={flashcard}></ReviewFlashcard>
                                <EditFlashcard flashcard={flashcard} updateFlashcardsDisplay={
                                    (updatedFlashcard) => {
                                        setFlashcards(prev => prev.map(card => card.flashcard_id === updatedFlashcard.flashcard_id ? updatedFlashcard : card))
                                    }
                                }
                                ></EditFlashcard>
                                <button className="border border-black rounded p-1 bg-red-500 text-white ml-1"
                                onClick={() => deleteFlashcard(flashcard.flashcard_id)}
                                >Delete</button>
                            </div>
                        ))}
                    </section>
                </section>
            </section>

            <dialog id="new-flashcard" className="place-self-center p-4 border border-black rounded-xl h-5/6 w-10/12">
                <form id="flashcard-form" className="flex flex-col gap-4" onSubmit={(e) => {e.preventDefault(); saveFlashcard()}}>
                    <h2>Create new Flashcard</h2>

                    <section className="flex flex-col">
                        <label htmlFor="flashcard-title">Title</label>
                        <input type="text" id="flashcard-title" className="border border-black rounded p-2"
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
                            <label htmlFor="front">Front</label>
                            <span>{question.length}/{MAX_QUESTION_CHARS}</span>
                        </section>
                        <textarea name="front" id="front" className="border border-black rounded p-2 resize-none h-30"
                        value={question} 
                        onChange={(e) => {
                                const input = e.target.value;
                                if (input.length <= MAX_QUESTION_CHARS) {
                                  setQuestion(input);
                                }else{
                                  setQuestion(input.slice(0, MAX_QUESTION_CHARS));
                                }
                            }
                        }
                        placeholder='Type your Question here (max 100 Characters)'
                        required
                        ></textarea>
                    </section>

                    <section className="flex flex-col">
                        <section className="flex justify-between">
                            <label htmlFor="back">Back</label>
                            <span>{answer.length}/{MAX_ANSWER_CHARS}</span>
                        </section>
                        <textarea name="back" id="back" className="border border-black rounded p-2 resize-none h-30"
                        value={answer} 
                        onChange={(e) => {
                                const input = e.target.value;
                                if (input.length <= MAX_ANSWER_CHARS) {
                                  setAnswer(input);
                                }else{
                                  setAnswer(input.slice(0, MAX_ANSWER_CHARS));
                                }
                            }
                        }
                        placeholder='Type your Answer here (max 100 Characters)'
                        required
                        ></textarea>
                    </section>

                    <section className="flex flex-col">
                        <label htmlFor="flashcard-tag">Tag</label>
                        <input type="text" id="flashcard-tag" className="border border-black rounded p-2"
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

                    <button className="border border-black p-2 rounded-xl text-white bg-green-500 font-bold" type="submit">Save</button>
                    <button className="border border-black p-2 rounded-xl text-white bg-red-500 font-bold" type="reset" onClick={() => cancelFlashcard()}>Cancel</button>
                </form>
            </dialog>
        </>
    );
}

export default Flashcard