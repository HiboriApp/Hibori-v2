import { UserData } from "./db";

function tokenize(value: string) {
    return value
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .filter(Boolean);
}

function scoreUserMatch(currentUser: UserData, candidate: UserData, queryTokens: string[]) {
    const currentUserTokens = tokenize(`${currentUser.name} ${currentUser.bio}`);
    const candidateTokens = tokenize(`${candidate.name} ${candidate.bio}`);

    const overlapWithQuery = queryTokens.filter((token) => candidateTokens.includes(token)).length;
    const overlapWithUser = currentUserTokens.filter((token) => candidateTokens.includes(token)).length;

    return overlapWithQuery * 3 + overlapWithUser;
}

export default async function Predict(user: UserData, students: UserData[], query: string) {
    if (!students.length) {
        return "null";
    }

    const queryTokens = tokenize(query);
    const scoredCandidates = students.map((candidate) => ({
        id: candidate.id,
        score: scoreUserMatch(user, candidate, queryTokens),
    }));

    scoredCandidates.sort((a, b) => b.score - a.score);
    const bestCandidate = scoredCandidates[0];

    if (!bestCandidate || bestCandidate.score <= 0) {
        const seed = tokenize(`${user.id} ${query}`).join("").length;
        const randomIndex = seed % students.length;
        return students[randomIndex]?.id ?? "null";
    }

    return bestCandidate.id;
}