import React, { useState } from "react";
import { Plus, Trash2, Edit, Award, Clock, BookOpen, AlertCircle, Send, ShieldAlert, FileText, Check, CheckSquare,
     User, Settings, Calendar, Eye, Search,CheckCircle2, XCircle,SlidersHorizontal,X,GraduationCap,Megaphone,
    UploadCloud,} from "lucide-react";
export default function EnseignantDashboard({ currentUser: rawCurrentUser, exams = [], submissions = [], subjects = [], classes = [], students: allStudents = [], announcements = [], resources = [], onSyncAnnouncements, onSyncResources, }) {
    // Shadow and adapt original variables so standard TeacherPanel UI functions seamlessly
    const currentUser = {
        ...rawCurrentUser,
        name: rawCurrentUser?.fullName || rawCurrentUser?.name || "Professeur",
        role: "enseignant",
    };
    const users = (allStudents || []).map((s) => ({
        ...s,
        name: s.fullName || s.name,
        role: "etudiant"
    }));
    const attempts = (submissions || []).map((s) => ({
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
            description: typeof detail === "string" ? detail : detail?.message || "Activités suspectes"
        }))
    }));
    const responses = [];
    (submissions || []).forEach((s) => {
        if (s.answers) {
            s.answers.forEach((ans) => {
                responses.push({
                    examId: s.examId,
                    questionId: ans.questionId,
                    studentId: s.studentId,
                    answerString: ans.textAnswer || "",
                    answerBool: ans.textAnswer === "true" || ans.textAnswer === "vrai" || undefined,
                    answerOptions: ans.selectedChoiceId !== undefined ? [Number(ans.selectedChoiceId)] : undefined,
                    answerCode: ans.codeSubmission?.code || undefined,
                    feedback: s.teacherFeedback,
                    obtainedScore: s.score,
                    isCorrect: s.score >= 10
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
    const onUpdateExams = (updated) => {
        localStorage.setItem("qt_exams", JSON.stringify(updated));
        location.reload();
    };
    const onUpdateQuestions = (updated) => {
        localStorage.setItem("qt_questions", JSON.stringify(updated));
    };
    const onUpdateAnnouncements = onSyncAnnouncements;
    const onUpdateResources = onSyncResources;
    const onUpdateAttempts = (updated) => {
        // Map attempts back to submissions inside local storage
        const updatedSubmissions = submissions.map((sub) => {
            const matchAttempt = updated.find((att) => att.id === sub.id);
            if (matchAttempt) {
                return {
                    ...sub,
                    score: matchAttempt.score,
                    isGraded: matchAttempt.status === "graded"
                };
            }
            return sub;
        });
        localStorage.setItem("qt_submissions", JSON.stringify(updatedSubmissions));
    };
    const onUpdateResponses = (updated) => {
        localStorage.setItem("qt_responses", JSON.stringify(updated));
        // Extract feedbacks from updated responses and attach to submissions
        const updatedSubmissions = submissions.map((sub) => {
            const respMatches = updated.filter((r) => r.studentId === sub.studentId && r.examId === sub.examId);
            const withFeedback = respMatches.find((r) => r.feedback !== undefined);
            if (withFeedback) {
                return {
                    ...sub,
                    teacherFeedback: withFeedback.feedback
                };
            }
            return sub;
        });
        localStorage.setItem("qt_submissions", JSON.stringify(updatedSubmissions));
    };
    const onAddLog = (action, details) => {
        try {
            const logs = JSON.parse(localStorage.getItem("qt_audit_logs") || "[]");
            logs.push({
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString(),
                userId: rawCurrentUser?.id,
                userName: rawCurrentUser?.fullName || rawCurrentUser?.name || "Professeur",
                action,
                details
            });
            localStorage.setItem("qt_audit_logs", JSON.stringify(logs));
        }
        catch { }
    };
    const [activeSubTab, setActiveSubTab] = useState("overview");
    // Custom added states for Exams CRUD Dashboard and time prolongations
    const [gradingExamFilter, setGradingExamFilter] = useState("ALL");
    const [searchExamQuery, setSearchExamQuery] = useState("");
    const [extendingExamId, setExtendingExamId] = useState(null);
    const [extendingMinutes, setExtendingMinutes] = useState(15);
    // Local state for Exam Builder
    const [editingExamId, setEditingExamId] = useState(null);
    const [examTitle, setExamTitle] = useState("");
    const [examDesc, setExamDesc] = useState("");
    const [examSubjectId, setExamSubjectId] = useState(subjects[0]?.id || "");
    const [examClassId, setExamClassId] = useState(classes[0]?.id || "");
    const [examDuration, setExamDuration] = useState(60);
    const [examCoeff, setExamCoeff] = useState(2);
    const [examOpening, setExamOpening] = useState("2026-06-05T09:00");
    const [examClosing, setExamClosing] = useState("2026-06-12T18:00");
    // Question Builder state lists
    const [builderQuestions, setBuilderQuestions] = useState([]);
    // Individual Question Temporary builder state
    const [tempQPrompt, setTempQPrompt] = useState("");
    const [tempQType, setTempQType] = useState("MCQ");
    const [tempQCoeff, setTempQCoeff] = useState(4);
    const [tempQCorrect, setTempQCorrect] = useState("");
    // MCQ choices helper
    const [tempChoices, setTempChoices] = useState([
        { id: "a", text: "" },
        { id: "b", text: "" },
        { id: "c", text: "" },
        { id: "d", text: "" },
    ]);
    // Programming Question states
    const [tempCodeLang, setTempCodeLang] = useState("javascript");
    const [tempStarterCode, setTempStarterCode] = useState("");
    const [tempTestCases, setTempTestCases] = useState([{ input: "", output: "" }]);
    // Grading tool state
    const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
    const [manualScore, setManualScore] = useState(15);
    const [manualFeedback, setManualFeedback] = useState("");
    // Extra time builder state
    const [timeExamId, setTimeExamId] = useState(exams[0]?.id || "");
    const [timeClassId, setTimeClassId] = useState(classes[0]?.id || "");
    const [timeMinutes, setTimeMinutes] = useState(15);
    const [targetStudentId, setTargetStudentId] = useState("");
    // Announcements publisher form state
    const [annTitle, setAnnTitle] = useState("");
    const [annMessage, setAnnMessage] = useState("");
    const [annTarget, setAnnTarget] = useState("ALL");
    // Pedagogical resource form state
    const [resTitle, setResTitle] = useState("");
    const [resDescription, setResDescription] = useState("");
    const [resSubjectId, setResSubjectId] = useState(subjects[0]?.id || "");
    const [resClassRoomId, setResClassRoomId] = useState(classes[0]?.id || "");
    const [resFileType, setResFileType] = useState("PDF");
    // Format student list
    const students = users
        .filter((u) => u.role === "etudiant")
        .map((u) => ({
        id: u.id,
        fullName: u.name,
        email: u.email,
        role: "STUDENT",
        avatarUrl: u.profilePic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150"
    }));
    // Re-generate userExams internally from standard flat exams list so everything synchronises
    const userExams = exams
        .filter((ex) => ex.authorId === currentUser.id)
        .map((ex) => {
        const examQuestions = questions.filter((q) => q.examId === ex.id);
        const builderQs = examQuestions.map((q) => {
            let typeMapped = "MCQ";
            if (q.type === "vrai_faux")
                typeMapped = "TRUE_FALSE";
            else if (q.type === "reponse_courte")
                typeMapped = "SHORT_ANSWER";
            else if (q.type === "programmation")
                typeMapped = "PROGRAMMING";
            let correctAnswer = "";
            if (q.type === "qcm" && q.correctOptions) {
                correctAnswer = q.correctOptions.map(idx => String.fromCharCode(97 + idx)).join(",");
            }
            else if (q.type === "vrai_faux") {
                correctAnswer = q.correctBool ? "true" : "false";
            }
            else if (q.type === "reponse_courte" && q.correctShortAnswers) {
                correctAnswer = q.correctShortAnswers.join(",");
            }
            else if (q.type === "programmation") {
                correctAnswer = "true";
            }
            const choices = q.options?.map((opt, oIdx) => ({
                id: String.fromCharCode(97 + oIdx),
                text: opt
            })) || [];
            return {
                id: q.id,
                type: typeMapped,
                prompt: q.prompt,
                coefficient: q.points,
                correctAnswer,
                choices,
                programmingDetails: q.type === "programmation" ? {
                    language: q.codingLanguage || "javascript",
                    starterCode: q.starterCode || "",
                    testCases: q.testCases || []
                } : undefined
            };
        });
        return {
            id: ex.id,
            title: ex.title,
            description: ex.description,
            subjectId: ex.subjectId,
            classRoomId: ex.classRoomId || classes[0]?.id || "c1",
            teacherId: ex.authorId,
            durationMinutes: ex.duration,
            coefficient: ex.coefficient || 2,
            status: ex.status || (ex.isActive ? "PUBLISHED" : "DRAFT"),
            openingDate: ex.startDate,
            closingDate: ex.endDate,
            isPublished: ex.isActive,
            questions: builderQs,
            rejectionComment: ex.rejectionComment,
            isActive: ex.isActive
        };
    });
    const teacherExams = userExams;
    // Synthesize Submissions array
    const submissionsMapped = attempts
        .filter(a => a.status === "completed" || a.status === "graded")
        .map(a => {
        const attemptResponses = responses.filter(r => r.examId === a.examId && r.studentId === a.studentId);
        const formattedAnswers = attemptResponses.map(r => {
            const q = questions.find(question => question.id === r.questionId);
            let selectedChoiceId = "";
            if (r.answerOptions && r.answerOptions.length > 0) {
                selectedChoiceId = r.answerOptions.map(idx => String.fromCharCode(97 + idx)).join(",");
            }
            return {
                questionId: r.questionId,
                selectedChoiceId,
                textAnswer: r.answerString || (r.answerBool !== undefined ? String(r.answerBool) : ""),
                codeSubmission: r.answerCode ? {
                    code: r.answerCode,
                    testCasesPassed: r.obtainedScore !== undefined && r.obtainedScore === q?.points ? q?.points : 1,
                    testCasesTotal: q?.points || 1,
                } : undefined,
            };
        });
        const firstFeedback = attemptResponses.find(r => r.feedback)?.feedback || "";
        return {
            id: a.id,
            examId: a.examId,
            studentId: a.studentId,
            isGraded: a.status === "graded",
            score: a.score || 0,
            teacherFeedback: firstFeedback,
            answers: formattedAnswers,
            antiFraudIncidentCount: a.suspiciousEvents?.length || 0,
            antiFraudDetails: (a.suspiciousEvents || []).map(e => `${e.type}: ${e.description}`)
        };
    });
    const filteredSubmissions = submissionsMapped.filter((s) => gradingExamFilter === "ALL" || s.examId === gradingExamFilter);
    const handleAddExam = (examData) => {
        // Add to flat exams list
        const newExam = {
            id: examData.id,
            title: examData.title,
            description: examData.description,
            subjectId: examData.subjectId,
            duration: examData.durationMinutes,
            startDate: examData.openingDate,
            endDate: examData.closingDate,
            isActive: examData.status === "PUBLISHED" || examData.isPublished,
            authorId: currentUser.id,
            totalPoints: examData.questions.reduce((sum, q) => sum + (q.coefficient || 0), 0)
        };
        newExam.classRoomId = examData.classRoomId;
        newExam.coefficient = examData.coefficient;
        newExam.status = examData.status;
        onUpdateExams([...exams, newExam]);
        // Create sub questions
        const newQuestions = examData.questions.map((q) => {
            let qTypeMapped = "ouverte";
            if (q.type === "MCQ")
                qTypeMapped = "qcm";
            else if (q.type === "TRUE_FALSE")
                qTypeMapped = "vrai_faux";
            else if (q.type === "SHORT_ANSWER")
                qTypeMapped = "reponse_courte";
            else if (q.type === "PROGRAMMING")
                qTypeMapped = "programmation";
            let correctOptions = [];
            if (qTypeMapped === "qcm" && q.correctAnswer) {
                correctOptions = q.correctAnswer.split(",").map((letter) => letter.toLowerCase().charCodeAt(0) - 97).filter((idx) => idx >= 0);
            }
            let correctBool = true;
            if (qTypeMapped === "vrai_faux") {
                correctBool = q.correctAnswer === "true" || q.correctAnswer === true;
            }
            let correctShortAnswers = [];
            if (qTypeMapped === "reponse_courte" && q.correctAnswer) {
                correctShortAnswers = q.correctAnswer.split(",").map((t) => t.trim().toLowerCase());
            }
            return {
                id: q.id,
                examId: examData.id,
                type: qTypeMapped,
                prompt: q.prompt,
                points: q.coefficient,
                options: q.choices?.map((c) => c.text) || [],
                correctOptions,
                correctBool,
                correctShortAnswers,
                starterCode: q.programmingDetails?.starterCode || "",
                codingLanguage: q.programmingDetails?.language || "javascript",
                testCases: q.programmingDetails?.testCases || []
            };
        });
        onUpdateQuestions([...questions, ...newQuestions]);
        onAddLog("Création Examen", `Le professeur ${currentUser.name} a modélisé l'examen "${examData.title}".`);
    };
    const handleUpdateExam = (examData) => {
        const updatedExams = exams.map(ex => {
            if (ex.id === examData.id) {
                const uEx = {
                    ...ex,
                    title: examData.title,
                    description: examData.description,
                    subjectId: examData.subjectId,
                    duration: examData.durationMinutes,
                    startDate: examData.openingDate,
                    endDate: examData.closingDate,
                    isActive: examData.status === "PUBLISHED" || examData.isPublished || examData.isActive,
                    totalPoints: examData.questions.reduce((sum, q) => sum + (q.coefficient || 0), 0)
                };
                uEx.classRoomId = examData.classRoomId;
                uEx.coefficient = examData.coefficient;
                uEx.status = examData.status;
                uEx.isActive = examData.isActive !== undefined ? examData.isActive : uEx.isActive;
                return uEx;
            }
            return ex;
        });
        onUpdateExams(updatedExams);
        // Filter out old and build new
        const activeQuestionsWithoutThisExam = questions.filter(q => q.examId !== examData.id);
        const matchQuestions = examData.questions.map((q) => {
            let qTypeMapped = "ouverte";
            if (q.type === "MCQ")
                qTypeMapped = "qcm";
            else if (q.type === "TRUE_FALSE")
                qTypeMapped = "vrai_faux";
            else if (q.type === "SHORT_ANSWER")
                qTypeMapped = "reponse_courte";
            else if (q.type === "PROGRAMMING")
                qTypeMapped = "programmation";
            let correctOptions = [];
            if (qTypeMapped === "qcm" && q.correctAnswer) {
                correctOptions = q.correctAnswer.split(",").map((letter) => letter.toLowerCase().charCodeAt(0) - 97).filter((idx) => idx >= 0);
            }
            let correctBool = true;
            if (qTypeMapped === "vrai_faux") {
                correctBool = q.correctAnswer === "true" || q.correctAnswer === true;
            }
            let correctShortAnswers = [];
            if (qTypeMapped === "reponse_courte" && q.correctAnswer) {
                correctShortAnswers = q.correctAnswer.split(",").map((t) => t.trim().toLowerCase());
            }
            return {
                id: q.id,
                examId: examData.id,
                type: qTypeMapped,
                prompt: q.prompt,
                points: q.coefficient,
                options: q.choices?.map((c) => c.text) || [],
                correctOptions,
                correctBool,
                correctShortAnswers,
                starterCode: q.programmingDetails?.starterCode || "",
                codingLanguage: q.programmingDetails?.language || "javascript",
                testCases: q.programmingDetails?.testCases || []
            };
        });
        onUpdateQuestions([...activeQuestionsWithoutThisExam, ...matchQuestions]);
        onAddLog("Mise à jour Examen", `Le professeur ${currentUser.name} a mis à jour l'examen "${examData.title}" (${examData.status}).`);
    };
    const handleDeleteExam = (examId) => {
        onUpdateExams(exams.filter(ex => ex.id !== examId));
        onUpdateQuestions(questions.filter(q => q.examId !== examId));
        onAddLog("Suppression Examen", `Le professeur ${currentUser.name} a supprimé l'examen complet ${examId}.`);
    };
    const onGradeSubmission = (selectedId, score, feedback) => {
        const attempt = attempts.find(a => a.id === selectedId);
        if (attempt) {
            onUpdateAttempts(attempts.map(a => a.id === selectedId
                ? { ...a, status: "graded", score }
                : a));
            onUpdateResponses(responses.map(r => r.examId === attempt.examId && r.studentId === attempt.studentId
                ? { ...r, obtainedScore: score, feedback, gradedBy: currentUser.name }
                : r));
            onAddLog("Examen Noté", `Copie corrigée pour le professeur. Note: ${score}/20.`);
        }
    };
    const onGrantExtraTime = (examId, classId, minutes, studentId) => {
        onUpdateExams(exams.map(ex => {
            if (ex.id === examId) {
                return {
                    ...ex,
                    duration: ex.duration + minutes
                };
            }
            return ex;
        }));
        onAddLog("Extension de temps", `Extension de +${minutes} minutes accordée sur l'examen.`);
    };
    const handleSelectExamForEdit = (exam) => {
        setEditingExamId(exam.id);
        setExamTitle(exam.title);
        setExamDesc(exam.description);
        setExamSubjectId(exam.subjectId);
        setExamClassId(exam.classRoomId);
        setExamDuration(exam.durationMinutes);
        setExamCoeff(exam.coefficient);
        setExamOpening(exam.openingDate?.split("Z")[0] || "");
        setExamClosing(exam.closingDate?.split("Z")[0] || "");
        setBuilderQuestions(exam.questions);
        setActiveSubTab("builder");
    };
    const handleResetBuilder = () => {
        setEditingExamId(null);
        setExamTitle("");
        setExamDesc("");
        setExamDuration(60);
        setExamCoeff(2);
        setBuilderQuestions([]);
        setTempQPrompt("");
        setTempQCorrect("");
    };
    // Build temporary Choices handle
    const handleChoiceTextChange = (id, text) => {
        setTempChoices((prev) => prev.map((c) => (c.id === id ? { ...c, text } : c)));
    };
    const handleAddQuestionToDraft = () => {
        if (!tempQPrompt.trim()) {
            alert("Le libellé de la question ne peut pas être vide !");
            return;
        }
        if (!tempQCoeff || Number(tempQCoeff) <= 0) {
            alert("Le barème personnalisé (Points) est obligatoire et doit être supérieur à 0 !");
            return;
        }
        const correctAns = tempQChoiceAnswer(tempQType);
        if (tempQType === "MCQ" && !correctAns) {
            alert("Veuillez cocher au moins une option de réponse correcte pour le QCM.");
            return;
        }
        const newQuestion = {
            id: `q_${Date.now()}`,
            type: tempQType,
            prompt: tempQPrompt,
            coefficient: Number(tempQCoeff),
            correctAnswer: correctAns,
        };
        if (tempQType === "MCQ") {
            newQuestion.choices = tempChoices.map((c) => ({ ...c }));
        }
        if (tempQType === "PROGRAMMING") {
            const tcList = tempTestCases.filter(tc => tc.input.trim() || tc.output.trim());
            const testCasesList = tcList.length > 0
                ? tcList.map(tc => ({ input: tc.input.trim(), output: tc.output.trim() }))
                : [{ input: "[1, 2, 3]", output: "true" }, { input: "[4, 5]", output: "false" }];
            newQuestion.programmingDetails = {
                language: tempCodeLang,
                starterCodeJS: tempStarterCode,
                starterCodeJava: tempStarterCode,
                starterCodePython: tempStarterCode,
                starterCodeCPP: tempStarterCode,
                starterCode: tempStarterCode,
                expectedOutput: testCasesList[0]?.output || "Savoir coder",
                testCases: testCasesList,
            };
        }
        setBuilderQuestions((prev) => [...prev, newQuestion]);
        // Clear individual builder fields
        setTempQPrompt("");
        setTempQCorrect("");
        setTempChoices([
            { id: "a", text: "" },
            { id: "b", text: "" },
            { id: "c", text: "" },
            { id: "d", text: "" },
        ]);
        setTempCodeLang("javascript");
        setTempStarterCode("");
        setTempTestCases([{ input: "", output: "" }]);
    };
    const tempQChoiceAnswer = (type) => {
        if (type === "TRUE_FALSE")
            return tempQCorrect || "true";
        if (type === "MCQ")
            return tempQCorrect || "a";
        return tempQCorrect;
    };
    const handleSaveExamDraftOrValidation = (statusTarget) => {
        if (!examTitle.trim() || !examDesc.trim()) {
            alert("Veuillez saisir le titre et la description de l'évaluation.");
            return;
        }
        if (builderQuestions.length === 0) {
            alert("Votre examen doit comporter au moins 1 question !");
            return;
        }
        const examData = {
            id: editingExamId || `exm_${Date.now()}`,
            title: examTitle,
            description: examDesc,
            subjectId: examSubjectId,
            classRoomId: examClassId,
            teacherId: currentUser.id,
            durationMinutes: examDuration,
            coefficient: examCoeff,
            status: statusTarget,
            openingDate: new Date(examOpening).toISOString(),
            closingDate: new Date(examClosing).toISOString(),
            isPublished: statusTarget === "PUBLISHED",
            questions: builderQuestions,
        };
        if (editingExamId) {
            handleUpdateExam(examData);
        }
        else {
            handleAddExam(examData);
        }
        alert(`Succès : L'examen a été enregistré avec le statut : ${statusTarget}`);
        handleResetBuilder();
        setActiveSubTab("overview");
    };
    // Grade compilation handle
    const handleGradeSubmit = (e) => {
        e.preventDefault();
        if (selectedSubmissionId) {
            onGradeSubmission(selectedSubmissionId, manualScore, manualFeedback);
            alert("Note & Rapport d'évaluation publiés officiellement. L'étudiant a été notifié.");
            setSelectedSubmissionId(null);
            setManualFeedback("");
        }
    };
    // Extra time triggers
    const handleGrantTimeSubmit = (e) => {
        e.preventDefault();
        onGrantExtraTime(timeExamId, timeClassId, timeMinutes, targetStudentId || undefined);
        alert(`Aménagement de temps validé : +${timeMinutes} minutes accordées au terminal de l'étudiant.`);
        setTargetStudentId("");
    };
    const handlePublishAnnouncement = (e) => {
        e.preventDefault();
        if (!annTitle.trim() || !annMessage.trim()) {
            alert("Veuillez saisir un titre et un message d'annonce !");
            return;
        }
        const newAnn = {
            id: `ann_${Date.now()}`,
            title: annTitle,
            content: annMessage,
            authorName: currentUser.name || "Enseignant",
            date: new Date().toISOString(),
            role: "Enseignant"
        };
        newAnn.target = annTarget;
        onUpdateAnnouncements([...announcements, newAnn]);
        alert("Annonce partagée avec succès !");
        setAnnTitle("");
        setAnnMessage("");
    };
    const handleUploadResource = (e) => {
        e.preventDefault();
        if (!resTitle.trim() || !resDescription.trim()) {
            alert("Veuillez saisir un libellé et une description !");
            return;
        }
        const newRes = {
            id: `res_${Date.now()}`,
            title: resTitle,
            fileUrl: "#",
            type: (resFileType.toLowerCase() === "pdf" ? "pdf" : "document"),
            subjectId: resSubjectId,
            authorName: currentUser.name || "Enseignant",
            date: new Date().toISOString()
        };
        newRes.description = resDescription;
        newRes.classRoomId = resClassRoomId;
        newRes.fileSize = `${(Math.random() * 2 + 0.5).toFixed(1)} MB`;
        onUpdateResources([...resources, newRes]);
        alert("Support pédagogique partagé avec succès !");
        setResTitle("");
        setResDescription("");
    };
    const handleDeleteResourceLocal = (id) => {
        if (confirm("Voulez-vous supprimer ce document pédagogique ?")) {
            onUpdateResources(resources.filter((r) => r.id !== id));
        }
    };
    const handleDeleteAnnouncementLocal = (id) => {
        if (confirm("Voulez-vous supprimer cette annonce ?")) {
            onUpdateAnnouncements(announcements.filter((a) => a.id !== id));
        }
    };
    const getSubjectName = (subId) => subjects.find((s) => s.id === subId)?.name || "Matière";
    const getClassName = (clsId) => classes.find((c) => c.id === clsId)?.name || "Classe";
    const getStatusBadge = (status) => {
        switch (status) {
            case "DRAFT":
                return (<span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-205">
            Brouillon
          </span>);
            case "PENDING_VALIDATION":
                return (<span className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-full animate-pulse">
            En attente administrative
          </span>);
            case "APPROVED":
                return (<span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
            Approuvé & Autorisé
          </span>);
            case "REJECTED":
                return (<span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-bold px-2.5 py-1 rounded-full">
            Rejeté administrativment
          </span>);
            case "PUBLISHED":
                return (<span className="bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
            Diffusé et actif
          </span>);
            default:
                return (<span className="bg-green-605 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
            Diffusé et actif
          </span>);
        }
    };
    const [showFilters, setShowFilters] = useState(false);
  
  // Les états des filtres avancés
  const [filterSubject, setFilterSubject] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Pour ouvrir/fermer sans recharger la page
  const handleToggleFilters = (e) => {
    e.preventDefault(); // CRUCIAL: Kat-mne3 l-page bach ma-trechargich (White screen fix)
    e.stopPropagation(); // Kat-mne3 l'événement bbach ma-y-tla9ach m3a l-parents
    setShowFilters(!showFilters);
  };

  const handleReset = (e) => {
    e.preventDefault();
    setFilterSubject("");
    setFilterClass("");
    setFilterStatus("");
    setSearchExamQuery("");
  };

  const handleApply = (e) => {
    e.preventDefault();
    // Hna kat-طبق l-filtrage dyalk
    setShowFilters(false);
  };
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
const [isSubmitConfirmOpen, setIsSubmitConfirmOpen] = useState(false);
// 1. زيد هاد الـ State باش تخزن الفايل
const [selectedFile, setSelectedFile] = useState(null);

// 2. زيد هاد الـ function اللي عطاتك الخطأ
const handleFileChange = (e) => {
  if (e.target.files && e.target.files[0]) {
    setSelectedFile(e.target.files[0]);
    console.log("File selected:", e.target.files[0]);
  }
};
const [showAnnonceModal, setShowAnnonceModal] = useState(false);
const [showResourceModal, setShowResourceModal] = useState(false);
// تأكد من Import الأيقونات: 
// import { UploadCloud, X, FileText, Megaphone, BookOpen } from "lucide-react";

const AnnonceModal = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <Megaphone className="text-amber-500" size={20}/> Nouvelle Annonce
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
      </div>
      
      <form onSubmit={(e) => { e.preventDefault(); handlePublishAnnouncement(e); onClose(); }} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Titre</label>
          <input required type="text" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)}
            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            placeholder="Ex: Changement d'horaire..." />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Message</label>
          <textarea required rows="4" value={annMessage} onChange={(e) => setAnnMessage(e.target.value)}
            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
            placeholder="Écrivez votre annonce ici..." />
        </div>
        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Annuler</button>
          <button type="submit" className="flex-1 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 shadow-lg shadow-amber-200">Publier</button>
        </div>
      </form>
    </div>
  </div>
);

const ResourceModal = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
      <h3 className="font-black text-slate-900 mb-6 uppercase tracking-widest flex items-center gap-2">
        <BookOpen className="text-emerald-500" size={20}/> Nouveau Support
      </h3>
      
      <form onSubmit={(e) => { e.preventDefault(); handleUploadResource(e); onClose(); }} className="space-y-4">
        {/* File Upload Area */}
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-emerald-400 transition-colors cursor-pointer group">
          <input type="file" id="file-upload" className="hidden" onChange={(e) => {/* logic handling file */}} />
          <label htmlFor="file-upload" className="cursor-pointer">
            <UploadCloud className="mx-auto text-slate-400 group-hover:text-emerald-500 mb-2" size={32}/>
            <p className="text-xs font-bold text-slate-600">Glisser le fichier ici</p>
            <p className="text-[10px] text-slate-400">PDF, Word, ou PPT</p>
          </label>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Titre du support</label>
          <input required type="text" value={resTitle} onChange={(e) => setResTitle(e.target.value)}
            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Type</label>
          <select value={resFileType} onChange={(e) => setResFileType(e.target.value)}
            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none">
            <option value="PDF">PDF</option>
            <option value="DOC">Word</option>
            <option value="LINK">Lien Externe</option>
          </select>
        </div>

        <div className="flex gap-3 pt-4">
          <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200">Annuler</button>
          <button type="submit" className="flex-1 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200">Partager</button>
        </div>
      </form>
    </div>
  </div>
);

  // Fonction pour supprimer une annonce via l'id
  const handleDelete = (id) => {
    setAnnouncements(prev => prev.filter(ann => ann.id !== id));
  };
const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
const [examToDelete, setExamToDelete] = useState(null);

const handleOpenDeleteModal = (exam) => {
  setExamToDelete(exam);
  setIsDeleteModalOpen(true);
};


// 1. DÉFINITION DES ÉTATS (à mettre dans ton composant parent)
 // Pour le modal

// 2. CALCUL DU FILTRAGE (à mettre avant ton return)
const filteredExams = teacherExams.filter((exam) => {
  if (!searchExamQuery.trim()) return true;
  const query = searchExamQuery.toLowerCase();
  return (
    (exam.title || "").toLowerCase().includes(query) ||
    (exam.id || "").toLowerCase().includes(query) ||
    (getSubjectName(exam.subjectId) || "").toLowerCase().includes(query) ||
    (getClassName(exam.classRoomId) || "").toLowerCase().includes(query)
  );
});
    return (<div id="teacher-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans text-left">
    

      {/* Toggles subtabs buttons */}
      <div className="bg-white p-1 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row flex-wrap gap-1 select-none w-full max-w-full overflow-hidden">
        <button onClick={() => setActiveSubTab("overview")} className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeSubTab === "overview" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
          <BookOpen className="w-4 h-4 inline-block mr-1.5"/>
          Mes examens ({teacherExams.length})
        </button>
        <button onClick={() => setActiveSubTab("builder")} className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeSubTab === "builder" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
          <Edit className="w-4 h-4 inline-block mr-1.5"/>
          Éditeur / Sujet Builder
        </button>
        <button onClick={() => setActiveSubTab("grading")} className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeSubTab === "grading" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
          <Award className="w-4 h-4 inline-block mr-1.5"/>
          Centre de Notation ({submissionsMapped.length})
        </button>
    
        <button onClick={() => setActiveSubTab("resources")} className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeSubTab === "resources" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
          <FileText className="w-4 h-4 inline-block mr-1.5"/>
          Supports & Annonces
        </button>
      </div>

      {/* Main Container Views */}




      {/* TAB 1: Overview and creation list */}
{activeSubTab === "overview" && (<div className="space-y-6">
         

         {/* Header section with instruction & search */}
    <div className="bg-white p-6 rounded-2xl border border-slate-200/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm transition-all duration-300 hover:shadow-md/50">
      
      {/* Text & Description Section */}
      <div className="space-y-1.5 max-w-2xl">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-slate-100 rounded-md text-slate-700">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
            Suivi et Configuration des Examens
          </h2>
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Recherchez vos épreuves, activez ou désactivez manuellement leur cycle de vie, et ajustez les paramètres de planification ou les coefficients conformément aux exigences académiques.
        </p>
      </div>
      
      {/* Search filter element */}
   <div className="relative w-full md:w-85 z-40">
      
      {/* Container Principal dyal l-Input */}
      <div className="relative flex items-center group">
        
      
        {/* Input Principal */}
        <input 
          type="text" 
          placeholder="Rechercher par titre, matière, classe..." 
          value={searchExamQuery} 
          onChange={(e) => setSearchExamQuery(e.target.value)} 
          className="w-full bg-slate-50 border border-slate-200 pl-10 pr-12 py-2.5 text-xs font-medium rounded-xl outline-none transition-all duration-200 placeholder:text-slate-400 text-slate-800 focus:border-slate-900 focus:bg-white focus:ring-4 focus:ring-slate-900/5 shadow-inner"
        />
<button
    type="button"
    onClick={handleToggleFilters}
    className="absolute inset-y-0 right-2 flex items-center justify-center cursor-pointer top-1 h-7 w-7 bg-slate-100 rounded-md text-slate-700"
    title="Options de filtrage avancé"
  >
    <div className={`p-1.5 rounded-lg transition-all duration-200 border ${
      showFilters 
        ? "bg-slate-100 rounded-md text-slate-700" 
        : "bg-transparent border-transparent text-slate-400 "
    }`}>
      <SlidersHorizontal 
        className={`w-4 h-4  bg-slate-100 rounded-md text-slate-700 transition-transform duration-300 ${showFilters ? 'rotate-90' : 'rotate-0'}`} 
      />
    </div>
  </button>
      </div>

      {/* DROPDOWN FILTRES AVANCÉS */}
      {showFilters && (
        <div className="absolute right-0 mt-2 w-full bg-white rounded-2xl  shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header du panneau */}
          <div className="flex justify-between items-center pb-2 mb-4 border-b border-slate-100">
            <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
              Critères de filtrage avancé
            </span>
            <button 
              type="button"
              onClick={(e) => { e.preventDefault(); setShowFilters(false); }}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg bg-transparent border-none cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Formulaire des Filtres */}
          <div className="space-y-4">
            
            {/* 1. Matière */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <BookOpen className="w-3 h-3" /> Matière
              </label>
              <select 
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-medium rounded-xl outline-none text-slate-700 focus:border-slate-900 focus:bg-white transition-all cursor-pointer"
              >
                <option value="">Toutes les matières</option>
                <option value="web">Développement Web & Frameworks</option>
                <option value="algo">Algorithmique & Structures de Données</option>
              </select>
            </div>

            {/* 2. Classe */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <GraduationCap className="w-3 h-3" /> Classe / Promotion
              </label>
              <select 
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 text-xs font-medium rounded-xl outline-none text-slate-700 focus:border-slate-900 focus:bg-white transition-all cursor-pointer"
              >
                <option value="">Toutes les classes</option>
                <option value="gl3">Génie Logiciel - 3ème Année</option>
              </select>
            </div>

            {/* 3. État du Cycle */}
            <div className="space-y-1">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <Calendar className="w-3 h-3" /> État du Cycle (Manuel)
              </label>
              <div className="flex gap-2">
                {['Tous', 'Actif', 'Désactivé'].map((status) => {
                  const isSelected = filterStatus === status || (status === 'Tous' && !filterStatus);
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={(e) => { e.preventDefault(); setFilterStatus(status === 'Tous' ? "" : status); }}
                      className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Barre des Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-[11px]">
              <button 
                type="button"
                onClick={handleReset}
                className="px-3 py-2 text-slate-500 hover:text-slate-800 font-semibold bg-transparent border-none cursor-pointer transition-colors"
              >
                Réinitialiser
              </button>
              <button 
                type="button"
                onClick={handleApply}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer shadow-sm transition-colors"
              >
                Appliquer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>

    </div>

          {/* Quick inline Time extension Modal overlay */}
{extendingExamId && (() => {
                const currentExtExam = exams.find(e => e.id === extendingExamId);
                return (<div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl relative">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-slate-900">
                      <Clock className="w-5 h-5 text-[#F4C542]"/>
                      <h4 className="text-xs font-black uppercase tracking-wider">
                        Prolongation en Temps Réel
                      </h4>
                    </div>
                    <button onClick={() => setExtendingExamId(null)} className="text-xs text-slate-400 font-black hover:text-slate-900 cursor-pointer">
                      ✕
                    </button>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl text-slate-700">
                    <p className="text-[11px] font-bold leading-relaxed">
                      Sujet : <span className="font-extrabold text-slate-900">"{currentExtExam?.title}"</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1">
                      Cette action ajoute instantanément des minutes complémentaires réglementaires à l'évaluation pour l'ensemble des élèves en cours de passation.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase">
                      Incrément à accorder (en minutes)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[10, 15, 30, 45].map((mins) => (<button key={mins} type="button" onClick={() => setExtendingMinutes(mins)} className={`py-2 text-[11px] font-black rounded-lg border transition-all cursor-pointer ${extendingMinutes === mins ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-705 border-slate-202 hover:bg-slate-50'}`}>
                          +{mins}'
                        </button>))}
                    </div>

                    <div className="pt-2">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                        Saisie personnalisée (minutes)
                      </label>
                      <input type="number" min="1" max="180" value={extendingMinutes} onChange={(e) => setExtendingMinutes(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-950 font-extrabold outline-none"/>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button onClick={() => setExtendingExamId(null)} className="px-4 py-2 text-xs font-extrabold rounded-lg hover:bg-slate-50 text-slate-500 cursor-pointer border-none bg-transparent">
                      Annuler
                    </button>
                    <button onClick={() => {
                        const classIdVal = currentExtExam ? currentExtExam.classRoomId : undefined;
                        onGrantExtraTime(extendingExamId, classIdVal, Number(extendingMinutes));
                        setExtendingExamId(null);
                    }} className="px-4 py-2 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer border-none shadow-sm">
                      Confirmer la prolongation (+{extendingMinutes}m)
                    </button>
                  </div>
                </div>
              </div>);
            })()}

     

            {/* Core Data Table layout */}
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      
      {/* Header dyal l-Tableau */}
      <div className="px-6 py-5 from-slate-50 to-white border-b border-slate-100 flex justify-between items-center">
        <div className="space-y-0.5">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">
            Registre des examens créés
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Gestion du cycle de vie et suivi des épreuves actives
          </p>
        </div>
        <span className="px-3 py-1 bg-slate-100 text-xs font-semibold text-slate-600 rounded-full border border-slate-200/50">
          {teacherExams.length} {teacherExams.length <= 1 ? 'sujet enregistré' : 'sujets enregistrés'}
        </span>
      </div>

      {teacherExams.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center max-w-sm mx-auto space-y-4">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mx-auto border border-slate-100">
            <AlertCircle className="w-6 h-6 text-slate-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">Aucun examen enregistré</p>
           
          </div>
          <button 
            onClick={() => {
              handleResetBuilder();
              setActiveSubTab("builder");
            }} 
            className="bg-slate-100 rounded-xl inline-flex items-center text-xs font-bold text-amber-600 
            hover:text-amber-700 transition-colors cursor-pointer border-none p-2"
          >
            Proposer un premier examen maintenant &rarr;
          </button>
        </div>
      ) : (
        /* Data Table Wrapper */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200/60 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-6 py-3.5 text-[8px] font-semibold ">Évaluation / Ref ID</th>
                <th className="px-6 py-3.5 text-[8px] font-semibold">Matière / Classe</th>
                <th className="px-6 py-3.5 text-[8px] font-semibold">Durée/Coeff </th>
                <th className="px-2 py-3.5 text-[8px] font-semibold">Etat du Cycle (Manuel)</th>
                <th className="px-6 py-3.5 text-[8px] font-semibold text-center">Actions de Contrôle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 text-xs font-medium">
              {teacherExams.filter((exam) => {
                if (!searchExamQuery.trim()) return true;
                const query = searchExamQuery.toLowerCase();
                return (
                  (exam.title || "").toLowerCase().includes(query) ||
                  (exam.id || "").toLowerCase().includes(query) ||
                  (getSubjectName(exam.subjectId) || "").toLowerCase().includes(query) ||
                  (getClassName(exam.classRoomId) || "").toLowerCase().includes(query)
                );
              }).length === 0 ? (
                /* No Results Row */
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 bg-slate-50/20 font-normal">
                    Aucun résultat ne correspond à votre filtre <span className="font-semibold text-slate-700">"{searchExamQuery}"</span>
                  </td>
                </tr>
              ) : (
                /* Data Rows */
                teacherExams
                  .filter((exam) => {
                    if (!searchExamQuery.trim()) return true;
                    const query = searchExamQuery.toLowerCase();
                    return (
                      (exam.title || "").toLowerCase().includes(query) ||
                      (exam.id || "").toLowerCase().includes(query) ||
                      (getSubjectName(exam.subjectId) || "").toLowerCase().includes(query) ||
                      (getClassName(exam.classRoomId) || "").toLowerCase().includes(query)
                    );
                  })
                  .map((exam) => {
                    const activeState = exam.isActive !== false;
                    return (
                      <tr key={exam.id} className="hover:bg-slate-50/40 transition-colors group">
                        
                        {/* 1. Evaluation & Ref ID */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span className="font-semibold text-slate-900 group-hover:text-slate-950 block text-sm transition-colors">
                              {exam.title}
                            </span>
                            <span className="inline-flex items-center px-1.5 py-0.5 bg-slate-100 text-[10px] text-slate-500 font-bold font-mono rounded border border-slate-200/40">
                              REF: {exam.id}
                            </span>
                          </div>
                        </td>

                        {/* 2. Matière & Classe */}
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <span className="text-slate-800 block font-semibold">
                              {getSubjectName(exam.subjectId)}
                            </span>
                            <span className="text-[11px] text-slate-400 block font-normal">
                              Classe : <span className="font-medium text-slate-600">{getClassName(exam.classRoomId)}</span>
                            </span>
                          </div>
                        </td>

                        {/* 3. Durée & Coefficient */}
                        <td className="px-6 py-4 font-sans text-slate-700">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                              <span>{exam.durationMinutes} Min</span>
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 text-[10px] text-amber-700 font-semibold rounded border border-amber-200/40">
                              Coeff : {exam.coefficient}
                            </span>
                          </div>
                        </td>

                        {/* 4. Cycle de vie Switch (Manuel) */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => {
                                onUpdateExams(exams.map(ex => {
                                  if (ex.id === exam.id) {
                                    return { ...ex, isActive: !activeState };
                                  }
                                  return ex;
                                }));
                              }} 
                              type="button" 
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500/20 ${activeState ? "bg-emerald-500" : "bg-slate-200"}`}
                            >
                              <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${activeState ? "translate-x-4" : "translate-x-0"}`}/>
                            </button>
                            
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${activeState ? "text-emerald-600" : "text-slate-400"}`}>
                              {activeState ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  Actif
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-slate-300" />
                                  Désactivé
                                </>
                              )}
                            </span>
                          </div>
                        </td>
                        
                        {/* 5. Actions de Contrôle */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end items-center">
                            
                            {/* VOIR LES RESULTATS */}
                            <button 
                              onClick={() => {
                                setGradingExamFilter(exam.id);
                                setActiveSubTab("grading");
                              }} 
                              className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg cursor-pointer transition-colors border-none outline-none shadow-sm"
                              title="Voir les copies et notes"
                            >
                              <Eye className="w-3.5 h-3.5"/>
                              <span>Résultats</span>
                            </button>

                            {/* EXPORT PDF (Exigence strict du CdC) */}
                            <button 
                              onClick={() => {
                                // Code dyal l'export PDF dyal l-examen hna
                                alert(`Génération du PV des résultats en PDF pour l'examen: ${exam.title}`);
                              }} 
                              className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-red-600 font-medium rounded-lg cursor-pointer transition-colors shadow-sm"
                              title="Exporter le récapitulatif des résultats en PDF"
                            >
                              <FileText className="w-4 h-4"/>
                            </button>

                            {/* MODIFIER */}
                            <button 
                              onClick={() => handleSelectExamForEdit(exam)} 
                              className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 font-medium rounded-lg cursor-pointer transition-colors shadow-sm" 
                              title="Modifier la configuration"
                            >
                              <Edit className="w-4 h-4"/>
                            </button>

                          <button 
  type="button"
  onClick={() => handleOpenDeleteModal(exam)} 
  className="p-1.5 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-600 font-medium rounded-lg cursor-pointer transition-colors shadow-sm" 
  title="Supprimer définitivement"
>
  <Trash2 className="w-4 h-4"/>
</button>
{isDeleteModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
    {/* Ajout de max-w-md pour plus de largeur */}
    <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
      
      {/* Icône Alert */}
      <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-full bg-red-50 text-red-600 mb-6">
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <h3 className="text-xl font-black text-slate-950 text-center">Suppression définitive</h3>
      
      <p className="text-sm text-slate-500 text-center mt-3 mb-8 leading-relaxed">
        Êtes-vous sûr de vouloir supprimer définitivement le sujet  
        {/* Style appliqué selon ta demande */}
        <span className="inline-block ml-1 mt-3 px-1 py-1 font-bold text-gray-600 bg-red-50 rounded-lg">
              {examToDelete?.title}
        </span>   .
        <span className="mt-4 block">Cette action est irréversible!</span>
      </p>

      <div className="flex gap-3">
        <button 
          onClick={() => setIsDeleteModalOpen(false)}
          className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
        >
          Conserver
        </button>
        <button 
          onClick={() => {
            handleDeleteExam(examToDelete.id);
            setIsDeleteModalOpen(false);
          }}
          className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 transition-all"
        >
          Supprimer
        </button>
      </div>
    </div>
  </div>
)}

                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  




        </div>)}
   
{/* TAB 2: Custom exam subject builder layout */}
{activeSubTab === "builder" && (
  <div className="w-full space-y-5 animate-fadeIn px-4 lg:px-0.5">
    
    {/* HEADER DE LA PAGE : Résumé rapide et Actions principales */}
    <div className="w-full bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <span className="text-[10px] font-black uppercase text-black/70 bg-[#F4C542]/60 px-2 py-0.5 rounded tracking-wider">
          Configuration du sujet
        </span>
        <h2 className="text-base font-black text-slate-900 mt-1">
          {examTitle || "Nouvelle évaluation sans titre"}
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">
          {examDuration ? ` ${examDuration} Minutes` : "Pas de durée définie"} &bull; {examCoeff ? ` Coefficient : ${examCoeff}` : "Pas de coeff"}
        </p>
      </div>

      <div className="flex gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          onClick={() => setIsConfigModalOpen(true)}
          className="flex-1 sm:flex-none px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          Modifier Paramètres
        </button>
        <button
          type="button"
          onClick={() => setIsQuestionModalOpen(true)}
          className="flex-1 sm:flex-none px-4 py-2 bg-[#F4C542] hover:bg-[#F4C542]/90 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/10 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-white" />
          Créer une Question
        </button>
      </div>
    </div>

 {/* SECTION CENTRALE : La liste des questions composées */}
<div className="w-full bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
  
  {/* Header de la section */}
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
    <div className="flex items-center gap-2.5">
      <div className="w-2 h-5 bg-[#F4C542] rounded-full shadow-xs"></div>
      <div>
        <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest">
          Questions composées
        </h3>
        <p className="text-[10px] text-slate-400 font-normal mt-0.5">
          {builderQuestions?.length || 0} {builderQuestions?.length > 1 ? 'questions intégrées' : 'question intégrée'} au sujet
        </p>
      </div>
    </div>
    
    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200/60 px-3.5 py-1.5 rounded-xl shadow-xs shrink-0">
      <span className="text-slate-400 text-[11px] font-medium">Barème Total:</span>
      <span className="font-mono font-black text-[#F4C542]">
        {builderQuestions?.reduce((acc, q) => acc + (q.coefficient || 0), 0) || 0}
      </span>
      <span className="text-[11px] text-slate-500">pts</span>
    </div>
  </div>

  {/* État Vide (Empty State) */}
  {(!builderQuestions || builderQuestions.length === 0) ? (
    <div className="flex flex-col items-center justify-center py-14 px-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/30 transition-all">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50/60 border border-indigo-100/50 flex items-center justify-center mb-4 shadow-2xs">
        {/* SVG BookOpen sécurisé */}
        <svg className="w-5 h-5 text-[#F4C542]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>
      <p className="text-xs text-slate-800 font-black text-center uppercase tracking-wider">
        Votre sujet est vide
      </p>
      <p className="text-[11px] text-slate-400 font-medium text-center mt-1 max-w-xs leading-normal">
        Cliquez sur le bouton de création en haut pour configurer et ajouter vos premiers QCM ou Vrai/Faux.
      </p>
    </div>
  ) : (
    /* Liste des questions */
    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
      {builderQuestions.map((q, qidx) => {
        const isMCQ = q.type === "MCQ";
        return (
          <div 
            key={q.id || qidx} 
            className="group bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-start gap-4 hover:border-slate-300 hover:shadow-xs transition-all duration-200"
          >
            <div className="space-y-2.5 flex-1">
              {/* Badge info de la question */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-black text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-[10px]">
                  N° {String(qidx + 1).padStart(2, '0')}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                  isMCQ 
                    ? "bg-violet-50 text-violet-700 border-violet-200/60" 
                    : "bg-teal-50 text-teal-700 border-teal-200/60"
                }`}>
                  {isMCQ ? "Choix Multiples (QCM)" : "Vrai / Faux"}
                </span>
                <span className="ml-auto sm:hidden font-mono text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                  +{q.coefficient} pts
                </span>
              </div>

              {/* Énoncé */}
              <p className="text-xs text-slate-800 font-semibold leading-relaxed pl-0.5">
                {q.prompt}
              </p>
              
              {/* Clé de correction & Points */}
              <div className="flex items-center gap-3 pt-1 border-t border-slate-50 text-[10px] text-slate-400 font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-400">Correction :</span>
                  <span className="text-slate-700 font-mono bg-slate-50 border border-slate-200/70 px-2 py-0.5 rounded-md text-[9px] uppercase">
                    {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(", ") : String(q.correctAnswer)}
                  </span>
                </div>
                <span className="text-slate-300 hidden sm:inline">&bull;</span>
                <span className="hidden sm:inline text-indigo-600 bg-indigo-50/80 border border-indigo-100/40 px-2 py-0.5 rounded-md font-mono">
                  +{q.coefficient} pts
                </span>
              </div>
            </div>

            {/* Bouton Supprimer */}
            <button
              type="button"
              onClick={() => setBuilderQuestions((prev) => prev.filter((item) => item.id !== q.id))}
              className="text-slate-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 border border-transparent hover:border-red-100 transition-all cursor-pointer shrink-0"
              title="Supprimer la question"
            >
              {/* SVG Trash2 natif o sécurisé */}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16v1a1 1 0 001 1h3M4 7h16" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  )}
</div>
{/* FIN DE SESSION ACTIONS : Validation globale */}
{builderQuestions?.length > 0 && (
  <div className="w-full flex justify-end gap-3 pt-4 border-t border-slate-100">
    <button
      type="button"
      onClick={() => handleSaveExamDraftOrValidation("DRAFT")}
      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-black text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer active:scale-95"
    >
      Enregistrer le Brouillon
    </button>
    <button
      type="button"
      onClick={() => setIsSubmitConfirmOpen(true)} // Kat-tla3 l-modal jdid hna
      className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs rounded-xl flex items-center gap-2 uppercase tracking-wider transition-all cursor-pointer shadow-md active:scale-95"
    >
      {/* SVG Send Sécurisé */}
      <svg className="w-3.5 h-3.5 text-[#F4C542]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
      Soumettre l'Évaluation Finale
    </button>
  </div>
)}
{/* ================= MODAL DE CONFIRMATION DE SOUMISSION ================= */}
{isSubmitConfirmOpen && (
  <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-scaleUp p-6 text-center">
      
      {/* Icône d'avertissement animée et stylisée */}
      <div className="mt-4 w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4 shadow-2xs">
        {/* SVG Exclamation / Paper Airplane hybrid style */}
        <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      {/* Titre & Description */}
      <h3 className="text-sm font-black text-slate-950 uppercase tracking-wider mb-2">
        Soumission Finale du Sujet
      </h3>
      <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
        Êtes-vous sûr de vouloir publier cette évaluation ? Une fois soumise, elle passera en statut <span className="text-indigo-600 font-bold bg-indigo-50 px-1 py-0.2 rounded">En attente</span> et sera visible par l'administration[cite: 9].
      </p>

       {/* إحصائيات مصغرة بخطوط أنيقة */}
      <div className="flex justify-center gap-8 mt-4 mb-4 py-4 border-y border-slate-50">
        <div className="text-center">
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Questions</div>
          <div className="text-sm font-black text-slate-900">{builderQuestions?.length || 0}</div>
        </div>
        <div className="text-center">
          <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Points</div>
          <div className="text-sm font-black text-indigo-600">
            {builderQuestions?.reduce((acc, q) => acc + (q.coefficient || 0), 0) || 0}
          </div>
        </div>
      </div>

      {/* Actions Buttons */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        <button
          type="button"
          onClick={() => setIsSubmitConfirmOpen(false)}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-black text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer active:scale-95"
        >
          Conserver
        </button>
        <button
          type="button"
          onClick={() => {
            handleSaveExamDraftOrValidation("PENDING_VALIDATION");
            setIsSubmitConfirmOpen(false);
          }}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl uppercase tracking-wider shadow-md shadow-indigo-600/10 transition-all cursor-pointer active:scale-95"
        >
          Confirmer
        </button>
      </div>

    </div>
  </div>
)}
    {/* ================= MODAL 1 : PARAMÉTRAGE FONDAMENTAL ================= */}
{isConfigModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden transform transition-all animate-scaleUp">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-3.5 bg-[#F4C542] rounded-full"></span>
              Configuration Fondamentale
            </h3>
            <button 
              type="button" 
              onClick={() => setIsConfigModalOpen(false)}
              className="text-slate-400 hover:text-slate-600 text-sm font-bold bg-transparent border-none cursor-pointer p-1"
            >✕</button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-4 text-xs font-semibold max-h-[70vh] overflow-y-auto">
            
            {/* Statut Toggle */}
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50/50">
              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
                  Statut de publication
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">
                  Rendre l'évaluation visible pour les étudiants inscrits.
                </span>
              </div>

              <button
                type="button"
                onClick={() => typeof setExamStatus === "function" && setExamStatus(prev => prev === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  (typeof examStatus !== "undefined" ? examStatus : "ACTIVE") === "ACTIVE" ? "bg-emerald-500" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    (typeof examStatus !== "undefined" ? examStatus : "ACTIVE") === "ACTIVE" ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Titre de l'évaluation</label>
              <div className="flex items-center px-3.5 py-2  rounded-xl focus-within:border-indigo-500 transition-all">
                <FileText className="w-4 h-4 text-slate-400 shrink-0 mr-3" />
                <input
                  type="text"
                  placeholder="Ex: Examen de structures de données"
                  value={examTitle || ''}
                  onChange={(e) => setExamTitle(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-xs font-semibold text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            {/* Consigne */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Consigne descriptive</label>
              <div className="flex items-start px-3.5 py-2 rounded-xl focus-within:border-indigo-500 transition-all">
                <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5 mr-3" />
                <textarea
                  placeholder="Instructions destinées aux étudiants..."
                  value={examDesc || ''}
                  onChange={(e) => setExamDesc(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-xs font-semibold text-slate-800 h-16 resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* MATIÈRE & CLASSE CIBLÉE (Correction des bordures & chevauchements) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="w-full min-w-0">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                  Matière de rattachement
                </label>
                <div className="flex items-center h-10 px-3.5 rounded-xl focus-within:border-indigo-500 transition-all w-full">
                  <BookOpen className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                  <select 
                    value={examSubjectId} 
                    onChange={(e) => setExamSubjectId(e.target.value)} 
                    className="block w-full bg-transparent border-none outline-none text-xs font-bold text-slate-800 cursor-pointer pr-6 p-0 truncate"
                  >
                    {subjects?.map((s) => (
                      <option key={s.id} value={s.id} className="text-slate-800 font-medium">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="w-full min-w-0">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                  Classe ciblée
                </label>
                <div className="flex items-center h-10 px-3.5 rounded-xl focus-within:border-indigo-500 transition-all w-full">
                  <Award className="w-4 h-4 text-slate-400 shrink-0 mr-2.5" />
                  <select 
                    value={examClassId} 
                    onChange={(e) => setExamClassId(e.target.value)} 
                    className="block w-full bg-transparent border-none outline-none text-xs font-bold text-slate-800 cursor-pointer pr-6 p-0 truncate"
                  >
                    {classes?.map((c) => (
                      <option key={c.id} value={c.id} className="text-slate-800 font-medium">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Durée & Coefficient */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Durée (Min)</label>
                <div className="flex items-center px-3 py-2 rounded-xl focus-within:border-indigo-500">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                  <input type="number" min="1" value={examDuration || ''} onChange={(e) => setExamDuration(Number(e.target.value))} className="flex-1 bg-transparent border-none outline-none text-xs font-mono font-bold text-slate-800" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Coefficient</label>
                <div className="flex items-center px-3 py-2 rounded-xl focus-within:border-indigo-500">
                  <Settings className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
                  <input type="number" min="1" value={examCoeff || ''} onChange={(e) => setExamCoeff(Number(e.target.value))} className="flex-1 bg-transparent border-none outline-none text-xs font-mono font-bold text-slate-800" />
                </div>
              </div>
            </div>

            {/* Calendrier */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Ouverture</label>
                <input type="datetime-local" value={examOpening || ''} onChange={(e) => setExamOpening(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Fermeture</label>
                <input type="datetime-local" value={examClosing || ''} onChange={(e) => setExamClosing(e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-500" />
              </div>
            </div>

          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(false)}
              className="px-5 py-2 bg-[#F4C542] hover:bg-[#F4C542]/80 text-black/80 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              Appliquer les paramètres
            </button>
          </div>

        </div>
      </div>
    )}

   {/* ================= MODAL 2 : CRÉATEUR DE QUESTION ================= */}
{isQuestionModalOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-xl overflow-hidden transform transition-all animate-scaleUp">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
        <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-3.5 bg-[#F4C542] rounded-full"></span>
          Créateur de Question Automatisée
        </h4>
        <button 
          type="button" 
          onClick={() => setIsQuestionModalOpen(false)}
          className="text-slate-400 hover:text-slate-600 text-sm font-bold bg-transparent border-none cursor-pointer p-1"
        >✕</button>
      </div>

      {/* Form Content */}
      <div className="p-6 space-y-5 text-xs font-semibold max-h-[75vh] overflow-y-auto">
        
        {/* Type Formats */}
        <div className="space-y-2">
          <label className="block text-[10px] font-black uppercase text-slate-400">Format de question QuizTech</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              onClick={() => { setTempQType("MCQ"); setTempQCorrect(""); }}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${tempQType === "MCQ" ? "bg-indigo-50/40 border-indigo-600" : "bg-white border-slate-200 hover:border-slate-300"}`}
            >
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${tempQType === "MCQ" ? "border-indigo-600" : "border-slate-300"}`}>
                {tempQType === "MCQ" && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-xs">Question à Choix Multiples (QCM)</p>
                <p className="text-[10px] text-slate-400 font-normal mt-0.5">Une ou plusieurs cases cochées comme correctes.</p>
              </div>
            </div>

            <div
              onClick={() => { setTempQType("TRUE_FALSE"); setTempQCorrect("true"); }}
              className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${tempQType === "TRUE_FALSE" ? "bg-indigo-50/40 border-indigo-600" : "bg-white border-slate-200 hover:border-slate-300"}`}
            >
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${tempQType === "TRUE_FALSE" ? "border-indigo-600" : "border-slate-300"}`}>
                {tempQType === "TRUE_FALSE" && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
              </div>
              <div>
                <p className="font-bold text-slate-800 text-xs">Question Binaire (Vrai / Faux)</p>
                <p className="text-[10px] text-slate-400 font-normal mt-0.5">Validation d'une affirmation simple.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Énoncé & Coeff */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="sm:col-span-3">
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Énoncé de la question</label>
            <input
              type="text"
              placeholder="Saisissez l'énoncé clair..."
              value={tempQPrompt || ''}
              onChange={(e) => setTempQPrompt(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="sm:col-span-1">
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1 text-center">Points</label>
            <input
              type="number"
              min="1"
              value={tempQCoeff || 1}
              onChange={(e) => setTempQCoeff(Math.max(1, Number(e.target.value)))}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-mono font-bold bg-white text-slate-800 text-center outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* DYNAMIC TEMPLATE RENDERING */}
        {tempQType === "MCQ" && tempChoices && Array.isArray(tempChoices) && (
          <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-slideDown">
            <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider block mb-1">
              Configuration des Propositions
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tempChoices.map((choice) => {
                const currentCorrect = typeof tempQCorrect === "string" ? tempQCorrect : "";
                const checkedList = currentCorrect ? currentCorrect.split(",") : [];
                const isChecked = choice?.id ? checkedList.includes(choice.id) : false;
                
                return (
                  <div key={choice.id} className={`flex gap-2 items-center p-2 rounded-xl border transition-all ${isChecked ? "bg-emerald-50/40 border-emerald-300" : "bg-white border-slate-200"}`}>
                    <label className="flex items-center gap-2 shrink-0 cursor-pointer pl-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          let newChecked = isChecked 
                            ? checkedList.filter((item) => item !== choice.id)
                            : [...checkedList, choice.id];
                          setTempQCorrect(newChecked.join(","));
                        }}
                        className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
                      />
                      <span className={`text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center uppercase ${isChecked ? "bg-emerald-600 text-white" : "bg-slate-900 text-[#F4C542]"}`}>
                        {choice.id}
                      </span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Proposition..."
                      value={choice.text || ''}
                      onChange={(e) => handleChoiceTextChange(choice.id, e.target.value)}
                      className="w-full px-1 py-0.5 text-xs text-slate-800 bg-transparent outline-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TRUE_FALSE SECURED : Remplacement des icônes défectueuses par des SVG robustes */}
        {tempQType === "TRUE_FALSE" && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-slideDown">
            <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider block">
              Clé de correction
            </span>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setTempQCorrect("true")}
                className={`py-2.5 rounded-xl border font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${String(tempQCorrect) === "true" ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-white text-slate-600 border-slate-200"}`}
              >
                {/* SVG Vrai alternatif à CheckCircle */}
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Vrai (True)
              </button>
              <button
                type="button"
                onClick={() => setTempQCorrect("false")}
                className={`py-2.5 rounded-xl border font-bold text-xs uppercase flex items-center justify-center gap-2 cursor-pointer transition-all ${String(tempQCorrect) === "false" ? "bg-red-600 text-white border-red-600 shadow-sm" : "bg-white text-slate-600 border-slate-200"}`}
              >
                {/* SVG Faux alternatif à XCircle */}
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Faux (False)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Insérer */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
        <button
          type="button"
          onClick={(e) => {
            if (typeof handleAddQuestionToDraft === "function") {
              handleAddQuestionToDraft(e);
            }
            setIsQuestionModalOpen(false);
          }}
          className="w-full py-2.5 bg-[#F4C542] hover:bg-[#F4C542]/80 text-black/80 font-black text-xs rounded-xl shadow-md uppercase tracking-widest text-center transition-all cursor-pointer"
        >
          Valider et insérer la question au sujet
        </button>
      </div>

    </div>
  </div>
)}
  </div>
)}

{activeSubTab === "grading" && (
  <div className="space-y-6 animate-fadeIn">
    
    {/* KPIs - التزمنا بنفس التصميم ديالك */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold text-lg">✓</div>
        <div>
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Examens Corrigés</span>
          <span className="text-2xl font-extrabold text-slate-900">{filteredSubmissions?.filter((s) => s.isGraded).length || 0}</span>
        </div>
      </div>
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 font-bold text-lg">!</div>
        <div>
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">À valider</span>
          <span className="text-2xl font-extrabold text-amber-600">{filteredSubmissions?.filter((s) => !s.isGraded).length || 0}</span>
        </div>
      </div>
    </div>

{/* LAYOUT الرئيسي - القائمة تاخد العرض كامل */}
<div className="w-full h-auto">
  
  {/* القائمة: دابا غتاخد w-full بلا ما تقسمها مع اليمين */}
  <div className="w-full bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
    
    {/* Header القائمة */}
    <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row gap-4 items-center justify-between">
      <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-widest">
        Résultats des examens
      </h2>
      
      <div className="flex gap-3 w-full md:w-auto">
        <select 
          value={gradingExamFilter || "ALL"} 
          onChange={(e) => setGradingExamFilter?.(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-[11px] font-bold py-2.5 px-4 rounded-xl outline-none cursor-pointer hover:bg-slate-100 transition-colors"
        >
          <option value="ALL">Toutes les épreuves</option>
          {teacherExams?.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
        
        <input 
          type="text" 
          placeholder="Rechercher par nom..." 
          onChange={(e) => setSearchQuery?.(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-[11px] font-medium py-2.5 px-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
        />
      </div>
      
    </div>

    {/* القائمة الديناميكية (غادي تولي GRID باش تستغل المساحة كاملة) */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-50">
      {filteredSubmissions?.map((sub) => {
        const student = students?.find((s) => s.id === sub.studentId);
        return (
          <button 
            key={sub.id} 
            onClick={() => setSelectedSubmissionId?.(sub.id)}
            className="w-full text-left p-6 hover:bg-slate-50 transition-all flex justify-between items-center group"
          >
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                {student?.fullName || "Étudiant"}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {teacherExams?.find(e => e.id === sub.examId)?.title || "Examen"}
              </p>
            </div>
            {sub.isGraded ? (
              <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">
                {sub.score}/20
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-full uppercase">
                À valider
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
</div>
    {/* MODAL (كيخدم فكل الشاشات) */}
    {selectedSubmissionId && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 lg:p-4 bg-slate-900/40 backdrop-blur-md">
        <div className="bg-white w-full h-full lg:h-[90vh] lg:max-w-4xl lg:rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
            <h3 className="font-black text-sm">Console de correction</h3>
            <button onClick={() => setSelectedSubmissionId(null)} className="text-xs font-bold px-4 py-2 bg-slate-100 rounded-lg">FERMER</button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {/* هنا كتحط محتوى التصحيح ديالك */}
            <p>Détails de la soumission {selectedSubmissionId}...</p>
          </div>
        </div>
      </div>
    )}
  </div>
)}

{activeSubTab === "resources" && (
  <div className="space-y-8 animate-fadeIn">
    {/* Action Cards (Buttons) */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 select-none mb-8">
      
      {/* بطاقة: مشاركة الموارد */}
      <button 
        onClick={() => setShowResourceModal(true)}
        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 transition-all duration-300 hover:border-amber-200 hover:shadow-md text-left w-full group"
      >
        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0 group-hover:bg-amber-100 transition-colors">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ressources</span>
          <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">Partager un support</span>
          <span className="text-[10px] text-amber-600 font-semibold">{resources?.length || 0} documents en ligne</span>
        </div>
      </button>

      {/* بطاقة: نشر الإعلانات */}
      <button 
        onClick={() => setShowAnnonceModal(true)}
        className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center gap-4 transition-all duration-300 hover:border-amber-200 hover:shadow-md text-left w-full group"
      >
        <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0 group-hover:bg-amber-100 transition-colors">
          <Megaphone className="w-6 h-6" />
        </div>
        <div>
          <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Annonces</span>
          <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">Diffuser une annonce</span>
          <span className="text-[10px] text-amber-600 font-semibold">{announcements?.length || 0} messages diffusés</span>
        </div>
      </button>
    </div>

    {/* Grid Layout (Main Content) */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
     <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
          Ressources Pédagogiques ({resources?.length || 0})
        </h3>
      </div>

      <div className="space-y-4">
        {resources?.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">Aucune ressource partagée.</p>
        ) : (
          /* Affichage limité à 3 pour garder le design propre */
          resources.slice(0, 3).map((res) => (
            <div key={res.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:border-emerald-200 transition-all">
              <div>
                <p className="font-bold text-xs text-slate-900 mb-1">{res.title}</p>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase">
                  {res.type}
                </span>
              </div>
              <button 
                onClick={() => handleDeleteResourceLocal(res.id)} 
                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Lien "Voir tout" uniquement si plus de 3 ressources */}
      {resources?.length > 3 && (
        <button 
          onClick={() => setActiveTab('supports')} // Redirection vers l'onglet des supports
          className="w-full mt-6 text-[10px] font-black text-emerald-600 hover:text-emerald-700 uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
        >
          Voir toutes les ressources 
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>

     <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
          Flux d'Annonces
        </h3>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
          {announcements.length} actifs
        </span>
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">
            Aucune annonce diffusée.
          </p>
        ) : (
          /* On affiche uniquement les 3 dernières annonces pour ne pas surcharger */
          announcements.slice(0, 3).map((ann) => (
            <div 
              key={ann.id} 
              className="group relative p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all"
            >
              <p className="font-bold text-xs text-slate-900 mb-1">{ann.title}</p>
              <p className="text-[10px] text-slate-500 line-clamp-2">{ann.content}</p>

              {/* Bouton de suppression qui apparaît au survol */}
              <button 
                onClick={() => handleDelete(ann.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all"
                title="Supprimer l'annonce"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Lien "Voir tout" dynamique si plus de 3 annonces */}
      {announcements.length > 3 && (
        <button 
          onClick={() => setActiveTab('annonces')} // Redirection vers l'onglet des annonces
          className="w-full mt-5 text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-wider flex items-center justify-center gap-1 transition-all"
        >
          Voir tout l'historique 
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>



    </div>

    {/* Modals */}
    {showAnnonceModal && <AnnonceModal onClose={() => setShowAnnonceModal(false)} />}
    {showResourceModal && <ResourceModal onClose={() => setShowResourceModal(false)} />}
  </div>
)}
    </div>);
}
