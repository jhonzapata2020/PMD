import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Globe2, 
  Search, 
  Download, 
  ShieldCheck, 
  Lock, 
  LogOut, 
  Database, 
  Copy, 
  Check, 
  RefreshCw,
  Eye,
  KeyRound,
  Printer,
  Gift,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Filter
} from 'lucide-react';
import { 
  fetchAllNewAssociates, 
  fetchAllExistingUpdates, 
  updateNewAssociateBenefit,
  updateExistingAssociateBenefit,
  isSupabaseConfigured,
  SUPABASE_SQL_SCHEMA,
  supabase
} from '../lib/supabase';
import type { NewAssociate, ExistingAssociateUpdate, CertificateData, BenefitStatus } from '../types';

interface AdminPanelProps {
  onViewCertificate: (certData: CertificateData) => void;
}

const BENEFIT_OPTIONS = [
  'Canasta de Alimentos Mensual',
  'Vivienda Digna y Mejoramiento',
  'Beca Educativa y Capacitación',
  'Salud y Medicamentos',
  'Proyectos Agroalimentarios / Agroindustriales',
  'Programa PYMES Productivas',
  'Compra de Fincas Campesinas',
  'Atención a Catástrofes / Víctimas',
  'Aporte Económico de Cooperación Internacional',
  'Otro'
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ onViewCertificate }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [activeTab, setActiveTab] = useState<'NEW' | 'EXISTING' | 'SQL' | 'REPORT'>('NEW');
  const [newAssociates, setNewAssociates] = useState<NewAssociate[]>([]);
  const [existingUpdates, setExistingUpdates] = useState<ExistingAssociateUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [benefitFilter, setBenefitFilter] = useState<'ALL' | 'DELIVERED' | 'IN_PROCESS' | 'PENDING'>('ALL');
  const [copiedSql, setCopiedSql] = useState(false);

  // Modal para editar/asignar beneficio
  const [editingTarget, setEditingTarget] = useState<{
    id: string;
    type: 'NEW' | 'EXISTING';
    name: string;
    docNumber: string;
    currentStatus?: BenefitStatus;
    currentType?: string;
    currentNotes?: string;
    currentDate?: string;
  } | null>(null);

  const [formStatus, setFormStatus] = useState<BenefitStatus>('PENDING');
  const [formType, setFormType] = useState(BENEFIT_OPTIONS[0]);
  const [formNotes, setFormNotes] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [savingBenefit, setSavingBenefit] = useState(false);

  useEffect(() => {
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
        // Fallback
      }
    }

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

  // Abrir modal para gestionar beneficio
  const handleOpenBenefitModal = (
    id: string,
    type: 'NEW' | 'EXISTING',
    name: string,
    docNumber: string,
    status?: BenefitStatus,
    bType?: string,
    notes?: string,
    bDate?: string
  ) => {
    setEditingTarget({
      id,
      type,
      name,
      docNumber,
      currentStatus: status,
      currentType: bType,
      currentNotes: notes,
      currentDate: bDate,
    });
    setFormStatus(status || 'PENDING');
    setFormType(bType || BENEFIT_OPTIONS[0]);
    setFormNotes(notes || '');
    setFormDate(bDate ? new Date(bDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));
  };

  const handleSaveBenefit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTarget) return;

    setSavingBenefit(true);
    try {
      const payload = {
        benefit_status: formStatus,
        benefit_type: formStatus === 'PENDING' ? '' : formType,
        benefit_notes: formNotes,
        benefit_date: formStatus === 'PENDING' ? '' : new Date(formDate).toISOString(),
      };

      if (editingTarget.type === 'NEW') {
        await updateNewAssociateBenefit(editingTarget.id, payload);
      } else {
        await updateExistingAssociateBenefit(editingTarget.id, payload);
      }

      await loadData();
      setEditingTarget(null);
    } catch (err) {
      console.error('Error guardando beneficio:', err);
    } finally {
      setSavingBenefit(false);
    }
  };

  const exportNewToCSV = () => {
    const headers = ['Folio', 'Nombres', 'Apellidos', 'Tipo Doc', 'Documento', 'Teléfono', 'Email', 'Departamento', 'Municipio', 'Dirección', 'Estado Beneficio', 'Beneficio Entregado', 'Fecha Beneficio', 'Notas Beneficio', 'Fecha Registro'];
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
      a.benefit_status || 'PENDING',
      `"${a.benefit_type || ''}"`,
      a.benefit_date ? new Date(a.benefit_date).toLocaleDateString('es-CO') : '',
      `"${a.benefit_notes || ''}"`,
      new Date(a.created_at).toLocaleString('es-CO')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Nuevos_Asociados_Beneficios_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExistingToCSV = () => {
    const headers = ['Folio', 'Nombre Completo', 'Tipo Doc', 'Documento', 'Teléfono', 'Email', 'Cuenta Internacional', 'Banco', 'País', 'SWIFT', 'Estado Beneficio', 'Beneficio Entregado', 'Fecha Beneficio', 'Notas Beneficio', 'Fecha Registro'];
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
      a.benefit_status || 'PENDING',
      `"${a.benefit_type || ''}"`,
      a.benefit_date ? new Date(a.benefit_date).toLocaleDateString('es-CO') : '',
      `"${a.benefit_notes || ''}"`,
      new Date(a.created_at).toLocaleString('es-CO')
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Cuentas_Internacionales_Beneficios_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Filtrado combinado (búsqueda y estado de beneficio)
  const filterByBenefit = (status?: BenefitStatus) => {
    if (benefitFilter === 'ALL') return true;
    if (benefitFilter === 'DELIVERED') return status === 'DELIVERED';
    if (benefitFilter === 'IN_PROCESS') return status === 'IN_PROCESS';
    if (benefitFilter === 'PENDING') return !status || status === 'PENDING';
    return true;
  };

  const filteredNew = newAssociates.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      item.first_name.toLowerCase().includes(q) ||
      item.last_name.toLowerCase().includes(q) ||
      item.doc_number.includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.municipality.toLowerCase().includes(q) ||
      item.certificate_folio.toLowerCase().includes(q) ||
      (item.benefit_type || '').toLowerCase().includes(q)
    );
    return matchesSearch && filterByBenefit(item.benefit_status);
  });

  const filteredExisting = existingUpdates.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (
      item.full_name.toLowerCase().includes(q) ||
      item.doc_number.includes(q) ||
      item.email.toLowerCase().includes(q) ||
      item.intl_account_number.toLowerCase().includes(q) ||
      item.bank_name.toLowerCase().includes(q) ||
      item.certificate_folio.toLowerCase().includes(q) ||
      (item.benefit_type || '').toLowerCase().includes(q)
    );
    return matchesSearch && filterByBenefit(item.benefit_status);
  });

  // Métricas de beneficios
  const totalBeneficiosEntregados = 
    newAssociates.filter(a => a.benefit_status === 'DELIVERED').length + 
    existingUpdates.filter(a => a.benefit_status === 'DELIVERED').length;

  const totalBeneficiosEnTramite = 
    newAssociates.filter(a => a.benefit_status === 'IN_PROCESS').length + 
    existingUpdates.filter(a => a.benefit_status === 'IN_PROCESS').length;

  const renderBenefitBadge = (status?: BenefitStatus, type?: string) => {
    if (status === 'DELIVERED') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Entregado: {type || 'Beneficio'}</span>
        </span>
      );
    }
    if (status === 'IN_PROCESS') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
          <Clock className="w-3.5 h-3.5 text-blue-600" />
          <span>En Trámite: {type || 'Postulado'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
        <AlertCircle className="w-3 h-3 text-slate-400" />
        <span>Sin beneficio asignado</span>
      </span>
    );
  };

  // Si no está autenticado, mostrar login
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
      <div className="bg-slate-900 px-6 py-4 text-white flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">Consola de Control y Gestión de Beneficios</h3>
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
            onClick={() => setActiveTab('REPORT')}
            className="px-3.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow flex items-center gap-1.5 transition-all"
            title="Generar e imprimir reporte oficial de asociados y ayudas"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Reporte Consolidado</span>
          </button>

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

      {/* Métricas Resumen con Control de Ayudas Entregadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-slate-50 border-b border-slate-200 no-print">
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
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">Beneficios Entregados</span>
            <span className="text-2xl font-black text-emerald-700">{totalBeneficiosEntregados}</span>
            <span className="text-[11px] text-slate-500 block font-medium">Ayudas ya canalizadas</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-semibold block uppercase">En Trámite / Proceso</span>
            <span className="text-2xl font-black text-indigo-700">{totalBeneficiosEnTramite}</span>
            <span className="text-[11px] text-slate-500 block font-medium">Postulaciones activas</span>
          </div>
        </div>
      </div>

      {/* Pestañas de Navegación, Búsqueda y Filtros */}
      <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 no-print">
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
            onClick={() => setActiveTab('REPORT')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'REPORT' 
                ? 'bg-white text-amber-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4 text-amber-600" />
            <span>Vista de Reporte Impreso</span>
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
            <span>Esquema SQL</span>
          </button>
        </div>

        {activeTab !== 'SQL' && activeTab !== 'REPORT' && (
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Filtro por estado de beneficio */}
            <div className="flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={benefitFilter}
                onChange={(e) => setBenefitFilter(e.target.value as any)}
                className="bg-transparent font-medium text-slate-700 outline-none text-xs cursor-pointer"
              >
                <option value="ALL">Todos los Beneficios</option>
                <option value="DELIVERED">✅ Entregados</option>
                <option value="IN_PROCESS">⏳ En Trámite</option>
                <option value="PENDING">📋 Pendientes</option>
              </select>
            </div>

            <div className="relative flex-1 sm:w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar nombre, cédula..."
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
                <span>Exportar CSV</span>
              </button>
            ) : (
              <button
                onClick={exportExistingToCSV}
                className="px-3.5 py-2 text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-colors shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar CSV</span>
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
                No se encontraron registros con los filtros seleccionados.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[11px] border-b border-slate-200">
                    <th className="py-3 px-3">Radicado / Folio</th>
                    <th className="py-3 px-3">Nombre Completo</th>
                    <th className="py-3 px-3">Documento</th>
                    <th className="py-3 px-3">Ubicación</th>
                    <th className="py-3 px-3">Estado de Beneficio / Ayuda</th>
                    <th className="py-3 px-3 text-center">Acciones</th>
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
                        <div className="text-[10px] text-slate-500 font-normal">{item.phone} • {item.email}</div>
                      </td>
                      <td className="py-3 px-3 font-mono whitespace-nowrap">
                        <span className="px-1.5 py-0.5 bg-slate-200 rounded text-[10px] font-bold text-slate-700 mr-1">
                          {item.doc_type}
                        </span>
                        {item.doc_number}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{item.municipality}, {item.department}</div>
                        <div className="text-slate-500 text-[10px] truncate max-w-[150px]">{item.address}</div>
                      </td>
                      <td className="py-3 px-3">
                        {renderBenefitBadge(item.benefit_status, item.benefit_type)}
                        {item.benefit_notes && (
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]" title={item.benefit_notes}>
                            Obs: {item.benefit_notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenBenefitModal(
                              item.id,
                              'NEW',
                              `${item.first_name} ${item.last_name}`,
                              item.doc_number,
                              item.benefit_status,
                              item.benefit_type,
                              item.benefit_notes,
                              item.benefit_date
                            )}
                            className="px-2 py-1 text-xs font-semibold text-amber-700 hover:text-white hover:bg-amber-600 rounded border border-amber-300 transition-colors inline-flex items-center gap-1"
                            title="Asignar o editar beneficio/ayuda recibida"
                          >
                            <Gift className="w-3 h-3" />
                            <span>Gestionar Beneficio</span>
                          </button>

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
                            className="px-2 py-1 text-xs font-semibold text-blue-700 hover:text-white hover:bg-blue-700 rounded border border-blue-300 transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Certificado</span>
                          </button>
                        </div>
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
                No se encontraron actualizaciones con los filtros seleccionados.
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold uppercase text-[11px] border-b border-slate-200">
                    <th className="py-3 px-3">Folio Radicado</th>
                    <th className="py-3 px-3">Asociado</th>
                    <th className="py-3 px-3">Documento</th>
                    <th className="py-3 px-3">Cuenta Internacional</th>
                    <th className="py-3 px-3">Estado de Beneficio / Recurso</th>
                    <th className="py-3 px-3 text-center">Acciones</th>
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
                        <div className="text-[10px] text-slate-500 font-normal">{item.phone} • {item.email}</div>
                      </td>
                      <td className="py-3 px-3 font-mono whitespace-nowrap">
                        <span className="px-1.5 py-0.5 bg-slate-200 rounded text-[10px] font-bold text-slate-700 mr-1">
                          {item.doc_type}
                        </span>
                        {item.doc_number}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-blue-900 text-xs">{item.intl_account_number}</div>
                        <div className="text-slate-500 text-[10px]">{item.bank_name} ({item.country_bank})</div>
                      </td>
                      <td className="py-3 px-3">
                        {renderBenefitBadge(item.benefit_status, item.benefit_type)}
                        {item.benefit_notes && (
                          <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[200px]" title={item.benefit_notes}>
                            Obs: {item.benefit_notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenBenefitModal(
                              item.id,
                              'EXISTING',
                              item.full_name,
                              item.doc_number,
                              item.benefit_status,
                              item.benefit_type,
                              item.benefit_notes,
                              item.benefit_date
                            )}
                            className="px-2 py-1 text-xs font-semibold text-amber-700 hover:text-white hover:bg-amber-600 rounded border border-amber-300 transition-colors inline-flex items-center gap-1"
                            title="Registrar o editar beneficio/recurso entregado"
                          >
                            <Gift className="w-3 h-3" />
                            <span>Gestionar Beneficio</span>
                          </button>

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
                            className="px-2 py-1 text-xs font-semibold text-amber-800 hover:text-white hover:bg-amber-700 rounded border border-amber-400 transition-colors inline-flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Certificado</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Pestaña: VISTA DE REPORTE OFICIAL IMPRIMIBLE */}
        {activeTab === 'REPORT' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-950 no-print">
              <div>
                <h4 className="font-bold text-sm">Vista Previa de Impresión Oficial</h4>
                <p className="text-xs text-amber-800">
                  Este reporte incluye todos los asociados registrados (nuevos y antiguos) con el estado de sus beneficios y ayudas.
                </p>
              </div>
              <button
                onClick={handlePrintReport}
                className="px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white font-bold rounded-lg text-xs flex items-center gap-2 shadow"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Mandar a Imprimir / Guardar en PDF</span>
              </button>
            </div>

            {/* Documento Imprimible */}
            <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-sm print:shadow-none print:border-none print:p-0">
              {/* Encabezado del Reporte */}
              <div className="flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-4">
                  <img src="/logo-pmd.png" alt="Grupo PMD SAS" className="h-16 w-auto" />
                  <div>
                    <h2 className="text-lg font-black text-slate-900 uppercase">
                      Grupo PMD SAS • NIT: 901262947-1
                    </h2>
                    <p className="text-xs font-bold text-blue-900">
                      PROGRAMA DE COOPERACIÓN INTERNACIONAL COLOMBIA
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Informe Oficial Consolidado de Asociados y Trazabilidad de Beneficios
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-slate-600">
                  <p><strong>Fecha de Emisión:</strong> {new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  <p><strong>Total Registros:</strong> {newAssociates.length + existingUpdates.length}</p>
                  <p><strong>Beneficios Entregados:</strong> {totalBeneficiosEntregados}</p>
                </div>
              </div>

              {/* Sección 1: Nuevos Asociados */}
              <div className="mb-8">
                <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 p-2 rounded mb-3 border-l-4 border-blue-800">
                  1. Listado de Nuevos Asociados Registrados ({newAssociates.length})
                </h3>
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-50 text-slate-900 font-bold">
                      <th className="py-2 px-2">Folio</th>
                      <th className="py-2 px-2">Nombre Completo</th>
                      <th className="py-2 px-2">Documento</th>
                      <th className="py-2 px-2">Teléfono</th>
                      <th className="py-2 px-2">Ubicación</th>
                      <th className="py-2 px-2">Estado Beneficio</th>
                      <th className="py-2 px-2">Ayuda / Recurso Entregado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {newAssociates.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-2 font-mono font-bold text-slate-800">{item.certificate_folio}</td>
                        <td className="py-2 px-2 font-semibold text-slate-900">{item.first_name} {item.last_name}</td>
                        <td className="py-2 px-2 font-mono">{item.doc_type} {item.doc_number}</td>
                        <td className="py-2 px-2">{item.phone}</td>
                        <td className="py-2 px-2">{item.municipality}, {item.department}</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.benefit_status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : item.benefit_status === 'IN_PROCESS' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                            {item.benefit_status === 'DELIVERED' ? 'ENTREGADO' : item.benefit_status === 'IN_PROCESS' ? 'EN TRÁMITE' : 'PENDIENTE'}
                          </span>
                        </td>
                        <td className="py-2 px-2 font-semibold text-blue-900">
                          {item.benefit_type || '—'}
                          {item.benefit_notes && <div className="text-[9px] text-slate-500 font-normal italic">Obs: {item.benefit_notes}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Sección 2: Asociados con Cuenta Internacional */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-800 p-2 rounded mb-3 border-l-4 border-amber-600">
                  2. Listado de Asociados Existentes y Cuentas Internacionales ({existingUpdates.length})
                </h3>
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-50 text-slate-900 font-bold">
                      <th className="py-2 px-2">Folio</th>
                      <th className="py-2 px-2">Nombre Completo</th>
                      <th className="py-2 px-2">Documento</th>
                      <th className="py-2 px-2">Cuenta Internacional (IBAN)</th>
                      <th className="py-2 px-2">Banco & País</th>
                      <th className="py-2 px-2">Estado Beneficio</th>
                      <th className="py-2 px-2">Ayuda / Recurso Asignado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {existingUpdates.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2 px-2 font-mono font-bold text-slate-800">{item.certificate_folio}</td>
                        <td className="py-2 px-2 font-semibold text-slate-900">{item.full_name}</td>
                        <td className="py-2 px-2 font-mono">{item.doc_type} {item.doc_number}</td>
                        <td className="py-2 px-2 font-mono text-[10px] font-bold text-blue-900">{item.intl_account_number}</td>
                        <td className="py-2 px-2">{item.bank_name} ({item.country_bank})</td>
                        <td className="py-2 px-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${item.benefit_status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' : item.benefit_status === 'IN_PROCESS' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'}`}>
                            {item.benefit_status === 'DELIVERED' ? 'ENTREGADO' : item.benefit_status === 'IN_PROCESS' ? 'EN TRÁMITE' : 'PENDIENTE'}
                          </span>
                        </td>
                        <td className="py-2 px-2 font-semibold text-amber-900">
                          {item.benefit_type || '—'}
                          {item.benefit_notes && <div className="text-[9px] text-slate-500 font-normal italic">Obs: {item.benefit_notes}</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pie de página del Reporte */}
              <div className="mt-8 pt-4 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500">
                <span>Certificación de auditoría institucional • GRUPO PMD SAS NIT: 901262947-1</span>
                <span>Página 1 de 1</span>
              </div>
            </div>
          </div>
        )}

        {/* Pestaña: SQL */}
        {activeTab === 'SQL' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 flex items-start justify-between gap-4">
              <div>
                <h4 className="font-bold text-sm">Actualización SQL de Tablas con Columnas de Beneficios</h4>
                <p className="text-xs text-emerald-800 mt-1">
                  Si ya corriste el script anterior en Supabase, simplemente copia este script y ejecútalo en el SQL Editor para añadir las columnas de beneficios y las políticas de UPDATE.
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

      {/* Modal para Asignar / Gestionar Beneficio */}
      {editingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in no-print">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Gift className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold">Gestionar Beneficio / Ayuda</h3>
                  <p className="text-xs text-blue-200">{editingTarget.name} • Doc: {editingTarget.docNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingTarget(null)}
                className="p-1 rounded text-blue-200 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBenefit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estado del Beneficio / Ayuda
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as BenefitStatus)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                >
                  <option value="DELIVERED">✅ Entregado / Ayuda Recibida</option>
                  <option value="IN_PROCESS">⏳ En Trámite / Postulación Activa</option>
                  <option value="PENDING">📋 Pendiente de Asignación</option>
                  <option value="NOT_ELIGIBLE">❌ No Aplica / Cancelado</option>
                </select>
              </div>

              {formStatus !== 'PENDING' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tipo de Beneficio o Programa Social Asignado
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    >
                      {BENEFIT_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Fecha de Entrega / Asignación
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observaciones / Acta de Entrega / Detalles
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej: Paquete alimentario #1 entregado, radicado de subsidio #4521, etc."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingTarget(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingBenefit}
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-800 hover:bg-blue-900 rounded-lg shadow flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span>{savingBenefit ? 'Guardando...' : 'Guardar Beneficio'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
