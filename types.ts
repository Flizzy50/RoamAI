
export interface UserProfile {
  name: string;
  avatarUrl?: string;
  status: 'online' | 'busy' | 'exploring';
}

export interface LocationData {
  city: string;
  country: string;
}
