import React, { useState } from 'react';
import { Search, MessageSquare, UserPlus, UserMinus, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout';

// Types
type Friend = {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  mutualFriends: number;
};

// Components
const Avatar: React.FC<{ src: string; alt: string; status: 'online' | 'offline' }> = ({ src, alt, status }) => (
  <div className="relative">
    <img src={src} alt={alt} className="w-12 h-12 rounded-full object-cover" />
    <div className={`absolute bottom-0 left-0 w-3 h-3 rounded-full border-2 border-white ${status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
  </div>
);

const FriendCard: React.FC<{ 
  friend: Friend; 
  onMessage: (id: number) => void; 
  onRemove: (id: number) => void;
}> = ({ friend, onMessage, onRemove }) => (
  <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
    <div className="flex items-center space-x-4 gap-3">
      <Avatar src={friend.avatar} alt={friend.name} status={friend.status} />
      <div className="ml-4">
        <h3 className="font-semibold text-lg">{friend.name}</h3>
        <p className="text-sm text-gray-500">
          {friend.status === 'online' ? 'מחובר' : 'לא מחובר'}
        </p>
        <p className="text-xs text-gray-400">{friend.mutualFriends} חברים משותפים</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button onClick={() => onMessage(friend.id)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full">
        <MessageSquare size={20} />
      </button>
      <button onClick={() => onRemove(friend.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
        <UserMinus size={20} />
      </button>
    </div>
  </div>
);

const RecommendedFriends: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const recommendedFriends: Friend[] = [
    { id: 5, name: 'שירה לוי', avatar: 'https://i.pravatar.cc/150?img=5', status: 'online', mutualFriends: 8 },
    { id: 6, name: 'יוסי כהן', avatar: 'https://i.pravatar.cc/150?img=6', status: 'offline', mutualFriends: 6 },
  ];

  return (
    <div className=" rounded-lg shadow-md overflow-hidden">
      <button
        className="w-full p-4 bg-green-500 text-white font-semibold flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        חברים מומלצים
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {isOpen && (
        <div className="p-4 space-y-4">
          {recommendedFriends.map(friend => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onMessage={() => {}}
              onRemove={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ConfirmationPopup: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  friendName: string;
}> = ({ isOpen, onClose, onConfirm, friendName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-xl font-bold mb-4">הסרת חבר</h2>
        <p className="mb-6">האם אתה בטוח שברצונך להסיר את {friendName} מרשימת החברים שלך?</p>
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
            ביטול
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            הסר
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
const FriendsPage: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([
    { id: 1, name: 'יעל כהן', avatar: 'https://i.pravatar.cc/150?img=1', status: 'online', mutualFriends: 5 },
    { id: 2, name: 'דני לוי', avatar: 'https://i.pravatar.cc/150?img=2', status: 'offline', mutualFriends: 3 },
    { id: 3, name: 'מיכל גולן', avatar: 'https://i.pravatar.cc/150?img=3', status: 'online', mutualFriends: 7 },
    { id: 4, name: 'אבי ישראלי', avatar: 'https://i.pravatar.cc/150?img=4', status: 'offline', mutualFriends: 2 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<{ isOpen: boolean; friendId: number | null; friendName: string }>({
    isOpen: false,
    friendId: null,
    friendName: '',
  });

  const handleMessage = (id: number) => {
    console.log(`Messaging friend with id: ${id}`);
    // Implement messaging logic here
  };

  const handleRemoveFriend = (id: number) => {
    const friendToRemove = friends.find(friend => friend.id === id);
    if (friendToRemove) {
      setConfirmRemove({ isOpen: true, friendId: id, friendName: friendToRemove.name });
    }
  };

  const confirmRemoveFriend = () => {
    if (confirmRemove.friendId !== null) {
      setFriends(friends.filter(friend => friend.id !== confirmRemove.friendId));
    }
    setConfirmRemove({ isOpen: false, friendId: null, friendName: '' });
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
    <div className="min-h-screen mb-14 md:mb-0 p-8 rtl" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">החברים שלי</h1>
          <Link to="/addfriends" className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
            <UserPlus className="ml-2" size={20} />
            <span>הוסף חברים</span>
          </Link>
        </div>

        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="חפש חברים..."
            className="w-full p-3 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        </div>

        <div className="space-y-4">
          {filteredFriends.map(friend => (
            <FriendCard
              key={friend.id}
              friend={friend}
              onMessage={handleMessage}
              onRemove={handleRemoveFriend}
            />
          ))}
        </div>

        <div className="mt-8">
          <RecommendedFriends />
        </div>
      </div>

      <ConfirmationPopup
        isOpen={confirmRemove.isOpen}
        onClose={() => setConfirmRemove({ isOpen: false, friendId: null, friendName: '' })}
        onConfirm={confirmRemoveFriend}
        friendName={confirmRemove.friendName}
      />
    </div>
    </Layout>
  );
};

export default FriendsPage;

