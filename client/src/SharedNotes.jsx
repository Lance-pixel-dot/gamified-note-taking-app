import { useEffect, useState } from "react";

function ShareNotes(props){

    function openShare(){
        const dialog = document.querySelector("#share-dialog");

        displayNotes();

        dialog.showModal()
    }

    function cancelShare(){
        const dialog = document.querySelector("#share-dialog");

        dialog.close()
    }

    const user_id = localStorage.getItem("user_id");

    //display note
    const [notes, setNotes] = useState([]);

    async function displayNotes(){
        try {
            const response = await fetch(`http://localhost:5000/notes/user/${user_id}`);
            const jsonData = await response.json();

            setNotes(jsonData);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        displayNotes();
    }, []);

    function openUsers(){
        const dialog = document.querySelector("#users-dialog");
        const dialogShare = document.querySelector("#share-dialog");

        dialog.showModal()
        dialogShare.close()
    }

    function closeUsers(){
       const dialog = document.querySelector("#users-dialog");
       const dialogShare = document.querySelector("#share-dialog");

       dialog.close()
       dialogShare.showModal()
    }

    //display users
    const [users, setUsers] = useState([]);

    async function displayUsers(){
        try {
            const response = await fetch(`http://localhost:5000/users`);
            const jsonData = await response.json();

            setUsers(jsonData);
        } catch (err) {
            console.error(err.message);
        }
    }

    useEffect(() => {
        displayUsers();
    }, []);

    const [buttonStates, setButtonStates] = useState({});

    const toggleButton = (userId) => {
    setButtonStates((prev) => ({
      ...prev,
      [userId]: prev[userId] === "Undo" ? "Add" : "Undo"
    }));
    };

    //add shared notes
    const [sharedNoteID, setSharedNoteID] = useState("");
    const [sharedUserID, setSharedUserID] = useState("");

    async function saveSharedNote(){
    try {
        const body = { 
            note_id: sharedNoteID,
            shared_user_id: sharedUserID 
        };
        const response = await fetch("http://localhost:5000/shared_notes", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(body)
        });
    } catch (err) {
        console.error(err.message);
    }
    }

    return(
        <>
            <section className={`h-5/6 border-b-2 border-r-2 border-l-2 border-black w-2/3 place-self-center pr-2 pl-2 pb-2 rounded-b-xl bg-gradient-to-r from-red-500 to-purple-500 ${props.shareNotesHidden}`}>
                <section className="border-black border-b border-r border-l bg-white rounded-b-xl h-96 flex flex-col gap-5 p-4">
                    <section className="flex h-10 gap-2 items-center">
                        <label htmlFor="search">Search</label>
                        <input id="search" className="border border-black rounded-xl w-auto h-7"></input>
                        <button className="border border-black p-2 rounded-xl ml-15 text-white bg-blue-500 font-bold" onClick={() => openShare()}>Share Notes</button>
                    </section>
                    <h2 className="text-3xl font-bold">Shared Notes</h2>
                    <section id="note-container" className="border-2 h-70 rounded-xl overflow-y-auto p-4 flex flex-col gap-2">
                        {/* fills with shared notes */}
                    </section>
                </section>
            </section>

            <dialog id="share-dialog" className="place-self-center p-4 border border-black rounded-xl h-5/6 w-10/12">
                <section className="h-full flex flex-col gap-4">
                    <h2>Select Notes You Want to Share</h2>
                    <div className="border-2 h-5/6 rounded-xl overflow-y-auto p-4 flex flex-col gap-2">
                        {/* select notes here */}
                        {notes.map(notes => (
                            <div className="border border-black rounded p-2 flex justify-between items-center" key={notes.note_id}>
                                <h2>{notes.title}</h2>
                                <button className="border border-black rounded p-1 bg-blue-500 text-white mt-1 ml-1" onClick={() => { openUsers();
                                setSharedNoteID(notes.note_id);
                                }}>Share</button>
                            </div>
                        ))}
                    </div>
                    <button className="border border-black p-2 rounded-xl text-white bg-orange-500 font-bold" onClick={() => cancelShare()}>Close</button>
                </section>
            </dialog>

            <dialog id="users-dialog" className="place-self-center p-4 border border-black rounded-xl h-4/6 w-10/12">
                <section className="h-full flex flex-col gap-4">
                    <h2>Select the Person who you want Share with</h2>
                    <div className="border-2 h-5/6 rounded-xl overflow-y-auto p-4 flex flex-col gap-2">
                    {users.map(user => {
                        const status = buttonStates[user.user_id] || "Add";
                        if(user.user_id != user_id)
                        {
                            return (
                                <div className="border border-black rounded p-2 flex justify-between items-center" key={user.user_id}>
                                  <h2>{user.username}</h2>
                                  <button
                                    className={`border border-black rounded p-1 ${status !== "Undo" ? 'bg-green-500' : 'bg-red-500'} text-white mt-1 ml-1`}
                                    onClick={() => {
                                        toggleButton(user.user_id);
                                        setSharedUserID(user.user_id);
                                        saveSharedNote();
                                    }}
                                    >
                                    {status}
                                  </button>
                                </div>
                            );
                        }
                        })}
                    </div>
                    <button className="border border-black p-2 rounded-xl text-white bg-blue-500 font-bold" onClick={() => closeUsers()}>Done</button>
                </section>
            </dialog>
        </>
    );
}

export default ShareNotes;