import { useState } from 'react';

function Nav(){

const [activeTab, setActiveTab] = useState('notes'); // default active tab

  return (
    <>
      <section className="w-2/3 place-self-center px-1.5 flex flex-col gap-1 text-white bg-gradient-to-r from-red-500 to-purple-500 rounded-t-xl border-l-2 border-r-2 border-black pr-2 pl-2">
        <nav className="flex justify-between mt-3.5">
          <button
            className={`bg-white text-black p-2 rounded-t-xl border border-black ${
              activeTab === 'notes' ? 'border-b-0' : 'border-b'
            }`}
            onClick={() => setActiveTab('notes')}
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
              activeTab === 'achievements' ? 'border-b-0' : 'border-b'
            }`}
            onClick={() => setActiveTab('achievements')}
          >
            Achievements
          </button>
        </nav>
      </section>
    </>
  );
}

export default Nav