import { FC, useState, useEffect } from 'react'
import { Invoice, TInvoice } from '../data/types'
import PreviewInvoicePage from './PreviewInvoicePage'  // Add this import

type SortOption = 'date' | 'name' | 'amount';

interface TemplateItem {
  name: string;
  data: string;
  lastModified: number;
  amount?: number;  // Add amount to the interface
}

interface Props {
  onSelect: (template: Invoice) => void
}

const TemplateList: FC<Props> = ({ onSelect }) => {
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredTemplates, setFilteredTemplates] = useState<TemplateItem[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('date')
  const [sortAsc, setSortAsc] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<Invoice | null>(null);

  const calculateAmount = (templateData: string): number => {
    try {
      const parsed = JSON.parse(templateData);
      const invoice = TInvoice.parse(parsed);
      
      // Calculate subtotal
      const subTotal = invoice.productLines.reduce((sum, line) => {
        const quantity = parseFloat(line.quantity) || 0;
        const rate = parseFloat(line.rate) || 0;
        return sum + (quantity * rate);
      }, 0);

      // Calculate discount
      const match = invoice.taxLabel.match(/(\d+)%/);
      const discountRate = match ? parseFloat(match[1]) : 0;
      const discount = (subTotal * discountRate) / 100;

      return subTotal - discount;
    } catch (error) {
      console.error('Error calculating amount:', error);
      return 0;
    }
  };

  const sortTemplates = (templates: TemplateItem[]) => {
    return [...templates].sort((a, b) => {
      switch(sortBy) {
        case 'date':
          return sortAsc 
            ? a.lastModified - b.lastModified 
            : b.lastModified - a.lastModified;
        case 'name':
          return sortAsc 
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case 'amount':
          const aAmount = a.amount || 0;
          const bAmount = b.amount || 0;
          return sortAsc ? aAmount - bAmount : bAmount - aAmount;
        default:
          return 0;
      }
    });
  };

  const loadTemplates = () => {
    const templateItems: TemplateItem[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.endsWith('.template')) {
        const data = localStorage.getItem(key);
        if (data) {
          templateItems.push({
            name: key.replace('.template', ''),
            data: data,
            lastModified: localStorage.getItem(key + '_modified') 
              ? parseInt(localStorage.getItem(key + '_modified') || '0')
              : Date.now(),
            amount: calculateAmount(data)  // Add amount calculation
          });
        }
      }
    }
    
    // Sort by last modified date (newest first)
    templateItems.sort((a, b) => b.lastModified - a.lastModified);
    setTemplates(templateItems);
    setFilteredTemplates(templateItems);
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    const filtered = templates
      .filter(template => template.name.toLowerCase().includes(searchTerm.toLowerCase()));
    setFilteredTemplates(sortTemplates(filtered));
  }, [searchTerm, templates, sortBy, sortAsc]);

  const handleTemplateClick = (templateData: string, templateName: string) => {
    try {
      const parsed = JSON.parse(templateData);
      const validTemplate = TInvoice.parse(parsed);
      // Store the template name for later use when editing
      setPreviewTemplate({
        ...validTemplate,
        // Add metadata to the preview template
        _templateName: templateName // Add internal field to track template name
      });
    } catch (error) {
      console.error('Failed to load template:', error);
      alert('Failed to load template');
    }
  }

  const handleEdit = (updatedTemplate: Invoice) => {
    if (previewTemplate) {
      // Get the template name from metadata
      const templateName = (previewTemplate as any)._templateName;
      if (templateName) {
        // Update the template in localStorage
        const templateData = JSON.stringify(updatedTemplate);
        localStorage.setItem(templateName + '.template', templateData);
        localStorage.setItem(templateName + '.template_modified', Date.now().toString());
        
        // Reload templates to update the list
        loadTemplates();
      }
      setPreviewTemplate(null);
    }
  }

  const handleSort = (option: SortOption) => {
    if (sortBy === option) {
      setSortAsc(!sortAsc);
    } else {
      setSortBy(option);
      setSortAsc(false);
    }
  };

  return (
    <div className="template-list">
      {previewTemplate ? (
        <PreviewInvoicePage
          data={previewTemplate}
          onEdit={handleEdit}
          onClose={() => setPreviewTemplate(null)}
        />
      ) : (
        <>
          <div className="template-list__header">
            <div className="template-list__search-container">
              <input
                type="search"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="template-list__search"
              />
            </div>
            <div className="template-list__sort-buttons">
              <button 
                className={`sort-button ${sortBy === 'date' ? 'active' : ''}`}
                onClick={() => handleSort('date')}
              >
                Date {sortBy === 'date' && (sortAsc ? '↑' : '↓')}
              </button>
              <button 
                className={`sort-button ${sortBy === 'name' ? 'active' : ''}`}
                onClick={() => handleSort('name')}
              >
                Name {sortBy === 'name' && (sortAsc ? '↑' : '↓')}
              </button>
              <button 
                className={`sort-button ${sortBy === 'amount' ? 'active' : ''}`}
                onClick={() => handleSort('amount')}
              >
                Amount {sortBy === 'amount' && (sortAsc ? '↑' : '↓')}
              </button>
            </div>
          </div>
          <div className="template-list__items">
            {filteredTemplates.length === 0 ? (
              <p className="template-list__empty">No templates found</p>
            ) : (
              <div className="template-list__grid">
                {filteredTemplates.map((template, index) => (
                  <button
                    key={index}
                    className="template-list__item"
                    onClick={() => handleTemplateClick(template.data, template.name)}
                  >
                    <span className="template-list__item-name">{template.name}</span>
                    <span className="template-list__item-amount">
                      ${template.amount?.toFixed(2)}
                    </span>
                    <span className="template-list__item-date">
                      {new Date(template.lastModified).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default TemplateList
