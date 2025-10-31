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
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-8 bg-white">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
        Powerful Features for Smart Investors
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {features.map((f, i) => (
          <div
            key={i}
            data-aos="fade-up"         // 👈 bottom-to-top animation
            data-aos-delay={i * 200}   // 👈 staggered animation
            className="p-6 bg-gray-100 rounded-lg shadow hover:bg-blue-300 transition"
          >
            <h3 className="text-xl font-semibold text-indigo-600 mb-4">{f.title}</h3>
            <p className="text-gray-600">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
