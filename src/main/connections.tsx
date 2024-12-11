import React, { useEffect, useState } from 'react';
import { Search, MessageSquare, UserPlus, UserMinus, ChevronDown, ChevronUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { getUser, getUsersById, openChatName, removeFriend, UserData } from '../api/db';
import SuperSillyLoading from '../components/Loading';
import { Avatar } from '../api/icons';
import { GetPallate, Pallate } from '../api/settings';

const FriendCard: React.FC<{ 
  friend: UserData; 
  user: UserData;
  onMessage: (person: UserData) => void; 
  onRemove: (id: string) => void;
  pallate: Pallate;
}> = ({ friend, onMessage, user, onRemove, pallate }) => {
  const mutualFriends = user.friends.filter(f => friend.friends.includes(f)).length;
  return <div className={`bg-${pallate.white} rounded-lg shadow-md p-4 flex items-center justify-between`}>
    <div className="flex items-center space-x-4 gap-3">
      <Avatar icon={friend.icon} className={`w-12 h-12 rounded-full object-cover`} />
      <div className="ml-4">
        <h3 className={`font-semibold text-lg text-${pallate.text}`}>{friend.name}</h3>
        <p className={`text-sm text-${pallate.gray[500]}`}>
          {friend.isOnline ? 'מחובר' : 'לא מחובר'}
        </p>
        <p className={`text-xs text-${pallate.gray[400]}`}>{mutualFriends} חברים משותפים</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button 
        onClick={() => onMessage(friend)} 
        className={`p-2 text-${pallate.blue} hover:bg-${pallate.blueHover} rounded-full`}
      >
        <MessageSquare size={20} />
      </button>
      <button 
        onClick={() => onRemove(friend.id)} 
        className={`p-2 text-${pallate.red} hover:bg-${pallate.redHover} rounded-full`}
      >
        <UserMinus size={20} />
      </button>
    </div>
  </div>
};

const RecommendedFriends = ({ user, pallate }: { user: UserData; pallate: Pallate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const recommendedFriends: never[] = [];

  return (
    <div className="rounded-lg shadow-md overflow-hidden">
      <button
        className={`w-full p-4 bg-${pallate.secondary} text-${pallate.white} font-semibold flex justify-between items-center`}
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
              pallate={pallate}
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
  pallate: Pallate;
}> = ({ isOpen, onClose, onConfirm, friendName, pallate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-${pallate.white} rounded-lg p-6 max-w-sm w-full mx-4`}>
        <h2 className={`text-xl font-bold mb-4 text-${pallate.text}`}>הסרת חבר</h2>
        <p className={`mb-6 text-${pallate.gray[800]}`}>
          האם אתה בטוח שברצונך להסיר את {friendName} מרשימת החברים שלך?
        </p>
        <div className="flex justify-end space-x-4">
          <button 
            onClick={onClose} 
            className={`px-4 py-2 bg-${pallate.gray[200]} text-${pallate.gray[800]} rounded hover:bg-${pallate.gray[300]}`}
          >
            ביטול
          </button>
          <button 
            onClick={onConfirm} 
            className={`px-4 py-2 bg-${pallate.red} text-${pallate.white} rounded hover:bg-${pallate.redHover}`}
          >
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
  const [pallate, setPallate] = useState<Pallate | undefined>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetcData = async () => {
      const userData = await getUser();
      if (!userData) {
        navigate('/'); // Redirect to login page
        return;
      }
      setUser(userData);
      setFriends(await getUsersById(userData.friends));
      setPallate(await GetPallate());
    }
    fetcData();
  }, [])

  const [searchTerm, setSearchTerm] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<{ isOpen: boolean; friendId: string | null; friendName: string }>({
    isOpen: false,
    friendId: null,
    friendName: '',
  });

  const handleMessage = (person: UserData) => {
    if (!user) { return; }
    navigate('/messages/' + openChatName(user.id, person.id));
  };

  if (!user || !friends || !pallate) {
    return <SuperSillyLoading />;
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
      removeFriend(user, confirmRemove.friendId);
    }
    setConfirmRemove({ isOpen: false, friendId: null, friendName: '' });
  };

  const filteredFriends = friends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
    <div className={`min-h-screen mb-14 md:mb-0 p-8 rtl bg-${pallate.background}`} dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold text-${pallate.gray[800]}`}>החברים שלי</h1>
          <Link 
            to="/addfriends" 
            className={`text-${pallate.white} bg-${pallate.primary} px-4 py-2 rounded-full flex items-center space-x-2`}
          >
            <UserPlus className="ml-2" size={20} />
            <span>הוסף חברים</span>
          </Link>
        </div>

        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="חפש חברים..."
            className={`w-full p-3 pr-10 rounded-full border border-${pallate.gray[300]} focus:outline-none focus:ring-2 focus:ring-${pallate.blue}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className={`absolute left-3 top-3 text-${pallate.gray[400]}`} size={20} />
        </div>

        <div className="space-y-4">
          {filteredFriends.map(friend => (
            <FriendCard
              key={friend.id}
              friend={friend}
              user={user}
              onMessage={handleMessage}
              onRemove={handleRemoveFriend}
              pallate={pallate}
            />
          ))}
        </div>

        <div className="mt-8">
          <RecommendedFriends user={user} pallate={pallate}/>
        </div>
      </div>

      <ConfirmationPopup
        isOpen={confirmRemove.isOpen}
        onClose={() => setConfirmRemove({ isOpen: false, friendId: null, friendName: '' })}
        onConfirm={confirmRemoveFriend}
        friendName={confirmRemove.friendName}
        pallate={pallate}
      />
    </div>
    </Layout>
  );
};

export default FriendsPage;