
import React, { useState, useEffect } from 'react';
import ChatWidget from './components/ChatWidget';
import { ChatIcon, CloseIcon } from './components/icons';

// Banner Images
const BANNER_IMAGES = [
  "https://newhorizoncollegeofengineering.in/wp-content/uploads/2025/08/silver_jubilee-scaled.webp",
  "https://newhorizoncollegeofengineering.in/wp-content/uploads/2025/08/qs_gauge-scaled.webp",
  "https://newhorizoncollegeofengineering.in/wp-content/uploads/2025/08/kscst-scaled.webp",
  "https://newhorizoncollegeofengineering.in/wp-content/uploads/2025/08/aicte-scaled.webp",
  "https://newhorizoncollegeofengineering.in/wp-content/uploads/2025/08/star-scaled.webp"
];

const App: React.FC = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel Autoplay
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNER_IMAGES.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-sans w-full min-h-screen bg-white text-slate-800">
      
      {/* --- Top Contact Bar --- */}
      <div className="bg-[#192F59] text-white text-xs py-2 px-4 hidden md:flex justify-between items-center">
        <div className="flex gap-6">
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
            +91-98805 34935
          </span>
          <span className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg>
            +91-80-6629-7777
          </span>
        </div>
        <div className="flex gap-4 font-medium">
           {['Examination', 'Proforma for Annual Return', 'NIRF/ARIIA/MIIC', 'News', 'Events', 'E-Resources', 'Placements', 'Careers@NH'].map((item) => (
             <a key={item} href="#" onClick={(e) => e.preventDefault()} className="hover:text-blue-300 transition">{item}</a>
           ))}
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 cursor-pointer hover:text-blue-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
        </div>
      </div>

      {/* --- Main Header & Nav --- */}
      <header className="bg-white shadow-md sticky top-0 z-30">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          {/* Logo Area */}
          <div className="flex-shrink-0">
            <img 
              src="https://newhorizoncollegeofengineering.in/wp-content/uploads/2023/10/Logo-02-1.png" 
              alt="New Horizon College of Engineering" 
              className="h-12 md:h-16 object-contain"
            />
          </div>

          {/* Main Nav Menu */}
          <nav className="hidden lg:flex gap-6 text-sm font-semibold text-slate-700 uppercase tracking-tight">
            {['Home', 'About', 'Programs', 'Admissions', 'Departments', 'Campus Life', 'Sponsored Labs', 'R & D', 'IQAC', 'Contact'].map((item) => (
               <a 
                 key={item} 
                 href="#" 
                 onClick={(e) => e.preventDefault()} 
                 className={`hover:text-red-600 transition flex items-center gap-1 ${item === 'Home' ? 'text-red-600' : ''}`}
               >
                 {item}
                 {['About', 'Programs', 'Admissions', 'Departments', 'Campus Life', 'Sponsored Labs'].includes(item) && (
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                     <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                   </svg>
                 )}
               </a>
            ))}
          </nav>

          {/* Mobile Menu Icon (Hidden on Desktop) */}
          <div className="lg:hidden">
            <button className="text-slate-700 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* --- Hero Carousel --- */}
      <div className="relative w-full overflow-hidden bg-gray-100">
         {/* Aspect ratio container for banner images */}
         <div className="relative w-full aspect-[16/6] md:aspect-[16/5]"> 
            {BANNER_IMAGES.map((src, index) => (
              <div 
                key={index}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <img src={src} alt={`Banner ${index + 1}`} className="w-full h-full object-cover object-center" />
              </div>
            ))}
         </div>

         {/* Carousel Controls */}
         <button 
            onClick={() => setCurrentSlide((prev) => (prev - 1 + BANNER_IMAGES.length) % BANNER_IMAGES.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
         >
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
               <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
             </svg>
         </button>
         <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % BANNER_IMAGES.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
         >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
         </button>

         {/* Indicators */}
         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {BANNER_IMAGES.map((_, index) => (
              <button 
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-red-600' : 'bg-white/50 hover:bg-white'}`}
              />
            ))}
         </div>
      </div>

      {/* --- Chatbot Components --- */}
      {isChatOpen && <ChatWidget onClose={() => setIsChatOpen(false)} />}

      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-5 right-5 lg:bottom-8 lg:right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50 transition-transform transform hover:scale-110 z-50"
        aria-label={isChatOpen ? 'Close Chat' : 'Open Chat'}
      >
        {isChatOpen ? <CloseIcon className="w-8 h-8" /> : <ChatIcon className="w-8 h-8" />}
      </button>
    </div>
  );
};

export default App;
