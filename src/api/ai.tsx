import { UserData } from "./db";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export default async function Predict(user: UserData, students: UserData[], query: string){
    const prompt = `
    Your job is finding friends for a Certain user. You're given a user, a query, and a list of possible friends.
    Select the best option for a friend from the following options, according to the query and the user.
    Respond with the ID of the ID of the best possible friend. If there are no possible friends, respond with "null".

    Example:
    User: אביב,
    Bio: אני אוהב כדורגל
    Query: אני מחפש משהו שאוהב כדורגל

    Options:
    1.
    User: אליהו,
    Bio: אני שונא כדורגל,
    ID: A12fFAS23rcw

    2.
    User: חורחה
    Bio: אני אוהב כדורגל,
    ID: I43OpNw34d

    Best response: I43OpNw34d

    Your turn:

    User: ${user.name}
    Bio: ${user.bio}
    Query: ${query}
    Options:
    ${students.map((student) => `User: ${student.name}
    Bio: ${student.bio}
    ID: ${student.id}`).join('\n')}

    Your response:

    `;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const response = await model.generateContent(prompt);

    return response.response.text();
}