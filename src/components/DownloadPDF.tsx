import React, { FC, useState } from 'react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { FilePlus2, SaveAll, FileDown, LibraryBig } from 'lucide-react'
import { Invoice } from '../data/types'
import { useDebounce } from '@uidotdev/usehooks'
import InvoicePage from './InvoicePage'
import TemplateList from './TemplateList'
import { initialInvoice } from '../data/initialData'
import { format } from 'date-fns'
import Modal from './Modal'
import { useNavigate } from 'react-router-dom'

interface Props {
  data: Invoice
  setData(data: Invoice): void
}

const Download: FC<Props> = ({ data, setData }) => {
  const [showTemplates, setShowTemplates] = useState(false)
  const debounced = useDebounce(data, 500)
  const navigate = useNavigate()

  // function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
  //   if (!e.target.files?.length) return

  //   const file = e.target.files[0]
  //   file
  //     .text()
  //     .then((str: string) => {
  //       try {
  //         if (!(str.startsWith('{') && str.endsWith('}'))) {
  //           str = atob(str)
  //         }
  //         const d = JSON.parse(str)
  //         const dParsed = TInvoice.parse(d)
  //         console.info('parsed correctly')
  //         setData(dParsed)
  //       } catch (e) {
  //         console.error(e)
  //         return
  //       }
  //     })
  //     .catch((err) => console.error(err))
  // }

  function handleSaveTemplate() {
    const clientName = data.clientName?.trim() || 'unnamed'
    const dateStr = format(new Date(), 'MMM-dd')
    const templateKey = `${clientName}-${dateStr}.template`

    try {
      localStorage.setItem(templateKey, JSON.stringify(debounced))
      localStorage.setItem(templateKey + '_modified', Date.now().toString())
      alert('Template saved successfully!')
    } catch (err) {
      console.error('Failed to save template:', err)
      alert('Failed to save template')
    }
  }

  const handleCreateNew = () => {
    if (
      window.confirm(
        'Are you sure you want to create a new invoice? All unsaved changes will be lost.',
      )
    ) {
      setData({ ...initialInvoice })
      navigate('/')
    }
  }

  const title = data.invoiceTitle ? data.invoiceTitle.toLowerCase() : 'invoice'
  return (
    <div className={'download-pdf'}>
      <button
        onClick={handleCreateNew}
        className="download-pdf__new"
        aria-label="Create New Invoice"
        title="Create New Invoice"
      >
        <FilePlus2 size={24} />
        Create New
      </button>

      <PDFDownloadLink
        key="pdf"
        document={<InvoicePage pdfMode={true} data={debounced} />}
        fileName={`${title}.pdf`}
        aria-label="Save PDF"
        title="Save PDF"
        className="mt-40"
      ></PDFDownloadLink>
      <FileDown />
      Export PDF

      <button
        onClick={handleSaveTemplate}
        aria-label="Save Template"
        title="Save Template"
        className="mt-40"
      />
      <SaveAll />
      <p className="text-big">Save Template</p>

      <button onClick={() => navigate('/templates')} className="mt-40 ">
        <LibraryBig />
        <p className='text-big'>Browse Templates</p>
      </button>

      <Modal show={showTemplates} onClose={() => setShowTemplates(false)}>
        <TemplateList
          onSelect={(template) => {
            setData(template)
            setShowTemplates(false)
          }}
        />
      </Modal>

      {/* <label className="download-pdf__template_upload">
        <input type="file" accept=".json,.template" onChange={handleInput} />
      </label>
      <p className="text-small">Upload Template</p> */}
    </div>
  )
}

export default Download
