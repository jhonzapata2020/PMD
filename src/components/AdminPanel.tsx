import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Globe2, 
  Search, 
  Download, 
  FileCheck, 
  ShieldCheck, 
  Lock, 
  LogOut, 
  Database, 
  Copy, 
  Check, 
  RefreshCw,
  Eye,
  KeyRound
} from 'lucide-react';
import { 
  fetchAllNewAssociates, 
  fetchAllExistingUpdates, 
  isSupabaseConfigured,
  SUPABASE_SQL_SCHEMA,
  supabase
} from '../lib/supabase';
import type { NewAssociate, ExistingAssociateUpdate, CertificateData } from '../types';

interface AdminPanelProps {
  onViewCertificate: (certData: CertificateData) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onViewCertificate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'NEW' | 'EXISTING' | 'SQL'>('NEW');
  const [newAssociates, setNewAssociates] = useState<NewAssociate[]>([]);
  const [existingUpdates, setExistingUpdates] = useState<ExistingAssociateUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    // Si ya había sesión guardada en localStorage
    const savedSession = sessionStorage.getItem('pmd_admin_auth');
    if (savedSession === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [news, existings] = await Promise.all([
        fetchAllNewAssociates(),
        fetchAllExistingUpdates()
      ]);
      setNewAssociates(news);
      setExistingUpdates(existings);
    } catch (err) {
      console.error('Error cargando registros:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    // Si Supabase Auth está configurado con cliente
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: adminEmail,
          password: adminPassword,
        });
        if (!error) {
          setIsAuthenticated(true);
          sessionStorage.setItem('pmd_admin_auth', 'true');
          loadData();
          return;
        }
      } catch (err) {
        // Fallback a login administrativo local
      }
    }

    // Login administrativo oficial por defecto
    if (
      (adminEmail.toLowerCase() === 'admin@pmdsas.org' || adminEmail.toLowerCase() === 'empresasmussa2000@gmail.com') &&
      adminPassword === 'Pmd2026*'
    ) {
      setIsAuthenticated(true);
      sessionStorage.setItem('pmd_admin_auth', 'true');
      loadData();
    } else {
      setAuthError('Credenciales incorrectas. Para acceso administrativo use empresasmussa2000@gmail.com o admin@pmdsas.org con la clave asignada.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('pmd_admin_auth');
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const exportNewToCSV = () => {
    const headers = ['Folio', 'Nombres', 'Apellidos', 'Tipo Doc', 'Documento', 'Teléfono', 'Email', 'Departamento', 'Municipio', 'Dirección', 'Fecha'];
    const rows = newAssociates.map(a => [
      a.certificate_folio,
      `"${a.first_name}"`,
      `"${a.last_name}"`,
      a.doc_type,
      `"${a.doc_number}"`,
      `"${a.phone}"`,
      `"${a.email}"`,
      `"${a.department}"`,
      `"${a.municipality}"`,
      `"${a.address}"`,
      new Date(a.created_at).toLocaleString('es-CO')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nuevos_Asociados_PMD_SAS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExistingToCSV = () => {
    const headers = ['Folio', 'Nombre Completo', 'Tipo Doc', 'Documento', 'Teléfono', 'Email', 'Cuenta Internacional', 'Banco', 'País', 'SWIFT', 'Fecha'];
    const rows = existingUpdates.map(a => [
      a.certificate_folio,
      `"${a.full_name}"`,
      a.doc_type,
      `"${a.doc_number}"`,
      `"${a.phone}"`,
      `"${a.email}"`,
      `"${a.intl_account_number}"`,
      `"${a.bank_name}"`,
      `"${a.country_bank}"`,
      `"${a.swift_bic}"`,
      new Date(a.created_at).toLocaleString('es-CO')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Cuentas_Internacionales_PMD_SAS_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredNew = newAssociates.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.first_name.toLowerCase().includes(q) ||
      item.last_name.toLowerCase().includes(q) ||
      item.doc_number.includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.municipality.toLowerCase().includes(q) ||
      item.certificate_folio.toLowerCase().includes(q)
    );
  });

  const filteredExisting = existingUpdates.filter(item => {
    const q = searchQuery.toLowerCase();
    return (
      item.full_name.toLowerCase().includes(q) ||
      item.doc_number.includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.intl_account_number.toLowerCase().includes(q) ||
      item.bank_name.toLowerCase().includes(q) ||
      item.certificate_folio.toLowerCase().includes(q)
    );
  });

  // Si no está autenticado, mostrar formulario de Login Admin
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-8 bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 text-white text-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-md">
            <Lock className="w-7 h-7 text-amber-400" />
          </div>
          <h3 className="text-xl font-bold">Panel de Administración</h3>
          <p className="text-xs text-blue-200 mt-1">
            Grupo PMD SAS • Programa de Cooperación Internacional
          </p>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {authError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Usuario / Correo Institucional
            </label>
            <input
              type="email"
              required
              placeholder="empresasmussa2000@gmail.com"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contraseña de Acceso
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
            />
          </div>

          <div className="p-3 bg-blue-50/70 border border-blue-200/60 rounded-xl text-[11px] text-blue-900 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold mb-1 text-blue-950">
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Acceso Rápido de Demostración:</span>
            </div>
            <p><strong>Usuario:</strong> empresasmussa2000@gmail.com o admin@pmdsas.org</p>
            <p><strong>Contraseña:</strong> Pmd2026*</p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-800 hover:bg-blue-900 text-white font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Ingresar al Sistema Seguro</span>
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden card-hover">
      {/* Barra Superior del Admin */}
      <div className="bg-slate-900 px-6 py-4 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Consola de Control de Registros</h3>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${isSupabaseConfigured ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                {isSupabaseConfigured ? 'Supabase Conectado' : 'Almacenamiento Local Activo'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Operador: GRUPO PMD SAS • NIT 901262947-1
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 text-xs bg-red-900/60 hover:bg-red-800 text-red-200 rounded-lg border border-red-800/80 flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Métricas Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-slate-50 border-b border-slate-200">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">Nuevos Asociados</span>
            <span className="text-2xl font-black text-slate-900">{newAssociates.length}</span>
            <span className="text-[11px] text-emerald-600 block font-medium">Registrados en Colombia</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <Globe2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">Cuentas Internacionales</span>
            <span className="text-2xl font-black text-slate-900">{existingUpdates.length}</span>
            <span className="text-[11px] text-blue-600 block font-medium">Asociados Actualizados</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">Certificados Emitidos</span>
            <span className="text-2xl font-black text-slate-900">{newAssociates.length + existingUpdates.length}</span>
            <span className="text-[11px] text-slate-500 block font-medium">Folios Oficiales Activos</span>
          </div>
        </div>
      </div>

      {/* Pestañas de Navegación y Búsqueda */}
      <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('NEW')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'NEW' 
                ? 'bg-white text-blue-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Nuevos Asociados ({newAssociates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('EXISTING')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'EXISTING' 
                ? 'bg-white text-blue-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>Cuentas Internacionales ({existingUpdates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SQL')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'SQL' 
                ? 'bg-white text-blue-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-600" />
            <span>Esquema SQL Supabase</span>
          </button>
        </div>

        {activeTab !== 'SQL' && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar por cédula, nombre, folio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none"
              />
            </div>

            {activeTab === 'NEW' ? (
              <button
                onClick={exportNewToCSV}
                className="px-3.5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Excel/CSV</span>
              </button>
            ) : (
              <button
                onClick={exportExistingToCSV}
                className="px-3.5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar Excel/CSV</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contenido según Pestaña */}
      <div className="p-6">
        {activeTab === 'NEW' && (
          <div className="overflow-x-auto">
            {filteredNew.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No se encontraron registros de nuevos asociados.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[11px] border-b border-slate-200">
                    <th className="py-3 px-3">Radicado / Folio</th>
                    <th className="py-3 px-3">Nombre Completo</th>
                    <th className="py-3 px-3">Documento</th>
                    <th className="py-3 px-3">Contacto</th>
                    <th className="py-3 px-3">Ubicación</th>
                    <th className="py-3 px-3">Fecha</th>
                    <th className="py-3 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredNew.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                        {item.certificate_folio}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {item.first_name} {item.last_name}
                      </td>
                      <td className="py-3 px-3 font-mono whitespace-nowrap">
                        <span className="px-1.5 py-0.5 bg-slate-200 rounded text-[10px] font-bold text-slate-700 mr-1">
                          {item.doc_type}
                        </span>
                        {item.doc_number}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{item.phone}</div>
                        <div className="text-slate-500 text-[11px]">{item.email}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{item.municipality}, {item.department}</div>
                        <div className="text-slate-500 text-[10px] truncate max-w-[150px]">{item.address}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                        {new Date(item.created_at).toLocaleDateString('es-CO')}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => onViewCertificate({
                            title: 'Certificado de Registro en Programa Cooperación Internacional',
                            fullName: `${item.first_name} ${item.last_name}`,
                            docType: item.doc_type,
                            docNumber: item.doc_number,
                            email: item.email,
                            phone: item.phone,
                            location: `${item.municipality}, ${item.department} • ${item.address}`,
                            folio: item.certificate_folio,
                            issuedAt: item.created_at,
                            type: 'NEW_ASSOCIATE',
                          })}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-700 hover:text-white hover:bg-blue-700 rounded border border-blue-300 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver Certificado</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'EXISTING' && (
          <div className="overflow-x-auto">
            {filteredExisting.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No se encontraron actualizaciones de cuentas internacionales.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[11px] border-b border-slate-200">
                    <th className="py-3 px-3">Folio Radicado</th>
                    <th className="py-3 px-3">Asociado</th>
                    <th className="py-3 px-3">Documento</th>
                    <th className="py-3 px-3">Cuenta Internacional (IBAN)</th>
                    <th className="py-3 px-3">Banco & País</th>
                    <th className="py-3 px-3">Contacto</th>
                    <th className="py-3 px-3 text-center">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredExisting.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50/50 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-amber-900 whitespace-nowrap">
                        {item.certificate_folio}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {item.full_name}
                      </td>
                      <td className="py-3 px-3 font-mono whitespace-nowrap">
                        <span className="px-1.5 py-0.5 bg-slate-200 rounded text-[10px] font-bold text-slate-700 mr-1">
                          {item.doc_type}
                        </span>
                        {item.doc_number}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-900 break-all">
                        {item.intl_account_number}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{item.bank_name}</div>
                        <div className="text-slate-500 text-[11px]">{item.country_bank} {item.swift_bic ? `• ${item.swift_bic}` : ''}</div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="text-slate-800 font-medium">{item.phone}</div>
                        <div className="text-slate-500 text-[11px]">{item.email}</div>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => onViewCertificate({
                            title: 'Certificado de Actualización y Cuenta Internacional',
                            fullName: item.full_name,
                            docType: item.doc_type,
                            docNumber: item.doc_number,
                            email: item.email,
                            phone: item.phone,
                            intlAccount: item.intl_account_number,
                            bankName: `${item.bank_name} (${item.country_bank})`,
                            folio: item.certificate_folio,
                            issuedAt: item.created_at,
                            type: 'EXISTING_UPDATE',
                          })}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-800 hover:text-white hover:bg-amber-700 rounded border border-amber-400 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver Certificado</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'SQL' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-start justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm">Instrucciones para conectar Supabase en 1 Minuto</h4>
                <p className="text-xs text-emerald-800 mt-1">
                  1. Ve a tu panel en <a href="https://supabase.com" target="_blank" rel="noreferrer" className="underline font-bold">Supabase.com</a> &gt; Tu Proyecto &gt; SQL Editor.
                  <br />
                  2. Pega el script que ves a continuación y presiona <strong>RUN</strong>.
                  <br />
                  3. Crea un archivo <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono">.env</code> en la raíz del proyecto con tus credenciales:
                  <br />
                  <code className="block bg-slate-900 text-emerald-300 p-2 rounded mt-1 font-mono text-[11px]">
                    VITE_SUPABASE_URL=https://tu-proyecto.supabase.co<br />
                    VITE_SUPABASE_ANON_KEY=tu_clave_anon_publica
                  </code>
                </p>
              </div>

              <button
                onClick={handleCopySql}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL Completo'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs overflow-x-auto max-h-[420px] leading-relaxed border border-slate-800">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
