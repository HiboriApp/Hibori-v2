import { collection, doc, getDoc, getDocs, limit, query, setDoc, Timestamp, where } from "firebase/firestore";
import { DefaultPallate, Pallate } from "./settings";
import { auth, db } from "./firebase";
import { User } from "firebase/auth";
import { GenerateIcons, Icon } from "./icons";

export type Notification = {
    content: string;
    timestamp: Timestamp;
    type: 'message' | 'like' | 'comment';
    icon: Icon;
};

export interface UserData{
    id: string,
    pallate: Pallate
    icon: Icon
    name: string
    lastSeen: string
    bio: string
    email: string
    notifications: Notification[]
    friends: string[]
    isOnline: boolean
    lastOnline: Timestamp
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

export async function getUsersById(ids: string[]){
    let result = [];
    for (let i = 0; i < ids.length; i++){
        const user = await getDoc(doc(db, "users", ids[i]));
        if (!!user.exists()) result.push(user.data() as UserData);
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
    sender: string
}

export interface Chat{
    name?: string,
    person: string | string[],
    messages: Message[],
    lastMessage: string,
    description?: string,
    icon: Icon,
    id: string,
}

export async function openChat(user: UserData, person: UserData){
    const first = user.id < person.id ? user.id : person.id;
    const second = user.id > person.id ? user.id : person.id;
    return first + second;
}

export async function getChats(){
    if (!auth.currentUser) return;
    const chats = await getDocs(query(collection(db, "chats"), where("id", "array-contains", auth.currentUser.uid)));
    return chats.docs.map((doc) => {return {...doc.data() as Chat, id: doc.id};}) as Chat[];
}

export async function sendMessage(chat: Chat, message: Message){
    if (!auth.currentUser) return;
    return setDoc(doc(db, "chats", chat.id), {messages: [...chat.messages, message]}, {merge: true});
}

export async function setUser(user: UserData){
    if (!auth.currentUser) return;
    await setDoc(doc(db, "users", user.id), user);
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
        friends: [],
        isOnline: true,
        lastOnline: Timestamp.fromDate(new Date()),
    };
    await setUser(data);
    return true;
}

export async function removeNotification(user: UserData, id: number){
    if (!user){return;}
    return setDoc(doc(db, "users", user.id), {notifications: user.notifications.filter((_, i) => i !== id)}, {merge: true});
}

export interface Post{
    id: string,
    content: string,
    timestamp: Timestamp,
    likes: string[],
    comments: string[],
    owner: string
}

export async function getPosts(count: number | undefined){
    if (!auth.currentUser) return;
    if (!count){return await getDocs(query(collection(db, "posts")));}
    else {return await (getDocs(query(collection(db, "posts"), limit(count))));}
}