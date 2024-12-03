import Layout from "../components/layout";
import Main from './help/start';

function Structure(){
    return <div>
        <Main></Main>
    </div>
}

export default function Qna() {
    return <Layout
    children={<div><Structure></Structure></div>}
    ></Layout>
}