import React, { useState, useEffect } from "react";
import {
  Loader2,
  Heart,
  Share2,
  Bell,
  MessageSquare,
  User,
  Send,
  Users,
  ImageIcon,
  Video,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { Layout } from "../components/layout";
import {
  getUsersById,
  getUser,
  UserData,
  Post,
  getUserById,
  getPosts,
  postStuff,
  FileDisplay,
  deletePost,
  UploadedFile,
  fileType,
  likePost,
  Comment,
  updatePost,
  ChatWrapper,
  getChats,
} from "../api/db";
import { useNavigate } from "react-router-dom";
import { postsListener, userListener } from "../api/listeners";
import SuperSillyLoading from "../components/Loading";
import { Avatar } from "../api/icons";
import { Timestamp } from "firebase/firestore";
import { GetPallate, Pallate, DefaultPallate } from "../api/settings";

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
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  onAddComment,
  currentUser,
}) => {
  const [newComment, setNewComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const visibleComments = showAllComments ? comments : comments.slice(0, 3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex items-start space-x-2 space-x-reverse">
          <Avatar
            icon={currentUser.icon}
            className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm"
          />
          <div className="flex-grow">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="הוסף תגובה..."
              className="w-full border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-full text-sm hover:bg-secondary transition-colors duration-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
      {comments.length > 0 && (
        <div className="space-y-4">
          {visibleComments.map((comment, index) => (
            <div
              key={comment.name + comment.message.slice(0, 10) + index}
              className="flex items-start space-x-3 space-x-reverse bg-white border border-gray-200 rounded-lg p-3 shadow-sm"
            >
              <Avatar
                icon={comment.icon}
                className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">
                  {comment.name}
                </p>
                <p className="text-sm text-gray-600 break-words">
                  {comment.message}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {comment.timestamp.toDate().toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      {comments.length > 3 && (
        <button
          onClick={() => setShowAllComments(!showAllComments)}
          className="mt-2 text-primary hover:text-secondary transition-colors duration-200 text-sm font-medium flex items-center"
        >
          {showAllComments ? (
            <>
              <ChevronUp className="w-4 h-4 ml-1" />
              הסתר תגובות
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 ml-1" />
              הצג עוד תגובות ({comments.length - 3})
            </>
          )}
        </button>
      )}
    </div>
  );
};

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-15 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-sm w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">מחיקת פוסט</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="mb-6 text-gray-600">
          האם אתה בטוח שברצונך למחוק את הפוסט?
        </p>
        <div className="flex justify-center">
          <button
            onClick={onConfirm}
            className=" flex items-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4 ml-2" />
            אישור
          </button>
        </div>
      </div>
    </div>
  );
};

const ContentCard: React.FC<{
  item: Post;
  userLiked: boolean;
  handleComment: (content: string, post: Post) => void;
  user: UserData;
  deletePost: (post: string) => void;
  pallate: Pallate;
}> = ({ item, deletePost, user, userLiked, handleComment, pallate }) => {
  const [isLiked, setIsLiked] = useState(userLiked);
  const [likes, setLikes] = useState(item.likes);
  const [poster, setPoster] = useState<UserData | undefined>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    getUserById(item.owner).then((user) => setPoster(user));
  }, []);

  if (!poster) {
    return null;
  }

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
        })
        .then(() => {
          console.log("Successfully shared");
        })
        .catch((error) => {
          console.log("Error sharing:", error);
        });
    } else {
      alert("שיתוף לא נתמך בדפדפן זה");
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    deletePost(item.id);
    setIsDeleteModalOpen(false);
  };

  return (
    <div
      className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200"
      style={{ backgroundColor: pallate.background }}
    >
      <div className="p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <Avatar
            icon={poster.icon}
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xl ml-3"
          />
          <div className="flex-grow">
            <p className="font-semibold text-base text-gray-800">
              {poster.name}
            </p>
            <p className="text-xs text-gray-500">
              {item.timestamp.toDate().toLocaleString()}
            </p>
          </div>
          {item.owner === user.id && (
            <button
              className="hover:text-red-500 transition-colors duration-200"
              onClick={handleDeleteClick}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <p className="text-sm sm:text-base text-gray-700 mb-4">
          {item.content}
        </p>
        {item.file && (
          <FileDisplay
            file={item.file}
            className="rounded-xl w-full object-cover max-h-96 mb-4"
          ></FileDisplay>
        )}
        <div className="flex justify-between items-center text-gray-600 mb-4">
          <button
            className="flex items-center hover:text-primary transition-colors duration-200"
            onClick={() => {}}
          >
            <MessageSquare className="w-5 h-5 ml-1" />
            <span className="text-sm">{item.comments.length} תגובות</span>
          </button>
          <button
            className={`flex items-center transition-colors duration-200 ${
              isLiked ? "text-red-500" : "hover:text-red-500"
            }`}
            onClick={handleLike}
          >
            <Heart
              className="w-5 h-5 ml-1"
              fill={isLiked ? "currentColor" : "none"}
            />
            <span className="text-sm">{likes}</span>
          </button>
          <button
            className="flex items-center hover:text-primary transition-colors duration-200"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5 ml-1" />
            <span className="text-sm">שתף</span>
          </button>
        </div>
        <CommentSection
          comments={item.comments}
          onAddComment={(c) => handleComment(c, item)}
          currentUser={user}
        />
      </div>
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

function NewContentFeed({
  content,
  handleDelete,
  handleComment,
  user,
  pallate,
}: {
  content: Post[];
  user: UserData;
  handleComment: (content: string, post: Post) => void;
  handleDelete: (post: string) => void;
  pallate: Pallate;
}) {
  if (content.length === 0) {
    return <LoadingSpinner />;
  }
  return (
    <div className="space-y-6">
      {content.map((item) => (
        <ContentCard
          handleComment={handleComment}
          user={user}
          userLiked={user.likes.includes(item.id)}
          deletePost={handleDelete}
          key={item.id}
          item={item}
          pallate={pallate}
        />
      ))}
    </div>
  );
}

function TopPanel({
  friends,
  messages,
  user,
  pallate,
}: {
  friends: UserData[];
  messages: { user: string; chat: ChatWrapper }[];
  user: UserData;
  pallate: Pallate;
}) {
  const navigate = useNavigate();
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: pallate.background }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Users className="ml-2 text-primary" size={20} />
          חברים מקוונים
        </h3>
        <div className="flex flex-wrap gap-2">
          {friends.slice(0, 6).map((friend) => (
            <div key={friend.id} className="flex flex-col items-center">
              <Avatar
                icon={friend.icon}
                isOnline={friend.lastOnline.toDate() > new Date()}
                className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm"
              />
              <span className="mt-1 text-xs text-gray-600 text-center">
                {friend.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: pallate.background }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <MessageSquare className="ml-2 text-primary" size={20} />
          הודעות חדשות
        </h3>
        <ul className="space-y-2">
          {messages.slice(0, 3).map((message) => {
            const [messageUser, setMessageUser] = useState<
              UserData | undefined
            >();
            useEffect(() => {
              getUserById(message.user).then((u) => setMessageUser(u));
            }, []);
            if (!messageUser) {
              return null;
            }
            return (
              <li
                key={message.chat.id}
                className="bg-white rounded-lg shadow-sm p-2 transition-all duration-300 ease-in-out"
              >
                <div className="flex items-center">
                  <Avatar
                    className="w-8 h-8 rounded-full ml-2"
                    icon={messageUser.icon}
                  />
                  <div>
                    <p className="font-medium text-sm text-gray-800">
                      {messageUser.name}
                    </p>
                    <p className="text-xs text-gray-600 truncate max-w-[150px]">
                      {message.chat.lastMessage &&
                        message.chat.lastMessage.content}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: pallate.background }}
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Bell className="ml-2 text-primary" size={20} />
          התראות
        </h3>
        <ul className="space-y-2">
          {user.notifications.slice(0, 3).map((notification, i) => (
            <li
              key={notification.timestamp.toDate().getTime() + i}
              className="flex items-center bg-white rounded-lg p-2 shadow-sm"
            >
              <Avatar
                icon={notification.icon}
                className="w-8 h-8 rounded-full ml-2"
              ></Avatar>
              <div className="flex-grow">
                <p className="text-xs text-gray-700">{notification.content}</p>
                <span className="text-xs text-gray-500">
                  {notification.timestamp.toDate().toLocaleString()}
                </span>
              </div>
              <div className="ml-2">
                {notification.type === "like" && (
                  <Heart className="text-red-500" size={16} />
                )}
                {notification.type === "comment" && (
                  <MessageSquare className="text-blue-500" size={16} />
                )}
                {notification.type === "message" && (
                  <User className="text-primary" size={16} />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const CreatePost = ({
  onPostSubmit,
  pallate,
}: {
  pallate: Pallate;
  onPostSubmit: (newPost: {
    content: string;
    file: UploadedFile | undefined;
  }) => void;
}) => {
  const [content, setContent] = useState("");
  const [file, setFile] = useState<UploadedFile | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() === "" && !file) return;

    onPostSubmit({ content, file });
    setContent("");
    setFile(undefined);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: fileType
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const fileName = file.name;
      const reader = new FileReader();
      reader.onloadend = () => {
        const file = reader.result as string;
        setFile({ type, content: file, name: fileName } as UploadedFile);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="shadow-lg rounded-xl p-4 sm:p-6 mb-6"
      style={{ backgroundColor: pallate.background }}
    >
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row items-start mb-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-lg mb-2 sm:mb-0 sm:ml-4">
            <User className="w-5 h-5" />
          </div>
          <textarea
            className="w-full sm:flex-grow border border-gray-300 rounded-xl p-2 focus:outline-none focus:ring-2 focus:ring-primary text-sm"
            placeholder="מה תרצה לשתף?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
          ></textarea>
        </div>
        {file?.type == fileType.image && (
          <div className="relative mb-4">
            <img
              src={file.content}
              alt="Preview"
              className="rounded-xl max-h-48 sm:max-h-64 w-full object-cover"
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
              onClick={() => setFile(undefined)}
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <label className="cursor-pointer text-gray-600 hover:text-primary transition-colors duration-200 ml-2 sm:ml-4">
              <input
                type="file"
                className="hidden"
                onChange={(file) => handleImageUpload(file, fileType.image)}
              />
              <ImageIcon size={20} />
            </label>
            <label className="cursor-pointer text-gray-600 hover:text-primary transition-colors duration-200">
              <input type="file" accept="video/*" className="hidden" />
              <Video size={20} />
            </label>
          </div>
          <button
            type="submit"
            className="bg-green-600 flex text-white px-3 py-1 sm:px-4 sm:py-2 rounded-xl hover:bg-green-700 transition-colors duration-200 text-sm sm:text-base"
          >
            <Plus className="ml-1" size={16} />
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
  const [messages, setMessages] = useState<
    { chat: ChatWrapper; user: string }[]
  >([]);
  const [posts, setPosts] = useState<Post[] | undefined>();
  const postsLimit = 10;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUser();
      if (!userData) {
        navigate("/");
        return;
      }
      setUser(userData);
      const friendsData = await getUsersById(userData.friends);
      setFriends(friendsData);
      const postsData = await getPosts(postsLimit);
      const { chats, friends } = await getChats(userData);
      setMessages(
        chats.map((message, i) => ({ chat: message, user: friends[i] }))
      );
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
    if (!user) {
      return;
    }
    deletePost(id);
    setPosts(posts?.filter((post) => post.id !== id));
  };

  const handlePostSubmit = (newPost: {
    content: string;
    file: UploadedFile | undefined;
  }) => {
    if (!user) {
      return;
    }
    const post: Post = {
      id: user.id + Date.now(),
      timestamp: Timestamp.fromDate(new Date()),
      content: newPost.content,
      file: newPost.file,
      likes: 0,
      comments: [],
      owner: user.id,
    };
    postStuff(post);
    setPosts([...(posts || []), post]);
  };

  const handleComment = (message: string, post: Post) => {
    if (!user) {
      return;
    }
    const comment: Comment = {
      message,
      name: user.name,
      icon: user.icon,
      timestamp: Timestamp.now(),
    };
    updatePost({ ...post, comments: [...post.comments, comment] });
  };

  if (!user || !posts || !pallate)
    return <SuperSillyLoading></SuperSillyLoading>;

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <TopPanel
            pallate={pallate}
            user={user}
            friends={friends}
            messages={messages}
          />
          <div className="mb-8">
            <CreatePost pallate={pallate} onPostSubmit={handlePostSubmit} />
            <NewContentFeed
              pallate={pallate}
              handleComment={handleComment}
              user={user}
              handleDelete={handleDelete}
              content={posts.sort(
                (a, b) =>
                  b.timestamp.toDate().getTime() -
                  a.timestamp.toDate().getTime()
              )}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;
