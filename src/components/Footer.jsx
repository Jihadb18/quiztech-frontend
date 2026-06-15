
import { CheckCircle, BarChart2, Save, Phone, Mail } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Main Info */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            {/* HighTech School Real Logo SVG exactly recreated */}
                            <div className="w-14 h-12 flex items-center justify-center shrink-0">
                                <svg width="100%" height="100%" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* Stylized Golden Roof */}
                                    <path d="M 12 36 L 60 10 L 108 36" stroke="#F4C542" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                                    <path d="M 20 38 Q 60 22 100 38" stroke="#F4C542" strokeWidth="4" strokeLinecap="round" fill="none"/>

                                    {/* HIGH-TECH Text */}
                                    <text x="60" y="58" textAnchor="middle" fill="#F4C542" fontSize="20" fontWeight="900" fontFamily="sans-serif" letterSpacing="0.2">
                                        HIGH-TECH
                                    </text>

                                    {/* Golden separator line */}
                                    <line x1="12" y1="65" x2="108" y2="65" stroke="#F4C542" strokeWidth="2"/>

                                    {/* Subtitle */}
                                    <text x="60" y="73" textAnchor="middle" fill="#F4C542" fontSize="5" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.1">
                                        ECOLES D'ENSEIGNEMENT SUPÉRIEUR
                                    </text>

                                    {/* Red badge */}
                                    <rect x="12" y="78" width="96" height="14" rx="2" fill="#E11D48"/>
                                    <text x="60" y="88" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="bold" fontFamily="sans-serif" letterSpacing="0.3">
                                        RECONNUE PAR L'ÉTAT
                                    </text>
                                </svg>
                            </div>

                            {/* Elegant vertical separator line */}
                            <div className="h-8 w-px bg-slate-700 mx-1"/>

                            {/* QuizTech display label */}
                            <span className="text-lg font-black text-white tracking-tight shrink-0">
                                Quiz<span className="text-[#F4C542]">Tech</span>
                            </span>
                        </div>
                        <p className="text-xs font-semibold leading-relaxed text-slate-500">
                            Solution officielle d'évaluation
                            <br /> de HighTech School : l'équité
                            <br /> académique garantie
                        </p>
                    </div>

                    {/* Features (الميزات الحقيقية المستخرجة من دفتر الشروط) */}
                    <div>
                        <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
                            Fonctionnalités Clés
                        </h3>
                        <ul className="space-y-2 text-xs font-semibold text-slate-400">
                            <li className="flex items-center gap-2">
                                <CheckCircle className="w-3.5 h-3.5 text-[#F4C542]"/>{" "}
                                Correction Automatique
                            </li>
                            <li className="flex items-center gap-2">
                                <BarChart2 className="w-3.5 h-3.5 text-[#F4C542]"/>{" "}
                                Dashboards Statistiques
                            </li>
                            <li className="flex items-center gap-2">
                                <Save className="w-3.5 h-3.5 text-[#F4C542]"/>{" "}
                                Sauvegarde Automatique
                            </li>
                        </ul>
                    </div>

                    {/* Support (تحديث بيانات الاتصال لتطابق الصفحة 5 من الدفتر) */}
                    <div>
                        <h3 className="text-white text-xs font-bold uppercase tracking-wider mb-4">
                            Support d'Assistance
                        </h3>
                        <ul className="space-y-2 text-xs font-semibold text-slate-400">
                            <li className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-[#F4C542]"/>
                                <span>support@quiztech.ma</span>
                            </li>
                            <li className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#F4C542]"/>
                                <span>+212 5XX XX XX XX</span>
                            </li>
                            <li className="text-[10px] text-slate-600 font-bold uppercase tracking-wider mt-4">
                                HighTech School SAS
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs font-semibold text-slate-500">
                    <div>
                        © {new Date().getFullYear()} HighTech School. Tous droits réservés.
                    </div>
                    <div className="flex gap-4 mt-4 sm:mt-0">
                        <a href="#support" className="hover:text-[#F4C542] text-decoration-none">
                            Conditions d'Utilisation
                        </a>
                        <span>&middot;</span>
                        <a href="#support" className="hover:text-[#F4C542] text-decoration-none">
                            Politique de Confidentialité
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}