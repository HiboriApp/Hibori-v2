import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";
import { CreateUser } from "./db";
import type { Pallate } from "./settings";


export async function SignUp(email: string, password: string, name: string, classroomId: string, bio: string, pallate: Pallate) {
    const user = await createUserWithEmailAndPassword(auth, email, password);
    CreateUser(name, user.user, email, classroomId, bio, pallate);
}

export async function Login(email: string, password: string) {
    const user = await signInWithEmailAndPassword(auth, email, password);
    const res = (await getDoc(doc(db, "users", user.user.uid))).exists();
    if (!res){
        signOut(auth);
        return false;
    }
}