import { useState } from "react";
import axios from "axios";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const token = localStorage.getItem("token");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages([...messages, userMsg]);

    const res = await axios.post(
      "http://localhost:5000/chat",
      { message: input },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const aiMsg = { role: "ai", text: res.data.reply };
    setMessages((prev) => [...prev, aiMsg]);

    setInput("");
  };

  return (
    <div style={{background:" #4a00e0"}}>
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(-45deg, #8e2de2, #4a00e0, #00c6fb, #005bea)",
        backgroundSize: "400% 400%",
        animation: "gradientBG 10s ease infinite",
      }}
    >
      <style>
        {`
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          .chat-card::-webkit-scrollbar {
            width: 6px;
          }
          .chat-card::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
          }
        `}
      </style>

      {/* Chat Container */}
      <div
        style={{
          width: "450px",
          height: "650px",
          background: "rgba(255,255,255,0.2)",
          backdropFilter: "blur(10px)",
          borderRadius: "20px",
          padding: "20px",
          boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            color: "white",
            marginBottom: "10px",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          🤖 AI Chat
        </h2>

        {/* Chat Messages */}
        <div
          className="chat-card"
          style={{
            height: "500px",
            overflowY: "auto",
            padding: "10px",
          }}
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  padding: "10px 15px",
                  borderRadius: "15px",
                  maxWidth: "70%",
                  background: msg.role === "user" ? "#4a00e0" : "white",
                  color: msg.role === "user" ? "white" : "black",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                }}
              >
                <strong>{msg.role === "user" ? "You" : "AI"}:</strong> {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input Box */}
        <div style={{ display: "flex", marginTop: "10px", gap: "10px" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              outline: "none",
              fontSize: "16px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            }}
          />

          <button
            onClick={sendMessage}
            style={{
              padding: "12px 18px",
              borderRadius: "10px",
              background: "#4a00e0",
              color: "white",
              fontWeight: "bold",
              border: "none",
              cursor: "pointer",
              transition: "0.3s",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
            onMouseOver={(e) => (e.target.style.background = "#6a00ff")}
            onMouseOut={(e) => (e.target.style.background = "#4a00e0")}
          >
            Send
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
