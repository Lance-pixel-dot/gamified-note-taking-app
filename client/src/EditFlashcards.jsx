import { useRef, useState } from "react";

function EditFlashcard({ flashcard, updateFlashcardsDisplay }) {
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
        `http://localhost:5000/flashcards/${flashcard.flashcard_id}`,
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
        className="border border-black rounded p-1 bg-orange-500 text-white mt-1 ml-1"
        onClick={openFlashcard}
      >
        Edit
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
          <h2>Flashcard Details</h2>

          <section className="flex flex-col">
            <label htmlFor="flashcard-view-title">Title</label>
            <input
              type="text"
              id="flashcard-view-title"
              className="border rounded p-2 text-xs border-[var(--text-color)] text-[var(--text-color)]"
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
              <label htmlFor="flashcard-view-front">Front</label>
              <span>{question.length}/{MAX_QUESTION_CHARS}</span>
            </section>
            <textarea
              name="flashcard-view-front"
              id="flashcard-view-front"
              className="border border-[var(--text-color)] text-[var(--text-color)] rounded p-2 resize-none h-30 text-xs"
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
              <label htmlFor="flashcard-view-back">Back</label>
              <span>{answer.length}/{MAX_ANSWER_CHARS}</span>
            </section>
            <textarea
              name="flashcard-view-back"
              id="flashcard-view-back"
              className="border border-[var(--text-color)] text-[var(--text-color)] rounded p-2 resize-none h-30 text-xs"
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
            <label htmlFor="flashcard-view-tag">Tag</label>
            <input
              type="text"
              id="flashcard-view-tag"
              className="border rounded p-2 text-xs border-[var(--text-color)] text-[var(--text-color)]"
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
            className="border border-black p-2 rounded-xl text-[var(--button-text-color)] bg-[var(--button-bg-color)] font-bold text-sm"
            type="submit"
          >
            Save
          </button>
          <button
            className="border border-black p-2 rounded-xl text-[var(--button-text-color)] bg-[var(--cancel-btn-bg-color)] font-bold text-sm"
            type="reset"
            onClick={cancelFlashcard}
          >
            Close
          </button>
        </form>
      </dialog>
      
      <dialog id="flash-error-message" className="place-self-center p-4 border border-black rounded-xl text-center" ref={errorRef}>
              <div className="flex flex-col gap-4">
                <h2 className="font-bold">Error</h2>
                <p className="w-50">This change/edit couldn't be saved because it's either the owner deleted this content or does not exist anymore</p>
                <button className="font-bold bg-orange-500 text-white rounded border border-black" onClick={closeError}>Ok</button>
              </div>
      </dialog>
    </>
  );
}

export default EditFlashcard;
