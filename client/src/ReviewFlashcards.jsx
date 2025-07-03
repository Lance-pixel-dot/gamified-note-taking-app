import { useState } from "react";
function ReviewFlashcard({ flashcard }){

    const [isFlipped, setIsFlipped] = useState(false);

    const [display, setDisplay] = useState('hidden');

    function reviewFlashcard(){
        const dialog = document.querySelector(`#read-flashcard-id${flashcard.flashcard_id}`);

        dialog.showModal();
    }

    function emergencyClose(){
        const dialog = document.querySelector(`#read-flashcard-id${flashcard.flashcard_id}`);

        dialog.close();
    }

    return(
        <>
            <button onClick={() => {reviewFlashcard(); setDisplay("hidden")}} className="border border-black rounded p-1 bg-blue-500 text-white ml-1">Review</button>

            <dialog id={`read-flashcard-id${flashcard.flashcard_id}`} className="place-self-center p-4 border border-black rounded-xl h-5/6 w-10/12">
                <section className="flex flex-col justify-center items-center h-full gap-2">
                    <h2 className="text-xl font-bold mb-2">{flashcard.title}</h2>
                    <div className="w-80 h-48 perspective" onClick={() => {setIsFlipped(prev => !prev), setDisplay("flex")}}>
                        <div className={`relative w-full h-full duration-500 transform-style preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}>
                            {/* Front */}
                            <div className="absolute w-full h-full bg-white border border-gray-300 rounded-xl shadow-md backface-hidden flex flex-col justify-center items-center p-4 text-center">
                                <h3>Question:</h3>
                                <p className="text-gray-700 text-center">{flashcard.question}</p>
                            </div>
                            {/* Back */}
                            <div className="absolute w-full h-full bg-blue-100 border border-blue-300 rounded-xl shadow-md backface-hidden rotate-y-180 flex  flex-col text-center justify-center items-center p-4">
                                <h3>Answer:</h3>
                                <p className="text-lg font-semibold text-center">{flashcard.answer}</p>
                            </div>
                        </div>
                    </div>
                    <div className={`${display} flex-col gap-1 items-center`}>
                        <span>How well did you answer?</span>
                        <section className="flex gap-2">
                            <button className="mt-4 bg-green-500 text-white px-4 py-2 rounded" onClick={() => {emergencyClose(); setIsFlipped(false)}}>Easy</button>
                            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={() => {emergencyClose(); setIsFlipped(false)}}>Good</button>
                            <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded" onClick={() => {emergencyClose(); setIsFlipped(false)}}>Hard</button>
                        </section>
                    </div>
                </section>
            </dialog>

        </>
    );
}

export default ReviewFlashcard