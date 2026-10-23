import React, { useRef, useState } from 'react';
import type { CertificateData } from '../types';
import { 
  Download, 
  Printer, 
  X, 
  CheckCircle, 
  Award, 
  FileCheck,
  QrCode,
  Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface CertificateModalProps {
  data: CertificateData | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  data,
  isOpen,
  onClose,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen || !data) return null;

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);

    try {
      // Opciones de renderizado de alta calidad
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2.5,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width en mm
      const pageHeight = 297; // A4 height en mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      const cleanDoc = data.docNumber.replace(/\D/g, '') || 'asociado';
      const fileName = `Certificado_PMD_SAS_${cleanDoc}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Hubo un inconveniente al generar el PDF. Puedes usar el botón de Imprimir para guardarlo como PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(data.issuedAt).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de Acciones Superior */}
        <div className="bg-slate-900 px-4 sm:px-6 py-3 text-white flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-semibold tracking-wide text-slate-200">
              Certificado Oficial Emitido Exitosamente
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Imprimir documento"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Descargar en PDF a tu dispositivo"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenedor del Certificado (Apto para Captura y Print) */}
        <div className="p-3 sm:p-6 bg-slate-100 overflow-x-auto flex justify-center">
          <div
            id="official-certificate"
            ref={certificateRef}
            className="w-full max-w-[760px] bg-white p-6 sm:p-10 rounded-xl shadow-lg border-[6px] border-double border-blue-900 relative text-slate-800 font-sans"
          >
            {/* Adorno perimetral con los 3 colores institucionales */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-700 via-amber-400 to-red-600"></div>

            {/* Encabezado con Logo Oficial */}
            <div className="flex flex-col sm:flex-row items-center justify-between border-b-2 border-slate-200 pb-5 gap-4">
              <div className="flex items-center gap-3">
                <img
                  src="/logo-pmd.png"
                  alt="Programa Cooperación Internacional - Grupo PMD SAS"
                  className="h-20 w-auto object-contain"
                />
              </div>

              <div className="text-center sm:text-right text-xs text-slate-600 space-y-0.5">
                <p className="font-extrabold text-blue-950 uppercase tracking-wider text-sm">
                  GRUPO PMD SAS
                </p>
                <p className="font-semibold text-slate-700">NIT: 901262947-1</p>
                <p>Operador Gestión de Recursos Sociales</p>
                <p className="text-[11px] text-blue-800">empresasmussa2000@gmail.com • Cel: 320 674 8093</p>
                <p className="text-[10px] text-slate-500 font-mono">Aliados: King Salman Humanitarian • Banca Multilateral</p>
              </div>
            </div>

            {/* Título Principal Solemne */}
            <div className="text-center my-6">
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-900 text-[11px] font-bold uppercase tracking-widest rounded-full border border-blue-200 mb-2">
                República de Colombia • Cooperación Internacional
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-blue-950 uppercase tracking-tight">
                Certificado Oficial de Registro y Adscripción
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Constancia Institucional de Vinculación a Programas de Inversión y Beneficio Social
              </p>
            </div>

            {/* Folio y Radicado */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-wrap items-center justify-between text-xs gap-2 mb-6">
              <div>
                <span className="text-slate-500">Radicado / Folio Único: </span>
                <span className="font-mono font-bold text-blue-900 text-sm">{data.folio}</span>
              </div>
              <div>
                <span className="text-slate-500">Fecha de Expedición: </span>
                <span className="font-semibold text-slate-700">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>ESTADO: VIGENTE / REGISTRADO</span>
              </div>
            </div>

            {/* Cuerpo del Certificado */}
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed text-justify space-y-3 mb-6">
              <p>
                La Dirección Ejecutiva y de Operaciones del <strong>PROGRAMA DE COOPERACIÓN INTERNACIONAL COLOMBIA</strong>, operado legalmente por <strong>GRUPO PMD SAS</strong> con NIT <strong>901262947-1</strong>, hace constar que el(la) ciudadano(a):
              </p>

              {/* Tarjeta de Datos del Titular */}
              <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-amber-50/40 border border-blue-200/80 rounded-xl p-4 my-2 text-slate-900">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Nombre Completo del Asociado(a):</span>
                    <span className="font-bold text-base text-blue-950 uppercase">{data.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Documento de Identidad:</span>
                    <span className="font-bold text-slate-800 text-sm font-mono">{data.docType}: {data.docNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Teléfono de Contacto:</span>
                    <span className="font-semibold text-slate-800">{data.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Correo Electrónico Registrado:</span>
                    <span className="font-semibold text-slate-800 break-all">{data.email}</span>
                  </div>
                  {data.location && (
                    <div className="sm:col-span-2">
                      <span className="text-slate-500 block text-[11px]">Ubicación Territorial:</span>
                      <span className="font-semibold text-slate-800">{data.location}</span>
                    </div>
                  )}
                  {data.intlAccount && (
                    <div className="sm:col-span-2 bg-white/90 p-2.5 rounded-lg border border-amber-200">
                      <span className="text-amber-800 font-bold block text-[11px]">Cuenta Internacional Vinculada:</span>
                      <span className="font-mono text-xs font-semibold text-slate-900 block">{data.intlAccount}</span>
                      <span className="text-[11px] text-slate-600">Entidad: {data.bankName || 'Banca Internacional'}</span>
                    </div>
                  )}
                </div>
              </div>

              <p>
                Ha completado formalmente su proceso de <strong>
                  {data.type === 'NEW_ASSOCIATE' ? 'inscripción como nuevo asociado activo' : 'actualización de membresía y acreditación de cuenta internacional'}
                </strong> dentro de la plataforma de cooperación internacional, quedando habilitado(a) como beneficiario(a) y participante elegible para los programas filantrópicos y de desarrollo social:
              </p>

              {/* Programas sociales vinculados */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] text-blue-950 font-medium py-1">
                <span className="p-1.5 bg-blue-50/80 rounded border border-blue-100 flex items-center gap-1">
                  ✓ Canasta Alimentos
                </span>
                <span className="p-1.5 bg-blue-50/80 rounded border border-blue-100 flex items-center gap-1">
                  ✓ Vivienda Digna
                </span>
                <span className="p-1.5 bg-blue-50/80 rounded border border-blue-100 flex items-center gap-1">
                  ✓ Proyectos Agro
                </span>
                <span className="p-1.5 bg-blue-50/80 rounded border border-blue-100 flex items-center gap-1">
                  ✓ Programa PYMES
                </span>
                <span className="p-1.5 bg-blue-50/80 rounded border border-blue-100 flex items-center gap-1">
                  ✓ Fincas Campesinas
                </span>
                <span className="p-1.5 bg-blue-50/80 rounded border border-blue-100 flex items-center gap-1">
                  ✓ Salud Comunitaria
                </span>
                <span className="p-1.5 bg-blue-50/80 rounded border border-blue-100 flex items-center gap-1">
                  ✓ Educación y Becas
                </span>
                <span className="p-1.5 bg-blue-50/80 rounded border border-blue-100 flex items-center gap-1">
                  ✓ Atención Víctimas
                </span>
              </div>

              <p className="text-[11px] text-slate-500 italic">
                El titular certifica haber aceptado la Política de Tratamiento de Datos Personales conforme a la <strong>Ley 1581 de 2012</strong> de Colombia.
              </p>
            </div>

            {/* Firmas y Sellos */}
            <div className="border-t-2 border-slate-200 pt-5 mt-4 grid grid-cols-3 items-center gap-4">
              {/* Firma 1 */}
              <div className="text-center">
                <div className="h-10 flex items-center justify-center">
                  <span className="font-serif italic text-blue-900 text-lg font-bold tracking-wider">
                    J. Zapata M.
                  </span>
                </div>
                <div className="border-t border-slate-400 pt-1">
                  <p className="text-[11px] font-bold text-slate-800">Dirección de Operaciones</p>
                  <p className="text-[9px] text-slate-500">Grupo PMD SAS • NIT 901262947-1</p>
                </div>
              </div>

              {/* Sello Central Institucional */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-900 bg-blue-50/60 flex flex-col items-center justify-center p-1 text-center shadow-inner">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span className="text-[7px] font-black text-blue-950 uppercase tracking-tighter leading-tight mt-0.5">
                    CERTIFICADO VÁLIDO
                  </span>
                  <span className="text-[6px] text-slate-600 font-mono">COLOMBIA</span>
                </div>
              </div>

              {/* Código QR de Validación */}
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-slate-900 text-white rounded p-1 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-slate-100" />
                </div>
                <p className="text-[8px] font-mono text-slate-500 mt-1 uppercase">
                  Verificación Digital
                </p>
              </div>
            </div>

            {/* Pie de página con franja inferior */}
            <div className="mt-6 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
              <span>Documento firmado electrónicamente bajo estándares de seguridad y trazabilidad.</span>
              <span>www.grupopmdsas.org</span>
            </div>
          </div>
        </div>

        {/* Footer con recordatorio amigable */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2 no-print">
          <p className="flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            Conserva este certificado como soporte oficial de registro en Colombia.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-700 hover:text-slate-950 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Aceptar y Continuar
          </button>
        </div>
      </div>
    </div>
  );
};
