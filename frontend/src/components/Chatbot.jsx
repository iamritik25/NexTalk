import React, { useState } from 'react';
import './chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! How can I help you today?", sender: "bot" }
    ]);
    const [inputValue, setInputValue] = useState("");

    const handleSendMessage = () => {
        if (inputValue.trim() === "") return;
        
        const newMessages = [...messages, { text: inputValue, sender: "user" }];
        setMessages(newMessages);
        setInputValue("");

        // Simple bot response logic
        setTimeout(() => {
            setMessages(prev => [...prev, { text: "I'm a demo bot. NexTalk is coming soon!", sender: "bot" }]);
        }, 1000);
    };

    return (
        <div className="chatbot-container">
            {!isOpen ? (
                <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
                    Chat with us
                </button>
            ) : (
                <div className="chatbot-box">
                    <div className="chatbot-header">
                        <span>NexTalk Support</span>
                        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>×</button>
                    </div>
                    <div className="chatbot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={msg.sender === "bot" ? "bot-message" : "user-message"}>
                                {msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="chatbot-input">
                        <input 
                            type="text" 
                            placeholder="Type a message..." 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
