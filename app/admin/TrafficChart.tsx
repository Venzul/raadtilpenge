"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DailyTraffic } from "../lib/analytics";

export default function TrafficChart({ data }: { data: DailyTraffic[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="trafficFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#18181b" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#18181b" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            dataKey="label"
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#e4e4e7" }}
          />
          <YAxis
            allowDecimals={false}
            width={32}
            tick={{ fill: "#71717a", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              borderColor: "#e4e4e7",
              fontSize: 13,
            }}
            labelFormatter={(_, payload) =>
              payload?.[0]?.payload?.date
                ? new Date(
                    payload[0].payload.date + "T12:00:00",
                  ).toLocaleDateString("da-DK", {
                    weekday: "short",
                    day: "numeric",
                    month: "long",
                  })
                : ""
            }
            formatter={(value) => [
              typeof value === "number" ? value : Number(value) || 0,
              "Sidevisninger",
            ]}
          />
          <Area
            type="monotone"
            dataKey="views"
            stroke="#18181b"
            strokeWidth={2}
            fill="url(#trafficFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
