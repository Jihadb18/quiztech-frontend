/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */
import React, { useState, useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
// ── Theme (Yellow & Dark Blue) ─────────────────────────────
const COLORS = {
    yellow: "#FBD057", // L-khfar l-asli dyal l-landing page
    yellowLight: "#FDE399", // Version khfifa dyal yellow l-backgrounds
    yellowHover: "#E5BD47", // Yellow gham9 chwiya l-hover
    darkBg: "#0f172b", // Slate-900 (K7al/Zre9 dyal l-footer o headers)
    darkText: "#1E272C", // Dark grey dyal text o outlines
    lightBg: "#f8fafc", // Background dyal l-chat window
    border: "#e2e8f0", // Border khfif
};
// ── Reply engine (FR) ─────────────────────────────
const getReply = (msg) => {
    const m = msg.toLowerCase();
    if (m.includes("login") || m.includes("connexion"))
        return "🔐 Connexion : utilisez uniquement votre email @hightech.edu.";
    if (m.includes("exam") || m.includes("examen"))
        return "📝 Les examens sont disponibles dans Espace Étudiant → Examens.";
    if (m.includes("result") || m.includes("résultat"))
        return "📊 Les résultats sont disponibles après correction dans votre espace.";
    if (m.includes("teacher") || m.includes("enseignant"))
        return "👨‍🏫 Les enseignants créent et corrigent les examens.";
    if (m.includes("admin") || m.includes("administration"))
        return "🏫 L’administration gère les comptes, examens et statistiques.";
    if (m.includes("contact") || m.includes("support"))
        return "💬 Contact : support@hightech.edu";
    if (m.includes("bonjour") || m.includes("salut"))
        return "👋 Bonjour ! Je suis votre assistant HighTech School.";
    return "🤖 Posez-moi une question sur examens, connexion, résultats ou administration.";
};
// ── Typing ─────────────────────────────
function Typing() {
    return (<div style={{
            display: "flex",
            gap: 8,
            alignItems: "center",
            margin: "10px 0",
        }}>
      <div style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${COLORS.darkBg}, ${COLORS.darkText})`,
        }}/>
      <div style={{
            padding: "10px 14px",
            borderRadius: 16,
            background: "#fff",
            border: `1px solid ${COLORS.border}`,
            fontSize: 12,
            color: "#64748b",
        }}>
        L'assistant écrit...
      </div>
    </div>);
}
function Bubble({ msg }) {
    const isBot = msg.from === "bot";
    return (<div style={{
            display: "flex",
            justifyContent: isBot ? "flex-start" : "flex-end",
            marginBottom: 12,
        }}>
      <div style={{
            maxWidth: "75%",
            padding: "12px 16px",
            borderRadius: isBot ? "18px 18px 18px 4px" : "18px 18px 4px 18px",
            fontSize: 13,
            lineHeight: 1.5,
            background: isBot ? "#ffffff" : COLORS.yellow,
            color: COLORS.darkBg, // Text dima dark bach ybqa readable mtnafe9 m3a yellow
            fontWeight: isBot ? "normal" : "600",
            border: isBot
                ? `1px solid ${COLORS.border}`
                : `1px solid ${COLORS.yellowHover}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
        }}>
        {msg.text}
      </div>
    </div>);
}
// ── Chips ─────────────────────────────
const chips = [
    "Connexion",
    "Examens",
    "Résultats",
    "Enseignant",
    "Admin",
    "Contact",
];
// ── MAIN ───────────────────────────────
export default function ChatAssistant({ currentUser }) {
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            from: "bot",
            text: "👋 Bonjour ! Je suis l'assistant QuizTech. Comment puis-je vous aider aujourd'hui ?",
        },
    ]);
    const [input, setInput] = useState("");
    const [typing, setTyping] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const bottomRef = useRef(null);
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing]);
    const send = (text) => {
        if (!text.trim())
            return;
        setMessages((p) => [...p, { id: Date.now(), from: "user", text }]);
        setInput("");
        setTyping(true);
        setTimeout(() => {
            setMessages((p) => [
                ...p,
                {
                    id: Date.now() + 1,
                    from: "bot",
                    text: getReply(text),
                },
            ]);
            setTyping(false);
        }, 800);
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            send(input);
        }
    };
    return (<>
      {/* FAB (Floating Button en Noir/Slate dyal l-footer) */}
      {!open && (<button onClick={() => setOpen(true)} className="rounded-full flex items-center justify-center cursor-pointer" style={{
                position: "fixed",
                bottom: isMobile ? 15 : 25,
                right: isMobile ? 15 : 25,
                width: 60,
                height: 60,
                borderRadius: "50%",
                border: "none",
                background: COLORS.darkBg,
                color: "#fff",
                boxShadow: "0 10px 30px rgba(15,23,42,0.3)",
                zIndex: 9999,
                transition: "all 0.2s ease",
                overflow: "hidden"
            }}>
          <MessageSquare size={24} color={COLORS.yellow}/>
        </button>)}

      {/* CHAT WINDOW */}
      {open && (<div style={{
                position: "fixed",
                bottom: isMobile ? 15 : 25,
                right: isMobile ? 15 : 25,
                width: isMobile ? "calc(100% - 30px)" : 370,
                height: isMobile ? "70%" : 540,
                maxHeight: isMobile ? "calc(100vh - 80px)" : 540,
                backgroundColor: COLORS.lightBg,
                borderRadius: 24,
                boxShadow: "0 20px 50px rgba(15,23,42,0.15)",
                zIndex: 9999,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                border: `1px solid ${COLORS.border}`,
            }}>
          {/* HEADER (Dark style matching the website footer & logo) */}
          <div style={{
                padding: "16px 20px",
                background: `linear-gradient(135deg, ${COLORS.darkBg}, ${COLORS.darkText})`,
                color: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `3px solid ${COLORS.yellow}`,
            }}>
            <div>
              <div style={{
                fontWeight: 700,
                fontSize: 15,
                letterSpacing: "-0.3px",
            }}>
                Assistant <span style={{ color: COLORS.yellow }}>QuizTech</span>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 11,
                color: "#94a3b8",
                marginTop: 2,
            }}>
                <span style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: COLORS.yellow,
            }}/>
                En ligne — QuizTech
              </div>
            </div>

            <button onClick={() => setOpen(false)} className="bg-transparent border-none outline-none" style={{
                color: "#94a3b8",
                fontSize: 16,
                cursor: "pointer",
                transition: "color 0.2s",
            }}>
              ✕
            </button>
          </div>

          {/* MESSAGES */}
          <div style={{
                flex: 1,
                padding: 16,
                overflowY: "auto",
                background: COLORS.lightBg,
            }}>
            {messages.map((m) => (<Bubble key={m.id} msg={m}/>))}
            {typing && <Typing />}
            <div ref={bottomRef}/>
          </div>

          {/* CHIPS (Yellow Light tags) */}
          <div style={{
                display: "flex",
                gap: 6,
                padding: "8px 14px",
                flexWrap: "wrap",
                background: "#ffffff",
                borderTop: `1px solid ${COLORS.border}`,
            }}>
            {chips.map((c) => (<button key={c} onClick={() => send(c)} className="cursor-pointer" style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "6px 12px",
                    borderRadius: 20,
                    border: `1px solid ${COLORS.yellow}`,
                    background: COLORS.yellowLight,
                    color: COLORS.darkBg,
                    transition: "all 0.2s ease",
                }}>
                {c}
              </button>))}
          </div>

          {/* INPUT */}
          <div style={{
                display: "flex",
                padding: 12,
                gap: 8,
                borderTop: `1px solid ${COLORS.border}`,
                background: "#ffffff",
            }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Posez votre question..." style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: 12,
                border: `1px solid ${COLORS.border}`,
                outline: "none",
                fontSize: 13,
                background: COLORS.lightBg,
            }}/>

            <button onClick={() => send(input)} className="cursor-pointer" style={{
                background: COLORS.darkBg,
                color: COLORS.yellow, // Arrow icons is Yellow
                border: "none",
                borderRadius: 12,
                padding: "0 16px",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s ease",
            }}>
              ➤
            </button>
          </div>
        </div>)}
    </>);
}
