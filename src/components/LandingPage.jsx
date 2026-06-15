import React, { useState, useEffect, useRef } from "react";
import Footer from "./Footer";
import { GraduationCap, Zap, Globe, ThumbsUp, Users, BookOpen, BarChart2, ClipboardList, Award, CheckCircle, Menu, X, Mail, Phone, Star, UserCheck, School, FileText, TrendingUp, Lock, Clock, } from "lucide-react";
const IconTwitter = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>);
const IconLinkedin = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>);
const IconFacebook = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>);
const IconYoutube = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>);
const socialIcons = [
    <IconTwitter key="t"/>,
    <IconLinkedin key="l"/>,
    <IconFacebook key="f"/>,
    <IconYoutube key="y"/>,
];
const G = "#fbd057"; 
const G2 = "#fde399"; 
const GL = "#fde399"; 
const GD = "#f2c343"; 
const GDD = "#1e272c"; 
const GT = "#1e272c"; 
function useScrollY() {
    const [y, setY] = useState(0);
    useEffect(() => {
        const h = () => setY(window.scrollY);
        window.addEventListener("scroll", h, { passive: true });
        return () => window.removeEventListener("scroll", h);
    }, []);
    return y;
}
function useInView(threshold = 0.12) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting)
                setVisible(true);
        }, { threshold });
        if (ref.current)
            obs.observe(ref.current);
        return () => obs.disconnect();
    }, [threshold]);
    return [ref, visible];
}
const fadeUp = (visible, delay = 0) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(28px)",
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
});
function Navbar({ onNavigateLogin }) {
    const y = useScrollY();
    const [open, setOpen] = useState(false);
    const sticky = y > 20;
    const links = [
        { label: "Accueil", href: "#accueil" },
        { label: "Fonctionnalités", href: "#fonctionnalites" },
        { label: "À propos", href: "#apropos" },
        { label: "Support", href: "#contact" },
    ];
    return (<nav style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            background: sticky ? "rgba(255,255,255,0.97)" : "rgba(255,255,255,0)",
            boxShadow: sticky ? "0 1px 28px rgba(0,0,0,0.08)" : "none",
            backdropFilter: sticky ? "blur(14px)" : "none",
            transition: "all 0.3s ease",
        }}>
      <div style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "40px 24px",
            display: "flex",
            alignItems: "center",
            height: 58,
        }}>
        <a href="#" style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            marginRight: "auto",
        }}>
          <div>
            <div style={{
            fontWeight: 800,
            fontSize: 17,
            color: GDD,
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
        }}>
              Quiz<span style={{ color: GD }}>Tech</span>
            </div>
          </div>
        </a>

        <div className="ht-desktop-nav" style={{ display: "flex", gap: 32, marginRight: 32 }}>
          {links.map((l) => (<a key={l.label} href={l.href} style={{
                fontSize: 14,
                fontWeight: 500,
                color: "#374151",
                textDecoration: "none",
                transition: "color 0.2s",
            }} onMouseEnter={(e) => {
                e.target.style.color = GD;
            }} onMouseLeave={(e) => {
                e.target.style.color = "#374151";
            }}>
              {l.label}
            </a>))}
        </div>

        <div className="ht-desktop-nav" style={{ display: "flex", gap: 10 }}>
          <button onClick={onNavigateLogin} className="cursor-pointer" style={{
            padding: "5px 15px",
            borderRadius: 10,
            border: `1.5px solid ${G}`,
            background: "transparent",
            color: GDD,
            fontWeight: 600,
            fontSize: 14,
            transition: "all 0.2s",
        }} onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(253, 227, 153, 0.3)";
        }} onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
        }}>
            Connexion
          </button>
        </div>

        <button className="ht-mobile-btn" onClick={() => setOpen(!open)} style={{
            display: "none",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 4,
        }}>
          {open ? (<X size={24} color="#374151"/>) : (<Menu size={24} color="#374151"/>)}
        </button>
      </div>

      {open && (<div style={{
                background: "#fff",
                borderTop: "1px solid #f1f5f9",
                padding: "16px 24px 24px",
            }}>
          {links.map((l) => (<a key={l.label} href={l.href} onClick={() => setOpen(false)} style={{
                    display: "block",
                    padding: "12px 0",
                    fontWeight: 500,
                    color: "#374151",
                    textDecoration: "none",
                    borderBottom: "1px solid #f8fafc",
                }}>
              {l.label}
            </a>))}
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button onClick={() => {
                setOpen(false);
                onNavigateLogin();
            }} style={{
                flex: 1,
                padding: "11px",
                borderRadius: 10,
                border: `1.5px solid ${G}`,
                background: "transparent",
                color: GDD,
                fontWeight: 600,
                cursor: "pointer",
            }}>
              Connexion
            </button>
          </div>
        </div>)}
    </nav>);
}

function HeroIllustration() {
    return (<div style={{
            position: "relative",
            width: "100%",
            maxWidth: "520px",
            margin: "0 auto",
            paddingBottom: 60,
        }}>
      <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }}>
        <path d="M 250,60 C 370,60 440,130 440,250 C 440,370 350,440 250,440 C 120,440 60,350 60,250 C 60,110 130,60 250,60 Z" fill="#FBD057"/>

        <ellipse cx="250" cy="445" rx="210" ry="8" fill="#FBD057"/>

        <circle cx="130" cy="130" r="32" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2.5"/>
        <rect x="110" y="112" width="40" height="30" rx="4" fill="#FBD057" stroke="#1E272C" strokeWidth="2"/>
        <text x="117" y="133" fill="#1E272C" fontSize="15" fontWeight="bold">
          x/ـ
        </text>

        <circle cx="225" cy="80" r="22" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2.5"/>
        <circle cx="225" cy="80" r="14" stroke="#1E272C" strokeWidth="2" fill="#FBD057"/>
        <path d="M225 73 v7 h5" stroke="#1E272C" strokeWidth="2" strokeLinecap="round"/>
        <path d="M225 54 v4 M225 102 v-4 M203 80 h4 M247 80 h-4" stroke="#1E272C" strokeWidth="2" strokeLinecap="round"/>

        <circle cx="330" cy="120" r="32" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2.5"/>
        <rect x="305" y="105" width="50" height="24" rx="4" fill="#FBD057" stroke="#1E272C" strokeWidth="2"/>
        <text x="311" y="122" fill="#1E272C" fontFamily="monospace" fontSize="12" fontWeight="bold">
          01101
        </text>

        <circle cx="385" cy="215" r="20" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2"/>
        <polygon points="385,200 398,208 398,222 385,230 372,222 372,208" fill="#FBD057" stroke="#1E272C" strokeWidth="1.5"/>
        <line x1="385" y1="215" x2="385" y2="230" stroke="#1E272C" strokeWidth="1.5"/>
        <line x1="385" y1="215" x2="398" y2="208" stroke="#1E272C" strokeWidth="1.5"/>
        <line x1="385" y1="215" x2="372" y2="208" stroke="#1E272C" strokeWidth="1.5"/>

        <path d="M235 185 h6 M238 182 v6" stroke="#1E272C" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M370 165 h6 M373 162 v6" stroke="#1E272C" strokeWidth="1.5" strokeLinecap="round"/>
        <text x="260" y="115" fill="#1E272C" fontSize="12" fontWeight="bold">
          z
        </text>

        <g transform="translate(80, 210)">
          <path d="M20 35 C5 15 5 0 5 0 C5 0 20 15 20 35 Z" fill="#FDE399" stroke="#1E272C" strokeWidth="2"/>
          <path d="M20 35 C35 15 35 0 35 0 C35 0 20 15 20 35 Z" fill="#FDE399" stroke="#1E272C" strokeWidth="2"/>
          <path d="M20 35 C20 10 20 -5 20 -5 C20 -5 20 10 20 35 Z" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2"/>
          <rect x="10" y="35" width="20" height="20" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2"/>
        </g>

        <g transform="translate(45, 327)">
          <path d="M35 80 C10 40 5 10 5 10 C5 10 30 35 35 80 Z" fill="#FBD057" stroke="#1E272C" strokeWidth="2.5"/>
          <path d="M35 80 C60 40 65 10 65 10 C65 10 40 35 35 80 Z" fill="#FBD057" stroke="#1E272C" strokeWidth="2.5"/>
          <path d="M35 80 C35 30 35 0 35 0 C35 0 35 30 35 80 Z" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2.5"/>
          <polygon points="15,80 55,80 48,120 22,120" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2.5"/>
        </g>

        <g transform="translate(140, 205)">
          <path d="M10 5 C10 5 0 55 5 125 L35 125 C30 55 20 5 20 5 Z" fill="#1E272C" stroke="#1E272C" strokeWidth="2"/>
          <rect x="15" y="125" width="65" height="10" rx="3" fill="#1E272C"/>
          <path d="M48 135 v50 L5 215 M48 165 L90 215" stroke="#1E272C" strokeWidth="4" strokeLinecap="round"/>
          <circle cx="5" cy="215" r="6" fill="#1E272C"/>
          <circle cx="48" cy="217" r="6" fill="#1E272C"/>
          <circle cx="90" cy="215" r="6" fill="#1E272C"/>
        </g>

        <g id="student">
          <path d="M150 250 C180 210 240 210 265 250 L240 330 L165 330 Z" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2.5"/>

          <path d="M210 210 v15 h10 v-15 Z" fill="#FDE399" stroke="#1E272C" strokeWidth="2"/>
          <circle cx="225" cy="180" r="18" fill="#FDE399" stroke="#1E272C" strokeWidth="2.5"/>
          <path d="M210 172 C205 150 245 150 245 168 C245 172 235 175 210 172 Z" fill="#1E272C"/>
          <circle cx="232" cy="178" r="1.5" fill="#1E272C"/>
          <path d="M228 186 Q232 190 235 185" stroke="#1E272C" strokeWidth="1.5" strokeLinecap="round" fill="none"/>

          <path d="M170 325 C170 325 165 375 235 375 L255 420 L285 420 L270 365 C260 330 240 325 240 325 Z" fill="#FBD057" stroke="#1E272C" strokeWidth="2.5"/>
          <path d="M170 325 Q230 310 280 370 L305 415 L335 415 L295 330" stroke="#1E272C" strokeWidth="2.5" fill="none" strokeLinejoin="round"/>

          <path d="M155 255 Q210 270 245 270" stroke="#1E272C" strokeWidth="12" strokeLinecap="round" fill="none"/>
          <path d="M240 270 L250 273" stroke="#FDE399" strokeWidth="8" strokeLinecap="round"/>

          <rect x="230" y="420" width="40" height="14" rx="4" fill="#1E272C"/>
          <rect x="290" y="415" width="40" height="14" rx="4" fill="#1E272C"/>
          <rect x="235" y="420" width="15" height="4" fill="#FFFFFF"/>
          <rect x="295" y="415" width="15" height="4" fill="#FFFFFF"/>
        </g>

        <g transform="translate(250, 245)">
          <polygon points="5,5 72,-5 60,55 -2,60" fill="#FFFFFF" stroke="#1E272C" strokeWidth="3"/>
          <polygon points="10,8 67,-1 56,51 3,55" fill="#FDE399" opacity="0.3"/>
          <path d="M68 25 L80 50" stroke="#1E272C" strokeWidth="2.5"/>
        </g>

        <g id="desk">
          <rect x="60" y="275" width="355" height="8" rx="2" fill="#FBD057" stroke="#1E272C" strokeWidth="2.5"/>
          <path d="M85 283 L60 440 M355 283 L380 440" stroke="#1E272C" strokeWidth="4.5" strokeLinecap="round"/>
          <path d="M125 283 L125 330 M335 283 L345 360" stroke="#1E272C" strokeWidth="3" strokeLinecap="round"/>
        </g>

        <g transform="translate(325, 335)">
          <path d="M10 30 C10 10 30 0 50 0 C70 0 90 10 90 30 L95 85 C95 95 85 100 50 100 C15 100 5 95 5 85 Z" fill="#FBD057" stroke="#1E272C" strokeWidth="3" strokeLinejoin="round"/>
          <path d="M12 50 C12 45 25 40 50 40 C75 40 88 45 88 50 L85 85 C85 92 75 95 50 95 C25 95 15 92 15 85 Z" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2.5"/>
          <path d="M38 0 C38 -8 62 -8 62 0" stroke="#1E272C" strokeWidth="2.5" fill="none"/>
          <rect x="44" y="65" width="12" height="12" rx="2" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2"/>
          <line x1="50" y1="65" x2="50" y2="77" stroke="#1E272C" strokeWidth="1.5"/>
        </g>
      </svg>
    </div>);
}
function FeatureCard({ icon, title, points, delay, visible }) {
    const [hov, setHov] = useState(false);
    return (<div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
            ...fadeUp(visible, delay),
            background: hov ? "rgba(253, 227, 153, 0.15)" : "#fff",
            border: hov ? `1.5px solid ${G}` : "1.5px solid #f1f5f9",
            borderRadius: 20,
            padding: "28px 22px",
            boxShadow: hov
                ? `0 16px 48px rgba(251,208,87,0.15)`
                : "0 2px 16px rgba(0,0,0,0.05)",
            transition: "all 0.3s ease",
            transform: hov
                ? "translateY(-5px)"
                : visible
                    ? "translateY(0)"
                    : "translateY(28px)",
        }}>
      <div style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: hov ? `${G}33` : "rgba(253, 227, 153, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 18,
        }}>
        {icon}
      </div>
      <h3 style={{
            fontWeight: 700,
            fontSize: 16,
            color: "#0f172a",
            marginBottom: 14,
        }}>
        {title}
      </h3>
      {points.map((p, i) => (<div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 9,
            }}>
          <CheckCircle size={14} color={GD}/>
          <span style={{ fontSize: 13, color: "#64748b" }}>{p}</span>
        </div>))}
    </div>);
}
function StepCard({ num, icon, title, desc, visible, delay }) {
    return (<div style={{ ...fadeUp(visible, delay), textAlign: "center" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <div style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#0f172b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
            boxShadow: `0 8px 24px rgba(30,39,44,0.25)`,
        }}>
          {icon}
        </div>
        <div style={{
            position: "absolute",
            top: -6,
            right: -6,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: G,
            color: GDD,
            fontWeight: 800,
            fontSize: 11,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        }}>
          {num}
        </div>
      </div>
      <h3 style={{
            fontWeight: 700,
            fontSize: 15,
            color: "#0f172a",
            marginBottom: 8,
        }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65 }}>{desc}</p>
    </div>);
}
function ManagementCard({ icon, title, desc, visible, delay }) {
    const [hov, setHov] = useState(false);
    return (<div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
            ...fadeUp(visible, delay),
            background: "#fff",
            borderRadius: 18,
            padding: "22px 20px",
            border: hov ? `1.5px solid ${G}` : "1.5px solid #f1f5f9",
            boxShadow: hov
                ? `0 12px 36px rgba(251,208,87,0.12)`
                : "0 2px 12px rgba(0,0,0,0.04)",
            transition: "all 0.3s ease",
            transform: hov
                ? "translateY(-3px)"
                : visible
                    ? "translateY(0)"
                    : "translateY(28px)",
            display: "flex",
            alignItems: "flex-start",
            gap: 16,
        }}>
      <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: hov ? `${G}22` : "rgba(253, 227, 153, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
        }}>
        {icon}
      </div>
      <div>
        <h4 style={{
            fontWeight: 700,
            fontSize: 14,
            color: "#0f172a",
            marginBottom: 6,
        }}>
          {title}
        </h4>
        <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.55 }}>
          {desc}
        </p>
      </div>
    </div>);
}
function StatCard({ num, label, icon, visible, delay }) {
    return (<div style={{ ...fadeUp(visible, delay), textAlign: "center" }}>
      <div style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: "rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 14px",
            border: "1.5px solid rgba(255,255,255,0.2)",
        }}>
        {icon}
      </div>
      <div style={{
            fontWeight: 800,
            fontSize: 38,
            color: "#fff",
            letterSpacing: "-1px",
            lineHeight: 1,
        }}>
        {num}
      </div>
      <div style={{
            fontSize: 13,
            color: "rgba(255,255,255,0.85)",
            marginTop: 7,
            fontWeight: 500,
        }}>
        {label}
      </div>
    </div>);
}
function TestimonialCard({ name, role, text, rating, visible, delay }) {
    return (<div style={{
            ...fadeUp(visible, delay),
            background: "#fff",
            borderRadius: 20,
            padding: "28px 24px",
            border: "1.5px solid #f1f5f9",
            boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
        }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
        {[...Array(rating)].map((_, i) => (<Star key={i} size={14} fill="#f2c343" color="#f2c343"/>))}
      </div>
      <p style={{
            fontSize: 14,
            color: "#374151",
            lineHeight: 1.75,
            marginBottom: 20,
            fontStyle: "italic",
        }}>
        "{text}"
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "#0f172b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 4px 12px rgba(30,39,44,0.2)`,
        }}>
          <span style={{ fontWeight: 800, fontSize: 16, color: "#fff" }}>
            {name[0]}
          </span>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>
            {name}
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>{role}</div>
        </div>
      </div>
    </div>);
}

export default function LandingPage({ onNavigateLogin, onExplorePlatforms }) {
    const [heroRef, heroVis] = useInView(0.08);
    const [featRef, featVis] = useInView(0.08);
    const [stepsRef, stepsVis] = useInView(0.08);
    const [mgmtRef, mgmtVis] = useInView(0.08);
    const [aboutRef, aboutVis] = useInView(0.08);
    const [statsRef, statsVis] = useInView(0.08);
    const [testiRef, testiVis] = useInView(0.08);
    const [contactRef, contactVis] = useInView(0.08);
    const features = [
        {
            icon: <Lock size={22} color={GDD}/>,
            title: "Accès sécurisé HighTech",
            points: [
                "Connexion @hightech.edu uniquement",
                "Rôles Étudiant / Enseignant / Admin",
                "Sessions chiffrées et sécurisées",
            ],
        },
        {
            icon: <Zap size={22} color={GDD}/>,
            title: "Résultats instantanés",
            points: [
                "Correction automatique en temps réel",
                "Notes disponibles immédiatement",
                "Feedback personnalisé par enseignant",
            ],
        },
        {
            icon: <Globe size={22} color={GDD}/>,
            title: "Accessible sur campus",
            points: [
                "Compatible PC, tablette et mobile",
                "Accès depuis le réseau HighTech",
                "Pas de logiciel à installer",
            ],
        },
        {
            icon: <ThumbsUp size={22} color={GDD}/>,
            title: "Simple à utiliser",
            points: [
                "Interface pensée pour HighTech",
                "Prise en main en 2 minutes",
                "Support d'assistance de l'administration",
            ],
        },
    ];
    const steps = [
        {
            icon: <FileText size={26} color="#fff"/>,
            title: "Créer l'examen",
            desc: "L'enseignant HighTech crée et configure l'examen depuis son espace dédié.",
        },
        {
            icon: <Users size={26} color="#fff"/>,
            title: "Assigner la classe",
            desc: "L'examen est automatiquement assigné aux étudiants de la classe HighTech concernée.",
        },
        {
            icon: <BookOpen size={26} color="#fff"/>,
            title: "Passer l'examen",
            desc: "L'étudiant HighTech passe l'examen en ligne, depuis n'importe quel appareil autorisé.",
        },
        {
            icon: <BarChart2 size={26} color="#fff"/>,
            title: "Consulter les résultats",
            desc: "Les notes sont disponibles immédiatement dans l'espace étudiant HighTech.",
        },
    ];
    const mgmtCards = [
        {
            icon: <Users size={19} color={GDD}/>,
            title: "Étudiants HighTech School",
            desc: "Gérez les comptes, inscriptions et parcours de chaque étudiant de l'école.",
        },
        {
            icon: <UserCheck size={19} color={GDD}/>,
            title: "Enseignants HighTech School",
            desc: "Créez et gerez les accès enseignants avec droits de création d'examens.",
        },
        {
            icon: <School size={19} color={GDD}/>,
            title: "Classes HighTech School",
            desc: "Organisez les promotions et groupes de HighTech School par filière et niveau.",
        },
        {
            icon: <ClipboardList size={19} color={GDD}/>,
            title: "Examens HighTech School",
            desc: "Planifiez, publiez et archivez tous les examens officiels de l'école.",
        },
        {
            icon: <Award size={19} color={GDD}/>,
            title: "Résultats HighTech School",
            desc: "Consultez, exportez et partagez les bulletins de notes des étudiants.",
        },
        {
            icon: <TrendingUp size={19} color={GDD}/>,
            title: "Statistiques & Rapports",
            desc: "Tableaux de bord de performance globale de HighTech School.",
        },
    ];
    const testimonials = [
        {
            name: "Youssef El Amrani",
            role: "Etudiant - HighTech School",
            text: "QuizTech m'a simplifié la vie. Je consulte mes examens et mes notes directement depuis mon téléphone. L'interface est claire et les résultats sont immédiats. Vraiment top !",
            rating: 5,
        },
        {
            name: "Fatima Zahra Idrissi",
            role: "Enseignant - HighTech School",
            text: "Je crée mes examens en quelques minutes et la correction automatique me fait gagner des heures. La plateforme est parfaitement adaptée aux besoins de notre école.",
            rating: 5,
        },
        {
            name: "Yassmine Chraibi",
            role: "Administrateur - HighTech School",
            text: "Depuis l'adoption de QuizTech, notre administration a gagné en efficacée. Le suivi des résultats et des promotions est désormais centralisé et fiable.",
            rating: 5,
        },
    ];
    return (<div className="w-full">
      <style>{`
        @keyframes htFloat0 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes htFloat1 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes htFloat2 { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

        @media (max-width: 900px) {
          .ht-desktop-nav { display: none !important; }
          .ht-mobile-btn  { display: block !important; }
          .ht-hero-grid   { flex-direction: column !important; }
          .ht-feat-grid   { grid-template-columns: 1fr 1fr !important; }
          .ht-steps-grid  { grid-template-columns: 1fr 1fr !important; }
          .ht-mgmt-grid   { grid-template-columns: 1fr 1fr !important; }
          .ht-stats-grid  { grid-template-columns: 1fr 1fr !important; }
          .ht-testi-grid  { grid-template-columns: 1fr !important; }
          .ht-footer-grid { grid-template-columns: 1fr 1fr !important; }
          .ht-contact-col { grid-template-columns: 1fr !important; }
          .ht-about-wrap  { flex-direction: column !important; }
        }
        @media (max-width: 540px) {
          .ht-feat-grid  { grid-template-columns: 1fr !important; }
          .ht-steps-grid { grid-template-columns: 1fr !important; }
          .ht-mgmt-grid  { grid-template-columns: 1fr !important; }
        }
        textarea:focus { border-color: #fbd057 !important; outline: none; }
      `}</style>

      <Navbar onNavigateLogin={onNavigateLogin}/>

{/* Hero-Section */}
      <section id="accueil" ref={heroRef} style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            background: `linear-gradient(150deg, rgba(253, 227, 153, 0.25) 0%, #ffffff 55%, #f8fafc 100%)`,
            paddingTop: 75,
            overflow: "hidden",
            position: "relative",
        }}>
        <div style={{
            position: "absolute",
            top: -100,
            left: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(251,208,87,0.08) 0%, transparent 70%)`,
            pointerEvents: "none",
        }}/>
        <div style={{
            position: "absolute",
            bottom: -80,
            right: -80,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(30,39,44,0.04) 0%, transparent 70%)",
            pointerEvents: "none",
        }}/>

        <div style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "60px 24px",
            width: "100%",
        }}>
          <div className="ht-hero-grid" style={{ display: "flex", alignItems: "center", gap: 60 }}>
            
            <div style={{ flex: 1, minWidth: 0 }}>
            
              <h1 style={{
            ...fadeUp(heroVis, 0.1),
            fontWeight: 800,
            fontSize: "clamp(30px,5vw,56px)",
            color: "#0f172a",
            lineHeight: 1.13,
            letterSpacing: "-1.5px",
            marginBottom: 22,
        }}>
                Plateforme d'examens{" "}
                <span style={{
            color: GD,
            position: "relative",
            display: "inline-block",
        }}>
                  officielle
                  <svg style={{
            position: "absolute",
            bottom: -4,
            left: 0,
            width: "100%",
            overflow: "visible",
        }} height="8" viewBox="0 0 200 8" preserveAspectRatio="none">
                    <path d="M0 6 Q50 2 100 6 Q150 10 200 6" stroke={G} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.55"/>
                  </svg>
                </span>{" "}
                de HighTech School
              </h1>

              <p style={{
            ...fadeUp(heroVis, 0.2),
            fontSize: 16,
            color: "#64748b",
            lineHeight: 1.8,
            maxWidth: 500,
            marginBottom: 36,
        }}>
                QuizTech est la solution exclusive de HighTech School pour la
                création, la gestion et la correction des examens — réservée aux
                étudiants, enseignants et administration de l'école.
              </p>

             
              <div style={{
            ...fadeUp(heroVis, 0.3),
            display: "flex",
            gap: 14,
            flexWrap: "wrap",
            marginBottom: 44,
        }}>
                <button onClick={onNavigateLogin} className="cursor-pointer" style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 26px",
            borderRadius: 14,
            border: "none",
            background: GDD,
            color: "#fff",
            fontWeight: 705,
            fontSize: 15,
            boxShadow: `0 6px 24px rgba(30,39,44,0.3)`,
            transition: "all 0.25s",
        }} onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `0 10px 30px rgba(30,39,44,0.35)`;
        }} onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
            e.currentTarget.style.boxShadow = `0 6px 24px rgba(30,39,44,0.3)`;
        }}>
                  <UserCheck size={17}/> Se connecter
                </button>
                <button onClick={() => document.getElementById("apropos")?.scrollIntoView({ behavior: "smooth" })} className="cursor-pointer" style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "14px 26px",
            borderRadius: 14,
            border: "1.5px solid #e2e8f0",
            background: "#fff",
            color: "#374151",
            fontWeight: 600,
            fontSize: 15,
            transition: "all 0.25s",
        }} onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = G;
            e.currentTarget.style.color = GDD;
        }} onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.color = "#374151";
        }}>
                  <GraduationCap size={17}/> Découvrir la plateforme
                </button>
              </div>
            </div>

           
            <div style={{
            ...fadeUp(heroVis, 0.15),
            flex: 1,
            minWidth: 280,
            maxWidth: 500,
        }}>
              <HeroIllustration />
            </div>
          </div>
        </div>
      </section>


{/* Features-Section */}
      <section id="fonctionnalites" ref={featRef} style={{ padding: "100px 24px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{
            ...fadeUp(featVis, 0),
            textAlign: "center",
            marginBottom: 60,
        }}>
            <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: GD,
            textTransform: "uppercase",
            letterSpacing: 2,
        }}>
              Pourquoi HighTech School a choisi QuizTech
            </span>
            <h2 style={{
            fontWeight: 800,
            fontSize: "clamp(26px,4vw,42px)",
            color: "#0f172a",
            marginTop: 12,
            letterSpacing: "-0.5px",
        }}>
              Conçu <span style={{ color: GD }}>exclusivement</span> pour
              HighTech School
            </h2>
            <p style={{
            fontSize: 15,
            color: "#64748b",
            maxWidth: 520,
            margin: "14px auto 0",
            lineHeight: 1.75,
        }}>
              Chaque fonctionnalité est pensée pour les besoins spécifiques de
              notre école.
            </p>
          </div>
          <div className="ht-feat-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 20,
        }}>
            {features.map((f, i) => (<FeatureCard key={i} {...f} visible={featVis} delay={0.1 + i * 0.09}/>))}
          </div>
        </div>
      </section>

{/* Commentçafonctionne-Section */}
      <section ref={stepsRef} style={{ padding: "100px 24px", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            ...fadeUp(stepsVis, 0),
            textAlign: "center",
            marginBottom: 72,
        }}>
            <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: GD,
            textTransform: "uppercase",
            letterSpacing: 2,
        }}>
              Processus HighTech
            </span>
            <h2 style={{
            fontWeight: 800,
            fontSize: "clamp(26px,4vw,42px)",
            color: "#0f172a",
            marginTop: 12,
            letterSpacing: "-0.5px",
        }}>
              Comment <span style={{ color: GD }}>ça fonctionne</span> ?
            </h2>
          </div>
          <div style={{ position: "relative" }}>
            <div className="ht-desktop-nav" style={{
            position: "absolute",
            top: 36,
            left: "12.5%",
            right: "12.5%",
            height: 2,
            background: `linear-gradient(90deg, rgba(251,208,87,0.2), ${G}, rgba(251,208,87,0.2))`,
            borderRadius: 2,
            zIndex: 0,
        }}/>
            <div className="ht-steps-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 32,
            position: "relative",
            zIndex: 1,
        }}>
              {steps.map((s, i) => (<StepCard key={i} num={i + 1} {...s} visible={stepsVis} delay={0.1 + i * 0.11}/>))}
            </div>
          </div>
        </div>
      </section>

      <section ref={mgmtRef} style={{
            padding: "100px 24px",
            background: `linear-gradient(160deg, rgba(253, 227, 153, 0.2), #f8fafc)`,
        }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{
            ...fadeUp(mgmtVis, 0),
            textAlign: "center",
            marginBottom: 60,
        }}>
            <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: GD,
            textTransform: "uppercase",
            letterSpacing: 2,
        }}>
              Administration HighTech
            </span>
            <h2 style={{
            fontWeight: 800,
            fontSize: "clamp(26px,4vw,42px)",
            color: "#0f172a",
            marginTop: 12,
            letterSpacing: "-0.5px",
        }}>
              Tout ce dont <span style={{ color: GD }}>HighTech School</span> a
              besoin
            </h2>
            <p style={{
            fontSize: 15,
            color: "#64748b",
            maxWidth: 500,
            margin: "14px auto 0",
            lineHeight: 1.75,
        }}>
              Une plateforme complète pour digitaliser l'ensemble du système
              d'évaluation de l'école.
            </p>
          </div>
          <div className="ht-mgmt-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 16,
        }}>
            {mgmtCards.map((c, i) => (<ManagementCard key={i} {...c} visible={mgmtVis} delay={0.07 + i * 0.07}/>))}
          </div>
        </div>
      </section>

{/* About-Section */}
      <section id="apropos" ref={aboutRef} style={{ padding: "100px 24px", background: "#fff" }}>
        <div className="ht-about-wrap" style={{
            maxWidth: 1100,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            gap: 72,
            flexWrap: "wrap",
        }}>
          {/* Visual */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{
            ...fadeUp(aboutVis, 0),
            width: "100%",
            aspectRatio: "4/3",
            borderRadius: 24,
            background: `linear-gradient(135deg, rgba(253,227,153,0.15), rgba(253,227,153,0.5))`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
        }}>
              <svg width="180" height="150" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 12 36 L 60 10 L 108 36" stroke={GD} strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <path d="M 20 38 Q 60 22 100 38" stroke={GD} strokeWidth="4" strokeLinecap="round" fill="none"/>

                <text x="60" y="58" textAnchor="middle" fill={GD} fontSize="20" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.2">
                  HIGH-TECH
                </text>

                <line x1="12" y1="65" x2="108" y2="65" stroke={GD} strokeWidth="2"/>

                <text x="60" y="73" textAnchor="middle" fill={GD} fontSize="5" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.1">
                  ECOLES D'ENSEIGNEMENT SUPÉRIEUR
                </text>

                <rect x="12" y="78" width="96" height="14" rx="2" fill="#E11D48"/>
                <text x="60" y="88" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.3">
                  RECONNUE PAR L'ÉTAT
                </text>
              </svg>

              {[
            {
                icon: <TrendingUp size={15} color={GDD}/>,
                text: "+60% engagement utilisateur",
                pos: { top: 20, right: 20 },
            },
            {
                icon: <Lock size={15} color={GDD}/>,
                text: "Sécurité niveau institutionnel",
                pos: { bottom: 20, left: 20 },
            },
        ].map(({ icon, text, pos }) => (<div key={text} style={{
                position: "absolute",
                top: pos.top !== undefined ? pos.top : "auto",
                bottom: pos.bottom !== undefined ? pos.bottom : "auto",
                left: pos.left !== undefined ? pos.left : "auto",
                right: pos.right !== undefined ? pos.right : "auto",
                background: "#fff",
                borderRadius: 14,
                padding: "10px 16px",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                display: "flex",
                alignItems: "center",
                gap: 8,
            }}>
                  {icon}
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#0f172a" }}>
                    {text}
                  </span>
                </div>))}
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={fadeUp(aboutVis, 0.12)}>
              <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: GD,
            textTransform: "uppercase",
            letterSpacing: 2,
        }}>
                À propos de la plateforme
              </span>

              <h2 style={{
            fontWeight: 800,
            fontSize: "clamp(24px,3.5vw,38px)",
            color: "#0f172a",
            marginTop: 10,
            marginBottom: 20,
            letterSpacing: "-0.5px",
            lineHeight: 1.18,
        }}>
                Découvrez <span style={{ color: GD }}>QuizTech</span>
              </h2>

              <p style={{
            fontSize: 15,
            color: "#64748b",
            lineHeight: 1.82,
            marginBottom: 22,
        }}>
                QuizTech est une plateforme moderne de gestion d’examens en
                ligne conçue pour simplifier la création, la distribution et la
                correction des évaluations dans un environnement 100% digital et
                sécurisé.
              </p>

              <p style={{
            fontSize: 15,
            color: "#64748b",
            lineHeight: 1.82,
            marginBottom: 32,
        }}>
                Elle permet aux enseignants de créer des examens en quelques
                clics, aux étudiants de passer leurs tests en ligne avec un
                système de minuterie intelligent, et aux administrateurs de
                suivre les performances en temps réel.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
            [
                "Plateforme tout-en-un",
                "Création, passage et correction des examens centralisés",
            ],
            [
                "Expérience fluide",
                "Interface rapide, moderne et adaptée à tous les appareils",
            ],
            [
                "Données en temps réel",
                "Résultats et analytics instantanés pour meilleure décision",
            ],
        ].map(([t, d]) => (<div key={t} style={{ display: "flex", gap: 14 }}>
                    <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: G2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                      <CheckCircle size={17} color={GD}/>
                    </div>

                    <div>
                      <div style={{
                fontWeight: 700,
                fontSize: 14,
                color: "#0f172a",
            }}>
                        {t}
                      </div>
                      <div style={{ fontSize: 13, color: "#64748b" }}>{d}</div>
                    </div>
                  </div>))}
              </div>
            </div>
          </div>
        </div>
      </section>

{/* Stats-Section */}
      <section ref={statsRef} style={{
            padding: "80px 24px",
            background: `linear-gradient(135deg, ${GD}, ${G})`,
            position: "relative",
            overflow: "hidden",
        }}>
        <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.09) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 50%)",
            pointerEvents: "none",
        }}/>
        <div style={{
            maxWidth: 900,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
        }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{
            fontWeight: 800,
            fontSize: "clamp(22px,3vw,34px)",
            color: "#fff",
            letterSpacing: "-0.5px",
        }}>
              HighTech School en chiffres
            </h2>
          </div>
          <div className="ht-stats-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 32,
            textAlign: "center",
        }}>
            {[
            {
                num: "1350+",
                label: "Étudiants HighTech",
                icon: <Users size={22} color="rgba(255,255,255,0.85)"/>,
            },
            {
                num: "45+",
                label: "Enseignants",
                icon: <UserCheck size={22} color="rgba(255,255,255,0.85)"/>,
            },
            {
                num: "6",
                label: "Filières disponibles",
                icon: <School size={22} color="rgba(255,255,255,0.85)"/>,
            },
            {
                num: "100%",
                label: "Examens digitalisés",
                icon: (<ClipboardList size={22} color="rgba(255,255,255,0.85)"/>),
            },
        ].map((s, i) => (<StatCard key={i} num={s.num} label={s.label} icon={s.icon} visible={statsRef !== null && statsVis} delay={i * 0.1}/>))}
          </div>
        </div>
      </section>

{/* Testimonials-Section */}
      <section ref={testiRef} style={{ padding: "100px 24px", background: "#f8fafc" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{
            ...fadeUp(testiVis, 0),
            textAlign: "center",
            marginBottom: 60,
        }}>
            <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: GD,
            textTransform: "uppercase",
            letterSpacing: 2,
        }}>
              Témoignages HighTech School
            </span>
            <h2 style={{
            fontWeight: 800,
            fontSize: "clamp(26px,4vw,42px)",
            color: "#0f172a",
            marginTop: 12,
            letterSpacing: "-0.5px",
        }}>
              Ce que dit la{" "}
              <span style={{ color: GD }}>communauté HighTech</span>
            </h2>
          </div>
          <div className="ht-testi-grid" style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 24,
        }}>
            {testimonials.map((t, i) => (<TestimonialCard key={i} name={t.name} role={t.role} text={t.text} rating={t.rating} visible={testiVis} delay={0.1 + i * 0.11}/>))}
          </div>
        </div>
      </section>

{/* Contact-Section */}
      <section id="contact" ref={contactRef} style={{
            padding: "110px 24px",
            background: "linear-gradient(180deg,#f8fafc,#ffffff)",
            position: "relative",
            overflow: "hidden",
        }}>
        <div style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(251,236,82,0.12) 0%, transparent 70%)`,
            pointerEvents: "none",
        }}/>

        <div style={{
            maxWidth: 900,
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
        }}>
          <div style={{
            ...fadeUp(contactVis, 0),
            textAlign: "center",
            marginBottom: 56,
        }}>
            <h2 style={{
            fontWeight: 800,
            fontSize: "clamp(28px,4vw,46px)",
            color: "#0f172a",
            letterSpacing: "-1px",
            lineHeight: 1.15,
            marginBottom: 16,
        }}>
              Centre d'<span style={{ color: GD }}>assistance</span>
            </h2>
            <p style={{
            fontSize: 15,
            color: "#64748b",
            maxWidth: 560,
            margin: "0 auto",
            lineHeight: 1.75,
        }}>
              Support officiel de la plateforme QuizTech pour les étudiants,
              enseignants et l'administration de HighTech School. Toute demande
              est traitée directement par l'administrateur de l'école.
            </p>
          </div>

          <div style={{
            ...fadeUp(contactVis, 0.1),
            background: "#fff",
            borderRadius: 28,
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 64px rgba(0,0,0,0.08)",
            overflow: "hidden",
        }}>
            <div style={{
            height: 5,
            background: `linear-gradient(90deg, ${GDD}, ${G}, ${G2})`,
        }}/>

            <div style={{ padding: "40px 40px 36px" }}>
              <div style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 36,
            flexWrap: "wrap",
        }}>
                <div style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${GD}, ${G})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 800,
            color: "#fff",
            flexShrink: 0,
            boxShadow: `0 8px 24px rgba(217,156,0,0.25)`,
        }}>
                  A
                </div>
                <div>
                  <h3 style={{
            fontWeight: 800,
            fontSize: 22,
            color: "#0f172a",
            marginBottom: 8,
        }}>
                    Administrateur QuizTech
                  </h3>
                  <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
        }}>
                    <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: G2,
            color: GT,
            padding: "5px 14px",
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
        }}>
                      <span style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: GD,
            display: "inline-block",
        }}/>
                      Disponible
                    </span>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>
                      Responsable officiel — HighTech School QuizTech
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact info grid */}
              <div className="ht-contact-col" style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 16,
            marginBottom: 32,
        }}>
                {[
            {
                icon: <Mail size={17} color={GD}/>,
                label: "Email officiel",
                val: "support@hightech.edu",
                href: "mailto:support@hightech.edu",
            },
            {
                icon: <Phone size={17} color={GD}/>,
                label: "Téléphone",
                val: "+212 (0) 522 45 67 89",
                href: "tel:+212522456789",
            },
            {
                icon: <Clock size={17} color={GD}/>,
                label: "Horaires",
                val: "Lun – Ven · 08:00–18:00",
                href: null,
            },
        ].map(({ icon, label, val, href }) => (<div key={label} style={{
                background: "#f8fafc",
                borderRadius: 18,
                padding: "18px 16px",
                border: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
            }}>
                    <div style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: G2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}>
                      {icon}
                    </div>
                    <div>
                      <div style={{
                fontSize: 11,
                color: "#94a3b8",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.8,
                marginBottom: 4,
            }}>
                        {label}
                      </div>
                      {href ? (<a href={href} style={{
                    fontSize: 14,
                    color: "#0f172a",
                    fontWeight: 600,
                    textDecoration: "none",
                }} onMouseEnter={(e) => {
                    e.target.style.color = GD;
                }} onMouseLeave={(e) => {
                    e.target.style.color = "#0f172a";
                }}>
                          {val}
                        </a>) : (<div style={{
                    fontSize: 14,
                    color: "#0f172a",
                    fontWeight: 600,
                }}>
                          {val}
                        </div>)}
                    </div>
                  </div>))}
              </div>

              <div style={{
            display: "flex",
            gap: 14,
            marginBottom: 32,
            flexWrap: "wrap",
        }}>
                <a href="mailto:support@hightech.edu" style={{
            flex: 1,
            minWidth: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            background: G,
            color: GT,
            padding: "15px 24px",
            borderRadius: 14,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 15,
            boxShadow: `0 6px 20px rgba(217,156,0,0.25)`,
            transition: "all 0.25s",
        }} onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = `0 10px 28px rgba(217,156,0,0.35)`;
        }} onMouseLeave={(e) => {
            e.currentTarget.style.transform = "";
            e.currentTarget.style.boxShadow = `0 6px 20px rgba(217,156,0,0.25)`;
        }}>
                  <Mail size={17}/> Envoyer un email
                </a>
                <a href="tel:+212522456789" style={{
            flex: 1,
            minWidth: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            border: `2px solid ${G}`,
            color: GT,
            padding: "15px 24px",
            borderRadius: 14,
            textDecoration: "none",
            fontWeight: 700,
            fontSize: 15,
            background: "transparent",
            transition: "all 0.25s",
        }} onMouseEnter={(e) => {
            e.currentTarget.style.background = G2;
        }} onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
        }}>
                  <Phone size={17}/> Appeler le support
                </a>
              </div>

              <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))",
            gap: 14,
            marginBottom: 28,
        }}>
                {[
            {
                title: "Étudiants HighTech",
                items: "Accès examens · Notes · Connexion",
            },
            {
                title: "Enseignants HighTech",
                items: "Créer examens · Résultats · Classes",
            },
            {
                title: "Problèmes techniques",
                items: "Bugs · Compte bloqué · Erreurs",
            },
        ].map((c) => (<div key={c.title} style={{
                background: "#f8fafc",
                borderRadius: 16,
                padding: "16px 16px",
                border: "1px solid #f1f5f9",
                textAlign: "center",
            }}>
                    <div style={{
                fontWeight: 700,
                fontSize: 13,
                color: "#0f172a",
                marginBottom: 5,
            }}>
                      {c.title}
                    </div>
                    <div style={{
                fontSize: 12,
                color: "#94a3b8",
                lineHeight: 1.6,
            }}>
                      {c.items}
                    </div>
                  </div>))}
              </div>

              <div style={{
            padding: "16px 20px",
            borderRadius: 16,
            background: G2,
            border: `1px solid ${G2}`,
            display: "flex",
            alignItems: "center",
            gap: 10,
        }}>
                <CheckCircle size={17} color={GD}/>
                <span style={{ fontSize: 13, color: GT, fontWeight: 600 }}>
                  Temps de réponse moyen : moins de 24 heures — Support exclusif
                  HighTech School QuizTech
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      
    </div>);
}
