/**
 * Arkesel SMS Client for SeePay
 * Dispatches instant SMS alerts to Ghanaian Mobile Numbers via Arkesel REST API
 */

export function formatGhanaianPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Remove spaces, hyphens, and non-digit characters except +
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  if (cleaned.startsWith('+233')) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith('0') && cleaned.length === 10) {
    cleaned = '233' + cleaned.substring(1);
  } else if (!cleaned.startsWith('233') && cleaned.length === 9) {
    cleaned = '233' + cleaned;
  }
  
  return cleaned;
}

export async function sendArkeselSMS(recipient: string, message: string): Promise<{ success: boolean; data?: any; error?: string }> {
  const apiKey = process.env.ARKESEL_API_KEY;
  const formattedPhone = formatGhanaianPhoneNumber(recipient);

  if (!formattedPhone) {
    return { success: false, error: 'Invalid phone number' };
  }

  if (!apiKey || apiKey === 'your_arkesel_api_key_here') {
    console.log(`[Arkesel SMS Mock Mode] To: ${formattedPhone} | Message: ${message}`);
    return { success: true, data: { status: 'mock_delivered', recipient: formattedPhone, message } };
  }

  try {
    const res = await fetch('https://sms.arkesel.com/api/v2/sms/send', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: 'SeePay',
        message: message,
        recipients: [formattedPhone],
      }),
    });

    const data = await res.json();
    return { success: res.ok, data };
  } catch (err: any) {
    console.error('Failed to send SMS via Arkesel:', err);
    return { success: false, error: err.message };
  }
}
