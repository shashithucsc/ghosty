import { UserProfile } from './dashboard';

export interface Message {
    id: string;
    senderId: string;
    content: string;
    createdAt: string; // ISO date string
    isRead: boolean;
}

export interface Conversation {
    id: string;
    participants: UserProfile[];
    lastMessage?: Message;
    unreadCount: number;
    updatedAt: string;
}
