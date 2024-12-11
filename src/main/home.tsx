import React, { useState, useEffect } from 'react';
import { Loader2, Heart, Share2, Bell, MessageSquare, User, Send, Users, ImageIcon, Video, X, Plus } from 'lucide-react';
import { Layout } from '../components/layout';
import { getUsersById, getUser, UserData, Post, getUserById, getPosts, postStuff, FileDisplay, deletePost, UploadedFile, fileType, likePost, Comment, updatePost, ChatWrapper, getChats } from '../api/db';
import { useNavigate } from 'react-router-dom';
import { postsListener, userListener } from '../api/listeners';
import SuperSillyLoading from '../components/Loading';
import { Avatar } from '../api/icons';
import { Timestamp } from 'firebase/firestore';
import { GetPallate, Pallate, DefaultPallate } from '../api/settings';

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

interface CommentSectionProps {
  comments: Comment[];
  onAddComment: (content: string) => void;
  currentUser: UserData;
  canComment: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ comments, onAddComment, currentUser, canComment }) => {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment('');
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">תגובות</h3>
      <div className="space-y-4 mb-4">
        {comments.map((comment) => (
          <div key={comment.name + comment.message.slice(0, 10)} className="flex items-start space-x-3 space-x-reverse">
            <Avatar icon={comment.icon} className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-secondary font-bold text-sm" />
            <div className="flex-1">
              <p className="font-semibold">{comment.name}</p>
              <p className="text-sm text-text">{comment.message}</p>
              <p className="text-xs text-text mt-1">
                {comment.timestamp.toDate().toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
      {canComment && <form onSubmit={handleSubmit} className="flex items-center">
        <Avatar icon={currentUser.icon} className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-secondary font-bold text-sm ml-2" />
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="הוסף תגובה..."
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-primary"
        />
        <button
          type="submit"
          className="ml-2 text-primary hover:text-secondary transition-colors duration-200"
        >
          <Send size={20} />
        </button>
      </form>}
    </div>
  );
};

const ContentCard: React.FC<{ item: Post, userLiked: boolean; handleComment: (content: string, post: Post) => void; user: UserData; deletePost: (post: string) => void, pallate: Pallate }> = 
({ item, deletePost, user, userLiked, handleComment, pallate }) => {
  const [isLiked, setIsLiked] = useState(userLiked);
  const [likes, setLikes] = useState(item.likes);
  const [poster, setPoster] = useState<UserData | undefined>();
  const [canComment, setCanComment] = useState(false);
  useEffect(() => {getUserById(item.owner).then((user) => setPoster(user));}, [])
  if (!poster){return null;}

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes((prevLikes) => (isLiked ? prevLikes - 1 : prevLikes + 1));
    likePost(item, user, !isLiked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `פוסט מאת ${poster.name}`,
          text: item.content,
          url: window.location.href,
        })
        .then(() => {
          console.log('Successfully shared');
        })
        .catch((error) => {
          console.log('Error sharing:', error);
        });
    } else {
      alert('שיתוף לא נתמך בדפדפן זה');
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-xl overflow-hidden" style={{ backgroundColor: pallate.background }}>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Avatar icon={poster.icon} className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-secondary font-bold text-xl ml-4" />
          <div>
            <p className="font-semibold text-lg text-text">{poster.name}</p>
            <p className="text-sm text-text">
              {item.timestamp.toDate().toLocaleString()}
            </p>
          </div>
          {item.owner === poster.id && (
            <button
              className="mr-auto hover:text-primary transition-colors duration-200"
              onClick={() => deletePost(item.id)}
            >
              <X size={24}></X>
            </button>
          )}
        </div>
        <p className="text-base text-text mb-4">{item.content}</p>
        {item.file && (
          <FileDisplay file={item.file} className="rounded-xl w-full object-cover max-h-96 mb-4"></FileDisplay>
        )}
        <div className="flex justify-between items-center text-text">
          <button
            className="flex items-center hover:text-primary transition-colors duration-200"
            onClick={() => setCanComment(!canComment)}
          >
            <MessageSquare size={24} className="ml-2" />
            <span className="text-base">שלח תגובה</span>
          </button>
          <button
            className={`flex items-center transition-colors duration-200 ${
              isLiked ? 'text-primary' : 'hover:text-primary'
            }`}
            onClick={handleLike}
          >
            <Heart
              size={24}
              fill={isLiked ? 'currentColor' : 'none'}
              className="ml-2"
            />
            <span className="text-base">{likes}</span>
          </button>
          <button
            className="flex items-center hover:text-primary transition-colors duration-200"
            onClick={handleShare}
          >
            <Share2 size={24} className="ml-2" />
            <span className="text-base">שתף</span>
          </button>
        </div>
      </div>
      <CommentSection canComment={canComment} comments={item.comments} onAddComment={(c) => handleComment(c, item)} currentUser={user}></CommentSection>
    </div>
  );
};

function NewContentFeed({
  content,
  handleDelete,
  handleComment,
  user,
  pallate
}: {
  content: Post[];
  user: UserData;
  handleComment: (content: string, post: Post) => void
  handleDelete: (post: string) => void
  pallate: Pallate;
}) {
  if (content.length === 0) {
    return <LoadingSpinner />;
  }
  return (
    <div className="space-y-6">
      {content.map((item) => (
        <ContentCard handleComment={handleComment} user={user} userLiked={user.likes.includes(item.id)} deletePost={handleDelete} key={item.id} item={item} pallate={pallate}/>
      ))}
    </div>
  );
}

function LeftPanel({
  friends,
  messages,
  user,
  pallate
}: {
  friends: UserData[];
  messages: {user: string, chat: ChatWrapper}[];
  user: UserData;
  pallate: Pallate;
}) {
  return (
    <>
      <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: pallate.background }}>
        <h3 className="text-xl font-semibold text-text mb-4 flex items-center">
          <Users className="ml-3 text-primary" size={24} />
          חברים מקוונים
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {friends.map((friend) => (
            <div key={friend.id} className="flex flex-col items-center">
              <div className="relative">
                <div
                  className="h-12 w-12 rounded"
                  dangerouslySetInnerHTML={{ __html: friend.icon }}
                ></div>
                <div
                  className={`absolute bottom-0 left-0 w-3 h-3 rounded-full border-2 border-white ${
                    friend.isOnline ? 'bg-primary' : 'bg-text'
                  }`}
                ></div>
              </div>
              <span className="mt-1 text-xs text-text text-center">
                {friend.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: pallate.background }}>
        <h3 className="text-xl font-semibold text-text mb-4 flex items-center">
          <MessageSquare className="ml-3 text-primary" size={24} />
          הודעות חדשות
        </h3>
        <ul className="space-y-3">
          {messages.map((message) => {
            const [user, setUser] = useState<UserData | undefined>();
            useEffect(() => {
              getUserById(message.user).then((u) => setUser(u));
            }, [])
            if (!user){return;}
            return <li key={message.chat.id} className="flex items-center justify-between">
              <div className="flex items-center">
                <Avatar className="w-10 h-10 rounded-full ml-3" icon={user.icon}></Avatar>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-md text-text truncate">
                    {message.chat.lastMessage.content.length > 20
                      ? message.chat.lastMessage.content.substring(0, 20) + '...'
                      : message.chat.lastMessage.content}
                  </p>
                  <span className="text-xs text-text">
                    {message.chat.lastMessageDate.toDate().toLocaleString()}
                  </span>
                </div>
              </div>
              <button className="p-2 rounded-full hover:bg-background transition-colors duration-200">
                <Send className="h-4 w-4 text-primary" />
                <span className="sr-only">Send message</span>
              </button>
            </li>})}
        </ul>
      </div>
      <div className="rounded-xl p-6" style={{ backgroundColor: pallate.background }}>
        <h3 className="text-xl font-semibold text-text mb-4 flex items-center">
          <Bell className="ml-3 text-primary" size={24} />
          התראות
        </h3>
        <ul className="space-y-3">
          {user.notifications.map((notification, i) => (
            <li
              key={notification.timestamp.toDate().getTime() + i}
              className="flex items-center bg-background rounded-lg p-3"
            >
              <Avatar icon={notification.icon} className='w-10 h-10 rounded-full ml-3'></Avatar>
              <div className="flex-grow">
                <p className="text-sm text-text">
                  {notification.content}
                </p>
                <span className="text-xs text-text">
                  {notification.timestamp.toDate().toLocaleString()}
                </span>
              </div>
              <div className="ml-3">
                {notification.type === 'like' && (
                  <Heart className="text-red" size={20} />
                )}
                {notification.type === 'comment' && (
                  <MessageSquare className="text-blue" size={20} />
                )}
                {notification.type === 'message' && (
                  <User className="text-primary" size={20} />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

const CreatePost = ({
  onPostSubmit,
  pallate
}: {
  pallate: Pallate;
  onPostSubmit: (newPost: { content: string; file: UploadedFile | undefined }) => void;
}) => {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<UploadedFile | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() === '' && !file) return;

    onPostSubmit({ content, file });
    setContent('');
    setFile(undefined);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: fileType) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name;
      const reader = new FileReader();
      reader.onloadend = () => {
        const file = reader.result as string;
        setFile({type, content: file, name: fileName} as UploadedFile);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="shadow-lg rounded-xl p-6 mb-6" style={{ backgroundColor: pallate.background }}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-start mb-4">
          <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-secondary font-bold text-xl ml-4">
            <User size={24} />
          </div>
          <textarea
            className="flex-grow border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-primary"
            placeholder="מה תרצה לשתף?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>
        {file?.type == fileType.image && (
          <div className="relative mb-4">
            <img
              src={file.content}
              alt="Preview"
              className="rounded-xl max-h-64 w-full object-cover"
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              onClick={() => setFile(undefined)}
            >
              <X/>
            </button>
          </div>
        )}
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <label className="cursor-pointer text-text hover:text-primary transition-colors duration-200 ml-4">
              <input type="file" className="hidden" onChange={(file) => handleImageUpload(file, fileType.image)} />
              <ImageIcon size={24} />
            </label>
            <label className="cursor-pointer text-text hover:text-primary transition-colors duration-200">
              <input type="file" accept="video/*" className="hidden" />
              <Video size={24} />
            </label>
          </div>
          <button
            type="submit"
            className="bg-primary flex text-white px-4 py-2 rounded-xl hover:bg-secondary transition-colors duration-200"
          >
            <Plus className='ml-1S'/>
            פרסם
          </button>
        </div>
      </form>
    </div>
  );
};

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [friends, setFriends] = useState<UserData[]>([]);
  const [pallate, setPallate] = useState<Pallate>(DefaultPallate());
  const [messages, setMessages] = useState<{chat: ChatWrapper, user: string}[]>([]);
  const [posts, setPosts] = useState<Post[] | undefined>();
  const postsLimit = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUser();
      if (!userData) {
        navigate('/');
        return;
      }
      setUser(userData);
      const friendsData = await getUsersById(userData.friends);
      setFriends(friendsData);
      const postsData = await getPosts(postsLimit);
      const {chats, friends} = await getChats(userData);
      setMessages(chats.map((message, i) => ({chat: message, user: friends[i]})));
      setPosts(postsData);
      const pallate = await GetPallate();
      setPallate(pallate);
      return postsListener(setPosts, postsLimit);
    };
    fetchData();

    const unsubscribe = userListener(async (user) => {
      setUser(user);
      const friendsData = await getUsersById(user.friends);
      setFriends(friendsData);
    });
    return unsubscribe;
  }, [navigate]);

  const handleDelete = (id: string) => {
    if (!user){return;}
    deletePost(id);
    setPosts(posts?.filter((post) => post.id !== id));
  }

  const handlePostSubmit = (newPost: {
    content: string;
    file: UploadedFile | undefined;
  }) => {
    if (!user){return;}
    const post: Post = {
      id: user.id + Date.now(),
      timestamp: Timestamp.fromDate(new Date()),
      content: newPost.content,
      file: newPost.file,
      likes: 0,
      comments: [],
      owner: user.id,
    }
    postStuff(post);
    setPosts([...(posts || []), post]);
  };

  

  const handleComment = (message: string, post: Post) => {
    if (!user){return;}
    const comment: Comment = {
      message, name: user.name, icon: user.icon, timestamp: Timestamp.now()
    }
    updatePost({...post, comments: [...post.comments, comment]});
  };
  if (!user || !posts || !pallate) return <SuperSillyLoading></SuperSillyLoading>;
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="flex justify-center">
          <div
            className="w-full max-w-7xl grid grid-cols-12 gap-4"
            style={{ direction: 'rtl' }}
          >
            {/* תוכן ראשי */}
            <div className="col-span-12 lg:col-span-8 px-4 py-8" dir="rtl">
              <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-text border-b-2 border-green-400 pb-2">
                  הודעות ופוסטים
                </h1>
                <div className="mb-8">
                  <CreatePost pallate={pallate} onPostSubmit={handlePostSubmit} />
                  <NewContentFeed pallate={pallate} handleComment={handleComment} user={user} handleDelete={handleDelete} content={posts.sort(
                    (a, b) => a.timestamp.toDate().getTime() > b.timestamp.toDate().getTime() ? 0 : 1)} />
                </div>
              </div>
            </div>
            {/* פאנל שמאלי */}
            <div className="hidden lg:block col-span-4">
              <div className="sticky top-6">
                <div className="space-y-6" dir="rtl">
                  <LeftPanel pallate={pallate} user={user} friends={friends} messages={messages} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;

