import { Invoice } from './types'

export const initialProductLine = {
  description: '',
  quantity: '1',
  rate: '0.00',
}

export const initialInvoice: Invoice = {
  logo: 'logo.png',
  logoWidth: 150,
  title: 'INVOICE',
  companyName: '',
  companyAddress: 'Suite 201, The Capital Hub',
  companyAddress2: 'Plot 272, Ahmadu Bello Way, Kado, Abuja',
  companyCountry: 'Nigeria',
  billTo: 'Bill To:',
  clientName: '',
  clientAddress: '',
  clientAddress2: '',
  clientCountry: 'Nigeria',
  invoiceTitleLabel: 'Invoice#',
  invoiceTitle: '',
  invoiceDateLabel: 'Invoice Date',
  invoiceDate: '',
  invoiceDueDateLabel: 'Due Date',
  invoiceDueDate: '',
  productLineDescription: 'Item Description',
  productLineQuantity: 'Qty',
  productLineQuantityRate: 'Rate',
  productLineQuantityAmount: 'Amount',
  productLines: [{ ...initialProductLine }],
  subTotalLabel: 'Sub Total',
  taxLabel: 'Discount (0%)',  // Changed from 'Sales Tax (0%)'
  totalLabel: 'TOTAL',
  currency: 'N',
  notesLabel: 'Notes',
  notes: 'Thanks for your business!',
  termLabel: 'Terms & Conditions',
  term: 'Please make payment within 15 days'
}
