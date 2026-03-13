export type User = {
  username: string;
  role: 'user' | 'admin';
  password?: string;
};

export type Category = 'cars' | 'phones';

export interface Ad {
  id: number;
  title: string;
  description: string;
  price: number;
  category: Category;
  images: string[];
  seller: string;
  status: 'available' | 'sold';
}

export interface Message {
    id: number;
    text: string;
    sender: 'user' | 'admin';
    timestamp: number;
}