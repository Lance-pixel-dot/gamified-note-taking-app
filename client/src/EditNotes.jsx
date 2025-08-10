import { useRef, useState } from "react";
import edit from './assets/icons/edit.png';

function EditNote({ note, updateNotesDisplay }) {
  const dialogRef = useRef(null); // Ref for dialog
  const errorRef = useRef(null);

  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [tag, setTag] = useState(note.tag);

  async function updateNote() {
    try {
      const body = { title, content, tag };
      const response = await fetch(`http://localhost:5000/notes/${note.note_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const updatedNote = await response.json();
      updateNotesDisplay(updatedNote);

      window.dispatchEvent(new CustomEvent("noteUpdated", { detail: updatedNote }));
      window.location = "/dashboard";
      dialogRef.current?.close();
    } catch (err) {
      console.error(err.message);
      errorActivate();
    }
  }

  function viewNote() {
    dialogRef.current?.showModal();
  }

  function cancelNote() {
    setTitle(note.title);
    setContent(note.content);
    setTag(note.tag);
    dialogRef.current?.close();
  }

  const MAX_CHARS = 500;
  const MAX_TITLE_CHARS = 50;
  const MAX_TAG_CHARS = 50;

  function errorActivate(){
    dialogRef.current.close();
    errorRef.current.showModal();
  }

  function closeError(){
    errorRef.current.close();
  }

  return (
    <>
      <button onClick={viewNote} className="w-8">
        <img src={edit} alt="edit-icon" />
      </button>

      <dialog ref={dialogRef} className="place-self-center p-4 border border-[var(--text-color)] bg-[var(--bg-color)] text-[var(--text-color)] rounded-xl h-5/6 w-10/12">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            updateNote();
          }}
        >
          <h2 className="font-bold text-lg">Edit Note</h2>

          <section className="flex flex-col">
            <label htmlFor="view-title" className="font-bold text-sm">Title</label>
            <input
              type="text"
              id="view-title"
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
              <label htmlFor="view-content" className="font-bold text-sm">Content</label>
              <span>{content.length}/{MAX_CHARS}</span>
            </section>
            <textarea
              id="view-content"
              className="border border-[var(--text-color)] text-[var(--text-color)] rounded p-2 resize-none h-55 text-xs"
              value={content}
              onChange={(e) => {
                const input = e.target.value;
                setContent(input.slice(0, MAX_CHARS));
              }}
              placeholder="Type your Content here (max 500 Characters)"
              required
            ></textarea>
          </section>

          <section className="flex flex-col">
            <label htmlFor="view-tag" className="font-bold text-sm">Tag</label>
            <input
              type="text"
              id="view-tag"
              className="border border-[var(--text-color)] text-[var(--text-color)] rounded p-2 text-xs"
              value={tag}
              onChange={(e) => {
                const input = e.target.value;
                setTag(input.slice(0, MAX_TAG_CHARS));
              }}
              placeholder="Type your Tag here (max 50 Characters)"
              required
            />
          </section>

          <button type="submit" className="border border-black p-2 rounded-xl text-[var(--button-text-color)] bg-[var(--button-bg-color)] font-bold text-sm">
            Save
          </button>
          <button type="button" onClick={cancelNote} className="border border-black p-2 rounded-xl text-[var(--button-text-color)] bg-[var(--cancel-btn-bg-color)] font-bold text-sm">
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

export default EditNote;
