import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes, FaQrcode, FaCreditCard, FaCheckCircle, FaExclamationTriangle, FaCopy, FaCheck, FaArrowLeft } from 'react-icons/fa';
import { createPaymentOrder, submitPaymentProof, payWithRazorpay } from '../services/paymentService';
import { usePendingUnlock } from '../hooks/usePendingUnlock';
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
  const [copied, setCopied] = useState(false);

  const priceLabel = note.price_display || `₹${(note.price / 100).toFixed(0)}`;

  // Steps shown in the header. Razorpay skips the "confirm" step since it
  // unlocks automatically — this only really matters for the UPI path.
  const stepIndex = { choose: 0, razorpay_processing: 1, upi_pending: 1, upi_submitted: 2, success: 2 }[stage];

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

  const copyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(order.payment.upi_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable — silently ignore, the ID is visible to copy by hand.
    }
  };

  // While waiting on admin review, keep polling in the background — if the
  // student leaves this screen open, it flips to "approved" the moment it
  // actually gets approved, with no refresh needed.
  const watchItems = useMemo(
    () => (stage === 'upi_submitted' ? [{ id: note.id, is_premium: true, locked: true }] : []),
    [stage, note.id]
  );
  usePendingUnlock(watchItems, () => {
    setStage('success');
    onUnlocked && onUnlocked();
  });

  // Lock background scroll while the sheet/modal is open — otherwise the
  // page behind can scroll under a fixed-position mobile bottom sheet.
  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  const modalContent = (
    <div className="pm-overlay" onClick={onClose}>
      <div className="pm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="pm-close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        <div className="pm-drag-handle" />

        {/* ---- Header: note + price ---- */}
        <div className="pm-header">
          <span className="pm-eyebrow">Unlock premium note</span>
          <h3 className="pm-title">{note.title}</h3>
          <div className="pm-price-row">
            <span className="pm-price">{priceLabel}</span>
            <span className="pm-price-tag">one-time</span>
          </div>
        </div>

        {/* ---- Step indicator ---- */}
        {stage !== 'razorpay_processing' && (
          <div className="pm-steps" aria-hidden="true">
            <div className={`pm-step ${stepIndex >= 0 ? 'is-active' : ''} ${stepIndex > 0 ? 'is-done' : ''}`}>
              <span className="pm-step-dot">{stepIndex > 0 ? <FaCheck size={9} /> : '1'}</span>
              <span className="pm-step-label">Choose</span>
            </div>
            <div className={`pm-step-line ${stepIndex > 0 ? 'is-done' : ''}`} />
            <div className={`pm-step ${stepIndex >= 1 ? 'is-active' : ''} ${stepIndex > 1 ? 'is-done' : ''}`}>
              <span className="pm-step-dot">{stepIndex > 1 ? <FaCheck size={9} /> : '2'}</span>
              <span className="pm-step-label">Pay</span>
            </div>
            <div className={`pm-step-line ${stepIndex > 1 ? 'is-done' : ''}`} />
            <div className={`pm-step ${stepIndex >= 2 ? 'is-active' : ''}`}>
              <span className="pm-step-dot">{stepIndex >= 2 ? <FaCheck size={9} /> : '3'}</span>
              <span className="pm-step-label">Confirm</span>
            </div>
          </div>
        )}

        {error && (
          <div className="pm-error">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <div className="pm-body">
          {stage === 'choose' && (
            <div className="pm-options">
              <button className="pm-option-btn" onClick={startUpi} disabled={loading}>
                <span className="pm-option-icon"><FaQrcode size={18} /></span>
                <div className="pm-option-copy">
                  <strong>Pay via UPI QR</strong>
                  <span>Scan &amp; pay, then submit your reference number. Unlocks after a quick review.</span>
                </div>
                <span className="pm-option-badge">Manual</span>
              </button>
              <button className="pm-option-btn" onClick={startRazorpay} disabled={loading}>
                <span className="pm-option-icon pm-option-icon--accent"><FaCreditCard size={18} /></span>
                <div className="pm-option-copy">
                  <strong>Pay by Card / UPI</strong>
                  <span>Unlocks immediately &mdash; secured by Razorpay.</span>
                </div>
                <span className="pm-option-badge pm-option-badge--accent">Instant</span>
              </button>
            </div>
          )}

          {stage === 'razorpay_processing' && (
            <div className="pm-loading-state">
              <span className="pm-spinner" />
              <p>Waiting for payment confirmation&hellip;</p>
              <span className="pm-loading-hint">Don&apos;t close this window</span>
            </div>
          )}

          {stage === 'upi_pending' && order && (
            <div className="pm-upi-flow">
              <span className="pm-pay-to">Pay to <strong>{order.payment.payee_name || 'Study Portal'}</strong></span>

              <div className="pm-qr-frame">
                <img src={order.payment.qr_image} alt="UPI QR code" className="pm-qr" />
              </div>

              <a
                className="pm-upi-app-btn"
                href={order.payment.upi_uri}
                onClick={(e) => {
                  // upi:// links only resolve on a phone with a UPI app installed.
                  if (!/Android|iPhone/i.test(navigator.userAgent)) e.preventDefault();
                }}
              >
                <FaQrcode size={15} /> Open UPI app to pay
              </a>

              <div className="pm-or-divider">or pay manually</div>

              <button type="button" className="pm-upi-id-chip" onClick={copyUpiId}>
                <span>{order.payment.upi_id}</span>
                {copied ? <FaCheck size={12} className="pm-copied-icon" /> : <FaCopy size={12} />}
              </button>

              <p className="pm-hint">{order.payment.instructions}</p>

              <form onSubmit={handleSubmitProof} className="pm-form">
                <div className="pm-form-field">
                  <label htmlFor="pm-utr">UTR / Transaction reference <span className="pm-required">*</span></label>
                  <input
                    id="pm-utr"
                    type="text"
                    value={utr}
                    onChange={(e) => setUtr(e.target.value)}
                    placeholder="e.g. 402812345678"
                    autoComplete="off"
                    required
                  />
                  <span className="pm-field-hint">Found in your UPI app&apos;s payment history, right after you pay.</span>
                </div>

                <div className="pm-form-field">
                  <label htmlFor="pm-proof">Payment screenshot <span className="pm-optional">(optional)</span></label>
                  <label htmlFor="pm-proof" className="pm-file-btn">
                    {proofFile ? proofFile.name : 'Choose a file'}
                  </label>
                  <input
                    id="pm-proof"
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="pm-file-input"
                  />
                </div>

                <button type="submit" className="pm-submit-btn" disabled={loading}>
                  {loading ? 'Submitting…' : 'Submit for review'}
                </button>
                <button
                  type="button"
                  className="pm-back-btn"
                  onClick={() => { setStage('choose'); setError(''); }}
                >
                  <FaArrowLeft size={11} /> Choose a different way to pay
                </button>
              </form>
            </div>
          )}

          {stage === 'upi_submitted' && (
            <div className="pm-success">
              <span className="pm-success-icon"><FaCheckCircle size={26} /></span>
              <h4>Submitted for review</h4>
              <p>An admin will verify your payment shortly — usually within a few hours. The note unlocks automatically the moment it&apos;s approved.</p>
              <button className="pm-submit-btn" onClick={onClose}>Done</button>
            </div>
          )}

          {stage === 'success' && (
            <div className="pm-success">
              <span className="pm-success-icon"><FaCheckCircle size={26} /></span>
              <h4>Payment verified</h4>
              <p>This note is unlocked and ready to download.</p>
              <button className="pm-submit-btn" onClick={onClose}>Continue</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
