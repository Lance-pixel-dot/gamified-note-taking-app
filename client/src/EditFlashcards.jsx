import { useState } from "react";

function EditFlashcard({ flashcard, updateFlashcardsDisplay }){

    const [title, setTitle] = useState(flashcard.title);
    const [question, setQuestion] = useState(flashcard.question);
    const [answer, setAnswer] = useState(flashcard.answer);
    const [tag, setTag] = useState(flashcard.tag);

    function openFlashcard(){
        const dialog = document.querySelector(`#edit-flashcard-id${flashcard.flashcard_id}`);

        dialog.showModal();
    }

    async function updateFlashcard(){
        try {
            const body = { title, question, answer, tag }
            const response = await fetch(`http://localhost:5000/flashcards/${flashcard.flashcard_id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(body)
            })

            const updatedFlashcard = await response.json();

            // Call the parent-provided function to update the flashcard in the list
            updateFlashcardsDisplay(updatedFlashcard);

        } catch (err) {
            console.error(err.message);
        }
        document.querySelector(`#edit-flashcard-id${flashcard.flashcard_id}`).close();
    }


    function cancelFlashcard(){
        const flashcardForm = document.querySelector("#flashcard-form");
        const dialog = document.querySelector(`#edit-flashcard-id${flashcard.flashcard_id}`);

        flashcardForm.addEventListener('submit', e => {
            e.preventDefault();
        })

        setTitle(flashcard.title);
        setQuestion(flashcard.question);
        setAnswer(flashcard.answer);
        setTag(flashcard.tag);
        dialog.close();
    }

    //char counter
    const MAX_TITLE_CHARS = 50;
    const MAX_QUESTION_CHARS = 100;
    const MAX_ANSWER_CHARS = 100;
    const MAX_TAG_CHARS = 50;

    return(
        <>
            <button className="border border-black rounded p-1 bg-orange-500 text-white mt-1 ml-1" onClick={() => {openFlashcard()}}>Edit</button>

            <dialog id={`edit-flashcard-id${flashcard.flashcard_id}`} className="place-self-center p-4 border border-black rounded-xl h-5/6 w-10/12">
                <form id="flashcard-form" className="flex flex-col gap-4" onSubmit={(e) => {e.preventDefault(); updateFlashcard()}}>
                    <h2>Flashcard Details</h2>

                    <section className="flex flex-col">
                        <label htmlFor="flashcard-view-title">Title</label>
                        <input type="text" id="flashcard-view-title" className="border border-black rounded p-2"
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
                            <label htmlFor="flashcard-view-front">Front</label>
                            <span>{question.length}/{MAX_QUESTION_CHARS}</span>
                        </section>
                        <textarea name="flashcard-view-front" id="flashcard-view-front" className="border border-black rounded p-2 resize-none h-30"
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
                            <label htmlFor="flashcard-view-back">Back</label>
                            <span>{answer.length}/{MAX_ANSWER_CHARS}</span>
                        </section>
                        <textarea name="flashcard-view-back" id="flashcard-view-back" className="border border-black rounded p-2 resize-none h-30"
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
                        <label htmlFor="flashcard-view-tag">Tag</label>
                        <input type="text" id="flashcard-view-tag" className="border border-black rounded p-2"
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
                    <button className="border border-black p-2 rounded-xl text-white bg-red-500 font-bold" type="reset" onClick={() => cancelFlashcard()}>Close</button>
                </form>
            </dialog>
        </>
    );
}

export default EditFlashcard