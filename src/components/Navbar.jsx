
import React, { useState } from "react";
import { LogOut, Settings, Clock, Bell, BellRing, CheckCircle2, AlertCircle, Clock as ClockIcon, Trash2, Eye, EyeOff, } from "lucide-react";
export default function Navbar({ currentUser, onLogout, onNavigateLogin, onTriggerProfileSettings, currentClock, notifications = [], onSyncNotifications, }) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    // Filter notifications belonging to the logged-in user or "ALL" global signals
    const userNotifications = currentUser
        ? notifications.filter((n) => n.userId === "ALL" || n.userId === currentUser.id)
        : [];
    const unreadCount = userNotifications.filter((n) => !n.isRead).length;
    const handleMarkAllRead = (e) => {
        e.stopPropagation();
        if (!currentUser || !onSyncNotifications)
            return;
        const updated = notifications.map((n) => {
            if (n.userId === "ALL" || n.userId === currentUser.id) {
                return { ...n, isRead: true };
            }
            return n;
        });
        onSyncNotifications(updated);
    };
    const handleClearAll = (e) => {
        e.stopPropagation();
        if (!currentUser || !onSyncNotifications)
            return;
        const updated = notifications.filter((n) => n.userId !== "ALL" && n.userId !== currentUser.id);
        onSyncNotifications(updated);
    };
    const handleToggleRead = (e, notifId) => {
        e.stopPropagation();
        if (!onSyncNotifications)
            return;
        const updated = notifications.map((n) => {
            if (n.id === notifId) {
                return { ...n, isRead: !n.isRead };
            }
            return n;
        });
        onSyncNotifications(updated);
    };
    const handleDeleteNotif = (e, notifId) => {
        e.stopPropagation();
        if (!onSyncNotifications)
            return;
        const updated = notifications.filter((n) => n.id !== notifId);
        onSyncNotifications(updated);
    };
    return (<nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Quiz<span className="text-[#F4C542]">Tech</span>
            </span>
          </div>

          {/* Clock & Action buttons */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Real-time Clock display */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-full text-slate-700 font-mono text-xs">
              <ClockIcon className="w-3.5 h-3.5 text-amber-500 animate-pulse"/>
              <span>{currentClock}  </span>
              <span className="text-[10px] text-slate-400 font-sans font-bold uppercase">
                 A.U. 2025-2026
              </span>
            </div>

            {currentUser ? (<>
                {/* Real-time Notifications Bell System */}
                <div className="relative">
                  <button onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setDropdownOpen(false);
            }} className={`relative p-2 rounded-full border transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-400 ${notificationsOpen
                ? "bg-slate-100 border-slate-300 text-slate-900"
                : "border-slate-100 text-slate-650 hover:bg-slate-50 hover:text-slate-900"}`} title="Alertes & Notifications">
                    {unreadCount > 0 ? (<BellRing className="w-4.5 h-4.5 text-red-650 animate-pulse"/>) : (<Bell className="w-4.5 h-4.5 text-slate-500"/>)}

                    {unreadCount > 0 && (<span className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full shadow border-2 border-white">
                        {unreadCount}
                      </span>)}
                  </button>


{notificationsOpen && (
  <div className="absolute right-0 mt-3 w-[380px] bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
    
    {/* Header - Minimalist */}
    <div className="px-5 py-4 bg-white border-b border-slate-50 flex justify-between items-center">
      <h3 className="font-black text-slate-900 text-xs uppercase tracking-widest flex items-center gap-2">
        Alertes Système
      </h3>
      {userNotifications.length > 0 && (
        <button onClick={handleMarkAllRead} className="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors uppercase">
          Tout marquer lu
        </button>
      )}
    </div>

    {/* Notifications Container */}
    <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
      {userNotifications.length === 0 ? (
        <div className="p-10 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
            <Bell className="w-5 h-5"/>
          </div>
          <p className="text-slate-400 font-medium text-xs">Aucune notification.</p>
        </div>
      ) : (
        userNotifications.map((notif) => {
          const isDanger = ["alert", "warning", "DANGER", "security"].includes(notif.type);
          const isSuccess = ["success", "VALIDATION"].includes(notif.type);
          
          return (
            <div key={notif.id} className={`group p-4 flex gap-4 transition-all hover:bg-slate-50 border-b border-slate-50 last:border-0 ${!notif.isRead ? "bg-indigo-50/20" : ""}`}>
              {/* Icon */}
              <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isDanger ? "bg-red-50 text-red-500" : isSuccess ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"
              }`}>
                {isDanger ? <AlertCircle className="w-4 h-4"/> : isSuccess ? <CheckCircle2 className="w-4 h-4"/> : <Clock className="w-4 h-4"/>}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex justify-between items-center">
                  <h4 className="font-black text-slate-800 text-[11px] truncate">{notif.title}</h4>
                  <span className="text-[9px] text-slate-400 font-mono">{notif.date?.split("T")[1]?.slice(0, 5)}</span>
                </div>
                <p className="text-slate-500 font-medium text-[11px] leading-relaxed line-clamp-2">{notif.content || notif.message}</p>
                
                {/* Footer Actions */}
                <div className="flex gap-4 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleToggleRead(e, notif.id)} className="text-[9px] font-black text-slate-400 hover:text-indigo-600 uppercase">
                    {notif.isRead ? "Non-lu" : "Lu"}
                  </button>
                  <button onClick={(e) => handleDeleteNotif(e, notif.id)} className="text-[9px] font-black text-slate-400 hover:text-red-600 uppercase">
                    Effacer
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
    
    {/* Clear All Footer */}
    {userNotifications.length > 0 && (
      <button onClick={handleClearAll} className="w-full py-3 text-[10px] font-black text-red-500 hover:bg-red-50 border-t border-slate-50 transition-colors uppercase">
        Vider toutes les notifications
      </button>
    )}
  </div>
)}
                
                </div>

                {/* Avatar Profile Dropdown */}
                <div className="relative">
                  <button id="user-profile-menu-trigger" onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setNotificationsOpen(false);
            }} className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#F4C542] p-1.5 rounded-full hover:bg-slate-50 transition-all border border-slate-100 cursor-pointer">
                    <img id="current-navbar-avatar" src={currentUser.profilePic || currentUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser.name)}`} alt={currentUser.name} className="w-8 h-8 rounded-full border border-slate-200 bg-white object-cover" onError={(e) => {
                 }}/>

                    <span className="hidden sm:inline text-xs font-bold text-slate-700 capitalize max-w-[120px] truncate">
                      {(currentUser.name || currentUser.fullName || "").split(" ")[0]}
                    </span>
                    <div className="text-[10px] px-2 py-0.5 bg-slate-900 text-white font-bold rounded-full scale-90 border border-amber-400">
                      {currentUser.role}
                    </div>
                  </button>

                  {dropdownOpen && (<div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 divide-y divide-slate-50 overflow-hidden transform origin-top-right transition-all">
                      <div className="px-4 py-3 text-left">
                        <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">
                          Utilisateur
                        </p>
                        <p className="text-sm font-bold text-slate-800 truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate font-mono mt-0.5">
                          {currentUser.email}
                        </p>
                      </div>

                      <div className="py-1">
                        <button onClick={() => {
                    setDropdownOpen(false);
                    onTriggerProfileSettings();
                }} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 cursor-pointer border-none bg-transparent">
                          <Settings className="w-4 h-4 text-slate-400"/>
                          Mon Profil & Paramètres
                        </button>
                      </div>

                      <div className="py-1">
                        <button onClick={() => {
                    setDropdownOpen(false);
                    onLogout();
                }} className="w-full text-left px-4 py-2 text-xs font-semibold text-red-650 hover:bg-red-50 flex items-center gap-2 cursor-pointer border-none bg-transparent">
                          <LogOut className="w-4 h-4 text-red-400"/>
                          Déconnexion sécurisée
                        </button>
                      </div>
                    </div>)}
                </div>
              </>) : (
        /* If Guest: Connexion outline yellow button */
        <button id="navbar-connexion-btn" onClick={onNavigateLogin} className="border-2 border-[#F4C542] hover:bg-[#F4C542] hover:text-slate-900 text-slate-900 font-bold px-5 py-1.5 text-xs rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F4C542] focus:ring-offset-2 active:scale-95 transition-all cursor-pointer">
                Connexion
              </button>)}
          </div>
        </div>
      </div>
    </nav>);
}
