from pathlib import Path
import re
from typing import Any

from huggingface_hub import snapshot_download
from pydantic import BaseModel
import torch
from transformers import AutoModelForCausalLM, AutoProcessor

MODEL_ID = "google/gemma-4-E2B-it"
MODEL_DIR = Path(__file__).resolve().parent / "model_cache" / MODEL_ID.replace("/", "_")


def ensure_model_downloaded() -> Path:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    if not (MODEL_DIR / "config.json").exists():
        snapshot_download(
            repo_id=MODEL_ID,
            local_dir=str(MODEL_DIR),
        )
    return MODEL_DIR


LOCAL_MODEL_PATH = ensure_model_downloaded()
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

processor = AutoProcessor.from_pretrained(str(LOCAL_MODEL_PATH), local_files_only=True)
model: Any = AutoModelForCausalLM.from_pretrained(
    str(LOCAL_MODEL_PATH),
    local_files_only=True,
    dtype=torch.float16 if DEVICE.type == "cuda" else torch.float32,
    low_cpu_mem_usage=False,
)
model = model.to(DEVICE)
model.eval()


class User(BaseModel):
    name: str
    description: str
    id: str


def extract_best_id(raw_response: str, friends: list[User]) -> str:
    for friend in friends:
        if friend.id in raw_response:
            return friend.id

    normalized = raw_response.strip()
    for friend in friends:
        if re.fullmatch(rf"{re.escape(friend.id)}", normalized):
            return friend.id

    return friends[0].id if friends else ""


def pick_best_in_window(user: User, request: str, window_friends: list[User], current_best_id: str | None = None) -> str:
    if not window_friends:
        return ""

    friends_text = "\n".join(
        [
            f"- id: {friend.id}; name: {friend.name}; description: {friend.description}"
            for friend in window_friends
        ]
    )

    best_so_far_text = f"Current best id in memory: {current_best_id}\n\n" if current_best_id else ""

    messages = [
        {
            "role": "system",
            "content": (
                "You're given a user and a request for a desired friend type. "
                "You're also given candidate friends in the current sliding window. "
                "Choose the best match and return only its ID."
            ),
        },
        {
            "role": "user",
            "content": (
                best_so_far_text
                +
                f"User id: {user.id}\n"
                f"User name: {user.name}\n"
                f"User description: {user.description}\n\n"
                f"Friend request: {request}\n\n"
                f"Potential friends:\n{friends_text}\n\n"
                "Answer with only one candidate ID."
            ),
        },
    ]

    text = processor.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
        enable_thinking=False,
    )

    inputs = processor(text=text, return_tensors="pt")
    inputs = {k: v.to(DEVICE) for k, v in inputs.items()}
    input_len = inputs["input_ids"].shape[-1]

    with torch.inference_mode():
        outputs = model.generate(**inputs, max_new_tokens=32)

    response = processor.decode(outputs[0][input_len:], skip_special_tokens=False)
    parsed = processor.parse_response(response)
    return extract_best_id(parsed if isinstance(parsed, str) else str(parsed), window_friends)


def generate_response(user: User, request: str, friends: list[User]) -> str:
    if not friends:
        return ""

    current_best = friends[0]
    for candidate in friends[1:]:
        winner_id = pick_best_in_window(
            user=user,
            request=request,
            window_friends=[current_best, candidate],
            current_best_id=current_best.id,
        )

        if winner_id == candidate.id:
            current_best = candidate

    return current_best.id
