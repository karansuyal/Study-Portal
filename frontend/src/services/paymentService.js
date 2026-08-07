import { API_URL } from './api';

function getToken() {
  return localStorage.getItem('noteshub_token') || localStorage.getItem('study_portal_token');
}

async function authedFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const err = new Error(data.error || `Request failed: ${response.status}`);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

// Check whether the current (possibly logged-out) user already has access
// to a note — used to decide whether to show a "Buy" button at all.
export const checkNoteAccess = async (noteId) => {
  return authedFetch(`/payments/notes/${noteId}/access`);
};

// Creates (or reuses) a pending order for a premium note.
// method: 'upi_manual' | 'razorpay'
export const createPaymentOrder = async (noteId, method) => {
  return authedFetch('/payments/orders', {
    method: 'POST',
    body: JSON.stringify({ note_id: noteId, method }),
  });
};

// Manual UPI flow: submit the UTR/reference number, optionally with a
// payment screenshot (proofFile). Status stays 'pending' until an admin
// reviews it — this call does NOT unlock the note by itself.
export const submitPaymentProof = async (purchaseId, utrReference, proofFile) => {
  if (proofFile) {
    const formData = new FormData();
    formData.append('utr_reference', utrReference);
    formData.append('proof', proofFile);
    return authedFetch(`/payments/orders/${purchaseId}/proof`, { method: 'POST', body: formData });
  }
  return authedFetch(`/payments/orders/${purchaseId}/proof`, {
    method: 'POST',
    body: JSON.stringify({ utr_reference: utrReference }),
  });
};

// Razorpay flow: after Razorpay Checkout succeeds client-side, this asks
// the backend to verify the payment signature before granting access —
// the frontend's "it worked" callback is never trusted on its own.
export const verifyRazorpayPayment = async ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  return authedFetch('/payments/razorpay/verify', {
    method: 'POST',
    body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }),
  });
};

export const getMyPurchases = async () => {
  return authedFetch('/payments/my-purchases');
};

// Loads the Razorpay Checkout script once and reuses it on subsequent calls.
let razorpayScriptPromise = null;
export const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return razorpayScriptPromise;
};

// Opens Razorpay Checkout for an order created via createPaymentOrder(),
// verifies it server-side on success, then calls onSuccess(purchase).
export const payWithRazorpay = async (order, { onSuccess, onFailure, onDismiss }) => {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    onFailure && onFailure(new Error('Could not load Razorpay checkout. Check your connection.'));
    return;
  }

  const { payment } = order;
  const rzp = new window.Razorpay({
    key: payment.key_id,
    amount: payment.amount,
    currency: payment.currency,
    name: payment.name,
    description: payment.description,
    order_id: payment.order_id,
    prefill: payment.prefill,
    theme: { color: '#4f46e5' },
    handler: async (response) => {
      try {
        const result = await verifyRazorpayPayment(response);
        onSuccess && onSuccess(result.purchase);
      } catch (err) {
        onFailure && onFailure(err);
      }
    },
    modal: {
      ondismiss: () => onDismiss && onDismiss(),
    },
  });

  rzp.on('payment.failed', (resp) => {
    onFailure && onFailure(new Error(resp?.error?.description || 'Payment failed'));
  });

  rzp.open();
};

const paymentService = {
  checkNoteAccess,
  createPaymentOrder,
  submitPaymentProof,
  verifyRazorpayPayment,
  getMyPurchases,
  payWithRazorpay,
};

export default paymentService;
