import React, { useEffect, useMemo, useRef, useState } from "react";
import { LogOut, Menu, MessageCircle, Send, UserRound, X } from "lucide-react";
import { io } from "socket.io-client";
import { api, API_URL } from "./lib/api";

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload =
        mode === "signup"
          ? form
          : { email: form.email, password: form.password };
      const { data } = await api.post(`/auth/${mode}`, payload);
      onAuth(data);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="brand">
          <span className="brand-mark">
            <MessageCircle size={24} />
          </span>
          <div>
            <h1>Chatline</h1>
            <p>Realtime MERN messaging</p>
          </div>
        </div>

        <div className="segment">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Login
          </button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>
            Sign up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && (
            <label>
              Full name
              <input
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                placeholder="Aarav Sharma"
                minLength="2"
                required
              />
            </label>
          )}
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="you@example.com"
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Minimum 6 characters"
              minLength="6"
              required
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="primary-btn" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}

function EmptyChat() {
  return (
    <section className="empty-chat">
      <MessageCircle size={42} />
      <h2>Select a chat</h2>
      <p>Choose someone from the conversation list to start messaging.</p>
    </section>
  );
}

function ChatApp({ currentUser, onLogout }) {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const selectedUserId = selectedUser?._id;

  useEffect(() => {
    api.get("/users").then(({ data }) => setUsers(data));
  }, []);

  useEffect(() => {
    const socket = io(API_URL, { withCredentials: true });
    socketRef.current = socket;

    socket.on("onlineUsers", setOnlineUsers);
    socket.on("newMessage", (message) => {
      setMessages((previous) => {
        const isCurrentChat =
          message.senderId === selectedUserId || message.receiverId === selectedUserId;
        return isCurrentChat ? [...previous, message] : previous;
      });
    });

    return () => socket.disconnect();
  }, [selectedUserId]);

  useEffect(() => {
    if (!selectedUserId) return;

    api.get(`/messages/${selectedUserId}`).then(({ data }) => setMessages(data));
  }, [selectedUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => {
        const aOnline = onlineUsers.includes(a._id);
        const bOnline = onlineUsers.includes(b._id);
        return Number(bOnline) - Number(aOnline) || a.fullName.localeCompare(b.fullName);
      }),
    [users, onlineUsers]
  );

  async function handleLogout() {
    await api.post("/auth/logout");
    socketRef.current?.disconnect();
    onLogout();
  }

  async function sendMessage(event) {
    event.preventDefault();
    if (!text.trim() || !selectedUserId) return;

    const messageText = text;
    setText("");
    const { data } = await api.post(`/messages/send/${selectedUserId}`, { text: messageText });
    setMessages((previous) => [...previous, data]);
  }

  return (
    <main className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand compact">
            <span className="brand-mark">
              <MessageCircle size={20} />
            </span>
            <strong>Chatline</strong>
          </div>
          <button className="icon-btn mobile-only" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="me-card">
          <span className="avatar">{currentUser.fullName.charAt(0).toUpperCase()}</span>
          <div>
            <strong>{currentUser.fullName}</strong>
            <small>{currentUser.email}</small>
          </div>
          <button className="icon-btn" onClick={handleLogout} aria-label="Logout">
            <LogOut size={18} />
          </button>
        </div>

        <div className="user-list">
          {sortedUsers.map((user) => (
            <button
              className={`user-row ${selectedUserId === user._id ? "active" : ""}`}
              key={user._id}
              onClick={() => {
                setSelectedUser(user);
                setSidebarOpen(false);
              }}
            >
              <span className="avatar">
                {user.fullName.charAt(0).toUpperCase()}
                {onlineUsers.includes(user._id) && <span className="online-dot" />}
              </span>
              <span>
                <strong>{user.fullName}</strong>
                <small>{onlineUsers.includes(user._id) ? "Online" : "Offline"}</small>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="chat-surface">
        <header className="chat-header">
          <button className="icon-btn mobile-only" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={21} />
          </button>
          {selectedUser ? (
            <>
              <span className="avatar">{selectedUser.fullName.charAt(0).toUpperCase()}</span>
              <div>
                <strong>{selectedUser.fullName}</strong>
                <small>{onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}</small>
              </div>
            </>
          ) : (
            <strong>Messages</strong>
          )}
        </header>

        {selectedUser ? (
          <>
            <div className="messages">
              {messages.map((message) => {
                const mine = message.senderId === currentUser._id;
                return (
                  <article className={`message ${mine ? "mine" : ""}`} key={message._id}>
                    <p>{message.text}</p>
                    <time>{new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time>
                  </article>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            <form className="composer" onSubmit={sendMessage}>
              <input
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={`Message ${selectedUser.fullName}`}
              />
              <button className="send-btn" aria-label="Send message">
                <Send size={19} />
              </button>
            </form>
          </>
        ) : (
          <EmptyChat />
        )}
      </section>

      {sidebarOpen && <button className="scrim" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />}
    </main>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then(({ data }) => setCurrentUser(data))
      .catch(() => setCurrentUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="loading-screen">
        <UserRound size={30} />
        <p>Loading chat...</p>
      </main>
    );
  }

  return currentUser ? (
    <ChatApp currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
  ) : (
    <AuthScreen onAuth={setCurrentUser} />
  );
}
