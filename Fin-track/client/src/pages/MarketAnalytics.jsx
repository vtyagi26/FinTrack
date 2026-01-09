import { useEffect, useState } from "react";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area, Label 
} from "recharts";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const MarketAnalytics = () => {
  const [snapshots, setSnapshots] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [snapRes, holdRes] = await Promise.all([
          fetch("http://localhost:5000/api/portfolio/snapshots?range=30d", { headers }),
          fetch("http://localhost:5000/api/portfolio/holdings", { headers })
        ]);

        const snapData = await snapRes.json();
        const holdData = await holdRes.json();

        const formattedSnaps = Array.isArray(snapData) ? snapData.map(s => ({
          ...s,
          date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        })) : [];

        setSnapshots(formattedSnaps);
        setHoldings(Array.isArray(holdData) ? holdData : []);
      } catch (err) {
        console.error("Analytics Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- DATA TRANSFORMATION & SAFETY CHECKS ---
  // Ensure numeric values and fallback to avgCost if live price is missing
  const pieData = holdings
    .map(h => {
      const price = Number(h.currentPrice) || Number(h.avgCost) || 0;
      const value = Number(h.quantity) * price;
      return { name: h.symbol, value: parseFloat(value.toFixed(2)) };
    })
    .filter(item => item.value > 0); // Recharts cannot render slices with 0 value

  const totalPortfolioValue = pieData.reduce((sum, item) => sum + item.value, 0);

  if (loading) return <div className="p-10 text-center text-white">Generating Analytics...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <h2 className="text-3xl font-bold mb-8">Market Analytics</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Performance Chart */}
        <div className="lg:col-span-2 bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-xl">
          <h3 className="text-xl font-semibold mb-6 text-gray-300">Portfolio Performance (30 Days)</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={snapshots}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#9ca3af" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1}   
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Pie/Donut Chart */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-xl">
          <h3 className="text-xl font-semibold mb-6 text-gray-300">Asset Allocation</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              {pieData.length > 0 ? (
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    isAnimationActive={true}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                    {/* Centered Total Value Label */}
                    <Label 
                      content={({ viewBox }) => {
                        const { cx, cy } = viewBox;
                        return (
                          <text x={cx} y={cy} fill="white" textAnchor="middle" dominantBaseline="central">
                            <tspan x={cx} y={cy - 10} fontSize="12" fill="#9ca3af" fontWeight="bold">TOTAL</tspan>
                            <tspan x={cx} y={cy + 15} fontSize="20" fontWeight="bold" fill="#3b82f6">
                              ${totalPortfolioValue > 1000 ? (totalPortfolioValue / 1000).toFixed(1) + 'k' : totalPortfolioValue.toFixed(0)}
                            </tspan>
                          </text>
                        );
                      }}
                    />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                  />
                  <Legend iconType="circle" />
                </PieChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 italic">No assets owned</div>
              )}
            </ResponsiveContainer>
          </div>

          <div className="mt-6 space-y-4">
             <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Holdings Breakdown</p>
             {pieData.map((item, i) => (
               <div key={item.name} className="flex justify-between items-center">
                 <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                    <span className="text-sm">{item.name}</span>
                 </div>
                 <span className="font-mono text-gray-400 text-sm">
                   {totalPortfolioValue > 0 ? ((item.value / totalPortfolioValue) * 100).toFixed(1) : 0}%
                 </span>
               </div>
             ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default MarketAnalytics;