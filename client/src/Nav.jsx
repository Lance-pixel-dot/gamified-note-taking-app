import { useState, useRef } from 'react';
import Notes from './Notes';
import Flashcard from './Flashcard';
import ShareNotes from './SharedNotes';
import ShareFlashcards from './SharedFlashcards';
import Achievements from './Achievements';

function Nav({ incrementXP, handleCreated, achievementsRef }) {
  const getCurrentTab = localStorage.getItem("currentTab");
  const [activeTab, setActiveTab] = useState(getCurrentTab);

  // Save currentTab whenever it changes
  localStorage.setItem("currentTab", activeTab);

  return (
    <>
      <section id='nav-container' className="w-2/3 place-self-center px-1.5 flex flex-col gap-1 text-white bg-gradient-to-r from-red-500 to-purple-500 rounded-t-xl border-l-2 border-r-2 border-black pr-2 pl-2">
        <nav className="flex justify-between mt-3.5">
          {/* NAV BUTTONS */}
          <button
            className={`bg-white text-black p-2 rounded-t-xl border border-black ${activeTab === 'notes' ? 'border-b-0' : 'border-b'}`}
            onClick={() => setActiveTab('notes')}
          >Notes</button>

          <button
            className={`bg-white text-black p-2 rounded-t-xl border border-black ${activeTab === 'flashcard' ? 'border-b-0' : 'border-b'}`}
            onClick={() => setActiveTab('flashcard')}
          >Flashcard</button>

          <button
            className={`bg-white text-black p-2 rounded-t-xl border border-black ${activeTab === 'share' ? 'border-b-0' : 'border-b'}`}
            onClick={() => setActiveTab('share')}
          >Shared with me (notes)</button>

          <button
            className={`bg-white text-black p-2 rounded-t-xl border border-black ${activeTab === 'shareFlash' ? 'border-b-0' : 'border-b'}`}
            onClick={() => setActiveTab('shareFlash')}
          >Shared with me (flashcards)</button>

          <button
            className={`bg-white text-black p-2 rounded-t-xl border border-black ${activeTab === 'achievements' ? 'border-b-0' : 'border-b'}`}
            onClick={() => setActiveTab('achievements')}
          >Achievements</button>
        </nav>
      </section>

      {/* COMPONENTS */}
      <Notes
        notesHidden={activeTab !== 'notes' ? 'hidden' : ''}
        incrementXP={incrementXP}
        onCreated={handleCreated}
      />
      <Flashcard
        flashcardHidden={activeTab !== 'flashcard' ? 'hidden' : ''}
        incrementXP={incrementXP}
        onCreated={handleCreated}
      />
      <ShareNotes
        shareNotesHidden={activeTab !== 'share' ? 'hidden' : ''}
        incrementXP={incrementXP}
        onCreated={handleCreated}
      />
      <ShareFlashcards
        shareFlashcardsHidden={activeTab !== 'shareFlash' ? 'hidden' : ''}
        incrementXP={incrementXP}
        onCreated={handleCreated}
      />
      <Achievements
        ref={achievementsRef}
        achievementsHidden={activeTab !== 'achievements' ? 'hidden' : ''}
      />
    </>
  );
}

export default Nav;
