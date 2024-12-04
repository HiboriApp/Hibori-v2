import React, { useEffect, useState } from 'react';
import { ArrowLeft, Search, UserPlus } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import SuperSillyLoading from '../components/Loading';
import { addFriend, findNonFriends, getUser, UserData } from '../api/db';
import Layout from '../components/layout';

const Avatar: React.FC<{ src: string }> = ({ src }) => (
  <div dangerouslySetInnerHTML={{ __html: src }} className="w-12 h-12 rounded-full object-cover" />
);

const UserCard: React.FC<{ 
  otherUser: UserData; 
  user: UserData;
  onAddFriend: (id: string) => void;
}> = ({ otherUser: otherUser, onAddFriend, user }) => {
  const mutualFriends = user.friends.filter(f => otherUser.friends.includes(f)).length;
  return <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
    <div className="flex items-center space-x-4 gap-4">
      <Avatar src={otherUser.icon} />
      <div className="mr-4">
        <h3 className="font-semibold text-lg">{otherUser.name}</h3>
        <p className="text-xs text-gray-400">{mutualFriends} חברים משותפים</p>
      </div>
    </div>
    <button onClick={() => onAddFriend(otherUser.id)} className="p-2 text-green-500 hover:bg-green-100 rounded-full">
      <UserPlus size={20} />
    </button>
  </div>
};

const AddFriendsPage: React.FC = () => {
  const [users, setUsers] = useState<UserData[] | undefined>();
  const [user, setUser] = useState<UserData | undefined>();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    const fetchUsers = async () => {
      const userData = await getUser();
      if (!userData) {
        navigate('/');
        return;
      }
      setUser(userData);
      const users = await findNonFriends(userData, 20);
      setUsers(users.filter(u => u.id !== userData.id));
    };
    fetchUsers();
  })
  const handleAddFriend = (id: string) => {
    if (!user){return;}
    setUser({ ...user, friends: [...user.friends, id] });
    addFriend(user, id);
  };
  if (!users || !user) return <SuperSillyLoading></SuperSillyLoading>;
  const filteredUsers = users
    .filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => b.friends.filter(f => a.friends.includes(f)).length - a.friends.filter(f => b.friends.includes(f)).length);

  return (
    <Layout><div className="min-h-screen  p-8 rtl" dir="rtl">
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
          {filteredUsers.map(otherUser => (
            <UserCard
              key={otherUser.id}
              otherUser={otherUser}
              user={user}
              onAddFriend={handleAddFriend}
            />
          ))}
        </div>
      </div>
    </div></Layout>
  );
};

export default AddFriendsPage;

