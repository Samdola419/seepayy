export interface Vendor {
  id: string;
  business_name: string;
  subdomain: string;
  whatsapp_number: string;
  owner_momo_number: string;
  owner_momo_network: 'MTN' | 'TELECEL' | 'AIRTELTIGO' | string;
  paystack_subaccount_code?: string | null;
  is_active: boolean;
  activation_fee_paid: boolean;
  agent_id?: string | null;
  created_at: string;
}

export interface Agent {
  id: string;
  full_name: string;
  momo_number: string;
  momo_network: 'MTN' | 'TELECEL' | 'AIRTELTIGO' | string;
  referral_code: string;
  balance_earned: number;
  created_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description?: string | null;
  price: number;
  image_url?: string | null;
  category?: string;
  is_available: boolean;
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  vendor_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address?: string | null;
  total_amount: number;
  platform_fee: number;
  vendor_amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'cancelled';
  fulfillment_status?: 'pending' | 'processing' | 'completed' | 'cancelled';
  paystack_reference?: string | null;
  items: OrderItem[];
  created_at: string;
}

export interface Commission {
  id: string;
  agent_id: string;
  vendor_id: string;
  amount: number;
  status: 'pending' | 'paid';
  created_at: string;
  vendor?: Vendor;
}
