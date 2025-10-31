const Terms = () => {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Headline */}
        <div className="mb-8 text-center">
          <h1 className="font-poppins font-black text-4xl uppercase" style={{ color: '#3b2a20', borderBottom: '4px solid #b5edce', borderRadius: '2px', display: 'inline-block' }}>
            TERMS AND CONDITIONS
          </h1>
        </div>

        {/* Effective Date */}
        <div className="mb-8 text-center">
          <p className="font-poppins font-light text-lg" style={{ color: '#5e4338' }}>
            Effective Date: October 2025
          </p>
        </div>

        {/* Subheadline */}
        <div className="mb-6">
          <h2 className="font-poppins font-black text-2xl" style={{ color: '#3b2a20' }}>
            Welcome to Freel It.
          </h2>
        </div>

        {/* Body */}
        <div className="font-poppins font-light text-base mb-8" style={{ color: '#5e4338' }}>
          <p>By browsing or shopping on our website, you agree to the terms below.</p>
          <p>We keep things simple, transparent, and human. Because we want your experience with us to feel as good as our products.</p>
        </div>

        {/* Section 1 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            1. Using This Website
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>Everything you see here, from our content to our packaging photos, belongs to Freel It.
                Please don’t reuse, copy, or redistribute anything without written permission.</p>
            <p style={{ color: '#b5edce' }}>We love when you share your Freel It moments online — just tag us when you do.</p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            2. Products & Descriptions
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>We do our best to show every product as it truly is.</p>
            <p>Because we use real ingredients, small variations in color, shape, or texture can happen — that’s how you know it’s made naturally.</p>
            <p>If anything feels unclear about a product, please reach out to us at <a href="mailto:care@freelit.in" style={{ color: '#b5edce' }}>care@freelit.in</a> before placing your order, we’re happy to explain.</p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            3. Orders & Payments
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>All orders are confirmed only after payment is successfully received through our trusted secure gateway partner.</p>
            <p>If an item is unavailable after you order, we’ll contact you quickly to arrange a refund or replacement — whatever works best for you.</p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            4. Shipping & Delivery
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>Once an order leaves our facility, it’s handled by trusted partners and local couriers.</p>
            <p>Delivery times (usually 3–7 days) may vary due to weather, strikes, or other regional issues.</p>
            <p>While such delays are beyond our direct control, we always stay in touch with our shipping partners to get your order to you as fast as possible.</p>
            <p>If anything goes off schedule, we’ll do everything we can to resolve it quickly and keep you updated.</p>
          </div>
        </div>

        {/* Section 5 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            5. Returns & Refunds
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>Because our products are food-based, we can’t accept returns for opened or used items — but we absolutely replace or refund when something goes wrong on our end (wrong product or damage in transit).</p>
            <p>If that ever happens, we’ll handle it with care and make sure you don’t have to face that inconvenience again.</p>
            <p style={{ color: '#3b2a20' }}>Please read our <a href="/refund-policy" style={{ color: '#b5edce' }}>Refund & Return Policy</a> for full details.</p>
          </div>
        </div>

        {/* Section 6 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            6. Limitation of Liability
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>We do our best to ensure smooth operations, but there may be rare situations — like courier mishandling or delayed deliveries — where we can’t be directly held responsible.</p>
            <p>That said, we take every issue seriously and always work with our partners to prevent it from happening again.</p>
            <p>Your trust matters more than the fine print.</p>
          </div>
        </div>

        {/* Section 7 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            7. Privacy
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>Your data is safe with us and handled responsibly.</p>
            <p>Using our website means you also agree to our <span style={{ color: '#b5edce' }}>Privacy Policy</span>.</p>
          </div>
        </div>

        {/* Section 8 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            8. Governing Law
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>All purchases and disputes fall under the laws of India, with the jurisdiction of Hyderabad, Telangana.</p>
            <p>But we prefer solving everything through understanding and support before it ever needs to go that far.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
