import React, { useState } from 'react';
import { CreditCard } from 'lucide-react';

const PaymentMethods = ({ onPaymentSelect, selectedPayment }) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const bangladeshPaymentMethods = [
    {
      id: 'bkash',
      name: 'bKash',
      name_bn: 'বিকাশ',
      icon: '📱',
      color: '#E2136E',
      description: 'Mobile payment via bKash',
      description_bn: 'বিকাশের মাধ্যমে পেমেন্ট'
    },
    {
      id: 'nagad',
      name: 'Nagad',
      name_bn: 'নগদ',
      icon: '📲',
      color: '#F47920',
      description: 'Mobile payment via Nagad',
      description_bn: 'নগদের মাধ্যমে পেমেন্ট'
    },
    {
      id: 'rocket',
      name: 'Rocket',
      name_bn: 'রকেট',
      icon: '🚀',
      color: '#8B1538',
      description: 'DBBL Rocket mobile payment',
      description_bn: 'রকেট মোবাইল পেমেন্ট'
    },
    {
      id: 'upay',
      name: 'Upay',
      name_bn: 'উপায়',
      icon: '💳',
      color: '#00B894',
      description: 'Upay digital payment',
      description_bn: 'উপায় ডিজিটাল পেমেন্ট'
    },
    {
      id: 'cash',
      name: 'Cash',
      name_bn: 'নগদ টাকা',
      icon: '💵',
      color: '#00B894',
      description: 'Pay with cash',
      description_bn: 'নগদ টাকায় পেমেন্ট'
    },
    {
      id: 'card',
      name: 'Debit/Credit Card',
      name_bn: 'ডেবিট/ক্রেডিট কার্ড',
      icon: '💳',
      color: '#4F46E5',
      description: 'Bank card payment',
      description_bn: 'ব্যাংক কার্ডে পেমেন্ট'
    }
  ];

  const handlePaymentSelect = (method) => {
    onPaymentSelect(method);
    setShowPaymentModal(false);
  };

  return (
    <div className="payment-methods">
      <button 
        className="payment-selector"
        onClick={() => setShowPaymentModal(true)}
      >
        <div className="payment-display">
          {selectedPayment ? (
            <>
              <span className="payment-icon">{selectedPayment.icon}</span>
              <div className="payment-text">
                <div className="payment-name">{selectedPayment.name}</div>
                <div className="payment-name-bn">{selectedPayment.name_bn}</div>
              </div>
            </>
          ) : (
            <>
              <CreditCard size={20} />
              <div className="payment-text">
                <div className="payment-name">Select Payment</div>
                <div className="payment-name-bn">পেমেন্ট পদ্ধতি নির্বাচন করুন</div>
              </div>
            </>
          )}
        </div>
        <span className="payment-arrow">›</span>
      </button>

      {showPaymentModal && (
        <div className="payment-modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="payment-modal-header">
              <h3>💳 পেমেন্ট পদ্ধতি | Payment Methods</h3>
              <button 
                className="close-button"
                onClick={() => setShowPaymentModal(false)}
              >
                ×
              </button>
            </div>

            <div className="payment-methods-list">
              {bangladeshPaymentMethods.map((method) => (
                <button
                  key={method.id}
                  className={`payment-method-item ${selectedPayment?.id === method.id ? 'selected' : ''}`}
                  onClick={() => handlePaymentSelect(method)}
                >
                  <div className="payment-method-icon">
                    <span style={{ color: method.color }}>{method.icon}</span>
                  </div>
                  <div className="payment-method-info">
                    <div className="payment-method-name">{method.name}</div>
                    <div className="payment-method-name-bn">{method.name_bn}</div>
                    <div className="payment-method-desc">{method.description_bn}</div>
                  </div>
                  {selectedPayment?.id === method.id && (
                    <div className="payment-selected-indicator">✓</div>
                  )}
                </button>
              ))}
            </div>

            <div className="payment-modal-footer">
              <p className="payment-note">
                🔒 নিরাপদ পেমেন্ট | Secure payments powered by SSL encryption
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;