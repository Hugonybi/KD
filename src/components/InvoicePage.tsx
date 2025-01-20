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
const LOGO_WIDTH = 150 // Set your desired fixed width

interface Props {
  data?: Invoice
  pdfMode?: boolean
  onChange?: (invoice: Invoice) => void
  readOnly?: boolean // Add this prop
}

const InvoicePage: FC<Props> = ({ data, pdfMode, onChange, readOnly }) => {
  const [invoice, setInvoice] = useState<Invoice>(data ? { ...data } : { ...initialInvoice })
  const [subTotal, setSubTotal] = useState<number>()
  const [discount, setDiscount] = useState<number>(0) // Initialize with 0

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

      if (name === 'logoWidth' && typeof value === 'number') {
        newInvoice[name] = value
      } else if (name !== 'logoWidth' && typeof value === 'string') {
        newInvoice[name] = value
      }

      setInvoice(newInvoice as Invoice)
    }
  }

  const handleProductLineChange = (index: number, name: keyof ProductLine, value: string) => {
    const productLines = invoice.productLines.map((productLine, i) => {
      if (i === index) {
        const newProductLine = { ...productLine }

        if (name === 'description') {
          newProductLine[name] = value
        } else if (name === 'rate') {
          // Special handling for rate/price
          const newRate = parseFloat(value.replace(/,/g, '')) || 0
          newProductLine[name] = newRate.toString()
        } else {
          if (
            value[value.length - 1] === '.' ||
            (value[value.length - 1] === '0' && value.includes('.'))
          ) {
            newProductLine[name] = value
          } else {
            const n = parseFloat(value)

            newProductLine[name] = (n ? n : 0).toString()
          }
        }

        return newProductLine
      }

      return { ...productLine }
    })

    setInvoice({ ...invoice, productLines })
  }

  const handleRemove = (i: number) => {
    const productLines = invoice.productLines.filter((_, index) => index !== i)

    setInvoice({ ...invoice, productLines })
  }

  const handleAdd = () => {
    const productLines = [...invoice.productLines, { ...initialProductLine }]

    setInvoice({ ...invoice, productLines })
  }

  const formatNumber = (num: string): string => {
    const number = parseFloat(num)
    return isNaN(number)
      ? '0.00'
      : number.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
  }

  // Add this new function after formatNumber
  const formatDiscount = (num: string): string => {
    const number = parseFloat(num)
    return isNaN(number) ? '0' : number.toLocaleString('en-US')
  }

  // Add this new function after formatDiscount
  const formatPrice = (num: string): string => {
    const number = parseFloat(num)
    return isNaN(number) ? '0' : number.toLocaleString('en-US')
  }

  const calculateAmount = (quantity: string, rate: string) => {
    const quantityNumber = parseFloat(quantity) || 0
    const rateNumber = parseFloat(rate) || 0
    const amount = quantityNumber * rateNumber
    return formatNumber(amount.toString())
  }

  useEffect(() => {
    let subTotal = 0
    invoice.productLines.forEach((productLine) => {
      const quantityNumber = parseFloat(productLine.quantity)
      const rateNumber = parseFloat(productLine.rate)
      const amount = quantityNumber && rateNumber ? quantityNumber * rateNumber : 0
      subTotal += amount
    })
    setSubTotal(subTotal)

    // Update discount in invoice state
    if (discount !== invoice.discountAmount) {
      setInvoice((prev) => ({
        ...prev,
        discountAmount: discount,
      }))
    }
  }, [invoice.productLines, discount])

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

  useEffect(() => {
    if (data) {
      setInvoice(data)
      setDiscount(data.discountAmount || 0)
    }
  }, [data])

  return (
    <Document pdfMode={pdfMode}>
      <Page className="invoice-wrapper" pdfMode={pdfMode}>
        {!pdfMode && !readOnly && <Download data={invoice} setData={(d) => setInvoice(d)} />}

        <View className="flex" pdfMode={pdfMode}>
          <View className="w-50 " pdfMode={pdfMode}>
            <EditableFileImage
              className="logo p-10"
              placeholder="Company Logo"
              value={COMPANY_LOGO}
              width={LOGO_WIDTH}
              pdfMode={pdfMode}
            />

            <Text className="mt-10 company-details" pdfMode={pdfMode}>
              {invoice.companyAddress}
            </Text>
            <Text className="company-details" pdfMode={pdfMode}>
              {invoice.companyAddress2}
            </Text>
            <Text className="company-details" pdfMode={pdfMode}>
              {invoice.companyCountry}
            </Text>
          </View>
          <View className="w-50 mt-40" pdfMode={pdfMode}>
            <EditableInput
              className="fs-20 right bold gold"
              placeholder="Invoice"
              value={invoice.title}
              onChange={(value) => handleChange('title', value)}
              pdfMode={pdfMode}
            />
          </View>
        </View>

        <View className=" mt-40" pdfMode={pdfMode}>
          <View className="flex" pdfMode={pdfMode}>
            <View className="w-55" pdfMode={pdfMode}>
              <EditableInput
                className="bold gold mb-5"
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
              {/* <EditableInput
                placeholder="Client's Address"
                value={invoice.clientAddress}
                onChange={(value) => handleChange('clientAddress', value)}
                pdfMode={pdfMode}
              /> */}
              {/* <EditableInput
                placeholder="City, State Zip"
                value={invoice.clientAddress2}
                onChange={(value) => handleChange('clientAddress2', value)}
                pdfMode={pdfMode}
              /> */}
              {/* <EditableSelect
                options={countryList}
                value={invoice.clientCountry}
                onChange={(value) => handleChange('clientCountry', value)}
                pdfMode={pdfMode}
              /> */}
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
          <View className=" flexRow" pdfMode={pdfMode}>
            <View className=" w-50 mt-10 p-5 pl-10 rounded" pdfMode={pdfMode}>
              <Text className="bold dark fs-10 w-100 flex " pdfMode={pdfMode}>
                Bank Details
              </Text>
              <View className="flex" pdfMode={pdfMode}>
                <Text className="bold gold company-details" pdfMode={pdfMode}>
                  Account Number
                </Text>
                <Text className="bold dark fs-20" pdfMode={pdfMode}>
                  {invoice.accountNumber}
                </Text>
              </View>
              <View className="flex" pdfMode={pdfMode}>
                <Text className="bold gold company-details" pdfMode={pdfMode}>
                  Account Name
                </Text>
                <Text className="bold dark fs-20" pdfMode={pdfMode}>
                  {invoice.accountName}
                </Text>
              </View>
              <View className="flex" pdfMode={pdfMode}>
                <Text className="bold gold company-details" pdfMode={pdfMode}>
                  Bank Name
                </Text>
                <Text className="bold dark fs-20" pdfMode={pdfMode}>
                  {invoice.accountBank}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-20 bg-gold flex" pdfMode={pdfMode}>
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
                  onChange={(value) => handleProductLineChange(i, 'description', value)}
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
                  {formatNumber(calculateAmount(productLine.quantity, productLine.rate))}
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
                  value={formatDiscount(invoice.discountAmount?.toString() || '0')}
                  onChange={(value) => {
                    const newDiscount = parseFloat(value.replace(/,/g, '')) || 0
                    setDiscount(newDiscount)
                    handleChange('discountAmount', newDiscount)
                  }}
                  pdfMode={pdfMode}
                />
              </View>
            </View>
            <View className="flex bg-gray p-5" pdfMode={pdfMode}>
              <View className="w-auto p-5" pdfMode={pdfMode}>
                <EditableInput
                  className="bold"
                  value={invoice.totalLabel}
                  onChange={(value) => handleChange('totalLabel', value)}
                  pdfMode={pdfMode}
                />
              </View>
              <View className="w-50 p-5 flex" pdfMode={pdfMode}>
                <EditableInput
                  className="dark bold right ml-30"
                  value={invoice.currency}
                  onChange={(value) => handleChange('currency', value)}
                  pdfMode={pdfMode}
                />
                <Text className="right bold dark w-100" pdfMode={pdfMode}>
                  {formatNumber(
                    (typeof subTotal !== 'undefined' && typeof discount !== 'undefined'
                      ? subTotal - discount
                      : 0
                    ).toString(),
                  )}
                </Text>
              </View>
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
          <Text
            className="w-100 fs-10 bold"
         
            pdfMode={pdfMode}
          >
            {invoice.notes}
          </Text>
          <Text
            className="w-100 fs-10 bold"
            
            pdfMode={pdfMode}
          >
            {invoice.notes2}
          </Text>
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
