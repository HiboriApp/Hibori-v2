import { collection, CollectionReference, doc, DocumentReference, limit, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "./firebase";
import { Chat, Post, UserData } from "./db";


export function docListener<Result>(doc: DocumentReference, action: (((res: Result) => void) | ((res: Result) => Promise<void>))) {
    return onSnapshot(doc, (doc) => {action(doc.data() as Result);});
}

export function collectionListener<Result>(collection: CollectionReference, action: (((res: Result[]) => void) | ((res: Result[]) => Promise<void>))) {
    return onSnapshot(collection, (doc) => {action(doc.docs.map(doc => doc.data() as Result));});
}

export function postsListener(action: (((res: Post[]) => void) | ((res: Post[]) => Promise<void>)), count?: number | undefined) {
    if (!auth.currentUser) return;
    if (!count){return onSnapshot(query(collection(db, "posts")), (doc) => {action(doc.docs.map(doc => doc.data() as Post));});}
    return onSnapshot(query(collection(db, "posts"), limit(count)), (doc) => {action(doc.docs.map(doc => doc.data() as Post));});
}

export function chatsListener(action: (((res: Chat[]) => void) | ((res: Chat[]) => Promise<void>))) {
    if (!auth.currentUser) return;
    return onSnapshot(query(collection(db, "chats"), where("person", "array-contains", auth.currentUser.uid)), (doc) => {action(doc.docs.map(doc => doc.data() as Chat));});
}

export function userListener(action: (((res: UserData) => void) | ((res: UserData) => Promise<void>))) {
    if (!auth.currentUser) return;
    return onSnapshot(doc(db, "users", auth.currentUser.uid), (doc) => {action(doc.data() as UserData);});
}
