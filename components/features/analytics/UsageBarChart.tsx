"use client";

import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface UsageData {
  name: string;
  audits: number;
}

interface UsageBarChartProps {
  data: UsageData[];
}

export default function UsageBarChart({ data }: UsageBarChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
          <Tooltip cursor={{ fill: "rgba(0,0,0,0.1)" }} contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "8px", color: "#fff" }} />
          <Bar dataKey="audits" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
