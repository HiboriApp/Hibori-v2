import { useState } from "react";
import { DefaultPallate, GetPallate, Pallate } from "../util/settings";

export function Signup() {
    const [pallate, setPallate] = useState<Pallate>(DefaultPallate());
    GetPallate().then((pallate) => setPallate(pallate));
    return <div className={"" + pallate.background}>SignupForm</div>
}