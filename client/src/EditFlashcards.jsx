import { useRef, useState } from "react";

function EditFlashcard({ flashcard, updateFlashcardsDisplay, api }) {
  const dialogRef = useRef(null);
  const formRef = useRef(null);
  const errorRef = useRef(null);

  const [title, setTitle] = useState(flashcard.title);
  const [question, setQuestion] = useState(flashcard.question);
  const [answer, setAnswer] = useState(flashcard.answer);
  const [tag, setTag] = useState(flashcard.tag);

  const MAX_TITLE_CHARS = 50;
  const MAX_QUESTION_CHARS = 100;
  const MAX_ANSWER_CHARS = 100;
  const MAX_TAG_CHARS = 50;

  function openFlashcard() {
    if (dialogRef.current) {
      dialogRef.current.showModal();
    }
  }

  function cancelFlashcard() {
    if (formRef.current) {
      formRef.current.addEventListener("submit", (e) => e.preventDefault());
    }

    setTitle(flashcard.title);
    setQuestion(flashcard.question);
    setAnswer(flashcard.answer);
    setTag(flashcard.tag);

    if (dialogRef.current) {
      dialogRef.current.close();
    }
  }

  async function updateFlashcard() {
    try {
      const body = { title, question, answer, tag };
      const response = await fetch(
        `${api}/flashcards/${flashcard.flashcard_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      const updatedFlashcard = await response.json();
      updateFlashcardsDisplay(updatedFlashcard);
      window.location = "/dashboard";
    } catch (err) {
      console.error(err.message);
      activateError();
    }

    if (dialogRef.current) {
      dialogRef.current.close();
    }
  }

  function activateError(){
    errorRef.current.showModal();
  }

  function closeError(){
    errorRef.current.close();
  }

  return (
    <>
      <button
        className='group hover:bg-[var(--highlight-color)] rounded p-1'
        onClick={openFlashcard}
      >
        <svg
            className="w-7 text-[var(--edit-color)] group-hover:text-[var(--accent-color)]"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M21.1213 2.70705C19.9497 1.53548 18.0503 1.53547 16.8787 2.70705L15.1989 4.38685L7.29289 12.2928C7.16473 12.421 7.07382 12.5816 7.02986 12.7574L6.02986 16.7574C5.94466 17.0982 6.04451 17.4587 6.29289 17.707C6.54127 17.9554 6.90176 18.0553 7.24254 17.9701L11.2425 16.9701C11.4184 16.9261 11.5789 16.8352 11.7071 16.707L19.5556 8.85857L21.2929 7.12126C22.4645 5.94969 22.4645 4.05019 21.2929 2.87862L21.1213 2.70705ZM18.2929 4.12126C18.6834 3.73074 19.3166 3.73074 19.7071 4.12126L19.8787 4.29283C20.2692 4.68336 20.2692 5.31653 19.8787 5.70705L18.8622 6.72357L17.3068 5.10738L18.2929 4.12126ZM15.8923 6.52185L17.4477 8.13804L10.4888 15.097L8.37437 15.6256L8.90296 13.5112L15.8923 6.52185ZM4 7.99994C4 7.44766 4.44772 6.99994 5 6.99994H10C10.5523 6.99994 11 6.55223 11 5.99994C11 5.44766 10.5523 4.99994 10 4.99994H5C3.34315 4.99994 2 6.34309 2 7.99994V18.9999C2 20.6568 3.34315 21.9999 5 21.9999H16C17.6569 21.9999 19 20.6568 19 18.9999V13.9999C19 13.4477 18.5523 12.9999 18 12.9999C17.4477 12.9999 17 13.4477 17 13.9999V18.9999C17 19.5522 16.5523 19.9999 16 19.9999H5C4.44772 19.9999 4 19.5522 4 18.9999V7.99994Z"
              fill="currentColor"
            />
          </svg>
      </button>

      <dialog
        ref={dialogRef}
        className="place-self-center p-4 border border-[var(--text-color)] bg-[var(--bg-color)] text-[var(--text-color)] rounded-xl h-5/6 w-10/12"
      >
        <form
          ref={formRef}
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            updateFlashcard();
          }}
        >
          <h2 className="font-bold text-lg md:text-xl">Flashcard Details</h2>

          <section className="flex flex-col">
            <label htmlFor="flashcard-view-title" className="font-bold text-sm md:text-base xl:text-lg">Title</label>
            <input
              type="text"
              id="flashcard-view-title"
              className="border rounded p-2 text-xs border-[var(--text-color)] text-[var(--text-color)] md:text-sm xl:text-base"
              value={title}
              onChange={(e) => {
                const input = e.target.value;
                setTitle(input.slice(0, MAX_TITLE_CHARS));
              }}
              placeholder="Type your Title here (max 50 Characters)"
              required
            />
          </section>

          <section className="flex flex-col">
            <section className="flex justify-between">
              <label htmlFor="flashcard-view-front" className="font-bold text-sm md:text-base xl:text-lg">Front</label>
              <span>{question.length}/{MAX_QUESTION_CHARS}</span>
            </section>
            <textarea
              name="flashcard-view-front"
              id="flashcard-view-front"
              className="border border-[var(--text-color)] text-[var(--text-color)] rounded p-2 resize-none h-30 text-xs md:text-sm xl:text-base"
              value={question}
              onChange={(e) => {
                const input = e.target.value;
                setQuestion(input.slice(0, MAX_QUESTION_CHARS));
              }}
              placeholder="Type your Question here (max 100 Characters)"
              required
            ></textarea>
          </section>

          <section className="flex flex-col">
            <section className="flex justify-between">
              <label htmlFor="flashcard-view-back" className="font-bold text-sm md:text-base xl:text-lg">Back</label>
              <span>{answer.length}/{MAX_ANSWER_CHARS}</span>
            </section>
            <textarea
              name="flashcard-view-back"
              id="flashcard-view-back"
              className="border border-[var(--text-color)] text-[var(--text-color)] rounded p-2 resize-none h-30 text-xs md:text-sm xl:text-base"
              value={answer}
              onChange={(e) => {
                const input = e.target.value;
                setAnswer(input.slice(0, MAX_ANSWER_CHARS));
              }}
              placeholder="Type your Answer here (max 100 Characters)"
              required
            ></textarea>
          </section>

          <section className="flex flex-col">
            <label htmlFor="flashcard-view-tag" className="font-bold text-sm md:text-base xl:text-lg">Tag</label>
            <input
              type="text"
              id="flashcard-view-tag"
              className="border rounded p-2 text-xs border-[var(--text-color)] text-[var(--text-color)] md:text-sm xl:text-base"
              value={tag}
              onChange={(e) => {
                const input = e.target.value;
                setTag(input.slice(0, MAX_TAG_CHARS));
              }}
              placeholder="Type your Tag here (max 50 Characters)"
              required
            />
          </section>

          <button
            className="border border-black p-2 rounded-xl text-[var(--button-text-color)] bg-[var(--button-bg-color)] font-bold text-sm md:text-base"
            type="submit"
          >
            Save
          </button>
          <button
            className="border border-black p-2 rounded-xl text-[var(--button-text-color)] bg-[var(--cancel-btn-bg-color)] font-bold text-sm md:text-base"
            type="reset"
            onClick={cancelFlashcard}
          >
            Close
          </button>
        </form>
      </dialog>
      
      <dialog id="flash-error-message" className="place-self-center p-4 border border-[var(--text-color)] text-[var(--text-color)] bg-[var(--bg-color)] rounded-xl text-center" ref={errorRef}>
              <div className="flex flex-col gap-4">
                <h2 className="font-bold">Error</h2>
                <p className="w-50">This change/edit couldn't be saved because it's either the owner deleted this content or does not exist anymore</p>
                <button className="font-bold h-10 bg-[var(--warning-btn-bg-color)] text-[var(--button-text-color)] rounded border border-black" onClick={closeError}>Ok</button>
              </div>
      </dialog>
    </>
  );
}

export default EditFlashcard;
