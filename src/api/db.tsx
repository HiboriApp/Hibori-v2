import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, setDoc, Timestamp, where } from "firebase/firestore";
import { DefaultPallate, Pallate } from "./settings";
import { auth, db } from "./firebase";
import { User } from "firebase/auth";
import { GenerateIcons, Icon, notificationIcon } from "./icons";

export type Notification = {
    content: string;
    timestamp: Timestamp;
    type: 'message' | 'like' | 'comment';
    icon: Icon;
    senderId: string;
};

export function NotificationMessage(user: string,notification: 'like' | 'comment' | 'message'){
    switch(notification){
        case 'like':
            return "המשתמש " + user + " אהב את ההודעה שלך";
        case 'comment':
            return "המשתמש " + user + " שלך תגובה לפוסט שלך";
        case 'message':
            return "המשתמש " + user + " שלח לך הודעה חדשה";
    }
}

export function newNotification(user: UserData, action: 'message' | 'like' | 'comment') : Notification{
    return {
        content: NotificationMessage(user.name, action), 
        timestamp: Timestamp.now(), 
        type: action, 
        icon: notificationIcon(action, user),
        senderId: user.id,
    }
}

export interface UserData{
    id: string,
    pallate: Pallate
    icon: Icon
    name: string
    lastSeen: string
    bio: string
    email: string
    notifications: Notification[]
    likes: string[]
    friends: string[]
    lastOnline: Timestamp
    wantsNotifications: boolean
}

export async function updatePallate(user: UserData, newPallate: Pallate){
    if (!user){return;}
    return setDoc(doc(db, "users", user.id), {newPallate}, {merge: true});
}

export async function getUser(){
    if (!auth.currentUser) return;
    const user = await getDoc(doc(db, "users", auth.currentUser.uid));
    return user.data() as UserData;
}

export async function addFriend(user: UserData, friend: string){
    if (!user){return;}
    return setDoc(doc(db, "users", user.id), {friends: [...user.friends, friend]}, {merge: true});
}

export async function removeFriend(user: UserData, friend: string){
    if (!user){return;}
    return setDoc(doc(db, "users", user.id), {friends: user.friends.filter(f => f !== friend)}, {merge: true});
}

export async function getUserById(id: string){
    const user = await getDoc(doc(db, "users", id));
    return user.data() as UserData;
}

export async function reccomendedFriends(user: UserData, lim: number){
    const friends = user.friends.length > 0 ? user.friends : [''];
    const res = await getDocs(query(collection(db, "users"), where('id', 'not-in', friends), limit(lim), orderBy('friends', 'desc')));
    return res.docs.map((doc) => doc.data() as UserData);
}

export async function addNotification(user: UserData, notification: Notification){
    if (!user){return;}
    return setDoc(doc(db, "users", user.id), {notifications: [...user.notifications, notification]}, {merge: true});
}

export async function getUsersById(ids: string[]){
    let result = [];
    for (let i = 0; i < ids.length; i++){
        const user = await getDoc(doc(db, "users", ids[i]));
        if (!!user.exists() && user.id != auth.currentUser?.uid) result.push(user.data() as UserData);
    }
    return result;
}

export async function findNonFriends(user: UserData, friends: number){
    if (user.friends.length === 0) return (await getDocs(query(collection(db, "users"), limit(friends)))).docs.map((doc) => doc.data() as UserData);
    return (await getDocs(query(collection(db, "users"), where("id", "not-in", user.friends), limit(friends)))).docs.map((doc) => doc.data() as UserData);
}

export interface Message{
    timestamp: Timestamp, 
    content: string, 
    sender: string,
    reply?: number,
}

export interface Chat{
    name?: string,
    person: string[],
    description?: string,
    messages: Message[],
    icon?: Icon,
    id: string,
}

export interface ChatWrapper{
    person: string[],
    name?: string,
    icon: Icon,
    lastMessage: Message | undefined,
    lastMessageDate: Timestamp | undefined,
    id: string,
}

export function openChatName(user: string, person: string){
    const first = user < person ? user : person;
    const second = user > person ? user : person;
    return first + second;
}

export async function getChats(user: UserData){
    let chatIds = [];
    let friends = [];
    for (const friend of user.friends){chatIds.push(await openChatName(user.id, friend));friends.push(friend);};
    if (chatIds.length === 0) return {chats: [], friends};
    const chats = await getDocs(query(collection(db, "chats"), where("person", "array-contains", user.id)));
    return {chats: chats.docs.map((doc) => {return {...doc.data() as ChatWrapper, id: doc.id};}) as ChatWrapper[], friends};
}

export async function openChat(id: string){
    const chat = await getDoc(doc(db, "chats", id));
    return chat.data() as Chat;
}

export async function chatExists(id: string){
    const chat = await getDoc(doc(db, "chats", id));
    return chat.exists();
}

export async function setChat(chat: Chat){
    if (!auth.currentUser) return;
    return await setDoc(doc(db, "chats", chat.id), chat);
}

export async function setUser(user: UserData){
    if (!auth.currentUser) return;
    try {await setDoc(doc(db, "users", user.id), user)}
    catch (e: any) {console.error("ERROR WHILE SAVING USER: ", e)}
    return user;
}


export async function CreateUser(name: string, user: User, email: string){
    const data: UserData = {
        id: user.uid,
        name: name,
        pallate: DefaultPallate(),
        icon: await GenerateIcons(user.uid),
        bio: "",
        lastSeen: new Date().toString(),
        email: email,
        notifications: [],
        likes: [],
        friends: [],
        wantsNotifications: true,
        lastOnline: Timestamp.fromDate(new Date()),
    };
    await setUser(data);
    return true;
}

export async function removeNotification(user: UserData, id: number){
    if (!user){return;}
    return setDoc(doc(db, "users", user.id), {notifications: user.notifications.filter((_, i) => i !== id)}, {merge: true});
}

export enum fileType{
    image = 'image',
    video = 'video',
    document = 'document',
}

export interface UploadedFile{
    name: string,
    type: fileType,
    content: string,
}

export function FileDisplay({file, className} : {file: UploadedFile, className?: string}){
    switch (file.type){
        case fileType.image: return <img src={file.content} alt={file.name} className={className}/>;
        case fileType.video: return <video src={file.content} className={className}/>;
        case fileType.document: return <a href={file.content} download={true} className={className}>{file.name}</a>;
    }
}

export interface Comment{name: string, message: string, icon: Icon, timestamp: Timestamp}

export interface Post{
    id: string,
    content: string,
    timestamp: Timestamp,
    file?: UploadedFile,
    likes: number,
    comments: Comment[],
    owner: string
}

export async function getPosts(count?: number | undefined){
    if (!auth.currentUser) return;
    if (!count){return (await getDocs(query(collection(db, "posts")))).docs.map((doc) => doc.data() as Post);}
    else {return (await (getDocs(query(collection(db, "posts"), limit(count))))).docs.map((doc) => doc.data() as Post);}
}

export async function postStuff(post: Post){
    if (!auth.currentUser) return;
    return await setDoc(doc(db, "posts", post.id), {...post, file: post.file || null});
}

export async function deletePost(post: string){
    if (!auth.currentUser) return;
    return deleteDoc(doc(db, "posts", post));
}

export async function updatePost(post: Post){
    if (!auth.currentUser) return;
    return setDoc(doc(db, "posts", post.id), post);
}

export async function likePost(post: Post, user: UserData, like: boolean){
    if (!auth.currentUser) return;
    updatePost({...post, likes: like ? post.likes + 1 : post.likes - 1});
    if (like) user.likes.push(post.id);
    else user.likes = user.likes.filter((id) => id !== post.id);
    setUser(user);
}