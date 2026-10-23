import React from 'react';
import { ShieldCheck, X, FileText, CheckCircle2 } from 'lucide-react';

interface HabeasDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const HabeasDataModal: React.FC<HabeasDataModalProps> = ({
  isOpen,
  onClose,
  onAccept,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Política de Protección de Datos Personales</h3>
              <p className="text-xs text-blue-200">Ley 1581 de 2012 y Decreto 1377 de 2013 • Colombia</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600 leading-relaxed">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-950 flex items-start gap-3">
            <FileText className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-900">Responsable del Tratamiento:</p>
              <p className="text-xs mt-1">
                <strong>GRUPO PMD SAS</strong> • NIT: <strong>901262947-1</strong> • Dirección de operaciones de cooperación internacional Colombia • Correo institucional: <a href="mailto:empresasmussa2000@gmail.com" className="underline text-blue-700">empresasmussa2000@gmail.com</a> • Contacto: <strong>320 674 8093</strong>.
              </p>
            </div>
          </div>

          <h4 className="font-bold text-slate-800 text-base">1. Marco Legal y Cumplimiento</h4>
          <p>
            En cumplimiento de lo dispuesto en la <strong>Ley Estatutaria 1581 de 2012</strong>, su Decreto Reglamentario 1377 de 2013 y demás normas concordantes, informamos que los datos personales suministrados a través de este formulario serán tratados de manera responsable, ética, confidencial y segura.
          </p>

          <h4 className="font-bold text-slate-800 text-base">2. Finalidades del Tratamiento de Datos</h4>
          <p>La información recolectada será utilizada única y exclusivamente para:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>Registro, validación de identidad y adscripción como asociado(a) del <strong>Programa de Cooperación Internacional Colombia</strong> operado por GRUPO PMD SAS.</li>
            <li>Gestión y canalización de recursos con cooperantes multilaterales, entidades filantrópicas internacionales (incluyendo King Salman Humanitarian y Banca Multilateral).</li>
            <li>Asignación de beneficios en programas sociales prioritarios: <strong>canasta de alimentos mensual, acceso a vivienda digna, brigadas de salud comunitaria, becas educativas, proyectos productivos agroalimentarios/agroindustriales, fortalecimiento de PYMES, empoderamiento campesino con adquisición de fincas y atención humanitaria por catástrofes naturales o conflicto armado</strong>.</li>
            <li>Actualización y verificación de información bancaria internacional para desembolsos o recepción de aportes/subsidios de cooperación.</li>
            <li>Envío de certificados de registro, radicados oficiales y comunicados institucionales.</li>
          </ul>

          <h4 className="font-bold text-slate-800 text-base">3. Derechos de los Titulares</h4>
          <p>
            Como titular de los datos personales, conforme al artículo 8 de la Ley 1581 de 2012, usted tiene derecho a:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li>Conocer, actualizar y rectificar sus datos personales frente a GRUPO PMD SAS.</li>
            <li>Solicitar prueba de la autorización otorgada.</li>
            <li>Ser informado respecto del uso que se le ha dado a sus datos personales.</li>
            <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).</li>
            <li>Revocar la autorización o solicitar la supresión del dato cuando no medie un deber legal o contractual.</li>
          </ul>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs">
            <strong>Canal de Atención al Ciudadano:</strong> Para ejercer sus derechos de consulta, actualización o revocatoria, puede enviar una solicitud formal a <strong>empresasmussa2000@gmail.com</strong> indicando su nombre completo y número de documento de identidad.
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            Al marcar la casilla, usted autoriza expresamente el tratamiento de sus datos.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cerrar
            </button>
            {onAccept && (
              <button
                onClick={() => {
                  onAccept();
                  onClose();
                }}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" /> Entendido y Aceptar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
