import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import QRCode from 'qrcode';

export interface PDFCertificateData {
  certificateId: string;
  studentName: string;
  course: string;
  institutionName: string;
  issueDate: string;
  grade?: string;
  certificateHash: string;
  digitalSignature: string;
  verificationUrl: string;
}

export async function generateCertificatePDF(data: PDFCertificateData): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([842, 595]); // Landscape A4 size (842 x 595 pt)

  const fontHelvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontHelveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontTimesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  // Background Dark Navy Frame
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 842,
    height: 595,
    color: rgb(0.04, 0.06, 0.13), // Deep Navy
  });

  // Border Gold Accent
  page.drawRectangle({
    x: 20,
    y: 20,
    width: 802,
    height: 555,
    borderColor: rgb(0.85, 0.72, 0.42), // Gold
    borderWidth: 2,
  });

  page.drawRectangle({
    x: 28,
    y: 28,
    width: 786,
    height: 539,
    borderColor: rgb(0.38, 0.40, 0.94), // Indigo
    borderWidth: 1,
  });

  // Institution Name
  page.drawText(data.institutionName.toUpperCase(), {
    x: 60,
    y: 520,
    size: 20,
    font: fontHelveticaBold,
    color: rgb(0.95, 0.95, 0.98),
  });

  page.drawText('OFFICIAL BLOCKCHAIN VERIFIABLE CREDENTIAL', {
    x: 60,
    y: 500,
    size: 9,
    font: fontHelvetica,
    color: rgb(0.65, 0.70, 0.85),
  });

  // Certificate Header
  page.drawText('CERTIFICATE OF COMPLETION', {
    x: 60,
    y: 430,
    size: 28,
    font: fontTimesBold,
    color: rgb(0.85, 0.72, 0.42), // Gold
  });

  page.drawText('THIS CERTIFICATE IS PROUDLY PRESENTED TO', {
    x: 60,
    y: 380,
    size: 11,
    font: fontHelvetica,
    color: rgb(0.70, 0.75, 0.85),
  });

  // Student Name
  page.drawText(data.studentName, {
    x: 60,
    y: 335,
    size: 32,
    font: fontHelveticaBold,
    color: rgb(1, 1, 1),
  });

  // Achievement / Course
  page.drawText(`for successfully fulfilling all requirements for`, {
    x: 60,
    y: 295,
    size: 12,
    font: fontHelvetica,
    color: rgb(0.75, 0.80, 0.90),
  });

  page.drawText(data.course, {
    x: 60,
    y: 265,
    size: 20,
    font: fontHelveticaBold,
    color: rgb(0.40, 0.60, 1.0), // Electric Blue
  });

  if (data.grade) {
    page.drawText(`Grade / Honor: ${data.grade}`, {
      x: 60,
      y: 240,
      size: 12,
      font: fontHelvetica,
      color: rgb(0.85, 0.72, 0.42),
    });
  }

  // Issue Date & Certificate ID
  page.drawText(`Date of Issuance: ${data.issueDate}`, {
    x: 60,
    y: 190,
    size: 11,
    font: fontHelvetica,
    color: rgb(0.80, 0.85, 0.95),
  });

  page.drawText(`Certificate ID: ${data.certificateId}`, {
    x: 60,
    y: 170,
    size: 12,
    font: fontHelveticaBold,
    color: rgb(0.9, 0.9, 1.0),
  });

  // Cryptographic Hashes & Signatures footer
  page.drawText(`SHA-256 Hash: ${data.certificateHash.substring(0, 48)}...`, {
    x: 60,
    y: 115,
    size: 8,
    font: fontHelvetica,
    color: rgb(0.50, 0.55, 0.70),
  });

  page.drawText(`Digital Sig: ${data.digitalSignature.substring(0, 48)}...`, {
    x: 60,
    y: 100,
    size: 8,
    font: fontHelvetica,
    color: rgb(0.50, 0.55, 0.70),
  });

  page.drawText(`Verify at: ${data.verificationUrl}`, {
    x: 60,
    y: 85,
    size: 9,
    font: fontHelveticaBold,
    color: rgb(0.38, 0.40, 0.94),
  });

  // Generate QR Code PNG Buffer
  const qrDataUrl = await QRCode.toDataURL(data.verificationUrl, {
    margin: 1,
    width: 140,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });

  const qrImageBytes = Buffer.from(qrDataUrl.split(',')[1], 'base64');
  const qrImage = await pdfDoc.embedPng(qrImageBytes);

  // Draw QR code on bottom right
  page.drawImage(qrImage, {
    x: 650,
    y: 70,
    width: 130,
    height: 130,
  });

  page.drawText('Scan to Verify', {
    x: 680,
    y: 55,
    size: 10,
    font: fontHelveticaBold,
    color: rgb(0.85, 0.72, 0.42),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
