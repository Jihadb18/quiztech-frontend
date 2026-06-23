
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
        setSuccess("Photo de profil supprimée.");
    };
    // Resolve current avatar display
    const currentAvatarUrl = currentUser.profilePic ||
        `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(currentUser.name)}`;
    // Determine if we can show deletion button (if profilePic is a custom base64/image and not empty)
    const isCustomAvatar = !!currentUser.profilePic;
    return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
  {/* Modal */}
  <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] border border-slate-100 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-300">
    
    {/* Header */}
    <div className="flex justify-between items-center px-8 py-6 bg-white border-b border-slate-50">
      <div>
        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Paramètres</h3>
        <p className="text-xs text-slate-400 font-medium">Gestion de votre identité académique</p>
      </div>
      <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all">
        <X className="w-5 h-5"/>
      </button>
    </div>

    {/* Scrollable Content Area */}
    <div className="px-8 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar space-y-8">
      
      {/* Status Messages */}
      {(success || error) && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border ${success ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {success ? <CheckCircle2 className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
          {success || error}
        </div>
      )}

     {/* Profile Section */}
<div className="flex items-center gap-5 bg-slate-50 p-5 rounded-3xl border border-slate-100">
  <div className="relative shrink-0">
    <img 
      src={currentAvatarUrl} 
      alt={currentUser.name} 
      className="w-20 h-20 rounded-full border-4 border-white shadow-md object-cover" 
      onError={(e) => e.target.src = DEFAULT_AVATAR}
    />
    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#F4C542] rounded-full border-4 border-white"/>
  </div>
  
  <div className="space-y-1.5 min-w-0 flex-1">
    <div>
      <h4 className="font-extrabold text-slate-800 text-lg truncate">{currentUser.name}</h4>
      <span className="inline-block px-3 py-0.5 bg-slate-900 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
        {currentUser.role}
      </span>
    </div>
    
    <div className="space-y-0.5">
      <p className="text-xs text-slate-500 font-mono truncate">{currentUser.email}</p>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
        Inscrit le : {currentUser.role === 'etudiant' ? '15/09/2025' : '01/09/2024'}
      </p>
    </div>
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

            {isCustomAvatar && (
  <button 
    type="button" 
    onClick={handleDeleteAvatar} 
    className="group w-full py-3 border border-slate-200 hover:border-rose-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-bold text-xs rounded-xl transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer focus:outline-none active:scale-[0.98]"
  >
    <Trash2 className="w-4 h-4 opacity-70 group-hover:opacity-100" />
    Supprimer ma photo actuelle
  </button>
)}
          </div>

      {/* Footer Button (Sticked inside scrollable or absolute bottom) */}
      <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-bold text-sm rounded-2xl hover:bg-slate-800 active:scale-[0.98] transition-all">
        Enregistrer & Fermer
      </button>

    </div>
  </div>
</div>);
}
