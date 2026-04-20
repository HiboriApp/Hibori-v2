import React, { useEffect, useMemo, useState } from "react"
import ReactDOM from "react-dom"
import { Bell, ChevronDown, ChevronLeft, Heart, ImageIcon, Loader2, MessageSquare, MoreVertical, Send, Share2, Trash2, User, Users, Video, X } from "lucide-react"
import { Timestamp } from "firebase/firestore"
import { useNavigate } from "react-router-dom"
import { Layout } from "../components/layout"
import SuperSillyLoading from "../components/Loading"
import { Avatar } from "../api/icons"
import {
  deletePost,
  FileDisplay,
  fileType,
  getChats,
  getPosts,
  getUser,
  getUserById,
  getUsersById,
  likePost,
  postStuff,
  type ChatWrapper,
  type Comment,
  type Post,
  type UploadedFile,
  type UserData,
  updatePost,
} from "../api/db"
import { postsListener, userListener } from "../api/listeners"
import { DefaultPallate, GetPallate, type Pallate } from "../api/settings"
import { uploadString } from "../api/cloudinary"

function formatDate(timestamp: Timestamp) {
  return new Intl.DateTimeFormat("he-IL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp.toDate())
}

function formatRelativeTime(timestamp: Timestamp) {
  const now = Date.now()
  const time = timestamp.toDate().getTime()
  const diffInMinutes = Math.round((time - now) / 60000)
  const rtf = new Intl.RelativeTimeFormat("he", { numeric: "auto" })

  if (Math.abs(diffInMinutes) < 60) {
    return rtf.format(diffInMinutes, "minute")
  }

  const diffInHours = Math.round(diffInMinutes / 60)
  if (Math.abs(diffInHours) < 24) {
    return rtf.format(diffInHours, "hour")
  }

  const diffInDays = Math.round(diffInHours / 24)
  return rtf.format(diffInDays, "day")
}

function getPreviewComments(comments: Comment[]) {
  return comments.slice(Math.max(0, comments.length - 2)).reverse()
}

function getTypedDirection(value: string): "rtl" | "ltr" {
  for (const character of value.trim()) {
    if (/[\u0590-\u05FF\u0600-\u06FF]/.test(character)) {
      return "rtl"
    }

    if (/[A-Za-z\u00C0-\u024F\u0400-\u04FF]/.test(character)) {
      return "ltr"
    }
  }

  return "ltr"
}

interface CommentItemProps {
  comment: Comment
  pallate: Pallate
  compact?: boolean
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, pallate, compact = false }) => {
  return (
    <article
      className={`rounded-2xl border px-4 py-3 ${compact ? "" : "shadow-sm"}`}
      style={{
        backgroundColor: pallate.background,
        borderColor: `${pallate.primary}22`,
      }}
    >
      <div className="flex items-start gap-3">
        <Avatar icon={comment.icon} userID={comment.name} className="h-10 w-10 rounded-2xl" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold" style={{ color: pallate.text }}>
              {comment.name}
            </p>
            <span className="text-xs opacity-60" style={{ color: pallate.text }}>
              {formatRelativeTime(comment.timestamp)}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6" style={{ color: pallate.text }}>
            {comment.message}
          </p>
        </div>
      </div>
    </article>
  )
}

interface CommentComposerProps {
  currentUser: UserData
  pallate: Pallate
  onSubmit: (content: string) => void
  placeholder?: string
  compact?: boolean
}

const CommentComposer: React.FC<CommentComposerProps> = ({
  currentUser,
  pallate,
  onSubmit,
  placeholder = "הוסף תגובה חכמה וברורה...",
  compact = false,
}) => {
  const [newComment, setNewComment] = useState("")

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const trimmedComment = newComment.trim()
    if (!trimmedComment) return

    onSubmit(trimmedComment)
    setNewComment("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex items-start gap-3">
        <Avatar icon={currentUser.icon} userID={currentUser.id} className="h-10 w-10 rounded-2xl" />
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                handleSubmit(event)
              }
            }}
            placeholder={placeholder}
            className={`w-full resize-none rounded-2xl border px-4 py-3 text-sm leading-6 outline-none transition ${
              compact ? "min-h-[84px]" : "min-h-[100px]"
            }`}
            style={{
              color: pallate.text,
              backgroundColor: pallate.secondary,
              borderColor: `${pallate.primary}25`,
            }}
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs opacity-70" style={{ color: pallate.text }}>
          Enter לשליחה, Shift + Enter לשורה חדשה
        </p>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: pallate.primary }}
        >
          <Send className="h-4 w-4" />
          שלח תגובה
        </button>
      </div>
    </form>
  )
}

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  pallate: Pallate
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, pallate }) => {
  if (!isOpen) return null

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-[28px] border p-6 shadow-2xl"
        style={{ backgroundColor: pallate.main, borderColor: `${pallate.primary}20`, color: pallate.text }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">מחיקת פוסט</h2>
            <p className="mt-2 text-sm opacity-75">הפעולה תמחק את הפוסט מהפיד ומהמסך המורחב.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 transition hover:bg-black/5"
            aria-label="סגור"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm font-medium opacity-80 transition hover:opacity-100">
            ביטול
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-2 rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            <Trash2 className="h-4 w-4" />
            מחק פוסט
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

interface PostModalProps {
  post: Post
  onClose: () => void
  pallate: Pallate
  currentUser: UserData
  onAddComment: (content: string) => void
}

const PostModal: React.FC<PostModalProps> = ({ post, onClose, pallate, currentUser, onAddComment }) => {
  const [isLiked, setIsLiked] = useState(currentUser.likes.includes(post.id))
  const [likes, setLikes] = useState(post.likes)
  const [poster, setPoster] = useState<UserData | null>(null)

  useEffect(() => {
    setIsLiked(currentUser.likes.includes(post.id))
    setLikes(post.likes)
  }, [currentUser, post])

  useEffect(() => {
    getUserById(post.owner).then((user) => setPoster(user ?? null))
  }, [post.owner])

  const handleLike = () => {
    setIsLiked((previous) => !previous)
    setLikes((previous) => previous + (isLiked ? -1 : 1))
    likePost(post, currentUser, !isLiked)
  }

  if (!poster) return null

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="flex h-full w-full items-center justify-center p-0 md:p-6">
        <div
          className="home-modal-shell flex h-full w-full flex-col overflow-hidden md:h-[88vh] md:max-w-6xl md:flex-row md:rounded-[32px]"
          style={{ backgroundColor: pallate.main, color: pallate.text }}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="relative flex min-h-[36vh] flex-1 items-center justify-center overflow-hidden bg-black md:min-h-full">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/45 p-2 text-white transition hover:bg-black/60"
              aria-label="סגור"
            >
              <X className="h-5 w-5" />
            </button>
            {post.file ? (
              <FileDisplay file={post.file} className="max-h-full w-full object-contain" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black p-8 text-center text-white">
                <div className="max-w-xl space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                    <MessageSquare className="h-8 w-8" />
                  </div>
                  <p className="text-2xl font-semibold leading-relaxed">{post.content || "פוסט טקסטואלי"}</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex w-full flex-col md:w-[430px]" dir="rtl">
            <div className="border-b px-5 py-5" style={{ borderColor: `${pallate.primary}20` }}>
              <div className="flex items-start gap-3">
                <Avatar icon={poster.icon} userID={poster.id} className="h-12 w-12 rounded-2xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{poster.name}</p>
                      <p className="text-xs opacity-65">{formatDate(post.timestamp)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleLike}
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-medium transition hover:bg-black/5"
                      style={{ borderColor: `${pallate.primary}25` }}
                    >
                      <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} style={{ color: isLiked ? "#ef4444" : pallate.text }} />
                      {likes}
                    </button>
                  </div>
                  {post.content && <p className="mt-3 whitespace-pre-wrap text-sm leading-7 opacity-90">{post.content}</p>}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar">
              <div className="mb-5 rounded-[24px] border p-4" style={{ backgroundColor: pallate.background, borderColor: `${pallate.primary}18` }}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">תגובות</p>
                    <p className="mt-1 text-xs opacity-65">{post.comments.length} תגובות בשיחה הזו</p>
                  </div>
                  <MessageSquare className="h-5 w-5" style={{ color: pallate.primary }} />
                </div>
              </div>

              <div className="space-y-3">
                {post.comments.length === 0 ? (
                  <div className="rounded-[24px] border border-dashed px-5 py-8 text-center" style={{ borderColor: `${pallate.primary}30` }}>
                    <MessageSquare className="mx-auto h-8 w-8" style={{ color: pallate.primary }} />
                    <p className="mt-3 text-sm opacity-80">אין עדיין תגובות. אפשר להתחיל את השיחה מכאן.</p>
                  </div>
                ) : (
                  post.comments
                    .slice()
                    .sort((first, second) => second.timestamp.toDate().getTime() - first.timestamp.toDate().getTime())
                    .map((comment) => (
                      <CommentItem key={comment.name + comment.timestamp.toMillis()} comment={comment} pallate={pallate} />
                    ))
                )}
              </div>
            </div>

            <div className="border-t px-5 py-4" style={{ borderColor: `${pallate.primary}20`, backgroundColor: pallate.main }}>
              <CommentComposer currentUser={currentUser} pallate={pallate} onSubmit={onAddComment} compact />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

interface ContentCardProps {
  item: Post
  user: UserData
  userLiked: boolean
  pallate: Pallate
  deletePostById: (postId: string) => void
  handleComment: (content: string, post: Post) => void
  onOpenComments: (post: Post) => void
}

const ContentCard: React.FC<ContentCardProps> = ({
  item,
  user,
  userLiked,
  pallate,
  deletePostById,
  handleComment,
  onOpenComments,
}) => {
  const [isLiked, setIsLiked] = useState(userLiked)
  const [likes, setLikes] = useState(item.likes)
  const [poster, setPoster] = useState<UserData | undefined>()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useEffect(() => {
    setIsLiked(userLiked)
    setLikes(item.likes)
  }, [item.likes, userLiked])

  useEffect(() => {
    getUserById(item.owner).then((fetchedUser) => setPoster(fetchedUser))
  }, [item.owner])

  const handleLike = () => {
    setIsLiked((previous) => !previous)
    setLikes((previous) => previous + (isLiked ? -1 : 1))
    likePost(item, user, !isLiked)
  }

  const handleShare = async () => {
    const sharePayload = {
      title: `פוסט מאת ${poster?.name ?? "חבר"}`,
      text: item.content,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(sharePayload)
      } catch {
        return
      }
      return
    }

    await navigator.clipboard.writeText(`${sharePayload.title}\n${sharePayload.text}\n${sharePayload.url}`)
  }

  if (!poster) return null

  const previewComments = getPreviewComments(item.comments)
  const hasVisualContent = item.file && item.file.type !== fileType.document

  return (
    <article
      className="home-feed-card overflow-hidden rounded-[30px] border shadow-[0_24px_60px_rgba(15,23,42,0.08)]"
      style={{ backgroundColor: pallate.main, borderColor: `${pallate.primary}16`, color: pallate.text }}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <Avatar icon={poster.icon} userID={poster.id} className="h-12 w-12 rounded-2xl" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-base font-semibold">{poster.name}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs opacity-65">
                  <span>{formatRelativeTime(item.timestamp)}</span>
                  <span className="inline-block h-1 w-1 rounded-full" style={{ backgroundColor: pallate.primary }} />
                  <span>{formatDate(item.timestamp)}</span>
                </div>
              </div>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen((previous) => !previous)}
                  className="rounded-full border p-2 transition hover:bg-black/5"
                  style={{ borderColor: `${pallate.primary}18` }}
                  aria-label="אפשרויות פוסט"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {isMenuOpen && (
                  <div
                    className="absolute left-0 top-12 z-10 w-48 rounded-2xl border p-2 shadow-xl"
                    style={{ backgroundColor: pallate.background, borderColor: `${pallate.primary}18` }}
                  >
                    <button
                      type="button"
                      onClick={handleShare}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm transition hover:bg-black/5"
                    >
                      שתף פוסט
                      <Share2 className="h-4 w-4" />
                    </button>
                    {item.owner === user.id && (
                      <button
                        type="button"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm text-red-600 transition hover:bg-red-50"
                      >
                        מחק פוסט
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {item.content && (
              <p className="mt-4 whitespace-pre-wrap text-[15px] leading-8 opacity-90">{item.content}</p>
            )}
          </div>
        </div>

        {item.file && (
          <div className="mt-5 overflow-hidden rounded-[26px] border" style={{ borderColor: `${pallate.primary}16` }}>
            {hasVisualContent ? (
              <button type="button" onClick={() => onOpenComments(item)} className="block w-full text-right">
                <FileDisplay file={item.file} className="max-h-[520px] w-full object-cover" />
              </button>
            ) : (
              <div className="p-4">
                <FileDisplay file={item.file} className="text-sm font-medium underline" />
              </div>
            )}
          </div>
        )}

        <div className="mt-5 grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={handleLike}
            className="flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium transition hover:-translate-y-0.5"
            style={{ backgroundColor: pallate.background, borderColor: `${pallate.primary}18` }}
          >
            <Heart className="h-4 w-4" fill={isLiked ? "currentColor" : "none"} style={{ color: isLiked ? "#ef4444" : pallate.text }} />
            {likes}
          </button>
          <button
            type="button"
            onClick={() => onOpenComments(item)}
            className="flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium transition hover:-translate-y-0.5"
            style={{ backgroundColor: pallate.background, borderColor: `${pallate.primary}18` }}
          >
            <MessageSquare className="h-4 w-4" style={{ color: pallate.primary }} />
            {item.comments.length} תגובות
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium transition hover:-translate-y-0.5"
            style={{ backgroundColor: pallate.background, borderColor: `${pallate.primary}18` }}
          >
            <Share2 className="h-4 w-4" />
            שתף
          </button>
        </div>

        <div className="mt-5 rounded-[28px] border p-4" style={{ backgroundColor: pallate.background, borderColor: `${pallate.primary}18` }}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">שיחה סביב הפוסט</p>
              <p className="mt-1 text-xs opacity-70">
                {item.comments.length > 0 ? "תצוגה מקדימה של התגובות האחרונות" : "עוד אין תגובות, אפשר לפתוח את השיחה"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenComments(item)}
              className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold transition hover:bg-black/5"
              style={{ color: pallate.primary }}
            >
              פתח תגובות
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          {previewComments.length > 0 ? (
            <div className="mt-4 space-y-3">
              {previewComments.map((comment) => (
                <CommentItem key={comment.name + comment.timestamp.toMillis()} comment={comment} pallate={pallate} compact />
              ))}
            </div>
          ) : null}

          <div className="mt-4 border-t pt-4" style={{ borderColor: `${pallate.primary}14` }}>
            <CommentComposer
              currentUser={user}
              pallate={pallate}
              onSubmit={(content) => handleComment(content, item)}
              compact
              placeholder="כתוב תגובה קצרה או פתח את כל הדיון"
            />
          </div>
        </div>
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          deletePostById(item.id)
          setIsDeleteModalOpen(false)
        }}
        pallate={pallate}
      />
    </article>
  )
}

interface NewContentFeedProps {
  content: Post[]
  user: UserData
  pallate: Pallate
  handleComment: (content: string, post: Post) => void
  handleDelete: (postId: string) => void
  onOpenComments: (post: Post) => void
}

function NewContentFeed({ content, user, pallate, handleComment, handleDelete, onOpenComments }: NewContentFeedProps) {
  if (content.length === 0) {
    return (
      <div
        className="rounded-[32px] border border-dashed px-6 py-16 text-center"
        style={{ backgroundColor: pallate.main, borderColor: `${pallate.primary}25`, color: pallate.text }}
      >
        <MessageSquare className="mx-auto h-10 w-10" style={{ color: pallate.primary }} />
        <h3 className="mt-4 text-xl font-semibold">אין פוסטים עדיין</h3>
        <p className="mt-2 text-sm opacity-75">פרסם פוסט ראשון כדי להתחיל.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {content.map((item) => (
        <ContentCard
          key={item.id}
          item={item}
          user={user}
          userLiked={user.likes.includes(item.id)}
          pallate={pallate}
          deletePostById={handleDelete}
          handleComment={handleComment}
          onOpenComments={onOpenComments}
        />
      ))}
    </div>
  )
}

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
    getUserById(message.user).then((fetchedUser) => setMessageUser(fetchedUser))
  }, [message.user])

  if (!messageUser) return null

  return (
    <li
      className="rounded-[22px] border p-3 transition hover:-translate-y-0.5"
      style={{ backgroundColor: pallate.background, borderColor: `${pallate.primary}18` }}
      onClick={() => setExpandedMessage(message.chat.id === expandedMessage ? null : message.chat.id)}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 rounded-2xl" icon={messageUser.icon} userID={messageUser.id} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold" style={{ color: pallate.text }}>
            {messageUser.name}
          </p>
          <p className="truncate text-xs opacity-70" style={{ color: pallate.text }}>
            {message.chat.lastMessage?.content ?? "אין הודעה אחרונה"}
          </p>
        </div>
        <ChevronDown className={`h-4 w-4 transition ${expandedMessage === message.chat.id ? "rotate-180" : ""}`} />
      </div>
      {expandedMessage === message.chat.id && (
        <div className="mt-3 rounded-2xl p-3" style={{ backgroundColor: pallate.main }}>
          <p className="text-sm leading-6" style={{ color: pallate.text }}>
            {message.chat.lastMessage?.content}
          </p>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: pallate.primary, color: "white" }}
            onClick={(event) => {
              event.stopPropagation()
              navigate(`/messages/${message.chat.id}`)
            }}
          >
            <MessageSquare className="h-4 w-4" />
            פתח שיחה
          </button>
        </div>
      )}
    </li>
  )
}

function TopPanel({
  friends,
  messages,
  user,
  pallate,
  totalPosts,
}: {
  friends: UserData[]
  messages: { user: string; chat: ChatWrapper }[]
  user: UserData
  pallate: Pallate
  totalPosts: number
}) {
  const navigate = useNavigate()
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null)

  return (
    <div className="grid gap-4 xl:grid-cols-1">
      {/* App Info Card */}
      <section className="rounded-[28px] border p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]" style={{ backgroundColor: pallate.main, borderColor: `${pallate.primary}16`, color: pallate.text }}>
        <div className="space-y-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold text-white" style={{ backgroundColor: pallate.primary }}>
              <span className="h-2 w-2 rounded-full animate-pulse" style={{ backgroundColor: "white" }} />
              Alpha
            </div>
            <h3 className="mt-3 text-lg font-semibold">Hibori</h3>
            <p className="text-xs opacity-70 mt-1">v2.3</p>
          </div>
          <p className="text-sm opacity-80 leading-6">הפלטפורמה החדשה שלך לחיבור וחלוקת רעיונות</p>
        </div>
      </section>

      {/* Friend Finder Ad */}
      <section className="rounded-[28px] border p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] bg-gradient-to-br" style={{ backgroundColor: pallate.main, borderColor: `${pallate.primary}16`, color: pallate.text, backgroundImage: `linear-gradient(135deg, ${pallate.primary}15, ${pallate.secondary}10)` }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5" style={{ color: pallate.primary }} />
              <p className="font-semibold text-sm">מצא חברים חדשים</p>
            </div>
            <p className="text-xs opacity-75 leading-5">התחבר עם עוד אנשים עם אותם עניינים כמוך</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/addfriends")}
          className="mt-4 w-full rounded-full px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: pallate.primary }}
        >
          גלה חברים
        </button>
      </section>

      {/* Feed Stats */}
      <section className="rounded-[28px] border p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]" style={{ backgroundColor: pallate.main, borderColor: `${pallate.primary}16`, color: pallate.text }}>
        <p className="text-sm font-semibold mb-4">סטטיסטיקות הפיד</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-75">פוסטים בפיד</span>
            <span className="text-sm font-semibold">{totalPosts.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-75">חברים שלך</span>
            <span className="text-sm font-semibold">{user.friends.length.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs opacity-75">הודעות פעילות</span>
            <span className="text-sm font-semibold">{messages.length.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* Online Friends */}
      {friends.length > 0 && (
        <section className="rounded-[28px] border p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]" style={{ backgroundColor: pallate.main, borderColor: `${pallate.primary}16`, color: pallate.text }}>
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Users className="h-5 w-5" style={{ color: pallate.primary }} />
            חברים מחוברים
          </div>
          <div className="flex flex-wrap gap-3">
            {friends.slice(0, 8).map((friend) => (
              <button
                key={friend.id}
                type="button"
                onClick={() => navigate(`/user/${friend.id}`)}
                className="flex min-w-[92px] flex-col items-center rounded-[22px] border px-3 py-3 transition hover:-translate-y-0.5"
                style={{ backgroundColor: pallate.background, borderColor: `${pallate.primary}16` }}
              >
                <Avatar
                  icon={friend.icon}
                  userID={friend.id}
                  isOnline={friend.lastOnline.toDate() > new Date()}
                  className="h-11 w-11 rounded-2xl"
                />
                <span className="mt-2 max-w-[84px] truncate text-xs font-medium">{friend.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recent Messages */}
      {messages.length > 0 && (
        <section className="rounded-[28px] border p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]" style={{ backgroundColor: pallate.main, borderColor: `${pallate.primary}16`, color: pallate.text }}>
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <MessageSquare className="h-5 w-5" style={{ color: pallate.primary }} />
            הודעות אחרונות
          </div>
          <ul className="space-y-3">
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
        </section>
      )}

      {/* Notifications */}
      {user.notifications.length > 0 && (
        <section className="rounded-[28px] border p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)]" style={{ backgroundColor: pallate.main, borderColor: `${pallate.primary}16`, color: pallate.text }}>
          <div className="mb-4 flex items-center gap-2 text-lg font-semibold">
            <Bell className="h-5 w-5" style={{ color: pallate.primary }} />
            התראות חמות
          </div>
          <ul className="space-y-3">
            {user.notifications.slice(0, 3).map((notification, index) => (
              <li
                key={notification.timestamp.toMillis() + index}
                className="rounded-[22px] border p-3"
                style={{ backgroundColor: pallate.background, borderColor: `${pallate.primary}16` }}
              >
                <div className="flex items-start gap-3">
                  <Avatar userID={notification.senderId} icon={notification.icon} className="h-10 w-10 rounded-2xl" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-6">{notification.content}</p>
                    <p className="mt-1 text-xs opacity-60">{formatRelativeTime(notification.timestamp)}</p>
                  </div>
                  {notification.type === "like" && <Heart className="h-4 w-4 text-red-500" />}
                  {notification.type === "comment" && <MessageSquare className="h-4 w-4 text-sky-500" />}
                  {notification.type === "message" && <User className="h-4 w-4" style={{ color: pallate.primary }} />}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

const CreatePost = ({
  onPostSubmit,
  pallate,
  user,
}: {
  pallate: Pallate
  onPostSubmit: (newPost: { content: string; file: UploadedFile | undefined }) => void
  user: UserData
}) => {
  const [content, setContent] = useState("")
  const [file, setFile] = useState<UploadedFile | undefined>()
  const [isUploading, setIsUploading] = useState(false)
  const contentDirection = getTypedDirection(content)
  const composerDirection = content.trim() ? contentDirection : "rtl"

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (content.trim() === "" && !file) return

    onPostSubmit({ content: content.trim(), file })
    setContent("")
    setFile(undefined)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: fileType) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) return

    const fileName = selectedFile.name
    const reader = new FileReader()
    setIsUploading(true)
    reader.onloadend = async () => {
      const fileContent = reader.result as string
      const uploadedContent = await uploadString(fileContent)
      setFile({ type, content: uploadedContent, name: fileName })
      setIsUploading(false)
    }
    reader.readAsDataURL(selectedFile)
  }

  return (
    <section
      className="home-composer-card rounded-[32px] border p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-6"
      style={{ backgroundColor: pallate.main, borderColor: `${pallate.primary}16`, color: pallate.text }}
    >
      <div className="mb-4 flex items-center gap-3">
        <Avatar userID={user.id} icon={user.icon} className="h-11 w-11 rounded-2xl" />
        <div>
          <p className="text-sm font-semibold">{user.name}</p>
          <p className="text-xs opacity-70">מה חדש?</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          dir={composerDirection}
          className="w-full resize-none rounded-[28px] border px-5 py-4 text-[15px] leading-8 outline-none transition"
          placeholder="על מה בא לך לשתף היום?"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          style={{
            backgroundColor: pallate.background,
            borderColor: `${pallate.primary}18`,
            color: pallate.text,
            textAlign: composerDirection === "rtl" ? "right" : "left",
          }}
        />

        {file && (
          <div className="relative overflow-hidden rounded-[26px] border" style={{ borderColor: `${pallate.primary}16` }}>
            {file.type === fileType.image || file.type === fileType.video ? (
              <FileDisplay file={file} className="max-h-[320px] w-full object-cover" />
            ) : (
              <div className="p-4 text-sm font-medium underline">{file.name}</div>
            )}
            <button
              type="button"
              onClick={() => setFile(undefined)}
              className="absolute right-3 top-3 rounded-full bg-black/70 p-2 text-white transition hover:bg-black/85"
              aria-label="הסר קובץ"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <label
              className="inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5"
              style={{ backgroundColor: `${pallate.primary}14`, color: pallate.text }}
            >
              <input type="file" className="hidden" onChange={(event) => handleImageUpload(event, fileType.image)} />
              <ImageIcon className="h-4 w-4" style={{ color: pallate.primary }} />
              תמונה
            </label>
            <label
              className="inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition hover:-translate-y-0.5"
              style={{ backgroundColor: `${pallate.primary}14`, color: pallate.text }}
            >
              <input type="file" accept="video/*" className="hidden" onChange={(event) => handleImageUpload(event, fileType.video)} />
              <Video className="h-4 w-4" style={{ color: pallate.primary }} />
              וידאו
            </label>
            {isUploading && (
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium" style={{ backgroundColor: pallate.background }}>
                <Loader2 className="h-4 w-4 animate-spin" />
                מעלה קובץ...
              </div>
            )}
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            style={{ backgroundColor: pallate.primary }}
          >
            <Send className="h-4 w-4" />
            פרסם
          </button>
        </div>
      </form>
    </section>
  )
}

function App() {
  const [user, setUser] = useState<UserData | null>(null)
  const [friends, setFriends] = useState<UserData[]>([])
  const [pallate, setPallate] = useState<Pallate>(DefaultPallate())
  const [messages, setMessages] = useState<{ chat: ChatWrapper; user: string }[]>([])
  const [posts, setPosts] = useState<Post[] | undefined>()
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const postsLimit = 10
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      const userData = await getUser()
      if (!userData) {
        navigate("/")
        return
      }

      setUser(userData)
      setPallate(GetPallate(userData))

      const [friendsData, postsData, chatData] = await Promise.all([
        getUsersById(userData.friends),
        getPosts(0, postsLimit),
        getChats(userData),
      ])

      setFriends(friendsData)
      setPosts(postsData ?? [])
      setMessages(chatData.chats.map((message, index) => ({ chat: message, user: chatData.friends[index] })))

      return postsListener(setPosts, postsLimit)
    }

    let postsCleanup: undefined | (() => void)
    fetchData().then((cleanup) => {
      postsCleanup = cleanup
    })

    const unsubscribeUser = userListener(async (nextUser) => {
      setUser(nextUser)
      setPallate(GetPallate(nextUser))
      const friendsData = await getUsersById(nextUser.friends)
      setFriends(friendsData)
    })

    return () => {
      unsubscribeUser?.()
      postsCleanup?.()
    }
  }, [navigate])

  useEffect(() => {
    if (!selectedPost || !posts) return
    const refreshedPost = posts.find((post) => post.id === selectedPost.id)
    if (refreshedPost) {
      setSelectedPost(refreshedPost)
    }
  }, [posts, selectedPost])

  const sortedPosts = useMemo(() => {
    if (!posts) return []
    return [...posts].sort((first, second) => second.timestamp.toDate().getTime() - first.timestamp.toDate().getTime())
  }, [posts])

  const handleDelete = (id: string) => {
    deletePost(id)
    setPosts((currentPosts) => currentPosts?.filter((post) => post.id !== id) ?? [])
    setSelectedPost((currentPost) => (currentPost?.id === id ? null : currentPost))
  }

  const handlePostSubmit = (newPost: { content: string; file: UploadedFile | undefined }) => {
    if (!user) return

    const post: Post = {
      id: `${user.id}${Date.now()}`,
      timestamp: Timestamp.fromDate(new Date()),
      content: newPost.content,
      file: newPost.file,
      likes: 0,
      comments: [],
      owner: user.id,
    }

    postStuff(post)
    setPosts((currentPosts) => [post, ...(currentPosts ?? [])])
  }

  const handleComment = (message: string, post: Post) => {
    if (!user) return

    const newComment: Comment = {
      message,
      name: user.name,
      icon: user.icon,
      timestamp: Timestamp.now(),
    }

    setPosts((currentPosts) => {
      const updatedPosts = (currentPosts ?? []).map((existingPost) =>
        existingPost.id === post.id
          ? { ...existingPost, comments: [...existingPost.comments, newComment] }
          : existingPost,
      )

      const updatedPost = updatedPosts.find((existingPost) => existingPost.id === post.id)
      if (updatedPost) {
        updatePost(updatedPost)
      }

      return updatedPosts
    })
  }

  if (!user || !posts) return <SuperSillyLoading />

  return (
    <Layout>
      <div className="min-h-screen pb-24" style={{ backgroundColor: pallate.background }}>
        <div className="home-feed-shell mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
            <main className="space-y-6">
              <CreatePost pallate={pallate} onPostSubmit={handlePostSubmit} user={user} />
              <NewContentFeed
                content={sortedPosts}
                user={user}
                pallate={pallate}
                handleComment={handleComment}
                handleDelete={handleDelete}
                onOpenComments={setSelectedPost}
              />
            </main>

            <aside className="space-y-6 xl:sticky xl:top-6">
              <TopPanel pallate={pallate} user={user} friends={friends} messages={messages} totalPosts={sortedPosts.length} />
            </aside>
          </div>
        </div>
      </div>

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          pallate={pallate}
          currentUser={user}
          onAddComment={(content) => handleComment(content, selectedPost)}
        />
      )}
    </Layout>
  )
}

export default App
