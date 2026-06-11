/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
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
              <span>{currentClock}</span>
              <span className="text-[10px] text-slate-400 font-sans font-bold uppercase">
                &bull; A.U. 2025-2026
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

                  {notificationsOpen && (<div className="absolute right-[-40px] sm:right-0 mt-2.5 w-[280px] sm:w-[360px] bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden transform origin-top-right transition-all z-50 text-xs">
                      {/* Header */}
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-[11px] font-bold">
                        <span className="text-slate-700 uppercase tracking-widest font-black flex items-center gap-1.5">
                          Alertes Système ({unreadCount} non lues)
                        </span>
                        {userNotifications.length > 0 && (<div className="flex gap-2">
                            <button onClick={handleMarkAllRead} className="text-indigo-600 hover:text-indigo-800 transition-colors uppercase font-black tracking-wider cursor-pointer">
                              Tout lire
                            </button>
                            <span className="text-slate-300">|</span>
                            <button onClick={handleClearAll} className="text-red-500 hover:text-red-700 transition-colors uppercase font-black tracking-wider cursor-pointer">
                              Vider
                            </button>
                          </div>)}
                      </div>

                      {/* Notifications Container */}
                      <div className="max-h-[320px] overflow-y-auto divide-y divide-slate-100">
                        {userNotifications.length === 0 ? (<div className="p-8 text-center text-slate-400 font-semibold space-y-2">
                            <Bell className="w-8 h-8 text-slate-300 mx-auto"/>
                            <p>Aucune notification de sécurité ou d'activité pour le moment.</p>
                          </div>) : (userNotifications.map((notif) => {
                    const isDanger = notif.type === "alert" || notif.type === "warning" || notif.type === "DANGER" || notif.type?.toLowerCase() === "security";
                    const isValidation = notif.type === "success" || notif.type === "VALIDATION" || notif.type?.toLowerCase() === "success";
                    const msg = notif.content || notif.message;
                    const timeVal = notif.date || notif.timestamp;
                    return (<div key={notif.id} className={`p-3.5 flex gap-3 transition-colors ${notif.isRead ? "bg-white opacity-70" : "bg-sky-50/20 font-medium"} hover:bg-slate-50/50`}>
                                {/* Circle icon indicator */}
                                <div className="mt-0.5 shrink-0">
                                  {isDanger ? (<div className="w-7 h-7 bg-red-100 rounded-full flex items-center justify-center text-red-650">
                                      <AlertCircle className="w-4 h-4"/>
                                    </div>) : isValidation ? (<div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-650">
                                      <CheckCircle2 className="w-4 h-4"/>
                                    </div>) : (<div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center text-amber-500">
                                      <Clock className="w-4 h-4"/>
                                    </div>)}
                                </div>

                                {/* Body */}
                                <div className="flex-1 space-y-1 min-w-0">
                                  <div className="flex justify-between items-start gap-2">
                                    <h4 className="font-extrabold text-slate-900 leading-snug truncate">
                                      {notif.title}
                                    </h4>
                                    <span className="text-[9px] text-slate-400 shrink-0 font-mono">
                                      {timeVal?.split("T")[1]?.slice(0, 5) || "Juste là"}
                                    </span>
                                  </div>
                                  <p className="text-slate-600 font-semibold text-[11px] leading-relaxed break-words text-left">
                                    {msg}
                                  </p>

                                  {/* Utility Actions row on each item */}
                                  <div className="pt-1.5 flex gap-3 text-[10px] text-slate-400 select-none">
                                    <button onClick={(e) => handleToggleRead(e, notif.id)} className="hover:text-indigo-600 transition-colors font-extrabold cursor-pointer flex items-center gap-1">
                                      {notif.isRead ? (<>
                                          <EyeOff className="w-3 h-3"/>
                                          Marquer non-lu
                                        </>) : (<>
                                          <Eye className="w-3 h-3"/>
                                          Marquer lu
                                        </>)}
                                    </button>
                                    <button onClick={(e) => handleDeleteNotif(e, notif.id)} className="hover:text-red-650 transition-colors font-extrabold cursor-pointer flex items-center gap-1 ml-auto">
                                      <Trash2 className="w-3 h-3"/>
                                      Effacer
                                    </button>
                                  </div>
                                </div>
                              </div>);
                }))}
                      </div>
                    </div>)}
                </div>

                {/* Avatar Profile Dropdown */}
                <div className="relative">
                  <button id="user-profile-menu-trigger" onClick={() => {
                setDropdownOpen(!dropdownOpen);
                setNotificationsOpen(false);
            }} className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#F4C542] p-1.5 rounded-full hover:bg-slate-50 transition-all border border-slate-100 cursor-pointer">
                    <img id="current-navbar-avatar" src={currentUser.profilePic || currentUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser.name)}`} alt={currentUser.name} className="w-8 h-8 rounded-full border border-slate-200 bg-white object-cover" onError={(e) => {
                e.target.src =
                    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%23ccc'><circle cx='50' cy='50' r='50'/></svg>";
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
