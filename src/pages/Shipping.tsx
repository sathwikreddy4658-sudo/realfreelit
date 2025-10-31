const Shipping = () => {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Headline */}
        <div className="mb-8 text-center">
          <h1 className="font-poppins font-black text-4xl uppercase" style={{ color: '#3b2a20', borderBottom: '4px solid #b5edce', display: 'inline-block' }}>
            SHIPPING & DELIVERY POLICY
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
            At Freel It, we make sure your orders reach you as quickly and safely as possible.
          </p>
        </div>

        {/* Section 1 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            Order Processing
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>Smaller orders are dispatched within 1–2 business days.</p>
            <p>Bulk or larger quantities may take 2–4 business days to process.</p>
            <p>Orders are shipped only after successful payment confirmation.</p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            Shipping Partners & Coverage
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>We currently deliver across India through trusted partners and selected regional aggregators for faster local delivery.</p>
            <p>We do not ship internationally at this time.</p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            Delivery Timeline
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>Most orders arrive within 3–7 business days, depending on your region.</p>
            <p>Delivery delays may occur due to weather, courier workload, or local restrictions.</p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            Tracking
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>Once your order is shipped, you'll receive a tracking link by email or SMS. You can monitor your shipment anytime until it arrives.</p>
          </div>
        </div>

        {/* Section 5 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            Delays & Exceptions
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>If your order is delayed beyond 10 days, please contact us at <a href="mailto:care@freelit.in" style={{ color: '#b5edce' }}>care@freelit.in</a> or +91 6302249231 and we'll coordinate with our courier partner to resolve it.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
