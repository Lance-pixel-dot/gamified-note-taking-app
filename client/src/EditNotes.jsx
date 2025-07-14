import { useRef, useState } from "react";

function EditNote({ note, updateNotesDisplay }) {
  const dialogRef = useRef(null); // Ref for dialog

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
      dialogRef.current?.close();
    } catch (err) {
      console.error(err.message);
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

  return (
    <>
      <button onClick={viewNote} className="border border-black rounded p-1 bg-orange-500 text-white mt-1 ml-1">
        Edit
      </button>

      <dialog ref={dialogRef} className="place-self-center p-4 border border-black rounded-xl h-5/6 w-10/12">
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            updateNote();
          }}
        >
          <h2>Edit Note</h2>

          <section className="flex flex-col">
            <label htmlFor="view-title">Title</label>
            <input
              type="text"
              id="view-title"
              className="border border-black rounded p-2"
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
              <label htmlFor="view-content">Content</label>
              <span>{content.length}/{MAX_CHARS}</span>
            </section>
            <textarea
              id="view-content"
              className="border border-black rounded p-2 resize-none h-55"
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
            <label htmlFor="view-tag">Tag</label>
            <input
              type="text"
              id="view-tag"
              className="border border-black rounded p-2"
              value={tag}
              onChange={(e) => {
                const input = e.target.value;
                setTag(input.slice(0, MAX_TAG_CHARS));
              }}
              placeholder="Type your Tag here (max 50 Characters)"
              required
            />
          </section>

          <button type="submit" className="border border-black p-2 rounded-xl text-white bg-green-500 font-bold">
            Save
          </button>
          <button type="button" onClick={cancelNote} className="border border-black p-2 rounded-xl text-white bg-red-500 font-bold">
            Close
          </button>
        </form>
      </dialog>
    </>
  );
}

export default EditNote;
