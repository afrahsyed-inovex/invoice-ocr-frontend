/**
 * Raw responses in Usman's (provisional) backend format: every field is { value, confidence }
 * and amounts are OCR'd strings such as "1 798,00". They go through normalizeUsmanInvoice
 * exactly like real responses.
 */
const field = (value, confidence) => ({ value, confidence });

export const usmanMockResponses = [
  // Complete invoice, 5 line items, European number formatting.
  {
    status: 'succeeded',
    model_version: 'layout-v2.3',
    processing_time_ms: 1840,
    fields: {
      InvoiceId: field('40378170', 0.99),
      InvoiceDate: field('10/15/2024', 0.97),
      DueDate: field('11/14/2024', 0.94),
      Currency: field('$', 0.88),
      VendorName: field('Patel, Thompson and Montgomery', 0.96),
      VendorAddress: field('356 Kyle Vista, New James, MA 46228', 0.93),
      VendorEmail: field('sales@ptm-electronics.com', 0.91),
      VendorPhone: field('+1 (508) 555-0117', 0.89),
      CustomerName: field('Jackson, Odonnell and Jackson', 0.95),
      CustomerAddress: field('267 John Track Suite 841, Jenniferville, PA 98601', 0.9),
      SubTotal: field('3 006,06', 0.97),
      TotalTax: field('300,61', 0.95),
      InvoiceTotal: field('3 306,67', 0.98),
      TaxId: field('958-74-3511', 0.92),
      IBAN: field('GB75MCRL06841367619257', 0.9),
    },
    line_items: [
      {
        Description: field('Apple iPhone 12 Pro Max 128GB Pacific Blue Unlocked', 0.95),
        Quantity: field('2,00', 0.98),
        UnitPrice: field('899,00', 0.97),
        Amount: field('1 798,00', 0.97),
      },
      {
        Description: field('Samsung Galaxy Buds Pro Phantom Black', 0.94),
        Quantity: field('4,00', 0.98),
        UnitPrice: field('149,99', 0.96),
        Amount: field('599,96', 0.96),
      },
      {
        Description: field('Anker PowerCore 20000mAh Portable Charger', 0.93),
        Quantity: field('6,00', 0.97),
        UnitPrice: field('39,95', 0.95),
        Amount: field('239,70', 0.96),
      },
      {
        Description: field('Spigen Ultra Hybrid Case for iPhone 12 Pro Max', 0.92),
        Quantity: field('10,00', 0.97),
        UnitPrice: field('12,99', 0.95),
        Amount: field('129,90', 0.95),
      },
      {
        Description: field('Belkin BoostCharge 3-in-1 Wireless Charging Stand', 0.94),
        Quantity: field('3,00', 0.98),
        UnitPrice: field('79,50', 0.96),
        Amount: field('238,50', 0.96),
      },
    ],
  },

  // 3 line items; due date and vendor contact details not found.
  {
    status: 'partial',
    model_version: 'layout-v2.3',
    processing_time_ms: 1215,
    fields: {
      InvoiceId: field('RC-10492', 0.97),
      InvoiceDate: field('08/22/2024', 0.93),
      Currency: field('EUR', 0.99),
      VendorName: field('Roastery Collective S.L.', 0.94),
      VendorAddress: field('Carrer de Mallorca 214, 08008 Barcelona, Spain', 0.87),
      CustomerName: field('Café Aurora', 0.92),
      CustomerAddress: field('Rua Augusta 87, 1100-048 Lisboa, Portugal', 0.85),
      SubTotal: field('405,80', 0.96),
      TotalTax: field('28,41', 0.91),
      InvoiceTotal: field('434,21', 0.97),
    },
    line_items: [
      {
        Description: field('Organic Arabica Coffee Beans 1kg', 0.95),
        Quantity: field('12', 0.97),
        UnitPrice: field('18,40', 0.94),
        Amount: field('220,80', 0.95),
      },
      {
        Description: field('Ceramic Pour-Over Coffee Dripper', 0.91),
        Quantity: field('5', 0.97),
        UnitPrice: field('24,00', 0.93),
        Amount: field('120,00', 0.94),
      },
      {
        Description: field('Unbleached Paper Filters (100 pcs)', 0.89),
        Quantity: field('20', 0.96),
        UnitPrice: field('3,25', 0.9),
        Amount: field('65,00', 0.93),
      },
    ],
  },

  // Single line item; customer name missing and low-confidence date.
  {
    status: 'succeeded',
    model_version: 'layout-v2.3',
    processing_time_ms: 960,
    fields: {
      InvoiceId: field('FRT-55102', 0.86),
      InvoiceDate: field('03/07/2024', 0.58),
      DueDate: field('04/06/2024', 0.61),
      Currency: field('USD', 0.95),
      VendorName: field('Summit Freight Lines', 0.9),
      VendorAddress: field('9100 E 40th Ave, Denver, CO 80207', 0.76),
      VendorPhone: field('(303) 555-0186', 0.72),
      CustomerName: field(null, 0.12),
      CustomerAddress: field('4400 S Kedzie Ave, Chicago, IL 60632', 0.67),
      SubTotal: field('1 250,00', 0.89),
      TotalTax: field('0,00', 0.83),
      InvoiceTotal: field('1 250,00', 0.92),
      BillOfLading: field('BOL-778120', 0.81),
    },
    line_items: [
      {
        Description: field('Freight shipping - 1 pallet, Chicago, IL to Denver, CO', 0.84),
        Quantity: field('1', 0.95),
        UnitPrice: field('1 250,00', 0.88),
        Amount: field('1 250,00', 0.9),
      },
    ],
  },

  // 4 line items with extra fields (payment terms, PO number, bank details).
  {
    status: 'succeeded',
    model_version: 'layout-v2.3',
    processing_time_ms: 2210,
    fields: {
      InvoiceId: field('UXS-2024-117', 0.98),
      InvoiceDate: field('06/28/2024', 0.96),
      DueDate: field('07/28/2024', 0.95),
      Currency: field('£', 0.9),
      VendorName: field('Fieldnote Design Studio Ltd', 0.97),
      VendorAddress: field('3 Shoreditch High Street, London E1 6PG, United Kingdom', 0.92),
      VendorEmail: field('hello@fieldnote.studio', 0.95),
      VendorPhone: field('+44 20 7946 0321', 0.9),
      CustomerName: field('Greenleaf Health plc', 0.96),
      CustomerAddress: field('77 Deansgate, Manchester M3 2BW, United Kingdom', 0.91),
      SubTotal: field('11 940,00', 0.97),
      TotalTax: field('597,00', 0.94),
      InvoiceTotal: field('12 537,00', 0.98),
      PaymentTerms: field('Net 30', 0.93),
      PurchaseOrder: field('GH-PO-30981', 0.89),
      BankDetails: field({ sortCode: '20-45-77', accountNumber: '41203988' }, 0.84),
    },
    line_items: [
      {
        Description: field('UX Research Workshop (2 days)', 0.96),
        Quantity: field('1', 0.98),
        UnitPrice: field('3 200,00', 0.96),
        Amount: field('3 200,00', 0.97),
      },
      {
        Description: field('High-fidelity Prototype - Mobile App', 0.95),
        Quantity: field('1', 0.98),
        UnitPrice: field('5 400,00', 0.96),
        Amount: field('5 400,00', 0.97),
      },
      {
        Description: field('Usability Testing Sessions', 0.94),
        Quantity: field('8', 0.97),
        UnitPrice: field('275,00', 0.95),
        Amount: field('2 200,00', 0.96),
      },
      {
        Description: field('Design System Documentation (hours)', 0.92),
        Quantity: field('12', 0.97),
        UnitPrice: field('95,00', 0.94),
        Amount: field('1 140,00', 0.95),
      },
    ],
  },

  // Not an invoice: the model found nothing.
  {
    status: 'failed',
    model_version: 'layout-v2.3',
    processing_time_ms: 640,
    error: 'Document does not appear to be an invoice.',
    fields: {},
    line_items: [],
  },
];
