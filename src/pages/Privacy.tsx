const Privacy = () => {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Headline */}
        <div className="mb-8 text-center">
          <h1 className="font-poppins font-black text-4xl uppercase" style={{ color: '#3b2a20', borderBottom: '4px solid #b5edce', borderRadius: '2px', display: 'inline-block' }}>
            PRIVACY POLICY
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
            Your privacy matters to us.<br />
            Freel It collects only the information needed to process orders, improve service, and communicate better with you.
          </p>
        </div>

        {/* Section 1 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            What We Collect
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>Name, shipping address, email, and phone number when you place an order.</p>
            <p>Payment details (securely handled by our trusted payment gateway partner).</p>
            <p>Optional information if you sign up for updates or analytics cookies.</p>
          </div>
        </div>

        {/* Section 2 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            How We Use It
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>To confirm, process, and deliver your orders.</p>
            <p>To send shipping updates and customer support communication.</p>
            <p>To understand website traffic and improve experience using trusted analytics tools.</p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            Data Sharing
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>We may share limited data with:</p>
            <p>- Payment processors</p>
            <p>- Shipping partners</p>
            <p>- Analytics and marketing tools (e.g., Google Analytics, Meta Ads)</p>
            <p>All partners follow strict confidentiality and security standards. We never sell or rent your data to anyone.</p>
          </div>
        </div>

        {/* Section 4 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            Your Choices
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>You can opt out of marketing emails anytime by clicking "unsubscribe" or contacting us directly.</p>
          </div>
        </div>

        {/* Section 5 */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            Security
          </h3>
          <div className="font-poppins font-light text-base space-y-2" style={{ color: '#5e4338' }}>
            <p>All transactions are encrypted and processed through secure gateways.</p>
          </div>
        </div>

        {/* Contact */}
        <div className="mb-8" style={{ borderLeft: '4px solid #b5edce', paddingLeft: '12px' }}>
          <p className="font-poppins font-light text-base" style={{ color: '#5e4338' }}>
            For questions about your data, reach us at <a href="mailto:care@freelit.in" style={{ color: '#b5edce' }}>care@freelit.in</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
