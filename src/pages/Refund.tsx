const Refund = () => {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Headline */}
        <div className="mb-8 text-center">
          <h1 className="font-poppins font-black text-4xl uppercase" style={{ color: '#3b2a20', borderBottom: '4px solid #b5edce', display: 'inline-block' }}>
            REFUND & RETURN POLICY
          </h1>
        </div>

        {/* Effective Date */}
        <div className="mb-8 text-center">
          <p className="font-poppins font-light text-lg" style={{ color: '#5e4338' }}>
            Effective Date: October 2025
          </p>
        </div>

        {/* Intro */}
        <div className="mb-8">
          <p className="font-poppins font-light text-base" style={{ color: '#5e4338' }}>
            Because our products are perishable, Freel It follows a no-return policy once an order has been delivered.
          </p>
          <p className="font-poppins font-light text-base" style={{ color: '#5e4338' }}>
            However, we want every customer to have a great experience, so we do allow refunds or replacements in the rare cases described below.
          </p>
        </div>

        {/* Section 1 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            When You're Eligible
          </h3>
          <div className="font-poppins font-medium text-base mb-2" style={{ color: '#5e4338' }}>
            You may request a refund or replacement only if:
          </div>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>The product delivered is completely different from what you ordered, or</p>
            <p>The package is damaged or tampered when it arrives.</p>
            <p>To help us verify this, please record a short unboxing video showing the sealed package before opening.</p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            How to Report an Issue
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>Notify us within 2 days of delivery at <a href="mailto:care@freelit.in" style={{ color: '#b5edce' }}>care@freelit.in</a> with your order ID, a brief description, and supporting photos/video.</p>
            <p>Once verified, we'll arrange a replacement or refund within 5–7 business days.</p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            Refund Method
          </h3>
          <div className="font-poppins font-medium text-base mb-2" style={{ color: '#5e4338' }}>
            Refunds will be processed:
          </div>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>To the original payment method (for prepaid orders), or</p>
            <p>Via bank transfer for Cash on Delivery orders after you share your account details securely with our team.</p>
          </div>
        </div>

        {/* Note */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-xl mb-4" style={{ color: '#3b2a20' }}>
            Note
          </h3>
          <div className="font-poppins font-light text-base" style={{ color: '#5e4338', borderLeft: '4px solid #b5edce', borderRadius: '2px', paddingLeft: '12px' }}>
            Taste preferences or change-of-mind cases are not eligible for refunds due to product safety standards.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Refund;
