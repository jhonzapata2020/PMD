import React, { useRef, useState, useEffect } from 'react';
import type { CertificateData } from '../types';
import { 
  Download, 
  Printer, 
  X, 
  CheckCircle, 
  Award, 
  QrCode,
  Loader2,
  ZoomIn,
  ZoomOut,
  ArrowUp
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen || !data) return null;

  // Función de impresión infalible usando iframe aislado (sin páginas en blanco)
  const handlePrint = () => {
    const certificateEl = document.getElementById('official-certificate');
    if (!certificateEl) return;

    // Obtener o crear iframe oculto de impresión
    let printFrame = document.getElementById('pmd-print-frame') as HTMLIFrameElement;
    if (!printFrame) {
      printFrame = document.createElement('iframe');
      printFrame.id = 'pmd-print-frame';
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      document.body.appendChild(printFrame);
    }

    const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
    if (!frameDoc) return;

    frameDoc.open();
    frameDoc.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Certificado Oficial - ${data.fullName}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
        <style>
          @page {
            size: portrait;
            margin: 6mm;
          }
          * {
            box-sizing: border-box;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            margin: 0;
            padding: 0;
            background: #ffffff;
            display: flex;
            justify-content: center;
            align-items: flex-start;
          }
          #official-certificate {
            width: 100% !important;
            max-width: 720px !important;
            margin: 0 auto !important;
            box-shadow: none !important;
            border: 5px double #0c2d57 !important;
            padding: 24px 28px !important;
          }
        </style>
      </head>
      <body>
        ${certificateEl.outerHTML}
      </body>
      </html>
    `);
    frameDoc.close();

    // Tiempo prudente para cargar estilos e imagen antes de disparar la impresión
    setTimeout(() => {
      printFrame.contentWindow?.focus();
      printFrame.contentWindow?.print();
    }, 450);
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    setIsExporting(true);

    try {
      const originalTransform = certificateRef.current.style.transform;
      certificateRef.current.style.transform = 'none';

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('official-certificate');
          if (el) {
            el.style.transform = 'none';
            el.style.boxShadow = 'none';
          }
        }
      });

      certificateRef.current.style.transform = originalTransform;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));

      const cleanDoc = data.docNumber.replace(/\D/g, '') || 'asociado';
      pdf.save(`Certificado_PMD_SAS_${cleanDoc}.pdf`);
    } catch (error) {
      console.warn('Fallback a impresión directa para guardar como PDF:', error);
      handlePrint();
    } finally {
      setIsExporting(false);
    }
  };

  const scrollToTop = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const formattedDate = new Date(data.issuedAt).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div 
      ref={scrollContainerRef}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden p-2 sm:p-6 flex justify-center items-start"
      style={{ backgroundColor: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div 
        className="relative w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-2 sm:my-6"
        style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra Superior Fija (Sticky) */}
        <div 
          className="sticky top-0 z-50 px-4 sm:px-6 py-3.5 text-white flex flex-wrap items-center justify-between gap-3 shadow-md no-print"
          style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b' }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#34d399' }}></span>
              <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: '#10b981' }}></span>
            </span>
            <div>
              <span className="text-sm font-bold tracking-wide text-white block leading-tight">
                Certificado Oficial Emitido
              </span>
              <span className="text-[10px] font-mono" style={{ color: '#fbbf24' }}>
                Folio: {data.folio}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Controles de Zoom */}
            <div className="hidden sm:flex items-center rounded-lg p-0.5 mr-1" style={{ backgroundColor: '#1e293b', border: '1px solid #334155' }}>
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.65, prev - 0.1))}
                className="p-1 hover:text-white transition-colors"
                style={{ color: '#94a3b8' }}
                title="Alejar"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono px-1.5" style={{ color: '#e2e8f0' }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(1.15, prev + 0.1))}
                className="p-1 hover:text-white transition-colors"
                style={{ color: '#94a3b8' }}
                title="Acercar"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
              style={{ backgroundColor: '#1e293b', color: '#e2e8f0', border: '1px solid #334155' }}
              title="Imprimir documento oficial en papel o guardar en PDF"
            >
              <Printer className="w-3.5 h-3.5" style={{ color: '#f59e0b' }} />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-4 py-1.5 text-xs font-bold text-white rounded-lg shadow flex items-center gap-1.5 transition-all disabled:opacity-50"
              style={{ backgroundColor: '#0052cc' }}
              title="Descargar en PDF a tu dispositivo"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>Descargar PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors ml-1 hover:text-white"
              style={{ color: '#94a3b8' }}
              aria-label="Cerrar ventana"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenedor del Certificado */}
        <div 
          className="p-3 sm:p-8 flex justify-center items-start overflow-x-auto"
          style={{ backgroundColor: '#f1f5f9' }}
        >
          <div
            style={{ 
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
            className="w-full max-w-[740px]"
          >
            <div
              id="official-certificate"
              ref={certificateRef}
              style={{
                backgroundColor: '#ffffff',
                color: '#1e293b',
                border: '5px double #0c2d57',
                borderRadius: '10px',
                padding: '28px 32px',
                position: 'relative',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                boxSizing: 'border-box',
                width: '100%',
                maxWidth: '740px',
                margin: '0 auto'
              }}
            >
              {/* Franja de la Bandera Institucional */}
              <div 
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '7px',
                  background: 'linear-gradient(90deg, #0052cc 0%, #f59e0b 50%, #dc2626 100%)',
                  borderTopLeftRadius: '5px',
                  borderTopRightRadius: '5px'
                }}
              />

              {/* Encabezado con Logo y Datos Institucionales */}
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  borderBottom: '2px solid #e2e8f0',
                  paddingBottom: '14px',
                  marginTop: '4px',
                  gap: '14px',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                  <img
                    src="/logo-pmd.png"
                    alt="Grupo PMD SAS"
                    crossOrigin="anonymous"
                    style={{ height: '68px', width: 'auto', objectFit: 'contain' }}
                  />
                </div>

                <div 
                  style={{ 
                    textAlign: 'right', 
                    fontSize: '11px', 
                    color: '#475569', 
                    lineHeight: '1.35',
                    flexShrink: 0,
                    maxWidth: '300px',
                    boxSizing: 'border-box'
                  }}
                >
                  <p style={{ fontWeight: 900, color: '#0c2d57', textTransform: 'uppercase', fontSize: '12px', margin: 0 }}>
                    GRUPO PMD SAS
                  </p>
                  <p style={{ fontWeight: 800, color: '#1e293b', margin: '2px 0', fontSize: '11px' }}>
                    NIT: 901262947-1
                  </p>
                  <p style={{ margin: 0, fontSize: '10px' }}>Operador Gestión de Recursos Sociales</p>
                  <p style={{ color: '#0052cc', fontWeight: 700, margin: '2px 0', fontSize: '10px', wordBreak: 'break-all' }}>
                    empresasmussa2000@gmail.com • Cel: 320 674 8093
                  </p>
                  <p style={{ color: '#64748b', fontSize: '9px', margin: 0 }}>
                    Aliados: King Salman Humanitarian • Banca Multilateral
                  </p>
                </div>
              </div>

              {/* Título Central */}
              <div style={{ textAlign: 'center', margin: '18px 0 14px 0' }}>
                <span 
                  style={{
                    display: 'inline-block',
                    padding: '2px 10px',
                    backgroundColor: '#eff6ff',
                    color: '#1e40af',
                    fontSize: '9px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    borderRadius: '9999px',
                    border: '1px solid #bfdbfe',
                    marginBottom: '6px'
                  }}
                >
                  República de Colombia • Cooperación Internacional
                </span>
                <h2 style={{ fontSize: '19px', fontWeight: 900, color: '#0c2d57', textTransform: 'uppercase', margin: '2px 0', letterSpacing: '-0.3px' }}>
                  Certificado Oficial de Registro y Adscripción
                </h2>
                <p style={{ fontSize: '10px', color: '#64748b', fontWeight: 500, margin: 0 }}>
                  Constancia Institucional de Vinculación a Programas de Inversión y Beneficio Social
                </p>
              </div>

              {/* Folio y Radicado Box */}
              <div 
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '10.5px',
                  gap: '8px',
                  marginBottom: '16px',
                  boxSizing: 'border-box'
                }}
              >
                <div>
                  <span style={{ color: '#64748b' }}>Radicado / Folio Único: </span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0c2d57', fontSize: '11.5px' }}>
                    {data.folio}
                  </span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Fecha: </span>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{formattedDate}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 700 }}>
                  <CheckCircle className="w-3 h-3" style={{ color: '#059669' }} />
                  <span>VIGENTE / REGISTRADO</span>
                </div>
              </div>

              {/* Contenido Declarativo */}
              <div style={{ fontSize: '11.5px', color: '#334155', lineHeight: '1.55', textAlign: 'justify', marginBottom: '16px' }}>
                <p style={{ margin: '0 0 8px 0' }}>
                  La Dirección Ejecutiva y de Operaciones del <strong>PROGRAMA DE COOPERACIÓN INTERNACIONAL COLOMBIA</strong>, operado legalmente por <strong>GRUPO PMD SAS</strong> con NIT <strong>901262947-1</strong>, hace constar que el(la) ciudadano(a):
                </p>

                {/* Tarjeta de Datos del Titular */}
                <div 
                  style={{
                    background: 'linear-gradient(90deg, #eff6ff 0%, #f8fafc 100%)',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '12px',
                    margin: '10px 0',
                    color: '#0f172a',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '10.5px' }}>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '9.5px', display: 'block' }}>Nombre Completo:</span>
                      <span style={{ fontWeight: 800, color: '#0c2d57', fontSize: '12px', textTransform: 'uppercase' }}>
                        {data.fullName}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '9.5px', display: 'block' }}>Documento de Identidad:</span>
                      <span style={{ fontWeight: 700, color: '#1e293b', fontFamily: 'monospace' }}>
                        {data.docType}: {data.docNumber}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '9.5px', display: 'block' }}>Teléfono de Contacto:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b' }}>{data.phone}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '9.5px', display: 'block' }}>Correo Electrónico:</span>
                      <span style={{ fontWeight: 600, color: '#1e293b', wordBreak: 'break-all' }}>{data.email}</span>
                    </div>
                    {data.location && (
                      <div style={{ gridColumn: 'span 2' }}>
                        <span style={{ color: '#64748b', fontSize: '9.5px', display: 'block' }}>Ubicación Territorial:</span>
                        <span style={{ fontWeight: 600, color: '#1e293b' }}>{data.location}</span>
                      </div>
                    )}
                    {data.intlAccount && (
                      <div style={{ gridColumn: 'span 2', backgroundColor: '#ffffff', padding: '6px 8px', borderRadius: '4px', border: '1px solid #fed7aa' }}>
                        <span style={{ color: '#9a3412', fontWeight: 700, fontSize: '9.5px', display: 'block' }}>Cuenta Internacional Vinculada:</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#0c2d57', fontSize: '11px' }}>{data.intlAccount}</span>
                        <span style={{ fontSize: '9.5px', color: '#64748b', display: 'block' }}>Entidad: {data.bankName || 'Banca Internacional'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <p style={{ margin: '8px 0' }}>
                  Ha completado formalmente su proceso de <strong>
                    {data.type === 'NEW_ASSOCIATE' ? 'inscripción como nuevo asociado activo' : 'actualización de membresía y acreditación de cuenta internacional'}
                  </strong> dentro de la plataforma de cooperación internacional, quedando habilitado(a) como beneficiario(a) y participante elegible para los programas filantrópicos y de desarrollo social:
                </p>

                {/* Programas sociales vinculados */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', fontSize: '8.5px', fontWeight: 600, color: '#0c2d57', margin: '6px 0' }}>
                  <span style={{ padding: '3px 5px', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1px solid #dbeafe' }}>✓ Canasta Alimentos</span>
                  <span style={{ padding: '3px 5px', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1px solid #dbeafe' }}>✓ Vivienda Digna</span>
                  <span style={{ padding: '3px 5px', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1px solid #dbeafe' }}>✓ Proyectos Agro</span>
                  <span style={{ padding: '3px 5px', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1px solid #dbeafe' }}>✓ Programa PYMES</span>
                  <span style={{ padding: '3px 5px', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1px solid #dbeafe' }}>✓ Fincas Campesinas</span>
                  <span style={{ padding: '3px 5px', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1px solid #dbeafe' }}>✓ Salud Comunitaria</span>
                  <span style={{ padding: '3px 5px', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1px solid #dbeafe' }}>✓ Educación y Becas</span>
                  <span style={{ padding: '3px 5px', backgroundColor: '#eff6ff', borderRadius: '4px', border: '1px solid #dbeafe' }}>✓ Atención Víctimas</span>
                </div>

                <p style={{ fontSize: '9.5px', color: '#64748b', fontStyle: 'italic', margin: '6px 0 0 0' }}>
                  El titular certifica haber aceptado la Política de Tratamiento de Datos Personales conforme a la <strong>Ley 1581 de 2012</strong> de Colombia.
                </p>
              </div>

              {/* Firmas y Sellos */}
              <div 
                style={{
                  borderTop: '2px solid #e2e8f0',
                  paddingTop: '12px',
                  marginTop: '12px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                {/* Firma */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', color: '#0c2d57', fontSize: '17px', fontWeight: 800 }}>
                      J. Zapata M.
                    </span>
                  </div>
                  <div style={{ borderTop: '1px solid #94a3b8', paddingTop: '3px' }}>
                    <p style={{ fontSize: '9.5px', fontWeight: 700, color: '#1e293b', margin: 0 }}>Dirección de Operaciones</p>
                    <p style={{ fontSize: '7.5px', color: '#64748b', margin: 0 }}>Grupo PMD SAS • NIT 901262947-1</p>
                  </div>
                </div>

                {/* Sello */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <div 
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      border: '2px dashed #0c2d57',
                      backgroundColor: '#eff6ff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '2px'
                    }}
                  >
                    <Award className="w-3.5 h-3.5" style={{ color: '#d97706' }} />
                    <span style={{ fontSize: '5.5px', fontWeight: 900, color: '#0c2d57', textTransform: 'uppercase', lineHeight: '1', marginTop: '1px' }}>
                      CERTIFICADO VÁLIDO
                    </span>
                    <span style={{ fontSize: '5px', color: '#475569', fontFamily: 'monospace' }}>COLOMBIA</span>
                  </div>
                </div>

                {/* Código QR */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <div 
                    style={{
                      width: '48px',
                      height: '48px',
                      backgroundColor: '#0f172a',
                      borderRadius: '4px',
                      padding: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <QrCode className="w-9 h-9" style={{ color: '#f8fafc' }} />
                  </div>
                  <p style={{ fontSize: '6.5px', fontFamily: 'monospace', color: '#64748b', margin: '3px 0 0 0', textTransform: 'uppercase' }}>
                    Verificación Digital
                  </p>
                </div>
              </div>

              {/* Pie de página inferior */}
              <div 
                style={{
                  marginTop: '12px',
                  paddingTop: '6px',
                  borderTop: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '7.5px',
                  color: '#94a3b8'
                }}
              >
                <span>Documento firmado electrónicamente bajo estándares de seguridad y trazabilidad.</span>
                <span>www.grupopmdsas.org</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra Inferior Fija (Sticky) */}
        <div 
          className="sticky bottom-0 z-50 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg no-print"
          style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}
        >
          <div className="flex items-center gap-2 text-xs" style={{ color: '#475569' }}>
            <button
              onClick={scrollToTop}
              className="p-1.5 rounded-lg transition-colors flex items-center gap-1"
              style={{ backgroundColor: '#f1f5f9', color: '#334155' }}
              title="Volver arriba"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">Subir al Inicio</span>
            </button>
            <span className="hidden sm:inline" style={{ color: '#cbd5e1' }}>|</span>
            <span className="hidden sm:inline">Desplaza hacia abajo para ver firmas y QR.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
              style={{ backgroundColor: '#ffffff', color: '#334155', border: '1px solid #cbd5e1' }}
            >
              <Printer className="w-4 h-4" style={{ color: '#f59e0b' }} />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-6 py-2.5 text-xs font-black text-white rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: '#0052cc' }}
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generando PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>Descargar Certificado en PDF</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl transition-colors"
              style={{ color: '#475569', backgroundColor: '#f1f5f9' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
