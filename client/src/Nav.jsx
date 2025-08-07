import { useState, useRef } from 'react';
import Notes from './Notes';
import Flashcard from './Flashcard';
import ShareNotes from './SharedNotes';
import ShareFlashcards from './SharedFlashcards';
import Achievements from './Achievements';
import ThemesStore from './ThemesStore';

function Nav({ incrementXP, handleCreated, achievementsRef, updateCoinsInBackend, userCoins, setCoins }) {
  const getCurrentTab = localStorage.getItem("currentTab");
  const [activeTab, setActiveTab] = useState(getCurrentTab);

  const [menuOpen, setMenuOpen] = useState(false);

  const [currentMenu, setCurrentMenu] = useState(`${getCurrentTab}`);

  // Save currentTab whenever it changes
  localStorage.setItem("currentTab", activeTab);

  return (
    <>
      <section
      id="nav-container"
      className="place-self-center pl-3 pr-3 flex flex-col gap-1 text-[var(--text-color)] bg-[var(--bg-color)] w-full"
    >
      <div className="flex justify-between p-3 pb-0 bg-[var(--accent-color)] rounded-t-xl">
        <div className="bg-[var(--bg-color)] w-full rounded-xl p-3 relative flex items-center">
          {/* NAV WRAPPER */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-[var(--text-color)] text-2xl transition-transform duration-300 ease-in-out"
            >
              {menuOpen ? 'X' : '☰'}
            </button>

            {/* DROPDOWN MENU (FLOATING ABOVE SCREEN) */}
            <div className={`absolute top-full left-0 mt-2 w-64 bg-white text-black rounded-xl border border-black shadow-xl z-50          overflow-visible transition-all duration-300 ease-in-out transform -ml-4.5 ${menuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <div className="absolute top-0 left-4 -translate-y-full w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white"></div>
                <button
                  className={`block w-full text-left p-2 border-b ${activeTab === 'Notes' ? 'font-bold' : ''}`}
                  onClick={() => {
                    setActiveTab('Notes');
                    setMenuOpen(false);
                    setCurrentMenu('Notes');
                  }}
                >
                  Notes
                </button>
                <button
                  className={`block w-full text-left p-2 border-b ${activeTab === 'Flashcards' ? 'font-bold' : ''}`}
                  onClick={() => {
                    setActiveTab('Flashcards');
                    setMenuOpen(false);
                    setCurrentMenu('Flashcards');
                  }}
                >
                  Flashcards
                </button>
                <button
                  className={`block w-full text-left p-2 border-b ${activeTab === 'Shared Notes' ? 'font-bold' : ''}`}
                  onClick={() => {
                    setActiveTab('Shared Notes');
                    setMenuOpen(false);
                    setCurrentMenu('Shared Notes');
                  }}
                >
                  Shared with me (notes)
                </button>
                <button
                  className={`block w-full text-left p-2 border-b ${activeTab === 'Shared Flashcards' ? 'font-bold' : ''}`}
                  onClick={() => {
                    setActiveTab('Shared Flashcards');
                    setMenuOpen(false);
                    setCurrentMenu('Shared Flashcards');
                  }}
                >
                  Shared with me (flashcards)
                </button>
                <button
                  className={`block w-full text-left p-2 border-b ${activeTab === 'Achievements' ? 'font-bold' : ''}`}
                  onClick={() => {
                    setActiveTab('Achievements');
                    setMenuOpen(false);
                    setCurrentMenu('Achievements');
                  }}
                >
                  Achievements
                </button>
                <button
                  className={`block w-full text-left p-2 ${activeTab === 'Themes Store' ? 'font-bold' : ''}`}
                  onClick={() => {
                    setActiveTab('Themes Store');
                    setMenuOpen(false);
                    setCurrentMenu('Themes Store');
                  }}
                  >
                  Themes Store
                  </button>
              </div>
          </div>

          <h2 className="absolute left-1/2 transform -translate-x-1/2 font-bold text-white text-sm">{currentMenu}</h2>
        </div>
      </div>
    </section>

      {/* COMPONENTS */}
      <Notes
        notesHidden={activeTab !== 'Notes' ? 'hidden' : ''}
        incrementXP={incrementXP}
        onCreated={handleCreated}
        updateCoinsInBackend={updateCoinsInBackend}
      />
      <Flashcard
        flashcardHidden={activeTab !== 'Flashcards' ? 'hidden' : ''}
        incrementXP={incrementXP}
        onCreated={handleCreated}
        updateCoinsInBackend={updateCoinsInBackend}
      />
      <ShareNotes
        shareNotesHidden={activeTab !== 'Shared Notes' ? 'hidden' : ''}
        incrementXP={incrementXP}
        onCreated={handleCreated}
        updateCoinsInBackend={updateCoinsInBackend}
      />
      <ShareFlashcards
        shareFlashcardsHidden={activeTab !== 'Shared Flashcards' ? 'hidden' : ''}
        incrementXP={incrementXP}
        onCreated={handleCreated}
        updateCoinsInBackend={updateCoinsInBackend}
      />
      <Achievements
        ref={achievementsRef}
        achievementsHidden={activeTab !== 'Achievements' ? 'hidden' : ''}
      />
      <ThemesStore
        userCoins={userCoins}
        storeHidden={activeTab !== 'Themes Store' ? 'hidden' : ''}
        updateCoinsInBackend={updateCoinsInBackend}
        setCoins={setCoins} // Pass setCoins to allow updates from ThemesStore
      />
    </>
  );
}

export default Nav;
