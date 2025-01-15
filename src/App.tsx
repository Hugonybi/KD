import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import InvoicePage from './components/InvoicePage'
import TemplatePage from './pages/TemplatePage'
import { Invoice } from './data/types'
import './styles/templates.css';
import { initialInvoice } from './data/initialData'

// Wrapper component to use navigation hooks
function AppContent() {
  const navigate = useNavigate()
  const savedInvoice = window.localStorage.getItem('invoiceData')
  // Initialize with initialInvoice instead of null
  let data = { ...initialInvoice }

  try {
    if (savedInvoice && window.location.search.includes('load=saved')) {
      data = JSON.parse(savedInvoice)
    }
  } catch (_e) {}

  const onInvoiceUpdated = (invoice: Invoice) => {
    window.localStorage.setItem('invoiceData', JSON.stringify(invoice))
  }

  const handleTemplateSelect = (template: Invoice) => {
    window.localStorage.setItem('invoiceData', JSON.stringify(template))
    navigate('/')
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="app">
          <h1 className="center fs-30">Invoice Generator</h1>
          <InvoicePage data={data} onChange={onInvoiceUpdated} />
        </div>
      } />
      <Route path="/templates" element={<TemplatePage onSelect={handleTemplateSelect} />} />
    </Routes>
  )
}

// Main App component
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
