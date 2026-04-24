export interface Operator {
  id: string;
  name: string;
  pin_code: string;
  created_at: string;
}

export interface ReceptionOrder {
  id: string;
  order_number: string;
  supplier_name: string;
  status: 'pending' | 'in_progress' | 'completed';
  total_quantity: number;
  created_at: string;
  completed_at?: string;
  operator_id?: string;
}

export interface Weighing {
  id: string;
  order_id: string;
  quantity: number;
  temperature?: number;
  notes?: string;
  created_at: string;
}
