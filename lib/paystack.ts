import crypto from 'crypto';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export const ACTIVATION_FEE_GHS = 150.00;
export const PLATFORM_CUT_GHS = 0.20;
export const AGENT_COMMISSION_GHS = 50.00;

export interface InitializePaystackParams {
  email: string;
  amountInGHS: number;
  subaccountCode?: string | null;
  platformCutGHS?: number;
  metadata?: Record<string, any>;
  callbackUrl?: string;
}

/**
 * Maps Mobile Money networks in Ghana to Paystack settlement bank codes
 */
export function getPaystackBankCode(network: string): string {
  const normalized = network.toUpperCase();
  if (normalized.includes('MTN')) return 'MTN';
  if (normalized.includes('TELECEL') || normalized.includes('VODAFONE')) return 'VOD';
  if (normalized.includes('AIRTEL') || normalized.includes('TIGO') || normalized.includes('AT')) return 'ATL';
  return 'MTN';
}

/**
 * Creates a split subaccount for a Ghanaian vendor on Paystack
 */
export async function createPaystackSubaccount(vendor: {
  business_name: string;
  owner_momo_number: string;
  owner_momo_network: string;
}): Promise<{ success: boolean; subaccountCode?: string; error?: string }> {
  if (!PAYSTACK_SECRET || PAYSTACK_SECRET === 'your_paystack_secret_key_here') {
    // Generate a mock subaccount code if key is not configured
    const mockCode = `SUB_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    return { success: true, subaccountCode: mockCode };
  }

  try {
    const res = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name: vendor.business_name,
        settlement_bank: getPaystackBankCode(vendor.owner_momo_network),
        account_number: vendor.owner_momo_number,
        percentage_charge: 0, // Flat platform fee handled during charge
        description: `SeePay Subaccount for ${vendor.business_name}`,
      }),
    });

    const data = await res.json();
    if (data.status && data.data?.subaccount_code) {
      return { success: true, subaccountCode: data.data.subaccount_code };
    }
    return { success: false, error: data.message || 'Failed to create subaccount' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Initializes a transaction on Paystack with optional split subaccount
 */
export async function initializeTransaction(params: InitializePaystackParams): Promise<{
  success: boolean;
  authorization_url?: string;
  access_code?: string;
  reference?: string;
  error?: string;
}> {
  const amountInPesewas = Math.round(params.amountInGHS * 100);
  const platformCutInPesewas = params.platformCutGHS ? Math.round(params.platformCutGHS * 100) : 0;

  if (!PAYSTACK_SECRET || PAYSTACK_SECRET === 'your_paystack_secret_key_here') {
    const mockRef = `SP_REF_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      success: true,
      authorization_url: `${params.callbackUrl || '/orders/confirmation'}?reference=${mockRef}&status=success`,
      access_code: `mock_code_${mockRef}`,
      reference: mockRef,
    };
  }

  try {
    const payload: Record<string, any> = {
      email: params.email,
      amount: amountInPesewas,
      currency: 'GHS',
      callback_url: params.callbackUrl,
      metadata: params.metadata || {},
    };

    if (params.subaccountCode) {
      payload.subaccount = params.subaccountCode;
      if (platformCutInPesewas > 0) {
        payload.transaction_charge = platformCutInPesewas;
      }
    }

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.status && data.data) {
      return {
        success: true,
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference,
      };
    }
    return { success: false, error: data.message || 'Payment initialization failed' };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Verifies Paystack Webhook HMAC SHA512 Signature
 */
export function verifyPaystackSignature(rawBody: string, signature: string): boolean {
  if (!PAYSTACK_SECRET || PAYSTACK_SECRET === 'your_paystack_secret_key_here') {
    return true; // Test/development fallback
  }

  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET)
    .update(rawBody)
    .digest('hex');

  return hash === signature;
}
