import React, { useEffect, useState } from 'react';
import { Search, MessageSquare, UserPlus, UserMinus, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { getUser, getUsersById, UserData } from '../api/db';
import SuperSillyLoading from '../components/Loading';

const Avatar: React.FC<{ src: string; alt: string; status: 'online' | 'offline' }> = ({ src, status }) => (
  <div className="relative">
    <div className="w-12 h-12 rounded-full object-cover" dangerouslySetInnerHTML={{ __html: src }} />
    <div className={`absolute bottom-0 left-0 w-3 h-3 rounded-full border-2 border-white ${status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
  </div>
);

const FriendCard: React.FC<{ 
  friend: UserData; 
  user: UserData;
  onMessage: (id: string) => void; 
  onRemove: (id: string) => void;
}> = ({ friend, onMessage, user, onRemove }) => {
  const mutualFriends = user.friends.filter(f => friend.friends.includes(f)).length;
  return <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
    <div className="flex items-center space-x-4 gap-3">
      <Avatar src={friend.icon} alt={friend.name} status={friend.isOnline ? 'online' : 'offline'} />
      <div className="ml-4">
        <h3 className="font-semibold text-lg">{friend.name}</h3>
        <p className="text-sm text-gray-500">
          {friend.isOnline ? 'מחובר' : 'לא מחובר'}
        </p>
        <p className="text-xs text-gray-400">{mutualFriends} חברים משותפים</p>
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
};

const RecommendedFriends = ({user} : {user: UserData}) => {
  const [isOpen, setIsOpen] = useState(false);
  const recommendedFriends: never[] = [];;

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
              key={friend}
              user={user}
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
  const [user, setUser] = useState<UserData | null>(null);
  const [friends, setFriends] = useState<UserData[]>();
  const navigate = useNavigate();
  useEffect(() => {
    const fetcData= async () => {
      const userData = await getUser();
      if (!userData) {
        navigate('/'); // Redirect to login page
        return;
      }
      setUser(userData);
      setFriends(await getUsersById(userData.friends));
    }
    fetcData();
  }, [])
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<{ isOpen: boolean; friendId: string | null; friendName: string }>({
    isOpen: false,
    friendId: null,
    friendName: '',
  });

  const handleMessage = (id: string) => {
    console.log(`Messaging friend with id: ${id}`);
    // Implement messaging logic here
  };
  if (!user || !friends) {
    return <SuperSillyLoading></SuperSillyLoading>;
  }
  const handleRemoveFriend = (id: string) => {
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
              user={user}
              onMessage={handleMessage}
              onRemove={handleRemoveFriend}
            />
          ))}
        </div>

        <div className="mt-8">
          <RecommendedFriends user={user}/>
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

