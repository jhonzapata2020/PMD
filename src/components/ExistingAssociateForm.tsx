import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  CreditCard, 
  Globe2, 
  Building, 
  Landmark, 
  CheckCircle2, 
  HelpCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { saveExistingAssociateUpdate } from '../lib/supabase';
import type { CertificateData } from '../types';
import { HabeasDataModal } from './HabeasDataModal';

interface ExistingAssociateFormProps {
  onSuccess: (certData: CertificateData) => void;
}

export const ExistingAssociateForm: React.FC<ExistingAssociateFormProps> = ({ onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [docType, setDocType] = useState<'CC' | 'PPT' | 'CE' | 'PASAPORTE'>('CC');
  const [docNumber, setDocNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [intlAccountNumber, setIntlAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [countryBank, setCountryBank] = useState('');
  const [swiftBic, setSwiftBic] = useState('');
  const [habeasData, setHabeasData] = useState(false);

  const [isHabeasModalOpen, setIsHabeasModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!habeasData) {
      setErrorMessage('Es indispensable autorizar el tratamiento de datos conforme a la Ley 1581 de 2012 para continuar.');
      return;
    }

    if (!fullName.trim() || !docNumber.trim() || !phone.trim() || !email.trim() || !intlAccountNumber.trim()) {
      setErrorMessage('Por favor completa todos los campos requeridos con asterisco (*).');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generar folio único para el certificado
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const folio = `PMD-INTL-${new Date().getFullYear()}-${randomNum}`;

      const saved = await saveExistingAssociateUpdate({
        full_name: fullName.trim(),
        doc_type: docType,
        doc_number: docNumber.trim(),
        phone: phone.trim(),
        email: email.trim(),
        intl_account_number: intlAccountNumber.trim(),
        bank_name: bankName.trim() || 'Entidad Bancaria Internacional',
        country_bank: countryBank.trim() || 'Internacional',
        swift_bic: swiftBic.trim().toUpperCase(),
        habeas_data: habeasData,
        certificate_folio: folio,
      });

      // Disparar confeti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#0c2d57', '#0052cc', '#f59e0b', '#dc2626']
        });
      } catch (err) {
        // Fallback
      }

      // Preparar datos para el Certificado Oficial
      const certData: CertificateData = {
        title: 'Certificado de Actualización y Registro de Cuenta Internacional',
        fullName: saved.full_name,
        docType: saved.doc_type,
        docNumber: saved.doc_number,
        email: saved.email,
        phone: saved.phone,
        intlAccount: saved.intl_account_number,
        bankName: `${saved.bank_name} (${saved.country_bank})`,
        folio: saved.certificate_folio,
        issuedAt: saved.created_at,
        type: 'EXISTING_UPDATE',
      };

      onSuccess(certData);
    } catch (err) {
      console.error(err);
      setErrorMessage('Ocurrió un error al actualizar los datos bancarios. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden card-hover">
      {/* Encabezado del Formulario */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 px-6 py-6 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl"></div>
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Globe2 className="w-4 h-4" />
          <span>Actualización de Asociados y Cuenta Internacional</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          Formulario para Asociados Existentes
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
          Actualiza tus datos de contacto y registra tu cuenta bancaria internacional para la gestión de recursos de cooperación internacional.
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
        {errorMessage && (
          <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg flex items-start gap-3 text-red-800 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Sección: Datos del Asociado Existente */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-blue-950 mb-3 flex items-center gap-2">
            <User className="w-4 h-4 text-blue-600" />
            1. Identificación del Asociado Existente
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombres y Apellidos Completos <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Nombres y apellidos tal como figuran en tu membresía"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
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
                Número de Documento de Identidad <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Número de cédula o PPT"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

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
                  placeholder="asociado@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Datos Bancarios Internacionales */}
        <div className="p-5 bg-blue-50/60 border border-blue-200/80 rounded-2xl">
          <h4 className="text-sm font-bold uppercase tracking-wider text-blue-950 mb-3 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-amber-600" />
            2. Información de Cuenta Internacional
          </h4>
          <p className="text-xs text-slate-600 mb-4">
            Ingresa tu número de cuenta en el exterior (IBAN, Routing Number o Número Internacional) para la canalización de recursos de cooperación internacional.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Número de Cuenta Internacional (IBAN / Cuenta Exterior) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="w-4 h-4 text-blue-600 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Ej: ES91 2100 0418 4502 0005 1332 o IBAN / Account #"
                  value={intlAccountNumber}
                  onChange={(e) => setIntlAccountNumber(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm font-mono bg-white border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de la Entidad Bancaria Internacional
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Ej: JPMorgan Chase, Santander, CaixaBank, BBVA"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                País de Radicación de la Cuenta
              </label>
              <div className="relative">
                <Globe2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Ej: Estados Unidos, España, Panamá, etc."
                  value={countryBank}
                  onChange={(e) => setCountryBank(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Código SWIFT / BIC (Opcional si aplica)
              </label>
              <input
                type="text"
                placeholder="Ej: BOFAUS3N, CHASUS33, BBVAESMM"
                value={swiftBic}
                onChange={(e) => setSwiftBic(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none transition-all uppercase placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Sección: Habeas Data */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="habeas_data_existing"
              checked={habeasData}
              onChange={(e) => setHabeasData(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div className="text-xs text-slate-700 leading-normal">
              <label htmlFor="habeas_data_existing" className="font-semibold text-slate-900 cursor-pointer">
                Autorizo a GRUPO PMD SAS el tratamiento de mis datos personales y financieros conforme a la Ley 1581 de 2012.
              </label>
              <p className="text-slate-600 mt-1">
                Confirmo que soy el titular legítimo de la cuenta internacional provista y autorizo su custodia bajo protocolos de seguridad internacional para la gestión de recursos de cooperación.
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

        {/* Botón de Enviar y Emitir Certificado */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 hover:from-black hover:to-blue-950 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50 text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Actualizando Información Bancaria...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Guardar Actualización y Emitir Certificado</span>
              </>
            )}
          </button>
          <p className="text-center text-xs text-slate-500 mt-2">
            Al guardar, se desplegará tu Certificado Oficial de Actualización bancaria y membresía.
          </p>
        </div>
      </form>

      {/* Modal Habeas Data */}
      <HabeasDataModal
        isOpen={isHabeasModalOpen}
        onClose={() => setIsHabeasModalOpen(false)}
        onAccept={() => setHabeasData(true)}
      />
    </div>
  );
};
