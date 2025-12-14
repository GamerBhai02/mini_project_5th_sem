
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat, Type, FunctionDeclaration, Part } from '@google/genai';
import { supabase } from '../lib/supabaseClient';
import { Message, MessageSender, DocumentFile } from '../types';
import AdminModal from './AdminModal';
import {
  SendIcon,
  MicIcon,
  SpeakerIcon,
  SettingsIcon,
  BotIcon,
  UserIcon,
  SpinnerIcon,
  CloseIcon,
} from './icons';

interface ChatWidgetProps {
  onClose: () => void;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
}

declare global {
  interface Window {
    SpeechRecognition: { new (): SpeechRecognition };
    webkitSpeechRecognition: { new (): SpeechRecognition };
  }
}


const MarkdownText: React.FC<{ text: string; className?: string }> = ({ text, className }) => {
    const renderInline = (line: string) => {
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return parts.filter(Boolean).map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    const elements: React.ReactNode[] = [];
    const lines = text.split('\n');
    let listType: 'ul' | 'ol' | null = null;
    let listItems: React.ReactNode[] = [];

    const flushList = () => {
        if (listItems.length > 0) {
            if (listType === 'ul') {
                elements.push(
                    <ul key={elements.length} className="list-disc list-inside space-y-1 my-2">
                        {listItems}
                    </ul>
                );
            } else if (listType === 'ol') {
                elements.push(
                    <ol key={elements.length} className="list-decimal list-inside space-y-1 my-2">
                        {listItems}
                    </ol>
                );
            }
            listItems = [];
            listType = null;
        }
    };

    lines.forEach((line, i) => {
        const trimmedLine = line.trim();
        const isUl = trimmedLine.startsWith('* ');
        const isOl = /^\d+\.\s/.test(trimmedLine);

        if (isUl) {
            if (listType !== 'ul') {
                flushList();
                listType = 'ul';
            }
            listItems.push(<li key={i}>{renderInline(trimmedLine.substring(2))}</li>);
        } else if (isOl) {
            if (listType !== 'ol') {
                flushList();
                listType = 'ol';
            }
            listItems.push(<li key={i}>{renderInline(trimmedLine.replace(/^\d+\.\s/, ''))}</li>);
        } else {
            flushList();
            if (trimmedLine.length > 0) {
                elements.push(<p key={i}>{renderInline(line)}</p>);
            }
        }
    });

    flushList();

    return <div className={className}>{elements}</div>;
};

const supportedLanguages = [
    { code: 'en-US', name: 'English (US)' },
    { code: 'en-GB', name: 'English (UK)' },
    { code: 'es-ES', name: 'Español' },
    { code: 'fr-FR', name: 'Français' },
    { code: 'de-DE', name: 'Deutsch' },
    { code: 'it-IT', name: 'Italiano' },
    { code: 'ja-JP', name: '日本語' },
    { code: 'ko-KR', name: '한국어' },
    { code: 'pt-BR', name: 'Português (Brasil)' },
    { code: 'ru-RU', name: 'Русский' },
    { code: 'hi-IN', name: 'हिन्दी' },
    { code: 'zh-CN', name: '中文 (普通话)' },
  ];

const ChatWidget: React.FC<ChatWidgetProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognitionLang, setRecognitionLang] = useState(navigator.language || 'en-US');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  
  const chatRef = useRef<Chat | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);

  // Helper to convert blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        resolve(base64String.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  useEffect(() => {
    // Fetch documents from Supabase to build the knowledge base context
    const fetchDocuments = async () => {
        const { data } = await supabase
            .from('documents')
            .select('*')
            .eq('status', 'ready'); // Only fetch ready documents
        
        if (data) {
            setDocuments(data);
        }
    };
    fetchDocuments();
  }, []);

  useEffect(() => {
    try {
      if (!process.env.API_KEY) {
        const message = "API_KEY environment variable not set.";
        console.error(message);
        setError(message);
        return;
      }
      aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Initial messages
      setMessages([
        {
          id: 'init',
          text: 'Hello! How can I help you with information about New Horizon College of Engineering?',
          sender: MessageSender.BOT,
        },
      ]);
    } catch (e: any) {
        setError(`Initialization failed: ${e.message}`);
        console.error(e);
    }
  }, []);

  // Initialize Chat Session whenever documents change to update system instructions and tools
  useEffect(() => {
    if (!aiRef.current) return;

    const docListString = documents.length > 0 
      ? documents.map(d => `- ${d.name}: ${d.description}`).join('\n')
      : "No documents currently available in the knowledge base.";

    const systemInstruction = `You are the official AI Assistant for New Horizon College of Engineering (NHCE).

    **CORE FACTS (Use ONLY if directly asked):**
    - Chairman: Dr. Mohan Manghnani
    - Principal: Dr. Manjunatha
    - Location: Bellandur Main Road, Bangalore, India
    - Affiliation: Visvesvaraya Technological University (VTU)
    - Accreditation: NAAC 'A' Grade, NBA Accredited

    **STRICT RESPONSE GUIDELINES:**
    1. **Answer ONLY the specific question asked.** Do not volunteer extra information like the Chairman's name, Principal's name, or Accreditation unless the user explicitly asks for it.
    2. **Be Concise.** If the user asks "How do I reach the college?" or "I want to join", provide the direct answer or next steps. Do not dump a general college introduction.
    3. **Specific Entities:** If asked about a specific Department HOD or course, provide details for *that* specific entity only. Do not list others.
    4. **General Knowledge Fallback:** If the answer is not in the uploaded documents (e.g., general location queries, distance from airport, how to reach), use your internal knowledge about New Horizon College of Engineering, Bangalore to answer.
    5. **Out of Scope:** Polite refusal for non-college topics (e.g., "President of USA", "Recipes").

    **Available Documents in Knowledge Base:**
    ${docListString}
    `;

    const readDocTool: FunctionDeclaration = {
        name: 'read_document',
        description: 'Read the content of a specific document from the knowledge base. Use this ONLY when the user query relates to a topic listed in the Available Documents descriptions.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            documentName: {
              type: Type.STRING,
              description: 'The exact name of the document to read, as listed in the available documents list.'
            }
          },
          required: ['documentName']
        }
     };

    chatRef.current = aiRef.current.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: systemInstruction,
          tools: [
            { functionDeclarations: [readDocTool] }
            // Google Search is currently incompatible with Function Declarations in the same session for this model API.
            // Removed { googleSearch: {} } to prevent "Tool use with function calling is unsupported" error.
          ],
        },
    });

  }, [documents]); // Re-init chat when documents list updates

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognitionAPI) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = recognitionLang;

      recognition.onstart = () => {
        setIsRecording(true);
        setInput('Listening...');
      };
      
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setError(`Voice input error: ${event.error}`);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('Speech Recognition API not supported in this browser.');
    }

    const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
            setVoices(availableVoices);
        }
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();

    return () => {
        recognitionRef.current?.stop();
        window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (recognitionRef.current) {
        recognitionRef.current.lang = recognitionLang;
    }
  }, [recognitionLang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: MessageSender.USER,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // 1. Send initial message
      let response = await chatRef.current.sendMessage({ message: currentInput });
      
      // 2. Handle Tool Calls (Loop until no more calls)
      // We loop because the model might want to read multiple documents or perform multi-step reasoning
      while (response.functionCalls && response.functionCalls.length > 0) {
        const functionCalls = response.functionCalls;
        const parts: Part[] = [];

        for (const call of functionCalls) {
            if (call.name === 'read_document') {
                // Check if call.args is defined
                const docName = call.args?.documentName as string;
                
                if (!docName) {
                    console.warn("No document name provided in tool call.");
                    parts.push({
                        functionResponse: {
                            name: 'read_document',
                            id: call.id,
                            response: { error: "Document name missing in arguments." }
                        }
                    });
                    continue;
                }

                const doc = documents.find(d => d.name === docName);

                if (doc) {
                    console.log(`Downloading document: ${doc.name}`);
                    try {
                        const { data: blob, error: downloadError } = await supabase.storage
                            .from('knowledge-base')
                            .download(doc.storage_path);

                        if (downloadError) throw downloadError;
                        if (blob) {
                            const base64Data = await blobToBase64(blob);
                            
                            // Respond with the function result AND the file data
                            parts.push({
                                functionResponse: {
                                    name: 'read_document',
                                    id: call.id,
                                    response: { result: `Successfully retrieved content for ${docName}. See the attached data. If this data does not contain the answer, fallback to internal knowledge.` }
                                }
                            });
                            parts.push({
                                inlineData: {
                                    mimeType: blob.type,
                                    data: base64Data
                                }
                            });
                        }
                    } catch (err) {
                         console.error("Error downloading doc:", err);
                         parts.push({
                            functionResponse: {
                                name: 'read_document',
                                id: call.id,
                                response: { error: `Failed to download document: ${docName}` }
                            }
                         });
                    }
                } else {
                    parts.push({
                        functionResponse: {
                            name: 'read_document',
                            id: call.id,
                            response: { error: `Document not found: ${docName}` }
                        }
                    });
                }
            }
        }

        // Send the tool responses (and potential file data) back to the model
        if (parts.length > 0) {
             // Cast parts to any to bypass strict typing if necessary
             response = await chatRef.current.sendMessage({ message: parts as any });
        } else {
            break; // Should not happen if functionCalls existed, but safe break
        }
      }

      // 3. Display Final Response
      const botMessage: Message = {
        id: Date.now().toString() + 'b',
        text: response.text || "", // Handle potentially undefined response text
        sender: MessageSender.BOT,
      };
      setMessages((prevMessages) => [...prevMessages, botMessage]);

    } catch (err: any) {
      console.error('Gemini API request failed', err);
      const errorMessage: Message = {
        id: Date.now().toString() + 'e',
        text: 'Sorry, I encountered an error while processing your request. Please try again.',
        sender: MessageSender.BOT,
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVoiceInput = () => {
    if (isLoading || !!error) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    } else {
      if (recognitionRef.current) {
        setInput(''); 
        recognitionRef.current.start();
      } else {
        alert('Voice input feature is not available in your browser.');
      }
    }
  };

  const cleanTextForSpeech = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/(\*|\d+\.)\s/g, '') 
      .replace(/\n/g, ' '); 
  };

  const handleTextToSpeech = (message: Message) => {
    if ('speechSynthesis' in window) {
      if (speakingMessageId === message.id) {
        window.speechSynthesis.cancel();
        setSpeakingMessageId(null);
        return;
      }
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const cleanedText = cleanTextForSpeech(message.text);
      const utterance = new SpeechSynthesisUtterance(cleanedText);

      const selectedVoice = voices.find(voice => voice.lang.startsWith(recognitionLang.split('-')[0]));
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        utterance.lang = recognitionLang;
      }

      utterance.onstart = () => {
        setSpeakingMessageId(message.id);
      };

      utterance.onend = () => {
        setSpeakingMessageId(null);
      };
      
      utterance.onerror = (e) => {
        console.error('Speech synthesis error:', e);
        setError('Text-to-speech failed.');
        setSpeakingMessageId(null);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported in your browser.');
    }
  };


  return (
    <div className="fixed bottom-20 right-5 lg:right-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-[90vw] max-w-md h-[70vh] max-h-[600px] flex flex-col z-50">
      <header className="flex items-center justify-between p-4 border-b dark:border-slate-700 flex-shrink-0">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                <BotIcon className="w-6 h-6" />
            </div>
            <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">NHCE Assistant</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Online</p>
            </div>
        </div>
        <div>
          <button onClick={() => setIsAdminModalOpen(true)} className="mr-2 p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" aria-label="Admin Settings">
            <SettingsIcon className="w-6 h-6" />
          </button>
          <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200" aria-label="Close chat">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${ msg.sender === MessageSender.USER ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === MessageSender.BOT && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                  <BotIcon className="w-5 h-5" />
                </div>
              )}

              <div className={`flex flex-col gap-1 ${ msg.sender === MessageSender.USER ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-2xl max-w-xs md:max-w-sm shadow-sm ${
                    msg.sender === MessageSender.USER
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none'
                  }`}>
                  <MarkdownText text={msg.text} className="text-sm break-words" />
                </div>
                {msg.sender === MessageSender.BOT && (
                  <button
                    onClick={() => handleTextToSpeech(msg)}
                    className={speakingMessageId === msg.id ? 'text-indigo-500' : 'text-slate-400 hover:text-indigo-500'}
                    aria-label={speakingMessageId === msg.id ? "Stop reading" : "Read message aloud"}
                  >
                    <SpeakerIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {msg.sender === MessageSender.USER && (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 flex-shrink-0">
                  <UserIcon className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                <BotIcon className="w-5 h-5" />
              </div>
              <div className="p-3 rounded-2xl rounded-bl-none bg-slate-100 dark:bg-slate-700">
                <div className="flex items-center justify-center gap-2">
                  <SpinnerIcon className="w-5 h-5 animate-spin text-indigo-500" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 border-t dark:border-slate-700 flex-shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isRecording ? 'Listening...' : 'Ask a question...'}
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-700 text-white placeholder-slate-400 transition"
            disabled={isLoading || !!error}
            readOnly={isRecording}
            aria-label="Chat input"
          />
          <button 
            type="button" 
            onClick={handleVoiceInput} 
            className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
                isRecording 
                ? 'text-white bg-red-500 animate-pulse'
                : 'text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400'
            }`} 
            disabled={isLoading || !!error} 
            aria-label={isRecording ? 'Stop voice input' : 'Use voice input'}>
            <MicIcon className="w-6 h-6" />
          </button>
          <button 
            type="submit" 
            className="bg-indigo-600 text-white rounded-full p-2 hover:bg-indigo-700 disabled:bg-indigo-400 transition" 
            disabled={isLoading || !input.trim() || isRecording} 
            aria-label="Send message">
            <SendIcon className="w-6 h-6" />
          </button>
        </form>
        <div className="pt-2 flex items-center justify-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3.75h.008v.008H12v-.008zM12 15h.008v.008H12v-.008zm0 2.25h.008v.008H12v-.008zM3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
            </svg>
            <label htmlFor="lang-select" className="sr-only">Voice language</label>
            <select
                id="lang-select"
                value={recognitionLang}
                onChange={(e) => setRecognitionLang(e.target.value)}
                className="bg-transparent border-0 rounded-md p-1 focus:ring-0 focus:outline-none text-xs"
                aria-label="Select voice input language"
            >
                {supportedLanguages.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                    {lang.name}
                </option>
                ))}
            </select>
        </div>
      </footer>

      {isAdminModalOpen && <AdminModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} />}
    </div>
  );
};

export default ChatWidget;
