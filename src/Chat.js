import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
const socket = io('http://localhost:5000'); // Change if hosting elsewhere

function Chat() {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    socket.on('message', (msg) => setMessages((msgs) => [...msgs, msg]));
    return () => socket.off('message');
  }, []);

  const joinRoom = () => {
    if (!roomId) setRoomId(uuidv4()); // Generate new room if empty
    socket.emit('joinRoom', { roomId: roomId || uuidv4(), username });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (input) {
      socket.emit('chatMessage', { roomId, username, text: input });
      setInput('');
    }
  };

  const shareableLink = `${window.location.origin}/?room=${roomId}`;

  if (!username || !roomId) {
    return (
      <div className="join-chat-container">
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <button onClick={joinRoom}>Join/Create Room</button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div>
        <div>Share this link: <input value={shareableLink} readOnly onClick={e=>e.target.select()} /></div>
      </div>
      <div className="messages-window">
        {messages.map((m, i) => (
          <div key={i}><b>{m.username}:</b> {m.text}</div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage}>
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
export default Chat;
