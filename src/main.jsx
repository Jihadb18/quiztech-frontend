import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
 {/* Colonne Gauche : Carte Profil (4 colonnes) */}
    <div className="lg:col-span-4 space-y-4">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        
        {/* En-tête : Photo, Nom & Statut */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-inner">
            <img src="/path-to-profile-image.jpg" alt="Étudiant" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Salma Bennani</h2>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
              Étudiant
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Moyenne</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{averageGrade}/20</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase">Examens</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{completedSubmissions.length}</p>
          </div>
        </div>

        {/* Graphique d'évolution des notes intégré dans la carte */}
        <div className="pt-2 border-t border-slate-50">
          <p className="text-[10px] font-bold text-slate-400 uppercase mb-3 mt-4">Progression des notes</p>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gradesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, 20]} hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="grade" 
                  stroke="#4F46E5" 
                  strokeWidth={3} 
                  dot={{ fill: "#4F46E5", strokeWidth: 2 }} 
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
























































































