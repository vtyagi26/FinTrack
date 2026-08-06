export default function MarketProblems() {
  return (
    <section id="market-problems" className="py-20 bg-black text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-6">

        <div>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Put yourself a step ahead in today's stock market
          </h2>
          <ul className="space-y-4 text-lg text-gray-300">
            <li>📉 Unpredictable market volatility makes investments risky.</li>
            <li>📊 Overwhelming financial data with no clear insights.</li>
            <li>⏱️ Time-consuming manual tracking of portfolios.</li>
            <li>🤔 Lack of trusted guidance for new investors.</li>
          </ul>
        </div>

        <div className="flex justify-center">
          <img
            src="/stock_chaos.png"
            alt="Stock market chaos"
            className="rounded-xl shadow-2xl shadow-red-950/40 border border-gray-800 w-full max-w-[600px] md:max-w-[800px] lg:max-w-[900px] object-cover hover:scale-[1.02] transition-transform duration-300"
          />
        </div>
      </div>
    </section>
  );
}
