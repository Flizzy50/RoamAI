
export interface UserProfile {
  name: string;
  avatarUrl?: string;
  status: 'online' | 'busy' | 'exploring';
}

export interface LocationData {
  city: string;
  country: string;
}

export interface Message {
  role: 'user' | 'assistant';
  text: string;
  links?: { title: string; url: string }[];
}

export interface ChatSession {
  id: string;
  title: string;
  snippet: string;
  date: string;
  messages: Message[];
}
