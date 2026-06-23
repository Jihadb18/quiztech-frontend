
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import ProfilePicUploader from "./components/ProfilePicUploader";
import AdminDashboard from "./components/AdminDashboard";
import EnseignantDashboard from "./components/EnseignantDashboard";
import EtudiantDashboard from "./components/EtudiantDashboard";
import ExamRoom from "./components/ExamRoom";

import { getStored, setStored, initializeMockDB, INITIAL_USERS, INITIAL_SUBJECTS, INITIAL_CLASSES, INITIAL_EXAMS, INITIAL_SUBMISSIONS, INITIAL_AUDIT_LOGS, INITIAL_NOTIFICATIONS, INITIAL_ANNOUNCEMENTS, INITIAL_RESOURCES, } from "./db/mockData";
export default function App() {
    const [currentUser, setCurrentUser] = useState(() => {
        const stored = localStorage.getItem("qt_current_user");
        if (stored) {
            try {
                return JSON.parse(stored);
            }
            catch {
                return null;
            }
        }
        return null;
    });
    const [currentPage, setCurrentPage] = useState(() => {
        const storedUser = localStorage.getItem("qt_current_user");
        if (storedUser) {
            return "dashboard";
        }
        const hash = window.location.hash;
        if (hash === "#/login")
            return "login";
        return "landing";
    });
    const [showProfileModal, setShowProfileModal] = useState(false);
    const syncCurrentUser = (user) => {
        setCurrentUser(user);
        if (user) {
            localStorage.setItem("qt_current_user", JSON.stringify(user));
        }
        else {
            localStorage.removeItem("qt_current_user");
        }
    };
    const [users, setUsers] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [exams, setExams] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [resources, setResources] = useState([]);
    const [activeExam, setActiveExam] = useState(null);
    const [isPracticeMode, setIsPracticeMode] = useState(false);
    const [currentClock, setCurrentClock] = useState("");
    const [toasts, setToasts] = useState([]);
    useEffect(() => {
        initializeMockDB();
        setUsers(getStored("qt_users", INITIAL_USERS));
        setSubjects(getStored("qt_subjects", INITIAL_SUBJECTS));
        setClasses(getStored("qt_classes", INITIAL_CLASSES));
        setExams(getStored("qt_exams", INITIAL_EXAMS));
        setSubmissions(getStored("qt_submissions", INITIAL_SUBMISSIONS));
        setAuditLogs(getStored("qt_audit_logs", INITIAL_AUDIT_LOGS));
        setNotifications(getStored("qt_notifications", INITIAL_NOTIFICATIONS));
        setAnnouncements(getStored("qt_announcements", INITIAL_ANNOUNCEMENTS));
        setResources(getStored("qt_resources", INITIAL_RESOURCES));
    }, []);
    useEffect(() => {
        const clockTimer = setInterval(() => {
            const now = new Date();
            setCurrentClock(now.toLocaleString("fr-FR", {
                timeZone: "UTC",
                hour12: false,
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
            }));
        }, 1000);
        return () => clearInterval(clockTimer);
    }, []);
    useEffect(() => {
        if (activeExam) {
            if (window.location.hash !== "#/exam") {
                window.location.hash = "#/exam";
            }
            return;
        }
        let targetHash = "#/";
        if (currentPage === "landing") {
            targetHash = "#/";
        }
        else if (currentPage === "login") {
            targetHash = "#/login";
        }
        else if (currentPage === "dashboard" && currentUser) {
            const uRole = (currentUser.role || "").toUpperCase();
            if (uRole === "ADMIN") {
                targetHash = "#/dashboard/admin";
            }
            else if (uRole === "TEACHER" || uRole === "ENSEIGNANT") {
                targetHash = "#/dashboard/teacher";
            }
            else if (uRole === "STUDENT" || uRole === "ETUDIANT") {
                targetHash = "#/dashboard/student";
            }
        }
        if (window.location.hash !== targetHash) {
            window.location.hash = targetHash;
        }
    }, [currentPage, currentUser, activeExam]);
    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash;
            // Allow landing and login bypass
            if (hash === "#/" || hash === "" || hash === "#/landing") {
                if (currentPage !== "landing")
                    setCurrentPage("landing");
                return;
            }
            if (hash === "#/login") {
                if (currentPage !== "login")
                    setCurrentPage("login");
                return;
            }
            // If they try to force any dashboard url
            if (hash.includes("/dashboard")) {
                if (!currentUser) {
                    triggerToast("Accès Refusé", "Sécurité RBAC : Veuillez vous authentifier pour afficher cette page.", "security");
                    window.location.hash = "#/login";
                    setCurrentPage("login");
                    return;
                }
                const uRole = (currentUser.role || "").toUpperCase();
                const getDashboardSlug = (role) => {
                    const r = (role || "").toUpperCase();
                    if (r === "ADMIN")
                        return "admin";
                    if (r === "TEACHER" || r === "ENSEIGNANT")
                        return "teacher";
                    return "student";
                };
                // Validate Role restrictions
                if (hash === "#/dashboard/admin" && uRole !== "ADMIN") {
                    addAuditLog("Violation de sécurité", `Tentative frauduleuse d'accès forcé aux paramètres Administrateur par : ${currentUser.fullName || currentUser.name} (${currentUser.role})`, "SECURITY", currentUser);
                    addNotification("Alerte de Sécurité RBAC", `Tentative d'accès non-autorisé aux paramètres Admin par ${currentUser.fullName || currentUser.name} (${currentUser.role || "Anonyme"}).`, "DANGER");
                    triggerToast("Accès Interdit (RBAC)", "Violation de sécurité : Droits d'administrateur système requis.", "security");
                    window.location.hash = `#/dashboard/${getDashboardSlug(uRole)}`;
                    return;
                }
                if (hash === "#/dashboard/teacher" && uRole !== "TEACHER" && uRole !== "ENSEIGNANT") {
                    addAuditLog("Violation de sécurité", `Tentative frauduleuse d'accès forcé aux paramètres Enseignant par : ${currentUser.fullName || currentUser.name} (${currentUser.role})`, "SECURITY", currentUser);
                    addNotification("Alerte de Sécurité RBAC", `Tentative d'accès non-autorisé aux paramètres Professeur par ${currentUser.fullName || currentUser.name} (${currentUser.role || "Anonyme"}).`, "DANGER");
                    triggerToast("Accès Interdit (RBAC)", "Violation de sécurité : Droits d'enseignant requis.", "security");
                    window.location.hash = `#/dashboard/${getDashboardSlug(uRole)}`;
                    return;
                }
                if (hash === "#/dashboard/student" && uRole !== "STUDENT" && uRole !== "ETUDIANT") {
                    addAuditLog("Violation de sécurité", `Tentative frauduleuse d'accès forcé aux paramètres étudiant par : ${currentUser.fullName || currentUser.name} (${currentUser.role})`, "SECURITY", currentUser);
                    addNotification("Alerte de Sécurité RBAC", `Tentative d'accès non-autorisé aux paramètres Étudiant par ${currentUser.fullName || currentUser.name} (${currentUser.role || "Anonyme"}).`, "DANGER");
                    triggerToast("Accès Interdit (RBAC)", "Violation de sécurité : Compte Étudiant requis.", "security");
                    window.location.hash = `#/dashboard/${getDashboardSlug(uRole)}`;
                    return;
                }
                if (currentPage !== "dashboard") {
                    setCurrentPage("dashboard");
                }
            }
        };
        window.addEventListener("hashchange", handleHashChange);
        // Initial run
        handleHashChange();
        return () => window.removeEventListener("hashchange", handleHashChange);
    }, [currentUser, activeExam, currentPage]);
    // Sync back state changes to localStorage
    const syncUsers = (list) => {
        setUsers(list);
        setStored("qt_users", list);
    };
    const syncExams = (list) => {
        setExams(list);
        setStored("qt_exams", list);
    };
    const syncSubmissions = (list) => {
        setSubmissions(list);
        setStored("qt_submissions", list);
    };
    const syncClasses = (list) => {
        setClasses(list);
        setStored("qt_classes", list);
    };
    const syncSubjects = (list) => {
        setSubjects(list);
        setStored("qt_subjects", list);
    };
    const syncAnnouncements = (list) => {
        setAnnouncements(list);
        setStored("qt_announcements", list);
    };
    const syncResources = (list) => {
        setResources(list);
        setStored("qt_resources", list);
    };
    const syncNotifications = (list) => {
        setNotifications(list);
        setStored("qt_notifications", list);
    };
    const addNotification = (title, message, type = "INFO", userId = "ALL") => {
        const newNot = {
            id: `not_${Date.now()}`,
            userId,
            title,
            message,
            timestamp: new Date().toISOString(),
            isRead: false,
            type,
        };
        const updated = [newNot, ...notifications];
        setNotifications(updated);
        setStored("qt_notifications", updated);
        triggerToast(title, message, type === "DANGER" ? "security" : type === "VALIDATION" ? "success" : "info");
    };
    const addAuditLog = (action, details, category, targetUser) => {
        const userAgent = targetUser || currentUser;
        const newLog = {
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            userId: userAgent?.id || "GUEST",
            userEmail: userAgent?.email || "anonymous",
            role: userAgent?.role || "STUDENT",
            action,
            details,
            category,
        };
        const updated = [...auditLogs, newLog];
        setAuditLogs(updated);
        setStored("qt_audit_logs", updated);
    };
    // Toast dynamic triggers
    const triggerToast = (title, message, type = "info") => {
        const addedToast = {
            id: `toast_${Date.now()}`,
            title,
            message,
            type,
        };
        setToasts((prev) => [...prev, addedToast]);
        // Auto erase toast after 4s
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== addedToast.id));
        }, 4500);
    };
    // 3. Authentications Flows
    const handleLoginSuccess = (user) => {
        // Flag status online
        const updatedUsers = users.map((u) => u.id === user.id
            ? { ...u, status: "ONLINE", lastActivity: new Date().toISOString() }
            : u);
        syncUsers(updatedUsers);
        // Set user context
        const connectedUser = updatedUsers.find((u) => u.id === user.id) || user;
        syncCurrentUser(connectedUser);
        setCurrentPage("dashboard");
        // Audit trailing logs
        addAuditLog("Connexion de l'utilisateur", `Session de travail démarrée pour ${user.fullName}`, "AUTHENTICATION", connectedUser);
        // Notify Administrator globally
        triggerToast("Superviseur Notifié", `L'utilisateur ${user.fullName} (${user.role}) s'est connecté au terminal scolaire.`, "info");
    };
    const handleLogout = () => {
        if (currentUser) {
            // Flag status offline
            const updatedUsers = users.map((u) => u.id === currentUser.id
                ? { ...u, status: "OFFLINE", lastActivity: new Date().toISOString() }
                : u);
            syncUsers(updatedUsers);
            const cachedUser = currentUser;
            addAuditLog("Déconnexion sécurisée", `L'utilisateur ${cachedUser.fullName} a clôturé sa session d'évaluation.`, "AUTHENTICATION", cachedUser);
            syncCurrentUser(null);
            setCurrentPage("landing");
            // Toast alerts
            triggerToast("Superviseur Notifié", `L'utilisateur ${cachedUser.fullName} s'est déconnecté. Session archivée.`, "info");
        }
    };
    const handleUpdateSelfUser = (updatedUser) => {
        const updatedList = users.map((u) => u.id === updatedUser.id ? updatedUser : u);
        syncUsers(updatedList);
        syncCurrentUser(updatedUser);
        addAuditLog("Mise à jour profil", "Modification de la photo de profil ou paramètres d'identité", "USER_MANAGEMENT", updatedUser);
        triggerToast("Notification Système", "Vos informations de profil et d'identité ont été mises à jour.", "success");
    };
    // 4. Exams administrative and builder triggers
    const handleAddExamProposal = (exam) => {
        const list = [...exams, exam];
        syncExams(list);
        addAuditLog("Création de sujet d'examen", `Nouveau sujet proposé : ${exam.title}`, "EXAM_MANAGEMENT");
        // Notification to Administrator validation center
        triggerToast("Validation Académique", `Un nouveau sujet d'examen '${exam.title}' est en attente d'approbation administrative.`, "warning");
    };
    const handleUpdateExamProposal = (exam) => {
        const list = exams.map((e) => (e.id === exam.id ? exam : e));
        syncExams(list);
        addAuditLog("Modification de sujet d'examen", `Mise à jour du sujet : ${exam.title}`, "EXAM_MANAGEMENT");
    };
    const handleDeleteExamProposal = (id) => {
        const list = exams.filter((e) => e.id !== id);
        syncExams(list);
        addAuditLog("Suppression de sujet d'examen", `Sujet ID: ${id} a été effacé du registre`, "EXAM_MANAGEMENT");
    };
    const handleValidateExamByAdmin = (examId, action, feedback) => {
        const targetExam = exams.find((e) => e.id === examId);
        if (!targetExam)
            return;
        let targetStatus = "APPROVED";
        let logMessage = "";
        if (action === "APPROVE") {
            targetStatus = "APPROVED";
            logMessage = `L'administrateur a validé et autorisé le sujet : ${targetExam.title}`;
        }
        else {
            targetStatus = "REJECTED";
            logMessage = `L'administrateur a rejeté le sujet : ${targetExam.title}. Motif : ${feedback}`;
        }
        const updatedList = exams.map((e) => {
            if (e.id === examId) {
                return {
                    ...e,
                    status: targetStatus,
                    rejectionComment: action === "REJECT" ? feedback : undefined,
                    // If approved, automatically publish so student can interact!
                    isPublished: action === "APPROVE",
                };
            }
            return e;
        });
        // Make approved published automatically
        const editedExam = updatedList.find((e) => e.id === examId);
        if (editedExam && action === "APPROVE") {
            editedExam.status = "PUBLISHED";
            editedExam.isPublished = true;
        }
        syncExams(updatedList);
        addAuditLog("Arbitrage d'évaluation", logMessage, "EXAM_MANAGEMENT");
        // Send notifications to the teacher
        const notificationType = action === "APPROVE" ? "VALIDATION" : "DANGER";
        const notificationTitle = action === "APPROVE" ? "Sujet d'examen approuvé !" : "Sujet d'examen rejeté";
        const notificationMsg = action === "APPROVE"
            ? `Votre sujet d'examen "${targetExam.title}" a été approuvé et publié.`
            : `Votre sujet d'examen "${targetExam.title}" a été rejeté. Motif: ${feedback}`;
        addNotification(notificationTitle, notificationMsg, notificationType, targetExam.teacherId);
    };
    // 5. Test Room participation submission handler
    const handleStartExam = (exam, isPractice) => {
        setActiveExam(exam);
        setIsPracticeMode(isPractice);
        addAuditLog("Démarrage d'examen d'évaluation", `L'élève est entré dans la salle d'examen sécurisée pour : ${exam.title}`, "SECURITY");
        triggerToast("Terminal Sécurisé", "L'accès aux ports d'évasion réseau est suspendu pendant l'examen.", "security");
    };
    const handleSubmissionCompleted = (answersInput, infractionsCount, infractionsLogs) => {
        if (!activeExam || !currentUser)
            return;
        // Compile grade automatically for MCQs, True/False, Short answers. Default Programming is scored out of testCasesPassed
        let finalMark = 0;
        let maxCoeffTotal = 0;
        const questionsList = activeExam.questions || [];
        questionsList.forEach((q) => {
            maxCoeffTotal += q.coefficient;
            const ans = answersInput.find((a) => a.questionId === q.id);
            if (!ans)
                return;
            if (q.type === "MCQ" && ans.selectedChoiceId === q.correctAnswer) {
                finalMark += q.coefficient;
            }
            else if (q.type === "TRUE_FALSE" &&
                ans.textAnswer === q.correctAnswer) {
                finalMark += q.coefficient;
            }
            else if (q.type === "SHORT_ANSWER" &&
                ans.textAnswer?.toLowerCase().trim() ===
                    q.correctAnswer.toLowerCase().trim()) {
                finalMark += q.coefficient;
            }
            else if (q.type === "PROGRAMMING" && ans.codeSubmission) {
                const proportionPassed = ans.codeSubmission.testCasesPassed /
                    (ans.codeSubmission.testCasesTotal || 1);
                finalMark += proportionPassed * q.coefficient;
            }
        });
        // Map calculated mark out of 20
        const scoreOutof20 = maxCoeffTotal > 0
            ? Number(((finalMark / maxCoeffTotal) * 20).toFixed(1))
            : 20;
        const newSub = {
            id: `subm_${Date.now()}`,
            examId: activeExam.id,
            studentId: currentUser.id,
            startTime: new Date(Date.now() - activeExam.durationMinutes * 60000).toISOString(),
            submissionTime: new Date().toISOString(),
            answers: answersInput,
            score: scoreOutof20,
            isGraded: !isPracticeMode, // Practice are instant, academic can be reviewed as well
            antiFraudIncidentCount: infractionsCount,
            antiFraudDetails: infractionsLogs,
            teacherFeedback: isPracticeMode
                ? "Génération automatique d'évaluation libre."
                : undefined,
        };
        const updatedSubmissions = [...submissions, newSub];
        syncSubmissions(updatedSubmissions);
        addAuditLog("Soumission de copie d'examen d'évaluation", `L'élève a rendu son examen '${activeExam.title}' avec ${infractionsCount} suspicion(s) de triche.`, "AUTHENTICATION");
        triggerToast("Examen Rendu", `Votre copie de structures '${activeExam.title}' a été archivée avec succès. Reçu disponible.`, "success");
        setActiveExam(null);
    };
    const handleGradeSubmissionByTeacher = (subId, score, feedback) => {
        const updated = submissions.map((s) => {
            if (s.id === subId) {
                return { ...s, score, teacherFeedback: feedback, isGraded: true };
            }
            return s;
        });
        syncSubmissions(updated);
        addAuditLog("Notation de copie d'étude", `Une copie ID: ${subId} a été notée avec la note de : ${score}/20`, "GRADING");
        triggerToast("Publication de Note", "Le relevé de notes et rapport d'évaluation scolaire a été publié.", "success");
    };
    const handleGrantExtraTimeByTeacher = (examId, classId, minutes, studentId) => {
        const updatedList = exams.map((e) => {
            if (e.id === examId) {
                const currentDuration = Number(e.durationMinutes) || 60;
                const newDuration = currentDuration + Number(minutes);
                let newClosingDate = e.closingDate;
                try {
                    const dateObj = new Date(e.closingDate);
                    dateObj.setMinutes(dateObj.getMinutes() + Number(minutes));
                    newClosingDate = dateObj.toISOString();
                }
                catch (err) {
                    console.error(err);
                }
                return {
                    ...e,
                    durationMinutes: newDuration,
                    closingDate: newClosingDate,
                };
            }
            return e;
        });
        syncExams(updatedList);
        const exam = exams.find((e) => e.id === examId);
        if (!exam)
            return;
        // Log the transaction
        const targetLabel = studentId
            ? `Étudiant ID: ${studentId}`
            : "Classe entière";
        addAuditLog("Aménagement temporel (Tiers-Temps)", `Octroi de +${minutes} minutes réglementaires complémentaires pour l'examen: ${exam.title} (${targetLabel})`, "SECURITY");
        triggerToast("Tiers-Temps Accordé", `Temps additionnel autorisé de +${minutes} minutes.`, "info");
    };
    // User Administration callbacks
    const handleAddUser = (added) => {
        syncUsers([...users, added]);
        addAuditLog("Inscription utilisateur", `Création du compte d'accès pour : ${added.fullName}`, "USER_MANAGEMENT");
    };
    const handleUpdateUser = (updated) => {
        syncUsers(users.map((u) => (u.id === updated.id ? updated : u)));
    };
    const handleDeleteUser = (id) => {
        syncUsers(users.filter((u) => u.id !== id));
    };
    const handleAddClass = (c) => {
        syncClasses([...classes, c]);
        addAuditLog("Création de classe", `Création de la promotion : ${c.name}`, "CLASS_MANAGEMENT");
    };
    const handleUpdateClass = (c) => {
        syncClasses(classes.map((item) => (item.id === c.id ? c : item)));
        addAuditLog("Affectation d'élèves", `Mise à jour d'élèves de la classe : ${c.name}`, "CLASS_MANAGEMENT");
    };
    const handleDeleteClass = (id) => {
        syncClasses(classes.filter((item) => item.id !== id));
    };
    const handleAddSubject = (s) => {
        syncSubjects([...subjects, s]);
        addAuditLog("Création de matière", `Création de l'enseignement : ${s.name}`, "CLASS_MANAGEMENT");
    };
    const handleDeleteSubject = (id) => {
        syncSubjects(subjects.filter((item) => item.id !== id));
    };
    return (<div className="min-h-screen bg-slate-50 flex flex-col selection:bg-amber-100" style={{ maxWidth: "100vw", overflowX: "hidden" }}>
      {/* If an active secure exam is running, lock header views out */}
      {!activeExam && currentPage === "dashboard" ? (<Navbar currentUser={currentUser} currentClock={currentClock} onLogout={handleLogout} onNavigateLogin={() => setCurrentPage("login")} onTriggerProfileSettings={() => setShowProfileModal(true)} notifications={notifications} onSyncNotifications={syncNotifications}/>) : null}

      {/* Primary Page views controller routing */}
      <main className="flex-grow">
        {activeExam ? (<ExamRoom exam={activeExam} isPractice={isPracticeMode} onCancelExam={() => setActiveExam(null)} onSubmitCompleted={handleSubmissionCompleted}/>) : (<>
            {currentPage === "landing" && (<LandingPage onNavigateLogin={() => setCurrentPage("login")} onExplorePlatforms={() => setCurrentPage("login")}/>)}

            {currentPage === "login" && (<LoginPage users={users} syncUsers={syncUsers} onNavigateHome={() => setCurrentPage("landing")} onLoginSuccess={handleLoginSuccess}/>)}

            {currentPage === "dashboard" && currentUser && (<>
                {(((currentUser.role || "").toUpperCase() === "STUDENT" || (currentUser.role || "").toUpperCase() === "ETUDIANT")) && (<EtudiantDashboard currentUser={currentUser} exams={exams} submissions={submissions} subjects={subjects} classes={classes} currentClock={currentClock} onStartExam={handleStartExam} announcements={announcements} resources={resources} onSyncSubmissions={syncSubmissions}/>)}

                {(((currentUser.role || "").toUpperCase() === "TEACHER" || (currentUser.role || "").toUpperCase() === "ENSEIGNANT")) && (<EnseignantDashboard currentUser={currentUser} exams={exams} submissions={submissions} subjects={subjects} classes={classes} students={users} onAddExam={handleAddExamProposal} onUpdateExam={handleUpdateExamProposal} onDeleteExam={handleDeleteExamProposal} onGradeSubmission={handleGradeSubmissionByTeacher} onGrantExtraTime={handleGrantExtraTimeByTeacher} announcements={announcements} resources={resources} onSyncAnnouncements={syncAnnouncements} onSyncResources={syncResources}/>)}

                {(((currentUser.role || "").toUpperCase() === "ADMIN")) && (<AdminDashboard currentUser={currentUser} users={users} classes={classes} subjects={subjects} exams={exams} auditLogs={auditLogs} sessions={[]} // Loaded online indicator states dynamically
                 onAddUser={handleAddUser} onUpdateUser={handleUpdateUser} onDeleteUser={handleDeleteUser} onAddClass={handleAddClass} onUpdateClass={handleUpdateClass} onDeleteClass={handleDeleteClass} onAddSubject={handleAddSubject} onDeleteSubject={handleDeleteSubject} onValidateExam={handleValidateExamByAdmin} announcements={announcements} onSyncAnnouncements={syncAnnouncements} notifications={notifications} onSyncNotifications={syncNotifications} onAddNotification={addNotification}/>)}
              </>)}
          </>)}
      </main>

      {!activeExam && currentPage === "landing" ? <Footer /> : null}

      {/* Slide-over account setting panel modal upload controls */}
      {showProfileModal && currentUser && (<ProfilePicUploader currentUser={currentUser} onClose={() => setShowProfileModal(false)} onUpdateUser={handleUpdateSelfUser}/>)}

      {/* Visual Live real-time notification Toast Alerts stack Container */}
      <div id="toast-container" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full selection:bg-transparent pointer-events-none">
        {toasts.map((t) => (<div key={t.id} className="p-4 bg-slate-950 text-white rounded-xl shadow-2xl border-l-4 border-amber-400 flex items-start gap-3 pointer-events-auto transform translate-y-0 opacity-100 transition-all duration-300">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0 mt-1.5"/>
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-amber-400 leading-none">
                {t.title}
              </p>
              <p className="text-[11px] font-semibold text-slate-300 mt-1 leading-snug">
                {t.message}
              </p>
            </div>
          </div>))}
      </div>
    </div>);
}
