const Contact = () => {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Headline */}
        <div className="mb-8 text-center">
          <h1 className="font-poppins font-black text-4xl uppercase" style={{ color: '#3b2a20', borderBottom: '4px solid #b5edce', display: 'inline-block' }}>
            WE'D LOVE TO HEAR FROM YOU.
          </h1>
        </div>

        {/* Body */}
        <div className="mb-8" style={{ borderLeft: '4px solid #b5edce', borderRadius: '4px', paddingLeft: '8px' }}>
          <p className="font-saira font-medium text-base" style={{ color: '#3b2a20' }}>
            Whether it's feedback, a question about your order, or just a thought about better food — we're always listening.
          </p>
        </div>

        {/* Customer Support */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            Customer Support
          </h3>
          <div className="font-saira font-medium text-base space-y-2">
            <p style={{ color: '#3b2a20' }}>For help with orders, shipping, or general inquiries:</p>
            <div style={{ borderLeft: '4px solid #b5edce', borderRadius: '4px', paddingLeft: '8px' }}>
              <p style={{ color: '#5e4338' }}>📧 <a href="mailto:care@freelit.in" style={{ color: '#5e4338' }}>care@freelit.in</a></p>
              <p style={{ color: '#5e4338' }}>📞 +91 6302249231</p>
            </div>
            <p style={{ color: '#3b2a20' }}>We usually respond within 24–48 hours on business days.</p>
          </div>
        </div>

        {/* Mailing Address */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            Mailing Address
          </h3>
          <div style={{ borderLeft: '4px solid #b5edce', borderRadius: '4px', paddingLeft: '8px' }}>
            <p className="font-saira font-medium text-base" style={{ color: '#b5edce' }}>Freel It</p>
            <p className="font-saira font-medium text-base" style={{ color: '#5e4338' }}>108, PSR Pride, Beside Canton Rows, Mechal-Malkajgiri, Hyderabad – 500067, India</p>
          </div>
        </div>

        {/* Collaborations & Partnerships */}
        <div className="mb-8">
          <h3 className="font-poppins font-black text-2xl mb-4" style={{ color: '#3b2a20' }}>
            Collaborations & Partnerships
          </h3>
          <div className="font-saira font-medium text-base">
            <p style={{ color: '#3b2a20' }}>
              If you're a creator, nutrition expert, or brand that shares our values and would like to collaborate, email us at <a href="mailto:care@freelit.in" style={{ color: '#b5edce' }}>care@freelit.in</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
