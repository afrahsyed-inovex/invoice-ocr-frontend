import { EMPTY_VALUE, formatDate, formatMoney, formatQuantity } from './format';

/*
 * Draws a normalized invoice as a simple SVG document. The "Try sample invoice" flow uses it
 * so there is something realistic to preview without shipping image assets.
 */

const WIDTH = 820;
const MARGIN = 56;
const ROW_HEIGHT = 30;
const MAX_DESCRIPTION_LENGTH = 52;
const FONT = "Inter, 'Segoe UI', Arial, sans-serif";

const COLUMNS = {
  index: MARGIN + 8,
  description: MARGIN + 44,
  quantity: 540,
  unitPrice: 650,
  amount: WIDTH - MARGIN - 8,
};

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function truncate(text, maxLength) {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

function text(x, y, content, { size = 13, weight = 400, color = '#334155', anchor = 'start' } = {}) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${color}" text-anchor="${anchor}">${escapeXml(content)}</text>`;
}

/** Splits "Street, City, ST 12345" across lines so long addresses stay inside the column. */
function addressLines(address) {
  if (!address) return [EMPTY_VALUE];
  const parts = address.split(', ');
  if (parts.length <= 2) return [address];
  return [parts.slice(0, -2).join(', '), parts.slice(-2).join(', ')];
}

function partyBlock(x, y, heading, party) {
  const lines = [
    text(x, y, heading, { size: 11, weight: 600, color: '#6366f1' }),
    text(x, y + 22, party.name ?? EMPTY_VALUE, { size: 14, weight: 600, color: '#0f172a' }),
    ...addressLines(party.address).map((line, index) => text(x, y + 42 + index * 18, line)),
  ];
  return lines.join('');
}

export function buildInvoiceSvg(invoice) {
  const money = (value) => formatMoney(value, invoice.currency);
  const parts = [];
  let y = MARGIN + 30;

  parts.push(text(MARGIN, y, 'INVOICE', { size: 30, weight: 700, color: '#0f172a' }));
  parts.push(text(WIDTH - MARGIN, y - 12, `Invoice no: ${invoice.invoiceNumber ?? EMPTY_VALUE}`, { anchor: 'end', weight: 600 }));
  parts.push(text(WIDTH - MARGIN, y + 8, `Date of issue: ${formatDate(invoice.invoiceDate)}`, { anchor: 'end' }));
  parts.push(text(WIDTH - MARGIN, y + 26, `Due date: ${formatDate(invoice.dueDate)}`, { anchor: 'end' }));

  y += 70;
  parts.push(partyBlock(MARGIN, y, 'SELLER', invoice.vendor));
  parts.push(partyBlock(WIDTH / 2 + 10, y, 'CLIENT', invoice.customer));

  y += 110;
  parts.push(`<rect x="${MARGIN}" y="${y}" width="${WIDTH - MARGIN * 2}" height="${ROW_HEIGHT}" rx="4" fill="#eef2ff"/>`);
  const headerY = y + 20;
  const headerStyle = { size: 11, weight: 600, color: '#4338ca' };
  parts.push(text(COLUMNS.index, headerY, 'NO.', headerStyle));
  parts.push(text(COLUMNS.description, headerY, 'DESCRIPTION', headerStyle));
  parts.push(text(COLUMNS.quantity, headerY, 'QTY', { ...headerStyle, anchor: 'end' }));
  parts.push(text(COLUMNS.unitPrice, headerY, 'UNIT PRICE', { ...headerStyle, anchor: 'end' }));
  parts.push(text(COLUMNS.amount, headerY, 'AMOUNT', { ...headerStyle, anchor: 'end' }));

  y += ROW_HEIGHT;
  invoice.lineItems.forEach((item, index) => {
    const rowY = y + 20;
    parts.push(text(COLUMNS.index, rowY, `${index + 1}.`));
    parts.push(text(COLUMNS.description, rowY, truncate(item.description ?? EMPTY_VALUE, MAX_DESCRIPTION_LENGTH)));
    parts.push(text(COLUMNS.quantity, rowY, formatQuantity(item.quantity), { anchor: 'end' }));
    parts.push(text(COLUMNS.unitPrice, rowY, money(item.unitPrice), { anchor: 'end' }));
    parts.push(text(COLUMNS.amount, rowY, money(item.amount), { anchor: 'end' }));
    parts.push(`<line x1="${MARGIN}" x2="${WIDTH - MARGIN}" y1="${y + ROW_HEIGHT}" y2="${y + ROW_HEIGHT}" stroke="#e2e8f0"/>`);
    y += ROW_HEIGHT;
  });

  y += 30;
  const labelX = COLUMNS.unitPrice - 60;
  [
    ['Subtotal', money(invoice.subtotal)],
    ['Tax', money(invoice.tax)],
  ].forEach(([label, value]) => {
    parts.push(text(labelX, y, label, { anchor: 'end' }));
    parts.push(text(COLUMNS.amount, y, value, { anchor: 'end' }));
    y += 22;
  });
  parts.push(`<line x1="${labelX - 80}" x2="${WIDTH - MARGIN}" y1="${y - 8}" y2="${y - 8}" stroke="#cbd5e1"/>`);
  y += 14;
  parts.push(text(labelX, y, 'Total', { anchor: 'end', weight: 700, size: 15, color: '#0f172a' }));
  parts.push(text(COLUMNS.amount, y, money(invoice.total), { anchor: 'end', weight: 700, size: 15, color: '#0f172a' }));

  const height = y + MARGIN;
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${height}" viewBox="0 0 ${WIDTH} ${height}" font-family="${FONT}">`,
    `<rect width="100%" height="100%" fill="#ffffff"/>`,
    `<rect width="100%" height="6" fill="#4f46e5"/>`,
    ...parts,
    '</svg>',
  ].join('');
}

export function createSampleInvoiceFile(invoice, fileName) {
  return new File([buildInvoiceSvg(invoice)], fileName, { type: 'image/svg+xml' });
}
