
import React, { useState } from "react";
import { Mail, Lock, AlertCircle, Eye, EyeOff, ShieldAlert, Key, ShieldCheck, } from "lucide-react";
function AuthInput({ label, type, value, onChange, icon: Icon, error, placeholder, showPasswordToggle, onTogglePassword, isPasswordVisible, }) {
    const normLabel = label ? label.replace(/\s+/g, "-").toLowerCase() : "input";
    return (<div className="flex flex-col gap-1.5 w-full">
      <label id={`label-${normLabel}`} className="text-xs font-bold text-slate-700 tracking-wider uppercase text-left">
        {label}
      </label>
      <div id={`input-wrapper-${normLabel}`} style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            padding: "12px 16px",
            borderRadius: "10px",
            backgroundColor: "#f8fafc",
            transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            border: "none",
            outline: "none",
            boxShadow: "none"
        }} className="group/input focus-within:shadow-[0_12px_24px_rgba(251,208,87,0.18)] focus-within:bg-[#ffffff] border-0 focus-within:ring-0 focus-within:outline-none transition-all duration-300">
        {Icon && (<Icon id={`svg-${normLabel}`} size={18} className="text-slate-400 group-focus-within/input:text-amber-500 transition-colors shrink-0" style={{ marginRight: "12px" }}/>)}
        <input id={`input-el-${normLabel}`} type={showPasswordToggle && isPasswordVisible ? "text" : type} value={value} onChange={onChange} placeholder={placeholder} style={{
            flex: 1,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "#0f172a",
            fontSize: "14px",
            fontWeight: "600",
            padding: 0,
            margin: 0,
            boxShadow: "none"
        }} className="placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-0 focus:border-none border-0 ring-0 text-left"/>

        {showPasswordToggle && onTogglePassword && (<button id={`btn-toggle-${normLabel}`} type="button" onClick={onTogglePassword} className="text-slate-400 hover:text-slate-700 focus:outline-none flex items-center justify-center transition-colors shrink-0" style={{ marginLeft: "12px" }}>
            {isPasswordVisible ? (<EyeOff id={`svg-toggle-off-${normLabel}`} size={18}/>) : (<Eye id={`svg-toggle-on-${normLabel}`} size={18}/>)}
          </button>)}
      </div>
      {error && (<p className="text-xs text-red-500 font-semibold mt-1 pl-1 text-left">
          Avis: {error}
        </p>)}
    </div>);
}
export default function LoginPage({ users, syncUsers, onLoginSuccess, onNavigateHome }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    // Password reset / force-password-change simulation states
    const [targetUserForPasswordChange, setTargetUserForPasswordChange] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    // --- SECURE PASSWORD RESET WORKFLOW STATES ---
    const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotStep, setForgotStep] = useState(1); // 1 = input email, 2 = simulated secure inbox, 3 = enter new password, 4 = success!
    const [forgotUser, setForgotUser] = useState(null);
    const [resetNewPassword, setResetNewPassword] = useState("");
    const [resetConfirmPassword, setResetConfirmPassword] = useState("");
    const [forgotError, setForgotError] = useState("");
    const validate = () => {
        const errs = {};
        if (!email.trim()) {
            errs.email = "Email requis";
        }
        else if (!email.toLowerCase().endsWith("@hightech.edu") && !email.toLowerCase().includes("@gmail.com")) {
            errs.email = "Format d'e-mail incorrect";
        }
        if (!password) {
            errs.password = "Mot de passe requis";
        }
        return errs;
    };
    // Handle standard connection
const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({});
    const errs = validate();
    if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
    }

    // 1. Trouver l'utilisateur
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    
    if (!foundUser) {
        setErrors({
            general: "Identifiants incorrects ou utilisateur inexistant.",
        });
        return;
    }

    // 2. Définir les variables de vérification
    const r = foundUser.role.toLowerCase();
    const expectedPwd = (r === "etudiant" ? "student" : r === "enseignant" ? "teacher" : r) + "123";
    
    const isTempMatch = foundUser.temporaryPassword && password === foundUser.temporaryPassword;
    const isCustomMatch = foundUser.customPassword && password === foundUser.customPassword;
    
    const isTeacherShortcut = (r === "enseignant" || r === "teacher") && (password === "teacher123" || password === "prof123");
    const isStudentShortcut = (r === "etudiant" || r === "student") && (password === "student123" || password === "eleve123" || password === "etudiant123");
    const isAdminShortcut = (r === "admin" || r === "admin" ) && password === "admin123";
    
    // Cas spécifique pour le support
    const isSupportLogin = email.toLowerCase() === "support@hightech.edu" && password === "admin123";

    // 3. Vérification finale
    if (password !== expectedPwd &&
        !isTempMatch &&
        !isCustomMatch &&
        !isTeacherShortcut &&
        !isStudentShortcut &&
        !isAdminShortcut &&
        !isSupportLogin) {
        setErrors({ general: "Mot de passe incorrect pour ce compte." });
        return;
    }

    // 4. Gestion du changement de mot de passe forcé
    if (foundUser.forcePasswordChange) {
        setTargetUserForPasswordChange(foundUser);
        setPassword("");
        return;
    }

    // 5. Préparation de la session (Forcer le rôle admin pour le support)
    const userToLogin = { ...foundUser };
    if (userToLogin.email.toLowerCase() === "support@hightech.edu") {
        userToLogin.role = "admin"; 
    }

    setSubmitted(true);
    setTimeout(() => {
        onLoginSuccess(userToLogin); // Utilisation de l'utilisateur avec rôle corrigé
    }, 600);
};
    // Perform forced password change
    const handlePasswordChangeSubmit = (e) => {
        e.preventDefault();
        setErrors({});
        if (newPassword.length < 6) {
            setErrors({
                general: "Le mot de passe doit contenir au moins 6 caractères.",
            });
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrors({ general: "Les mot de passes ne correspondent pas." });
            return;
        }
        if (targetUserForPasswordChange) {
            const updatedUser = {
                ...targetUserForPasswordChange,
                forcePasswordChange: false,
                customPassword: newPassword,
            };
            delete updatedUser.temporaryPassword;
            // Update local storage
            const storedUsers = JSON.parse(localStorage.getItem("qt_users") || "[]");
            const updatedList = storedUsers.map((u) => u.id === updatedUser.id ? updatedUser : u);
            if (syncUsers) {
                syncUsers(updatedList);
            }
            else {
                localStorage.setItem("qt_users", JSON.stringify(updatedList));
            }
            setSubmitted(true);
            setTimeout(() => {
                onLoginSuccess(updatedUser);
            }, 600);
        }
    };
    // --- SUBMISSIONS HANDLERS FOR THE SECURE FORGOT PASSWORD FLOW ---
    const handleForgotEmailSubmit = (e) => {
        e.preventDefault();
        setForgotError("");
        if (!forgotEmail.trim()) {
            setForgotError("Saisie requise : veuillez entrer votre adresse e-mail.");
            return;
        }
        if (!forgotEmail.toLowerCase().endsWith("@hightech.edu") && !forgotEmail.toLowerCase().includes("@gmail.com")) {
            setForgotError("Seuls les comptes officiels @hightech.edu sont autorisés.");
            return;
        }
        const matched = users.find((u) => u.email.toLowerCase() === forgotEmail.toLowerCase().trim());
        if (!matched) {
            setForgotError("Aucun compte actif n'est associé à cette adresse e-mail.");
            return;
        }
        setForgotUser(matched);
        // Transition to step 2: show the simulated premium academic inbox
        setForgotStep(2);
    };
    const handleResetSubmit = (e) => {
        e.preventDefault();
        setForgotError("");
        if (resetNewPassword.length < 6) {
            setForgotError("Le mot de passe doit contenir au moins 6 caractères pour des raisons de sécurité.");
            return;
        }
        if (resetNewPassword !== resetConfirmPassword) {
            setForgotError("Les mots de passe saisis ne correspondent pas.");
            return;
        }
        // Update state and persistence
        const updatedUser = {
            ...forgotUser,
            customPassword: resetNewPassword,
            forcePasswordChange: false,
        };
        delete updatedUser.temporaryPassword;
        const updatedList = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
        if (syncUsers) {
            syncUsers(updatedList);
        }
        else {
            localStorage.setItem("qt_users", JSON.stringify(updatedList));
        }
        // Transition to success screen
        setForgotStep(4);
    };
    const handleLoginSuccess = (user) => {
    console.log("--- DEBUG CONNEXION ---");
    console.log("Objet utilisateur complet :", user);
    console.log("Rôle détecté :", user.role);
    
    setCurrentUser(user);
    const role = user.role.toLowerCase();
    
    if (role === 'admin') {
        console.log("Redirection vers : /admin-dashboard");
        navigate('/admin-dashboard');
    } else if (role === 'enseignant' || role === 'teacher') {
        console.log("Redirection vers : /teacher-dashboard");
        navigate('/teacher-dashboard');
    } else {
        console.log("Redirection vers : /student-dashboard (Par défaut)");
        navigate('/student-dashboard');
    }
};
    return (<div className="h-screen w-full flex bg-slate-50 font-sans antialiased overflow-hidden">
      {/* ───── LEFT SIDE: LOGO + HERO SVG + CENTERED TITLES ───── */}
      <div className="hidden lg:flex w-1/2 bg-[#FBD057] flex-col justify-center items-center p-8 overflow-hidden select-none">
        <div className="w-full max-w-sm flex flex-col items-center justify-center gap-2 transform scale-95">
          {/* Main Hero Vector SVG */}
          <div className="w-full flex items-center justify-center">
            <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "auto" }}>
              {/* White Background Blob */}
              <path d="M 250,60 C 370,60 440,130 440,250 C 440,370 350,440 250,440 C 120,440 60,350 60,250 C 60,110 130,60 250,60 Z" fill="#FFFFFF"/>
              <ellipse cx="250" cy="445" rx="210" ry="8" fill="#1E272C" opacity="0.1"/>

              {/* Bubbles */}
              <circle cx="130" cy="130" r="32" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2.5"/>
              <rect x="110" y="112" width="40" height="30" rx="4" fill="#FBD057" stroke="#1E272C" strokeWidth="2"/>
              <text x="117" y="133" fill="#1E272C" fontFamily="'Sora', sans-serif" fontSize="15" fontWeight="bold">
                x/ـ
              </text>

              <circle cx="225" cy="80" r="22" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2.5"/>
              <circle cx="225" cy="80" r="14" stroke="#1E272C" strokeWidth="2" fill="#FBD057"/>
              <path d="M225 73 v7 h5" stroke="#1E272C" strokeWidth="2" strokeLinecap="round"/>
              <path d="M225 54 v4 M225 102 v-4 M203 80 h4 M247 80 h-4" stroke="#1E272C" strokeWidth="2" strokeLinecap="round"/>

              <circle cx="330" cy="120" r="32" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2.5"/>
              <rect x="305" y="105" width="50" height="24" rx="4" fill="#FBD057" stroke="#1E272C" strokeWidth="2"/>
              <text x="311" y="122" fill="#1E272C" fontFamily="'Sora', sans-serif" fontSize="12" fontWeight="bold">
                01101
              </text>

              <circle cx="385" cy="215" r="20" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2"/>
              <polygon points="385,200 398,208 398,222 385,230 372,222 372,208" fill="#FBD057" stroke="#1E272C" strokeWidth="1.5"/>
              <line x1="385" y1="215" x2="385" y2="230" stroke="#1E272C" strokeWidth="1.5"/>
              <line x1="385" y1="215" x2="398" y2="208" stroke="#1E272C" strokeWidth="1.5"/>
              <line x1="385" y1="215" x2="372" y2="208" stroke="#1E272C" strokeWidth="1.5"/>

              <text x="260" y="115" fill="#1E272C" fontFamily="'Sora', sans-serif" fontSize="12" fontWeight="bold">
                z
              </text>

              {/* Environment */}
              <g transform="translate(80, 210)">
                <path d="M20 35 C5 15 5 0 5 0 C5 0 20 15 20 35 Z" fill="#FDE399" stroke="#1E272C" strokeWidth="2"/>
                <path d="M20 35 C35 15 35 0 35 0 C35 0 20 15 20 35 Z" fill="#FDE399" stroke="#1E272C" strokeWidth="2"/>
                <path d="M20 35 C20 10 20 -5 20 -5 C20 -5 20 10 20 35 Z" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2"/>
                <rect x="10" y="35" width="20" height="20" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2"/>
              </g>

              <g transform="translate(45, 300)">
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

              {/* Student */}
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

              {/* Laptop */}
              <g transform="translate(250, 245)">
                <polygon points="5,5 72,-5 60,55 -2,60" fill="#FFFFFF" stroke="#1E272C" strokeWidth="3"/>
                <polygon points="10,8 67,-1 56,51 3,55" fill="#FDE399" opacity="0.3"/>
                <text x="12" y="25" fill="#1E272C" fontFamily="'Sora', sans-serif" fontSize="9" fontWeight="900" transform="rotate(-5)">
                  QuizTech
                </text>
                <path d="M68 25 L80 50" stroke="#1E272C" strokeWidth="2.5"/>
              </g>

              {/* Desk */}
              <g id="desk">
                <rect x="60" y="275" width="355" height="8" rx="2" fill="#FBD057" stroke="#1E272C" strokeWidth="2.5"/>
                <path d="M85 283 L60 440 M355 283 L380 440" stroke="#1E272C" strokeWidth="4.5" strokeLinecap="round"/>
                <path d="M125 283 L125 330 M335 283 L345 360" stroke="#1E272C" strokeWidth="3" strokeLinecap="round"/>
              </g>

              {/* Backpack */}
              <g transform="translate(325, 335)">
                <path d="M10 30 C10 10 30 0 50 0 C70 0 90 10 90 30 L95 85 C95 95 85 100 50 100 C15 100 5 95 5 85 Z" fill="#FBD057" stroke="#1E272C" strokeWidth="3" strokeLinejoin="round"/>
                <path d="M12 50 C12 45 25 40 50 40 C75 40 88 45 88 50 L85 85 C85 92 75 95 50 95 C25 95 15 92 15 85 Z" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2.5"/>
                <path d="M38 0 C38 -8 62 -8 62 0" stroke="#1E272C" strokeWidth="2.5" fill="none"/>
                <rect x="44" y="65" width="12" height="12" rx="2" fill="#FFFFFF" stroke="#1E272C" strokeWidth="2"/>
                <line x1="50" y1="65" x2="50" y2="77" stroke="#1E272C" strokeWidth="1.5"/>
              </g>
            </svg>
          </div>

          {/* Centered Titles Below SVG */}
          <div className="text-center mt-9 flex flex-col items-center justify-center">
            {/* Real Logo SVG + Separator next to QuizTech moved from the right form */}
            <div className="mb-2 flex items-center justify-center gap-3">
              {/* HighTech School Real Logo SVG with high-contrast dark accents for golden background */}
              <div className="w-14 h-12 flex items-center justify-center shrink-0">
                <svg width="100%" height="100%" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Stylized Dark Slate Roof */}
                  <path d="M 12 36 L 60 10 L 108 36" stroke="#1E272C" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M 20 38 Q 60 22 100 38" stroke="#1E272C" strokeWidth="4" strokeLinecap="round" fill="none"/>

                  {/* HIGH-TECH Text */}
                  <text x="60" y="58" textAnchor="middle" fill="#1E272C" fontSize="20" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.2">
                    HIGH-TECH
                  </text>

                  {/* Dark separator line */}
                  <line x1="12" y1="65" x2="108" y2="65" stroke="#1E272C" strokeWidth="2"/>

                  {/* Subtitle */}
                  <text x="60" y="73" textAnchor="middle" fill="#1E272C" fontSize="5" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.1">
                    ECOLES D'ENSEIGNEMENT SUPÉRIEUR
                  </text>

                  {/* Red badge */}
                  <rect x="12" y="78" width="96" height="14" rx="2" fill="#E11D48"/>
                  <text x="60" y="88" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.3">
                    RECONNUE PAR L'ÉTAT
                  </text>
                </svg>
              </div>

              {/* Elegant vertical separator line */}
              <div className="h-8 w-px bg-slate-800/20 mx-1"/>

              {/* QuizTech display label */}
              <span className="text-xl font-black text-slate-900 tracking-tight shrink-0">
                Quiz<span className="text-[#1E272C]/80">Tech</span>
              </span>
            </div>

            <p className="text-xs text-slate-850 font-medium tracking-wide mt-1.5 max-w-[380px] mx-auto leading-normal opacity-90">
              Plateforme officielle d’évaluation — HighTech School
            </p>
          </div>
        </div>
      </div>

      {/* ───── RIGHT SIDE: AUTH FORM ───── */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 px-8 bg-white overflow-y-auto">
        <div className="w-full max-w-sm min-h-full flex flex-col justify-between py-12 md:py-16">
          <div className="mt-4"/>{" "}
          {/* Clean Spacer replace the old Logo block */}
          {/* Header Title (Clean Top Space Margin) */}
          <div className="text-center">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">
              {isForgotPasswordMode ? (forgotStep === 1 ? "Restauration d'accès" :
            forgotStep === 2 ? "Messagerie Académique" :
                forgotStep === 3 ? "Nouveau Passe" : "Succès !") : "Connexion"}
            </h1>
            <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-relaxed mt-1.5 text-center">
              {isForgotPasswordMode ? (forgotStep === 1 ? "Saisissez votre e-mail académique pour valider votre identité." :
            forgotStep === 2 ? "L'administration a envoyé un email sécurisé de récupération." :
                forgotStep === 3 ? "Veuillez définir votre nouveau mot de passe secret." :
                    "Votre mot de passe a été mis à jour avec succès !") : "Accès réservé aux étudiants, enseignants et administrateurs."}
            </p>
          </div>
          {submitted ? (<div className="bg-[#FFFDF5] border-2 border-[#F3C442] text-slate-900 p-6 rounded-xl text-center shadow-sm flex flex-col items-center gap-2 animate-fade-in my-auto">
              <ShieldCheck className="text-slate-900" size={32}/>
              <span className="text-base font-bold">Connexion réussie !</span>
            </div>) : isForgotPasswordMode ? (
        /* Forgot Password Sub-workflows */
        <div className="flex flex-col gap-5 my-auto py-6">
              {forgotError && (<div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0"/>
                  <p className="font-semibold">{forgotError}</p>
                </div>)}

              {forgotStep === 1 && (
            /* Step 1: Input Email */
            <form onSubmit={handleForgotEmailSubmit} className="space-y-4">
                  <AuthInput label="Adresse e-mail Académique" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} icon={Mail} placeholder="prenom.nom@hightech.edu"/>

                  <button type="submit" className="w-full mt-2 py-3.5 rounded-xl bg-slate-900 text-white text-sm font-bold tracking-wide hover:bg-slate-800 active:bg-slate-950 transition-all flex items-center justify-center gap-2 focus:outline-none cursor-pointer">
                    <span>Envoyer le lien de sécurité</span>
                  </button>

                  <button type="button" onClick={() => setIsForgotPasswordMode(false)} className="w-full py-2.5 border border-slate-200 text-slate-600 font-bold transition-all text-xs rounded-xl hover:bg-slate-50 cursor-pointer">
                    Retour à la connexion
                  </button>
                </form>)}

              {forgotStep === 2 && (
            /* Step 2: Educational Interactive Inbox Simulator */
            <div className="space-y-4 text-left">
                  <div className="rounded-2xl border-2 border-slate-200/80 bg-slate-50/50 p-4.5 shadow-xs overflow-hidden select-none">
                    {/* Inbox Header Mock */}
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"/>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          Boîte de réception - @hightech.edu
                        </span>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-full">
                        En ligne
                      </span>
                    </div>

                    {/* Email Layout */}
                    <div className="pt-3.5 space-y-3 text-slate-800">
                      <div className="space-y-1 text-left">
                        <p className="text-[11px] text-slate-400 font-medium leading-none">
                          De: <span className="font-extrabold text-slate-700">Sécurité Académique &lt;no-reply@hightech.edu&gt;</span>
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium leading-none">
                          À: <span className="font-bold text-slate-600">{forgotUser?.email}</span>
                        </p>
                      </div>

                      <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200/40 text-center space-y-3">
                        <div className="w-10 h-10 bg-amber-100 text-[#F4C542] rounded-full flex items-center justify-center mx-auto shadow-xs border border-amber-200/40">
                          <Key size={18}/>
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-xs font-black text-slate-900 leading-normal">
                            🔑 QuizTech : Réinitialisation demandée
                          </p>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-semibold max-w-[245px] mx-auto">
                            Bonjour {forgotUser?.name}. Cliquez sur le bouton d'amarrage réseau de sécurité ci-dessous afin de modifier vos codes secrets.
                          </p>
                        </div>

                        {/* Interactive Reset Button Inside Email */}
                        <button type="button" onClick={() => {
                    setForgotError("");
                    setForgotStep(3);
                }} className="px-4 py-2 bg-slate-900 hover:bg-[#F3C442] hover:text-slate-950 text-white rounded-lg text-[11px] font-extrabold shadow-sm transition-all cursor-pointer inline-block">
                          Réinitialiser le mot de passe
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-slate-400 font-semibold leading-relaxed max-w-[280px] mx-auto">
                    💡 Ce simulateur d'inbox scolaire vous évite d'ouvrir de nouveaux onglets. Cliquez sur le bouton ci-dessus pour définir votre nouveau mot de passe.
                  </p>

                  <button type="button" onClick={() => setIsForgotPasswordMode(false)} className="w-full py-2.5 border border-slate-100 text-slate-400 hover:bg-slate-50 transition-all font-bold text-xs rounded-xl cursor-pointer">
                    Retour à la connexion
                  </button>
                </div>)}

              {forgotStep === 3 && (
            /* Step 3: Enter New Password */
            <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div className="p-3.5 bg-amber-50/50 border border-amber-200/80 rounded-xl text-center">
                    <p className="text-[11px] font-bold text-slate-600">
                      Compte identifié : <span className="text-[#F4C542] font-black">{forgotUser?.name}</span>
                    </p>
                  </div>

                  <AuthInput label="Nouveau mot de passe" type="password" value={resetNewPassword} onChange={(e) => setResetNewPassword(e.target.value)} placeholder="Au moins 6 caractères"/>

                  <AuthInput label="Confirmer le nouveau passe" type="password" value={resetConfirmPassword} onChange={(e) => setResetConfirmPassword(e.target.value)} placeholder="Ressaisir le mot de passe"/>

                  <button type="submit" className="w-full mt-2 py-3.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all cursor-pointer">
                    Confirmer & Enregistrer le passe
                  </button>

                  <button type="button" onClick={() => setIsForgotPasswordMode(false)} className="w-full py-2 border border-slate-100 text-slate-400 hover:bg-slate-50 font-bold text-xs rounded-xl cursor-pointer">
                    Annuler
                  </button>
                </form>)}

              {forgotStep === 4 && (
            /* Step 4: Success confirmation */
            <div className="text-center space-y-4">
                  <div className="bg-emerald-50 border-2 border-emerald-500/80 text-emerald-950 p-6 rounded-2xl text-center shadow-xs flex flex-col items-center gap-2 animate-fade-in">
                    <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-md">
                      <ShieldCheck size={20}/>
                    </div>
                    <span className="text-sm font-black">Restauration confirmée !</span>
                    <p className="text-[10px] text-emerald-600 font-bold max-w-[240px] leading-relaxed">
                      Votre compte d'accès <strong>{forgotUser?.email}</strong> a été mis à jour de manière sécurisée.
                    </p>
                  </div>

                  <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                    Saisissez votre nouveau mot de passe secret dans l'interface de connexion habituelle.
                  </p>

                  <button type="button" onClick={() => {
                    setEmail(forgotUser?.email || "");
                    setPassword("");
                    setIsForgotPasswordMode(false);
                    setForgotStep(1);
                }} className="w-full py-3.5 bg-slate-900 hover:bg-slate-850 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer">
                    Accéder à la connexion
                  </button>
                </div>)}
            </div>) : targetUserForPasswordChange ? (
        /* Forced Password Change State inside our elegant custom container */
        <form onSubmit={handlePasswordChangeSubmit} className="flex flex-col gap-5 my-auto py-8">
              <div className="text-center rounded-xl bg-amber-50/50 p-4 border border-amber-200">
                <div className="mx-auto w-10 h-10 bg-amber-100 text-[#F4C542] rounded-full flex items-center justify-center mb-2">
                  <Key size={20}/>
                </div>
                <h2 className="text-lg font-black text-slate-950">
                  Nouveau mot de passe requis
                </h2>
                <p className="text-xs text-slate-500 mt-1 max-w-[280px] mx-auto text-center">
                  L'administrateur exige la réinitialisation obligatoire de
                  votre accès temporaire.
                </p>
                <div className="mt-2 text-[10px] font-bold bg-slate-100 text-slate-700 inline-block px-2.5 py-0.5 rounded">
                  Compte: {targetUserForPasswordChange.email}
                </div>
              </div>

              {errors.general && (<div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0"/>
                  <p className="font-semibold">{errors.general}</p>
                </div>)}

              <AuthInput label="Nouveau mot de passe" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Au moins 6 caractères"/>

              <AuthInput label="Confirmer le mot de passe" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Ressaisir le mot de passe"/>

              <div className="flex gap-3 mt-2">
                <button type="button" onClick={() => setTargetUserForPasswordChange(null)} className="w-1/2 py-3 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" className="w-1/2 py-3 bg-slate-900 text-white font-semibold text-xs rounded-xl hover:bg-slate-800 transition-colors">
                  Modifier & Valider
                </button>
              </div>
            </form>) : (
        /* Standard Login Form */
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 my-auto py-8">
              {errors.general && (<div className="p-3.5 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0"/>
                  <p className="font-semibold">{errors.general}</p>
                </div>)}

              <AuthInput label="Adresse e-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} icon={Mail} error={errors.email} placeholder="prenom.nom@hightech.edu"/>

              <div className="flex flex-col gap-1.5 w-full">
                <AuthInput label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} icon={Lock} error={errors.password} placeholder="........." showPasswordToggle={true} onTogglePassword={() => setShowPassword(!showPassword)} isPasswordVisible={showPassword}/>

                {/* Forgot Password */}
                <div className="text-right mt-1">
                  <button type="button" onClick={() => {
                setIsForgotPasswordMode(true);
                setForgotStep(1);
                setForgotEmail("");
                setForgotError("");
            }} className="text-xs text-slate-400 hover:text-[#F3C442] hover:underline font-semibold transition-colors focus:outline-none">
                    Mot de passe oublié ?
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="w-full mt-2 py-3.5 rounded-xl bg-slate-900 text-white text-sm tracking-wide
                           hover:bg-slate-850 active:bg-slate-950 transition-all flex items-center justify-center gap-2 group focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 cursor-pointer">
                <span>Se connecter</span>
              </button>

              {/* Alert Info Box */}
              <div className="rounded-xl bg-[#FFFDF5] border border-[#FBD057] p-3.5 text-center shadow-sm">
                <p className="text-slate-950 text-xs font-semibold leading-normal">
                  Avis important : Seuls les e-mails{" "}
                  <span className="font-extrabold underline decoration-2 decoration-[#FBD057]">
                    @hightech.edu
                  </span>{" "}
                  ou comptes autorisés sont permis.
                </p>
              </div>

              {/* Rôles quick login switcher container exactly as requested */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4.5 space-y-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-widest justify-center">
                  <ShieldAlert className="w-3.5 h-3.5 text-[#F4C542]"/>
                  Terminal de Rôles (Accès rapide)
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <button type="button" onClick={() => {
                setEmail("support@hightech.edu");
                setPassword("admin123");
            }} className="py-1.5 px-2 border border-slate-200 hover:border-[#F4C542] hover:bg-white rounded-lg text-slate-700 font-bold cursor-pointer text-center bg-slate-50 transition-all active:scale-95">
                    Admin
                  </button>
                  <button type="button" onClick={() => {
                setEmail("f.idrissi@hightech.edu");
                setPassword("teacher123");
            }} className="py-1.5 px-2 border border-slate-200 hover:border-[#F4C542] hover:bg-white rounded-lg text-slate-700 font-bold cursor-pointer text-center bg-slate-50 transition-all active:scale-95">
                    Enseignant
                  </button>
                  <button type="button" onClick={() => {
                setEmail("rkiajulia85@gmail.com");
                setPassword("student123");
            }} className="py-1.5 px-2 border border-slate-200 hover:border-[#F4C542] hover:bg-white rounded-lg text-slate-700 font-bold cursor-pointer text-center bg-slate-50 transition-all active:scale-95">
                    Étudiant
                  </button>
                </div>
                <div className="text-[10px] text-center text-slate-400 font-medium">
                  thomas.leduc@hightech.edu (clé: tempPassword123) pour tester
                  le changement forcé.
                </div>
              </div>

              {/* Back Link */}
              <div className="text-center mt-2">
                <button type="button" onClick={onNavigateHome} className="text-xs font-bold text-slate-400 hover:text-slate-950 transition-all focus:outline-none">
                  ← Retour à l’accueil
                </button>
              </div>
            </form>)}
          {/* Bottom Contact Section */}
          <div className="mt-auto pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 leading-relaxed mb-2">
              Pour toute demande d’accès ou problème technique : <br />
              <button type="button" className="text-slate-950 font-extrabold underline underline-offset-2 decoration-2 decoration-[#FBD057] hover:decoration-slate-900 transition-colors focus:outline-none cursor-pointer" onClick={() => {
            onNavigateHome();
            setTimeout(() => {
                const el = document.getElementById("contact");
                if (el) {
                    el.scrollIntoView({ behavior: "smooth" });
                }
            }, 150);
        }}>
                Contacter l’administration
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>);
}
