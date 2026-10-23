import { useState } from 'react';
import { 
  Building2, 
  Globe2, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Lock, 
  Home, 
  Users, 
  ChevronRight,
  Award
} from 'lucide-react';
import { HeroAndPrograms } from './components/HeroAndPrograms';
import { NewAssociateForm } from './components/NewAssociateForm';
import { ExistingAssociateForm } from './components/ExistingAssociateForm';
import { AdminPanel } from './components/AdminPanel';
import { CertificateModal } from './components/CertificateModal';
import type { CertificateData } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'HOME' | 'FORM_NEW' | 'FORM_EXISTING' | 'ADMIN'>('HOME');
  const [certificateData, setCertificateData] = useState<CertificateData | null>(null);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  const handleOpenCertificate = (data: CertificateData) => {
    setCertificateData(data);
    setIsCertificateOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Barra de Anuncio Superior Institucional */}
      <div className="bg-slate-900 text-slate-300 text-[11px] sm:text-xs py-2 px-4 border-b border-slate-800 no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-white">Programa Cooperación Internacional Colombia</span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline">Dirigido por Grupo PMD SAS • NIT: 901262947-1</span>
          </div>

          <div className="flex items-center gap-4 text-slate-300">
            <a href="tel:3206748093" className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>320 674 8093</span>
            </a>
            <span className="text-slate-600">|</span>
            <a href="mailto:empresasmussa2000@gmail.com" className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <Mail className="w-3 h-3 text-blue-400" />
              <span>empresasmussa2000@gmail.com</span>
            </a>
          </div>
        </div>
      </div>

      {/* Header y Navegación Principal */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo y Razón Social */}
          <div 
            onClick={() => setActiveTab('HOME')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img 
              src="/logo-pmd.png" 
              alt="Programa Cooperación Internacional - Grupo PMD SAS" 
              className="h-12 sm:h-14 w-auto object-contain transition-transform group-hover:scale-105"
            />
            <div className="hidden lg:block border-l border-slate-200 pl-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-900 leading-tight">
                República de Colombia
              </p>
              <p className="text-xs font-black text-slate-900 leading-tight">
                Grupo PMD SAS • NIT 901262947-1
              </p>
              <p className="text-[10px] text-slate-500">
                Operador Gestión de Recursos Sociales
              </p>
            </div>
          </div>

          {/* Menú de Navegación por Pestañas */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('HOME')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'HOME'
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-900 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Inicio & Programas</span>
            </button>

            <button
              onClick={() => setActiveTab('FORM_NEW')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'FORM_NEW'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-blue-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4 text-blue-500" />
              <span>Nuevos Asociados</span>
            </button>

            <button
              onClick={() => setActiveTab('FORM_EXISTING')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'FORM_EXISTING'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-amber-800 hover:bg-slate-100'
              }`}
            >
              <Globe2 className="w-4 h-4 text-amber-500" />
              <span className="hidden md:inline">Cuenta Internacional (Asociados)</span>
              <span className="md:hidden">Cuenta Int.</span>
            </button>

            <button
              onClick={() => setActiveTab('ADMIN')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'ADMIN'
                  ? 'bg-slate-900 text-amber-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Panel Administrativo"
            >
              <Lock className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Contenido Principal Dinámico */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'HOME' && (
          <HeroAndPrograms
            onSelectNewAssociate={() => {
              setActiveTab('FORM_NEW');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectExistingAssociate={() => {
              setActiveTab('FORM_EXISTING');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'FORM_NEW' && (
          <div className="max-w-3xl mx-auto py-4">
            <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
              <button onClick={() => setActiveTab('HOME')} className="hover:text-blue-700">Inicio</button>
              <ChevronRight className="w-3 h-3" />
              <span className="font-semibold text-slate-800">Registro de Nuevos Asociados</span>
            </div>
            <NewAssociateForm onSuccess={handleOpenCertificate} />
          </div>
        )}

        {activeTab === 'FORM_EXISTING' && (
          <div className="max-w-3xl mx-auto py-4">
            <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
              <button onClick={() => setActiveTab('HOME')} className="hover:text-blue-700">Inicio</button>
              <ChevronRight className="w-3 h-3" />
              <span className="font-semibold text-slate-800">Actualización y Cuenta Internacional</span>
            </div>
            <ExistingAssociateForm onSuccess={handleOpenCertificate} />
          </div>
        )}

        {activeTab === 'ADMIN' && (
          <div className="py-4">
            <AdminPanel onViewCertificate={handleOpenCertificate} />
          </div>
        )}
      </main>

      {/* Modal del Certificado Oficial */}
      <CertificateModal
        data={certificateData}
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
      />

      {/* Footer Institucional */}
      <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 pt-12 pb-8 mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Columna 1: Identidad */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <img src="/logo-pmd.png" alt="Grupo PMD SAS" className="h-10 w-auto bg-white p-1 rounded" />
            </div>
            <p className="text-slate-300 font-bold text-sm">
              Programa Cooperación Internacional Colombia
            </p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Organización Filantrópica. Operador de gestión de recursos para programas sociales, canasta de alimentos, vivienda digna, educación, salud y agroindustria.
            </p>
            <p className="font-mono text-slate-300 font-semibold text-xs">
              NIT: 901262947-1
            </p>
          </div>

          {/* Columna 2: Programas Prioritarios */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Programas de Apoyo</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li className="hover:text-white transition-colors">• Canasta de Alimentos Mensual</li>
              <li className="hover:text-white transition-colors">• Vivienda Digna y Mejoramiento</li>
              <li className="hover:text-white transition-colors">• Fincas y Tierras para Campesinos</li>
              <li className="hover:text-white transition-colors">• Fortalecimiento de PYMES Productivas</li>
              <li className="hover:text-white transition-colors">• Salud y Brigadas Comunitarias</li>
              <li className="hover:text-white transition-colors">• Atención a Víctimas y Catástrofes</li>
            </ul>
          </div>

          {/* Columna 3: Alianzas y Cooperación */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Cooperantes y Alianzas</h4>
            <div className="space-y-2 text-[11px]">
              <p className="flex items-center gap-1.5 text-slate-300">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                King Salman Humanitarian Aid & Relief
              </p>
              <p className="flex items-center gap-1.5 text-slate-300">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                Banca Multilateral y Fondos Internacionales
              </p>
              <p className="text-slate-500 text-[10px] leading-relaxed mt-2">
                Trámites y registros custodiados conforme a estándares internacionales de transparencia y auditoría.
              </p>
            </div>
          </div>

          {/* Columna 4: Legal & Contacto */}
          <div className="space-y-2">
            <h4 className="text-white font-bold text-sm uppercase tracking-wider">Contacto & Legal</h4>
            <div className="space-y-1.5 text-[11px]">
              <p className="text-slate-300">
                <strong>Correo:</strong> empresasmussa2000@gmail.com
              </p>
              <p className="text-slate-300">
                <strong>Contacto:</strong> 320 674 8093
              </p>
              <p className="text-slate-400 pt-2 border-t border-slate-800">
                <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-emerald-400" />
                Protegido por la <strong>Ley 1581 de 2012</strong> de Habeas Data (Colombia).
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} Grupo PMD SAS • Nit 901262947-1. Todos los derechos reservados.</p>
          <p className="text-slate-400">Plataforma Oficial de Cooperación Internacional Colombia</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
