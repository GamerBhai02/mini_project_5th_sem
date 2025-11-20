export enum MessageSender {
  USER = 'user',
  BOT = 'bot',
}

export interface Message {
  id: string;
  text: string;
  sender: MessageSender;
}

export interface DocumentFile {
    id: number;
    name: string;
    description: string;
    storage_path: string;
    status: 'processing' | 'ready' | 'error';
    created_at: string;
}