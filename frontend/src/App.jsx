import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

const socket = io("http://localhost:5000");

export default function App() {

  const [events,setEvents] = useState([]);
  const [chartData,setChartData] = useState([]);
  const [metrics,setMetrics] = useState({
    drivers: new Set(),
    trips:0,
    violations:0,
    risk:0
  });


  useEffect(()=>{

    socket.on("new-event",(event)=>{

      setEvents(prev=>[event,...prev.slice(0,10)]);

      setChartData(prev=>[
        ...prev,
        {
          time:new Date().toLocaleTimeString(),
          speed:event.speed
        }
      ]);

      setMetrics(prev=>{

        const drivers = new Set(prev.drivers);
        drivers.add(event.driverId);

        return {
          drivers,
          trips:prev.trips+1,
          violations:event.eventType !== "normal"
            ? prev.violations+1
            : prev.violations,
          risk:event.speed > 80
            ? prev.risk+5
            : prev.risk
        };
      });

    });

  },[]);


  return (

  <div className="bg-gray-900 min-h-screen text-white p-6">

  <h1 className="text-3xl font-bold mb-6">
  Fleet Monitoring Dashboard
  </h1>


  {/* METRICS */}

  <div className="grid grid-cols-4 gap-4 mb-8">

  <div className="bg-gray-800 p-4 rounded">
  Live Drivers
  <div className="text-2xl">{metrics.drivers.size}</div>
  </div>

  <div className="bg-gray-800 p-4 rounded">
  Trips
  <div className="text-2xl">{metrics.trips}</div>
  </div>

  <div className="bg-gray-800 p-4 rounded">
  Violations
  <div className="text-2xl">{metrics.violations}</div>
  </div>

  <div className="bg-gray-800 p-4 rounded">
  Risk Score
  <div className="text-2xl">{metrics.risk}</div>
  </div>

  </div>


  {/* VIDEO */}

  <div className="mb-8">

  <iframe
  className="w-full h-[400px] rounded"
  src="https://www.youtube.com/embed/t6G3n4C5E0k"
  title="Dashcam Feed"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
  />

  </div>


  {/* CHART */}

  <div className="bg-gray-800 p-4 rounded mb-8">

  <h2 className="mb-4 text-xl">Speed Trend</h2>

  <ResponsiveContainer width="100%" height={300}>

  <LineChart data={chartData}>

  <CartesianGrid strokeDasharray="3 3" />

  <XAxis dataKey="time" />

  <YAxis />

  <Tooltip />

  <Line
    type="monotone"
    dataKey="speed"
    stroke="#22c55e"
    strokeWidth={2}
  />

  </LineChart>

  </ResponsiveContainer>

  </div>


  {/* TABLE */}

  <div className="bg-gray-800 rounded p-4">

  <h2 className="mb-4 text-xl">Live Events</h2>

  <table className="w-full">

  <thead>
  <tr className="border-b border-gray-700">
  <th className="text-left p-2">Driver</th>
  <th className="text-left p-2">Vehicle</th>
  <th className="text-left p-2">Event</th>
  <th className="text-left p-2">Speed</th>
  </tr>
  </thead>

  <tbody>

  {events.map((e,i)=>(
  <tr key={i} className="border-b border-gray-700">

  <td className="p-2">{e.driverId}</td>
  <td className="p-2">{e.vehicleId}</td>

  <td className={`p-2 ${
    e.eventType !== "normal"
      ? "text-red-400"
      : "text-green-400"
  }`}>

  {e.eventType}

  </td>

  <td className="p-2">{e.speed}</td>

  </tr>
  ))}

  </tbody>

  </table>

  </div>

  </div>
  );
}