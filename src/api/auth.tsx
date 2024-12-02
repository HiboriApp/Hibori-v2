import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { setUser, UserData } from "./db";
import { DefaultPallate } from "./settings";
import { GenerateIcons } from "./icons";


export async function SignUp(email: string, password: string, name: string) {
    try{
    const user = await createUserWithEmailAndPassword(auth, email, password);
    const data: UserData = {
        id: user.user.uid,
        name: name,
        pallate: DefaultPallate(),
        icon: await GenerateIcons(user.user.uid),
        bio: "",
        lastSeen: new Date().toString(),
        email: email
    };
    await setUser(data);
    return true;
    } catch(e){
        console.log(e);
        return false;
    }
}

export async function Login(email: string, password: string) {
    try{
    const user = await signInWithEmailAndPassword(auth, email, password);
    const res = (await getDoc(doc(db, "users", user.user.uid))).exists();
    if (!res){
        signOut(auth);
        return false;
    }
    return true;
    } catch{
        return false;
    }
}