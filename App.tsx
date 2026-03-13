import React, { useState, createContext, useCallback, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Ad, User, Message } from './types';
import HomePage from './pages/HomePage';
import ListPage from './pages/ListPage';
import PostAdPage from './pages/PostAdPage';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import AdminChatPage from './pages/AdminChatPage';
import Header from './components/Header';
import AdDetailPage from './pages/AdDetailPage';
import EditAdPage from './pages/EditAdPage';
import ProfilePage from './pages/ProfilePage';

// Mock initial data
const initialAds: Ad[] = [
  { id: 1, title: 'تويوتا كورولا 2021', description: 'سيارة بحالة ممتازة, فابريكة بالكامل.', price: 750000, category: 'cars', images: ['https://picsum.photos/seed/car1/800/600'], seller: 'أحمد محمود', status: 'available' },
  { id: 2, title: 'آيفون 14 برو ماكس', description: 'استخدام خفيف, بطارية 95%, مع العلبة.', price: 38000, category: 'phones', images: ['https://picsum.photos/seed/phone1/800/600'], seller: 'سارة علي', status: 'available' },
  { id: 3, title: 'هيونداي توسان 2022', description: 'أعلى فئة, صيانة دورية بالتوكيل.', price: 1200000, category: 'cars', images: ['https://picsum.photos/seed/car2/800/600'], seller: 'محمد إبراهيم', status: 'available' },
  { id: 4, title: 'سامسونج S23 ألترا', description: 'جديد لم يستخدم, 256 جيجا.', price: 35000, category: 'phones', images: ['https://picsum.photos/seed/phone2/800/600'], seller: 'فاطمة حسن', status: 'sold' },
];

export const AppContext = createContext<{
  user: User | null;
  ads: Ad[];
  messages: Record<string, Message[]>;
  login: (username: string, password?: string) => void;
  logout: () => void;
  addAd: (ad: Omit<Ad, 'id' | 'seller' | 'status'>) => void;
  addMessage: (username: string, message: Omit<Message, 'id' | 'timestamp'>) => void;
  deleteAd: (adId: number) => void;
  updateAd: (updatedAd: Ad) => void;
  updateUser: (updatedUser: User) => void;
}>({
  user: null,
  ads: [],
  messages: {},
  login: () => {},
  logout: () => {},
  addAd: () => {},
  addMessage: () => {},
  deleteAd: () => {},
  updateAd: () => {},
  updateUser: () => {},
});

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [ads, setAds] = useState<Ad[]>(() => {
    const savedAds = localStorage.getItem('ads');
    return savedAds ? JSON.parse(savedAds) : initialAds;
  });
  const [messages, setMessages] = useState<Record<string, Message[]>>(() => {
    const savedMessages = localStorage.getItem('messages');
    return savedMessages ? JSON.parse(savedMessages) : {
      'سارة علي': [{ id: 1, text: 'مرحباً! كيف يمكنني مساعدتك اليوم؟', sender: 'admin', timestamp: Date.now() }]
    };
  });

  useEffect(() => {
    localStorage.setItem('ads', JSON.stringify(ads));
  }, [ads]);
  
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('messages', JSON.stringify(messages));
  }, [messages]);

  const login = useCallback((username: string, password?: string) => {
    if (username === 'siam' && password === '123456') {
      setUser({ username, role: 'admin', password });
    } else if (username) {
      setUser({ username, role: 'user' });
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const addAd = useCallback((ad: Omit<Ad, 'id' | 'seller' | 'status'>) => {
    if (!user) return;
    const newAd: Ad = {
      ...ad,
      id: Date.now(),
      seller: user.username,
      status: 'available',
    };
    setAds(prevAds => [newAd, ...prevAds]);
  }, [user]);

  const addMessage = useCallback((username: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => {
        const userConversation = prev[username] || [];
        const newMessage: Message = {
            ...message,
            id: Date.now(),
            timestamp: Date.now()
        };
        return {
            ...prev,
            [username]: [...userConversation, newMessage]
        };
    });
  }, []);

  const deleteAd = useCallback((adId: number) => {
    setAds(prev => prev.filter(ad => ad.id !== adId));
  }, []);

  const updateAd = useCallback((updatedAd: Ad) => {
      setAds(prev => prev.map(ad => ad.id === updatedAd.id ? updatedAd : ad));
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
      if (!user) return;
      const oldUsername = user.username;
      
      if (oldUsername !== updatedUser.username) {
          setAds(prevAds => prevAds.map(ad => ad.seller === oldUsername ? { ...ad, seller: updatedUser.username } : ad));
          setMessages(prevMessages => {
              const newMessages = {...prevMessages};
              if(newMessages[oldUsername]){
                  newMessages[updatedUser.username] = newMessages[oldUsername];
                  delete newMessages[oldUsername];
              }
              return newMessages;
          });
      }
      setUser(updatedUser);
  }, [user]);

  return (
    <AppContext.Provider value={{ user, ads, messages, login, logout, addAd, addMessage, deleteAd, updateAd, updateUser }}>
      <HashRouter>
        <div className="bg-gray-100 min-h-screen font-sans text-gray-800">
          <Header />
          <main className="p-4 md:p-8 pt-20">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/category/:categoryName" element={<ListPage />} />
              <Route path="/ad/:adId" element={<AdDetailPage />} />
              <Route path="/edit-ad/:adId" element={user ? <EditAdPage /> : <Navigate to="/login" />} />
              <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
              <Route path="/post-ad" element={user ? <PostAdPage /> : <Navigate to="/login" />} />
              <Route path="/chat" element={user && user.role === 'user' ? <ChatPage /> : <Navigate to="/login" />} />
              <Route path="/admin/chat" element={user && user.role === 'admin' ? <AdminChatPage /> : <Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;