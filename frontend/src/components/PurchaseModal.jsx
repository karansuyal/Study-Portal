import React, { useState } from 'react';
import { FaTimes, FaQrcode, FaCreditCard, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { createPaymentOrder, submitPaymentProof, payWithRazorpay } from '../services/paymentService';
import './PurchaseModal.css';

/**
 * Premium note purchase flow.
 *
 * Props:
 *   note        - { id, title, price_display, price }
 *   onClose     - () => void
 *   onUnlocked  - () => void   called once access is actually granted
 *                              (immediately for Razorpay, or the caller can
 *                              treat "submitted" as pending-review for UPI)
 */
export default function PurchaseModal({ note, onClose, onUnlocked }) {
  // 'choose' -> 'upi_pending' (QR shown, waiting for UTR) -> 'upi_submitted' (done, awaiting admin)
  // or 'razorpay_processing' -> 'success'
  const [stage, setStage] = useState('choose');
  const [order, setOrder] = useState(null);
  const [utr, setUtr] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const startUpi = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await createPaymentOrder(note.id, 'upi_manual');
      setOrder(res);
      setStage('upi_pending');
    } catch (err) {
      setError(err.data?.error || err.message || 'Could not start UPI payment');
    } finally {
      setLoading(false);
    }
  };

  const startRazorpay = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await createPaymentOrder(note.id, 'razorpay');
      setStage('razorpay_processing');
      await payWithRazorpay(res, {
        onSuccess: () => {
          setStage('success');
          onUnlocked && onUnlocked();
        },
        onFailure: (err) => {
          setError(err.message || 'Payment failed. You can try again.');
          setStage('choose');
        },
        onDismiss: () => {
          setStage('choose');
        },
      });
    } catch (err) {
      setError(err.data?.error || err.message || 'Card/UPI auto-payment is not available right now');
      setStage('choose');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!utr || utr.trim().length < 4) {
      setError('Enter the UTR / Reference number shown in your UPI app after paying');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await submitPaymentProof(order.purchase.id, utr.trim(), proofFile);
      setStage('upi_submitted');
    } catch (err) {
      setError(err.data?.error || err.message || 'Could not submit — try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pm-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        <h3 className="pm-title">Unlock premium note</h3>
        <p className="pm-note-title">{note.title}</p>
        <p className="pm-price">{note.price_display || `₹${(note.price / 100).toFixed(0)}`}</p>

        {error && (
          <div className="pm-error">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {stage === 'choose' && (
          <div className="pm-options">
            <button className="pm-option-btn" onClick={startUpi} disabled={loading}>
              <FaQrcode size={20} />
              <div>
                <strong>Pay via UPI QR</strong>
                <span>Scan &amp; pay, then submit your reference number. Unlocks after quick admin review.</span>
              </div>
            </button>
            <button className="pm-option-btn" onClick={startRazorpay} disabled={loading}>
              <FaCreditCard size={20} />
              <div>
                <strong>Pay by Card / UPI (instant)</strong>
                <span>Unlocks immediately after payment via Razorpay.</span>
              </div>
            </button>
          </div>
        )}

        {stage === 'razorpay_processing' && (
          <div className="pm-info">Waiting for payment confirmation…</div>
        )}

        {stage === 'upi_pending' && order && (
          <div className="pm-upi-flow">
            <img src={order.payment.qr_image} alt="UPI QR code" className="pm-qr" />
            <a
              className="pm-upi-app-btn"
              href={order.payment.upi_uri}
              onClick={(e) => {
                // upi:// links only resolve on a phone with a UPI app installed.
                if (!/Android|iPhone/i.test(navigator.userAgent)) e.preventDefault();
              }}
            >
              Pay via UPI app
            </a>
            <p className="pm-upi-id">UPI ID: <strong>{order.payment.upi_id}</strong></p>
            <p className="pm-hint">{order.payment.instructions}</p>

            <form onSubmit={handleSubmitProof} className="pm-form">
              <label htmlFor="pm-utr">UTR / Transaction reference *</label>
              <input
                id="pm-utr"
                type="text"
                value={utr}
                onChange={(e) => setUtr(e.target.value)}
                placeholder="e.g. 402812345678"
                required
              />
              <label htmlFor="pm-proof">Payment screenshot (optional)</label>
              <input
                id="pm-proof"
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              />
              <button type="submit" className="pm-submit-btn" disabled={loading}>
                {loading ? 'Submitting…' : 'Submit for review'}
              </button>
            </form>
          </div>
        )}

        {stage === 'upi_submitted' && (
          <div className="pm-success">
            <FaCheckCircle size={28} />
            <p>Submitted! An admin will review your payment shortly and the note will unlock automatically once approved.</p>
            <button className="pm-submit-btn" onClick={onClose}>Done</button>
          </div>
        )}

        {stage === 'success' && (
          <div className="pm-success">
            <FaCheckCircle size={28} />
            <p>Payment verified — this note is unlocked!</p>
            <button className="pm-submit-btn" onClick={onClose}>Continue</button>
          </div>
        )}
      </div>
    </div>
  );
}
