/**
 * @license
 * SPDX-License-Identifier: Apache-2.5
 */
import React, { useState, useEffect } from "react";
import ExamRoom from "./ExamRoom";
import { BookOpen, Clock, Award, Play, CheckCircle2, ChevronRight, HelpCircle,
   Download, ShieldCheck, GraduationCap, User, TrendingUp,X,Eye,Bell,FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart } from "recharts";
export default function StudentDashboard({ currentUser: rawCurrentUser, exams: rawExams, submissions: allSubmissions = [], subjects = [], classes = [], currentClock: parentClock, onStartExam, announcements = [], resources = [], onSyncSubmissions, }) {
    // Shadow and adapt original variables so standard StudentPanel UI functions seamlessly
    const currentUser = {
        ...rawCurrentUser,
        name: rawCurrentUser?.fullName || rawCurrentUser?.name || "Élève",
        role: "etudiant",
    };
    const attempts = (allSubmissions || []).map((s) => ({
        id: s.id,
        examId: s.examId,
        studentId: s.studentId,
        status: s.isGraded ? "graded" : "completed",
        score: s.score,
        maxScore: 20,
        startedAt: s.startTime,
        submittedAt: s.submissionTime,
        suspiciousEvents: (s.antiFraudDetails || []).map((detail, i) => ({
            id: `susp-${s.id}-${i}`,
            type: "other",
            timestamp: new Date().toISOString(),
            description: typeof detail === "string" ? detail : detail?.message || "Activités hors-focus détectées"
        }))
    }));
    const responses = [];
    (allSubmissions || []).forEach((s) => {
        if (s.answers) {
            s.answers.forEach((ans) => {
                responses.push({
                    examId: s.examId,
                    questionId: ans.questionId,
                    studentId: s.studentId,
                    answerString: ans.textAnswer || "",
                    answerBool: ans.textAnswer === "true" || ans.textAnswer === "vrai" || undefined,
                    answerOptions: ans.selectedChoiceId !== undefined ? [Number(ans.selectedChoiceId)] : undefined,
                    answerCode: ans.codeSubmission?.code || undefined
                });
            });
        }
    });
    // Load questions from local storage
    const questions = [];
    try {
        const localQ = localStorage.getItem("qt_questions");
        if (localQ) {
            questions.push(...JSON.parse(localQ));
        }
    }
    catch { }
    const exams = (rawExams || []).map((e) => {
        return {
            ...e,
            questions: questions.filter((q) => q.examId === e.id)
        };
    });
    const onUpdateAttempts = (updated) => {
        let latestResponses = [];
        try {
            const stored = localStorage.getItem("qt_responses");
            if (stored)
                latestResponses = JSON.parse(stored);
        }
        catch { }
        const updatedSubmissions = updated.map((att) => {
            const existingSub = (allSubmissions || []).find((s) => s.id === att.id || (s.examId === att.examId && s.studentId === att.studentId));
            const antiFraudDetails = (att.suspiciousEvents || []).map((ev) => ev.description);
            const antiFraudIncidentCount = att.suspiciousEvents?.length || 0;
            const studentAnswers = latestResponses
                .filter((r) => r.examId === att.examId && r.studentId === att.studentId)
                .map((r) => {
                let textAnswer = r.answerString || "";
                if (r.answerBool !== undefined) {
                    textAnswer = r.answerBool ? "true" : "false";
                }
                let selectedChoiceId = undefined;
                if (r.answerOptions && r.answerOptions.length > 0) {
                    selectedChoiceId = String(r.answerOptions[0]);
                }
                let codeSubmission = undefined;
                if (r.answerCode) {
                    codeSubmission = {
                        code: r.answerCode,
                        language: "javascript",
                        testCasesPassed: r.obtainedScore || 0,
                        testCasesTotal: 3
                    };
                }
                return {
                    questionId: r.questionId,
                    selectedChoiceId,
                    textAnswer,
                    codeSubmission
                };
            });
            if (existingSub) {
                return {
                    ...existingSub,
                    score: att.score !== undefined ? att.score : existingSub.score,
                    isGraded: att.status === "graded",
                    startTime: att.startedAt || existingSub.startTime,
                    submissionTime: att.submittedAt || existingSub.submittedAt,
                    answers: studentAnswers.length > 0 ? studentAnswers : existingSub.answers,
                    antiFraudIncidentCount,
                    antiFraudDetails,
                };
            }
            else {
                return {
                    id: att.id || `subm_${Date.now()}`,
                    examId: att.examId,
                    studentId: att.studentId,
                    startTime: att.startedAt || new Date().toISOString(),
                    submissionTime: att.submittedAt || new Date().toISOString(),
                    answers: studentAnswers,
                    score: att.score !== undefined ? att.score : 0,
                    isGraded: att.status === "graded",
                    antiFraudIncidentCount,
                    antiFraudDetails,
                    teacherFeedback: undefined,
                };
            }
        });
        localStorage.setItem("qt_submissions", JSON.stringify(updatedSubmissions));
        if (onSyncSubmissions) {
            onSyncSubmissions(updatedSubmissions);
        }
    };
    const onUpdateResponses = (updated) => {
        localStorage.setItem("qt_responses", JSON.stringify(updated));
    };
    const onAddLog = (action, details) => {
        try {
            const logs = JSON.parse(localStorage.getItem("qt_audit_logs") || "[]");
            logs.push({
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString(),
                userId: rawCurrentUser?.id,
                userName: rawCurrentUser?.fullName || rawCurrentUser?.name || "Élève",
                action,
                details
            });
            localStorage.setItem("qt_audit_logs", JSON.stringify(logs));
        }
        catch { }
    };
    // Navigation tab state inside the dashboard
    const [activeTab, setActiveTab] = useState("assigned");
    const [selectedSubmissionForReview, setSelectedSubmissionForReview] = useState(null);
    // State active exam session
    const [activeExamId, setActiveExamId] = useState(null);
    const activeExamFound = exams.find((e) => e.id === activeExamId);
    const activeExamObj = activeExamId && activeExamFound
        ? {
            ...activeExamFound,
            questions: questions.filter((q) => q.examId === activeExamId),
        }
        : null;
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [sessionResponses, setSessionResponses] = useState({});
    const [suspicionCount, setSuspicionCount] = useState(0);
    const [lastSaved, setLastSaved] = useState("");
    // Code runner state for testing panel inside live exam questions
    const [consoleOutput, setConsoleOutput] = useState("");
    const [, setCodeTestCaseResults] = useState([]);
    // 1. LIVE INTERNAL CLOCK
    const [currentClock, setCurrentClock] = useState("");
    useEffect(() => {
        const updateTime = () => {
            const d = new Date();
            setCurrentClock(d.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }));
        };
        updateTime();
        const timer = setInterval(updateTime, 1000);
        return () => clearInterval(timer);
    }, []);
    // 2. CLASSROOM MATCHING
    const studentClass = classes.find((c) => c.id === currentUser.classId);
    // 3. SEPARATE EXAMS (ACADEMIC VS TRAINING)
    const academicExams = exams.filter((e) => {
        const classId = e.classRoomId || "cl1";
        const coeff = e.coefficient ?? 2;
        return classId === studentClass?.id && coeff > 1;
    });
    const practiceExams = exams.filter((e) => {
        const classId = e.classRoomId || "cl1";
        const coeff = e.coefficient ?? 1;
        return classId === studentClass?.id && coeff === 1;
    });
    const getSubjectName = (subId) => {
        return subjects.find((s) => s.id === subId)?.name || "Inconnu";
    };
    const getSubjectCode = (subId) => {
        const sub = subjects.find((s) => s.id === subId);
        return sub?.name ? sub.name.substring(0, 3).toUpperCase() : "SUB";
    };
    const now = new Date();
    // 4. VISIBLE ACADEMIC EXAMS
    const visibleAssignedExams = academicExams.filter((exam) => {
        if (exam.isActive === false)
            return false;
        const status = exam.status || (exam.isActive ? "PUBLISHED" : "DRAFT");
        if (status !== "PUBLISHED")
            return false;
        const openingDateStr = exam.openingDate || exam.startDate;
        const opening = new Date(openingDateStr);
        if (now < opening) {
            return false; // Hidden until opening
        }
        const isSubmitted = attempts.some((a) => a.examId === exam.id && a.studentId === currentUser.id && (a.status === "completed" || a.status === "graded"));
        return !isSubmitted;
    });
    // 5. VISIBLE PRACTICE EXAMS 
    const visiblePracticeExams = practiceExams.filter((exam) => {
        if (exam.isActive === false)
            return false;
        const status = exam.status || (exam.isActive ? "PUBLISHED" : "DRAFT");
        if (status !== "PUBLISHED")
            return false;
        const openingDateStr = exam.openingDate || exam.startDate;
        const opening = new Date(openingDateStr);
        if (now < opening)
            return false; // Hidden until opening
        return true;
    });
    // 6. SYNTHESIZE SUBMISSIONS DATA
    const submissions = attempts
        .filter((a) => a.studentId === currentUser.id && (a.status === "completed" || a.status === "graded"))
        .map((a) => {
        const attemptResponses = responses.filter((r) => r.examId === a.examId && r.studentId === a.studentId);
        const formattedAnswers = attemptResponses.map((r) => {
            const q = questions.find((question) => question.id === r.questionId);
            let selectedChoiceId = "";
            if (r.answerOptions && r.answerOptions.length > 0) {
                selectedChoiceId = r.answerOptions.map((idx) => String.fromCharCode(97 + idx)).join(",");
            }
            return {
                questionId: r.questionId,
                selectedChoiceId,
                textAnswer: r.answerString || (r.answerBool !== undefined ? String(r.answerBool) : ""),
                codeSubmission: r.answerCode ? {
                    code: r.answerCode,
                    testCasesPassed: (r.obtainedScore !== undefined && q && r.obtainedScore === q.points) ? q.points : 1,
                    testCasesTotal: q?.points || 1,
                } : undefined,
            };
        });
        const firstFeedback = attemptResponses.find((r) => r.feedback)?.feedback || "";
        return {
            id: a.id,
            examId: a.examId,
            studentId: a.studentId,
            isGraded: a.status === "graded",
            score: a.score ?? 0,
            submissionTime: a.submittedAt || "",
            teacherFeedback: firstFeedback,
            answers: formattedAnswers,
            antiFraudIncidentCount: a.suspiciousEvents?.length || 0,
            antiFraudDetails: (a.suspiciousEvents || []).map((e) => `[${e.type}] ${e.description}`),
        };
    });
    const completedSubmissions = submissions;
    // Render score statistics values
    const gradesData = completedSubmissions
        .filter((s) => s.isGraded)
        .map((s) => {
        const exam = exams.find((e) => e.id === s.examId);
        return {
            name: exam ? exam.title.substring(0, 15) + "..." : "Examen",
            grade: s.score || 0,
            coefficient: exam?.coefficient || 1,
        };
    });
    const averageGrade = gradesData.length > 0
        ? (gradesData.reduce((acc, current) => acc + current.grade, 0) /
            gradesData.length).toFixed(1)
        : "Aucune note";
    // Simulate receipt download
    const handleDownloadReceipt = (sub) => {
        const exam = exams.find((e) => e.id === sub.examId);
        if (!exam)
            return;
        const receiptContent = `
=============================================
             REÇU ACADÉMIQUE DE SOUMISSION
                 QUIZTECH EDTECH
=============================================
Date : ${new Date(sub.submissionTime || "").toLocaleString()}
Étudiant : ${currentUser.name} (${currentUser.email})
Classe : ${studentClass?.name || "Génie Logiciel"}
Examen : ${exam.title}
Coefficient : ${exam.coefficient || 2}

Rapport d'Intégrité :
- Incidents suspectés : ${sub.antiFraudIncidentCount}
- Journal d'alertes : 
  ${sub.antiFraudDetails.length > 0 ? sub.antiFraudDetails.join("\n  ") : "Aucun incident répertorié. Compte-rendu conforme d'intégrité."}

Code d'empreinte digitale numérique cryptographique MD5 :
${Math.random().toString(36).substring(2, 11).toUpperCase()}-${Math.random().toString(36).substring(2, 11).toUpperCase()}
=============================================
    `;
        const blob = new Blob([receiptContent], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Recu_${exam.title.replace(/\s+/g, "_")}.txt`;
        link.click();
        URL.revokeObjectURL(url);
    };
    const handleDownloadResource = (res) => {
        const textCode = `
=============================================
             DOCUMENT PEDAGOGIQUE - QUIZTECH
=============================================
Document : ${res.title}
Matière : ${getSubjectName(res.subjectId)}
Déposé par : ${res.uploadedBy}
Date : ${new Date(res.uploadDate).toLocaleDateString()}
Taille : ${res.fileSize}
Type : ${res.fileType}

Résumé du contenu support de cours :
${res.description}
---------------------------------------------
QuizTech EdTech Module, Faculté de Technologie.
=============================================
    `;
        const blob = new Blob([textCode], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${res.title.replace(/\s+/g, "_")}.${res.fileType.toLowerCase()}`;
        link.click();
        URL.revokeObjectURL(url);
    };
    // 7. MAPS ANNOUNCEMENTS AND RESOURCES TO BE HOMOGENOUS WITH COMPONENT IMPORTS
    const announcementsMapped = announcements.map((a) => ({
        id: a.id,
        title: a.title,
        message: a.content,
        timestamp: a.date,
        author: a.authorName,
        target: a.target || "ALL",
    }));
    const resourcesMapped = resources.map((r) => ({
        id: r.id,
        title: r.title,
        description: "Support de cours pour votre classe d'études.",
        subjectId: r.subjectId,
        classRoomId: studentClass?.id || "cl1", // Filtered according to classroom
        uploadedBy: r.authorName || "Professeur",
        uploadDate: r.date,
        fileSize: "1.2 MB",
        fileType: r.type.toUpperCase() || "PDF",
    }));
    // ── BACKGROUND AUTO SAVE DRAFT ──────────────────────────────────────────
    useEffect(() => {
        let autoSaveInterval;
        if (activeExamId) {
            autoSaveInterval = setInterval(() => {
                handleAutoSaveDraft();
            }, 30000);
        }
        return () => clearInterval(autoSaveInterval);
    }, [activeExamId, sessionResponses]);
    // ── COUNTDOWN TIMER ENGINE ──────────────────────────────────────────────
    useEffect(() => {
        let watchInterval;
        if (activeExamId) {
            const activeExamObj = exams.find((e) => e.id === activeExamId);
            if (activeExamObj) {
                const totalDurationSeconds = (activeExamObj.durationMinutes || activeExamObj.duration) * 60;
                setElapsedSeconds(totalDurationSeconds);
                watchInterval = setInterval(() => {
                    setElapsedSeconds((prev) => {
                        if (prev <= 1) {
                            clearInterval(watchInterval);
                            handleAutoSubmitExam(activeExamId);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }
        }
        return () => clearInterval(watchInterval);
    }, [activeExamId]);
    // ── ANTI-FRAUD UNBLUR EVENT BINDING ──────────────────────────────────────
    useEffect(() => {
        const handleStudentBlur = () => {
            if (activeExamId) {
                setSuspicionCount((prev) => {
                    const updated = prev + 1;
                    onAddLog("Tentative Fraude", `L'étudiant ${currentUser.name} a perdu le focus de l'écran d'examen active (événement blur/visibility). Suspicion #${updated}`);
                    return updated;
                });
                alert("⚠️ ALERTE SÉCURITÉ ANTI-FRAUDE ⚠️\n\nVous quittez la fenêtre d'évaluation active. Les interruptions ou sorties d'examens sont journalisées et notifiées au correcteur de HighTech School !");
            }
        };
        window.addEventListener("blur", handleStudentBlur);
        return () => {
            window.removeEventListener("blur", handleStudentBlur);
        };
    }, [activeExamId]);
    const handleAutoSaveDraft = () => {
        setLastSaved(new Date().toLocaleTimeString());
    };
    // ── LAUNCH EXAM SESSION (CALLED BY THE CORRESPONDING ACCORDING ONSTART CALLBACK) ────────────────
    const handleStartExam = (exam, isTesting = false) => {
        const now = new Date();
        const openingDateStr = exam.openingDate || exam.startDate;
        const closingDateStr = exam.closingDate || exam.endDate;
        const start = new Date(openingDateStr);
        const end = new Date(closingDateStr);
        if (now < start) {
            alert(`⚠️ ACCÈS REJETÉ (Exigence EF1) ⚠️\n\nLa date de programmation de cet examen n'est pas encore atteinte.\nSession ouvrira le : ${start.toLocaleString()}`);
            return;
        }
        if (now > end) {
            alert(`⚠️ ACCÈS REJETÉ (Exigence EF1) ⚠️\n\nLa de validité temporelle de cet examen a expiré.\nFermeture était le : ${end.toLocaleString()}`);
            return;
        }
        // Attempt constraint validation
        const coeff = exam.coefficient ?? 2;
        if (coeff > 1 && !isTesting) {
            const alreadyPassed = attempts.some((a) => a.studentId === currentUser.id && a.examId === exam.id);
            if (alreadyPassed) {
                alert("⚠️ LIMITATION UNIQUE (Exigence EF4) ⚠️\n\nVous avez déjà soumis votre participation pour cet examen. Vous ne pouvez passer chaque épreuve qu'une seule fois.");
                return;
            }
        }
        onAddLog("Lancement Épreuve", `Étudiant ${currentUser.name} a démarré l'épreuve : "${exam.title}"`);
        const examQuestions = questions.filter((q) => q.examId === exam.id);
        const emptyResp = {};
        examQuestions.forEach((q) => {
            if (q.type === "qcm")
                emptyResp[q.id] = [];
            else if (q.type === "vrai_faux")
                emptyResp[q.id] = undefined;
            else if (q.type === "programmation")
                emptyResp[q.id] = q.starterCode || "";
            else
                emptyResp[q.id] = "";
        });
        setSessionResponses(emptyResp);
        setSuspicionCount(0);
        setCurrentQuestionIndex(0);
        setActiveExamId(exam.id);
        setLastSaved("Session démarrée");
    };
    const processExamSubmissionAndGrading = (examId, currentResponses, finalSuspicions) => {
        const examObj = exams.find((e) => e.id === examId);
        if (!examObj)
            return;
        const examQuestions = questions.filter((q) => q.examId === examId);
        let cumulativeScore = 0;
        let manualGradingRequired = false;
        const responsesToRegister = [];
        examQuestions.forEach((q) => {
            const studentAns = currentResponses[q.id];
            let isCorrect = false;
            let obtainedScore = undefined;
            if (q.type === "vrai_faux") {
                isCorrect = studentAns === q.correctBool;
                obtainedScore = isCorrect ? q.points : 0;
            }
            else if (q.type === "qcm") {
                const correctOpts = q.correctOptions || [];
                const studentOpts = studentAns || [];
                isCorrect =
                    correctOpts.length === studentOpts.length &&
                        correctOpts.every((val) => studentOpts.includes(val));
                obtainedScore = isCorrect ? q.points : 0;
            }
            else if (q.type === "reponse_courte") {
                const textAns = (studentAns || "").toString().trim().toLowerCase();
                isCorrect = (q.correctShortAnswers || []).some((ans) => ans.trim().toLowerCase() === textAns);
                obtainedScore = isCorrect ? q.points : 0;
            }
            else if (q.type === "programmation") {
                let allPassed = true;
                try {
                    const wrapper = new Function(`
            ${studentAns}
            return sommePairs || trouverMaximum || (() => 0);
          `);
                    const fn = wrapper();
                    const testCases = q.testCases || [];
                    testCases.forEach((tc) => {
                        const result = fn(JSON.parse(tc.input));
                        if (result.toString() !== tc.output.toString()) {
                            allPassed = false;
                        }
                    });
                }
                catch {
                    allPassed = false;
                }
                isCorrect = allPassed;
                obtainedScore = isCorrect ? q.points : 0;
            }
            else if (q.type === "ouverte") {
                manualGradingRequired = true;
            }
            responsesToRegister.push({
                examId,
                questionId: q.id,
                studentId: currentUser.id,
                answerString: q.type === "ouverte" || q.type === "reponse_courte" ? studentAns : undefined,
                answerBool: q.type === "vrai_faux" ? studentAns : undefined,
                answerOptions: q.type === "qcm" ? studentAns : undefined,
                answerCode: q.type === "programmation" ? studentAns : undefined,
                isCorrect: q.type !== "ouverte" ? isCorrect : undefined,
                obtainedScore: obtainedScore,
                autoGraded: q.type !== "ouverte",
            });
            if (obtainedScore !== undefined) {
                cumulativeScore += obtainedScore;
            }
        });
        onUpdateResponses([
            ...responses.filter((r) => !(r.examId === examId && r.studentId === currentUser.id)),
            ...responsesToRegister,
        ]);
        const newAttempt = {
            id: `att-${Date.now()}`,
            examId,
            studentId: currentUser.id,
            status: manualGradingRequired ? "completed" : "graded",
            score: manualGradingRequired ? undefined : cumulativeScore,
            maxScore: examObj.totalPoints,
            startedAt: new Date(Date.now() - (examObj.durationMinutes || examObj.duration) * 60 * 1000).toISOString(),
            submittedAt: new Date().toISOString(),
            suspiciousEvents: finalSuspicions > 0
                ? [
                    {
                        id: `susp-${Date.now()}`,
                        type: "focus_lost",
                        timestamp: new Date().toISOString(),
                        description: `L'étudiant s'est désengagé de la page épreuve ${finalSuspicions} fois.`,
                    },
                ]
                : [],
        };
        onUpdateAttempts([...attempts, newAttempt]);
        onAddLog("Soumission Examen", `Copie de l'étudiant ${currentUser.name} soumise et sauvegardée pour l'examen "${examObj.title}".`);
    };
    const handleManualSubmit = () => {
        if (confirm("Voulez-vous finaliser l'épreuve et soumettre vos réponses ?")) {
            processExamSubmissionAndGrading(activeExamId, sessionResponses, suspicionCount);
            setActiveExamId(null);
        }
    };
    const handleAutoSubmitExam = (examId) => {
        alert("⌛ TEMPS ÉCOULÉ (Exigence EF2) ! ⌛\n\nVotre temps de session est écoulé. Le système gèle vos entrées de formulaire et soumet immédiatement vos réponses enregistrées.");
        processExamSubmissionAndGrading(examId, sessionResponses, suspicionCount);
        setActiveExamId(null);
    };
    const runCodeTestCaseCompiler = (starterCode, testCases) => {
        setConsoleOutput("");
        const caseStatuses = [];
        try {
            const solverWrapper = new Function(`
        ${starterCode}
        return sommePairs || trouverMaximum || function() { return "Undefined Function"; };
      `);
            const fn = solverWrapper();
            let compiledLogs = "🚀 EXECUTION CONSOLE OK\n\n";
            testCases.forEach((tc, idx) => {
                const parsedInput = JSON.parse(tc.input);
                const userOutput = fn(parsedInput);
                const pass = userOutput.toString() === tc.output.toString();
                caseStatuses.push(pass);
                compiledLogs += `Jeu d'essai #${idx + 1} :\n  ↳ Entrée : ${tc.input}\n  ↳ Filtre Sortie : ${userOutput}\n  ↳ Résultat attendu : ${tc.output}\n  ↳ État : [${pass ? "✓ PASS" : "✗ FAIL"}]\n\n`;
            });
            setConsoleOutput(compiledLogs);
            setCodeTestCaseResults(caseStatuses);
        }
        catch (err) {
            setConsoleOutput(`❌ ERREUR DE SYNTAXE OU DE COMPILATION\n\n${err.message}`);
            setCodeTestCaseResults(testCases.map(() => false));
        }
    };
// Les états bach t-fixi l'ReferenceError
  const [selectedAnn, setSelectedAnn] = useState(null);
  const [selectedRes, setSelectedRes] = useState(null);















    return (<div id="student-dashboard" className={activeExamId ? "w-full text-slate-100 font-sans" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans"}>
      {/* ── CONDITIONAL RENDER 1: NORMAL DASHBOARD VIEWPORT ────────────────────── */}
      {!activeExamId && (<>
         

          {/* Grid: Left Column Stats and Right Column Exam list toggler */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - 4 layout cols */}
<div className="lg:col-span-4 space-y-6">
  
  {/* Card 1: Profil Étudiant - Style Minimaliste */}
  <div className="relative bg-white p-7 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
    <div className="flex items-center gap-6">
      <div className="relative ">
        <img  id="current-navbar-avatar" src={currentUser.profilePic || currentUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser.name)}`} alt={currentUser.name} 
        className="w-12 h-12 rounded-full border border-slate-200 bg-white object-cover" onError={(e) => {
                 }}/>
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 border-4 border-white rounded-full" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{currentUser.name}</h2>
        <div className="flex gap-2 mt-2">
          <span className="px-2 pt-2 py-1 bg-slate-900 text-white text-[7px] font-bold rounded-full uppercase tracking-widest">
            {currentUser.role || "Étudiant"}
          </span>
          <span className="px-3 pt-1 py-1 bg-slate-100 text-slate-600 text-[7px] font-bold rounded-full uppercase tracking-widest">
            {studentClass?.name || "Standard"}
          </span>
        </div>
      </div>
    </div>
  </div>

  {/* Card 2: Insights Académiques (Layout en 1 seule ligne pour les stats) */}
  <div className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Tableau de bord</h3>
      <span className="text-[10px] font-bold text-[#F4C542] bg-[#F4C542]/10 px-3 py-1 rounded-full">A.U. 2025-2026</span>
    </div>
    
    <div className="flex justify-between items-end mb-8">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Moyenne Générale</p>
        <span className="text-5xl font-black text-slate-900">{averageGrade}<span className="text-xl text-slate-300">/20</span></span>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Modules Validés</p>
        <span className="text-3xl font-black text-[#F4C542]">{completedSubmissions.length}</span>
      </div>
    </div>

    {/* Graphique épuré */}
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={gradesData}>
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '1rem', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
          />
          <Line type="stepAfter" dataKey="grade" stroke="#4f46e5" strokeWidth={5} dot={{ fill: '#4f46e5', strokeWidth: 4, stroke: '#fff', r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>

 
</div>

            {/* Right Column (Toggles & Actionable exam cards) - 8 layout cols */}
            <div className="lg:col-span-8 space-y-6">
              {/* Nav pills */}
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row flex-wrap gap-2 select-none w-full max-w-full overflow-hidden">
                <button onClick={() => {
                setActiveTab("assigned");
                setSelectedSubmissionForReview(null);
            }} className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === "assigned"
                ? "bg-[#0F172A] text-white"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
                  Examens Officiels ({visibleAssignedExams.length})
                </button>
                <button onClick={() => {
                setActiveTab("completed");
            }} className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === "completed"
                ? "bg-[#0F172A] text-white"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
                  Historique & Résultats ({completedSubmissions.length})
                </button>
                <button onClick={() => {
                setActiveTab("resources");
            }} className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === "resources"
                ? "bg-[#0F172A] text-white"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
                  Ressources & Scolarité
                </button>
              </div>


{activeTab === "assigned" && (
  <div className="space-y-6">
    {visibleAssignedExams.length === 0 ? (
    <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200 h-[450px] flex flex-col items-center justify-center">
  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
    <BookOpen className="w-10 h-10 text-slate-300" />
  </div>
  <h3 className="text-lg font-bold text-slate-900 mb-2">Aucun examen en attente</h3>
  <p className="text-sm text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
    Les examens approuvés s'afficheront ici dès qu'ils seront publiés par l'équipe pédagogique.
  </p>
</div>
    ) : (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {visibleAssignedExams.map((exam) => {
          const durationInMin = exam.durationMinutes || exam.duration;
          return (
            <div 
              key={exam.id} 
              className="group bg-white p-7 rounded-3xl  transition-all duration-300 flex flex-col"
            >
              <div className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#F4C542] bg-[#F4C542]/10 px-3 py-1 rounded-lg">
                  {getSubjectCode(exam.subjectId)}
                </span>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                  <Clock className="w-3.5 h-3.5 text-[#F4C542]" />
                  {durationInMin} Min
                </div>
              </div>

              <div className="mb-8 flex-grow">
                <h4 className="font-extrabold text-slate-900 text-base mb-2  transition-colors">
                  {exam.title}
                </h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">
                  {exam.description}
                </p>
              </div>

              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Coefficient: <span className="text-slate-900 font-black">{exam.coefficient || 2}</span>
                </div>
                <button 
                  onClick={() => handleStartExam(exam, false)} 
                  className="bg-slate-900 hover:bg-slate-900/80 text-white font-bold text-xs py-3 px-6 rounded-xl flex items-center gap-2 transition-all active:scale-95"
                >
                  Démarrer l'examen
                  <Play className="w-3 h-3 fill-current" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    )}
  </div>
)}

              {activeTab === "practice" && (<div className="space-y-4">
                  <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-200 text-xs font-semibold text-amber-900 flex gap-2 items-start">
                    <p>
                      <span className="font-bold">Zone d'entraînement :</span> Les questionnaires ci-dessous servent de révisions personnelles. Les scores d'entraînements ne sont pas inclus dans votre moyenne d'études.
                    </p>
                  </div>

                  {visiblePracticeExams.length === 0 ? (<div className="bg-white py-12 text-center rounded-2xl border border-slate-100 select-none">
                      <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-2"/>
                      <p className="text-sm font-bold text-slate-800">
                        Aucun outil d'entraînement disponible actuellement
                      </p>
                    </div>) : (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {visiblePracticeExams.map((exam) => (<div key={exam.id} className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between hover:border-amber-400 transition-all space-y-4">
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                Entraînement Libre
                              </span>
                              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-amber-500"/>
                                {exam.durationMinutes || exam.duration} Min
                              </span>
                            </div>
                            <h4 className="font-extrabold text-slate-900 text-sm">
                              {exam.title}
                            </h4>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-2">
                              {exam.description}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400 font-bold">
                              {questions.filter((q) => q.examId === exam.id).length} questions
                            </span>
                            <button onClick={() => handleStartExam(exam, true)} className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-xs py-2 px-4 rounded-lg flex items-center gap-1 transition-all cursor-pointer">
                              Lancer le questionnaire
                              <Play className="w-3.5 h-3.5"/>
                            </button>
                          </div>
                        </div>))}
                    </div>)}
                </div>)}

          



{activeTab === "completed" && (
  <div className="space-y-6">
    {completedSubmissions.length === 0 ? (
    <div className="bg-white p-12 text-center rounded-[2rem] border border-dashed border-slate-200 h-[450px] flex flex-col items-center justify-center transition-all hover:border-indigo-300">
  {/* Icon Wrapper */}
  <div className="w-20 h-20 bg-[#F4C542]/10 rounded-full flex items-center justify-center mx-auto mb-6">
    <CheckCircle2 className="w-10 h-10 text-[#F4C542]" />
  </div>
  {/* Text Content */}
  <h3 className="text-lg font-bold text-slate-900 mb-2">Aucun historique</h3>
  <p className="text-sm text-slate-400 font-medium max-w-[400px] mx-auto leading-relaxed">
    Vos examens terminés et vos résultats apparaîtront ici une fois que vous aurez terminé votre première session.
  </p>
  

</div>
    ) : (
      <div className="grid grid-cols-1 gap-6">
        {completedSubmissions.map((sub) => {
          const exam = exams.find((e) => e.id === sub.examId);
          if (!exam) return null;

          return (
            <div 
              key={sub.id} 
              className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex items-center justify-between"
            >
              <div className="space-y-2">
                <span className="inline-block px-3 py-1 text-[13px] font-bold text-[#F4C542] bg-slate-50  px-3 py-1 rounded-full">
                  {getSubjectName(exam.subjectId)}
                </span>
                <h4 className="text-xl font-bold text-slate-900">{exam.title}</h4>
                <p className="text-sm text-slate-500 font-medium">
                  Soumis le : {new Date(sub.submissionTime || "").toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Note obtenue</p>
                  <p className={`text-2xl font-black ${sub.isGraded ? "text-slate-900" : "text-amber-500"}`}>
                    {sub.isGraded ? `${sub.score}/20` : "En attente"}
                  </p>
                </div>
               <button 
  onClick={() => setSelectedSubmissionForReview(sub)}
  className="w-12 h-12 flex items-center justify-center bg-slate-50  text-slate-400  rounded-2xl transition-all duration-300 border border-slate-100 group"
  title="Voir les détails"
>
  <Eye className="w-5 h-5 transition-transform group-hover:scale-110" />
</button>
              </div>
            </div>
          );
        })}
      </div>
    )}

    {/* Modal Détails */}
    {selectedSubmissionForReview && (() => {
      const exam = exams.find((e) => e.id === selectedSubmissionForReview.examId);
      
    return (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/30 backdrop-blur-md animate-in fade-in duration-200">
    <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col transform transition-all animate-in zoom-in-95 duration-300">
      
      {/* Header avec un léger gradient */}
      <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Correction</h2>
          <p className="text-sm text-slate-500 font-medium">{exam?.title}</p>
        </div>
        <button 
          onClick={() => setSelectedSubmissionForReview(null)} 
          className="p-2.5 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-full transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Corps Scrollable */}
      <div className="overflow-y-auto p-8 bg-slate-50/50">
        <div className="space-y-6">
          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Détail des Réponses</h5>
          
          {exam?.questions?.map((q, idx) => {
            const ans = selectedSubmissionForReview.answers.find((a) => a.questionId === q.id);
            const isCorrect = ans?.isCorrect; // Supposons que tu as ce champ

           return (
  <div 
    key={q.id} 
    className="group bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-100 transition-all duration-300"
  >
    {/* Question Header */}
    <div className="flex justify-between items-start gap-6">
      <p className="font-bold text-slate-800 text-[15px] leading-relaxed">
        <span className="text-[#F4C542] mr-3 font-black text-lg">
          {String(idx + 1).padStart(2, '0')}.
        </span> 
        {q.prompt}
      </p>
      
      <span className={`shrink-0 px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg ${ans ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
        {ans ? "Répondu" : "Non répondu"}
      </span>
    </div>
    
    {/* Answer Block */}
    <div className="mt-5 p-5 bg-slate-50/50 border border-slate-200/60 rounded-2xl transition-colors hover:bg-slate-50">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          Votre réponse
        </span>
        {ans && (
          <div className="w-1.5 h-1.5 rounded-full bg-[#F4C542]  text-[#F4C542] animate-pulse"></div>
        )}
      </div>
      
      <p className={`text-[14px] font-medium leading-relaxed italic border-l-4 pl-4 py-1 transition-colors ${ans ? "text-slate-700 border-indigo-500" : "text-slate-400 border-slate-200"}`}>
        {ans?.textAnswer || (
          <span className="not-italic opacity-60">
            Aucune réponse fournie.
          </span>
        )}
      </p>
    </div>
  </div>
);
          })}
        </div>
      </div>

      {/* Footer Design */}
      <div className="px-8 py-6 border-t border-slate-100 bg-white flex justify-between items-center">
        <p className="text-[11px] text-slate-400 font-medium">Généré automatiquement par le système d'examen.</p>
        <button 
          onClick={() => handleDownloadReceipt(selectedSubmissionForReview)} 
          className="px-6 py-3 bg-slate-900 hover:bg-slate-900/80  text-white text-xs font-black rounded-xl flex items-center gap-2 transition-all active:scale-95"
        >
          <Download className="w-4 h-4"/> Exporter PDF
        </button>
      </div>
    </div>
  </div>
);
    })()}
  </div>
)}





{activeTab === "resources" && (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
    
    {/* 1. Section Annonces */}
    <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col h-[500px]"> {/* Fixed height for section */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg text-slate-400 flex items-center justify-center text-indigo-500">
            <Bell className="w-3.5 h-3.5" />
          </div>
          Annonces Officielles
        </h3>
      </div>

      {/* Scrolleable Area */}
      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {announcementsMapped.map((ann) => (
          <div key={ann.id} className="group p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-white hover:shadow-lg transition-all duration-300 flex items-center justify-between">
            <div className="min-w-0 pr-4">
              <h4 className="font-bold text-slate-800 text-sm truncate">{ann.title}</h4>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1">Par : {ann.author}</p>
            </div>
            <button onClick={() => setSelectedAnn(ann)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-95">
              <Eye className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>

    {/* 2. Section Supports */}
    <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col h-[500px]">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
        <div className="w-6 h-6 rounded-lg text-slate-400 flex items-center justify-center text-amber-500">
          <FileText className="w-3.5 h-3.5" />
        </div>
        Supports de Cours
      </h3>
      
      {/* Scrolleable Area */}
      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {resourcesMapped.map((res) => (
          <div key={res.id} className="group p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-amber-100 hover:bg-white hover:shadow-lg transition-all duration-300 flex items-center justify-between">
            <div className="min-w-0 pr-4">
              <h4 className="font-bold text-slate-800 text-xs truncate">{res.title}</h4>
              <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mt-1">
                {res.fileType} • {getSubjectName(res.subjectId)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setSelectedRes(res)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-amber-500 hover:text-white transition-all active:scale-95">
                <Eye className="w-4 h-4" />
              </button>
              <button onClick={() => handleDownloadResource(res)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-900 hover:text-white transition-all active:scale-95">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
</div>
)}

   {/* 1. MODAL ANNONCES */}
{selectedAnn && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedAnn(null)} />
    
    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-300 ">
      <div className="h-2 bg-slate-800  w-full" />
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/10  flex items-center justify-center text-slate-800 ">
            <Bell className="w-6 h-6" />
          </div>
          <button onClick={() => setSelectedAnn(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-5 h-5"/></button>
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-2">{selectedAnn.title}</h2>
        <p className="text-slate-600 leading-relaxed mb-8 bg-slate-50 p-6 rounded-2xl text-sm">{selectedAnn.message}</p>
        <button onClick={() => setSelectedAnn(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">Fermer</button>
      </div>
    </div>
  </div>
)}

{/* 2. MODAL SUPPORTS */}
{selectedRes && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedRes(null)} />
    
    <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in zoom-in-95 duration-300 ">
      <div className="h-2 bg-amber-500 w-full" />
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <FileText className="w-6 h-6" />
          </div>
          <button onClick={() => setSelectedRes(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-5 h-5"/></button>
        </div>
        <h2 className="text-2xl font-black text-slate-800 mb-1">{selectedRes.title}</h2>
        <p className="text-amber-600 font-bold text-xs uppercase tracking-widest mb-6">{selectedRes.fileType}</p>
        <p className="text-slate-600 leading-relaxed mb-8 bg-slate-50 p-6 rounded-2xl text-sm">{selectedRes.description || "Aucune description disponible."}</p>
        
        <div className="flex gap-3">
          <button onClick={() => handleDownloadResource(selectedRes)} className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-600 flex items-center justify-center gap-2">
            <Download className="w-5 h-5"/> Télécharger
          </button>
          <button onClick={() => setSelectedRes(null)} className="px-8 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200">Fermer</button>
        </div>
      </div>
    </div>
  </div>
)}



            </div>
          </div>
        </>)}

      {/* ── CONDITIONAL RENDER 2: ACTIVE EXAM STUDY ENTRY ────────────────────── */}
      {activeExamId && activeExamObj && (<React.Fragment>
          <ExamRoom exam={activeExamObj} isPractice={activeTab === "practice"} onCancelExam={() => setActiveExamId(null)} onSubmitCompleted={(examRoomAnswers, infractionCount, infractionLogs) => {
                // Convert ExamRoom answers back into StudentPanel's sessionResponses map format
                const convertedResponses = {};
                examRoomAnswers.forEach((ans) => {
                    const q = questions.find((tempQ) => tempQ.id === ans.questionId);
                    if (!q)
                        return;
                    if (q.type === "qcm" || q.type === "MCQ") {
                        const selectedIds = ans.selectedChoiceId ? ans.selectedChoiceId.split(",").filter(Boolean) : [];
                        const indices = selectedIds.map((id) => {
                            const idx = parseInt(id, 10);
                            if (!isNaN(idx))
                                return idx;
                            if (q.options) {
                                return q.options.indexOf(id);
                            }
                            return -1;
                        }).filter((idx) => idx !== -1);
                        convertedResponses[ans.questionId] = indices;
                    }
                    else if (q.type === "vrai_faux" || q.type === "TRUE_FALSE") {
                        convertedResponses[ans.questionId] = ans.textAnswer === "true" || ans.textAnswer === true;
                    }
                    else if (q.type === "programmation" || q.type === "PROGRAMMING") {
                        convertedResponses[ans.questionId] = ans.codeSubmission?.code || "";
                    }
                    else {
                        convertedResponses[ans.questionId] = ans.textAnswer || "";
                    }
                });
                processExamSubmissionAndGrading(activeExamId, convertedResponses, infractionCount);
                setActiveExamId(null);
            }}/>
          {false && (<div className="space-y-6 text-left" style={{ minHeight: "100vh", paddingBottom: 60 }}>
          {/* Top fixed heading (TIMER COMPONENT) */}
          <div className="bg-[#1e272c] text-white p-4 rounded-xl flex items-center justify-between border border-slate-800 shadow sticky top-0 z-50">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#fbd057]">SESSION EXAMEN EN COURS</span>
              <h3 className="font-extrabold text-sm">{exams.find((e) => e.id === activeExamId)?.title}</h3>
            </div>

            {/* Countdown timer */}
            <div className="bg-red-500 text-white font-extrabold text-sm font-mono py-1.5 px-4 rounded-xl border border-red-400 shadow animate-pulse flex items-center gap-1.5">
              <Clock size={16}/>
              <span>
                {Math.floor(elapsedSeconds / 60)}m : {elapsedSeconds % 60}s
              </span>
            </div>
          </div>

          {/* Passage navigation & content columns */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left side numerical indicators */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3 lg:col-span-1 text-left">
              <span className="block text-[10px] uppercase tracking-widest font-black text-slate-400 mb-2">INDEX DES QUESTIONS</span>

              <div className="grid grid-cols-3 lg:grid-cols-2 gap-2">
                {questions
                    .filter((q) => q.examId === activeExamId)
                    .map((q, idx) => {
                    const checkHasResponse = sessionResponses[q.id] !== undefined &&
                        sessionResponses[q.id] !== "" &&
                        (Array.isArray(sessionResponses[q.id]) ? sessionResponses[q.id].length > 0 : true);
                    return (<button key={q.id} onClick={() => setCurrentQuestionIndex(idx)} className={`relative p-2.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${idx === currentQuestionIndex
                            ? "bg-slate-900 border-slate-900 text-[#fde399]"
                            : checkHasResponse
                                ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                                : "border-slate-200 text-slate-650"}`}>
                        Question {idx + 1}
                        {checkHasResponse && idx !== currentQuestionIndex && (<span className="absolute -top-1.5 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500"/>)}
                      </button>);
                })}
              </div>

              {/* Status details info */}
              <div className="pt-4 border-t space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Dernier enregistrement :</span>
                  <span className="font-bold text-slate-800">{lastSaved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Suspicion Fraude Focus:</span>
                  <span className="font-black text-rose-600">{suspicionCount}</span>
                </div>
              </div>
            </div>

            {/* Centered target active content */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm lg:col-span-3 space-y-6">
              {(() => {
                    const examQuestions = questions.filter((q) => q.examId === activeExamId);
                    const activeQObj = examQuestions[currentQuestionIndex];
                    if (!activeQObj)
                        return <div>Erreur de chargement de la question active.</div>;
                    return (<div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black bg-slate-100 text-slate-500 px-3 py-1 rounded-lg uppercase tracking-wider">
                        STYLE: {activeQObj.type.toUpperCase()}
                      </span>
                      <span className="text-xs font-extrabold text-[#f2c343]">
                        Barême : {activeQObj.points} Points
                      </span>
                    </div>

                    <h4 className="text-base font-black text-slate-900">{activeQObj.prompt}</h4>

                    {/* VRAI/FAUX selection fields */}
                    {activeQObj.type === "vrai_faux" && (<div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setSessionResponses({ ...sessionResponses, [activeQObj.id]: true })} className={`flex-1 py-4 text-center rounded-xl border text-sm font-bold transition-all cursor-pointer ${sessionResponses[activeQObj.id] === true
                                ? "bg-slate-900 text-[#fde399] border-slate-900 font-extrabold"
                                : "border-slate-200 text-slate-600 bg-white"}`}>
                          VRAI
                        </button>
                        <button type="button" onClick={() => setSessionResponses({ ...sessionResponses, [activeQObj.id]: false })} className={`flex-1 py-4 text-center rounded-xl border text-sm font-bold transition-all cursor-pointer ${sessionResponses[activeQObj.id] === false
                                ? "bg-slate-900 text-[#fde399] border-slate-900 font-extrabold"
                                : "border-slate-200 text-slate-600 bg-white"}`}>
                          FAUX
                        </button>
                      </div>)}

                    {/* QCM checklist options list */}
                    {activeQObj.type === "qcm" && activeQObj.options && (<div className="space-y-3 pt-2">
                        {activeQObj.options.map((opt, idx) => {
                                const isSel = (sessionResponses[activeQObj.id] || []).includes(idx);
                                return (<div key={idx} onClick={() => {
                                        const currentList = sessionResponses[activeQObj.id] || [];
                                        const nextList = isSel ? currentList.filter((o) => o !== idx) : [...currentList, idx];
                                        setSessionResponses({ ...sessionResponses, [activeQObj.id]: nextList });
                                    }} className={`p-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-3 ${isSel ? "bg-[#fde399] bg-opacity-30 border-[#f2c343] text-slate-950 font-black" : "border-slate-200 text-slate-700 bg-white hover:bg-slate-50"}`}>
                              <input type="checkbox" checked={isSel} readOnly className="rounded text-[#f2c343] focus:ring-0 cursor-pointer"/>
                              <span>{opt}</span>
                            </div>);
                            })}
                      </div>)}

                    {/* TEXT ANSWER AREA for Open-ended or Short responses */}
                    {(activeQObj.type === "reponse_courte" || activeQObj.type === "ouverte") && (<div className="pt-2">
                        <textarea placeholder={activeQObj.type === "reponse_courte" ? "Saisissez un mot unique ou une expression courte..." : "Rédigez votre réponse structurée..."} value={sessionResponses[activeQObj.id] || ""} onChange={(e) => setSessionResponses({ ...sessionResponses, [activeQObj.id]: e.target.value })} className="w-full p-4 border border-slate-200 rounded-xl text-sm outline-none text-slate-800 bg-white min-h-[120px] focus:border-[#fbd057]"/>
                      </div>)}

                    {/* COMPILER JAVASCRIPT EXECUTABLE WINDOW */}
                    {activeQObj.type === "programmation" && (<div className="space-y-4 pt-2">
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">SOUMISSION COMPILATEUR JS</span>
                            <button type="button" onClick={() => runCodeTestCaseCompiler(sessionResponses[activeQObj.id], activeQObj.testCases || [])} className="bg-emerald-500 text-white font-extrabold text-[11px] py-1 px-3 rounded hover:bg-emerald-600 flex items-center gap-1 cursor-pointer">
                              <Play size={11}/> Exécuter le code test cases
                            </button>
                          </div>

                          <textarea value={sessionResponses[activeQObj.id] || ""} onChange={(e) => setSessionResponses({ ...sessionResponses, [activeQObj.id]: e.target.value })} className="w-full h-56 font-mono text-xs text-emerald-400 bg-slate-950 p-4 border border-slate-850 rounded-lg outline-none resize-none focus:ring-1 focus:ring-emerald-400 font-mono"/>
                        </div>

                        {/* Stdin outputs console */}
                        <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl font-mono text-xs text-slate-200">
                          <span className="block text-[10px] text-slate-500 font-black uppercase mb-1">Standard Outputs / Rapport d'exécution</span>
                          <div className="whitespace-pre-line leading-relaxed text-[11px] text-emerald-300">
                            {consoleOutput || "En attente d'une compilation..."}
                          </div>
                        </div>
                      </div>)}

                    {/* Navigation Buttons footer */}
                    <div className="flex justify-between items-center pt-6 border-t mt-8">
                      <button type="button" disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)} className="py-1.5 px-3 border border-slate-200 rounded text-xs font-bold text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-white hover:bg-slate-50">
                        &larr; Précédente
                      </button>

                      {currentQuestionIndex < examQuestions.length - 1 ? (<button type="button" onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)} className="py-1.5 px-4 bg-slate-900 text-[#fde399] rounded text-xs font-bold hover:bg-slate-800 cursor-pointer">
                          Suivante &rarr;
                        </button>) : (<button type="button" onClick={handleManualSubmit} className="py-1.5 px-5 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 cursor-pointer">
                          Finaliser et Soumettre la Copie &check;
                        </button>)}
                    </div>
                  </div>);
                })()}
            </div>
          </div>
        </div>)}
        </React.Fragment>)}
    </div>);
}
