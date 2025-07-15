import { useState } from 'react';
import Notes from './Notes';
import Flashcard from './Flashcard';
import ShareNotes from './SharedNotes';
import ShareFlashcards from './SharedFlashcards';

function Nav({ incrementXP }) {
  const getCurrentTab = localStorage.getItem("currentTab");

  const [activeTab, setActiveTab] = useState(getCurrentTab); // default active tab

  const setCurrentTab = localStorage.setItem("currentTab", activeTab);

  return (
    <>
      <section id='nav-container' className="w-2/3 place-self-center px-1.5 flex flex-col gap-1 text-white bg-gradient-to-r from-red-500 to-purple-500 rounded-t-xl border-l-2 border-r-2 border-black pr-2 pl-2">
        <nav className="flex justify-between mt-3.5">
          <button
            className={`bg-white text-black p-2 rounded-t-xl border border-black ${
              activeTab === 'notes' ? 'border-b-0' : 'border-b'
            }`}
            onClick={() => {setActiveTab('notes'); }}
          >
            Notes
          </button>
          <button
            className={`bg-white text-black p-2 rounded-t-xl border border-black ${
              activeTab === 'flashcard' ? 'border-b-0' : 'border-b'
            }`}
            onClick={() => setActiveTab('flashcard')}
          >
            Flashcard
          </button>
          <button
            className={`bg-white text-black p-2 rounded-t-xl border border-black ${
              activeTab === 'share' ? 'border-b-0' : 'border-b'
            }`}
            onClick={() => setActiveTab('share')}
          >
            Shared with me (notes)
          </button>
          <button
            className={`bg-white text-black p-2 rounded-t-xl border border-black ${
              activeTab === 'shareFlash' ? 'border-b-0' : 'border-b'
            }`}
            onClick={() => setActiveTab('shareFlash')}
          >
            Shared with me (flashcards)
          </button>
        </nav>
      </section>

      {/* Show/hide components based on activeTab */}
      <Notes notesHidden={activeTab !== 'notes' ? 'hidden' : ''} incrementXP={incrementXP} />
      <Flashcard flashcardHidden={activeTab !== 'flashcard' ? 'hidden' : ''} />
      <ShareNotes shareNotesHidden={activeTab !== 'share' ? 'hidden' : ''}></ShareNotes>
      <ShareFlashcards shareFlashcardsHidden={activeTab !== 'shareFlash' ? 'hidden' : ''}></ShareFlashcards>
    </>
  );
}

export default Nav;
