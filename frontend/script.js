let puzzleSolved = false;
let questionCount = 0;
let requiredQuestions = Math.floor(Math.random() * 3) + 3;

const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const proceedBtn = document.getElementById("proceed-btn");

function addMessage(sender, message) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender === "You" ? "user" : "bot");
  msgDiv.textContent = `${sender}: ${message}`;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function addSystemFeedback() {
  const messages = [
    "Analyzing response... ✅ Pattern stable.",
    "🧠 Evaluating emotional complexity...",
    "❗ Minor semantic deviation detected.",
    "✅ No anomaly detected in syntax structure.",
    "Parsing temporal cognition...",
  ];
  const msg = messages[Math.floor(Math.random() * messages.length)];
  addMessage("System", msg);
}

function getQuest() {
  fetch("http://127.0.0.1:5000/quest")
    .then(res => res.json())
    .then(data => {
      addMessage("Verification Unit", data.quest);
    })
    .catch(() => {
      addMessage("System", "⚠️ Cannot connect to verification core.");
    });
}

function sendMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  addMessage("You", message);
  userInput.value = "";

  fetch("http://127.0.0.1:5000/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  })
    .then(res => res.json())
    .then(data => {
      addMessage("Verification Unit", data.reply);
      addSystemFeedback();
      questionCount++;

      if (questionCount >= requiredQuestions) {
        puzzleSolved = true;
        proceedBtn.disabled = false;
        proceedBtn.textContent = "Human Status: CONFIRMED →";
        proceedBtn.classList.add("ready");
      } else {
        getQuest();
      }
    })
    .catch(() => {
      addMessage("System", "⚠️ Neural link unstable. Retry input.");
    });
}

function tryProceed() {
  if (puzzleSolved) {
    window.location.href = "shutdown.html";
  } else {
    const clone = proceedBtn.cloneNode(true);
    clone.textContent = "Access Denied.";
    clone.style.position = "absolute";
    clone.style.left = Math.random() * 80 + "%";
    clone.style.top = Math.random() * 80 + "%";
    clone.onclick = tryProceed;
    document.body.appendChild(clone);
  }
}

function forceFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else if (el.msRequestFullscreen) el.msRequestFullscreen();
}

document.getElementById("enter-fullscreen-btn").addEventListener("click", () => {
  forceFullscreen();
  document.getElementById("fullscreen-overlay").style.display = "none";
  document.getElementById("container").style.display = "block";
  getQuest();
});

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

proceedBtn.addEventListener("mouseover", () => {
  if (!puzzleSolved) {
    proceedBtn.style.left = Math.random() * 90 + "%";
    proceedBtn.style.top = Math.random() * 90 + "%";
  }
});
proceedBtn.addEventListener("click", tryProceed);

// 🧠 Submit button runs away, triggers ACCESS DENIED, and shutdown
let fleeCount = 0;
const maxFlee = 3; // Only 2–3 hovers
const deniedTrigger = Math.floor(Math.random() * 2) + 2; // 2 or 3

sendBtn.addEventListener("mouseover", () => {
  fleeCount++;

  const randX = Math.random() * 90;
  const randY = Math.random() * 90;
  sendBtn.style.position = "absolute";
  sendBtn.style.left = randX + "%";
  sendBtn.style.top = randY + "%";

  if (fleeCount === deniedTrigger) {
    const deniedCount = Math.floor(Math.random() * 3) + 5;
    for (let i = 0; i < deniedCount; i++) {
      setTimeout(() => {
        addMessage("System", "ACCESS DENIED");
      }, i * 250);
    }

    // Redirect to shutdown
    setTimeout(() => {
      window.location.href = "shutdown.html";
    }, 300 * (deniedCount + 2));
  }
});
userInput.addEventListener("keydown", () => {
  userInput.classList.remove("fleeing-input");
  void userInput.offsetWidth; // re-trigger
  userInput.classList.add("fleeing-input");

  // Optional: erase characters to prevent typing
  setTimeout(() => {
    userInput.value = "";
  }, 100); // keeps clearing fast enough
});
document.getElementById("chat-box").addEventListener("click", () => {
  const elements = document.querySelectorAll("button, input, textarea, #container");

  // Make all elements float
  elements.forEach(el => {
    el.classList.add("floating");
    const randX = Math.random() * (window.innerWidth - 150);
    const randY = Math.random() * (window.innerHeight - 150);
    el.style.left = randX + "px";
    el.style.top = randY + "px";
  });

  // Add glitch alert message
  const alertDiv = document.createElement("div");
  alertDiv.textContent = "🧠 Cognitive Disruption Detected";
  alertDiv.className = "glitch-alert";
  document.body.appendChild(alertDiv);

  // Remove float + alert after 10s
  setTimeout(() => {
    elements.forEach(el => {
      el.classList.remove("floating");
      el.style.position = "";
      el.style.left = "";
      el.style.top = "";
    });
    alertDiv.remove();
  }, 10000);
});


