const About = () => {
  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Headline */}
        <div className="mb-8 text-center">
          <h1 className="font-poppins font-black text-4xl uppercase" style={{ color: '#3b2a20', borderBottom: '4px solid #b5edce', display: 'inline-block' }}>
            WE <span style={{ color: '#b5edce' }}>REBUILD</span> FOOD, THOUGHTFULLY
          </h1>
        </div>
        {/* Body */}
        <div className="font-saira font-medium text-lg space-y-4 mb-8" style={{ color: '#5e4338' }}>
          <p>At Freel It, we take the foods people already love and rebuild them from the ground up.</p>
          <p>Every ingredient we use is real, simple, and chosen with purpose — not just to look clean on a label, but to keep your nutrition in balance too.</p>
          <p>Because food shouldn’t lose what matters in the name of being healthy.</p>
          <p>We don’t just use real ingredients, we rebuild the food into better versions that keep the nutrition balanced.</p>
          <p>Each Freel It product is designed to feel right, fuel better, and fit naturally into your everyday life, without extremes or empty promises.</p>
        </div>
        {/* Subtext */}
        <div className="font-saira font-black text-2xl uppercase" style={{ color: '#5e4338', borderLeft: '4px solid #b5edce', paddingLeft: '12px' }}>
          REAL INGREDIENTS. REAL NUTRITION. REBUILT SMARTER.
        </div>
      </div>
    </div>
  );
};

export default About;
