import React from 'react'
import "../App.css"
import { Link, useNavigate } from 'react-router-dom'
import Chatbot from '../components/Chatbot';
import heroV2 from "../assets/hero_v2.png";
import { motion } from 'framer-motion';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import GroupsIcon from '@mui/icons-material/Groups';

export default function LandingPage() {
    const router = useNavigate();

    return (
        <div className='landingPageContainer' style={{ height: 'auto', minHeight: '100vh', overflowY: 'auto' }}>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className='navHeader'>
                    <h2>NexTalk</h2>
                </div>
                <div className='navlist' style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
                    <p style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => router("/algs246")}>Features</p>
                    <p style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => router("/algs246")}>Pricing</p>
                    <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }}></div>
                    <p style={{ cursor: 'pointer' }} onClick={() => router("/auth")}>Login</p>
                    <div onClick={() => router("/auth")} role='button' style={{ padding: '0.6rem 1.8rem', borderRadius: '12px' }}>
                        <p style={{ color: "white", fontWeight: '700' }}>Get Started</p>
                    </div>
                </div>
            </motion.nav>

            <div className="landingMainContainer" style={{ paddingTop: '120px', height: 'auto', minHeight: '90vh' }}>
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    style={{ flex: 1 }}
                >
                    <div style={{ background: 'rgba(255,152,57,0.1)', width: 'fit-content', padding: '6px 16px', borderRadius: '20px', border: '1px solid rgba(255,152,57,0.2)', marginBottom: '1.5rem' }}>
                        <span style={{ color: '#FF9839', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>New: Interactive Reactions 👏</span>
                    </div>
                    <h1 style={{ fontSize: '5.5rem', marginBottom: '1.5rem' }}>
                        Video calls for <br/>
                        <span style={{ color: "#FF9839" }}>Modern</span> Teams
                    </h1>
                    <p style={{ fontSize: '1.3rem', color: 'rgba(255,255,255,0.6)', marginBottom: '3rem', maxWidth: '550px', lineHeight: 1.6 }}>
                        Experience crystal-clear audio and ultra-low latency video. NexTalk brings your team together, no matter the distance.
                    </p>
                    
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} role='button' style={{ padding: '1.2rem 2.5rem' }}>
                            <Link to={"/auth"} style={{ textDecoration: 'none', color: 'white', fontWeight: '800', fontSize: '1.1rem' }}>Start Free Meeting</Link>
                        </motion.div>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>No credit card required. <br/>Join over 10,000 teams.</p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}
                >
                    <img src={heroV2} alt="NexTalk Hero" style={{ width: '100%', height: 'auto', maxWidth: '700px', filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.5))' }} />
                </motion.div>
            </div>

            {/* Feature Section */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', padding: '80px 8rem', flexWrap: 'wrap' }}>
                {[
                    { icon: <SecurityIcon />, title: "Enterprise Security", desc: "End-to-end encryption for every single meeting." },
                    { icon: <SpeedIcon />, title: "Low Latency", desc: "Optimized WebRTC stack for real-time interaction." },
                    { icon: <GroupsIcon />, title: "Built for Teams", desc: "Interactive lobbies, reactions, and screen sharing." }
                ].map((feat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="resin-card"
                        style={{ padding: '30px', flex: '1', minWidth: '300px', maxWidth: '400px' }}
                    >
                        <div style={{ background: 'rgba(255,152,57,0.1)', width: 'fit-content', padding: '12px', borderRadius: '12px', color: '#FF9839', marginBottom: '20px' }}>
                            {feat.icon}
                        </div>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '10px' }}>{feat.title}</h3>
                        <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{feat.desc}</p>
                    </motion.div>
                ))}
            </div>

            <Chatbot />
        </div>
    )
}
