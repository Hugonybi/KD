import { Invoice, ProductLine } from './types'

export const initialProductLine: ProductLine = {
  description: '',
  quantity: '1',
  rate: '0',
  amount: '0.00'  // Add this field
}

export const initialInvoice: Invoice = {
  logo: 'logo.png',
  logoWidth: 150,
  title: 'INVOICE',
  companyName: '',
  companyAddress: '07013397711',
  companyAddress2: 'larlillian25@gmail.com',
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
  productLineQuantity: 'Quantity',
  productLineQuantityRate: 'Price',
  productLineQuantityAmount: 'Amount',
  productLines: [{ ...initialProductLine }],
  subTotalLabel: 'Sub Total',
  taxLabel: 'Discount',  // Changed from 'Sales Tax (0%)'
  discountAmount: 0,
  totalLabel: 'TOTAL',
  currency: 'N',
  notesLabel: 'Notes',
  notes: 'We kindly request all clients to attend their scheduled fitting appointments as planned. This is essential to ensure that any necessary alterations and adjustments are completed on the same day. Missing your fitting appointment may result in significant delays to your order.',
  notes2: 'Please note that full payment is required on the delivery date. If payment is not made, the company reserves the right to withhold your order until the balance is settled.',
  termLabel: 'Terms & Conditions',
  term: 'Please make payment within 15 days',
  accountNumber: '6505855990',
  accountName: 'Lar Nanfe Lilian',
  accountBank: 'Providus Bank ',
  discount: 0,
  paidLabel:''
}
