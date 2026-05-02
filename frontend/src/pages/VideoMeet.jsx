import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import { motion, AnimatePresence } from 'framer-motion';

const getBaseUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const backendParam = urlParams.get('backend');
    if (backendParam) return backendParam;

    return window.location.hostname === "localhost" 
        ? "http://localhost:8000" 
        : `http://${window.location.hostname}:8000`;
};

const server_url = getBaseUrl();

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" },
        { "urls": "stun:stun1.l.google.com:19302" },
        { "urls": "stun:stun2.l.google.com:19302" },
        { "urls": "stun:stun3.l.google.com:19302" },
        { "urls": "stun:stun4.l.google.com:19302" },
        // SECURITY: For production, add TURN servers here to mask IP addresses from peers
        // { "urls": "turn:your-turn-server.com", "username": "...", "credential": "..." }
    ]
}

export default function VideoMeetComponent() {
    const [copySuccess, setCopySuccess] = useState(false);
    const connections = useRef({}); // Moved to useRef for security and stability
    
    const copyToClipboard = () => {
        let inviteLink = window.location.href;
        
        // EDGE CASE: If user is on localhost, it's not shareable. 
        // We'll suggest the local IP found in your network settings.
        if (window.location.hostname === "localhost") {
            inviteLink = inviteLink.replace("localhost", "192.168.56.1");
        }
        
        // EDGE CASE: Automatically attach the backend URL if it's been customized (e.g., via Ngrok)
        // so that the person joining doesn't have to manually add it.
        if (server_url && !server_url.includes("localhost") && !inviteLink.includes("backend=")) {
            const separator = inviteLink.includes("?") ? "&" : "?";
            inviteLink = `${inviteLink}${separator}backend=${encodeURIComponent(server_url)}`;
        }

        navigator.clipboard.writeText(inviteLink);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    };

    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(false);
    let [audioAvailable, setAudioAvailable] = useState(false);
    let [video, setVideo] = useState(true);
    let [audio, setAudio] = useState(true);
    let [screen, setScreen] = useState();
    let [showModal, setModal] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState();
    let [messages, setMessages] = useState([])
    let [message, setMessage] = useState("");
    let [newMessages, setNewMessages] = useState(0);
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    const videoRef = useRef([])
    let [videos, setVideos] = useState([])

    const [showReactions, setShowReactions] = useState(false);
    const [reactions, setReactions] = useState([]);
    const [audioLevel, setAudioLevel] = useState(0);

    // ✅ FIX: Re-attach video when joining the room
    useEffect(() => {
        if (!askForUsername && localVideoref.current && window.localStream) {
            localVideoref.current.srcObject = window.localStream;
        }
    }, [askForUsername]);

    useEffect(() => {
        getPermissions();
        const savedUsername = localStorage.getItem("username");
        if (savedUsername) setUsername(savedUsername);
    }, [])

    useEffect(() => {
        let chatBox = document.querySelector('.chattingDisplay');
        if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
    }, [messages]);

    const getPermissions = async () => {
        try {
            console.log("Requesting Media Permissions...");
            
            // EDGE CASE: Check if browser supports mediaDevices
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error("Browser does not support media devices");
            }

            // EDGE CASE: Request audio and video together to avoid multiple permission prompts
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { 
                    echoCancellation: true, 
                    noiseSuppression: true, 
                    autoGainControl: true 
                },
                video: true
            }).catch(async (err) => {
                console.warn("Full media request failed, trying audio only:", err);
                // FALLBACK: If combined fails (e.g., no camera), try audio only
                return await navigator.mediaDevices.getUserMedia({ audio: true }).catch(err2 => {
                    console.error("Audio-only request also failed:", err2);
                    return null;
                });
            });

            if (stream) {
                window.localStream = stream;
                
                // Explicitly enable all tracks and log status
                stream.getTracks().forEach(track => {
                    track.enabled = true;
                    console.log(`${track.kind} track initialized:`, track.label);
                    
                    // EDGE CASE: Monitor track ending unexpectedly (e.g., hardware unplugged)
                    track.onended = () => {
                        console.warn(`${track.kind} track ended unexpectedly`);
                        if (track.kind === 'audio') setAudioAvailable(false);
                        if (track.kind === 'video') setVideoAvailable(false);
                    };
                });

                if (localVideoref.current) {
                    localVideoref.current.srcObject = stream;
                }

                setAudioAvailable(stream.getAudioTracks().length > 0);
                setVideoAvailable(stream.getVideoTracks().length > 0);
                setAudio(stream.getAudioTracks().length > 0);
                setVideo(stream.getVideoTracks().length > 0);
            } else {
                // EDGE CASE: No media devices available
                setAudioAvailable(false);
                setVideoAvailable(false);
                alert("No microphone or camera found. Please check your connections.");
            }

            setScreenAvailable(!!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia));
        } catch (error) { 
            console.error("Critical failure in getPermissions:", error);
            alert("Could not access microphone or camera. Please ensure you have granted permissions in your browser settings.");
        }
    };

    useEffect(() => {
        if (window.localStream && audioAvailable) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // EDGE CASE: Browsers block audio until a user interaction (Autoplay Policy)
            const handleResume = async () => {
                if (audioContext.state === 'suspended') {
                    await audioContext.resume();
                    console.log("AudioContext resumed via user interaction");
                }
            };
            window.addEventListener('click', handleResume, { once: true });
            window.addEventListener('touchstart', handleResume, { once: true });
            window.addEventListener('keydown', handleResume, { once: true });

            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(window.localStream);
            source.connect(analyser);
            analyser.fftSize = 256;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateLevel = () => {
                if (audioContext.state === 'closed') return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                setAudioLevel(sum / bufferLength);
                requestAnimationFrame(updateLevel);
            };
            updateLevel();
            return () => {
                if (audioContext.state !== 'closed') audioContext.close();
            };
        }
    }, [window.localStream, audioAvailable]);

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)
        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections.current[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections.current[fromId].createAnswer().then((description) => {
                            connections.current[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections.current[fromId].localDescription }))
                            })
                        })
                    }
                }).catch(e => console.error("SDP Error:", e));
            }
            if (signal.ice) {
                connections.current[fromId].addIceCandidate(new RTCIceCandidate(signal.ice))
                    .catch(e => console.error("ICE Candidate Error:", e));
            }
        }
    }

    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false });
        socketRef.current.on("signal", gotMessageFromServer);

        socketRef.current.on("connect", () => {
            let roomId = localStorage.getItem("roomId") || window.location.pathname;
            socketRef.current.emit("join-call", roomId);
            socketIdRef.current = socketRef.current.id;

            socketRef.current.on("chat-message", addMessage);
            socketRef.current.on("reaction", (emoji) => {
                const id = Math.random();
                setReactions(prev => [...prev, { id, emoji }]);
                setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 4000);
            });

            socketRef.current.on("user-left", (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id));
                if (connections.current[id]) {
                    connections.current[id].close();
                    delete connections.current[id];
                }
            });

            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {
                    if (!connections.current[socketListId]) {
                        connections.current[socketListId] = new RTCPeerConnection(peerConfigConnections);
                        
                        connections.current[socketListId].onicecandidate = (event) => {
                            if (event.candidate) socketRef.current.emit("signal", socketListId, JSON.stringify({ 'ice': event.candidate }));
                        };

                        connections.current[socketListId].ontrack = (event) => {
                            console.log(`Receiving remote track from ${socketListId}:`, event.track.kind);
                            
                            const remoteStream = event.streams[0] || new MediaStream([event.track]);

                            setVideos(prev => {
                                const exists = prev.find(v => v.socketId === socketListId);
                                if (exists) {
                                    return prev.map(v => v.socketId === socketListId ? { ...v, stream: remoteStream } : v);
                                }
                                return [...prev, { socketId: socketListId, stream: remoteStream }];
                            });
                        };

                        if (window.localStream) {
                            window.localStream.getTracks().forEach(track => {
                                console.log(`Adding ${track.kind} track to peer ${socketListId}`);
                                connections.current[socketListId].addTrack(track, window.localStream);
                            });
                        }
                    }
                });

                if (id === socketIdRef.current) {
                    for (let id2 in connections.current) {
                        if (id2 === socketIdRef.current) continue;
                        
                        if (window.localStream) {
                            const senders = connections.current[id2].getSenders();
                            window.localStream.getTracks().forEach(track => {
                                const alreadyAdded = senders.find(s => s.track === track);
                                if (!alreadyAdded) {
                                    console.log(`Adding missing ${track.kind} track to ${id2} before offer`);
                                    connections.current[id2].addTrack(track, window.localStream);
                                }
                            });
                        }

                        connections.current[id2].createOffer().then((description) => {
                            connections.current[id2].setLocalDescription(description).then(() => {
                                socketRef.current.emit("signal", id2, JSON.stringify({ "sdp": connections.current[id2].localDescription }));
                            })
                        }).catch(e => console.error("Error creating offer:", e));
                    }
                }
            });
        });
    };

    const addMessage = (data, sender, socketIdSender) => {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setMessages((prev) => [...prev, { sender, data, timestamp }]);
        if (socketIdSender !== socketIdRef.current) setNewMessages((prev) => prev + 1);
    };

    const handleVideo = () => {
        setVideo(prev => {
            const enabled = !prev;
            if (window.localStream) {
                window.localStream.getVideoTracks().forEach(t => {
                    t.enabled = enabled;
                });
            }
            return enabled;
        });
    };

    const handleAudio = () => {
        setAudio(prev => {
            const enabled = !prev;
            if (window.localStream) {
                window.localStream.getAudioTracks().forEach(t => {
                    t.enabled = enabled;
                    console.log(`Audio track ${t.label} is now ${enabled ? 'enabled' : 'disabled'}`);
                });
            } else {
                console.error("Local stream not found when toggling audio");
            }
            return enabled;
        });
    };

    const handleScreen = () => setScreen(!screen);
    const handleEndCall = () => {
        try { 
            if (window.localStream) {
                window.localStream.getTracks().forEach(t => t.stop());
            }
        } catch (e) { 
            console.error("Error stopping tracks:", e);
        }
        window.location.href = "/";
    };

    // EDGE CASE: Stop all tracks when component unmounts to free up hardware
    useEffect(() => {
        return () => {
            if (window.localStream) {
                window.localStream.getTracks().forEach(t => t.stop());
            }
            for (let id in connections.current) {
                connections.current[id].close();
            }
        };
    }, []);

    // EDGE CASE: Handle device changes (e.g., plugging in a headset)
    useEffect(() => {
        const handleDeviceChange = () => {
            console.log("Media devices changed, re-verifying permissions...");
            // We don't necessarily want to re-prompt, but we can log it
        };
        navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
        return () => navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    }, []);

    const sendMessage = () => {
        socketRef.current.emit('chat-message', message, username);
        setMessage("");
    };

    const handleReaction = (emoji) => {
        socketRef.current.emit("reaction", emoji);
        setShowReactions(false);
    };

    const connect = () => {
        setAskForUsername(false);
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();
    };

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#0a0a0c', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Animated Background Orbs */}
            <div className={styles.lobbyOrb1}></div>
            <div className={styles.lobbyOrb2}></div>

            {askForUsername ? (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className={styles.lobbyCard}
                >
                    <div className={styles.lobbyVideoArea}>
                        <video 
                            ref={ref => { 
                                if (ref && window.localStream && ref.srcObject !== window.localStream) { 
                                    ref.srcObject = window.localStream; 
                                } 
                            }} 
                            autoPlay 
                            muted 
                            className={styles.lobbyPreview}
                        ></video>
                        <div className={styles.lobbyControls}>
                            <IconButton onClick={handleVideo} className={video ? styles.lobbyBtnActive : styles.lobbyBtnInactive}>
                                {video ? <VideocamIcon /> : <VideocamOffIcon />}
                            </IconButton>
                            
                            <motion.div 
                                animate={{ scale: audio ? 1 + (audioLevel / 100) : 1 }}
                                style={{ borderRadius: '50%' }}
                            >
                                <IconButton 
                                    onClick={handleAudio} 
                                    className={audio ? styles.lobbyBtnActive : styles.lobbyBtnInactive}
                                    style={{ 
                                        boxShadow: audio ? `0 0 ${audioLevel}px rgba(255,152,57,0.5)` : 'none',
                                        transition: 'box-shadow 0.1s ease'
                                    }}
                                >
                                    {audio ? <MicIcon /> : <MicOffIcon />}
                                </IconButton>
                            </motion.div>
                        </div>
                    </div>

                    <div className={styles.lobbyJoinArea}>
                        <h2 className={styles.lobbyTitle}>Ready to join?</h2>
                        <p className={styles.lobbySubtitle}>Check your audio and video before you enter.</p>
                        
                        <TextField 
                            fullWidth 
                            label="What's your name?" 
                            variant="outlined" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)}
                            sx={{
                                mb: 4,
                                "& .MuiOutlinedInput-root": {
                                    color: "white",
                                    backgroundColor: "rgba(255,255,255,0.03)",
                                    borderRadius: "12px",
                                    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                                    "&:hover fieldset": { borderColor: "#FF9839" },
                                },
                                "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.5)" }
                            }}
                        />

                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button 
                                fullWidth 
                                variant="contained" 
                                onClick={connect} 
                                className={styles.joinNowBtn}
                            >
                                Join Now
                            </Button>
                        </motion.div>
                        
                        <p className={styles.lobbyFootnote}>Joining as a guest? Your name will be visible to everyone.</p>
                    </div>
                </motion.div>
            ) : (
                <div className={styles.enterpriseContainer}>
                    {/* Top Bar / Header */}
                    <div className={styles.topBar}>
                        <div className={styles.meetingInfo}>
                            <h2 className={styles.logo}>NexTalk <span>PRO</span></h2>
                            <div className={styles.divider}></div>
                            <p className={styles.roomName}>{window.location.pathname.split('/')[1]}</p>
                        </div>
                        <div className={styles.topActions}>
                            <Button size="small" variant="outlined" onClick={copyToClipboard} style={{ color: '#FF9839', borderColor: '#FF9839', textTransform: 'none' }}>
                                {copySuccess ? "Link Copied!" : "Invite Others"}
                            </Button>
                        </div>
                    </div>

                    <div className={styles.mainWorkspace}>
                        {/* Video Area */}
                        <div className={`${styles.videoArea} ${showModal ? styles.narrow : ''}`}>
                            <AnimatePresence mode="wait">
                                {videos.length === 0 ? (
                                    <div className={styles.soloStage}>
                                        <video 
                                            ref={ref => { 
                                                if (ref && window.localStream && ref.srcObject !== window.localStream) { 
                                                    ref.srcObject = window.localStream; 
                                                } 
                                            }} 
                                            autoPlay 
                                            muted 
                                            className={styles.enterpriseVideo}
                                        ></video>
                                        <div className={styles.nameTag}>You (Host)</div>
                                    </div>
                                ) : (
                                    <div className={styles.galleryGrid}>
                                        <div className={styles.enterpriseVideoCard}>
                                            <video 
                                                ref={ref => { 
                                                    if (ref && window.localStream && ref.srcObject !== window.localStream) { 
                                                        ref.srcObject = window.localStream; 
                                                    } 
                                                }} 
                                                autoPlay 
                                                muted
                                            ></video>
                                            <div className={styles.nameTag}>You</div>
                                        </div>
                                        {videos.map((video, index) => (
                                            <div key={index} className={styles.enterpriseVideoCard}>
                                                {/* EDGE CASE: Remote videos must have autoPlay, playsInline, and explicitly NOT muted for audio to work */}
                                                <video 
                                                    ref={ref => { 
                                                        if (ref && video.stream) {
                                                            ref.srcObject = video.stream;
                                                            // EDGE CASE: Explicitly ensure the element is NOT muted for audio to be heard
                                                            ref.muted = false;
                                                            ref.volume = 1.0;
                                                            
                                                            // EDGE CASE: Handle browser blocking autoplay audio
                                                            ref.play().then(() => {
                                                                console.log(`Playback started for remote stream from ${video.socketId}`);
                                                            }).catch(e => {
                                                                console.warn("Autoplay failed for remote video:", e);
                                                            });
                                                        } 
                                                    }} 
                                                    autoPlay 
                                                    playsInline 
                                                    muted={false} // Explicitly unmuted
                                                />
                                                <div className={styles.nameTag}>Participant</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Sidebar */}
                        <AnimatePresence>
                            {showModal && (
                                <motion.div 
                                    initial={{ width: 0, opacity: 0 }} 
                                    animate={{ width: 380, opacity: 1 }} 
                                    exit={{ width: 0, opacity: 0 }} 
                                    className={styles.enterpriseSidebar}
                                >
                                    <div className={styles.sidebarHeader}>
                                        <h3>In-call messages</h3>
                                        <IconButton onClick={() => setModal(false)} size="small" style={{ color: 'white' }}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </div>
                                    <div className={styles.sidebarContent}>
                                        {messages.length === 0 ? (
                                            <div className={styles.emptyState}>No messages yet. <br/><span>Messages are visible only to people in the call.</span></div>
                                        ) : (
                                            messages.map((item, index) => (
                                                <div key={index} className={styles.enterpriseMessage}>
                                                    <div className={styles.msgHeader}>
                                                        <span className={styles.msgSender}>{item.sender}</span>
                                                        <span className={styles.msgTime}>{item.timestamp}</span>
                                                    </div>
                                                    <p className={styles.msgText}>{item.data}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <div className={styles.sidebarFooter}>
                                        <TextField 
                                            fullWidth 
                                            value={message} 
                                            onChange={(e) => setMessage(e.target.value)} 
                                            placeholder="Send a message to everyone" 
                                            variant="outlined"
                                            size="small"
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    color: "white",
                                                    backgroundColor: "rgba(255,255,255,0.05)",
                                                    borderRadius: "8px",
                                                    "& fieldset": { borderColor: "rgba(255,255,255,0.1)" },
                                                }
                                            }}
                                        />
                                        <IconButton onClick={sendMessage} style={{ color: '#FF9839' }}><SendIcon /></IconButton>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bottom Control Bar */}
                    <div className={styles.dashboardControls}>
                        <div className={styles.controlGroup}>
                            <IconButton onClick={handleVideo} className={video ? styles.activeBtn : styles.inactiveBtn}>
                                {video ? <VideocamIcon /> : <VideocamOffIcon />}
                            </IconButton>
                            <IconButton onClick={handleAudio} className={audio ? styles.activeBtn : styles.inactiveBtn}>
                                {audio ? <MicIcon /> : <MicOffIcon />}
                            </IconButton>
                        </div>
                        
                        <div className={styles.controlGroup}>
                            <IconButton onClick={() => setShowReactions(!showReactions)} style={{ color: 'white' }}><EmojiEmotionsIcon /></IconButton>
                            <IconButton onClick={() => setModal(!showModal)} className={showModal ? styles.activeBtn : styles.inactiveBtn}>
                                <ChatIcon />
                            </IconButton>
                        </div>

                        <IconButton onClick={handleEndCall} className={styles.endCallBtn}>
                            <CallEndIcon />
                        </IconButton>
                    </div>
                </div>
            )}
        </div>
    )
}
