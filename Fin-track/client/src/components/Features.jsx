const features = [
  {
    title: "Real-time Market Data",
    desc: "Stay updated with live stock indices like Nifty, Sensex, and global markets.",
  },
  {
    title: "Portfolio Tracking",
    desc: "Track your holdings, orders, and funds all in one dashboard.",
  },
  {
    title: "Secure Authentication",
    desc: "Your data is protected with modern authentication and encryption.",
  },
  {
    title : "Risk Assesment",
    desc : "Analyse your next step with most advanced quant layer tracking"
  },
  {
    title : "Chat Assisted Learning",
    desc : "Learn from our advanced AI bot about anything related to finance!"
  },
  {
    title : "Plan your next step!",
    desc : "Ask for ML system to analyse and plan for you!"
  }
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-8 bg-sky-100">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
        Powerful Features for Smart Investors
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((f, i) => (
          <div
            key={i}
            data-aos="fade-up"       
            data-aos-delay={i * 200}
            className="p-6 bg-black rounded-lg shadow hover:bg-gray-800 transition"
          >
            <h3 className="text-xl font-semibold text-indigo-600 mb-4">{f.title}</h3>
            <p className="text-white">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}