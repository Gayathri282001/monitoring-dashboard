import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import { fetchMetrics } from "./api";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function MetricCard({ title, value }) {
  return (
    <div style={{border: "1px solid #ddd", padding: 12, borderRadius: 8, minWidth: 140}}>
      <h4 style={{margin: 0}}>{title}</h4>
      <div style={{fontSize: 20, marginTop: 8}}>{value}</div>
    </div>
  )
}

export default function App(){
  const [history, setHistory] = useState([]);
  const [latest, setLatest] = useState(null);

  useEffect(() => {
    let mounted = true;
    const poll = async () => {
      try {
        const data = await fetchMetrics();
        if (!mounted) return;
        setLatest(data.metrics);
        setHistory(h => {
          const next = [...h, {t: data.timestamp, ...data.metrics}].slice(-50);
          return next;
        });
      } catch(e) { console.error("fetch error", e); }
    }
    poll();
    const id = setInterval(poll, 10000);
    return () => { mounted = false; clearInterval(id); }
  }, []);

  const labels = history.map(h => new Date(h.t*1000).toLocaleTimeString());
  const cpuData = history.map(h => h.cpu_percent);
  const latData = history.map(h => h.latency_ms);
  const countData = history.map(h => h.monotonic_counter);

  return (
    <div style={{padding: 20, fontFamily: "Arial, sans-serif"}}>
      <h2>Monitoring Dashboard</h2>
      <div style={{display: "flex", gap: 12, marginBottom: 16}}>
        <MetricCard title="CPU %" value={latest ? `${latest.cpu_percent}%` : "—"} />
        <MetricCard title="Latency (ms)" value={latest ? `${latest.latency_ms} ms` : "—"} />
        <MetricCard title="Errors" value={latest ? latest.error_count : "—"} />
        <MetricCard title="Counter" value={latest ? latest.monotonic_counter : "—"} />
      </div>

      <div style={{display: "grid", gridTemplateColumns: "1fr", gap: 18}}>
        <div>
          <h4>CPU %</h4>
          <Line data={{
            labels,
            datasets: [{ label: 'CPU %', data: cpuData, fill: false }]
          }} />
        </div>

        <div>
          <h4>Latency (ms)</h4>
          <Line data={{
            labels,
            datasets: [{ label: 'Latency ms', data: latData, fill: false }]
          }} />
        </div>

        <div>
          <h4>Monotonic Counter</h4>
          <Line data={{
            labels,
            datasets: [{ label: 'Counter', data: countData, fill: false }]
          }} />
        </div>
      </div>
    </div>
  );
}
