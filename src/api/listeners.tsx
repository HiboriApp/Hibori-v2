import { CollectionReference, doc, DocumentReference, onSnapshot } from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserData } from "./db";


export function docListener<Result>(doc: DocumentReference, action: (((res: Result) => void) | ((res: Result) => Promise<void>))) {
    return onSnapshot(doc, (doc) => {action(doc.data() as Result);});
}

export function collectionListener<Result>(collection: CollectionReference, action: (((res: Result[]) => void) | ((res: Result[]) => Promise<void>))) {
    return onSnapshot(collection, (doc) => {action(doc.docs.map(doc => doc.data() as Result));});
}

export function userListener(action: (((res: UserData) => void) | ((res: UserData) => Promise<void>))) {
    if (!auth.currentUser) return;
    return onSnapshot(doc(db, "users", auth.currentUser.uid), (doc) => {action(doc.data() as UserData);});
}
