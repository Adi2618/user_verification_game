from flask import Flask, request, jsonify, session
from flask_session import Session
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret'
app.config['SESSION_TYPE'] = 'filesystem'
Session(app)

tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-small")
model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-small")

human_check_prompts = [
    "Ask a question to determine if the subject is human.",
    "Pose a paradox or moral dilemma to test emotional reasoning.",
    "Evaluate the subject's response capacity to abstract ethics.",
    "Ask something only an emotional being would understand.",
    "Ask a dark question that a human might reflect on.",
]

@app.route("/quest")
def quest():
    prompt = random.choice(human_check_prompts)
    input_ids = tokenizer.encode(prompt + tokenizer.eos_token, return_tensors="pt")
    chat_history_ids = model.generate(input_ids, max_length=100, pad_token_id=tokenizer.eos_token_id)
    question = tokenizer.decode(chat_history_ids[:, input_ids.shape[-1]:][0], skip_special_tokens=True)
    session["chat_history_ids"] = chat_history_ids.tolist()
    return jsonify({"quest": question})


@app.route("/answer", methods=["POST"])
def answer():
    data = request.json
    user_input = data["message"].strip()

    new_input_ids = tokenizer.encode(user_input + tokenizer.eos_token, return_tensors="pt").to(model.device)

    if "chat_history_ids" in session:
        prev = torch.tensor(session["chat_history_ids"], dtype=torch.long).to(model.device)
        bot_input_ids = torch.cat([prev, new_input_ids], dim=-1)
    else:
        bot_input_ids = new_input_ids

    chat_history_ids = model.generate(bot_input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id)
    session["chat_history_ids"] = chat_history_ids.tolist()
    reply = tokenizer.decode(chat_history_ids[0], skip_special_tokens=True)

    return jsonify({
        "reply": reply,
        "done": True  # Always progress after reply
    })


@app.route("/reset", methods=["POST"])
def reset():
    session.clear()
    return jsonify({"message": "Session reset."})


if __name__ == "__main__":
    app.run(debug=True)
