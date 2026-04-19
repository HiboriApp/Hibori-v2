from fastapi import FastAPI
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel
from model import generate_response, User

app = FastAPI()


class GenerateRequest(BaseModel):
    usr: User
    request: str
    friends: list[User]


@app.post("/generate")
async def generate(payload: GenerateRequest) -> PlainTextResponse:
    response = generate_response(payload.usr, payload.request, payload.friends)
    return PlainTextResponse(content=response)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8005)