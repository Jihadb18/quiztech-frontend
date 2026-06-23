import React, { useState } from "react";
import { Users, BookOpen, Clock, ShieldCheck, Key, Trash2, CheckCircle, XCircle, Layers, Sliders,
   ArrowLeftRight, Pencil, AlertTriangle, Megaphone, Bell, Send, FileText, 
   Info,School ,Search, Plus, ArrowRight,Filter,Calendar,ArrowUpDown,UserCheck,X,Activity,ShieldAlert,SlidersHorizontal, Search as SearchInvisible , ChevronDown,} from "lucide-react";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, } from "recharts";

export default function AdminDashboard({ currentUser, users, classes, subjects, exams, auditLogs, announcements = [], notifications = [], onSyncAnnouncements: parentSyncAnnouncements, onSyncNotifications: parentSyncNotifications, }) {
    const [activeTab, setActiveTab] = useState("stats");
const questions = [];
    try {
        const localQ = localStorage.getItem("qt_questions");
        if (localQ) {
            questions.push(...JSON.parse(localQ));
        }
    }
    catch { }
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
    const [userSearch, setUserSearch] = useState("");
    const [userRoleFilter, setUserRoleFilter] = useState("ALL");
    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const [newUserName, setNewUserName] = useState("");
    const [newUserEmail, setNewUserEmail] = useState("");
    const [newUserRole, setNewUserRole] = useState("STUDENT");
    const [newUserClass, setNewUserClass] = useState("");
    const [tempPasswordToDisplay, setTempPasswordToDisplay] = useState("");
    const [editingUser, setEditingUser] = useState(null);
    const [editUserName, setEditUserName] = useState("");
    const [editUserEmail, setEditUserEmail] = useState("");
    const [editUserRole, setEditUserRole] = useState("STUDENT");
    const [editUserStatus, setEditUserStatus] = useState("OFFLINE");
    const [editUserClass, setEditUserClass] = useState("");
    const [editUserError, setEditUserError] = useState("");
    const [deletingUser, setDeletingUser] = useState(null);
    const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || "");
    const [newClassName, setNewClassName] = useState("");
    const [studentSearchFilter, setStudentSearchFilter] = useState("");
    const [newSubName, setNewSubName] = useState("");
    const [newSubCode, setNewSubCode] = useState("");
    const [rejectId, setRejectId] = useState(null);
    const [rejectionFeedback, setRejectionFeedback] = useState("");
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

    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
    const [innerFilterSearch, setInnerFilterSearch] = useState("");

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
        Étudiants: c.studentIds.length,
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

    const getIcon = (type) => {
  switch (type) {
    case "alert":
      return <AlertTriangle size={14} className="text-red-500" />;
    case "success":
      return <CheckCircle size={14} className="text-emerald-500" />;
    default:
      return <Info size={14} className="text-slate-500" />;
  }
};

    return (<div id="admin-dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans text-left">
 
      {/* Tabs */}
      <div className="bg-white p-1 rounded-xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-1">
        {[
            { id: "stats", label: "Statistiques Globales", icon: <Sliders className="w-4 h-4 mr-1.5 inline"/> },
            { id: "users", label: "Utilisateurs & Accès", icon: <Users className="w-4 h-4 mr-1.5 inline"/> },
            { id: "text-classes", label: "Classes & Transferts", tab: "classes", icon: <ArrowLeftRight className="w-4 h-4 mr-1.5 inline"/> },
            { id: "audit", label: "Audit & Logs", icon: <Clock className="w-4 h-4 mr-1.5 inline"/> },
        ].map((t) => (<button key={t.id} onClick={() => setActiveTab(t.tab || t.id)} className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === (t.tab || t.id) ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"}`}>
            {t.icon}
            {t.label}
          </button>))}
      </div>

{/* Stats */}
{activeTab === "stats" && (
  <div className="space-y-8 select-none animate-fade-in">
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 flex items-center justify-between shadow-[0_2px_8px_-3px_rgba(0,0,0,0.02)]">
        <div>
          <span className="text-2xl font-black text-slate-900">{(typeof totalStudents !== 'undefined' ? totalStudents : 0)} étudiants</span>
        </div>
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
          <Users className="w-6 h-6 text-[#F4C542]"/>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 flex items-center justify-between shadow-[0_2px_8px_-3px_rgba(0,0,0,0.02)]">
        <div>
          <span className="text-2xl font-black text-slate-900">{(typeof totalTeachers !== 'undefined' ? totalTeachers : 0)} professeurs</span>
        </div>
        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
          <BookOpen className="w-6 h-6 text-indigo-500"/>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 flex items-center justify-between shadow-[0_2px_8px_-3px_rgba(0,0,0,0.02)]">
        <div>
          <span className="text-2xl font-black text-slate-900">{(typeof totalExams !== 'undefined' ? totalExams : 0)} examens</span>
        </div>
        <div className="p-3 bg-red-50 rounded-xl border border-red-100">
          <Layers className="w-6 h-6 text-red-500"/>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 flex items-center justify-between shadow-[0_2px_8px_-3px_rgba(0,0,0,0.02)]">
        <div>
          <span className="text-2xl font-black text-slate-900">{(classes ? classes.length : 0)} classes</span>
        </div>
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
          <Sliders className="w-6 h-6 text-emerald-500"/>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 flex flex-col justify-between h-[420px] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.02)]">
        <h3 className="text-xs font-black text-slate-950 uppercase tracking-widest mb-4 flex items-center gap-2">
          <span className="w-1.5 h-3 bg-slate-900 rounded-sm"></span>
          Répartition des étudiants par classe
        </h3>
        <div className="flex-1 text-xs font-semibold">
          {typeof classesStatsData !== 'undefined' && classesStatsData && classesStatsData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classesStatsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8"/>
                <Tooltip />
                <Bar dataKey="Étudiants" fill="#0F172A" radius={[4, 4, 0, 0]}>
                  {classesStatsData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#0F172A" : "#F4C542"}/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">Aucune donnée disponible</div>
          )}
        </div>
      </div>

      <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.03)] flex flex-col justify-between h-[420px] relative">
        
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center border border-amber-100">
            <Megaphone size={14} className="text-[#F4C542]" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Publier une Annonce
          </h3>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          if (!newAnnTitle || !newAnnTitle.trim() || !newAnnMessage || !newAnnMessage.trim()) return;

          if (typeof onSyncAnnouncements === 'function') {
            onSyncAnnouncements([
              {
                id: `ann_${Date.now()}`,
                title: newAnnTitle,
                message: newAnnMessage,
                author: (typeof currentUser !== 'undefined' && currentUser?.name) || "Yassmine Chraibi",
                timestamp: new Date().toISOString(),
                target: typeof newAnnTarget !== 'undefined' ? newAnnTarget : "ALL",
              },
              ...(typeof mappedAnnouncements !== 'undefined' ? mappedAnnouncements : [])
            ]);
          }

          if (typeof onAddNotification === 'function') {
            onAddNotification(
              `Annonce: ${newAnnTitle}`,
              "Une nouvelle directive académique a été diffusée par l'administration.",
              "INFO"
            );
          }

          if (typeof setNewAnnTitle === 'function') setNewAnnTitle("");
          if (typeof setNewAnnMessage === 'function') setNewAnnMessage("");
        }} className="flex-1 flex flex-col justify-between mt-4 space-y-3">
          
          <div className="space-y-1">
            <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
              Titre de l'annonce
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder="Ex: Session d'Examens..."
                value={typeof newAnnTitle !== 'undefined' ? newAnnTitle : ""}
                onChange={(e) => typeof setNewAnnTitle === 'function' && setNewAnnTitle(e.target.value)}
                required
                className="w-full bg-slate-50/60 border border-slate-200/60 pl-9 pr-3 py-2 rounded-xl text-slate-800 font-bold text-xs outline-none transition-all duration-200 focus:bg-white focus:border-slate-900 placeholder:text-slate-400/80"
              />
            </div>
          </div>

          <div className="space-y-1 relative">
            <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
              Cible des étudiants
            </label>
            
            <select
              value={typeof newAnnTarget !== 'undefined' ? newAnnTarget : "ALL"}
              onChange={(e) => typeof setNewAnnTarget === 'function' && setNewAnnTarget(e.target.value)}
              className="w-full bg-slate-50/60 border border-slate-200/60 px-3 py-2 rounded-xl font-bold text-xs text-slate-700 outline-none transition-all focus:bg-white focus:border-slate-900 cursor-pointer appearance-none"
            >
              <option value="ALL">Tous les étudiants (ALL)</option>
              {classes && classes.map((cls) => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 flex flex-col space-y-1">
<label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
              Message / Description
            </label>
              
            <div className="relative flex-1 flex">
              <textarea
                placeholder="Contenu destiné à l'affichage..."
                value={typeof newAnnMessage !== 'undefined' ? newAnnMessage : ""}
                onChange={(e) => typeof setNewAnnMessage === 'function' && setNewAnnMessage(e.target.value)}
                required
                className="w-full flex-1 bg-slate-50/60 border border-slate-200/60 pl-9 pr-3 py-2 rounded-xl text-slate-800 font-medium text-xs outline-none transition-all duration-200 resize-none focus:bg-white focus:border-slate-900 placeholder:text-slate-400/80 leading-relaxed"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-950 text-[#F4C542] rounded-xl py-2.5 font-black text-xs flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg hover:shadow-slate-900/10 active:scale-[0.99]"
          >
            <Send size={12} className="stroke-[2.5]" />
            Diffuser l'annonce officielle
          </button>
        </form>

      </div>

    </div>
  </div>
)}
   
{/* utilisateurs */}
{activeTab === "users" && (
  <div className="space-y-6">
  
<div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex flex-col lg:flex-row lg:items-center justify-between gap-4">
  
  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
    
    <div className="relative flex-1 sm:flex-initial">
      <input
        type="text"
        placeholder="Rechercher nom, e-mail..."
        value={userSearch}
        onChange={(e) => setUserSearch(e.target.value)}
        className="pl-10 pr-4 py-2 w-full sm:w-64 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50/50 text-slate-800 outline-none focus:ring-4 focus:ring-[#FBD057]/15 focus:border-[#FBD057] focus:bg-white transition-all placeholder:text-slate-400 shadow-2xs"
      />
      
     
    </div>

    <div className="relative flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/80 border border-slate-200/40 rounded-xl">
      
      <button
        type="button"
        onClick={() => setUserRoleFilter("ALL")}
        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${
          userRoleFilter === "ALL"
            ? "bg-white text-slate-900 shadow-sm"
            : "text-slate-500 hover:text-slate-800"
        }`}
      >
        Tous
      </button>

      <button
        type="button"
        onClick={() => setUserRoleFilter("STUDENT")}
        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
          userRoleFilter === "STUDENT"
            ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/20"
            : "text-slate-500 hover:bg-white/50 hover:text-emerald-600"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${userRoleFilter === "STUDENT" ? "bg-white" : "bg-emerald-500"}`} />
        Étudiants
      </button>

      <button
        type="button"
        onClick={() => setUserRoleFilter("TEACHER")}
        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
          userRoleFilter === "TEACHER"
            ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
            : "text-slate-500 hover:bg-white/50 hover:text-indigo-600"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${userRoleFilter === "TEACHER" ? "bg-white" : "bg-indigo-500"}`} />
        Enseignants
      </button>

      <button
        type="button"
        onClick={() => setUserRoleFilter("ADMIN")}
        className={`px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
          userRoleFilter === "ADMIN"
            ? "bg-red-500 text-white shadow-sm shadow-red-500/20"
            : "text-slate-500 hover:bg-white/50 hover:text-red-600"
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${userRoleFilter === "ADMIN" ? "bg-white" : "bg-red-500"}`} />
        Admins
      </button>
    </div>
  </div>

  <button
    onClick={() => {
      setShowAddUserModal(true);
      setTempPasswordToDisplay("");
    }}
    className="relative overflow-hidden flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-[#FBD057] font-extrabold hover:bg-slate-800 active:scale-98 transition-all duration-200 shadow-md hover:shadow-lg w-full lg:w-auto text-xs tracking-wide"
  >
    <Plus className="w-4 h-4 text-[#FBD057]" />
    <span>Nouvel utilisateur</span>
  </button>

</div>

<div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden transition-all duration-300 hover:shadow-md">
  <div className="overflow-x-auto">
    <table className="w-full text-left text-xs min-w-[800px] border-collapse">
      
      <thead>
        <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-black uppercase tracking-wider text-slate-400 select-none">
          <th className="p-4 pl-6 w-[35%]">Utilisateur</th>
          <th className="p-4 w-[20%]">Rôle Académique</th>
          <th className="p-4 w-[25%]">Contrôle d'Accès</th>
          <th className="p-4 w-[12%]">Inscription</th>
          <th className="p-4 pr-6 text-right w-[8%]">Actions</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-50">
        {mappedUsers
          .filter((u) => {
            const mS =
              u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
              u.email.toLowerCase().includes(userSearch.toLowerCase());
            const mR = userRoleFilter === "ALL" || u.role === userRoleFilter;
            return mS && mR;
          })
          .map((u) => {
            const initials = u.fullName ? u.fullName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "U";

            return (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors duration-150 group">
                
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-3">
                    {u.avatarUrl ? (
                      <img
                        src={u.avatarUrl}
                        alt={u.fullName}
                        className="w-9 h-9 rounded-xl border border-slate-100 object-cover shadow-2xs group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-[11px] font-black tracking-wider shadow-2xs group-hover:scale-105 transition-transform
                        ${u.role === 'ADMIN' ? 'bg-red-50 text-red-600 border-red-100' : 
                          u.role === 'TEACHER' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 
                          'bg-emerald-50 text-emerald-600 border-emerald-100'}`}
                      >
                        {initials}
                      </div>
                    )}
                    <div className="leading-tight">
                      <span className="font-extrabold text-slate-800 block text-xs tracking-tight group-hover:text-slate-900 transition-colors">
                        {u.fullName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        {u.email}
                      </span>
                    </div>
                  </div>
                </td>

                <td className="p-4">
                  <span
                    className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider inline-flex items-center gap-1.5
                    ${
                      u.role === "ADMIN"
                        ? "bg-red-50/60 text-red-600 border-red-100/70"
                        : u.role === "TEACHER"
                        ? "bg-indigo-50/60 text-indigo-600 border-indigo-100/70"
                        : "bg-emerald-50/60 text-emerald-600 border-emerald-100/70"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      u.role === "ADMIN" ? "bg-red-500" : u.role === "TEACHER" ? "bg-indigo-500" : "bg-emerald-500"
                    }`} />
                    {u.role === "ADMIN" && "Admin"}
                    {u.role === "TEACHER" && "Enseignant"}
                    {u.role === "STUDENT" && "Étudiant"}
                  </span>
                </td>

<td className="p-4 align-middle">
  <div className="flex items-center gap-3 select-none">
    <label className="relative inline-flex items-center cursor-pointer group">
      <input
        type="checkbox"
        checked={u.isActive ?? true} 
        onChange={() => {
          if (typeof handleToggleUserAccess === "function") {
            handleToggleUserAccess(u);
          }
        }}
        className="sr-only peer"
      />
      <div className="w-9 h-5 bg-slate-200 rounded-full transition-all duration-300 ease-out
        peer-checked:bg-emerald-500 
        peer-focus:ring-4 peer-focus:ring-emerald-500/10 
        group-hover:bg-slate-300/90 peer-checked:group-hover:bg-emerald-600/90
        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
        after:bg-white after:rounded-full after:h-4 after:w-4 
        after:transition-all duration-300 ease-out after:shadow-[0_1px_3px_rgba(0,0,0,0.15)]
        peer-checked:after:translate-x-4">
      </div>
    </label>
    
    <span className={`font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md transition-all duration-300 ${
      u.isActive ?? true 
        ? "text-emerald-600 bg-emerald-50 border border-emerald-100/50" 
        : "text-red-500 bg-red-50 border border-red-100/40"
    }`}>
      {u.isActive ?? true ? "Autorisé" : "Bloqué"}
    </span>
  </div>
</td>
                <td className="p-4 font-mono text-slate-500 text-[10px]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-300" />
                    <span>{u.joinedDate || "N/A"}</span>
                  </div>
                </td>

                <td className="p-4 pr-6">
                  <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleStartEditUser(u)}
                      className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50 active:scale-95 transition-all"
                      title="Modifier l'utilisateur"
                    >
                      <Pencil className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>

                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => setDeletingUser(u)}
                        className="p-1.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50/50 active:scale-95 transition-all"
                        title="Supprimer l'utilisateur"
                      >
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  </div>
</div>

    {showAddUserModal && (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 border border-slate-100 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <span className="font-bold text-slate-800 text-sm">Création de Compte Membre</span>
          </div>
          
          {tempPasswordToDisplay && (
            <div className="p-2.5 bg-amber-50 text-amber-900 font-bold border border-amber-200 rounded-xl text-xs font-mono">
              Mot de passe généré : {tempPasswordToDisplay}
            </div>
          )}
          
          <form onSubmit={handleCreateUser} className="space-y-4 text-xs font-semibold">
            <div>
              <label className="block text-slate-400 uppercase text-[9px] mb-1 tracking-wider">Nom Complet</label>
              <input type="text" required placeholder="Sophie Renard" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-[#FBD057] transition"/>
            </div>
            <div>
              <label className="block text-slate-400 uppercase text-[9px] mb-1 tracking-wider">E-mail Établissement (@hightech.edu)</label>
              <input type="email" required placeholder="sophie@hightech.edu" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none focus:border-[#FBD057] transition"/>
            </div>
            <div>
              <label className="block text-slate-400 uppercase text-[9px] mb-1 tracking-wider">Rôle Académique</label>
              <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none cursor-pointer">
                <option value="STUDENT">Étudiant</option>
                <option value="TEACHER">Enseignant</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>
            {newUserRole === "STUDENT" && (
              <div>
                <label className="block text-slate-400 uppercase text-[9px] mb-1 tracking-wider">Classe Affectée</label>
                <select value={newUserClass} onChange={(e) => setNewUserClass(e.target.value)} className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 outline-none cursor-pointer">
                  <option value="">Aucune</option>
                  {classes.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
            )}
            <div className="flex gap-2 pt-2 text-xs font-bold">
              <button type="button" onClick={() => setShowAddUserModal(false)} className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition">Fermer</button>
              <button type="submit" className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition">Ajouter le Membre</button>
            </div>
          </form>
        </div>
      </div>
    )}

{editingUser && (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-fade-in">
    <div className="bg-white rounded-2xl w-full max-w-md shadow-[0_20px_50px_-12px_rgba(15,23,42,0.15)] p-6 border border-slate-100 space-y-5 text-xs font-semibold">
      
      <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
        <span className="font-black flex items-center gap-2 text-slate-900 text-sm tracking-tight">
          <div className="w-6 h-6 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
            <Pencil className="w-3.5 h-3.5 text-slate-900"/>
          </div>
          Modifier l'Utilisateur
        </span>
        <button 
          onClick={() => setEditingUser(null)} 
          className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors font-medium text-base"
        >
          ×
        </button>
      </div>
      
      {editUserError && (
        <div className="p-3 bg-red-50 text-red-800 rounded-xl border border-red-100 font-bold flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>
          {editUserError}
        </div>
      )}
      
      <form onSubmit={handleSaveEditUser} className="space-y-4">
        
        <div className="space-y-1">
          <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Nom complet</label>
          <input 
            type="text" 
            required 
            value={editUserName} 
            onChange={(e) => setEditUserName(e.target.value)} 
            className="w-full bg-slate-50/60 border border-slate-200/60 p-2.5 rounded-xl text-slate-800 font-bold outline-none transition-all duration-200 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Adresse E-mail</label>
          <input 
            type="email" 
            required 
            value={editUserEmail} 
            onChange={(e) => setEditUserEmail(e.target.value)} 
            className="w-full bg-slate-50/60 border border-slate-200/60 p-2.5 rounded-xl text-slate-800 font-bold outline-none transition-all duration-200 focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Rôle</label>
          <select 
            value={editUserRole} 
            onChange={(e) => setEditUserRole(e.target.value)} 
            className="w-full bg-slate-50/60 border border-slate-200/60 p-2.5 rounded-xl text-slate-700 font-bold outline-none cursor-pointer focus:bg-white focus:border-slate-900 appearance-none"
            style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '14px' }}
          >
            <option value="STUDENT">Étudiant</option>
            <option value="TEACHER">Enseignant</option>
            <option value="ADMIN">Administrateur</option>
          </select>
        </div>

        {editUserRole === "STUDENT" && classes && (
          <div className="space-y-1 animate-fade-in">
            <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">Classe Affectée</label>
            <select 
              value={editUserClass} 
              onChange={(e) => setEditUserClass(e.target.value)} 
              className="w-full bg-slate-50/60 border border-slate-200/60 p-2.5 rounded-xl text-slate-700 font-bold outline-none cursor-pointer focus:bg-white focus:border-slate-900 appearance-none"
              style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '14px' }}
            >
              <option value="">Aucune</option>
              {classes.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
        )}
        
        <div className="flex gap-3 pt-3 text-xs font-black">
          <button 
            type="button" 
            onClick={() => setEditingUser(null)} 
            className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all active:scale-[0.98]"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-950 text-[#F4C542] rounded-xl transition-all hover:shadow-lg hover:shadow-slate-900/10 active:scale-[0.98]"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{deletingUser && (
  <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none animate-fade-in">
    <div className="bg-white rounded-2xl w-full max-w-sm shadow-[0_20px_50px_-12px_rgba(239,68,68,0.12)] p-6 border border-slate-100 text-center space-y-4 text-xs font-semibold transform transition-all duration-300 scale-100">
      
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto border border-red-100 text-red-500 shadow-sm">
        <AlertTriangle className="w-5 h-5" />
      </div>
      
      <div className="space-y-1.5">
        <h3 className="font-black text-slate-900 text-base tracking-tight">
          Suppression Définitive
        </h3>
        <p className="text-slate-400 font-medium leading-relaxed px-2">
          Êtes-vous sûr de vouloir supprimer définitivement le compte de{" "}
          <strong className="text-slate-900 font-extrabold block mt-1 bg-slate-50 py-1 px-2 rounded-lg border border-slate-100 inline-block">
            {deletingUser.name || deletingUser.fullName || "Cet utilisateur"}
          </strong> ? 
          
        </p>
      </div>
      
      <div className="flex gap-3 pt-2 text-xs font-black">
        <button 
          type="button"
          onClick={() => setDeletingUser(null)} 
          className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all active:scale-[0.98]"
        >
          Conserver
        </button>
        
        <button 
          type="button"
          onClick={handleConfirmDeleteUser} 
          className="w-1/2 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all hover:shadow-lg hover:shadow-red-600/20 active:scale-[0.98]"
        >
          Supprimer
        </button>
      </div>
      
    </div>
  </div>
)}
  </div>
)}
{/* classes */}
{activeTab === "classes" && (
  <div className="space-y-6 text-xs font-medium animate-fadeIn">

    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] flex flex-col lg:flex-row items-center gap-6">
      
      <form onSubmit={handleCreateClass} className="flex items-center gap-2 w-full lg:w-auto border-r border-slate-100 pr-6 shrink-0">
        <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
          <Plus className="w-4 h-4 stroke-[3]" />
        </div>
        <input
          type="text"
          required
          placeholder="Nouvelle promotion..."
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
          className="px-3 py-2 w-48 rounded-xl border border-slate-200/70 bg-slate-50/50 text-slate-800 font-semibold outline-none focus:bg-white focus:border-[#FBD057] focus:ring-4 focus:ring-[#FBD057]/10 transition-all placeholder:text-slate-300 text-xs"
        />
        <button
          type="submit"
          className="px-3 py-2 rounded-xl bg-slate-900 text-[#FBD057] font-black hover:bg-slate-800 transition-colors"
        >
          Créer
        </button>
      </form>

      <div className="flex items-center gap-2 overflow-x-auto w-full py-1 no-scrollbar whitespace-nowrap">
        {mappedClasses?.map((c) => {
          const isSelected = selectedClassId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedClassId(c.id)}
              className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center gap-2 shrink-0
                ${isSelected
                  ? "bg-slate-900 text-[#FBD057] border-slate-900 shadow-sm font-black scale-102"
                  : "bg-white text-slate-600 border-slate-100 hover:border-slate-300 hover:bg-slate-50/60"
                }`}
            >
              <School className={`w-3.5 h-3.5 ${isSelected ? "text-[#FBD057]" : "text-slate-400"}`} />
              <span>{c.name}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-mono ${isSelected ? "bg-slate-800 text-amber-300" : "bg-slate-100 text-slate-400"}`}>
                {c.studentIds?.length || 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>

    {currentClassObj && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/40 p-2 rounded-3xl border border-slate-100">
        
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col h-[420px]">
          <div className="flex justify-between items-center pb-3 border-b border-slate-50 select-none shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Réservoir Étudiants</span>
            </div>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] font-black border border-slate-200/30">
              {availableStudentsList?.filter(s => s.role === "STUDENT").length || 0} Restants
            </span>
          </div>

          <div className="relative my-3 shrink-0">
            <input
              type="text"
              placeholder="Filtrer le réservoir..."
              value={studentSearchFilter}
              onChange={(e) => setStudentSearchFilter(e.target.value)}
              className="w-full pl-8.5 pr-4 py-2 border border-slate-100 rounded-xl bg-slate-50/50 outline-none focus:bg-white focus:border-slate-300 text-xs transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
            {availableStudentsList
              ?.filter((s) => s.role === "STUDENT" && s.fullName.toLowerCase().includes(studentSearchFilter.toLowerCase()))
              .map((student) => {
                const initials = student.fullName?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "U";
                return (
                  <div
                    key={student.id}
                    className="p-2.5 bg-white border border-slate-100 rounded-xl flex justify-between items-center hover:border-slate-300 hover:shadow-2xs transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-center font-black text-[10px] text-slate-500">
                        {initials}
                      </div>
                      <div className="leading-tight">
                        <span className="font-bold text-slate-700 block tracking-tight">{student.fullName}</span>
                        <span className="text-[9px] text-slate-400 font-mono block">{student.email}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAssignStudent(student.id)}
                      className="p-1.5 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-900 hover:text-[#FBD057] active:scale-90 transition-all shadow-2xs"
                      title="Inscrire à la classe"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </div>
                );
              })}

            {availableStudentsList?.filter(s => s.role === "STUDENT" && s.fullName.toLowerCase().includes(studentSearchFilter.toLowerCase())).length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-300 font-medium">
                <UserCheck className="w-8 h-8 text-slate-200 mb-2 stroke-[1.5]" />
                <span className="text-[11px]">Aucun étudiant à inscrire</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-row lg:flex-col items-center justify-center p-4 lg:p-0 select-none bg-white lg:bg-transparent rounded-2xl border border-slate-100 lg:border-none shadow-2xs lg:shadow-none">
          <div className="flex flex-col items-center text-center px-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 hidden lg:block mb-2">Affectation</span>
            <div className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 shadow-2xs lg:scale-110 animate-pulse">
              <ArrowLeftRight className="w-4 h-4 text-slate-500 hidden lg:block stroke-[2]" />
              <ArrowUpDown className="w-4 h-4 text-slate-500 lg:hidden stroke-[2]" />
            </div>
            <span className="text-[8px] font-extrabold text-slate-700 mt-2 block bg-[#FBD057] text-slate-900 px-2 py-0.5 rounded-md shadow-3xs max-w-[210px] truncate">
              {currentClassObj.name}
            </span>
          </div>
        </div>

        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex flex-col h-[420px]">
          <div className="flex justify-between items-center pb-3 border-b border-slate-50 select-none shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Inscrits Officiels</span>
            </div>
            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md text-[10px] font-black border border-emerald-100">
              {classStudentsList?.length || 0} Étudiants
            </span>
          </div>

          <div className="my-3 px-3 py-2 bg-emerald-50/40 rounded-xl border border-emerald-100/50 text-emerald-800 text-[10px] font-bold flex items-center gap-2 shrink-0">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span>Ces étudiants ont accès aux examens de cette promotion.</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
            {classStudentsList
              ?.filter((s) => s.fullName.toLowerCase().includes(studentSearchFilter.toLowerCase()))
              .map((student) => {
                const initials = student.fullName?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "U";
                return (
                  <div
                    key={student.id}
                    className="p-2.5 bg-slate-50/30 border border-slate-100 rounded-xl flex justify-between items-center hover:border-red-200 hover:bg-white transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100/60 flex items-center justify-center font-black text-[10px] text-emerald-600">
                        {initials}
                      </div>
                      <div className="leading-tight">
                        <span className="font-bold text-slate-800 block tracking-tight">{student.fullName}</span>
                        <span className="text-[9px] text-slate-400 font-mono block">{student.email}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleUnassignStudent(student.id)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 active:scale-90 transition-all shadow-3xs"
                      title="Désaffecter"
                    >
                      <X className="w-3.5 h-3.5 stroke-[2.5]" />
                    </button>
                  </div>
                );
              })}

            {classStudentsList?.filter((s) => s.fullName.toLowerCase().includes(studentSearchFilter.toLowerCase())).length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-300 font-medium border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <Users className="w-8 h-8 text-slate-200 mb-2 stroke-[1.5]" />
                <span className="text-[11px]">Aucun inscrit pour le moment</span>
              </div>
            )}
          </div>
        </div>

      </div>
    )}

  </div>
)}
  {/* audit */}
   {activeTab === "audit" && (
  <div className="space-y-6 text-xs font-semibold animate-fadeIn">

    <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_14px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
      
      <div className="px-6 py-4 bg-slate-50/60 border-b border-slate-100 flex justify-between items-center select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-900 rounded-lg text-[#FBD057]">
            <Activity className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] font-black text-slate-800 uppercase tracking-wider">
            Supervision des Sessions SHA-256
          </span>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100/60">
          
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/30 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-widest select-none">
              <th className="p-4 pl-6">Utilisateur</th>
              <th className="p-4">Dernière Activité</th>
              <th className="p-4 pr-6">Adresse IP & Allocation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-slate-700">
            {mappedUsers.map((u, idx) => {
              const initials = u.fullName?.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "U";
              const ipSuffix = (u.id ? (String(u.id).charCodeAt(0) % 250) + 1 : (idx % 250) + 1);
              const isOnline = u.status === "ONLINE";

              return (
                <tr key={u.id || idx} className="hover:bg-slate-50/40 transition-colors group">
                  
                  <td className="p-4 pl-6 flex items-center gap-3">
                    <div className="relative shrink-0">
                      <div className={`w-8 h-8 rounded-xl font-black text-[10px] flex items-center justify-center border
                        ${isOnline 
                          ? "bg-slate-900 text-[#FBD057] border-slate-900" 
                          : "bg-slate-50 text-slate-400 border-slate-200/60"
                        }`}
                      >
                        {initials}
                      </div>
                      {isOnline && (
                        <span className="w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full absolute -bottom-0.5 -right-0.5 shadow-3xs" />
                      )}
                    </div>
                    <div className="leading-tight">
                      <span className="font-bold text-slate-800 block group-hover:text-slate-900 transition-colors">{u.fullName}</span>
                      <span className="text-[9px] font-mono text-slate-400 block lowercase">{u.role || 'Membre'}</span>
                    </div>
                  </td>

                  <td className="p-4 font-mono text-xs text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400 transition-colors" />
                      {u.lastActivity ? new Date(u.lastActivity).toLocaleTimeString() : "N/A"}
                    </span>
                  </td>

                  <td className="p-4 pr-6 font-mono text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/50 text-slate-600 font-medium tracking-wide">
                        192.168.1.{ipSuffix}
                      </span>
                      <span className="text-[9px] font-sans text-slate-300 font-bold uppercase tracking-wider hidden sm:inline">
                        AES-Encrypted
                      </span>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

<div className="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_14px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
  
  <div className="px-6 py-5 bg-slate-50/60 border-b border-slate-100 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
    <div>
      <h3 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-slate-800" />
        Journal d'Audit d'État
      </h3>
      
    </div>

    <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full xl:w-auto">
      
      <div className="relative w-full sm:w-64 group">
        <div className="absolute -inset-0.5  rounded-xl opacity-0 transition duration-300 pointer-events-none" />
        
        <div className="relative flex items-center bg-white  group-focus-within:bg-white rounded-xl  group-focus-within:border-slate-950 transition-all duration-200 overflow-hidden  w-full">
        
          
          <input 
            type="text" 
            placeholder="Rechercher par e-mail, action..." 
            value={logSearchQuery || ""} 
            onChange={(e) => setLogSearchQuery(e.target.value)} 
            className="w-full pl-2.5 pr-10 py-2.5 text-xs font-bold bg-transparent text-slate-800 outline-none placeholder:text-slate-400/80 tracking-tight"
          />

         
        </div>
      </div>

      <div className="relative w-full sm:w-auto shrink-0">
        
        <button
          type="button"
          onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
          className={`w-full sm:w-auto pl-9 pr-4 py-2.5 text-xs font-bold rounded-xl border flex items-center justify-between
             gap-2.5 transition-all duration-200 select-none  relative
            ${isFilterDropdownOpen 
              ? "bg-white border-slate-900 text-slate-900 ring-4 ring-slate-900/5" 
              : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
            }`}
        >
          <SlidersHorizontal className={`w-3.5 h-3.5 absolute left-3 top-3.5 text-slate-400 transition-transform duration-300 ${isFilterDropdownOpen ? "rotate-90 text-slate-900" : ""}`} />
          
          <span className="truncate pr-2">
            {logCategoryFilter === "ALL" && "Toutes les catégories"}
            {logCategoryFilter === "SECURITY" && "Sécurité & Anti-Triche"}
            {logCategoryFilter === "AUTHENTICATION" && "Connexions & Accès"}
            {logCategoryFilter === "EXAM_MANAGEMENT" && "Examens & Sujets"}
            {logCategoryFilter === "USER_MANAGEMENT" && "Comptes Utilisateurs"}
          </span>

          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isFilterDropdownOpen ? "rotate-180 text-slate-900" : ""}`} />
        </button>

        {isFilterDropdownOpen && (
          <div 
            className="fixed inset-0 z-40 cursor-default" 
            onClick={() => { setIsFilterDropdownOpen(false); setInnerFilterSearch(""); }} 
          />
        )}

{isFilterDropdownOpen && (
  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 text-slate-700 rounded-2xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08)] z-50 overflow-hidden font-bold text-xs">
    
    <div className="p-2.5 border-b border-slate-100 relative flex items-center bg-slate-50/50">
      <input
        type="text"
        placeholder="Rechercher une catégorie..."
        value={innerFilterSearch || ""}
        onChange={(e) => setInnerFilterSearch(e.target.value)}
        className="w-full bg-white border border-slate-200/80 rounded-xl pl-8 pr-3 py-2 text-[11px] text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:bg-white transition-all font-semibold shadow-2xs"
        autoFocus
      />
    </div>

    <div className="p-1.5 max-h-60 overflow-y-auto scrollbar-none divide-y divide-slate-50">
      {[
        { id: "ALL", label: "Toutes les catégories"},
        { id: "SECURITY", label: "Sécurité & Anti-Triche"},
        { id: "AUTHENTICATION", label: "Connexions & Accès"},
        { id: "EXAM_MANAGEMENT", label: "Examens & Sujets"},
        { id: "USER_MANAGEMENT", label: "Comptes Utilisateurs"}
      ]
        .filter(option => option.label.toLowerCase().includes((innerFilterSearch || "").toLowerCase()))
        .map((option) => {
          const isSelected = logCategoryFilter === option.id;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                setLogCategoryFilter(option.id);
                setIsFilterDropdownOpen(false); 
                setInnerFilterSearch(""); 
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-150 group my-0.5
                ${isSelected 
                  ? "bg-emerald-500 text-white font-black shadow-sm shadow-emerald-500/20" 
                  : "hover:bg-slate-50 text-slate-600 hover:text-slate-900"
                }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-sm select-none group-hover:scale-110 transition-transform">{option.icon}</span>
                <span className={isSelected ? "text-white" : "text-slate-700 group-hover:text-slate-900 transition-colors"}>
                  {option.label}
                </span>
              </div>

              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all shrink-0
                ${isSelected 
                  ? "border-white bg-white" 
                  : "border-slate-300 bg-white group-hover:border-slate-400"
                }`}
              >
                {isSelected && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </div>
            </button>
          );
        })}

      {[
        { id: "ALL", label: "Toutes les catégories" },
        { id: "SECURITY", label: "Sécurité & Anti-Triche" },
        { id: "AUTHENTICATION", label: "Connexions & Accès" },
        { id: "EXAM_MANAGEMENT", label: "Examens & Sujets" },
        { id: "USER_MANAGEMENT", label: "Comptes Utilisateurs" }
      ].filter(option => option.label.toLowerCase().includes((innerFilterSearch || "").toLowerCase())).length === 0 && (
        <div className="py-5 text-center text-slate-400 font-bold text-[11px] select-none">
          Aucune catégorie trouvée
        </div>
      )}
    </div>
  </div>
)}
      </div>

    </div>
  </div>

  <div className="divide-y divide-slate-50 h-[400px] overflow-y-auto pr-1 scrollbar-thin relative">
    {(mappedAuditLogs || [])
      .filter((log) => {
        const mC = logCategoryFilter === "ALL" || log.category === logCategoryFilter;
        const mS = !logSearchQuery || !logSearchQuery.trim() || 
                   log.action?.toLowerCase().includes(logSearchQuery.toLowerCase()) || 
                   log.details?.toLowerCase().includes(logSearchQuery.toLowerCase()) || 
                   log.userEmail?.toLowerCase().includes(logSearchQuery.toLowerCase());
        return mC && mS;
      })
      .reverse()
      .map((log) => {
        let badgeStyles = "bg-slate-50 text-slate-600 border-slate-200";
        if (log.category === "SECURITY") badgeStyles = "bg-rose-50 text-rose-600 border-rose-200/60 font-black";
        if (log.category === "AUTHENTICATION") badgeStyles = "bg-amber-50 text-amber-700 border-amber-200/60";
        if (log.category === "EXAM_MANAGEMENT") badgeStyles = "bg-blue-50 text-blue-600 border-blue-200/60";
        if (log.category === "USER_MANAGEMENT") badgeStyles = "bg-purple-50 text-purple-600 border-purple-200/60";

        return (
          <div key={log.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs hover:bg-slate-50/40 transition-colors duration-150">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold border border-slate-200/40 select-none">
                  {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : "00:00:00"}
                </span>
                <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-md border tracking-wider select-none ${badgeStyles}`}>
                  {log.category}
                </span>
                <strong className="text-slate-800 text-xs tracking-tight font-black">
                  {log.action}
                </strong>
              </div>
              <p className="text-slate-500 leading-relaxed font-mono text-[11px] font-medium pl-0.5">
                {log.details}
              </p>
            </div>

            <div className="shrink-0 md:self-center self-end">
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-50 border border-slate-200/40 px-2.5 py-1 rounded-lg uppercase tracking-tight shadow-3xs">
                {log.userEmail}
              </span>
            </div>
          </div>
        );
      })}

    {(mappedAuditLogs || []).filter((log) => {
        const mC = logCategoryFilter === "ALL" || log.category === logCategoryFilter;
        const mS = !logSearchQuery || !logSearchQuery.trim() || 
                   log.action?.toLowerCase().includes(logSearchQuery.toLowerCase()) || 
                   log.details?.toLowerCase().includes(logSearchQuery.toLowerCase()) || 
                   log.userEmail?.toLowerCase().includes(logSearchQuery.toLowerCase());
        return mC && mS;
      }).length === 0 && (
      <div className="h-full flex flex-col items-center justify-center text-center py-14 max-w-xs mx-auto select-none">
        <div className="relative mb-4 group">
          
          
        </div>

        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">
          Aucun résultat trouvé
        </h4>
        <p className="text-[10px] text-slate-400 font-semibold mt-2 leading-relaxed">
          Aucun log d'état ne correspond à votre recherche actuelle ou aux catégories cochées.
        </p>


      </div>
    )}
  </div>

</div>

  </div>
)}


  





 
    </div>);
}
