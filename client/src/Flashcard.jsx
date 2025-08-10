import React, { useEffect, useState, useRef } from 'react';
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

async function saveFlashcard() {
  try {
    const body = { user_id, title, question, answer, tag };
    const response = await fetch("http://localhost:5000/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    const newFlashcard = data.flashcard;
    const newAchievements = data.newAchievements || [];

    // Append to flashcards state
    setFlashcards([...flashcards, newFlashcard]);

    // Clear input fields
    setTitle("");
    setQuestion("");
    setAnswer("");
    setTag("");

    props.onCreated();

    // Base XP for creating a flashcard
    if (props.incrementXP) {
      let totalXP = 3.5;

      // XP values per flashcard-related achievement ID
      const achievementXP = {
        6: 10,   // First Flashcard
        7: 50    // 50 Flashcards
      };

      for (const id of newAchievements) {
        if (achievementXP[id]) {
          totalXP += achievementXP[id];
        }
      }

      props.incrementXP(totalXP);
      props.updateCoinsInBackend(user_id, 1); // Add coins for creating a flashcard
    }

    // Award coins for flashcard achievements
    if (props.updateCoinsInBackend && newAchievements.length > 0) {
      await props.updateCoinsInBackend(user_id, newAchievements.length * 10);
    }

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
            fetchReadStatus(jsonData);
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
            window.location = "/dashboard";
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

    useEffect(() => {
      function handleFlashcardRead(event) {
        const { flashcardId } = event.detail;
        setReadFlashcardsToday(prev => [...new Set([...prev, flashcardId])]);
      }

      window.addEventListener("flashcardRead", handleFlashcardRead);

      return () => {
        window.removeEventListener("flashcardRead", handleFlashcardRead);
      };
    }, []);

    useEffect(() => {
  reviewFlashcardRefs.current = flashcards.map(() => React.createRef());
}, [flashcards]);

    const [readFlashcardsToday, setReadFlashcardsToday] = useState([]);
    const reviewFlashcardRefs = useRef([]);

 async function fetchReadStatus(flashcardsList) {
    try {
      const readStatuses = await Promise.all(flashcardsList.map(async (card) => {
        const res = await fetch(`http://localhost:5000/flashcards/can-review?user_id=${user_id}&flashcard_id=${card.flashcard_id}`)
        const data = await res.json();
        return {
          flashcard_id: card.flashcard_id,
          isRead: !data.canReview
        };
      }));

      const readIds = readStatuses.filter(f => f.isRead).map(f => f.flashcard_id);
      setReadFlashcardsToday(readIds);
    } catch (err) {
      console.error("Failed to fetch read status", err);
    }
  }

  function markFlashcardAsRead(flashcardId) {
    setReadFlashcardsToday(prev => [...new Set([...prev, flashcardId])]);
    window.dispatchEvent(new CustomEvent("flashcardRead", { detail: { flashcardId } }));
  }

    const [searchTerm, setSearchTerm] = useState('');

    return(
        <>
            <section className={`p-3 pt-0 bg-[var(--bg-color)] flash-container ${props.flashcardHidden}`}>
                <section className=" bg-[var(--accent-color)] rounded-b-xl h-5/6 flex flex-col p-4 pt-0 border border-[var(--header-text-color)] border-t-0">
                    <section className="flex h-10 gap-2 items-center">
                        <input id="search" className="border border-[var(--header-text-color)] text-[var(--header-text-color)] rounded-xl h-7 w-full" onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}></input>
                    </section>
                    <section id="flashcard-container" className="border-2 border-[var(--header-text-color)] flex-1 overflow-y-auto rounded-xl p-4 flex flex-col gap-2 items-stretch">
                        {/* fills with flashcards */}
                        {flashcards
                             .filter(f => f.title.toLowerCase().includes(searchTerm) || f.tag.toLowerCase().includes(searchTerm))
                             .map((flashcard, index) => {
                               if (!reviewFlashcardRefs.current[index]) {
                                 reviewFlashcardRefs.current[index] = React.createRef();
                               }
                           
                               const isReview = readFlashcardsToday.includes(flashcard.flashcard_id);
                           
                               return (
                                     <div
                                       className={`border border-[var(--header-text-color)] text-[var(--header-text-color)] rounded-xl p-2 flex items-center gap-2 ${isReview ? 'bg-[var(--read-color)]' : 'bg-[var(--accent-color)]'}`}
                                       key={flashcard.flashcard_id}
                                       onClick={() => {
                                         reviewFlashcardRefs.current[index]?.current?.open(flashcard);
                                       }}
                                     >
                                       <div className={`rounded-xl w-3 h-full border-2 border-black ${isReview ? 'bg-red-500' : 'bg-green-500'}`} />
                                       <div className="w-full">
                                         <h2 className="font-bold text-sm">{flashcard.title}</h2>
                                         <span className="text-xs text-[var(tag-color)] italic">Tag: {flashcard.tag}</span>
                                       </div>
                                       <div className="flex flex-col gap-2 items-end" onClick={(e) => e.stopPropagation()}>
                                         <EditFlashcard
                                           flashcard={flashcard}
                                           updateFlashcardsDisplay={(updated) =>
                                             setFlashcards(prev => prev.map(card => card.flashcard_id === updated.flashcard_id ? updated : card))
                                           }
                                         />
                                         <button className="border border-black rounded p-1 bg-red-500 text-white ml-1"
                                           onClick={() => deleteFlashcard(flashcard.flashcard_id)}
                                         >
                                           Delete
                                         </button>
                                       </div>
                                     
                                       <ReviewFlashcard
                                         flashcard={flashcard}
                                         ref={reviewFlashcardRefs.current[index]}
                                         incrementXP={props.incrementXP}
                                         onCreated={props.onCreated}
                                         updateCoinsInBackend={props.updateCoinsInBackend}
                                         markFlashcardAsRead={markFlashcardAsRead}
                                       />
                                     </div>
                               );
                             })}
                        <button className="border border-[var(--header-text-color)] p-2 rounded-xl text-[var(--header-text-color)] bg-[var(--accent-color)] font-bold w-full"
                         onClick={() => createFlashcard()}
                         >+ Create New FLashcard</button>
                    </section>
                </section>
            </section>

            <dialog id="new-flashcard" className="place-self-center p-4 bg-[var(--bg-color)] text-[var(--text-color)] border border-[var(--text-color)] rounded-xl h-5/6 w-10/12">
                <form id="flashcard-form" className="flex flex-col gap-4" onSubmit={(e) => {e.preventDefault(); saveFlashcard()}}>
                    <h2 className='font-bold text-lg' >Create new Flashcard</h2>

                    <section className="flex flex-col">
                        <label htmlFor="flashcard-title" className='font-bold text-sm'>Title</label>
                        <input type="text" id="flashcard-title" className="border rounded p-2 text-xs border-[var(--text-color)] text-[var(--text-color)]"
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
                            <label htmlFor="front" className='font-bold text-sm'>Front</label>
                            <span>{question.length}/{MAX_QUESTION_CHARS}</span>
                        </section>
                        <textarea name="front" id="front" className="border border-[var(--text-color)] text-[var(--text-color)] rounded p-2 resize-none h-30 text-xs"
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
                            <label htmlFor="back" className='font-bold text-sm'>Back</label>
                            <span>{answer.length}/{MAX_ANSWER_CHARS}</span>
                        </section>
                        <textarea name="back" id="back" className="border border-[var(--text-color)] text-[var(--text-color)] rounded p-2 resize-none h-30 text-xs"
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
                        <label htmlFor="flashcard-tag" className='font-bold text-sm'>Tag</label>
                        <input type="text" id="flashcard-tag" className="border border-[var(--text-color)] text-[var(--text-color)] rounded p-2 text-xs"
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

                    <button className="border border-black p-2 rounded-xl text-[var(--button-text-color)] bg-[var(--button-bg-color)] font-bold text-sm" type="submit">Save</button>
                    <button className="border border-black p-2 rounded-xl text-[var(--button-text-color)] bg-[var(--cancel-btn-bg-color)] font-bold text-sm" type="reset" onClick={() => cancelFlashcard()}>Cancel</button>
                </form>
            </dialog>
        </>
    );
}

export default Flashcard