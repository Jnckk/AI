import React, { useState, useEffect, useRef } from "react";
import "./App.css"; // Impor file CSS
import { v4 as uuidv4 } from "uuid"; // Untuk membuat UUID
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism"; // Menggunakan tema dracula

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const chatEndRef = useRef(null); // Referensi ke elemen akhir chat

  useEffect(() => {
    // Set ID sesi baru saat komponen dimuat
    setSessionId(uuidv4());
  }, []);

  useEffect(() => {
    // Scroll otomatis ke bagian bawah saat pesan baru ditambahkan
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (message.trim()) {
      const timestamp = new Date().toLocaleTimeString(); // Mendapatkan waktu saat pesan dikirim
      // Tambahkan pesan pengguna ke daftar pesan
      setMessages([
        ...messages,
        { text: message, fromUser: true, time: timestamp },
      ]);
      setMessage("");

      try {
        const res = await fetch("https://backend-ai-jnck.vercel.app/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId, message }),
        });

        const data = await res.json();
        // Tambahkan balasan dari backend ke daftar pesan
        setMessages([
          ...messages,
          { text: message, fromUser: true, time: timestamp },
          {
            text: data,
            fromUser: false,
            time: new Date().toLocaleTimeString(),
          },
        ]);
      } catch (error) {
        console.error("Error:", error);
        setMessages([
          ...messages,
          { text: message, fromUser: true, time: timestamp },
          {
            text: "Terjadi kesalahan",
            fromUser: false,
            time: new Date().toLocaleTimeString(),
          },
        ]);
      }
    }
  };

  // Handler untuk menangani penekanan tombol Enter
  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Mencegah baris baru
      handleSubmit(event); // Kirim pesan
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Chat with AI</h1>
      </header>
      <div className="chat-container">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.fromUser ? "user" : "contact"}`}
          >
            <div
              className={`message-bubble ${msg.fromUser ? "user" : "contact"}`}
            >
              {msg.fromUser ? (
                msg.text
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={dracula}
                          language={match[1]}
                          PreTag="div"
                          customStyle={{ backgroundColor: "transparent" }}
                          wrapLongLines={true}
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              )}
              <div className="message-time">{msg.time}</div>{" "}
              {/* Tampilkan waktu pesan */}
            </div>
          </div>
        ))}
        {/* Elemen untuk mengatur scroll */}
        <div ref={chatEndRef} />
      </div>
      <div className="input-container">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown} // Menambahkan handler untuk keydown
          placeholder="Ketik pesan Anda..."
        />
        <button onClick={handleSubmit}>Kirim</button>
      </div>
    </div>
  );
}

export default App;
