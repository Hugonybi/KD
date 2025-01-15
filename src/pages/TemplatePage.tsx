import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import TemplateList from '../components/TemplateList'
import { Invoice } from '../data/types'

interface Props {
  onSelect: (template: Invoice) => void
}

const TemplatePage: FC<Props> = ({ onSelect }) => {
  const navigate = useNavigate()

  const handleTemplateSelect = (template: Invoice) => {
    onSelect(template)
    navigate('/')
  }

  return (
    <div className="template-page">
      <div className="template-page__container">
        <h1 className="template-page__title">Invoice Templates</h1>
        <TemplateList onSelect={handleTemplateSelect} />
        <button 
          className="template-page__back-button"
          onClick={() => navigate('/')}
        >
          Back to Invoice
        </button>
      </div>
    </div>
  )
}

export default TemplatePage
