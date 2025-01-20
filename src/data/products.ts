export interface Product {
  description: string;
  quantity: string;
  rate: string;
}

export const predefinedProducts: Product[] = [
  {
    description: 'Kaftan',
    quantity: '1',
    rate: '60000'
  },
  {
    description: 'Agbada',
    quantity: '1',
    rate: '45000'
  },
  {
    description: 'Tropical',
    quantity: '1',
    rate: '15000'
  },
  {
    description: 'Trouser',
    quantity: '1',
    rate: '8000'
  },
  {
    description: 'Amendment',
    quantity: '1',
    rate: '5000'
  }
];
