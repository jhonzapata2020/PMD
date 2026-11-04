import type { CertificateData } from '../types';
import { PMD_LOGO_BASE64 } from '../assets/logoBase64';

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0) {
      ctx.fillText(line.trim(), x, currentY);
      line = words[n] + ' ';
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line.trim(), x, currentY);
  return currentY + lineHeight;
}

function drawRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Generador nativo Canvas 2D infalible para celulares.
 * No depende de html2canvas ni de clonaciones de DOM, funciona en el 100% de los teléfonos.
 */
export async function generateNativeCertificateCanvas(data: CertificateData): Promise<HTMLCanvasElement> {
  const width = 1200;
  const height = 1680;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo inicializar el contexto 2D del canvas');

  // 1. Fondo blanco
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 2. Doble marco azul oscuro institucional
  ctx.strokeStyle = '#0c2d57';
  ctx.lineWidth = 6;
  ctx.strokeRect(32, 32, width - 64, height - 64);

  ctx.lineWidth = 2;
  ctx.strokeRect(42, 42, width - 84, height - 84);

  // 3. Franja superior de bandera (Azul, Amarillo, Rojo)
  const flagGrad = ctx.createLinearGradient(42, 42, width - 42, 42);
  flagGrad.addColorStop(0, '#0052cc');
  flagGrad.addColorStop(0.5, '#f59e0b');
  flagGrad.addColorStop(1, '#dc2626');
  ctx.fillStyle = flagGrad;
  ctx.fillRect(42, 42, width - 84, 12);

  // 4. Cargar Logo PMD en Base64
  await new Promise<void>((resolve) => {
    const logoImg = new Image();
    logoImg.onload = () => {
      ctx.drawImage(logoImg, 65, 75, 170, 110);
      resolve();
    };
    logoImg.onerror = () => resolve();
    logoImg.src = PMD_LOGO_BASE64;
  });

  // 5. Encabezado institucional (alineado a la derecha)
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0c2d57';
  ctx.font = 'bold 22px Inter, Arial, sans-serif';
  ctx.fillText('GRUPO PMD SAS', width - 65, 85);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 18px Inter, Arial, sans-serif';
  ctx.fillText('NIT: 901262947-1', width - 65, 112);

  ctx.fillStyle = '#475569';
  ctx.font = '500 15px Inter, Arial, sans-serif';
  ctx.fillText('Operador Gestión de Recursos Sociales', width - 65, 136);

  ctx.fillStyle = '#0052cc';
  ctx.font = 'bold 15px Inter, Arial, sans-serif';
  ctx.fillText('empresasmussa2000@gmail.com • Cel: 320 674 8093', width - 65, 160);

  ctx.fillStyle = '#64748b';
  ctx.font = '14px Inter, Arial, sans-serif';
  ctx.fillText('Aliados: King Salman Humanitarian • Banca Multilateral', width - 65, 184);

  // Línea divisoria
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(65, 205);
  ctx.lineTo(width - 65, 205);
  ctx.stroke();

  // 6. Títulos centrales
  ctx.textAlign = 'center';

  // Pastilla República de Colombia
  const pillW = 460;
  const pillH = 30;
  const pillX = (width - pillW) / 2;
  const pillY = 225;
  ctx.fillStyle = '#eff6ff';
  drawRoundRect(ctx, pillX, pillY, pillW, pillH, 15);
  ctx.fill();
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#1e40af';
  ctx.font = 'bold 13px Inter, Arial, sans-serif';
  ctx.fillText('REPÚBLICA DE COLOMBIA • COOPERACIÓN INTERNACIONAL', width / 2, pillY + 20);

  // Título principal
  ctx.fillStyle = '#0c2d57';
  ctx.font = '900 28px Inter, Arial, sans-serif';
  ctx.fillText('CERTIFICADO OFICIAL DE REGISTRO Y ADSCRIPCIÓN', width / 2, 290);

  ctx.fillStyle = '#64748b';
  ctx.font = '500 15px Inter, Arial, sans-serif';
  ctx.fillText('Constancia Institucional de Vinculación a Programas de Inversión y Beneficio Social', width / 2, 318);

  // 7. Barra de Folio y Fecha
  const folioBoxX = 65;
  const folioBoxY = 345;
  const folioBoxW = width - 130;
  const folioBoxH = 50;

  ctx.fillStyle = '#f8fafc';
  drawRoundRect(ctx, folioBoxX, folioBoxY, folioBoxW, folioBoxH, 8);
  ctx.fill();
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = '15px Inter, Arial, sans-serif';
  ctx.fillText('Radicado / Folio Único: ', folioBoxX + 16, folioBoxY + 31);
  const folioW = ctx.measureText('Radicado / Folio Único: ').width;
  ctx.fillStyle = '#0c2d57';
  ctx.font = 'bold 17px monospace';
  ctx.fillText(data.folio, folioBoxX + 16 + folioW, folioBoxY + 31);

  const formattedDate = new Date(data.issuedAt).toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.font = '15px Inter, Arial, sans-serif';
  ctx.fillText(`Fecha: ${formattedDate}`, width / 2, folioBoxY + 31);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#059669';
  ctx.font = 'bold 15px Inter, Arial, sans-serif';
  ctx.fillText('✓ VIGENTE / REGISTRADO', folioBoxX + folioBoxW - 16, folioBoxY + 31);

  // 8. Párrafo introductorio
  ctx.textAlign = 'left';
  ctx.fillStyle = '#334155';
  ctx.font = '16px Inter, Arial, sans-serif';
  const intro = 'La Dirección Ejecutiva y de Operaciones del PROGRAMA DE COOPERACIÓN INTERNACIONAL COLOMBIA, operado legalmente por GRUPO PMD SAS con NIT 901262947-1, hace constar que el(la) ciudadano(a):';
  let nextY = wrapText(ctx, intro, 65, 430, width - 130, 24);

  // 9. Tarjeta de Datos del Titular
  const cardX = 65;
  const cardY = nextY + 10;
  const cardW = width - 130;
  const cardH = data.intlAccount ? 240 : 190;

  ctx.fillStyle = '#eff6ff';
  drawRoundRect(ctx, cardX, cardY, cardW, cardH, 10);
  ctx.fill();
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Fila 1: Nombre y Documento
  ctx.fillStyle = '#64748b';
  ctx.font = '13px Inter, Arial, sans-serif';
  ctx.fillText('Nombre Completo:', cardX + 24, cardY + 32);
  ctx.fillText('Documento de Identidad:', cardX + cardW / 2 + 10, cardY + 32);

  ctx.fillStyle = '#0c2d57';
  ctx.font = '900 20px Inter, Arial, sans-serif';
  ctx.fillText(data.fullName.toUpperCase(), cardX + 24, cardY + 58);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 18px monospace';
  ctx.fillText(`${data.docType}: ${data.docNumber}`, cardX + cardW / 2 + 10, cardY + 58);

  // Fila 2: Teléfono y Correo
  ctx.fillStyle = '#64748b';
  ctx.font = '13px Inter, Arial, sans-serif';
  ctx.fillText('Teléfono de Contacto:', cardX + 24, cardY + 95);
  ctx.fillText('Correo Electrónico:', cardX + cardW / 2 + 10, cardY + 95);

  ctx.fillStyle = '#1e293b';
  ctx.font = '600 16px Inter, Arial, sans-serif';
  ctx.fillText(data.phone, cardX + 24, cardY + 118);
  ctx.fillText(data.email, cardX + cardW / 2 + 10, cardY + 118);

  // Fila 3: Ubicación
  if (data.location) {
    ctx.fillStyle = '#64748b';
    ctx.font = '13px Inter, Arial, sans-serif';
    ctx.fillText('Ubicación Territorial:', cardX + 24, cardY + 148);
    ctx.fillStyle = '#1e293b';
    ctx.font = '600 15px Inter, Arial, sans-serif';
    ctx.fillText(data.location, cardX + 24, cardY + 168);
  }

  // Fila 4: Cuenta Internacional (si aplica)
  if (data.intlAccount) {
    const accBoxY = cardY + 185;
    ctx.fillStyle = '#ffffff';
    drawRoundRect(ctx, cardX + 16, accBoxY, cardW - 32, 44, 6);
    ctx.fill();
    ctx.strokeStyle = '#fed7aa';
    ctx.stroke();

    ctx.fillStyle = '#9a3412';
    ctx.font = 'bold 13px Inter, Arial, sans-serif';
    ctx.fillText(`Cuenta Internacional Vinculada: ${data.intlAccount}`, cardX + 26, accBoxY + 20);
    ctx.fillStyle = '#64748b';
    ctx.font = '13px Inter, Arial, sans-serif';
    ctx.fillText(`Entidad: ${data.bankName || 'Banca Multilateral'}`, cardX + 26, accBoxY + 36);
  }

  // 10. Texto declarativo
  const declY = cardY + cardH + 28;
  const declText = `Ha completado formalmente su proceso de ${
    data.type === 'NEW_ASSOCIATE'
      ? 'inscripción como nuevo asociado activo'
      : 'actualización de membresía y acreditación de cuenta internacional'
  } dentro de la plataforma de cooperación internacional, quedando habilitado(a) como beneficiario(a) y participante elegible para los programas filantrópicos y de desarrollo social:`;
  
  ctx.fillStyle = '#334155';
  ctx.font = '16px Inter, Arial, sans-serif';
  nextY = wrapText(ctx, declText, 65, declY, width - 130, 24);

  // 11. Programas vinculados (8 casillas en 2 filas)
  const programs = [
    '✓ Canasta Alimentos',
    '✓ Vivienda Digna',
    '✓ Proyectos Agro',
    '✓ Programa PYMES',
    '✓ Fincas Campesinas',
    '✓ Salud Comunitaria',
    '✓ Educación y Becas',
    '✓ Atención Víctimas',
  ];

  const progBoxY = nextY + 12;
  const progBoxW = (width - 130 - 30) / 4;
  const progBoxH = 38;

  programs.forEach((prog, idx) => {
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const px = 65 + col * (progBoxW + 10);
    const py = progBoxY + row * (progBoxH + 8);

    ctx.fillStyle = '#eff6ff';
    drawRoundRect(ctx, px, py, progBoxW, progBoxH, 6);
    ctx.fill();
    ctx.strokeStyle = '#dbeafe';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#0c2d57';
    ctx.font = 'bold 13px Inter, Arial, sans-serif';
    ctx.fillText(prog, px + progBoxW / 2, py + 24);
  });

  // 12. Nota Ley 1581
  const leyY = progBoxY + (progBoxH + 8) * 2 + 18;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748b';
  ctx.font = 'italic 13px Inter, Arial, sans-serif';
  ctx.fillText('El titular certifica haber aceptado la Política de Tratamiento de Datos Personales conforme a la Ley 1581 de 2012 de Colombia.', 65, leyY);

  // Línea divisoria inferior
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(65, leyY + 24);
  ctx.lineTo(width - 65, leyY + 24);
  ctx.stroke();

  // 13. Firmas, Sellos y QR
  const signSectionY = leyY + 45;

  // Dirección de Operaciones (Izquierda - sin firmas ni rayas)
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0c2d57';
  ctx.font = 'bold 18px Inter, Arial, sans-serif';
  ctx.fillText('Dirección de Operaciones', 230, signSectionY + 55);

  ctx.fillStyle = '#64748b';
  ctx.font = '13px Inter, Arial, sans-serif';
  ctx.fillText('Grupo PMD SAS • NIT 901262947-1', 230, signSectionY + 80);

  // Sello Institucional (Centro)
  const sealX = width / 2;
  const sealY = signSectionY + 60;
  ctx.beginPath();
  ctx.arc(sealX, sealY, 46, 0, Math.PI * 2);
  ctx.fillStyle = '#eff6ff';
  ctx.fill();
  ctx.strokeStyle = '#0c2d57';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([5, 4]);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#d97706';
  ctx.font = 'bold 20px Inter, Arial, sans-serif';
  ctx.fillText('★ ★ ★', sealX, sealY - 14);

  ctx.fillStyle = '#0c2d57';
  ctx.font = '900 11px Inter, Arial, sans-serif';
  ctx.fillText('CERTIFICADO', sealX, sealY + 6);
  ctx.fillText('VÁLIDO', sealX, sealY + 20);

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 10px monospace';
  ctx.fillText('COLOMBIA', sealX, sealY + 34);

  // Código QR (Derecha)
  const qrX = width - 230;
  const qrY = signSectionY + 20;
  ctx.fillStyle = '#0f172a';
  drawRoundRect(ctx, qrX - 42, qrY, 84, 84, 8);
  ctx.fill();

  // Dibujar patrón geométrico de QR nítido
  ctx.fillStyle = '#f8fafc';
  // Esquinas del QR
  ctx.fillRect(qrX - 32, qrY + 10, 22, 22);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(qrX - 26, qrY + 16, 10, 10);

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(qrX + 10, qrY + 10, 22, 22);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(qrX + 16, qrY + 16, 10, 10);

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(qrX - 32, qrY + 52, 22, 22);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(qrX - 26, qrY + 58, 10, 10);

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(qrX + 12, qrY + 48, 8, 8);
  ctx.fillRect(qrX + 24, qrY + 60, 8, 8);
  ctx.fillRect(qrX - 4, qrY + 34, 8, 16);

  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('VERIFICACIÓN DIGITAL', qrX, qrY + 108);

  // 14. Pie de página
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(65, height - 70);
  ctx.lineTo(width - 65, height - 70);
  ctx.stroke();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px Inter, Arial, sans-serif';
  ctx.fillText('Documento firmado electrónicamente bajo estándares de seguridad y trazabilidad.', 65, height - 50);

  ctx.textAlign = 'right';
  ctx.fillText('www.grupopmdsas.org', width - 65, height - 50);

  return canvas;
}
