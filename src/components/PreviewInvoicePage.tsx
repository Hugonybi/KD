import { FC, useState } from 'react';
import { Invoice } from '../data/types';
import InvoicePage from './InvoicePage';

interface Props {
  data: Invoice;
  onEdit: (updatedData: Invoice) => void;
  onClose: () => void;
}

const PreviewInvoicePage: FC<Props> = ({ data, onEdit, onClose }) => {
  const [currentData, setCurrentData] = useState<Invoice>(data);

  const handleSave = () => {
    onEdit(currentData);
  };

  return (
    <div className="preview-wrapper">
      <div className="preview-controls">
        <button className="preview-button edit" onClick={handleSave}>
          Save
        </button>
        <button className="preview-button close" onClick={onClose}>
          Close Preview
        </button>
      </div>
      <InvoicePage 
        data={currentData}
        pdfMode={false}
        onChange={setCurrentData}
        readOnly={false}
      />
    </div>
  );
};

export default PreviewInvoicePage;
