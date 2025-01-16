import { FC } from 'react'
import { Image } from '@react-pdf/renderer'
import compose from '../styles/compose'

interface Props {
  className?: string
  placeholder?: string
  value?: string
  width?: number
  pdfMode?: boolean
}

const EditableFileImage: FC<Props> = ({
  className,
  placeholder,
  value,
  width,
  pdfMode,
}) => {
  const getImagePath = (value: string) => {
    if (value.startsWith('data:') || value.startsWith('http')) {
      return value;
    }
    const path = value.startsWith('/') ? value.slice(1) : value;
    return path;
  };

  if (pdfMode) {
    if (value) {
      return (
        <Image
          style={{
            ...compose(`image ${className ? className : ''}`),
            maxWidth: width,
          }}
          src={getImagePath(value)}
        />
      )
    } else {
      return <></>
    }
  }

  return (
    <div className={`image ${value ? 'mb-5' : ''} ${className ? className : ''}`}>
      {!value ? (
        <div className="image__placeholder">
          {placeholder}
        </div>
      ) : (
        <img
          src={getImagePath(value)}
          className="image__img"
          alt={placeholder}
          style={{ maxWidth: width || 100 }}
        />
      )}
    </div>
  )
}

export default EditableFileImage
