import React, { useState, useEffect, useRef } from "react"
import ReactDOM from "react-dom"
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
  ChevronDown,
  Trash2,
  MoreVertical,
  Smile,
  Search,
} from "lucide-react"
import { Layout } from "../components/layout"
import {
  getUsersById,
  getUser,
  type UserData,
  type Post,
  getUserById,
  getPosts,
  postStuff,
  FileDisplay,
  deletePost,
  type UploadedFile,
  fileType,
  likePost,
  type Comment,
  updatePost,
  type ChatWrapper,
  getChats,
} from "../api/db"
import { useNavigate } from "react-router-dom"
import { postsListener, userListener } from "../api/listeners"
import SuperSillyLoading from "../components/Loading"
import { Avatar } from "../api/icons"
import { Timestamp } from "firebase/firestore"
import { type Pallate, DefaultPallate, GetPallate } from "../api/settings"
import { uploadString } from "../api/cloudinary"

// Custom scrollbar CSS – inject into document head (or include in your stylesheet)
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #c1c1c1;
    border-radius: 10px;
    border: 2px solid #f1f1f1;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #a8a8a8;
  }
`
if (typeof document !== "undefined") {
  const style = document.createElement("style")
  style.innerHTML = customScrollbarStyles
  document.head.appendChild(style)
}

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-24">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}

interface CommentProps {
  comment: Comment
  pallate: Pallate
  currentUser: UserData
}

const CommentItem: React.FC<CommentProps> = ({ comment, pallate }) => {
  return (
    <div className="mt-4" style={{ color: pallate.text, backgroundColor: pallate.background }}>
      <div
        className="bg-white rounded-lg shadow-sm p-4 transition-all duration-300 hover:shadow-md"
        style={{ backgroundColor: pallate.background }}
      >
        <div className="flex items-start space-x-3 space-x-reverse">
          <Avatar
            icon={comment.icon}
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-800 text-sm" style={{ color: pallate.text }}>
              {comment.name}
            </p>
            <p className="text-sm text-gray-600 break-words mt-2" style={{ color: pallate.text }}>
              {comment.message}
            </p>
            <div className="flex items-center mt-3 space-x-4 space-x-reverse text-xs text-gray-500">
              <span style={{ color: pallate.text }}>
                {comment.timestamp.toDate().toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface CommentSectionProps {
  comments: Comment[]
  onAddComment: (content: string, replyTo?: { id: string; content: string; name: string }) => void
  currentUser: UserData
  pallate: Pallate
}

const CommentSection: React.FC<CommentSectionProps> = ({
  comments,
  onAddComment,
  currentUser,
  pallate,
}) => {
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<{ id: string; content: string; name: string } | null>(null)
  const [expanded, setExpanded] = useState(false)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      onAddComment(newComment, replyingTo || undefined)
      setNewComment("")
      setReplyingTo(null)
    }
  }
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Show only 5 comments if not expanded
  const visibleComments = expanded ? comments : comments.slice(0, 5)

  return (
    <div className="mt-6 rounded-lg p-4" style={{ color: pallate.text, backgroundColor: pallate.background }}>
      <h3 className="text-lg font-semibold mb-4" style={{ color: pallate.text }}>
        תגובות
      </h3>
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex items-start space-x-2 space-x-reverse">
          <Avatar
            icon={currentUser.icon}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm"
          />
          <div className="flex-grow relative">
            <div className="relative">
              <textarea
                ref={commentInputRef}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={replyingTo ? "הגב לתגובה זו..." : "הוסף תגובה..."}
                className="w-full rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none min-h-[80px]"
                style={{ color: pallate.text, backgroundColor: pallate.secondary }}
              />
              <button
                type="submit"
                className="absolute bottom-2 left-2 text-white rounded-full p-2 hover:opacity-90 transition-colors duration-200"
                style={{ backgroundColor: pallate.primary }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </form>
      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4">
          <MessageSquare size={32} className="text-gray-500" />
          <p className="mt-2 text-sm" style={{ color: pallate.text }}>
            איפה כל החברים? אין אף תגובות פה!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visibleComments.map((comment) => (
            <CommentItem
              key={comment.name + comment.timestamp.toString()}
              comment={comment}
              currentUser={currentUser}
              pallate={pallate}
            />
          ))}
          {comments.length > 5 && (
            <div className="flex justify-center">
              <button
                onClick={() => setExpanded(!expanded)}
                style={{ backgroundColor: pallate.secondary, color: pallate.text }}
                className="px-4 py-2 rounded-full text-sm font-semibold"
              >
                {expanded ? "הסתר תגובות" : "הצג תגובות נוספות"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface ModalCommentInputProps {
  onAddComment: (content: string, replyTo?: { id: string; content: string; name: string }) => void
  currentUser: UserData
  pallate: Pallate
}
const ModalCommentInput: React.FC<ModalCommentInputProps> = ({
  onAddComment,
  currentUser,
  pallate,
}) => {
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<{ id: string; content: string; name: string } | null>(null)
  const commentInputRef = useRef<HTMLTextAreaElement>(null)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      onAddComment(newComment, replyingTo || undefined)
      setNewComment("")
      setReplyingTo(null)
    }
  }
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }
  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex items-start space-x-2 space-x-reverse">
        <Avatar
          icon={currentUser.icon}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm"
        />
        <div className="flex-grow relative">
          <div className="relative">
            <textarea
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={replyingTo ? "הגב לתגובה זו..." : "הוסף תגובה..."}
              className="w-full rounded-lg px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none min-h-[80px]"
              style={{ color: pallate.text, backgroundColor: pallate.secondary }}
            />
            <button
              type="submit"
              className="absolute bottom-2 left-2 text-white rounded-full p-2 hover:opacity-90 transition-colors duration-200"
              style={{ backgroundColor: pallate.primary }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

interface ModalCommentListProps {
  comments: Comment[]
  currentUser: UserData
  pallate: Pallate
}
const ModalCommentList: React.FC<ModalCommentListProps> = ({ comments, currentUser, pallate }) => {
  const [expanded, setExpanded] = useState(false)
  const visibleComments = expanded ? comments : comments.slice(0, 5)
  return (
    <div className="space-y-4">
      {comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-4">
          <MessageSquare size={32} className="text-gray-500" />
          <p className="mt-2 text-sm" style={{ color: pallate.text }}>
            איפה כל החברים? אין פה שום תגובות!
          </p>
        </div>
      ) : (
        <>
          {visibleComments.map((comment) => (
            <CommentItem
              key={comment.name + comment.timestamp.toString()}
              comment={comment}
              currentUser={currentUser}
              pallate={pallate}
            />
          ))}
          {comments.length > 5 && (
            <div className="flex justify-center">
              <button
                onClick={() => setExpanded(!expanded)}
                style={{ backgroundColor: pallate.secondary, color: pallate.text }}
                className="px-4 py-2 rounded-full text-sm font-semibold"
              >
                {expanded ? "הסתר תגובות" : "הצג תגובות נוספות"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}
const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">מחיקת פוסט</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>
        <p className="mb-6 text-gray-600">האם אתה בטוח שברצונך למחוק את הפוסט?</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            ביטול
          </button>
          <button className="flex items-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200" onClick={onConfirm}>
            <Trash2 className="w-4 h-4 ml-2" />
            אישור
          </button>
        </div>
      </div>
    </div>
  )
}

interface PostModalProps {
  post: Post
  onClose: () => void
  pallate: Pallate
  currentUser: UserData
  onAddComment: (content: string, replyTo?: { id: string; content: string; name: string }) => void
}
const PostModal: React.FC<PostModalProps> = ({ post, onClose, pallate, currentUser, onAddComment }) => {
  const [isLiked, setIsLiked] = useState(currentUser.likes.includes(post.id))
  const [likes, setLikes] = useState(post.likes)
  const [poster, setPoster] = useState<UserData | null>(null)
  
  useEffect(() => {
    setIsLiked(currentUser.likes.includes(post.id))
    setLikes(post.likes)
  }, [post, currentUser])

  // Fetch the post owner data so we can display their avatar and name.
  useEffect(() => {
    getUserById(post.owner).then((user) => setPoster(user))
  }, [post.owner])

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes((prevLikes) => (isLiked ? prevLikes - 1 : prevLikes + 1))
    likePost(post, currentUser, !isLiked)
  }
  const infoSection = (
    <div className="mb-4">
      {poster && (
        <div className="flex items-center mb-4">
          <Avatar icon={poster.icon} className="w-10 h-10 rounded-full mr-2" />
          <div>
            <p className="font-semibold" style={{ color: pallate.text }}>{poster.name}</p>
            <p className="text-xs" style={{ color: pallate.text }}>
              {post.timestamp.toDate().toLocaleString()}
            </p>
          </div>
        </div>
      )}
      {post.content && post.content.trim() !== "" && (
        <h2 className="text-lg font-medium" style={{ color: pallate.text }}>
          {post.content}
        </h2>
      )}
      <div className="flex items-center mt-2">
        <button onClick={handleLike} className="flex items-center transition-colors duration-200">
          <Heart className="w-6 h-6" fill={isLiked ? "currentColor" : "none"} style={{ color: isLiked ? "red" : pallate.text }} />
          <span className="mr-1" style={{ color: pallate.text }}>
            {likes}
          </span>
        </button>
      </div>
    </div>
  )
  const desktopModal = (
    <div
      className="hidden md:flex fixed inset-0 z-50 bg-black bg-opacity-75 items-center justify-center p-4"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white z-50">
        <X size={32} />
      </button>
      <div className="relative w-full max-w-5xl bg-white rounded-lg overflow-hidden flex flex-row" onClick={(e) => e.stopPropagation()}>
        <div className="flex-1 bg-black flex items-center justify-center">
          {post.file && post.file.type === fileType.image && (
            <img src={post.file.content} alt={post.content} className="w-full h-full object-contain" />
          )}
        </div>
        <div className="w-full md:w-[400px] p-4" dir="rtl" style={{ backgroundColor: pallate.background }}>
          {infoSection}
          <ModalCommentInput onAddComment={onAddComment} currentUser={currentUser} pallate={pallate} />
          <div className="custom-scrollbar overflow-y-auto" style={{ maxHeight: "calc(80vh - 300px)" }}>
            {/* Pass all comments and let the list handle slicing */}
            <ModalCommentList comments={post.comments} currentUser={currentUser} pallate={pallate} />
          </div>
        </div>
      </div>
    </div>
  )
  const mobileModal = (
    <div
      className="flex md:hidden fixed inset-0 z-50 bg-black"
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-4 right-4 text-white z-50">
        <X size={32} style={{ color: pallate.primary }}/>
      </button>
      <div className="flex flex-col h-screen bg-white" onClick={(e) => e.stopPropagation()}>
        <div className="w-full h-1/2 bg-black flex items-center justify-center">
          {post.file && post.file.type === fileType.image && (
            <img src={post.file.content} alt={post.content} className="w-full h-full object-contain" />
          )}
        </div>
        <div className="flex-none p-4" dir="rtl" style={{ backgroundColor: pallate.background }}>
          {infoSection}
          <ModalCommentInput onAddComment={onAddComment} currentUser={currentUser} pallate={pallate} />
        </div>
        <div className="flex-1 p-4 custom-scrollbar overflow-y-auto" dir="rtl" style={{ backgroundColor: pallate.background }}>
          <ModalCommentList comments={post.comments} currentUser={currentUser} pallate={pallate} />
        </div>
      </div>
    </div>
  )
  return ReactDOM.createPortal(
    <>
      {desktopModal}
      {mobileModal}
    </>,
    document.body
  )
}

interface ContentCardProps {
  item: Post
  userLiked: boolean
  handleComment: (content: string, post: Post, replyTo?: { id: string; content: string; name: string }) => void
  user: UserData
  deletePost: (post: string) => void
  pallate: Pallate
  onImageClick?: (post: Post) => void
}
const ContentCard: React.FC<ContentCardProps> = ({
  item,
  deletePost,
  user,
  userLiked,
  handleComment,
  pallate,
  onImageClick,
}) => {
  const [isLiked, setIsLiked] = useState(userLiked)
  const [likes, setLikes] = useState(item.likes)
  const [poster, setPoster] = useState<UserData | undefined>()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  useEffect(() => {
    getUserById(item.owner).then((user) => setPoster(user))
  }, [item.owner])
  if (!poster) return null
  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes((prevLikes) => (isLiked ? prevLikes - 1 : prevLikes + 1))
    likePost(item, user, !isLiked)
  }
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `פוסט מאת ${poster.name}`,
          text: item.content,
        })
        .then(() => console.log("Successfully shared"))
        .catch((error) => console.log("Error sharing:", error))
    } else {
      alert("שיתוף לא נתמך בדפדפן זה")
    }
  }
  const handleDeleteClick = () => setIsDeleteModalOpen(true)
  const handleDeleteConfirm = () => {
    deletePost(item.id)
    setIsDeleteModalOpen(false)
  }
  return (
    <div className="shadow-lg rounded-xl overflow-hidden transition-all duration-300" style={{ backgroundColor: pallate.main }}>
      <div className="p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <Avatar
            icon={poster.icon}
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold text-xl ml-3"
          />
          <div className="flex-grow">
            <p className="font-semibold text-base text-gray-800" style={{ color: pallate.text }}>
              {poster.name}
            </p>
            <p className="text-xs text-gray-500" style={{ color: pallate.text }}>
              {item.timestamp.toDate().toLocaleString()}
            </p>
          </div>
          <div className="relative">
            <button className="hover:bg-gray-100 rounded-full p-2 transition-colors duration-200" onClick={() => setIsExpanded(!isExpanded)}>
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>
            {isExpanded && (
              <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  {item.owner === user.id && (
                    <button onClick={handleDeleteClick} className="w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-700 flex items-center justify-center" role="menuitem">
                      <Trash2 className="w-4 h-4 ml-2" />
                      מחק פוסט
                    </button>
                  )}
                  <button onClick={handleShare} className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex items-center justify-center" role="menuitem">
                    <Share2 className="w-4 h-4 ml-2" />
                    שתף פוסט
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <p className="text-sm sm:text-base text-gray-700 mb-4" style={{ color: pallate.text }}>
          {item.content}
        </p>
        {item.file && item.file.type === fileType.image ? (
          <div onClick={() => onImageClick && onImageClick(item)} className="cursor-pointer">
            <FileDisplay file={item.file} className="rounded-xl w-full object-cover max-h-96 mb-4" />
          </div>
        ) : item.file ? (
          <FileDisplay file={item.file} className="rounded-xl w-full object-cover max-h-96 mb-4" />
        ) : null}
        <div className="flex justify-between items-center text-gray-600 mb-4">
          <button className="flex items-center hover:text-primary transition-colors duration-200" onClick={() => {}}>
            <MessageSquare className="w-5 h-5 ml-1" style={{ color: pallate.primary }} />
            <span className="text-sm" style={{ color: pallate.text }}>
              {item.comments.length} תגובות
            </span>
          </button>
          <button className={`flex items-center transition-colors duration-200 ${isLiked ? "text-red-500" : "hover:text-red-500"}`} onClick={handleLike}>
            <Heart className="w-5 h-5 ml-1" fill={isLiked ? "currentColor" : "none"} />
            <span className="text-sm" style={{ color: pallate.text }}>
              {likes}
            </span>
          </button>
        </div>
        <CommentSection
          comments={item.comments}
          onAddComment={(content, replyTo) => handleComment(content, item, replyTo)}
          currentUser={user}
          pallate={pallate}
        />
      </div>
      <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteConfirm} />
    </div>
  )
}

interface NewContentFeedProps {
  content: Post[]
  user: UserData
  handleComment: (content: string, post: Post, replyTo?: { id: string; content: string; name: string }) => void
  handleDelete: (post: string) => void
  pallate: Pallate
  handleBottom: () => void
  onImageClick: (post: Post) => void
}
function NewContentFeed({
  content,
  handleDelete,
  handleComment,
  user,
  pallate,
  handleBottom,
  onImageClick,
}: NewContentFeedProps) {
  if (content.length === 0) return <LoadingSpinner />
  return (
    <div
      className="space-y-6"
      ref={(node) => {
        if (node) node.onscrollend = () => handleBottom()
      }}
    >
      {content.map((item) => (
        <ContentCard
          handleComment={handleComment}
          user={user}
          userLiked={user.likes.includes(item.id)}
          deletePost={handleDelete}
          key={item.id}
          item={item}
          pallate={pallate}
          onImageClick={onImageClick}
        />
      ))}
    </div>
  )
}

/* --- NEW: MessageItem Component --- */
interface MessageItemProps {
  message: { user: string; chat: ChatWrapper }
  pallate: Pallate
  expandedMessage: string | null
  setExpandedMessage: React.Dispatch<React.SetStateAction<string | null>>
  navigate: (path: string) => void
}
const MessageItem: React.FC<MessageItemProps> = ({ message, pallate, expandedMessage, setExpandedMessage, navigate }) => {
  const [messageUser, setMessageUser] = useState<UserData | undefined>(undefined)
  useEffect(() => {
    getUserById(message.user).then((u) => setMessageUser(u))
  }, [message.user])
  if (!messageUser) return null
  return (
    <li
      className="bg-white rounded-lg shadow-sm p-2 transition-all duration-300 ease-in-out cursor-pointer hover:bg-gray-50"
      style={{ backgroundColor: pallate.background }}
      onClick={() => setExpandedMessage(message.chat.id === expandedMessage ? null : message.chat.id)}
    >
      <div className="flex items-center">
        <Avatar className="w-8 h-8 rounded-full ml-2" icon={messageUser.icon} />
        <div className="flex-grow">
          <p className="font-medium text-sm text-gray-800" style={{ color: pallate.text }}>
            {messageUser.name}
          </p>
          <p className="text-xs text-gray-600 truncate max-w-[150px]" style={{ color: pallate.text }}>
            {message.chat.lastMessage && message.chat.lastMessage.content}
          </p>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            expandedMessage === message.chat.id ? "transform rotate-180" : ""
          }`}
        />
      </div>
      {expandedMessage === message.chat.id && (
        <div className="mt-2 p-2 rounded-md">
          <p className="text-sm text-gray-700" style={{ color: pallate.text }}>
            {message.chat.lastMessage && message.chat.lastMessage.content}
          </p>
          <button
            className="text-sm bg-white text-black font-semibold hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center rounded-full px-4 py-2 w-full"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/messages/${message.chat.id}`)
            }}
            style={{ backgroundColor: pallate.main, color: pallate.text }}
          >
            <MessageSquare className="w-4 h-4 ml-2" style={{ color: pallate.primary }} />
            פתח שיחה
          </button>
        </div>
      )}
    </li>
  )
}

/* --- Updated TopPanel --- */
function TopPanel({
  friends,
  messages,
  user,
  pallate,
}: {
  friends: UserData[]
  messages: { user: string; chat: ChatWrapper }[]
  user: UserData
  pallate: Pallate
}) {
  const navigate = useNavigate()
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null)

  // Only render the panel if at least one section has data
  if (friends.length === 0 && messages.length === 0 && user.notifications.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {friends.length > 0 && (
        <div className="rounded-xl p-4 shadow-md" style={{ backgroundColor: pallate.main }}>
          <h3
            className="text-lg font-semibold text-gray-800 mb-4 flex items-center"
            style={{ color: pallate.text }}
          >
            <Users className="ml-2" style={{ color: pallate.primary }} size={20} />
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
                <span className="mt-1 text-xs text-gray-600 text-center" style={{ color: pallate.text }}>
                  {friend.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {messages.length > 0 && (
        <div className="rounded-xl p-4 shadow-md" style={{ backgroundColor: pallate.main }}>
          <h3
            className="text-lg font-semibold text-gray-800 mb-4 flex items-center"
            style={{ color: pallate.text }}
          >
            <MessageSquare className="ml-2" style={{ color: pallate.primary }} size={20} />
            הודעות חדשות
          </h3>
          <ul className="space-y-2">
            {messages.slice(0, 3).map((message) => (
              <MessageItem
                key={message.chat.id}
                message={message}
                pallate={pallate}
                expandedMessage={expandedMessage}
                setExpandedMessage={setExpandedMessage}
                navigate={navigate}
              />
            ))}
          </ul>
        </div>
      )}

      {user.notifications.length > 0 && (
        <div className="rounded-xl p-4 shadow-md" style={{ backgroundColor: pallate.main }}>
          <h3
            className="text-lg font-semibold text-gray-800 mb-4 flex items-center"
            style={{ color: pallate.text }}
          >
            <Bell className="ml-2" style={{ color: pallate.primary }} size={20} />
            התראות
          </h3>
          <ul className="space-y-2">
            {user.notifications.slice(0, 3).map((notification, i) => (
              <li
                key={notification.timestamp.toDate().getTime() + i}
                className="flex items-center bg-white rounded-lg p-2 shadow-sm hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                style={{ backgroundColor: pallate.background }}
              >
                <Avatar icon={notification.icon} className="w-8 h-8 rounded-full ml-2" />
                <div className="flex-grow">
                  <p className="text-xs text-gray-700" style={{ color: pallate.text }}>
                    {notification.content}
                  </p>
                  <span className="text-xs text-gray-500" style={{ color: pallate.text }}>
                    {notification.timestamp.toDate().toLocaleString()}
                  </span>
                </div>
                <div className="ml-2">
                  {notification.type === "like" && <Heart className="text-red-500" size={16} />}
                  {notification.type === "comment" && <MessageSquare className="text-blue-500" size={16} />}
                  {notification.type === "message" && <User className="text-primary" size={16} />}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

const CreatePost = ({
  onPostSubmit,
  pallate,
  user
}: {
  pallate: Pallate
  onPostSubmit: (newPost: { content: string; file: UploadedFile | undefined }) => void
  user: UserData
}) => {
  const [content, setContent] = useState("")
  const [file, setFile] = useState<UploadedFile | undefined>()
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (content.trim() === "" && !file) return
    onPostSubmit({ content, file })
    setContent("")
    setFile(undefined)
  }
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: fileType) => {
    const file = e.target.files?.[0]
    if (file) {
      const fileName = file.name
      const reader = new FileReader()
      reader.onloadend = async () => {
        const fileContent = reader.result as string
        setFile({ type, content: await uploadString(fileContent), name: fileName } as UploadedFile)
      }
      reader.readAsDataURL(file)
    }
  }
  return (
    <div className="shadow-lg rounded-xl p-4 sm:p-6 mb-6" style={{ backgroundColor: pallate.main }}>
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3 space-x-reverse">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center text-white shadow-md">
            <Avatar icon={user.icon} className="w-full h-full" />
          </div>
          <div className="flex-grow relative">
            <textarea
              className="w-full rounded-xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none transition-all duration-200 ease-in-out min-h-[100px]"
              placeholder="מה בראש שלך?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ color: pallate.text, backgroundColor: pallate.background }}
            ></textarea>
            <div className="absolute bottom-3 right-3 flex space-x-2 space-x-reverse">
              <label className="cursor-pointer text-gray-500 hover:text-primary transition-colors duration-200 bg-gray-100 rounded-full p-2">
                <input type="file" className="hidden" onChange={(file) => handleImageUpload(file, fileType.image)} />
                <ImageIcon size={20} />
              </label>
              <label className="cursor-pointer text-gray-500 hover:text-primary transition-colors duration-200 bg-gray-100 rounded-full p-2">
                <input type="file" accept="video/*" className="hidden" onChange={(file) => handleImageUpload(file, fileType.video)} />
                <Video size={20} />
              </label>
              <button type="button" className="text-gray-500 hover:text-primary transition-colors duration-200 bg-gray-100 rounded-full p-2">
                <Smile size={20} />
              </button>
            </div>
          </div>
        </div>
        {file?.type == fileType.image && (
          <div className="relative mt-4">
            <img
              src={file.content || "/placeholder.svg"}
              alt="Preview"
              className="rounded-xl max-h-48 sm:max-h-64 w-full object-cover"
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
              onClick={() => setFile(undefined)}
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="text-white font-bold px-6 py-2 rounded-full hover:opacity-90 transition-opacity duration-200 text-sm flex items-center shadow-md"
            style={{ backgroundColor: pallate.primary }}
          >
            <Send className="w-4 h-4 ml-2" />
            פרסם
          </button>
        </div>
      </form>
    </div>
  )
}

function App() {
  const [user, setUser] = useState<UserData | null>(null)
  const [friends, setFriends] = useState<UserData[]>([])
  const [pallate, setPallate] = useState<Pallate>(DefaultPallate())
  const [messages, setMessages] = useState<{ chat: ChatWrapper; user: string }[]>([])
  const [posts, setPosts] = useState<Post[] | undefined>()
  const postsLimit = 10
  const navigate = useNavigate()
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUser()
      if (!userData) {
        navigate("/")
        return
      }
      setUser(userData)
      const friendsData = await getUsersById(userData.friends)
      setFriends(friendsData)
      const postsData = await getPosts(0, postsLimit)
      const { chats, friends } = await getChats(userData)
      setMessages(chats.map((message, i) => ({ chat: message, user: friends[i] })))
      setPosts(postsData)
      const pallateData = await GetPallate(userData)
      setPallate(pallateData)
      return postsListener(setPosts, postsLimit)
    }
    fetchData()
    const unsubscribe = userListener(async (user) => {
      setUser(user)
      const friendsData = await getUsersById(user.friends)
      setFriends(friendsData)
    })
    return unsubscribe
  }, [navigate])
  const handleDelete = (id: string) => {
    if (!user) return
    deletePost(id)
    setPosts(posts?.filter((post) => post.id !== id))
  }
  const handlePostSubmit = (newPost: { content: string; file: UploadedFile | undefined }) => {
    if (!user) return
    const post: Post = {
      id: user.id + Date.now(),
      timestamp: Timestamp.fromDate(new Date()),
      content: newPost.content,
      file: newPost.file,
      likes: 0,
      comments: [],
      owner: user.id,
    }
    postStuff(post)
    setPosts([...(posts || []), post])
  }
  const handleComment = (
    message: string,
    post: Post,
    replyTo?: { id: string; content: string; name: string }
  ) => {
    if (!user) return
    const newComment: Comment = {
      message,
      name: user.name,
      icon: user.icon,
      timestamp: Timestamp.now(),
    }
    const updatedPosts = posts?.map((p) => {
      if (p.id === post.id) return { ...p, comments: [...p.comments, newComment] }
      return p
    })
    setPosts(updatedPosts)
    if (updatedPosts) {
      const updatedPost = updatedPosts.find((p) => p.id === post.id)
      if (updatedPost) {
        updatePost(updatedPost)
        // If the post is open in the modal, update its state
        if (selectedPost && selectedPost.id === post.id) {
          setSelectedPost(updatedPost)
        }
      }
    }
  }
  const openModalForPost = (post: Post) => setSelectedPost(post)
  if (!user || !posts || !pallate) return <SuperSillyLoading />
  return (
    <Layout>
      <div className="min-h-screen " style={{ backgroundColor: pallate.background }}>
        <div className="max-w-3xl mx-auto px-4 py-8 ">
          <TopPanel pallate={pallate} user={user} friends={friends} messages={messages} />
          <div className="mb-8">
            <CreatePost pallate={pallate} onPostSubmit={handlePostSubmit} user={user} />
            <NewContentFeed
              pallate={pallate}
              handleComment={handleComment}
              handleBottom={() => getPosts(posts.length, posts.length + postsLimit)}
              user={user}
              handleDelete={handleDelete}
              content={posts.sort((a, b) => b.timestamp.toDate().getTime() - a.timestamp.toDate().getTime())}
              onImageClick={openModalForPost}
            />
          </div>
        </div>
      </div>
      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          pallate={pallate}
          currentUser={user}
          onAddComment={(content, replyTo) => {
            handleComment(content, selectedPost, replyTo)
          }}
        />
      )}
    </Layout>
  )
}

export default App
