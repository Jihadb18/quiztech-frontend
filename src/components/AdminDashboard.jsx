import React, { useState } from "react";
import { Users, BookOpen, Clock, ShieldCheck, Key, Plus, Trash2, CheckCircle, XCircle, Layers, Sliders, ArrowLeftRight, Pencil, AlertTriangle, Megaphone, Bell, Send, } from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";
export default function AdminDashboard({ currentUser, users, classes, subjects, exams, auditLogs, announcements = [], notifications = [], onSyncAnnouncements: parentSyncAnnouncements, onSyncNotifications: parentSyncNotifications, }) {
    const [activeTab, setActiveTab] = useState("stats");
    // Load questions from local storage
    const questions = [];
    try {
        const localQ = localStorage.getItem("qt_questions");
        if (localQ) {
            questions.push(...JSON.parse(localQ));
        }
    }
    catch { }
    // Local helper adaptation callbacks to save directly down to Database
    const onUpdateUsers = (updated) => {
        const formatted = updated.map((u) => {
            let upperRole = "STUDENT";
            if (u.role === "admin")
                upperRole = "ADMIN";
            if (u.role === "enseignant")
                upperRole = "TEACHER";
            return {
                ...u,
                fullName: u.name,
                role: upperRole
            };
        });
        localStorage.setItem("qt_users", JSON.stringify(formatted));
        location.reload();
    };
    const onUpdateClasses = (updated) => {
        localStorage.setItem("qt_classes", JSON.stringify(updated));
        location.reload();
    };
    const onUpdateSubjects = (updated) => {
        localStorage.setItem("qt_subjects", JSON.stringify(updated));
        location.reload();
    };
    const onUpdateExams = (updated) => {
        localStorage.setItem("qt_exams", JSON.stringify(updated));
        location.reload();
    };
    const onUpdateAnnouncements = parentSyncAnnouncements;
    const onUpdateNotifications = (updated) => {
        const formatted = updated.map((n) => {
            let upperType = "INFO";
            if (n.type === "alert" || n.type === "warning")
                upperType = "DANGER";
            if (n.type === "success")
                upperType = "VALIDATION";
            return {
                ...n,
                message: n.content,
                type: upperType
            };
        });
        parentSyncNotifications(formatted);
    };
    const onAddLog = (action, details) => {
        try {
            const logs = JSON.parse(localStorage.getItem("qt_audit_logs") || "[]");
            logs.push({
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString(),
                userId: currentUser?.id,
                userName: currentUser?.fullName || currentUser?.name || "Administrateur",
                action,
                details
            });
            localStorage.setItem("qt_audit_logs", JSON.stringify(logs));
        }
        catch { }
    };
    // Map roles back and forth with App.tsx types
    const mapRoleToApp = (role) => {
        const r = role.toLowerCase();
        if (r === "admin")
            return "admin";
        if (r === "teacher" || r === "enseignant")
            return "enseignant";
        return "etudiant";
    };
    const mapRoleToUI = (role) => {
        const r = role.toLowerCase();
        if (r === "admin")
            return "ADMIN";
        if (r === "enseignant" || r === "teacher")
            return "TEACHER";
        return "STUDENT";
    };
    // Map arrays for display
    const mappedUsers = (users || []).map((u) => ({
        id: u.id,
        fullName: u.fullName || u.name,
        email: u.email,
        role: mapRoleToUI(u.role),
        avatarUrl: u.profilePic || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%2364748b'><circle cx='50' cy='50' r='50'/><circle cx='50' cy='40' r='20' fill='white'/><path d='M20,80 C20,60 80,60 80,80' fill='white'/></svg>",
        joinedDate: "2026-06-01",
        status: u.status || "OFFLINE",
        lastActivity: u.lastActivity || new Date().toISOString(),
        classId: u.classId || "",
    }));
    const mappedClasses = (classes || []).map((c) => {
        const studentIds = (users || [])
            .filter((u) => u.classId === c.id && u.role === "etudiant")
            .map((u) => u.id);
        return {
            ...c,
            studentIds,
        };
    });
    const mappedExams = (exams || []).map((e) => ({
        ...e,
        questions: questions.filter((q) => q.examId === e.id),
        coefficient: e.coefficient || 2,
        durationMinutes: e.duration,
        status: e.status || (e.isActive ? "APPROVED" : "PENDING_VALIDATION"),
        teacherId: e.authorId,
    }));
    const mappedAuditLogs = (auditLogs || []).map((log) => {
        const associatedUser = (users || []).find((u) => u.id === log.userId);
        return {
            ...log,
            category: log.category || (log.action.includes("Connexion") || log.action.includes("Déconnexion") ? "AUTHENTICATION" : log.action.includes("Sujet") || log.action.includes("Examen") ? "EXAM_MANAGEMENT" : "USER_MANAGEMENT"),
            userEmail: log.userEmail || associatedUser?.email || "admin@hightech.edu",
        };
    });
    const mappedAnnouncements = (announcements || []).map((ann) => ({
        id: ann.id,
        title: ann.title,
        message: ann.content,
        author: ann.authorName,
        timestamp: ann.date,
        target: "ALL",
    }));
    // Updaters Adapters
    const onAddUser = (added) => {
        const newUser = {
            id: added.id,
            name: added.fullName,
            email: added.email,
            role: mapRoleToApp(added.role),
            classId: added.classId || undefined,
            profilePic: added.avatarUrl,
        };
        onUpdateUsers([...users, newUser]);
        onAddLog("Création Utilisateur", `Nouvel utilisateur créé : ${added.fullName} (${added.email})`);
    };
    const onUpdateUser = (updated) => {
        const updatedUser = {
            id: updated.id,
            name: updated.fullName,
            email: updated.email,
            role: mapRoleToApp(updated.role),
            classId: updated.classId || undefined,
            profilePic: updated.avatarUrl,
        };
        onUpdateUsers(users.map((u) => (u.id === updated.id ? { ...u, ...updatedUser } : u)));
        onAddLog("Modification Utilisateur", `Utilisateur ${updated.fullName} modifié.`);
    };
    const onDeleteUser = (id) => {
        const u = users.find((item) => item.id === id);
        onUpdateUsers(users.filter((item) => item.id !== id));
        if (u) {
            onAddLog("Suppression Utilisateur", `Utilisateur ${u.name} a été supprimé.`);
        }
    };
    const onAddClass = (newCls) => {
        const newClasse = {
            id: newCls.id,
            name: newCls.name,
            level: "L3",
        };
        onUpdateClasses([...classes, newClasse]);
        onAddLog("Création Classe", `Nouvelle classe enregistrée : ${newCls.name}`);
    };
    const onUpdateClass = (updated) => {
        onUpdateClasses(classes.map((c) => c.id === updated.id ? { ...c, name: updated.name, level: updated.level || c.level } : c));
        const targetClassId = updated.id;
        const targetStudentIds = updated.studentIds || [];
        const nextUsers = users.map((u) => {
            if (u.role === "etudiant") {
                const wasAssigned = u.classId === targetClassId;
                const isNowAssigned = targetStudentIds.includes(u.id);
                if (isNowAssigned && !wasAssigned)
                    return { ...u, classId: targetClassId };
                if (!isNowAssigned && wasAssigned)
                    return { ...u, classId: undefined };
            }
            return u;
        });
        onUpdateUsers(nextUsers);
    };
    const onAddSubject = (added) => {
        const newSub = { id: added.id, name: added.name };
        onUpdateSubjects([...subjects, newSub]);
        onAddLog("Ajout Matière", `Nouvelle matière académique ajoutée : ${added.name}`);
    };
    const onValidateExam = (exmId, decision, feedback) => {
        onUpdateExams(exams.map((e) => {
            if (e.id === exmId) {
                return {
                    ...e,
                    isActive: decision === "APPROVE",
                    status: decision === "APPROVE" ? "APPROVED" : "REJECTED",
                    feedback: feedback || "",
                };
            }
            return e;
        }));
        onAddLog(decision === "APPROVE" ? "Approbation Examen" : "Rejet Examen", `Examen ID ${exmId} ${decision === "APPROVE" ? "approuvé" : "rejeté par l'administrateur."}`);
    };
    const onSyncAnnouncements = (updatedList) => {
        onUpdateAnnouncements(updatedList.map((ann) => ({
            id: ann.id,
            title: ann.title,
            content: ann.message,
            date: ann.timestamp || new Date().toISOString(),
            authorName: ann.author || "Administration",
            role: "admin",
        })));
    };
    const onSyncNotifications = (updatedList) => {
        onUpdateNotifications(updatedList.map((n) => {
            let mappedType = "info";
            if (n.type === "DANGER")
                mappedType = "alert";
            if (n.type === "VALIDATION")
                mappedType = "success";
            return {
                id: n.id,
                title: n.title,
                content: n.message,
                date: n.date || new Date().toLocaleDateString("fr-FR"),
                isRead: false,
                userId: n.userId || currentUser?.id || "admin-1",
                type: mappedType,
            };
        }));
    };
    const onAddNotification = (title, msg, type, target = "ALL") => {
        let notificationType = "info";
        if (type === "DANGER" || type === "warning")
            notificationType = "alert";
        if (type === "VALIDATION" || type === "success")
            notificationType = "success";
        const baseNotif = {
            title,
            content: msg,
            date: new Date().toLocaleDateString("fr-FR"),
            isRead: false,
            type: notificationType,
        };
        const nextNotifs = [...notifications];
        if (target === "ALL") {
            users.forEach((u) => {
                nextNotifs.push({
                    id: `notif-${Date.now()}-${u.id}-${Math.random()}`,
                    userId: u.id,
                    ...baseNotif,
                });
            });
        }
        else {
            nextNotifs.push({
                id: `notif-${Date.now()}-${target}`,
                userId: target,
                ...baseNotif,
            });
        }
        onUpdateNotifications(nextNotifs);
    };
    // LOCAL DASHBOARD STATES
    const [userSearch, setUserSearch] = useState("");
    const [userRoleFilter, setUserRoleFilter] = useState("ALL");
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUserName, setNewUserName] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserRole, setNewUserRole] = useState("STUDENT");
    const [newUserClass, setNewUserClass] = useState("");
    const [tempPasswordToDisplay, setTempPasswordToDisplay] = useState("");
    // Edit User
    const [editingUser, setEditingUser] = useState(null);
    const [editUserName, setEditUserName] = useState("");
    const [editUserEmail, setEditUserEmail] = useState("");
    const [editUserRole, setEditUserRole] = useState("STUDENT");
    const [editUserStatus, setEditUserStatus] = useState("OFFLINE");
    const [editUserClass, setEditUserClass] = useState("");
    const [editUserError, setEditUserError] = useState("");
    // Delete User
    const [deletingUser, setDeletingUser] = useState(null);
    // Classroom Transfer & selection States
    const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
    const [newClassName, setNewClassName] = useState("");
    const [studentSearchFilter, setStudentSearchFilter] = useState("");
    // Subjects validation list States
    const [newSubName, setNewSubName] = useState("");
    const [newSubCode, setNewSubCode] = useState("");
    // Validation queues
    const [rejectId, setRejectId] = useState(null);
    const [rejectionFeedback, setRejectionFeedback] = useState("");
    // Log and commun tools states
    const [logCategoryFilter, setLogCategoryFilter] = useState("ALL");
    const [logSearchQuery, setLogSearchQuery] = useState("");
    const [newAnnTitle, setNewAnnTitle] = useState("");
    const [newAnnMessage, setNewAnnMessage] = useState("");
    const [newAnnTarget, setNewAnnTarget] = useState("ALL");
    const [annSearchQuery, setAnnSearchQuery] = useState("");
    const [testNotifTitle, setTestNotifTitle] = useState("");
    const [testNotifMsg, setTestNotifMsg] = useState("");
    const [testNotifType, setTestNotifType] = useState("INFO");
    const [testNotifTarget, setTestNotifTarget] = useState("ALL");
    // REORGANIZED KPI CALCULATIONS
    const totalStudents = mappedUsers.filter((u) => u.role === "STUDENT").length;
    const totalTeachers = mappedUsers.filter((u) => u.role === "TEACHER").length;
    const totalExams = mappedExams.length;
    const onlineCount = mappedUsers.filter((u) => u.status === "ONLINE").length;
    const currentClassObj = mappedClasses.find((c) => c.id === selectedClassId);
    const classStudentsList = currentClassObj
        ? mappedUsers.filter((u) => currentClassObj.studentIds.includes(u.id))
        : [];
    const availableStudentsList = mappedUsers.filter((u) => u.role === "STUDENT" &&
        (!currentClassObj || !currentClassObj.studentIds.includes(u.id)));
    const classesStatsData = mappedClasses.map((c) => ({
        name: c.name.length > 15 ? c.name.substring(0, 15) + "..." : c.name,
        Élèves: c.studentIds.length,
    }));
    const handleUpdateStudentClassAssignment = (studentId, targetClassId) => {
        mappedClasses.forEach((c) => {
            if (c.studentIds.includes(studentId) && c.id !== targetClassId) {
                onUpdateClass({ ...c, studentIds: c.studentIds.filter((id) => id !== studentId) });
            }
        });
        if (targetClassId) {
            const targetClass = mappedClasses.find((c) => c.id === targetClassId);
            if (targetClass && !targetClass.studentIds.includes(studentId)) {
                onUpdateClass({ ...targetClass, studentIds: [...targetClass.studentIds, studentId] });
            }
        }
    };
    const handleCreateUser = (e) => {
        e.preventDefault();
        if (!newUserEmail.toLowerCase().endsWith("@hightech.edu")) {
            alert("Erreur de sécurité : Seul le domaine @hightech.edu est autorisé.");
            return;
        }
        const tempPwd = "tempPassword123";
        const addedId = `usr_${Date.now()}`;
        onAddUser({
            id: addedId,
            fullName: newUserName,
            email: newUserEmail,
            role: newUserRole,
            avatarUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%2364748b'><circle cx='50' cy='50' r='50'/><circle cx='50' cy='40' r='20' fill='white'/><path d='M20,80 C20,60 80,60 80,80' fill='white'/></svg>",
            classId: newUserClass,
        });
        if (newUserRole === "STUDENT" && newUserClass) {
            handleUpdateStudentClassAssignment(addedId, newUserClass);
        }
        setTempPasswordToDisplay(`Compte créé ! Mot de passe temporaire : ${tempPwd}`);
        setNewUserName("");
        setNewUserEmail("");
        setNewUserClass("");
    };
    const handleStartEditUser = (usr) => {
        setEditingUser(usr);
        setEditUserName(usr.fullName);
        setEditUserEmail(usr.email);
        setEditUserRole(usr.role);
        setEditUserStatus(usr.status || "OFFLINE");
        const found = mappedClasses.find((c) => c.studentIds.includes(usr.id));
        setEditUserClass(found ? found.id : "");
        setEditUserError("");
    };
    const handleSaveEditUser = (e) => {
        e.preventDefault();
        if (!editUserEmail.trim() || !editUserName.trim()) {
            setEditUserError("Champs obligatoires manquants.");
            return;
        }
        if (!editUserEmail.toLowerCase().endsWith("@hightech.edu")) {
            setEditUserError("Erreur : Seul le domaine @hightech.edu est autorisé.");
            return;
        }
        onUpdateUser({
            ...editingUser,
            fullName: editUserName,
            email: editUserEmail,
            role: editUserRole,
            status: editUserStatus,
        });
        if (editUserRole === "STUDENT") {
            handleUpdateStudentClassAssignment(editingUser.id, editUserClass);
        }
        setEditingUser(null);
    };
    const handleConfirmDeleteUser = () => {
        if (!deletingUser)
            return;
        onDeleteUser(deletingUser.id);
        setDeletingUser(null);
    };
    const handleResetPasswordAction = (usr) => {
        alert(`Réinitialisé ! Clé temporaire : tempReset789`);
    };
    const handleCreateClass = (e) => {
        e.preventDefault();
        if (!newClassName.trim())
            return;
        const cid = `cls_${Date.now()}`;
        onAddClass({ id: cid, name: newClassName });
        setNewClassName("");
        setSelectedClassId(cid);
    };
    const handleAssignStudent = (studentId) => {
        if (!currentClassObj)
            return;
        onUpdateClass({ ...currentClassObj, studentIds: [...currentClassObj.studentIds, studentId] });
    };
    const handleUnassignStudent = (studentId) => {
        if (!currentClassObj)
            return;
        onUpdateClass({ ...currentClassObj, studentIds: currentClassObj.studentIds.filter((id) => id !== studentId) });
    };
    const handleApproveExam = (exmId) => {
        onValidateExam(exmId, "APPROVE");
        alert("Examen approuvé avec succès !");
    };
    const handleRejectExam = (e) => {
        e.preventDefault();
        if (rejectId && rejectionFeedback.trim()) {
            onValidateExam(rejectId, "REJECT", rejectionFeedback);
            setRejectId(null);
            setRejectionFeedback("");
        }
    };
    return (<div id="admin-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans text-left">
      {/* Banner */}
      <div className="bg-[#0f172b] p-6 rounded-2xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="inline-flex px-2.5 py-0.5 bg-[#FBD057] text-black font-black text-[9px] uppercase rounded-[12px] tracking-wider border border-[#FBD057] mb-2">
  Espace Administrateur
</div>
          <h1 className="text-2xl md:text-3xl font-black">{currentUser?.name || "Yassmine Chraibi"}</h1>
          <p className="text-xs font-semibold text-slate-400">QuizTech Administrateur - HighTech School</p>
        </div>
        <div className="bg-white/70 border  px-4 py-3 rounded-2xl flex items-center gap-3 shadow-sm hover:shadow-md transition-all duration-300">
  
  <div className="w-10 h-10 rounded-xl bg-[#FBD057]/40 flex items-center justify-center">
    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
  </div>

  <div>
    <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-bold">
      Sessions actives
    </span>

    <span className="text-slate-900 font-extrabold text-sm flex items-center gap-2 mt-0.5">
      {onlineCount}
      <span className="text-emerald-600 font-semibold text-xs">
        connecté(s)
      </span>
    </span>
  </div>

</div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-1">
        {[
            { id: "stats", label: "Statistiques Globales", icon: <Sliders className="w-4 h-4 mr-1.5 inline"/> },
            { id: "users", label: "Utilisateurs & Accès", icon: <Users className="w-4 h-4 mr-1.5 inline"/> },
            { id: "text-classes", label: "Classes & Transferts", tab: "classes", icon: <ArrowLeftRight className="w-4 h-4 mr-1.5 inline"/> },
            { id: "validation", label: `Queue Académique (${mappedExams.filter((e) => e.status === "PENDING_VALIDATION").length})`, icon: <CheckCircle className="w-4 h-4 mr-1.5 inline"/> },
            { id: "audit", label: "Audit & Logs", icon: <Clock className="w-4 h-4 mr-1.5 inline"/> },
            { id: "communs", label: "Services Communs", icon: <Megaphone className="w-4 h-4 mr-1.5 inline"/> }
        ].map((t) => (<button key={t.id} onClick={() => setActiveTab(t.tab || t.id)} className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === (t.tab || t.id) ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
            {t.icon}
            {t.label}
          </button>))}
      </div>

      {/* Stats Panel */}
      {activeTab === "stats" && (<div className="space-y-8 select-none">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="block text-[9px] text-slate-400 font-extrabold uppercase">Étudiants Inscrits</span>
                <span className="text-2xl font-black">{totalStudents} bacheliers</span>
              </div>
              <Users className="w-8 h-8 text-[#F4C542]"/>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="block text-[9px] text-slate-400 font-extrabold uppercase">Professeurs Agrégés</span>
                <span className="text-2xl font-black">{totalTeachers} enseignants</span>
              </div>
              <BookOpen className="w-8 h-8 text-indigo-500"/>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="block text-[9px] text-slate-400 font-extrabold uppercase">Évaluations créées</span>
                <span className="text-2xl font-black">{totalExams} examens</span>
              </div>
              <Layers className="w-8 h-8 text-red-500"/>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200/60 flex items-center justify-between">
              <div>
                <span className="block text-[9px] text-slate-400 font-extrabold uppercase">Classes actives</span>
                <span className="text-2xl font-black">{classes.length} promotions</span>
              </div>
              <Sliders className="w-8 h-8 text-emerald-500"/>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 space-y-4">
              <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest">Répartition des élèves par classe</h3>
              <div className="h-64 text-xs font-semibold">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classesStatsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="name" stroke="#94a3b8"/>
                    <YAxis stroke="#94a3b8"/>
                    <Tooltip />
                    <Bar dataKey="Élèves" fill="#0F172A">
                      {classesStatsData.map((_, index) => (<Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#0F172A" : "#F4C542"}/>))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
              <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest">Sécurité</h3>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                <ShieldCheck className="w-6 h-6 text-amber-600"/>
                <p>Protection contre la triche et surveillance active des terminaux SHA-256 en direct.</p>
              </div>
              <div className="p-4 bg-slate-900 text-amber-400 text-center rounded-xl font-mono text-[10px] font-bold">
                MÉTROLOGIE : SSL SECURE CORE ONLINE
              </div>
            </div>
          </div>
        </div>)}

      {/* Users Tab */}
      {activeTab === "users" && (<div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border">
            <div className="flex gap-2 w-full md:w-auto">
              <input type="text" placeholder="Rechercher nom, e-mail..." value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="p-2 border rounded-lg text-xs font-semibold outline-none focus:border-[#F4C542] w-52 bg-slate-50"/>
              <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value)} className="p-2 border rounded-lg text-xs font-semibold outline-none bg-slate-50 text-slate-700">
                <option value="ALL">Tous les rôles</option>
                <option value="STUDENT">Étudiants</option>
                <option value="TEACHER">Enseignants</option>
                <option value="ADMIN">Administrateurs</option>
              </select>
            </div>
            <button onClick={() => {
                setShowAddUserModal(true);
                setTempPasswordToDisplay("");
            }} className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer">
              <Plus className="w-4 h-4"/> Créer un nouvel utilisateur
            </button>
          </div>

          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b text-[10px] font-extrabold uppercase text-slate-400">
                    <th className="p-4">Utilisateur</th>
                    <th className="p-4">Rôle</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4">Date Inscription</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700">
                  {mappedUsers
                .filter((u) => {
                const mS = u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
                const mR = userRoleFilter === "ALL" || u.role === userRoleFilter;
                return mS && mR;
            })
                .map((u) => (<tr key={u.id} className="hover:bg-slate-50/50">
                        <td className="p-4 flex items-center gap-2">
                          <img src={u.avatarUrl} alt="" className="w-7 h-7 rounded-full bg-slate-100 border object-cover"/>
                          <div>
                            <span className="font-extrabold text-slate-900 block">{u.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono block">{u.email}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase border ${u.role === "ADMIN" ? "bg-red-50 text-red-700 border-red-200" : u.role === "TEACHER" ? "bg-indigo-50 text-indigo-750 border-indigo-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4 font-bold">
                          {u.status === "ONLINE" ? (<span className="text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> En ligne</span>) : (<span className="text-slate-400">Offline</span>)}
                        </td>
                        <td className="p-4 font-mono">{u.joinedDate}</td>
                        <td className="p-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleResetPasswordAction(u)} className="p-1 border rounded hover:border-[#F4C542] text-slate-500 hover:text-slate-800 cursor-pointer" title="Mot de passe"><Key className="w-3.5 h-3.5"/></button>
                            <button onClick={() => handleStartEditUser(u)} className="p-1 border rounded hover:border-indigo-500 text-slate-500 hover:text-indigo-600 cursor-pointer" title="Éditer"><Pencil className="w-3.5 h-3.5"/></button>
                            {u.id !== currentUser?.id && (<button onClick={() => setDeletingUser(u)} className="p-1 border border-red-100 hover:border-red-300 rounded text-red-650 hover:bg-red-50 cursor-pointer"><Trash2 className="w-3.5 h-3.5"/></button>)}
                          </div>
                        </td>
                      </tr>))}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Add Modal */}
          {showAddUserModal && (<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 border space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-slate-805">Création de Compte Membre</span>
                  <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
                </div>
                {tempPasswordToDisplay && (<div className="p-2.5 bg-amber-50 text-amber-900 font-bold border rounded text-xs">{tempPasswordToDisplay}</div>)}
                <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-400 uppercase text-[9px] mb-1">Nom Complet</label>
                    <input type="text" required placeholder="Sophie Renard" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50"/>
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase text-[9px] mb-1">E-mail (@hightech.edu)</label>
                    <input type="email" required placeholder="sophie@hightech.edu" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50"/>
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase text-[9px] mb-1">Rôle</label>
                    <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50">
                      <option value="STUDENT">Étudiant</option>
                      <option value="TEACHER">Enseignant</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                  </div>
                  {newUserRole === "STUDENT" && (<div>
                      <label className="block text-slate-400 uppercase text-[9px] mb-1">Classe</label>
                      <select value={newUserClass} onChange={(e) => setNewUserClass(e.target.value)} className="w-full p-2 border rounded-lg bg-slate-50">
                        <option value="">Aucune</option>
                        {classes.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                      </select>
                    </div>)}
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowAddUserModal(false)} className="w-1/2 py-2 bg-slate-100 rounded text-slate-600">Fermer</button>
                    <button type="submit" className="w-1/2 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded">Ajouter</button>
                  </div>
                </form>
              </div>
            </div>)}

          {/* User Edit Modal */}
          {editingUser && (<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 border space-y-4 text-xs font-semibold">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold flex items-center gap-1.5"><Pencil className="w-4 h-4 text-indigo-500"/> Modifier Utilisateur</span>
                  <button onClick={() => setEditingUser(null)} className="text-slate-400 font-bold">×</button>
                </div>
                {editUserError && <div className="p-2 bg-red-50 text-red-800 rounded">{editUserError}</div>}
                <form onSubmit={handleSaveEditUser} className="space-y-4">
                  <div>
                    <label className="block text-slate-400 text-[9px] uppercase mb-1">Nom complet</label>
                    <input type="text" required value={editUserName} onChange={(e) => setEditUserName(e.target.value)} className="w-full p-2 border rounded"/>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[9px] uppercase mb-1">E-mail</label>
                    <input type="email" required value={editUserEmail} onChange={(e) => setEditUserEmail(e.target.value)} className="w-full p-2 border rounded"/>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[9px] uppercase mb-1">Rôle</label>
                    <select value={editUserRole} onChange={(e) => setEditUserRole(e.target.value)} className="w-full p-2 border rounded bg-white">
                      <option value="STUDENT">Étudiant</option>
                      <option value="TEACHER">Enseignant</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[9px] uppercase mb-1">Connexion</label>
                    <select value={editUserStatus} onChange={(e) => setEditUserStatus(e.target.value)} className="w-full p-2 border rounded bg-white">
                      <option value="ONLINE">En ligne</option>
                      <option value="OFFLINE">Hors-ligne</option>
                    </select>
                  </div>
                  {editUserRole === "STUDENT" && (<div>
                      <label className="block text-slate-400 text-[9px] uppercase mb-1">Promotion Affectée</label>
                      <select value={editUserClass} onChange={(e) => setEditUserClass(e.target.value)} className="w-full p-2 border rounded bg-white">
                        <option value="">Aucune</option>
                        {classes.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                      </select>
                    </div>)}
                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => setEditingUser(null)} className="w-1/2 py-2 bg-slate-100 rounded">Annuler</button>
                    <button type="submit" className="w-1/2 py-2 bg-slate-900 text-white rounded">Enregistrer</button>
                  </div>
                </form>
              </div>
            </div>)}

          {/* Delete Confirm */}
          {deletingUser && (<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl w-full max-w-sm p-6 border text-center space-y-4 text-xs font-semibold">
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto"/>
                <h3 className="font-bold text-sm">Suppression de Compte</h3>
                <p className="text-slate-500">Confirmez-vous la suppression du compte de <strong className="text-slate-900">{deletingUser.fullName}</strong> ?</p>
                <div className="flex gap-2">
                  <button onClick={() => setDeletingUser(null)} className="w-1/2 py-2 bg-slate-100 rounded">Conserver</button>
                  <button onClick={handleConfirmDeleteUser} className="w-1/2 py-2 bg-red-600 text-white rounded">Supprimer</button>
                </div>
              </div>
            </div>)}
        </div>)}

      {/* Classes tab */}
      {activeTab === "classes" && (<div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-950 pb-2 border-b">Créer une Promotion</h3>
              <form onSubmit={handleCreateClass} className="space-y-3 text-xs font-semibold">
                <div>
                  <label className="block text-[10px] uppercase text-slate-400 mb-1">Intitulé</label>
                  <input type="text" required placeholder="Génie Logiciel" value={newClassName} onChange={(e) => setNewClassName(e.target.value)} className="w-full p-2 border rounded bg-slate-50"/>
                </div>
                <button type="submit" className="w-full py-2 bg-slate-900 text-white font-bold rounded">Ajouter la promotion</button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl border md:col-span-2 space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-950 pb-2 border-b">Sélectionnez la Promotion d'étude</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                {mappedClasses.map((c) => (<button key={c.id} onClick={() => setSelectedClassId(c.id)} className={`p-3 text-left border rounded-xl flex items-center justify-between cursor-pointer ${selectedClassId === c.id ? "bg-amber-50/20 border-[#F4C542] font-bold text-slate-950" : "hover:border-slate-305 text-slate-650"}`}>
                    <span>{c.name}</span>
                    <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded-full">{c.studentIds.length} élèves</span>
                  </button>))}
              </div>
            </div>
          </div>

          {currentClassObj && (<div className="bg-white p-6 rounded-2xl border space-y-6 text-xs">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-805 uppercase tracking-widest text-[11px]">Pupitre de Transfert : <span className="text-[#F4C542]">{currentClassObj.name}</span></h3>
                  <p className="text-[9px] text-slate-400 mt-1 uppercase">Allocations affectées : {classStudentsList.length} bacheliers</p>
                </div>
                <input type="text" placeholder="Filtrer par nom..." value={studentSearchFilter} onChange={(e) => setStudentSearchFilter(e.target.value)} className="p-2 border rounded text-xs w-48 bg-slate-50 outline-none"/>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 font-semibold">
                <div className="space-y-3">
                  <div className="bg-slate-50 p-2.5 border rounded flex justify-between uppercase text-[10px] text-slate-700"><span>Disponibles à l'école</span><span>{availableStudentsList.length}</span></div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto p-1.5 border rounded bg-slate-50/50">
                    {availableStudentsList
                    .filter((s) => s.fullName.toLowerCase().includes(studentSearchFilter.toLowerCase()))
                    .map((student) => (<div key={student.id} className="p-2 bg-white rounded border flex justify-between items-center shadow-xs">
                          <span>{student.fullName}</span>
                          <button onClick={() => handleAssignStudent(student.id)} className="px-2 py-0.5 bg-slate-900 text-white rounded text-[10px]">Inscrire +</button>
                        </div>))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-indigo-50 border p-2.5 rounded flex justify-between uppercase text-[10px] text-indigo-905"><span>Inscrits à la promotion</span><span>{classStudentsList.length}</span></div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto p-1.5 border rounded bg-indigo-50/20">
                    {classStudentsList
                    .filter((s) => s.fullName.toLowerCase().includes(studentSearchFilter.toLowerCase()))
                    .map((student) => (<div key={student.id} className="p-2 bg-white rounded border flex justify-between items-center shadow-xs">
                          <span>{student.fullName}</span>
                          <button onClick={() => handleUnassignStudent(student.id)} className="px-2 py-0.5 border text-red-650 hover:bg-red-50 rounded text-[10px]">Retirer x</button>
                        </div>))}
                  </div>
                </div>
              </div>
            </div>)}
        </div>)}

      {/* Validation Queue Tab */}
      {activeTab === "validation" && (<div className="space-y-6 text-xs font-semibold">
          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b">
              <span className="text-xs font-black uppercase text-slate-750">Validation des Formulaires d'Examen</span>
            </div>

            {mappedExams.filter((e) => e.status === "PENDING_VALIDATION").length === 0 ? (<div className="p-12 text-center text-slate-400 space-y-2 select-none">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto"/>
                <p className="font-bold text-slate-800">Aucun sujet d'examen en attente d'arbitrage.</p>
                <p className="text-[11px] text-slate-400">Tout est arbitré et en conformité.</p>
              </div>) : (<div className="divide-y">
                {mappedExams
                    .filter((e) => e.status === "PENDING_VALIDATION")
                    .map((exam) => (<div key={exam.id} className="p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <span className="bg-slate-100 text-[9px] font-bold uppercase rounded-full px-2 py-0.5 tracking-wider">
                            {subjects.find((s) => s.id === exam.subjectId)?.name || "Matière"}
                          </span>
                          <h4 className="font-extrabold text-[#0f172b] text-base mt-1">{exam.title}</h4>
                          <p className="text-xs text-slate-500 mt-1 max-w-xl">{exam.description}</p>
                          <p className="text-[10px] text-slate-400 mt-2">Coefficient : {exam.coefficient} &bull; Durée : {exam.durationMinutes} minutes</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleApproveExam(exam.id)} className="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 text-white font-extrabold rounded-lg flex items-center gap-1 cursor-pointer"><CheckCircle className="w-4 h-4"/> Approuver</button>
                          <button onClick={() => setRejectId(exam.id)} className="px-3.5 py-1.5 bg-red-650 hover:bg-red-700 text-white font-extrabold rounded-lg flex items-center gap-1 cursor-pointer"><XCircle className="w-4 h-4"/> Rejeter</button>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border max-h-40 overflow-y-auto text-left space-y-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Relecture des {exam.questions.length} questions :</span>
                        {exam.questions.map((q, idx) => (<div key={q.id} className="text-[10px] text-slate-600"><strong>Item {idx + 1} ({q.type}) :</strong> {q.prompt}</div>))}
                      </div>

                      {rejectId === exam.id && (<form onSubmit={handleRejectExam} className="bg-red-50 p-4 border rounded-xl flex gap-3 items-center">
                          <input type="text" required placeholder="Motifs du rejet disciplinaire..." value={rejectionFeedback} onChange={(e) => setRejectionFeedback(e.target.value)} className="flex-1 p-2 border border-red-200 rounded text-xs bg-white outline-none"/>
                          <button type="submit" className="px-3 py-2 bg-slate-900 text-white rounded font-bold">Confirmer Rejet</button>
                        </form>)}
                    </div>))}
              </div>)}
          </div>
        </div>)}

      {/* Audit Logs Tab */}
      {activeTab === "audit" && (<div className="space-y-6 text-xs font-semibold">
          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <span className="text-[11px] font-black text-slate-750 uppercase">Supervision des Sessions SHA-256</span>
              <span className="text-emerald-500">{mappedUsers.filter((u) => u.status === "ONLINE").length} connectés</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-100/60 uppercase text-[9px] text-slate-400 font-extrabold">
                  <tr>
                    <th className="p-4">Utilisateur</th>
                    <th className="p-4">Heure Activité</th>
                    <th className="p-4">Adresse IP d'allocation</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-705">
                  {mappedUsers.map((u) => (<tr key={u.id} className="hover:bg-slate-50/30">
                      <td className="p-4 flex items-center gap-1.5 font-bold">{u.fullName}</td>
                      <td className="p-4 font-mono">{new Date(u.lastActivity).toLocaleTimeString()}</td>
                      <td className="p-4 font-mono text-slate-400">192.168.1.{Math.floor(Math.random() * 254) + 1}</td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="font-extrabold text-slate-800">Journal d'Audit d'État</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">Total évènements : {mappedAuditLogs.length}</p>
              </div>
              <div className="flex gap-2">
                <input type="text" placeholder="Filtrer par e-mail, action..." value={logSearchQuery} onChange={(e) => setLogSearchQuery(e.target.value)} className="p-2 border rounded text-xs bg-white outline-none w-52"/>
                <select value={logCategoryFilter} onChange={(e) => setLogCategoryFilter(e.target.value)} className="p-2 border rounded text-xs bg-white font-bold text-slate-700 select-none">
                  <option value="ALL">Toutes les catégories</option>
                  <option value="SECURITY">Sécurité & Anti-Triche</option>
                  <option value="AUTHENTICATION">Connexions & Accès</option>
                  <option value="EXAM_MANAGEMENT">Examens & Sujets</option>
                  <option value="USER_MANAGEMENT">Comptes Utilisateurs</option>
                </select>
              </div>
            </div>

            <div className="divide-y h-96 overflow-y-auto">
              {mappedAuditLogs
                .filter((log) => {
                const mC = logCategoryFilter === "ALL" || log.category === logCategoryFilter;
                const mS = !logSearchQuery.trim() || log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) || log.details.toLowerCase().includes(logSearchQuery.toLowerCase()) || log.userEmail.toLowerCase().includes(logSearchQuery.toLowerCase());
                return mC && mS;
            })
                .reverse()
                .map((log) => (<div key={log.id} className="p-4 flex justify-between items-center text-xs hover:bg-slate-50/50">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[9px] bg-slate-100 px-2 py-0.5 rounded border text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${log.category === "SECURITY" ? "bg-red-50 text-red-600 border-red-200" : "bg-slate-100 text-slate-655 border-slate-200"}`}>{log.category}</span>
                        <strong className="text-slate-900">{log.action}</strong>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-mono font-normal">{log.details}</p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{log.userEmail}</span>
                  </div>))}
            </div>
          </div>
        </div>)}

      {/* Services Communs Tab */}
      {activeTab === "communs" && (<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs font-semibold">
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border space-y-4">
              <div className="flex items-center gap-2 border-b pb-3 font-black uppercase tracking-wider">
                <Megaphone className="w-5 h-5 text-amber-500"/>
                <h3>Publier une Annonce Académique</h3>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!newAnnTitle.trim() || !newAnnMessage.trim())
                    return;
                onSyncAnnouncements([{
                        id: `ann_${Date.now()}`,
                        title: newAnnTitle,
                        message: newAnnMessage,
                        author: currentUser?.name || "Administration",
                        timestamp: new Date().toISOString(),
                        target: newAnnTarget,
                    }, ...mappedAnnouncements]);
                onAddNotification(`Nouvelle diffusion : ${newAnnTitle}`, "Une annonce officielle a été publiée.", "INFO");
                setNewAnnTitle("");
                setNewAnnMessage("");
            }} className="space-y-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-black uppercase mb-1">Titre de l'annonce</label>
                  <input type="text" placeholder="Session d'Examens..." value={newAnnTitle} onChange={(e) => setNewAnnTitle(e.target.value)} required className="w-full bg-slate-50 border p-2 text-slate-950 font-bold rounded"/>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-black uppercase mb-1">Cible</label>
                    <select value={newAnnTarget} onChange={(e) => setNewAnnTarget(e.target.value)} className="w-full bg-slate-50 border p-2 font-bold rounded">
                      <option value="ALL">Tous (ALL)</option>
                      {classes.map((cls) => (<option key={cls.id} value={cls.id}>{cls.name}</option>))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button type="submit" className="w-full bg-slate-950 text-[#F4C542] hover:bg-slate-900 border-none rounded py-2 font-black cursor-pointer flex justify-center gap-1.5"><Send className="w-4 h-4"/> Diffuser</button>
                    </div>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 font-black uppercase mb-1">Message</label>
                  <textarea rows={4} placeholder="Contenu destiné à l'affichage..." value={newAnnMessage} onChange={(e) => setNewAnnMessage(e.target.value)} required className="w-full bg-slate-50 border p-2 rounded resize-none"/>
                </div>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl border space-y-4">
              <h3 className="text-xs font-black uppercase pb-2 border-b">Annonces actives ({mappedAnnouncements.length})</h3>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {mappedAnnouncements.map((ann) => (<div key={ann.id} className="bg-slate-50/50 p-3.5 rounded-xl border flex gap-3 relative group">
                    <div className="w-7 h-7 bg-slate-900 rounded-full text-[#F4C542] flex items-center justify-center font-bold font-mono text-xs shrink-0 select-none uppercase">{ann.author.slice(0, 2)}</div>
                    <div>
                      <div className="flex justify-between w-full">
                        <strong className="text-slate-900">{ann.author}</strong>
                        <span className="text-[9px] text-slate-400 ml-4">{new Date(ann.timestamp).toLocaleDateString("fr-FR")}</span>
                      </div>
                      <h4 className="font-extrabold text-slate-805 mt-1">{ann.title}</h4>
                      <p className="text-slate-500 mt-0.5 leading-relaxed">{ann.message}</p>
                    </div>
                  </div>))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border space-y-4">
              <div className="flex items-center gap-2 border-b pb-3 font-black uppercase tracking-wider">
                <Bell className="w-5 h-5 text-amber-500"/>
                <h3>Simulateur de Notifications (Cloche)</h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => onAddNotification("🔴 Alerte Anti-Triche : Changement d'onglet", "Un élève a déclenché une alerte anti-triche : Détection de perte de focus.", "DANGER")} className="p-3 border rounded-xl select-none hover:bg-rose-50 border-red-200 text-left cursor-pointer flex flex-col justify-between h-20 text-[10px]">
                  <span>🚨</span>
                  <strong>Alerte triche</strong>
                </button>
                <button onClick={() => onAddNotification("🟢 Nouveau sujet d'algorithmique soumis", "Le professeur a soumis un examen final d'Algorithmique.", "VALIDATION")} className="p-3 border rounded-xl select-none hover:bg-emerald-50 border-emerald-200 text-left cursor-pointer flex flex-col justify-between h-20 text-[10px]">
                  <span>📝</span>
                  <strong>Sujet soumis</strong>
                </button>
                <button onClick={() => onAddNotification("🟡 Maintenance système programmée", "Maintenance système programmée à 23h05.", "INFO")} className="p-3 border rounded-xl select-none hover:bg-amber-50 border-amber-200 text-left cursor-pointer flex flex-col justify-between h-20 text-[10px]">
                  <span>📢</span>
                  <strong>Maintenance</strong>
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (!testNotifTitle.trim() || !testNotifMsg.trim())
                    return;
                onAddNotification(testNotifTitle, testNotifMsg, testNotifType, testNotifTarget);
                setTestNotifTitle("");
                setTestNotifMsg("");
            }} className="space-y-3 pt-4 border-t">
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" placeholder="Sujet d'alerte..." value={testNotifTitle} onChange={(e) => setTestNotifTitle(e.target.value)} required className="p-2 border rounded text-xs bg-slate-50"/>
                  <select value={testNotifType} onChange={(e) => setTestNotifType(e.target.value)} className="p-2 border rounded text-xs bg-slate-50 font-bold">
                    <option value="INFO">Générale (INFO)</option>
                    <option value="VALIDATION">Validation (VALIDATION)</option>
                    <option value="DANGER">Danger (DANGER)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select value={testNotifTarget} onChange={(e) => setTestNotifTarget(e.target.value)} className="p-2 border rounded text-xs bg-slate-50 font-bold">
                    <option value="ALL">Tout le monde (ALL)</option>
                    {users.map((u) => (<option key={u.id} value={u.id}>{u.name}</option>))}
                  </select>
                  <button type="submit" className="bg-[#F4C542] hover:bg-amber-400 text-slate-900 border-none rounded font-bold">Lancer direct</button>
                </div>
                <input type="text" placeholder="Message d'alerte..." value={testNotifMsg} onChange={(e) => setTestNotifMsg(e.target.value)} required className="w-full p-2 border rounded text-xs bg-slate-50"/>
              </form>
            </div>

            <div className="bg-white p-6 rounded-2xl border space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="font-extrabold uppercase">Dernières Alertes cloche ({notifications.length})</span>
                <button onClick={() => onSyncNotifications([])} className="text-red-500 font-extrabold uppercase bg-transparent hover:underline text-[9px]">Purger</button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {notifications.map((n) => (<div key={n.id} className={`p-2.5 rounded-lg border flex justify-between items-center text-[10px] ${n.type === "alert" ? "bg-red-50 text-red-900" : n.type === "success" ? "bg-emerald-50 text-emerald-900" : "bg-slate-50"}`}>
                    <div>
                      <strong className="block">{n.title}</strong>
                      <span className="text-slate-500">{n.content}</span>
                    </div>
                  </div>))}
              </div>
            </div>
          </div>
        </div>)}
    </div>);
}
