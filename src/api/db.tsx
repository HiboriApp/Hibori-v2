import { collection, doc, getDoc, getDocs, limit, query, setDoc, Timestamp, where } from "firebase/firestore";
import { DefaultPallate, Pallate } from "./settings";
import { auth, db } from "./firebase";
import { User } from "firebase/auth";
import { GenerateIcons } from "./icons";

export interface Message{
    id: string,
    content: string,
    date: Timestamp,
}

export interface UserData{
    id: string,
    pallate: Pallate
    icon: string
    name: string
    lastSeen: string
    bio: string
    email: string
    messages: Message[]
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

export async function getUsersById(ids: string[]){
    let result = [];
    for (let i = 0; i < ids.length; i++){
        const user = await getDoc(doc(db, "users", ids[i]));
        if (!!user.exists()) result.push(user.data() as UserData);
    }
    return result;
}

export async function findNonFriends(user: UserData, friends: number){
    return (await getDocs(query(collection(db, "users"), where("id", "not-in", user.friends), where("id", "!=", user.id), limit(friends)))).docs.map((doc) => doc.data() as UserData);
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
        isOnline: true,
        lastOnline: Timestamp.fromDate(new Date()),
    };
    await setUser(data);
    return true;
}