import { useState, useRef } from 'react';
import Notes from './Notes';
import Flashcard from './Flashcard';
import ShareNotes from './SharedNotes';
import ShareFlashcards from './SharedFlashcards';
import Achievements from './Achievements';
import ThemesStore from './ThemesStore';
import logo from "./assets/logo/mk-logo.svg";
import Icon from '@mdi/react';
import { mdiNoteText } from '@mdi/js';
import { mdiCardMultiple } from '@mdi/js';
import { mdiAccountGroup } from '@mdi/js';
import { mdiTrophy } from '@mdi/js';
import { mdiStorefrontOutline } from '@mdi/js';

function Nav({ incrementXP, handleCreated, achievementsRef, updateCoinsInBackend, userCoins, setCoins, api }) {
  const getCurrentTab = localStorage.getItem("currentTab");
  const [activeTab, setActiveTab] = useState(getCurrentTab);

  const [menuOpen, setMenuOpen] = useState(false);

  const [currentMenu, setCurrentMenu] = useState(`${getCurrentTab}`);

  // Save currentTab whenever it changes
  localStorage.setItem("currentTab", activeTab);

  const renderMenuButtons = () => (
  <>
    <div className='border-b border-[var(--header-text-color)] p-2'><img src={logo} alt="Mind Keep Logo" className="logo"/></div>
    <button
      className={`block w-full text-left p-2 border-b border-[var(--header-text-color)] ${activeTab === 'Notes' ? 'font-bold bg-[var(--highlight-color)] text-[var(--accent-color)] ' : ''} hover:bg-[var(--highlight-color)] hover:text-[var(--accent-color)] flex gap-1 items-center`}
      onClick={() => {
        setActiveTab('Notes');
        setMenuOpen(false);
        setCurrentMenu('Notes');
      }}
    >
      <Icon path={mdiNoteText} size={1} />
      Notes
    </button>
    <button
      className={`block w-full text-left p-2 border-b border-[var(--header-text-color)] ${activeTab === 'Flashcards' ? 'font-bold bg-[var(--highlight-color)] text-[var(--accent-color)]' : ''} hover:bg-[var(--highlight-color)] hover:text-[var(--accent-color)] flex gap-1 items-center`}
      onClick={() => {
        setActiveTab('Flashcards');
        setMenuOpen(false);
        setCurrentMenu('Flashcards');
      }}
    >
      <Icon path={mdiCardMultiple} size={1}/>
      Flashcards
    </button>
    <button
      className={`block w-full text-left p-2 border-b border-[var(--header-text-color)] ${activeTab === 'Shared Notes' ? 'font-bold bg-[var(--highlight-color)] text-[var(--accent-color)]' : ''} hover:bg-[var(--highlight-color)] hover:text-[var(--accent-color)] flex gap-1 items-center `}
      onClick={() => {
        setActiveTab('Shared Notes');
        setMenuOpen(false);
        setCurrentMenu('Shared Notes');
      }}
    >
      <Icon path={mdiAccountGroup} size={1} />
      Shared with me (notes)
    </button>
    <button
      className={`block w-full text-left p-2 border-b border-[var(--header-text-color)] ${activeTab === 'Shared Flashcards' ? 'font-bold bg-[var(--highlight-color)] text-[var(--accent-color)]' : ''} hover:bg-[var(--highlight-color)] hover:text-[var(--accent-color)] flex gap-1 items-center`}
      onClick={() => {
        setActiveTab('Shared Flashcards');
        setMenuOpen(false);
        setCurrentMenu('Shared Flashcards');
      }}
    >
      <Icon path={mdiAccountGroup} size={1} />
      Shared with me (flashcards)
    </button>
    <button
      className={`block w-full text-left p-2 border-b border-[var(--header-text-color)] ${activeTab === 'Achievements' ? 'font-bold bg-[var(--highlight-color)] text-[var(--accent-color)]' : ''} hover:bg-[var(--highlight-color)] hover:text-[var(--accent-color)] flex gap-1 items-center`}
      onClick={() => {
        setActiveTab('Achievements');
        setMenuOpen(false);
        setCurrentMenu('Achievements');
      }}
    >
      <Icon path={mdiTrophy} size={1} />
      Achievements
    </button>
    <button
      className={`block w-full text-left p-2 border-[var(--header-text-color)] ${activeTab === 'Themes Store' ? 'font-bold bg-[var(--highlight-color)] text-[var(--accent-color)]' : ''} hover:bg-[var(--highlight-color)] hover:text-[var(--accent-color)] flex gap-1 items-center`}
      onClick={() => {
        setActiveTab('Themes Store');
        setMenuOpen(false);
        setCurrentMenu('Themes Store');
      }}
    >
      <Icon path={mdiStorefrontOutline} size={1} />
      Themes Store
    </button>
  </>
);

const menuIcons = {
  Notes: mdiNoteText,
  Flashcards: mdiCardMultiple,
  "Shared Notes": mdiAccountGroup,
  "Shared Flashcards": mdiAccountGroup,
  Achievements: mdiTrophy,
  "Themes Store": mdiStorefrontOutline,
};

  return (
    <>
      <section
      id="nav-container"
      className="place-self-center pl-3 pr-3 flex flex-col gap-1 text-[var(--text-color)] bg-[var(--bg-color)] w-full lg:hidden"
    >
      <div className="flex justify-between p-3 pb-0 bg-[var(--accent-color)] border border-[var(--header-text-color)] border-b-0 rounded-t-xl">
        <div className="bg-[var(--bg-color)] border border-black w-full rounded-xl p-3 relative flex items-center">
          {/* NAV WRAPPER */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-[var(--text-color)] text-2xl transition-transform duration-300 ease-in-out"
            >
              {menuOpen ? 'X' : '☰'}
            </button>

            {/* DROPDOWN MENU (FLOATING ABOVE SCREEN) */}
            <div className={`absolute top-full left-0 mt-2 w-64 bg-[var(--bg-color)] text-[var(--text-color)] rounded-xl border border-[var(--text-color)] shadow-xl z-50 overflow-visible transition-all duration-300 ease-in-out transform -ml-4.5 ${menuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
            <div className="absolute top-0 left-4 -translate-y-full w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-[var(--text-color)]"></div>
                <button
                  className={`block w-full text-left p-2 border-b ${activeTab === 'Notes' ? 'font-bold' : ''} flex gap-1 items-center`}
                  onClick={() => {
                    setActiveTab('Notes');
                    setMenuOpen(false);
                    setCurrentMenu('Notes');
                  }}
                >
                  <Icon path={mdiNoteText} size={1} />
                  Notes
                </button>
                <button
                  className={`block w-full text-left p-2 border-b ${activeTab === 'Flashcards' ? 'font-bold' : ''} flex gap-1 items-center`}
                  onClick={() => {
                    setActiveTab('Flashcards');
                    setMenuOpen(false);
                    setCurrentMenu('Flashcards');
                  }}
                >
                  <Icon path={mdiCardMultiple} size={1}/>
                  Flashcards
                </button>
                <button
                  className={`block w-full text-left p-2 border-b ${activeTab === 'Shared Notes' ? 'font-bold' : ''} flex gap-1 items-center`}
                  onClick={() => {
                    setActiveTab('Shared Notes');
                    setMenuOpen(false);
                    setCurrentMenu('Shared Notes');
                  }}
                >
                  <Icon path={mdiAccountGroup} size={1} />
                  Shared with me (notes)
                </button>
                <button
                  className={`block w-full text-left p-2 border-b ${activeTab === 'Shared Flashcards' ? 'font-bold' : ''} flex gap-1 items-center`}
                  onClick={() => {
                    setActiveTab('Shared Flashcards');
                    setMenuOpen(false);
                    setCurrentMenu('Shared Flashcards');
                  }}
                >
                  <Icon path={mdiAccountGroup} size={1} />
                  Shared with me (flashcards)
                </button>
                <button
                  className={`block w-full text-left p-2 border-b ${activeTab === 'Achievements' ? 'font-bold' : ''} flex gap-1 items-center`}
                  onClick={() => {
                    setActiveTab('Achievements');
                    setMenuOpen(false);
                    setCurrentMenu('Achievements');
                  }}
                >
                  <Icon path={mdiTrophy} size={1} />
                  Achievements
                </button>
                <button
                  className={`block w-full text-left p-2 ${activeTab === 'Themes Store' ? 'font-bold' : ''} flex gap-1 items-center`}
                  onClick={() => {
                    setActiveTab('Themes Store');
                    setMenuOpen(false);
                    setCurrentMenu('Themes Store');
                  }}
                  >
                  <Icon path={mdiStorefrontOutline} size={1} />  
                  Themes Store
                  </button>
              </div>
          </div>

          <h2 className="absolute left-1/2 transform -translate-x-1/2 font-bold text-[var(--text-color)] text-sm md:text-base flex gap-1 items-center">  <Icon path={menuIcons[currentMenu]} size={1} />
          {currentMenu}</h2>
        </div>
      </div>
    </section>

    <div className="hidden lg:flex lg:flex-col lg:w-64 lg:h-screen lg:fixed lg:top-0 lg:left-0 lg:bg-[var(--accent-color)] lg:border-r lg:border-[var(--header-text-color)] text-[var(--header-text-color)] lg:shadow-xl lg:p-4 lg:rounded-r-xl lg:text-base xl:w-96 xl:text-lg">
    {renderMenuButtons()}
    </div>

      {/* COMPONENTS */}
      <Notes
        notesHidden={activeTab !== 'Notes' ? 'hidden' : ''}
        incrementXP={incrementXP}
        onCreated={handleCreated}
        updateCoinsInBackend={updateCoinsInBackend}
        api={api}
      />
      <Flashcard
        flashcardHidden={activeTab !== 'Flashcards' ? 'hidden' : ''}
        incrementXP={incrementXP}
        onCreated={handleCreated}
        updateCoinsInBackend={updateCoinsInBackend}
        api={api}
      />
      <ShareNotes
        shareNotesHidden={activeTab !== 'Shared Notes' ? 'hidden' : ''}
        incrementXP={incrementXP}
        onCreated={handleCreated}
        updateCoinsInBackend={updateCoinsInBackend}
        api={api}
      />
      <ShareFlashcards
        shareFlashcardsHidden={activeTab !== 'Shared Flashcards' ? 'hidden' : ''}
        incrementXP={incrementXP}
        onCreated={handleCreated}
        updateCoinsInBackend={updateCoinsInBackend}
        api={api}
      />
      <Achievements
        ref={achievementsRef}
        achievementsHidden={activeTab !== 'Achievements' ? 'hidden' : ''}
        api={api}
      />
      <ThemesStore
        userCoins={userCoins}
        storeHidden={activeTab !== 'Themes Store' ? 'hidden' : ''}
        updateCoinsInBackend={updateCoinsInBackend}
        setCoins={setCoins} // Pass setCoins to allow updates from ThemesStore
        api={api}
      />
    </>
  );
}

export default Nav;
