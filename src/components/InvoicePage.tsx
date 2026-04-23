import { FC, useState, useEffect } from 'react'
import { Invoice, ProductLine } from '../data/types'
import { initialInvoice, initialProductLine } from '../data/initialData'
import EditableInput from './EditableInput'
// import EditableSelect from './EditableSelect'
import EditableTextarea from './EditableTextarea'
import EditableCalendarInput from './EditableCalendarInput'
import EditableFileImage from './EditableFileImage'
// import countryList from '../data/countryList'
import Document from './Document'
import Page from './Page'
import View from './View'
import Text from './Text'
import { Font } from '@react-pdf/renderer'
import Download from './DownloadPDF'
import { format } from 'date-fns/format'
import { Product } from '../data/products'

Font.register({
  family: 'Nunito',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/nunito/v12/XRXV3I6Li01BKofINeaE.ttf' },
    {
      src: 'https://fonts.gstatic.com/s/nunito/v12/XRXW3I6Li01BKofA6sKUYevN.ttf',
      fontWeight: 600,
    },
  ],
})

const COMPANY_LOGO = '/logo.png' // Update this path to your actual logo path
const LOGO_WIDTH = 100 // Set your desired fixed width

interface Props {
  data?: Invoice
  pdfMode?: boolean
  onChange?: (invoice: Invoice) => void
  readOnly?: boolean // Add this prop
}

const InvoicePage: FC<Props> = ({ data, pdfMode, onChange, readOnly }) => {
  const [invoice, setInvoice] = useState<Invoice>(data ? { ...data } : { ...initialInvoice })
  const [subTotal, setSubTotal] = useState<number>()
  const [total, setTotal] = useState<number>() // Add this line

  const dateFormat = 'MMM dd, yyyy'
  const invoiceDate = invoice.invoiceDate !== '' ? new Date(invoice.invoiceDate) : new Date()
  const invoiceDueDate =
    invoice.invoiceDueDate !== ''
      ? new Date(invoice.invoiceDueDate)
      : new Date(invoiceDate.valueOf())

  if (invoice.invoiceDueDate === '') {
    invoiceDueDate.setDate(invoiceDueDate.getDate() + 30)
  }

  const handleChange = (name: keyof Invoice, value: string | number) => {
    if (name !== 'productLines') {
      const newInvoice = { ...invoice } as Record<keyof Invoice, string | number | ProductLine[]>

      if (name === 'discount' || name === 'paid') {
        // Handle numeric inputs (discount and paid)
        const stringValue = typeof value === 'number' ? value.toString() : value
        const numberValue = parseFloat(stringValue.replace(/,/g, '')) || 0
        newInvoice[name] = numberValue
      } else if (name === 'logoWidth' && typeof value === 'number') {
        newInvoice[name] = value
      } else if (name !== 'logoWidth' && typeof value === 'string') {
        newInvoice[name] = value
      }

      setInvoice(newInvoice as Invoice)
    }
  }

  const handleProductLineChange = (
    index: number,
    name: keyof ProductLine,
    value: string,
    product?: Product,
  ) => {
    const productLines = invoice.productLines.map((productLine, i) => {
      if (i === index) {
        const newProductLine = { ...productLine }

        if (product) {
          // Autofill other fields if a predefined product is selected
          newProductLine.description = product.description
          newProductLine.quantity = product.quantity
          newProductLine.rate = product.rate
          const amount = calculateAmount(product.quantity, product.rate)
          newProductLine.amount = amount
        } else {
          // Handle normal input changes
          if (name === 'description') {
            newProductLine[name] = value
          } else if (name === 'rate') {
            const newRate = parseFloat(value.replace(/,/g, '')) || 0
            newProductLine[name] = newRate.toString()
            newProductLine.amount = calculateAmount(newProductLine.quantity, newProductLine.rate)
          } else if (name === 'quantity') {
            newProductLine[name] = value
            if (value === '') {
              newProductLine.amount = '0.00'
            } else {
              newProductLine.amount = calculateAmount(value, newProductLine.rate)
            }
          }
        }

        return newProductLine
      }

      return { ...productLine }
    })

    setInvoice({ ...invoice, productLines })
  }

  const calculateAmount = (quantity: string, rate: string): string => {
    const quantityNumber = parseFloat(quantity) || 0
    const rateNumber = parseFloat(rate.replace(/,/g, '')) || 0
    const amount = quantityNumber * rateNumber
    return formatNumber(amount.toString())
  }

  const handleRemove = (i: number) => {
    const productLines = invoice.productLines.filter((_, index) => index !== i)

    setInvoice({ ...invoice, productLines })
  }

  const handleAdd = () => {
    const productLines = [...invoice.productLines, { ...initialProductLine }]

    setInvoice({ ...invoice, productLines })
  }

  const formatNumber = (num: string, decimals: boolean = true): string => {
    const number = parseFloat(num)
    return isNaN(number)
      ? '0' + (decimals ? '.00' : '')
      : number.toLocaleString('en-US', {
          minimumFractionDigits: decimals ? 2 : 0,
          maximumFractionDigits: decimals ? 2 : 0,
        })
  }

  const formatPrice = (num: string): string => {
    const number = parseFloat(num)
    return isNaN(number) ? '0' : number.toLocaleString('en-US')
  }

  useEffect(() => {
    let calculatedSubTotal = 0

    invoice.productLines.forEach((productLine) => {
      const quantityNumber = parseFloat(productLine.quantity)
      const rateNumber = parseFloat(productLine.rate)
      const amount = quantityNumber && rateNumber ? quantityNumber * rateNumber : 0

      calculatedSubTotal += amount
    })

    setSubTotal(calculatedSubTotal)

    // Calculate total
    const discount = parseFloat(invoice.discount?.toString() || '0')
    const paid = parseFloat(invoice.paid?.toString() || '0')
    const calculatedTotal = calculatedSubTotal - discount - paid
    setTotal(calculatedTotal)
  }, [invoice.productLines, invoice.discount, invoice.paid]) // Add dependencies

  useEffect(() => {
    if (onChange) {
      onChange(invoice)
    }
  }, [onChange, invoice])

  useEffect(() => {
    // Sync invoice state with parent data
    if (data) {
      setInvoice(data)
    }
  }, [data])

  useEffect(() => {
    // Sync changes back to parent
    if (onChange) {
      onChange(invoice)
    }
  }, [invoice, onChange])

  return (
    <Document pdfMode={pdfMode}>
      <Page className="invoice-wrapper" pdfMode={pdfMode}>
        {!pdfMode && !readOnly && (
          <View className="mb-20 " pdfMode={pdfMode}>
            <Download data={invoice} setData={(d) => setInvoice(d)} />
          </View>
        )}

        <View className="w-50 w-100" pdfMode={pdfMode}>
          <View className="right " pdfMode={pdfMode}>
            <View className="w-100" pdfMode={pdfMode}>
              <EditableFileImage
                className="flexColChild"
                placeholder="Company Logo"
                value={COMPANY_LOGO}
                width={LOGO_WIDTH}
                pdfMode={pdfMode}
              />
            </View>
            <View className="" pdfMode={pdfMode}>
              <Text className="  company-details" pdfMode={pdfMode}>
                {invoice.companyAddress}
              </Text>
              <Text className="company-details" pdfMode={pdfMode}>
                {invoice.companyAddress2}
              </Text>
              <Text className="company-details" pdfMode={pdfMode}>
                {invoice.companyCountry}
              </Text>
            </View>
          </View>
        </View>

        <View className=" mt-10" pdfMode={pdfMode}>
          <View className="w-50 mt-40" pdfMode={pdfMode}>
            <Text className="fs-30 left bold dark " pdfMode={pdfMode}>
              {invoice.title}
            </Text>
          </View>
          <View className="flex mt-10" pdfMode={pdfMode}>
            <View className="w-55" pdfMode={pdfMode}>
              <EditableInput
                className="bold  mb-5"
                value={invoice.billTo}
                onChange={(value) => handleChange('billTo', value)}
                pdfMode={pdfMode}
              />
              <EditableInput
                className="dark bold fs-20"
                placeholder="Your Client's Name"
                value={invoice.clientName}
                onChange={(value) => handleChange('clientName', value)}
                pdfMode={pdfMode}
              />
            </View>
            <View className="w-45" pdfMode={pdfMode}>
              <View className="flex mb-5" pdfMode={pdfMode}>
                <View className="w-40" pdfMode={pdfMode}>
                  <EditableInput
                    className="bold"
                    value={invoice.invoiceTitleLabel}
                    onChange={(value) => handleChange('invoiceTitleLabel', value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-60" pdfMode={pdfMode}>
                  <EditableInput
                    placeholder="INV-12"
                    value={invoice.invoiceTitle}
                    onChange={(value) => handleChange('invoiceTitle', value)}
                    pdfMode={pdfMode}
                  />
                </View>
              </View>
              <View className="flex mb-5" pdfMode={pdfMode}>
                <View className="w-40" pdfMode={pdfMode}>
                  <EditableInput
                    className="bold"
                    value={invoice.invoiceDateLabel}
                    onChange={(value) => handleChange('invoiceDateLabel', value)}
                    pdfMode={pdfMode}
                  />
                </View>
              
                <View className="w-60" pdfMode={pdfMode}>
                  <EditableCalendarInput
                    value={format(invoiceDate, dateFormat)}
                    selected={invoiceDate}
                    onChange={(date) =>
                      handleChange(
                        'invoiceDate',
                        date && !Array.isArray(date) ? format(date, dateFormat) : '',
                      )
                    }
                    pdfMode={pdfMode}
                  />
                </View>
                
              </View>
              <View className="flex mb-5" pdfMode={pdfMode}>
                <View className="w-40" pdfMode={pdfMode}>
                  <EditableInput
                    className="bold"
                    value={invoice.invoiceDueDateLabel}
                    onChange={(value) => handleChange('invoiceDueDateLabel', value)}
                    pdfMode={pdfMode}
                  />
                </View>
                <View className="w-60" pdfMode={pdfMode}>
                  <EditableCalendarInput
                    value={format(invoiceDueDate, dateFormat)}
                    selected={invoiceDueDate}
                    onChange={(date) =>
                      handleChange(
                        'invoiceDueDate',
                        date ? (!Array.isArray(date) ? format(date, dateFormat) : '') : '',
                      )
                    }
                    pdfMode={pdfMode}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-20 bg-dark row flex" pdfMode={pdfMode}>
          <View className="w-48 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold"
              value={invoice.productLineDescription}
              onChange={(value) => handleChange('productLineDescription', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-17 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantity}
              onChange={(value) => handleChange('productLineQuantity', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-17 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantityRate}
              onChange={(value) => handleChange('productLineQuantityRate', value)}
              pdfMode={pdfMode}
            />
          </View>
          <View className="w-18 p-4-8" pdfMode={pdfMode}>
            <EditableInput
              className="white bold right"
              value={invoice.productLineQuantityAmount}
              onChange={(value) => handleChange('productLineQuantityAmount', value)}
              pdfMode={pdfMode}
            />
          </View>
        </View>

        {invoice.productLines.map((productLine, i) => {
          return pdfMode && productLine.description === '' ? (
            <Text key={i}></Text>
          ) : (
            <View key={i} className="row flex" pdfMode={pdfMode}>
              <View className="w-48 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableTextarea
                  className="dark"
                  rows={2}
                  placeholder="Enter item name/description"
                  value={productLine.description}
                  onChange={(value, product) =>
                    handleProductLineChange(i, 'description', value, product)
                  }
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-17 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={productLine.quantity}
                  onChange={(value) => handleProductLineChange(i, 'quantity', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-17 p-4-8 pb-10" pdfMode={pdfMode}>
                <EditableInput
                  className="dark right"
                  value={formatPrice(productLine.rate)}
                  onChange={(value) => handleProductLineChange(i, 'rate', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-18 p-4-8 pb-10" pdfMode={pdfMode}>
                <Text className="dark right" pdfMode={pdfMode}>
                  {productLine.amount || calculateAmount(productLine.quantity, productLine.rate)}
                </Text>
              </View>
              {!pdfMode && (
                <button
                  className="link row__remove"
                  aria-label="Remove Row"
                  title="Remove Row"
                  onClick={() => handleRemove(i)}
                >
                  <span className="icon icon-remove bg-red"></span>
                </button>
              )}
            </View>
          )
        })}

        <View className="flex" pdfMode={pdfMode}>
          <View className="w-50 mt-10" pdfMode={pdfMode}>
            {!pdfMode && (
              <button className="link" onClick={handleAdd}>
                <span className="icon icon-add bg-green mr-10"></span>
                Add Line Item
              </button>
            )}
          </View>
          <View className="w-50 mt-20" pdfMode={pdfMode}>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.subTotalLabel}
                  onChange={(value) => handleChange('subTotalLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <Text className="right bold dark" pdfMode={pdfMode}>
                  {formatNumber(subTotal?.toString() || '0')}
                </Text>
              </View>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  value={invoice.taxLabel}
                  onChange={(value) => handleChange('taxLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  className="right bold dark"
                  value={formatNumber(invoice.discount?.toString() || '0', false)}
                  onChange={(value) => handleChange('discount', value)}
                  pdfMode={pdfMode}
                />
              </View>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  value="Amount Paid"
                  onChange={(value) => handleChange('paidLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5" pdfMode={pdfMode}>
                <EditableInput
                  className="right bold dark"
                  value={formatNumber(invoice.paid?.toString() || '0', false)}
                  onChange={(value) => handleChange('paid', value)}
                  pdfMode={pdfMode}
                />
              </View>
            </View>
            <View className="flex bg-gray p-5" pdfMode={pdfMode}>
              <View className="w-40 p-5 " pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.totalLabel}
                  onChange={(value) => handleChange('totalLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-100 p-5 flex right" pdfMode={pdfMode}>
                <EditableInput
                  className="dark bold right ml-30"
                  value={invoice.currency}
                  onChange={(value) => handleChange('currency', value)}
                  pdfMode={pdfMode}
                />
                <Text className="right bold dark w-auto" pdfMode={pdfMode}>
                  {formatNumber(total?.toString() || '0')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className=" flex" pdfMode={pdfMode}>
          <View className=" w-50 mt-10 p-5 pl-10 rounded" pdfMode={pdfMode}>
            <Text className="bold dark fs-10 w-100 flex " pdfMode={pdfMode}>
              Bank Details
            </Text>
            <View className="flex" pdfMode={pdfMode}>
              <Text className="bold gold company-details" pdfMode={pdfMode}>
                Account Number
              </Text>
              <Text className="bold dark fs-10" pdfMode={pdfMode}>
                {invoice.accountNumber}
              </Text>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <Text className="bold gold company-details" pdfMode={pdfMode}>
                Account Name
              </Text>
              <Text className="bold dark fs-10" pdfMode={pdfMode}>
                {invoice.accountName}
              </Text>
            </View>
            <View className="flex" pdfMode={pdfMode}>
              <Text className="bold gold company-details" pdfMode={pdfMode}>
                Bank Name
              </Text>
              <Text className="bold dark fs-10" pdfMode={pdfMode}>
                {invoice.accountBank}
              </Text>
            </View>
          </View>
        </View>

        <View className="mt-20" pdfMode={pdfMode}>
          <EditableInput
            className="bold w-100"
            value={invoice.termLabel}
            onChange={(value) => handleChange('notesLabel', value)}
            pdfMode={pdfMode}
          />
          <EditableTextarea
            className="w-100 company-details"
            rows={2}
            value={invoice.notes}
            onChange={(value) => handleChange('notes', value)}
            pdfMode={pdfMode}
          />
          {/* <EditableTextarea
            className="w-100 company-details"
            rows={2}
            value={invoice.notes2}
            onChange={(value) => handleChange('notes', value)}
            pdfMode={pdfMode}
          /> */}
        </View>
        {/* <View className="mt-20" pdfMode={pdfMode}>
          <EditableInput
            className="bold w-100"
            value={invoice.termLabel}
            onChange={(value) => handleChange('termLabel', value)}
            pdfMode={pdfMode}
          />
          <EditableTextarea
            className="w-100"
            rows={2}
            value={invoice.term}
            onChange={(value) => handleChange('term', value)}
            pdfMode={pdfMode}
          />
        </View> */}
      </Page>
    </Document>
  )
}

export default InvoicePage
