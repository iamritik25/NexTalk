import React, { useContext, useState, useEffect } from 'react';
import { Avatar, Button, TextField, Snackbar, Alert, IconButton } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import mascot from '../assets/mascot.png';
import "../App.css";

const Authentication = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [formState, setFormState] = useState(0); // 0: login, 1: register
    const [open, setOpen] = useState(false);

    const { handleRegister, handleLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleAuth = async () => {
        try {
            if (formState === 0) {
                await handleLogin(username, password);
            } else {
                const result = await handleRegister(name, username, password);
                setMessage(result);
                setOpen(true);
                setError("");
                setFormState(0);
                // Trigger celebratory confetti
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#FF9839', '#ffffff', '#ffc107']
                });
            }
        } catch (err) {
            setError(err.response?.data?.message || "An error occurred");
            setOpen(true);
        }
    }

    return (
        <div className="landingPageContainer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="resin-card" style={{ display: 'flex', width: '900px', height: '600px', overflow: 'hidden' }}>
                
                {/* Mascot Side */}
                <div style={{ flex: 1, background: 'rgba(255,152,57,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <motion.img 
                        src={mascot} 
                        alt="Mascot" 
                        animate={{ 
                            y: [0, -20, 0],
                            rotate: [0, 2, -2, 0]
                        }}
                        transition={{ 
                            repeat: Infinity, 
                            duration: 4,
                            ease: "easeInOut"
                        }}
                        style={{ width: '80%', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.3))' }}
                    />
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        key={formState}
                        style={{ position: 'absolute', bottom: '40px', textAlign: 'center', padding: '0 20px' }}
                    >
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '10px' }}>
                            {formState === 0 ? "Welcome Back!" : "Join the Family!"}
                        </h3>
                        <p style={{ color: 'var(--text-dim)' }}>
                            {formState === 0 ? "Ready to start your next conversation?" : "Let's get you set up with a NexTalk account."}
                        </p>
                    </motion.div>
                </div>

                {/* Form Side */}
                <div style={{ flex: 1, padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '30px', background: 'linear-gradient(45deg, #FF9839, #ffc107)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {formState === 0 ? "Login" : "Register"}
                    </h2>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={formState}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {formState === 1 && (
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    variant="outlined"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    sx={{ mb: 2, "& .MuiOutlinedInput-root": { color: 'white', "& fieldset": { borderColor: 'rgba(255,255,255,0.2)' } }, "& .MuiInputLabel-root": { color: 'rgba(255,255,255,0.5)' } }}
                                />
                            )}
                            <TextField
                                fullWidth
                                label="Username"
                                variant="outlined"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                sx={{ mb: 2, "& .MuiOutlinedInput-root": { color: 'white', "& fieldset": { borderColor: 'rgba(255,255,255,0.2)' } }, "& .MuiInputLabel-root": { color: 'rgba(255,255,255,0.5)' } }}
                            />
                            <TextField
                                fullWidth
                                label="Password"
                                type="password"
                                variant="outlined"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ mb: 4, "& .MuiOutlinedInput-root": { color: 'white', "& fieldset": { borderColor: 'rgba(255,255,255,0.2)' } }, "& .MuiInputLabel-root": { color: 'rgba(255,255,255,0.5)' } }}
                            />
                        </motion.div>
                    </AnimatePresence>

                    <Button 
                        fullWidth 
                        variant="contained" 
                        onClick={handleAuth}
                        sx={{ 
                            py: 1.5, 
                            borderRadius: '12px', 
                            background: 'linear-gradient(135deg, #FF9839, #e67e22)',
                            boxShadow: '0 10px 20px rgba(255,152,57,0.3)',
                            fontWeight: '700',
                            fontSize: '1.1rem'
                        }}
                    >
                        {formState === 0 ? "Sign In" : "Create Account"}
                    </Button>

                    <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-dim)' }}>
                        {formState === 0 ? "Don't have an account? " : "Already have an account? "}
                        <span 
                            onClick={() => setFormState(formState === 0 ? 1 : 0)}
                            style={{ color: '#FF9839', fontWeight: '700', cursor: 'pointer', marginLeft: '5px' }}
                        >
                            {formState === 0 ? "Register" : "Login"}
                        </span>
                    </p>
                </div>
            </div>

            <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)}>
                <Alert onClose={() => setOpen(false)} severity={error ? "error" : "success"} variant="filled">
                    {error || message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Authentication;
