import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from 'recharts';

export function AttendanceChart({ data, type = 'line', dataKey = 'rate', xKey = 'month', height = 260 }) {
  const Chart = type === 'bar' ? BarChart : LineChart;
  return <div className="chart-container" style={{ height }}><ResponsiveContainer width="100%" height="100%"><Chart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
    <CartesianGrid stroke="#edf0f5" vertical={false} />
    <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
    <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} tickFormatter={(value) => `${value}%`} />
    <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} contentStyle={{ borderRadius: 10, borderColor: '#e8ebf1', boxShadow: '0 8px 24px #0f172a12' }} />
    {type === 'bar' ? <Bar dataKey={dataKey} fill="#4f46e5" radius={[5, 5, 0, 0]} barSize={28} /> : <Line type="monotone" dataKey={dataKey} stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#fff', stroke: '#4f46e5', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />}
  </Chart></ResponsiveContainer></div>;
}
