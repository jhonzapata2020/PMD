import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Home, 
  CheckCircle2, 
  HelpCircle,
  Loader2,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DEPARTAMENTOS_COLOMBIA } from '../data/colombiaData';
import { saveNewAssociate } from '../lib/supabase';
import type { CertificateData } from '../types';
import { HabeasDataModal } from './HabeasDataModal';

interface NewAssociateFormProps {
  onSuccess: (certData: CertificateData) => void;
}

export const NewAssociateForm: React.FC<NewAssociateFormProps> = ({ onSuccess }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [docType, setDocType] = useState<'CC' | 'PPT' | 'CE' | 'PASAPORTE'>('CC');
  const [docNumber, setDocNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedMuni, setSelectedMuni] = useState('');
  const [address, setAddress] = useState('');
  const [habeasData, setHabeasData] = useState(false);

  const [isHabeasModalOpen, setIsHabeasModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const departamentos = Object.keys(DEPARTAMENTOS_COLOMBIA);
  const municipios = selectedDept ? DEPARTAMENTOS_COLOMBIA[selectedDept] || [] : [];

  const handleDeptChange = (dept: string) => {
    setSelectedDept(dept);
    setSelectedMuni('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!habeasData) {
      setErrorMessage('Es indispensable autorizar el tratamiento de datos personales conforme a la Ley 1581 de 2012 para continuar.');
      return;
    }

    if (!firstName.trim() || !lastName.trim() || !docNumber.trim() || !phone.trim() || !email.trim()) {
      setErrorMessage('Por favor completa todos los campos requeridos marcados con asterisco (*).');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generar folio único para el certificado
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const folio = `PMD-COL-${new Date().getFullYear()}-${randomNum}`;

      const saved = await saveNewAssociate({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        doc_type: docType,
        doc_number: docNumber.trim(),
        phone: phone.trim(),
        email: email.trim(),
        department: selectedDept || 'Colombia',
        municipality: selectedMuni || 'N/A',
        address: address.trim(),
        habeas_data: habeasData,
        certificate_folio: folio,
      });

      // Disparar confeti de celebración
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0c2d57', '#0052cc', '#f59e0b', '#dc2626']
        });
      } catch (err) {
        // Fallback silencioso
      }

      // Preparar datos para el Certificado Oficial
      const certData: CertificateData = {
        title: 'Certificado de Registro en Programa Cooperación Internacional',
        fullName: `${saved.first_name} ${saved.last_name}`,
        docType: saved.doc_type,
        docNumber: saved.doc_number,
        email: saved.email,
        phone: saved.phone,
        location: `${saved.municipality}, ${saved.department} • ${saved.address}`,
        folio: saved.certificate_folio,
        issuedAt: saved.created_at,
        type: 'NEW_ASSOCIATE',
      };

      // Limpiar formulario y emitir certificado
      onSuccess(certData);
    } catch (err) {
      console.error(err);
      setErrorMessage('Ocurrió un error al procesar el registro. Por favor intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden card-hover">
      {/* Encabezado del Formulario */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 py-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Inscripción Oficial de Nuevos Beneficiarios</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          Formulario de Registro - Programa Cooperación Internacional
        </h3>
        <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-2xl">
          Grupo PMD SAS • Nit 901262947-1. Completa tus datos para emitir tu certificado digital de adscripción y acceder a los programas sociales.
        </p>
      </div>

      {/* Contenido del Formulario */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {errorMessage && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 text-red-800 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Sección: Datos Personales */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-blue-950 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            1. Datos de Identificación Personal
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombres Completos <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ej: Juan Carlos"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Apellidos Completos <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ej: Pérez Rodríguez"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Documento <span className="text-red-500">*</span>
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
              >
                <option value="CC">Cédula de Ciudadanía (CC)</option>
                <option value="PPT">Permiso por Protección Temporal (PPT)</option>
                <option value="CE">Cédula de Extranjería (CE)</option>
                <option value="PASAPORTE">Pasaporte Internacional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número de Documento <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Sin puntos ni guiones"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Datos de Contacto y Ubicación */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-blue-950 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            2. Contacto y Ubicación Territorial
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número Telefónico / Celular <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  placeholder="Ej: 320 674 8093"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Región / Departamento <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={selectedDept}
                onChange={(e) => handleDeptChange(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all"
              >
                <option value="">Selecciona un departamento...</option>
                {departamentos.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Municipio / Ciudad <span className="text-red-500">*</span>
              </label>
              <select
                required
                disabled={!selectedDept}
                value={selectedMuni}
                onChange={(e) => setSelectedMuni(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all disabled:opacity-50 disabled:bg-slate-100"
              >
                <option value="">
                  {selectedDept ? 'Selecciona un municipio...' : 'Primero selecciona el departamento'}
                </option>
                {municipios.map((muni) => (
                  <option key={muni} value={muni}>
                    {muni}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dirección de Residencia / Contacto <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Home className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Barrio, calle, carrera, número de casa o vereda"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Habeas Data interactivo */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="habeas_data_new"
              checked={habeasData}
              onChange={(e) => setHabeasData(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div className="text-xs text-slate-700 leading-normal">
              <label htmlFor="habeas_data_new" className="font-semibold text-slate-900 cursor-pointer">
                Autorizo de manera libre, previa y voluntaria el tratamiento de mis datos personales a GRUPO PMD SAS (NIT 901262947-1).
              </label>
              <p className="text-slate-600 mt-1">
                Declaro que los datos suministrados son verídicos y serán empleados exclusivamente para fines del Programa de Cooperación Internacional Colombia, asignación de beneficios sociales y emisión de mi certificado institucional, de conformidad con la <strong>Ley 1581 de 2012</strong>.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsHabeasModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-semibold underline underline-offset-2 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              ¿Qué es la Ley 1581 de 2012? Consulta los términos completos de Habeas Data aquí
            </button>
            <span className="text-[11px] text-slate-400">Protección garantizada</span>
          </div>
        </div>

        {/* Botón de Envío y Emisión del Certificado */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-blue-900 via-blue-700 to-blue-800 hover:from-blue-950 hover:to-blue-900 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Validando y Guardando Registro Oficial...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Guardar Registro y Emitir Certificado Oficial</span>
              </>
            )}
          </button>
          <p className="text-center text-xs text-slate-500 mt-2">
            Al hacer clic, se emitirá de inmediato tu Certificado de Adscripción listo para imprimir o descargar en PDF.
          </p>
        </div>
      </form>

      {/* Modal de Habeas Data */}
      <HabeasDataModal
        isOpen={isHabeasModalOpen}
        onClose={() => setIsHabeasModalOpen(false)}
        onAccept={() => setHabeasData(true)}
      />
    </div>
  );
};
