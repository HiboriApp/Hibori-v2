import React, { useState } from 'react';
import { ArrowLeft, Search, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

type User = {
  id: number;
  name: string;
  avatar: string;
  mutualFriends: number;
};

const Avatar: React.FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <img src={src} alt={alt} className="w-12 h-12 rounded-full object-cover" />
);

const UserCard: React.FC<{ 
  user: User; 
  onAddFriend: (id: number) => void;
}> = ({ user, onAddFriend }) => (
  <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
    <div className="flex items-center space-x-4 gap-4">
      <Avatar src={user.avatar} alt={user.name} />
      <div className="mr-4">
        <h3 className="font-semibold text-lg">{user.name}</h3>
        <p className="text-xs text-gray-400">{user.mutualFriends} חברים משותפים</p>
      </div>
    </div>
    <button onClick={() => onAddFriend(user.id)} className="p-2 text-green-500 hover:bg-green-100 rounded-full">
      <UserPlus size={20} />
    </button>
  </div>
);

const AddFriendsPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'רונית כהן', avatar: 'https://i.pravatar.cc/150?img=1', mutualFriends: 12 },
    { id: 2, name: 'אלון לוי', avatar: 'https://i.pravatar.cc/150?img=2', mutualFriends: 8 },
    { id: 3, name: 'שירה גולן', avatar: 'https://i.pravatar.cc/150?img=3', mutualFriends: 6 },
    { id: 4, name: 'יובל כהן', avatar: 'https://i.pravatar.cc/150?img=4', mutualFriends: 4 },
    { id: 5, name: 'נועה שמיר', avatar: 'https://i.pravatar.cc/150?img=5', mutualFriends: 3 },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const handleAddFriend = (id: number) => {
    console.log(`Adding friend with id: ${id}`);
    // Implement add friend logic here
  };

  const filteredUsers = users
    .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.mutualFriends - a.mutualFriends);

  return (
    <div className="min-h-screen  p-8 rtl" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">הוסף חברים</h1>
          <Link to="/connections" className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
            <ArrowLeft className="ml-2" size={20} />
            <span>חזרה</span>
          </Link>
        </div>

        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="חפש משתמשים..."
            className="w-full p-3 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
        </div>

        <div className="space-y-4">
          {filteredUsers.map(user => (
            <UserCard
              key={user.id}
              user={user}
              onAddFriend={handleAddFriend}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddFriendsPage;

