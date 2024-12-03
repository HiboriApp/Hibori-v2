import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { DefaultPallate, Pallate } from "./settings";
import { auth, db } from "./firebase";
import { User } from "firebase/auth";
import { GenerateIcons } from "./icons";

export interface UserData{
    id: string,
    pallate: Pallate
    icon: string
    name: string
    lastSeen: string
    bio: string
    email: string
    messages: {message: string, date: Timestamp}[]
    friends: string[]
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

export async function getUserById(id: string){
    const user = await getDoc(doc(db, "users", id));
    if (!user.exists()) return null;
    return user.data() as UserData;
}

export async function getFriends(friends: string[]){
    const users: UserData[] = [];
    for (let i = 0; i < friends.length; i++){
        const user = await getUserById(friends[i]);
        if (!user) continue;
        users.push(user);
    }
    return users;
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
        messages: [],
        friends: [],
    };
    await setUser(data);
    return true;
}