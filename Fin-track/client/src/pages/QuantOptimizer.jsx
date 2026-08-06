import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from "recharts";

import { API_BASE_URL } from "../config/api";

const BACKEND_URL = API_BASE_URL;

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#ef4444", "#14b8a6"];

export default function QuantOptimizer({ holdings = [] }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMsg, setStatusMsg] = useState("");

  const runOptimization = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setStatusMsg("Checking quant service...");

      if (!holdings || holdings.length < 2) {
        throw new Error("At least 2 holdings are required to run portfolio optimization.");
      }

      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // Helper: run the optimize request
      const doOptimize = async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s for Render cold boots
        try {
          const response = await fetch(`${BACKEND_URL}/quant/optimize`, {
            method: "POST",
            headers,
            signal: controller.signal,
            body: JSON.stringify({
              holdings,
              riskFreeRate: 0.06,
              horizonDays: 252,
              simulations: 1000,
            }),
          });
          clearTimeout(timeoutId);
          return response;
        } catch (err) {
          clearTimeout(timeoutId);
          throw err;
        }
      };

      setStatusMsg("Running optimization...");
      let response = await doOptimize();

      // If Render quant service was sleeping (502), wait and retry once
      if (response.status === 502 || response.status === 503) {
        setStatusMsg("Quant service is waking up on Render (this takes ~30s)... please wait.");
        await new Promise((r) => setTimeout(r, 35000));
        setStatusMsg("Retrying optimization...");
        response = await doOptimize();
      }

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend quant error:", data);
        const rawErrorStr =
          typeof data.error === "string" ? data.error :
          typeof data.error === "object" ? JSON.stringify(data.error) :
          typeof data.message === "string" ? data.message : "";

        let errMsg = data.error || data.message || "Optimization failed. Please try again.";

        if (rawErrorStr.includes("<html") || rawErrorStr.includes("<!DOCTYPE") ||
            rawErrorStr.includes("Bad Gateway") || rawErrorStr.includes("502")) {
          errMsg = "The Quant service is still waking up on Render. Please try again in 30 seconds.";
        }

        throw new Error(errMsg);
      }

      setStatusMsg("");
      setResult(data);
    } catch (error) {
      console.error(error);
      if (error.name === "AbortError") {
        setErrorMessage("Request timed out (90s). The Quant service on Render may be under heavy load — please try again.");
      } else {
        setErrorMessage(error.message || "Failed to run portfolio optimizer");
      }
      setStatusMsg("");
    } finally {
      setLoading(false);
    }
  };

  const weightsToPieData = (weights = {}) => {
    return Object.entries(weights).map(([ticker, weight]) => ({
      name: ticker,
      value: Number((weight * 100).toFixed(2))
    }));
  };

  const rebalanceData = result?.rebalance?.map((item) => ({
    ticker: item.ticker,
    current: Number((item.currentWeight * 100).toFixed(2)),
    optimal: Number((item.optimalWeight * 100).toFixed(2))
  })) || [];

  const currentGraph = result?.monteCarlo?.current?.graph || [];
  const optimalGraph = result?.monteCarlo?.optimal?.graph || [];

  const monteCarloData =
    currentGraph.length > 0 && optimalGraph.length > 0
      ? currentGraph.map((point, index) => ({
          day: point.day,
          currentMedian: point.median,
          currentP5: point.p5,
          currentP95: point.p95,
          optimalMedian: optimalGraph[index]?.median,
          optimalP5: optimalGraph[index]?.p5,
          optimalP95: optimalGraph[index]?.p95
        }))
      : [];

  return (
    <div className="p-8 space-y-8 bg-gray-900 min-h-screen text-white">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <p className="text-sm text-blue-400 font-bold uppercase tracking-widest">
              Quant Lab
            </p>
            <h1 className="text-3xl font-black mt-2">
              Portfolio Optimizer
            </h1>
            <p className="text-gray-400 mt-2 max-w-2xl">
              Compare your current portfolio with a Markowitz-optimized portfolio and run Monte Carlo simulations on both.
            </p>
          </div>

          <button
            onClick={runOptimization}
            disabled={loading || holdings.length < 2}
            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {loading ? "Running..." : "Run Optimizer"}
          </button>
        </div>

        {statusMsg && (
          <div className="mt-4 flex items-center gap-3 text-blue-300 text-sm bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
            <svg className="animate-spin h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            {statusMsg}
          </div>
        )}

        {holdings.length < 2 && (
          <p className="mt-4 text-sm text-red-400">
            Add at least 2 holdings to run portfolio optimization.
          </p>
        )}

        {errorMessage && (
          <div className="mt-5 bg-red-500/10 border border-red-500/40 rounded-xl p-4 text-red-300">
            <p className="font-semibold">Optimizer failed</p>
            <p className="text-sm mt-1">{errorMessage}</p>
          </div>
        )}
      </div>

      {result && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard title="Current Portfolio" portfolio={result.currentPortfolio} />
            <MetricCard title="Optimal Portfolio" portfolio={result.optimalPortfolio} highlight />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PieCard
              title="Current Allocation"
              data={weightsToPieData(result.currentPortfolio.weights)}
            />
            <PieCard
              title="Optimal Allocation"
              data={weightsToPieData(result.optimalPortfolio.weights)}
            />
          </div>

          <ChartCard title="Current vs Optimal Weights">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={rebalanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="ticker" tick={{ fill: "#d1d5db" }} />
                <YAxis tick={{ fill: "#d1d5db" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Bar dataKey="current" name="Current Weight %" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="optimal" name="Optimal Weight %" fill="#22c55e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {monteCarloData.length > 0 ? (
            <>
              <ChartCard title="Monte Carlo Simulation: Median Path">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={monteCarloData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" tick={{ fill: "#d1d5db" }} />
                    <YAxis tick={{ fill: "#d1d5db" }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="currentMedian"
                      name="Current Portfolio Median"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="optimalMedian"
                      name="Optimal Portfolio Median"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <MonteCarloBandChart
                  title="Current Portfolio Simulation Range"
                  data={monteCarloData}
                  prefix="current"
                />
                <MonteCarloBandChart
                  title="Optimal Portfolio Simulation Range"
                  data={monteCarloData}
                  prefix="optimal"
                />
              </div>
            </>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/40 rounded-2xl p-5 text-yellow-200">
              Monte Carlo graph data is empty. Your backend endpoint is working, but the Python service is probably still returning placeholder Monte Carlo arrays.
            </div>
          )}

          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Rebalancing Suggestions</h2>

            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-900 text-gray-300">
                    <th className="p-3 text-left">Ticker</th>
                    <th className="p-3 text-left">Current Weight</th>
                    <th className="p-3 text-left">Optimal Weight</th>
                    <th className="p-3 text-left">Difference</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rebalance.map((item) => (
                    <tr key={item.ticker} className="border-t border-gray-700 hover:bg-gray-700/40">
                      <td className="p-3 font-bold text-white">{item.ticker}</td>
                      <td className="p-3 text-gray-300">{(item.currentWeight * 100).toFixed(2)}%</td>
                      <td className="p-3 text-gray-300">{(item.optimalWeight * 100).toFixed(2)}%</td>
                      <td className="p-3 text-gray-300">{(item.difference * 100).toFixed(2)}%</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            item.action === "BUY"
                              ? "bg-green-500/10 text-green-400"
                              : item.action === "SELL"
                              ? "bg-red-500/10 text-red-400"
                              : "bg-gray-500/10 text-gray-300"
                          }`}
                        >
                          {item.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "#111827",
  border: "1px solid #374151",
  borderRadius: "12px",
  color: "#ffffff"
};

function MetricCard({ title, portfolio, highlight = false }) {
  return (
    <div
      className={`rounded-2xl shadow-lg p-6 border ${
        highlight
          ? "bg-blue-600/10 border-blue-500/50"
          : "bg-gray-800 border-gray-700"
      }`}
    >
      <p className="text-sm text-gray-400 uppercase tracking-widest font-bold">
        {title}
      </p>

      <div className="grid grid-cols-2 gap-4 mt-5">
        <Metric label="Expected Return" value={`${(portfolio.expectedReturn * 100).toFixed(2)}%`} />
        <Metric label="Volatility" value={`${(portfolio.volatility * 100).toFixed(2)}%`} />
        <Metric label="Sharpe Ratio" value={portfolio.sharpeRatio.toFixed(3)} />
        <Metric label="Expected Value" value={`₹${portfolio.finalExpectedValue.toLocaleString()}`} />
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="bg-gray-900/70 rounded-xl p-4 border border-gray-700">
      <p className="text-xs text-gray-500 uppercase font-bold">{label}</p>
      <p className="text-xl font-black text-white mt-2">{value}</p>
    </div>
  );
}

function PieCard({ title, data }) {
  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={110}
            label={({ name, value }) => `${name}: ${value}%`}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
      {children}
    </div>
  );
}

function MonteCarloBandChart({ title, data, prefix }) {
  const p5Key = `${prefix}P5`;
  const medianKey = `${prefix}Median`;
  const p95Key = `${prefix}P95`;

  return (
    <ChartCard title={title}>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="day" tick={{ fill: "#d1d5db" }} />
          <YAxis tick={{ fill: "#d1d5db" }} />
          <Tooltip contentStyle={tooltipStyle} />
          <Legend />
          <Line type="monotone" dataKey={p5Key} name="5th Percentile" stroke="#ef4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey={medianKey} name="Median" stroke="#3b82f6" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey={p95Key} name="95th Percentile" stroke="#22c55e" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}