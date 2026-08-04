import { useEffect, useState } from "react";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area, Label 
} from "recharts";
import { API_BASE_URL } from "../config/api";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

const MarketAnalytics = () => {
  const [snapshots, setSnapshots] = useState([]);
  const [holdings, setHoldings] = useState([]);
  const [userBalance, setUserBalance] = useState(5000);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [snapRes, holdRes, userRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/portfolio/snapshots?range=30d`, { headers }),
          fetch(`${API_BASE_URL}/api/portfolio/holdings`, { headers }),
          fetch(`${API_BASE_URL}/api/users/profile`, { headers }),
        ]);

        const snapData = await snapRes.json();
        const holdData = await holdRes.json();
        if (userRes.ok) {
          const userData = await userRes.json();
          setUserBalance(userData.balance ?? 5000);
        }

        const actualSnapData = Array.isArray(snapData) ? snapData : snapData.data || [];
        const actualHoldData = Array.isArray(holdData) ? holdData : holdData.data || [];

        const formattedSnaps = actualSnapData.map(s => ({
          ...s,
          date: s.date || new Date(s.dateFull || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: Number(s.value ?? s.totalValue) || 0 
        }));

        setSnapshots(formattedSnaps);
        setHoldings(actualHoldData);
      } catch (err) {
        console.error("Analytics Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const pieData = holdings
    .map(h => {
      const price = Number(h.currentPrice) || Number(h.avgCost) || 0;
      const value = Number(h.quantity) * price;
      return { name: h.symbol, value: parseFloat(value.toFixed(2)) };
    })
    .filter(item => item.value > 0);

  const totalStockValue = pieData.reduce((sum, item) => sum + item.value, 0);
  const currentNetWorth = userBalance + totalStockValue;

  const startVal = snapshots.length > 0 ? snapshots[0].value : 5000;
  const currentVal = snapshots.length > 0 ? snapshots[snapshots.length - 1].value : currentNetWorth;
  const change30d = currentVal - startVal;
  const change30dPct = startVal > 0 ? (change30d / startVal) * 100 : 0;
  const isPositive30d = change30d >= 0;

  if (loading) return <div className="p-10 text-center text-white">Generating Analytics...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto text-white space-y-8">
      {/* Header & Net Worth Badges */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Net Worth & Returns Analytics</h2>
          <p className="text-gray-400">Track actual portfolio net worth (Cash + Stocks) over 30 days.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="bg-gray-800 border border-gray-700 px-4 py-2.5 rounded-xl">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cash Balance</p>
            <p className="text-base font-mono font-bold text-blue-400">${userBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 px-4 py-2.5 rounded-xl">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Stocks Value</p>
            <p className="text-base font-mono font-bold text-indigo-400">${totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-gray-800 border border-blue-500/50 bg-blue-600/10 px-5 py-2.5 rounded-xl">
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Total Net Worth</p>
            <p className="text-xl font-mono font-bold text-white">${currentNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Performance Chart */}
        <div className="lg:col-span-2 bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-300">Net Worth Trajectory (30 Days)</h3>
              <p className="text-xs text-gray-400 mt-0.5">Calculated from actual MongoDB cash balance and stock holdings</p>
            </div>
            <div className={`px-3 py-1 rounded-full border text-xs font-mono font-bold ${isPositive30d ? "bg-green-900/30 border-green-500/50 text-green-400" : "bg-red-900/30 border-red-500/50 text-red-400"}`}>
              30d: {isPositive30d ? "+" : ""}${change30d.toFixed(2)} ({isPositive30d ? "+" : ""}{change30dPct.toFixed(2)}%)
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="99%" height="100%">
              {snapshots.length > 0 ? (
                <AreaChart data={snapshots}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive30d ? "#10b981" : "#ef4444"} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={isPositive30d ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    domain={["auto", "auto"]}
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `$${Number(val).toLocaleString()}`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }}
                    formatter={(value) => [`$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Portfolio Value"]}
                    labelFormatter={(label) => `Date: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={isPositive30d ? "#10b981" : "#ef4444"} 
                    strokeWidth={3}
                    fillOpacity={1}   
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 italic">No snapshot data available</div>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Allocation Pie/Donut Chart */}
        <div className="bg-gray-800 border border-gray-700 p-6 rounded-2xl shadow-xl">
          <h3 className="text-xl font-semibold mb-6 text-gray-300">Asset Allocation</h3>
          <div className="h-[300px] w-full">
            {/* FIX: width="99%" applies here too */}
            <ResponsiveContainer width="99%" height="100%">
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