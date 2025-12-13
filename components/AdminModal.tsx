
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { DocumentFile } from '../types';
import { CloseIcon, UploadIcon, TrashIcon, SpinnerIcon, CheckCircleIcon, ExclamationCircleIcon } from './icons';
import type { Session } from '@supabase/supabase-js';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newDescription, setNewDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Extracts a string message from an unknown error type.
   * @param error The error caught in a catch block.
   * @returns A string representing the error message.
   */
  const getErrorMessage = (error: unknown): string => {
    let message: string;
    if (error instanceof Error) {
        message = error.message;
    } else if (error && typeof error === 'object' && 'message' in error) {
        message = String((error as { message: unknown }).message);
    } else if (typeof error === "string") {
        message = error;
    } else {
        message = "An unknown error occurred.";
    }
    return message;
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchFiles = async () => {
    setLoadingFiles(true);
    setError(null);
    try {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
             // 42501 is the Postgres code for insufficient_privilege
             if (error.code === '42501' || error.message.includes('violates row-level security')) {
               throw new Error("Access denied. Please ensure an RLS policy allows 'authenticated' users to SELECT from the 'documents' table with expression 'true'.");
             }
             throw error;
        }
        setFiles(data || []);
    } catch (err: any) {
        setError(getErrorMessage(err));
        console.error("Error fetching files:", err);
    } finally {
        setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (session && isOpen) {
      fetchFiles();

      const channel = supabase.channel('documents-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'documents' },
          (payload) => {
            const updatedFile = payload.new as DocumentFile;
            setFiles(currentFiles => {
              if (payload.eventType === 'UPDATE') {
                  return currentFiles.map(f => f.id === updatedFile.id ? updatedFile : f);
              }
              if (payload.eventType === 'INSERT') {
                  // Avoid duplicates if fetchFiles just ran
                  if (currentFiles.some(f => f.id === updatedFile.id)) return currentFiles;
                  return [updatedFile, ...currentFiles];
              }
              if (payload.eventType === 'DELETE') {
                  // We also handle this manually in handleDelete, but this keeps other clients in sync
                  const oldId = (payload.old as any).id;
                  return currentFiles.filter(f => f.id !== oldId);
              }
              return currentFiles;
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [session, isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
        setError("Email and password are required.");
        return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        setError(error.message);
    } else {
        setEmail('');
        setPassword('');
    }
  };
  
  const handleLogout = async () => {
    setError(null);
    const { error } = await supabase.auth.signOut();
    if(error) setError(error.message);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFile || !newDescription) {
      alert('Please select a file and provide a description.');
      return;
    }
    setUploading(true);
    setError(null);

    let filePath = '';
    let uploadSuccessful = false;

    try {
        // Sanitize filename to prevent issues with special characters
        const fileExt = newFile.name.split('.').pop();
        const cleanName = newFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const fileName = `${Date.now()}_${cleanName}`;
        filePath = `public/${fileName}`;

        // 1. Upload file to Supabase Storage
        // Explicitly set content type to ensure proper handling by Gemini later
        const { error: uploadError } = await supabase.storage
            .from('knowledge-base')
            .upload(filePath, newFile, {
                contentType: newFile.type,
                upsert: false
            });

        if (uploadError) throw uploadError;
        uploadSuccessful = true;

        // 2. Insert metadata with 'ready' status immediately.
        const { data: insertedDoc, error: insertError } = await supabase
            .from('documents')
            .insert({ 
                name: newFile.name, 
                description: newDescription,
                storage_path: filePath,
                status: 'ready'
            })
            .select()
            .single();

        if (insertError) throw insertError;
        
        if (!insertedDoc) {
            throw new Error("Failed to insert document record. Please check table permissions.");
        }

        setNewFile(null);
        setNewDescription('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

    } catch (err) {
        const rawMessage = getErrorMessage(err);
        let finalMessage = `Upload failed: ${rawMessage}`;

        if (rawMessage.includes('violates row-level security policy') || rawMessage.includes('42501')) {
            finalMessage = 'Database permission error. The "documents" table blocked the insert. Please run the SQL provided in the chat instructions to fix RLS policies.';
            
            // Cleanup: Delete the uploaded file since the DB insert failed
            if (uploadSuccessful && filePath) {
                const { error: cleanupError } = await supabase.storage.from('knowledge-base').remove([filePath]);
                if (cleanupError) console.warn("Failed to cleanup orphaned file:", cleanupError);
            }
        } else if (rawMessage.toLowerCase().includes('storage') && (rawMessage.includes('403') || rawMessage.includes('401'))) {
            finalMessage = 'Storage permission error: Check "knowledge-base" bucket policies. Ensure "authenticated" users have upload permissions.';
        }
        
        setError(finalMessage);
        console.error("Error uploading file:", err);
    } finally {
        setUploading(false);
    }
  };

  const handleDelete = async (file: DocumentFile) => {
    if (!window.confirm(`Are you sure you want to delete "${file.name}"?`)) return;
    
    console.log("Deleting file:", file.id);
    setDeletingId(file.id);
    setError(null);

    try {
        // 1. Attempt Storage Deletion
        // We proceed even if storage delete fails (e.g. file already gone), 
        // so the user can clean up the database record.
        if (file.storage_path) {
            const { error: storageError } = await supabase.storage
                .from('knowledge-base')
                .remove([file.storage_path]);
            
            if (storageError) {
                 console.warn("Storage deletion warning (continuing with DB delete):", storageError.message);
            }
        }

        // 2. Delete from database
        // We use count: 'exact' to ensure we actually deleted something.
        const { error: dbError, count } = await supabase
            .from('documents')
            .delete({ count: 'exact' })
            .eq('id', file.id);

        if (dbError) throw dbError;

        // Critical check: Did we actually delete a row?
        if (count === 0) {
            throw new Error("Database delete failed: No rows affected. This usually means your RLS policy blocks DELETE for 'authenticated' users.");
        }

        // 3. Manually update UI immediately
        setFiles(current => current.filter(f => f.id !== file.id));

    } catch (err) {
        const rawMessage = getErrorMessage(err);
        let finalMessage = `Failed to delete file: ${rawMessage}`;
        
        if (rawMessage.includes('violates row-level security policy')) {
           finalMessage = 'Database permission error: Delete blocked. Ensure your RLS policy allows "authenticated" users to DELETE rows.';
        }
        setError(finalMessage);
        console.error("Error deleting file:", err);
    } finally {
        setDeletingId(null);
    }
  };

  const renderStatus = (status: DocumentFile['status']) => {
    switch (status) {
      case 'processing':
        return <div className="flex items-center gap-1 text-sm text-yellow-600"><SpinnerIcon className="w-4 h-4 animate-spin" /> Processing</div>;
      case 'ready':
        return <div className="flex items-center gap-1 text-sm text-green-600"><CheckCircleIcon className="w-4 h-4" /> Ready</div>;
      case 'error':
        return <div className="flex items-center gap-1 text-sm text-red-600"><ExclamationCircleIcon className="w-4 h-4" /> Error</div>;
      default:
        return null;
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Admin Settings</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {!session ? (
            <div>
              <h4 className="text-lg font-medium mb-4 text-center">
                Admin Authentication
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 text-center">
                Please log in to manage the chatbot's knowledge base. New admin accounts must be created by an administrator in the Supabase dashboard.
              </p>
              <form onSubmit={handleLogin} className="space-y-4">
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" 
                    />
                 </div>
                 <div>
                    <label htmlFor="password-input" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                    <input 
                      type="password" 
                      id="password-input" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100" 
                    />
                 </div>
                 {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                 <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                    Log In
                </button>
              </form>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium">Manage Documents</h4>
                <button onClick={handleLogout} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">Logout</button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Upload or delete files to keep the chatbot's knowledge up-to-date. The AI will process these for retrieval.</p>
              
              {error && <p className="text-red-500 text-sm mb-4 text-center bg-red-50 dark:bg-red-900/20 p-2 rounded">{error}</p>}

              {/* File List */}
              <div className="space-y-3 mb-6 max-h-60 h-auto overflow-y-auto pr-2 border border-slate-200 dark:border-slate-700 rounded p-2">
                {loadingFiles ? (
                    <div className="flex justify-center items-center h-20 text-slate-500">
                        <SpinnerIcon className="w-5 h-5 animate-spin mr-2" /> Loading...
                    </div>
                ) : files.length === 0 ? (
                    <div className="flex justify-center items-center h-20 text-slate-500 text-sm">
                        No documents found.
                    </div>
                ) : (
                    files.map(file => (
                    <div key={file.id} className="bg-slate-100 dark:bg-slate-700 p-3 rounded-lg flex justify-between items-center">
                        <div className="flex-1 overflow-hidden">
                        <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate" title={file.name}>{file.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate" title={file.description}>{file.description}</p>
                        </div>
                        <div className="flex items-center gap-3 ml-4">
                            {renderStatus(file.status)}
                            <button 
                                type="button"
                                onClick={() => handleDelete(file)} 
                                disabled={deletingId === file.id}
                                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-2 flex-shrink-0 disabled:opacity-50 transition-opacity rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                                title="Delete document"
                            >
                                {deletingId === file.id ? <SpinnerIcon className="w-5 h-5 animate-spin"/> : <TrashIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                    ))
                )}
              </div>

              {/* Upload Form */}
              <form onSubmit={handleUpload} className="space-y-4">
                <h5 className="font-semibold">Upload New Document</h5>
                <div>
                  <label htmlFor="file-upload" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">File</label>
                  <input id="file-upload" type="file" ref={fileInputRef} onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-300 hover:file:bg-indigo-100 dark:hover:file:bg-indigo-800"/>
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <input
                    id="description"
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="e.g., Updated 2024 tuition fees"
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={uploading || !newFile || !newDescription}
                  className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                >
                  {uploading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <UploadIcon className="w-5 h-5" />}
                  {uploading ? 'Uploading...' : 'Upload & Process File'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
