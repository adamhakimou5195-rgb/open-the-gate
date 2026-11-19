const PDFDocument = require('pdfkit');

/**
 * Generates an official PDF certificate for OPEN THE GATE
 * @param {Object} data { studentName, certificateId, cefrLevel, levelTitle, date, scorePercentage, skillsBreakdown }
 * @param {Stream} stream - Writable stream or response object
 */
function generateCertificatePDF(data, stream) {
  const doc = new PDFDocument({
    layout: 'landscape',
    size: 'A4',
    margin: 40
  });

  doc.pipe(stream);

  const {
    studentName = 'Étudiant Candidat',
    certificateId = 'OTG-2026-CERT',
    cefrLevel = 'B1',
    levelTitle = 'B1 - Niveau Intermédiaire',
    date = new Date().toLocaleDateString('fr-FR'),
    scorePercentage = 75,
    skillsBreakdown = { GRAMMAR: 75, VOCABULARY: 80, READING: 70, LISTENING: 75 }
  } = data;

  // Background and Border
  doc.rect(20, 20, 802, 555)
    .lineWidth(3)
    .strokeColor('#1E3A8A') // Deep Indigo / Navy
    .stroke();

  doc.rect(26, 26, 790, 543)
    .lineWidth(1)
    .strokeColor('#D97706') // Amber / Gold
    .stroke();

  // Header Brand
  doc.fontSize(22)
    .font('Helvetica-Bold')
    .fillColor('#1E3A8A')
    .text('OPEN THE GATE', 0, 55, { align: 'center', characterSpacing: 2 });

  doc.fontSize(11)
    .font('Helvetica')
    .fillColor('#4B5563')
    .text('ACADÉMIE DE FORMATION LINGUISTIQUE & CERTIFICATION INTERNATIONALE', 0, 85, { align: 'center', characterSpacing: 1 });

  // Certificate Title
  doc.moveDown(1.2);
  doc.fontSize(26)
    .font('Helvetica-Bold')
    .fillColor('#D97706')
    .text('ATTESTATION DE NIVEAU CECRL', { align: 'center' });

  doc.fontSize(12)
    .font('Helvetica-Oblique')
    .fillColor('#6B7280')
    .text('CERTIFICATE OF ENGLISH PROFICIENCY', { align: 'center' });

  // Body text
  doc.moveDown(1.5);
  doc.fontSize(13)
    .font('Helvetica')
    .fillColor('#374151')
    .text('Cette attestation certifie officiellement que', { align: 'center' });

  // Student Name
  doc.moveDown(0.6);
  doc.fontSize(24)
    .font('Helvetica-Bold')
    .fillColor('#1E3A8A')
    .text(studentName.toUpperCase(), { align: 'center' });

  // Test text
  doc.moveDown(0.5);
  doc.fontSize(12)
    .font('Helvetica')
    .fillColor('#374151')
    .text('a complété avec succès le test d\'évaluation officiel OPEN THE GATE selon le Cadre Européen Commun de Référence (CECRL).', { align: 'center' });

  // Level badge box
  const boxY = 275;
  doc.roundedRect(271, boxY, 300, 65, 8)
    .fillAndStroke('#EEF2FF', '#4338CA');

  doc.fontSize(22)
    .font('Helvetica-Bold')
    .fillColor('#4338CA')
    .text(`NIVEAU : ${cefrLevel}`, 271, boxY + 12, { width: 300, align: 'center' });

  doc.fontSize(11)
    .font('Helvetica')
    .fillColor('#374151')
    .text(levelTitle, 271, boxY + 40, { width: 300, align: 'center' });

  // Competency Breakdown Table
  const tableY = 365;
  doc.fontSize(11)
    .font('Helvetica-Bold')
    .fillColor('#1E3A8A')
    .text('DÉTAIL PAR COMPÉTENCE :', 100, tableY);

  const skills = [
    { label: 'Grammaire', val: skillsBreakdown.GRAMMAR ?? 0 },
    { label: 'Vocabulaire', val: skillsBreakdown.VOCABULARY ?? 0 },
    { label: 'Compréhension Écrite', val: skillsBreakdown.READING ?? 0 },
    { label: 'Compréhension Orale', val: skillsBreakdown.LISTENING ?? 0 }
  ];

  skills.forEach((s, idx) => {
    const xPos = 100 + idx * 165;
    doc.roundedRect(xPos, tableY + 20, 145, 45, 4)
      .fillAndStroke('#F9FAFB', '#E5E7EB');

    doc.fontSize(9)
      .font('Helvetica')
      .fillColor('#6B7280')
      .text(s.label, xPos + 8, tableY + 26);

    doc.fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#1E3A8A')
      .text(`${s.val}%`, xPos + 8, tableY + 42);
  });

  // Footer & Signatures
  const footerY = 470;
  doc.fontSize(10)
    .font('Helvetica')
    .fillColor('#4B5563')
    .text(`Date d'émission : ${date}`, 100, footerY);

  doc.fontSize(9)
    .fillColor('#9CA3AF')
    .text(`Identifiant Unique de Vérification : ${certificateId}`, 100, footerY + 16);

  doc.fontSize(9)
    .fillColor('#9CA3AF')
    .text('Vérifiable auprès de OPEN THE GATE Language Academy', 100, footerY + 30);

  // Signature Block
  doc.fontSize(10)
    .font('Helvetica-Bold')
    .fillColor('#1E3A8A')
    .text('Direction Pédagogique', 580, footerY);

  doc.fontSize(11)
    .font('Helvetica-Oblique')
    .fillColor('#D97706')
    .text('Open The Gate Academy', 580, footerY + 18);

  doc.fontSize(8)
    .font('Helvetica')
    .fillColor('#9CA3AF')
    .text('Signature & Cachet Numérique', 580, footerY + 34);

  doc.end();
}

module.exports = {
  generateCertificatePDF
};
