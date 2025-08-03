import { useState, useRef } from 'react';
import Notes from './Notes';
import Flashcard from './Flashcard';
import ShareNotes from './SharedNotes';
import ShareFlashcards from './SharedFlashcards';
import Achievements from './Achievements';

function Nav({ incrementXP, handleCreated, achievementsRef, updateCoinsInBackend }) {
  const getCurrentTab = localStorage.getItem("currentTab");
  const [activeTab, setActiveTab] = useState(getCurrentTab);

  // Save currentTab whenever it changes
  localStorage.setItem("currentTab", activeTab);

  return (
    <>
      <section id='nav-container' className="place-self-center pl-3 pr-3 flex flex-col gap-1 text-white bg-[#1800ad] w-full">
        <div className="flex justify-between p-3 pb-0 bg-white rounded-t-xl">
          <div className="bg-[#1800ad] w-full rounded-xl p-3 text-center flex">
            <nav className='font-bold'>
              ☰
              {/* NAV BUTTONS */}
              <button
                className={`hidden bg-white text-black p-2 rounded-t-xl border border-black ${activeTab === 'notes' ? 'border-b-0' : 'border-b'}`}
                onClick={() => setActiveTab('notes')}
              >Notes</button>
              <button
                className={`hidden bg-white text-black p-2 rounded-t-xl border border-black ${activeTab === 'flashcard' ? 'border-b-0' : 'border-b'}`}
                onClick={() => setActiveTab('flashcard')}
              >Flashcard</button>
              <button
                className={`hidden bg-white text-black p-2 rounded-t-xl border border-black ${activeTab === 'share' ? 'border-b-0' : 'border-b'}`}
                onClick={() => setActiveTab('share')}
              >Shared with me (notes)</button>
              <button
                className={`hidden bg-white text-black p-2 rounded-t-xl border border-black ${activeTab === 'shareFlash' ? 'border-b-0' : 'border-b'}`}
                onClick={() => setActiveTab('shareFlash')}
              >Shared with me (flashcards)</button>
              <button
                className={`hidden bg-white text-black p-2 rounded-t-xl border border-black ${activeTab === 'achievements' ? 'border-b-0' : 'border-b'}`}
                onClick={() => setActiveTab('achievements')}
              >Achievements</button>
            </nav>
            <h2 className='font-bold w-10/12'>Notes</h2>
          </div>
        </div>
      </section>

      {/* COMPONENTS */}
      <Notes
        notesHidden={activeTab !== 'notes' ? 'hidden' : ''}
        incrementXP={incrementXP}
        onCreated={handleCreated}
        updateCoinsInBackend={updateCoinsInBackend}
      />
      <Flashcard
        flashcardHidden={activeTab !== 'flashcard' ? 'hidden' : ''}
        incrementXP={incrementXP}
        onCreated={handleCreated}
        updateCoinsInBackend={updateCoinsInBackend}
      />
      <ShareNotes
        shareNotesHidden={activeTab !== 'share' ? 'hidden' : ''}
        incrementXP={incrementXP}
        onCreated={handleCreated}
        updateCoinsInBackend={updateCoinsInBackend}
      />
      <ShareFlashcards
        shareFlashcardsHidden={activeTab !== 'shareFlash' ? 'hidden' : ''}
        incrementXP={incrementXP}
        onCreated={handleCreated}
        updateCoinsInBackend={updateCoinsInBackend}
      />
      <Achievements
        ref={achievementsRef}
        achievementsHidden={activeTab !== 'achievements' ? 'hidden' : ''}
      />
    </>
  );
}

export default Nav;
