
import React, { useState } from 'react';
import ChatWidget from './components/ChatWidget';
import { ChatIcon, CloseIcon } from './components/icons';

const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="bg-slate-100 dark:bg-slate-900 font-sans w-full min-h-screen text-slate-800 dark:text-slate-200">
      <div className="container mx-auto p-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-indigo-600 dark:text-indigo-400">New Horizon College of Engineering</h1>
          <p className="text-xl mt-4 text-slate-600 dark:text-slate-400">Your Future Starts Here. Ask me anything!</p>
        </header>
        <main className="grid md:grid-cols-2 gap-8 items-center">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold mb-4 text-indigo-700 dark:text-indigo-300">Welcome!</h2>
            <p className="mb-4">
              This is a demonstration of an AI-powered chatbot integrated into a college website. The chatbot, accessible via the floating icon in the bottom-right corner, is designed to assist prospective students with their queries.
            </p>
            <p>
              It features multilingual support, voice input, text-to-speech for answers, and a simulated admin panel for managing the knowledge base. Click the chat icon to begin your conversation!
            </p>
          </div>
          <div className="hidden md:block">
            <img src="https://picsum.photos/seed/college/600/400" alt="University Campus" className="rounded-2xl shadow-lg"/>
          </div>
        </main>
      </div>
      
      {isChatOpen && <ChatWidget onClose={() => setIsChatOpen(false)} />}

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-5 right-5 lg:bottom-8 lg:right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition-transform transform hover:scale-110"
        aria-label={isChatOpen ? 'Close Chat' : 'Open Chat'}
      >
        {isChatOpen ? <CloseIcon className="w-8 h-8" /> : <ChatIcon className="w-8 h-8" />}
      </button>
    </div>
  );
};

export default App;