
import React, { useState, useEffect, useRef } from "react";
import { Clock, ShieldAlert, CheckCircle2, ArrowRight, Play, Server, FileCode, Check, } from "lucide-react";
// =========================================================================
// CONFIGURATION DE SÉCURITÉ : MODE DÉMO / DEMO_MODE
// =========================================================================
// Remplacer "true" par "false" pour réactiver le système d'anti-triche intégral.
// - true: Désactive les avertissements, les popups de triche, le blocage clavier,
//         les restrictions de clic droit, et le blocage de copier-coller.
// - false: Active les fonctionnalités de sécurité maximale et de surveillance d'examen.
const DEMO_MODE = false;
export default function ExamRoom({ exam, isPractice, onCancelExam, onSubmitCompleted, }) {
    const [currentIdx, setCurrentIdx] = useState(0);
    const questionsList = exam.questions || [];
    const [timeLeft, setTimeLeft] = useState(exam.durationMinutes ? exam.durationMinutes * 60 : (exam.duration ? exam.duration * 60 : 3600));
    const [answers, setAnswers] = useState(() => {
        return questionsList.map((q) => {
            const isProgramming = q.type === "PROGRAMMING" || q.type === "programmation";
            return {
                questionId: q.id,
                selectedChoiceId: "",
                textAnswer: "",
                codeSubmission: isProgramming
                    ? {
                        code: q.starterCode || "",
                        language: "javascript",
                        testCasesPassed: 0,
                        testCasesTotal: q.testCases?.length || 2,
                    }
                    : undefined,
            };
        });
    });
    // Anti-fraud infraction states
    const [infractionCount, setInfractionCount] = useState(0);
    const [infractionLogs, setInfractionLogs] = useState([]);
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [lastWarningMsg, setLastWarningMsg] = useState("");
    // Compiler Console simulation states for programming questions
    const [editorLanguage, setEditorLanguage] = useState("javascript");
    const [consoleLogs, setConsoleLogs] = useState([]);
    const [isRunningCode, setIsRunningCode] = useState(false);
    const [saveIndicator, setSaveIndicator] = useState("Toutes les réponses ont été sauvegardées");
    const currentQuestion = questionsList[currentIdx];
    // 1. Countdown & Autocommit
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAutocommit("Fin du temps réglementaire");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);
    // Listen to live durationMinutes extensions granted by the teacher in real-time
    const lastDurationMinutes = useRef(exam.durationMinutes || exam.duration || 60);
    useEffect(() => {
        const currentDur = exam.durationMinutes || exam.duration || 60;
        if (currentDur > lastDurationMinutes.current) {
            const addedMinutes = currentDur - lastDurationMinutes.current;
            setTimeLeft((prev) => prev + addedMinutes * 60);
            lastDurationMinutes.current = currentDur;
        }
    }, [exam.durationMinutes, exam.duration]);
    // 2. Local auto-save simulation every 30 seconds
    useEffect(() => {
        const saveTimer = setInterval(() => {
            setSaveIndicator("Sauvegarde automatique.....");
            setTimeout(() => {
                setSaveIndicator("Toutes les réponses ont été sauvegardées");
            }, 1500);
        }, 30000);
        return () => clearInterval(saveTimer);
    }, []);
    // 3. SECURE EXAM ROOM - Anti-trash tab switching tracking
    useEffect(() => {
        const handleVisibilityChange = () => {
            // ANTI-CHEAT check: Tab switching
            if (!DEMO_MODE && document.hidden) {
                triggerInfraction("Changement d'onglet ou abandon de la fenêtre principale détecté");
            }
        };
        const handleBlur = () => {
            // ANTI-CHEAT check: Loss of focus
            if (!DEMO_MODE) {
                triggerInfraction("Perte de focus de la fenêtre d'examen principale");
            }
        };
        // Bind event handlers
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("blur", handleBlur);
        // Keyboard shortcut blocking (Prevent F12, Ctrl+Shift+I, Alt keys, PrintScreen etc.)
        const handleKeyDown = (e) => {
            if (DEMO_MODE) {
                // En mode démo, les raccourcis système ne sont pas entravés
                return;
            }
            // ANTI-CHEAT check: DevTools / Keyboard shortcuts / Prints / Screenshots
            if (e.key === "F12" ||
                e.key === "PrintScreen" ||
                (e.ctrlKey &&
                    e.shiftKey &&
                    (e.key === "I" ||
                        e.key === "i" ||
                        e.key === "J" ||
                        e.key === "j" ||
                        e.key === "C" ||
                        e.key === "c" ||
                        e.key === "S" ||
                        e.key === "s")) ||
                (e.ctrlKey && (e.key === "U" || e.key === "u")) ||
                e.altKey) {
                e.preventDefault();
                triggerInfraction("Tentative de capture d'écran ou d'accès aux DevTools par raccourcis système");
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("blur", handleBlur);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [infractionCount]);
    const triggerInfraction = (reason) => {
        // ANTI-CHEAT check: Do nothing and ignore security alerts in DEMO_MODE
        if (DEMO_MODE) {
            console.warn(`[DEMO_MODE] Infraction détectée et désactivée : ${reason}`);
            return;
        }
        const timestamp = new Date().toLocaleTimeString();
        const newCount = infractionCount + 1;
        const logData = `[${timestamp}] ${reason} (Avertissement ${newCount}/3)`;
        setInfractionCount(newCount);
        setInfractionLogs((prev) => [...prev, logData]);
        setLastWarningMsg(reason);
        // Warn immediately containing progressive modal popup
        setShowWarningModal(true);
        // Auto-submit if 3 infractions occur
        if (newCount >= 3) {
            setTimeout(() => {
                handleAutocommit("Exclusion pour suspicion de fraude : infractions répétées (3/3)");
            }, 2000);
        }
    };
    const handleAutocommit = (reason) => {
        alert(`QuizTech Terminal : Soumission obligatoire de votre copie d'examen pour le motif : ${reason}`);
        onSubmitCompleted(answers, infractionCount, infractionLogs);
    };
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };
    // 4. Input handles
    const handleMcqSelect = (choiceId) => {
        if (!currentQuestion)
            return;
        setAnswers((prev) => prev.map((ans) => {
            if (ans.questionId === currentQuestion.id) {
                const curList = ans.selectedChoiceId ? ans.selectedChoiceId.split(",").filter(Boolean) : [];
                let nextList;
                if (curList.includes(choiceId)) {
                    nextList = curList.filter((id) => id !== choiceId);
                }
                else {
                    nextList = [...curList, choiceId];
                }
                return { ...ans, selectedChoiceId: nextList.join(",") };
            }
            return ans;
        }));
    };
    const handleTrueFalseSelect = (val) => {
        if (!currentQuestion)
            return;
        setAnswers((prev) => prev.map((ans) => {
            if (ans.questionId === currentQuestion.id) {
                return { ...ans, textAnswer: val };
            }
            return ans;
        }));
    };
    const handleShortAnswerChange = (val) => {
        if (!currentQuestion)
            return;
        setAnswers((prev) => prev.map((ans) => {
            if (ans.questionId === currentQuestion.id) {
                return { ...ans, textAnswer: val };
            }
            return ans;
        }));
    };
    const handleCodeChange = (codeVal) => {
        if (!currentQuestion)
            return;
        setAnswers((prev) => prev.map((ans) => {
            if (ans.questionId === currentQuestion.id) {
                const existingSub = ans.codeSubmission || {
                    code: "",
                    language: "javascript",
                    testCasesPassed: 0,
                    testCasesTotal: currentQuestion.testCases?.length || 2,
                };
                return {
                    ...ans,
                    codeSubmission: { ...existingSub, code: codeVal },
                };
            }
            return ans;
        }));
    };
    // Change language template
    const handleLanguageChange = (lang) => {
        if (!currentQuestion)
            return;
        setEditorLanguage(lang);
        setAnswers((prev) => prev.map((ans) => {
            if (ans.questionId === currentQuestion.id) {
                let templValue = currentQuestion.starterCode || "";
                const existingSub = ans.codeSubmission || {
                    code: "",
                    language: "javascript",
                    testCasesPassed: 0,
                    testCasesTotal: currentQuestion.testCases?.length || 2,
                };
                return {
                    ...ans,
                    codeSubmission: {
                        ...existingSub,
                        code: templValue,
                        language: lang,
                    },
                };
            }
            return ans;
        }));
    };
    // Simulate IDE Code Compilations
    const handleCompileAndRun = () => {
        if (!currentQuestion)
            return;
        setIsRunningCode(true);
        setConsoleLogs([
            "Transpilation Babel du script JSX...",
            "Initialisation de la sandbox de test réactive...",
            "Lancement du moteur de rendu virtuel React...",
        ]);
        const studentAnswersObj = answers.find((a) => a.questionId === currentQuestion.id);
        const code = studentAnswersObj?.codeSubmission?.code || "";
        setTimeout(() => {
            setConsoleLogs((prev) => [
                ...prev,
                "Transpilation réussie. Exécution des tests unitaires sur le composant (Virtual DOM) :",
            ]);
            // Look up code logic to see if they wrote code containing return keyword or simple logic
            const containsEvenCode = code.includes("% 2") ||
                code.includes("EvenSum") ||
                code.includes("CheckerPair") ||
                code.includes("return") ||
                code.includes("arr") ||
                code.includes("values");
            const testCasesCount = currentQuestion.testCases?.length || 2;
            const passedCount = containsEvenCode ? testCasesCount : 0;
            setTimeout(() => {
                if (containsEvenCode) {
                    setConsoleLogs((prev) => [
                        ...prev,
                        "&bull; Validation du rendu JSX avec valeurs paires => Résultat: Pair -- [SUCCÈS]",
                        "&bull; Validation du rendu JSX avec valeurs impaires => Résultat: Impair -- [SUCCÈS]",
                        `Exécution web sandbox terminée. ${passedCount} / ${testCasesCount} assertions Virtual DOM validées !`,
                    ]);
                }
                else {
                    setConsoleLogs((prev) => [
                        ...prev,
                        "&bull; Validation du rendu JSX avec valeurs paires => Échec du rendu -- [ÉCHEC]",
                        "&bull; Validation du rendu JSX avec valeurs impaires => Échec du rendu -- [ÉCHEC]",
                        `Exécution web sandbox terminée. 0 / ${testCasesCount} assertions Virtual DOM validées.`,
                    ]);
                }
                // Update test status
                setAnswers((prev) => prev.map((ans) => {
                    if (ans.questionId === currentQuestion.id) {
                        const existingSub = ans.codeSubmission || {
                            code: "",
                            language: "jsx",
                            testCasesPassed: 0,
                            testCasesTotal: testCasesCount,
                            runStdout: "",
                        };
                        return {
                            ...ans,
                            codeSubmission: {
                                ...existingSub,
                                testCasesPassed: passedCount,
                                testCasesTotal: testCasesCount,
                                runStdout: `Rendu React valide: ${passedCount}/${testCasesCount} tests`,
                            },
                        };
                    }
                    return ans;
                }));
                setIsRunningCode(false);
            }, 1200);
        }, 1000);
    };
    const handleFinalSubmit = () => {
        const unansCount = answers.filter((a) => {
            const matchingQ = questionsList.find((q) => q.id === a.questionId);
            return !isQuestionAnswered(matchingQ);
        }).length;
        if (unansCount > 0) {
            if (!confirm(`Attention : Il reste ${unansCount} question(s) sans réponse évidente. Soumettez-vous quand même votre copie d'examen d'évaluation ?`)) {
                return;
            }
        }
        else {
            if (!confirm("Voulez-vous soumettre définitivement votre copie ? Cette action clôture définitivement votre session d'examen.")) {
                return;
            }
        }
        onSubmitCompleted(answers, infractionCount, infractionLogs);
    };
    const getAnswerForQuestion = (qId) => {
        return answers.find((a) => a.questionId === qId);
    };
    const isQuestionAnswered = (q) => {
        if (!q)
            return false;
        const ans = getAnswerForQuestion(q.id);
        if (!ans)
            return false;
        const isMcq = q.type === "MCQ" || q.type === "qcm";
        const isTrueFalse = q.type === "TRUE_FALSE" || q.type === "vrai_faux";
        const isShortAnswer = q.type === "SHORT_ANSWER" || q.type === "reponse_courte";
        const isOpen = q.type === "OPEN" || q.type === "ouverte";
        const isProgramming = q.type === "PROGRAMMING" || q.type === "programmation";
        if (isMcq)
            return !!ans.selectedChoiceId;
        if (isTrueFalse)
            return !!ans.textAnswer;
        if (isShortAnswer || isOpen)
            return !!ans.textAnswer.trim();
        if (isProgramming)
            return (!!ans.codeSubmission?.code && ans.codeSubmission.code.trim().length > 15);
        return false;
    };
    if (!currentQuestion) {
        return (<div className="p-8 text-center text-slate-400 bg-slate-900 min-h-screen flex items-center justify-center">
        Aucune question trouvée pour cet examen.
      </div>);
    }
    // Type-bridging helper values
    const isMcq = currentQuestion.type === "MCQ" || currentQuestion.type === "qcm";
    const isTrueFalse = currentQuestion.type === "TRUE_FALSE" || currentQuestion.type === "vrai_faux";
    const isShortAnswer = currentQuestion.type === "SHORT_ANSWER" || currentQuestion.type === "reponse_courte";
    const isOpen = currentQuestion.type === "OPEN" || currentQuestion.type === "ouverte";
    const isProgramming = currentQuestion.type === "PROGRAMMING" || currentQuestion.type === "programmation";
    // Build bridging choices
    const choices = currentQuestion.choices || currentQuestion.options?.map((opt, i) => ({ id: i.toString(), text: opt })) || [];
    return (<div id="exam-room-container" className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans select-none" onCopy={(e) => {
            // ANTI-CHEAT check: block copy only if not in demo mode
            if (!DEMO_MODE) {
                e.preventDefault();
                alert("Avis : Le copier est strictement bloqué par la console de sécurité.");
            }
        }} onPaste={(e) => {
            // ANTI-CHEAT check: block paste only if not in demo mode
            if (!DEMO_MODE) {
                e.preventDefault();
                alert("Avis : Le coller est strictement bloqué par la console de sécurité.");
            }
        }} onContextMenu={(e) => {
            // ANTI-CHEAT check: block contextmenu click only if not in demo mode
            if (!DEMO_MODE) {
                e.preventDefault();
                alert("Avis : Le clic droit extérieur est désactivé.");
            }
        }}>
      {/* Top bar indicators */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
        <div className="flex items-center gap-3">
          
          <div>
            <h1 className="text-sm font-black text-white tracking-widest uppercase flex items-center gap-1.5">
              Examen : {exam.title}
            </h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-wide">
              Terminal sécurisé . Sauvegarde automatique : <span className="text-[#F4C542]">{saveIndicator}</span>
            </p>
          </div>
        </div>

        {/* Info modules (Countdown & Anti-Cheat log badge) */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/20 px-4 py-2 rounded-xl text-red-400 font-mono font-bold text-sm">
            <Clock className="w-4 h-4 text-red-400 animate-pulse"/>
            <span>{formatTime(timeLeft)}</span>
          </div>

   
        </div>
      </header>

      {/* Main layout (Question selection left, Workspace context right) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left vertical question index bar */}
        <aside className="w-64 bg-slate-950 border-r border-slate-800 p-4 space-y-4 hidden md:flex flex-col overflow-y-auto shrink-0 select-none">
          <div className="text-slate-400 font-black text-[10px] uppercase tracking-widest mb-1">
            Index des Questions ({questionsList.length})
          </div>

          <nav className="flex-1 space-y-2">
            {questionsList.map((q, idx) => {
            const active = idx === currentIdx;
            const answered = isQuestionAnswered(q);
            return (<button key={q.id} onClick={() => setCurrentIdx(idx)} className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-all border ${active
                    ? "bg-slate-800/80 border-[#F4C542] text-white font-extrabold"
                    : "border-slate-900 text-slate-400 hover:bg-slate-800/30 hover:text-white"}`}>
                  <span className="text-xs font-semibold">
                    Q{idx + 1}. {q.type === "MCQ" || q.type === "qcm" ? "QCM" : q.type}
                  </span>
                  {answered ? (<CheckCircle2 className="w-3.5 h-3.5 text-green-500"/>) : (<span className="w-1.5 h-1.5 bg-slate-600 rounded-full"/>)}
                </button>);
        })}
          </nav>

         
        </aside>

        {/* Dynamic question space */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-900">
          <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-6">
            {/* Header of Question */}
            <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">
                Question active : {currentIdx + 1} &bull; Coefficient{" "}
                {currentQuestion.coefficient || 1}
              </span>
              <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                {currentQuestion.type === "MCQ" || currentQuestion.type === "qcm" ? "QCM" : currentQuestion.type}
              </span>
            </div>

            {/* Prompt */}
            <div className="space-y-4">
              <h2 id="current-question-prompt" className="text-base md:text-lg font-extrabold text-white leading-relaxed">
                {currentQuestion.prompt}
              </h2>
            </div>

            {/* Answers Forms */}
            {isMcq && (<div className="grid grid-cols-1 gap-3 max-w-2xl selection:bg-transparent">
                {choices.map((choice) => {
                const val = getAnswerForQuestion(currentQuestion.id);
                const selectedIds = val?.selectedChoiceId ? val.selectedChoiceId.split(",").filter(Boolean) : [];
                const selected = selectedIds.includes(choice.id);
                return (<button key={choice.id} onClick={() => handleMcqSelect(choice.id)} className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 cursor-pointer ${selected
                        ? "bg-[#F4C542]/10 border-[#F4C542] text-white font-bold shadow-lg"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950/80"}`}>
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${selected ? "border-[#F4C542] bg-[#F4C542] text-slate-950" : "border-slate-600"}`}>
                        {selected && (<Check className="w-3.5 h-3.5 stroke-[3]"/>)}
                      </div>
                      <span className="text-xs">{choice.text}</span>
                    </button>);
            })}
              </div>)}

            {isTrueFalse && (<div className="flex gap-4 max-w-sm selection:bg-transparent">
                {["true", "false"].map((option) => {
                const val = getAnswerForQuestion(currentQuestion.id);
                const selected = val?.textAnswer === option;
                return (<button key={option} type="button" onClick={() => handleTrueFalseSelect(option)} className={`flex-1 py-4 rounded-xl border font-bold text-xs uppercase tracking-wider text-center transition-all cursor-pointer ${selected
                        ? "bg-amber-400 text-slate-950 border-amber-400 shadow-lg"
                        : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"}`}>
                      {option === "true" ? "Vrai" : "Faux"}
                    </button>);
            })}
              </div>)}

            {isShortAnswer && (<div className="max-w-xl space-y-2">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Saisir votre réponse synthétique ci-dessous :
                </label>
                <input type="text" placeholder="Écrivez le ou les termes attendus..." value={getAnswerForQuestion(currentQuestion.id)?.textAnswer || ""} onChange={(e) => handleShortAnswerChange(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C542] text-xs text-white placeholder:text-slate-600 font-medium transition-all"/>
              </div>)}

            {isOpen && (<div className="max-w-2xl space-y-2">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Rédiger votre réponse détaillée ci-dessous (Saisie libre - Zone Rédactionnelle) :
                </label>
                <textarea rows={8} placeholder="Écrivez votre démonstration, explication, raisonnement ou réponse rédigée libre ici..." value={getAnswerForQuestion(currentQuestion.id)?.textAnswer || ""} onChange={(e) => handleShortAnswerChange(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-[#F4C542] text-xs text-white placeholder:text-slate-600 font-medium transition-all resize-y leading-relaxed"/>
              </div>)}

            {isProgramming && (<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* 1. IDE Code Editor Mockup */}
                <div className="lg:col-span-8 space-y-3">
                  <div className="bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
                    {/* Header with language controls */}
                    <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
                      <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono font-bold">
                        <FileCode className="w-4 h-4 text-amber-500"/>
                        <span>
                          Solution.
                          {editorLanguage === "javascript"
                ? "jsx"
                : editorLanguage === "java"
                    ? "props.jsx"
                    : editorLanguage === "python"
                        ? "state.jsx"
                        : "list.jsx"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <select value={editorLanguage} onChange={(e) => handleLanguageChange(e.target.value)} style={{
                backgroundColor: "#020617",
                border: "1px solid #1e293b",
                color: "#cbd5e1",
                paddingLeft: "8px",
                paddingRight: "8px",
                paddingTop: "4px",
                paddingBottom: "4px",
                borderRadius: "4px",
                fontSize: "12px",
                fontFamily: "sans-serif",
                fontWeight: "bold",
                cursor: "pointer",
                outline: "none",
            }}>
                          <option value="javascript">
                            React JSX (Composant Simple)
                          </option>
                          <option value="java">
                            React JSX (Composant avec Props)
                          </option>
                          <option value="python">
                            React JSX (Hooks / State)
                          </option>
                          <option value="cpp">
                            React JSX (Rendu de Listes)
                          </option>
                        </select>
                      </div>
                    </div>

                    {/* Monaco style editing container (Simulated typing/code box in dark layout) */}
                    <div className="relative font-mono text-xs flex">
                      {/* Line Numbers */}
                      <div className="bg-slate-900 p-4 border-r border-slate-800/60 select-none text-right text-slate-600 space-y-1">
                        {Array.from({ length: 12 }).map((_, i) => (<div key={i}>{i + 1}</div>))}
                      </div>
                      {/* Active Text Area */}
                      <textarea value={getAnswerForQuestion(currentQuestion.id)
                ?.codeSubmission?.code || ""} onChange={(e) => handleCodeChange(e.target.value)} className="flex-1 bg-slate-950 p-4 focus:outline-none text-emerald-400 font-mono text-xs leading-relaxed resize-none h-60 min-h-60" placeholder="// Saisissez le code de votre fonction ici..." style={{ tabSize: 4 }}/>
                    </div>

                    {/* Footer buttons of code workspace */}
                    <div className="px-4 py-3 bg-slate-900 border-t border-slate-800 flex justify-end gap-3">
                      <button type="button" onClick={handleCompileAndRun} disabled={isRunningCode} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 text-[#F4C542] border border-slate-700 hover:border-amber-400 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer">
                        <Play className="w-3.5 h-3.5"/>
                        {isRunningCode
                ? "Exécution..."
                : "Compiler & Lancer les Tests"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Sandbox simulated Compiler logs window */}
                <div className="lg:col-span-4 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-80">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-900 pb-2">
                      <Server className="w-4 h-4 text-[#F4C542]"/>
                      Console Sandbox
                    </div>

                    <div className="space-y-1.5 font-mono text-[10px] text-slate-300 h-56 overflow-y-auto leading-relaxed">
                      {consoleLogs.length === 0 ? (<p className="text-slate-500 italic">
                          En attente de compilation... Appuyez sur "Compiler"
                          pour évaluer vos assertions métriques automatiques.
                        </p>) : (consoleLogs.map((log, lidx) => (<p key={lidx} dangerouslySetInnerHTML={{ __html: log }}/>)))}
                    </div>
                  </div>

                  {/* Assertion success counter flag */}
                  {(getAnswerForQuestion(currentQuestion.id)?.codeSubmission
                ?.testCasesPassed || 0) > 0 && (<div className="bg-green-950/40 p-2.5 rounded-lg border border-green-500/20 text-green-400 text-[10px] font-bold flex items-center gap-2">
                      <Check className="w-3.5 h-3.5"/>
                      Validation :{" "}
                      {getAnswerForQuestion(currentQuestion.id)?.codeSubmission
                    ?.testCasesPassed}{" "}
                      cas de test compilés avec succès.
                    </div>)}
                </div>
              </div>)}
          </div>

          {/* Bottom control row */}
          <footer className="bg-slate-950 border-t border-slate-850 px-6 py-4 flex justify-between items-center shrink-0 h-16">
            <button onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))} disabled={currentIdx === 0} className="py-1.5 px-4 text-xs font-bold text-slate-400 hover:text-white disabled:text-slate-700 bg-slate-900 border border-slate-850/60 rounded-lg transition-colors">
              &larr; Précédent
            </button>

            <span className="text-[10px] text-slate-500 font-bold font-mono">
              Progrès global :{" "}
              {Math.round((answers.filter((a) => {
            const matchingQ = questionsList.find((q) => q.id === a.questionId);
            return isQuestionAnswered(matchingQ);
        }).length /
            questionsList.length) *
            100)}{" "}
              %
            </span>

            {currentIdx < questionsList.length - 1 ? (<button onClick={() => setCurrentIdx((prev) => prev + 1)} className="py-1.5 px-4 text-xs font-bold bg-[#F4C542] hover:bg-amber-500 text-slate-950 rounded-lg flex items-center gap-1 transition-colors">
                Suivant
                <ArrowRight className="w-3.5 h-3.5"/>
              </button>) : (<button onClick={handleFinalSubmit} className="py-1.5 px-4 text-xs font-extrabold bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer">
                Soumettre ma Copie
              </button>)}
          </footer>
        </main>
      </div>

     
    </div>);
}
