
import React, { useState } from "react";
import { X, Upload, Trash2, CheckCircle2, AlertCircle, ShieldCheck, } from "lucide-react";
export default function ProfilePicUploader({ currentUser, onClose, onUpdateUser, }) {
    const [success, setSuccess] = useState("");
    const [error, setError] = useState("");
    const [dragActive, setDragActive] = useState(false);
    // Default Placeholder colored SVG avatar
    const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%2364748b'><circle cx='50' cy='50' r='50'/><circle cx='50' cy='40' r='20' fill='white'/><path d='M20,80 C20,60 80,60 80,80' fill='white'/></svg>";
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (err) => reject(err);
        });
    };
    const handleImageUpload = async (file) => {
        setError("");
        setSuccess("");
        // File validation: Type and size
        if (!file.type.startsWith("image/")) {
            setError("Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).");
            return;
        }
        if (file.size > 1024 * 1024 * 3) {
            setError("La taille de l'image ne doit pas dépasser 3 Mo.");
            return;
        }
        try {
            const base64Data = await convertFileToBase64(file);
            const updatedUser = { ...currentUser, profilePic: base64Data };
            onUpdateUser(updatedUser);
            setSuccess("Photo de profil mise à jour avec succès !");
        }
        catch (err) {
            setError("Erreur lors de la lecture du fichier image.");
        }
    };
    // Drag and Drop
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        }
        else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };
    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleImageUpload(e.dataTransfer.files[0]);
        }
    };
    const handleFileInputChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            await handleImageUpload(e.target.files[0]);
        }
    };
    const handleDeleteAvatar = () => {
        setError("");
        setSuccess("");
        // Revert to default placeholder
        const updatedUser = { ...currentUser, profilePic: "" };
        onUpdateUser(updatedUser);
        setSuccess("Photo de profil supprimée. Le placeholder standard a été restauré.");
    };
    // Resolve current avatar display
    const currentAvatarUrl = currentUser.profilePic ||
        `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser.name)}`;
    // Determine if we can show deletion button (if profilePic is a custom base64/image and not empty)
    const isCustomAvatar = !!currentUser.profilePic;
    return (<div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">
              Paramètres du Compte
            </h3>
            <p className="text-xs text-slate-400 font-medium text-left">
              Gérer vos informations d'identité académique
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 focus:outline-none p-1.5 hover:bg-slate-200/50 rounded-full transition-colors cursor-pointer">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {success && (<div className="p-3 bg-green-50 text-green-800 text-xs font-semibold rounded-lg flex items-center gap-2 border border-green-200 text-left">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0"/>
              <span>{success}</span>
            </div>)}

          {error && (<div className="p-3 bg-red-50 text-red-800 text-xs font-semibold rounded-lg flex items-center gap-2 border border-red-200 text-left">
              <AlertCircle className="w-4 h-4 text-red-650 shrink-0"/>
              <span>{error}</span>
            </div>)}

          {/* User Basic Info Header */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-left">
            <div className="relative group shrink-0">
              <img src={currentAvatarUrl} alt={currentUser.name} className="w-16 h-16 rounded-full border-2 border-[#F4C542] bg-white object-cover" onError={(e) => {
            e.target.src = DEFAULT_AVATAR;
        }}/>
            </div>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-extrabold text-slate-800 text-sm truncate">
                  {currentUser.name}
                </h4>
                <div className="text-[9px] bg-slate-900 text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider scale-90 border border-amber-400">
                  {currentUser.role}
                </div>
              </div>
              <p className="text-xs text-slate-500 font-mono truncate">
                {currentUser.email}
              </p>
              <p className="text-[10px] text-slate-400 font-bold">
                Inscrit le : {currentUser.role === 'etudiant' ? '15/09/2025' : '01/09/2024'}
              </p>
            </div>
          </div>

          {/* Photo Management Section */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide text-left">
              Photo d'Identité Scolaire
            </h5>

            {/* Drag & Drop Area */}
            <div onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop} className={`border-2 border-dashed rounded-xl p-6 text-center transition-all flex flex-col items-center justify-center gap-2 ${dragActive
            ? "border-amber-500 bg-amber-50/20"
            : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"}`}>
              <Upload className="w-8 h-8 text-slate-400 shrink-0"/>
              <div className="text-xs text-slate-600 font-semibold selection:bg-transparent">
                Glissez-déposez votre photo ici, ou{" "}
                <label className="text-[#F4C542] hover:text-amber-600 font-bold underline cursor-pointer">
                  recherchez un fichier
                  <input type="file" onChange={handleFileInputChange} accept="image/*" className="hidden"/>
                </label>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                PNG, JPG ou WebP autorisés (Max 3 Mo)
              </p>
            </div>

            {/* Delete photo button if custom avatar exists */}
            {isCustomAvatar && (<button type="button" onClick={handleDeleteAvatar} className="w-full py-2 border border-red-200 text-red-650 hover:bg-red-50 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer focus:outline-none">
                <Trash2 className="w-4 h-4"/>
                Supprimer ma photo actuelle
              </button>)}
          </div>

          {/* Academic disclaimer */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex gap-2.5 items-start text-left">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"/>
            <p className="text-[10px] text-amber-900 leading-relaxed font-semibold">
              <span className="font-bold">Remarque réglementaire :</span> Votre
              photo de profil est intégrée à votre dossier d'évaluation d'étude.
              Elle sera validée visuellement par les surveillants lors des accès
              contrôlés à la salle d'examen virtuelle.
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
            Fermer l'accueil
          </button>
        </div>
      </div>
    </div>);
}
