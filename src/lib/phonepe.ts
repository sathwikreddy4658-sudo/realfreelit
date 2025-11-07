import { supabase } from '@/integrations/supabase/client';
import SHA256 from 'crypto-js/sha256';

// PhonePe API configuration
const PHONEPE_BASE_URL = 'https://api.phonepe.com/apis/hermes';
const PHONEPE_MERCHANT_ID = import.meta.env.VITE_PHONEPE_MERCHANT_ID || '';
const PHONEPE_SALT_KEY = import.meta.env.VITE_PHONEPE_SALT_KEY || '';
const PHONEPE_SALT_INDEX = import.meta.env.VITE_PHONEPE_SALT_INDEX || '1';

export interface PhonePePaymentOptions {
  amount: number; // Amount in paisa (1 INR = 100 paisa)
  merchantTransactionId: string;
  merchantUserId: string;
  redirectUrl: string;
  callbackUrl: string;
  mobileNumber?: string;
  deviceContext?: {
    deviceOS: string;
  };
}

export interface PhonePeOrderResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    merchantId: string;
    merchantTransactionId: string;
    instrumentResponse?: {
      redirectInfo?: {
        url: string;
        method: string;
      };
    };
  };
}

// Generate SHA256 hash for PhonePe
function generateSHA256Hash(data: string): string {
  return SHA256(data).toString();
}

// Create PhonePe payment payload
function createPaymentPayload(options: PhonePePaymentOptions) {
  const payload = {
    merchantId: PHONEPE_MERCHANT_ID,
    merchantTransactionId: options.merchantTransactionId,
    merchantUserId: options.merchantUserId,
    amount: options.amount,
    redirectUrl: options.redirectUrl,
    redirectMode: 'REDIRECT',
    callbackUrl: options.callbackUrl,
    mobileNumber: options.mobileNumber,
    paymentInstrument: {
      type: 'PAY_PAGE'
    },
    deviceContext: options.deviceContext
  };

  return payload;
}

// Create SHA256 hash for request
function createRequestHash(payload: string, endpoint: string): string {
  const data = payload + endpoint + PHONEPE_SALT_KEY;
  return generateSHA256Hash(data) + '###' + PHONEPE_SALT_INDEX;
}

// Initiate PhonePe payment
export async function initiatePhonePePayment(options: PhonePePaymentOptions): Promise<PhonePeOrderResponse> {
  try {
    const payload = createPaymentPayload(options);
    const payloadString = JSON.stringify(payload);
    const base64Payload = btoa(payloadString);

    const requestHash = createRequestHash(base64Payload, '/pg/v1/pay');

    const requestBody = {
      request: base64Payload
    };

    const response = await fetch(`${PHONEPE_BASE_URL}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': requestHash,
        'X-MERCHANT-ID': PHONEPE_MERCHANT_ID
      },
      body: JSON.stringify(requestBody)
    });

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        code: result.code,
        message: result.message,
        data: result.data
      };
    } else {
      return {
        success: false,
        code: result.code,
        message: result.message
      };
    }
  } catch (error) {
    console.error('PhonePe payment initiation failed:', error);
    return {
      success: false,
      code: 'ERROR',
      message: 'Payment initiation failed'
    };
  }
}

// Check payment status
export async function checkPaymentStatus(merchantTransactionId: string): Promise<any> {
  try {
    const requestHash = createRequestHash('', `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}`);

    const response = await fetch(`${PHONEPE_BASE_URL}/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': requestHash,
        'X-MERCHANT-ID': PHONEPE_MERCHANT_ID
      }
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Payment status check failed:', error);
    return null;
  }
}

// Store payment details in database (using orders table for now)
export async function storePaymentDetails(orderId: string, paymentData: any) {
  try {
    // Update the order with payment information
    const { error } = await supabase
      .from('orders')
      .update({
        payment_id: paymentData.merchantTransactionId,
        status: paymentData.status === 'SUCCESS' ? 'paid' : 'pending'
      })
      .eq('id', orderId);

    if (error) {
      console.error('Failed to store payment details:', error);
    }
  } catch (error) {
    console.error('Error storing payment details:', error);
  }
}
