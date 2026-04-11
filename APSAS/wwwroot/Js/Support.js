//const apiUrl = "http://localhost:5261/SendMessageToAdmin";
const apiUrl = "http://52.184.80.181:5261/SendMessageToAdmin";
const input = document.getElementById("messageInput");
const chatBox = document.getElementById("chatMessages");
const sendBtn = document.getElementById("sendBtn");

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keypress", e => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

function appendMessage(text, type = "user") {
    const div = document.createElement("div");
    div.classList.add("msg", type);
    div.textContent = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    appendMessage(message, "user");
    input.value = "";

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        if (response.ok) {
            const data = await response.json();
            appendMessage(data.message || "✅ Tin nhắn đã gửi!", "system");
        } else {
            appendMessage("❌ Lỗi khi gửi tin nhắn.", "system");
        }
    } catch (error) {
        appendMessage("⚠️ Không thể kết nối server.", "system");
        console.error(error);
    }
}
