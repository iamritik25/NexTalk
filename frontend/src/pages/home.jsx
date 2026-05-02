import React, { useContext, useState, useEffect } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, TextField, IconButton, Tooltip } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import VideocamIcon from '@mui/icons-material/Videocam';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import { AuthContext } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import heroImg from '../assets/saas_hero.png';

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");
    const { addToUserHistory } = useContext(AuthContext);
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) return;
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    const handleNewMeeting = async () => {
        const characters = 'abcdefghijklmnopqrstuvwxyz';
        const generatePart = (length) => Array.from({ length }, () => characters.charAt(Math.floor(Math.random() * characters.length))).join('');
        const newCode = `${generatePart(3)}-${generatePart(4)}-${generatePart(3)}`;
        await addToUserHistory(newCode);
        navigate(`/${newCode}`);
    }

    return (
        <div className="landingPageContainer" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Animated Background Orbs */}
            <div style={{ position: 'fixed', top: '-10%', left: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(255,152,57,0.15) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0 }}></div>
            <div style={{ position: 'fixed', bottom: '-10%', right: '-10%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(255,152,57,0.1) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0 }}></div>

            <nav style={{ padding: '1.5rem 4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(20px)', background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.1)', zIndex: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: '15px' }}>
                    <motion.div initial={{ rotate: -10 }} animate={{ rotate: 0 }} style={{ background: 'var(--primary)', padding: '8px', borderRadius: '12px' }}>
                        <VideocamIcon style={{ color: 'white' }} />
                    </motion.div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-1px' }}>NexTalk <span style={{ color: 'var(--primary)' }}>PRO</span></h2>
                </div>
                
                <div style={{ display: "flex", alignItems: "center", gap: "30px" }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '1.2rem', fontWeight: '700' }}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px' }}>{time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div style={{ height: '30px', width: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <Tooltip title="Meeting History">
                        <IconButton onClick={() => navigate("/history")} style={{ color: "white", background: 'rgba(255,255,255,0.05)' }}><RestoreIcon /></IconButton>
                    </Tooltip>
                    <Button 
                        variant="contained" 
                        onClick={() => { localStorage.removeItem("token"); navigate("/auth") }} 
                        style={{ background: 'rgba(255,255,255,0.1)', borderRadius: '12px', textTransform: 'none', fontWeight: '600', padding: '8px 20px' }}
                    >
                        Sign Out
                    </Button>
                </div>
            </nav>

            <main style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 8rem', zIndex: 1 }}>
                <div style={{ flex: 1.2, maxWidth: '600px' }}>
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <h1 style={{ fontSize: '4.5rem', fontWeight: '800', lineHeight: 1, marginBottom: '2rem', letterSpacing: '-3px' }}>
                            Experience <br/><span style={{ color: 'var(--primary)' }}>Seamless</span> Connection.
                        </h1>
                        <p style={{ fontSize: '1.4rem', color: 'rgba(255,255,255,0.6)', marginBottom: '4rem', maxWidth: '500px' }}>
                            Enterprise-grade video conferencing, now available for everyone. Secure, private, and beautifully simple.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button 
                                    onClick={handleNewMeeting}
                                    variant="contained"
                                    startIcon={<VideocamIcon />}
                                    style={{ background: 'linear-gradient(135deg, #FF9839, #e67e22)', padding: '18px 35px', borderRadius: '16px', fontWeight: '700', textTransform: 'none', fontSize: '1.1rem', boxShadow: '0 15px 30px rgba(255,152,57,0.3)' }}
                                >
                                    New Meeting
                                </Button>
                            </motion.div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '8px 25px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s ease' }} className="input-focus-glow">
                                <KeyboardIcon style={{ color: 'rgba(255,255,255,0.3)' }} />
                                <TextField 
                                    placeholder="Enter meeting code"
                                    variant="standard"
                                    value={meetingCode}
                                    onChange={(e) => setMeetingCode(e.target.value)}
                                    InputProps={{ disableUnderline: true, style: { color: 'white', fontWeight: '500' } }}
                                />
                                <Button 
                                    disabled={!meetingCode.trim()}
                                    onClick={handleJoinVideoCall}
                                    style={{ color: meetingCode.trim() ? '#FF9839' : 'rgba(255,255,255,0.2)', textTransform: 'none', fontWeight: '800', fontSize: '1rem' }}
                                >
                                    Join
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="resin-card"
                        style={{ width: '100%', padding: '0', aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        <motion.img 
                            src={heroImg} 
                            alt="Hero" 
                            animate={{ y: [0, -20, 0] }}
                            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                            style={{ width: '80%', filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.6))' }} 
                        />
                    </motion.div>
                </div>
            </main>
        </div>
    )
}

export default withAuth(HomeComponent)
