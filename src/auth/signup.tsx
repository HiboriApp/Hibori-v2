import { useState } from "react";
import { DefaultPallate, GetPallate, Pallate } from "../api/settings";

export function Signup() {
    const [pallate, setPallate] = useState<Pallate>(DefaultPallate());
    GetPallate().then((pallate) => setPallate(pallate));
    return <div className={`bg-${pallate.background} `}>SignupForm</div>
}