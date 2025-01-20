import { FC, useState, useRef, useEffect } from 'react'
import TextareaAutosize from 'react-textarea-autosize'
import { Text } from '@react-pdf/renderer'
// import { productDescriptions } from '../data/suggestions'
import { predefinedProducts, Product } from '../data/products'
import compose from '../styles/compose'
import styles from '../styles/styles'

interface Props {
  className?: string
  placeholder?: string
  value: string
  onChange: (value: string, product?: Product) => void
  pdfMode?: boolean
  rows?: number
}

const EditableTextarea: FC<Props> = ({
  className,
  placeholder,
  value,
  onChange,
  pdfMode,
  rows,
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isEditing])

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value
    onChange(newValue)

    // Filter suggestions based on input
    if (newValue) {
      const filtered = predefinedProducts.filter(product =>
        product.description.toLowerCase().includes(newValue.toLowerCase())
      )
      setSuggestions(filtered.map(p => p.description))
    } else {
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    const product = predefinedProducts.find(p => p.description === suggestion)
    onChange(suggestion, product)
    setSuggestions([])
    setIsEditing(false)
  }

  return (
    <div style={styles['suggestions-container']}>
      {pdfMode ? (
        <Text style={compose('span ' + (className ? className : ''))}>{value}</Text>
      ) : (
        <>
          <TextareaAutosize
            ref={textareaRef}
            minRows={rows || 1}
            className={'input ' + (className ? className : '')}
            placeholder={placeholder || ''}
            value={value || ''}
            onChange={handleChange}
            onFocus={() => setIsEditing(true)}
          />
          {isEditing && suggestions.length > 0 && (
            <div style={styles['suggestions-list']}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  style={styles['suggestion-item']}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default EditableTextarea
