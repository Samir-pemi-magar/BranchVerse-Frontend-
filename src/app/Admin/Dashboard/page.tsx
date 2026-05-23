"use client";
import { useEffect, useState } from "react";
import { GetDashboardStats, DashboardStats } from "@/src/Services/adminApi";
import { RadialBarChart, RadialBar, Tooltip } from "recharts";

const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

const MetricCard = ({
  label,
  value,
  flagged,
  flaggedLabel,
  accent = false,
  icon,
  color,
}: {
  label: string;
  value: number;
  flagged?: number;
  flaggedLabel?: string;
  accent?: boolean;
  icon: string;
  color: string;
}) => {
  const pct =
    flagged !== undefined && value > 0
      ? ((flagged / value) * 100).toFixed(2)
      : null;

  return (
    <div
      className={`rounded-xl p-4 sm:p-5 flex flex-col gap-3 border ${
        accent && flagged && flagged > 0
          ? "bg-red-950/20 border-red-900/40"
          : "bg-neutral-900 border-neutral-800"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-widest text-neutral-500 uppercase">
          {label}
        </span>
        <span className="text-lg">{icon}</span>
      </div>

      <p className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-100">
        {formatCount(value)}
      </p>

      {flagged !== undefined && flaggedLabel && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-500">{flaggedLabel}</span>
            <span
              className={
                flagged > 0 ? "text-red-400 font-medium" : "text-neutral-500"
              }
            >
              {formatCount(flagged)}
              {pct ? ` (${pct}%)` : ""}
            </span>
          </div>
          <div className="h-1 rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: pct ? `${Math.min(parseFloat(pct), 100)}%` : "0%",
                background:
                  flagged > 0
                    ? parseFloat(pct ?? "0") > 5
                      ? "#f87171"
                      : "#fb923c"
                    : color,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

interface TooltipPayloadItem {
  payload: {
    name: string;
    pct: number;
    flagged: number;
    total: number;
  };
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-xs space-y-1">
        <p className="text-neutral-300 font-medium">{d.name}</p>
        <p className="text-neutral-400">
          Flagged rate: <span className="text-white font-medium">{d.pct}%</span>
        </p>
        <p className="text-neutral-400">
          Flagged:{" "}
          <span className="text-red-400 font-medium">
            {formatCount(d.flagged)}
          </span>
        </p>
        <p className="text-neutral-400">
          Total:{" "}
          <span className="text-white font-medium">{formatCount(d.total)}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");
  const [chartSize, setChartSize] = useState(160); // Default mobile size (w-40)

  useEffect(() => {
    GetDashboardStats()
      .then(setStats)
      .catch(() => setError("Failed to load stats."));

    // Sync chart width to window media query since we dropped ResponsiveContainer
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setChartSize(192); // sm:w-48
      } else {
        setChartSize(160); // w-40
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const radialData = stats
    ? [
        {
          name: "Chapters",
          pct:
            stats.chapters.total > 0
              ? parseFloat(
                  (
                    (stats.chapters.disabled / stats.chapters.total) *
                    100
                  ).toFixed(2),
                )
              : 0,
          flagged: stats.chapters.disabled,
          total: stats.chapters.total,
          fill: "#60a5fa",
        },
        {
          name: "Stories",
          pct:
            stats.stories.total > 0
              ? parseFloat(
                  (
                    (stats.stories.disabled / stats.stories.total) *
                    100
                  ).toFixed(2),
                )
              : 0,
          flagged: stats.stories.disabled,
          total: stats.stories.total,
          fill: "#34d399",
        },
        {
          name: "Users",
          pct:
            stats.users.total > 0
              ? parseFloat(
                  ((stats.users.banned / stats.users.total) * 100).toFixed(2),
                )
              : 0,
          flagged: stats.users.banned,
          total: stats.users.total,
          fill: "#a78bfa",
        },
      ]
    : [];

  return (
    <div className="space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Header */}
      <div>
        <p className="text-xs tracking-widest text-neutral-500 uppercase mb-1">
          Overview
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
      </div>

      {error && (
        <div className="text-red-400 text-sm px-4 py-3 rounded-lg border border-red-900/50 bg-red-950/20">
          {error}
        </div>
      )}

      {!stats ? (
        <div className="flex items-center gap-2 text-neutral-600 text-sm">
          <div className="w-4 h-4 rounded-full border-2 border-neutral-700 border-t-neutral-400 animate-spin" />
          Loading stats…
        </div>
      ) : (
        <>
          {/* Users */}
          <section>
            <p className="text-[10px] tracking-widest text-neutral-600 uppercase mb-3">
              Users
            </p>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Total Users"
                value={stats.users.total}
                icon="👤"
                color="#a78bfa"
              />
              <MetricCard
                label="Users"
                value={stats.users.total}
                flagged={stats.users.banned}
                flaggedLabel="Banned"
                accent
                icon="🚫"
                color="#a78bfa"
              />
            </div>
          </section>

          {/* Stories */}
          <section>
            <p className="text-[10px] tracking-widest text-neutral-600 uppercase mb-3">
              Stories
            </p>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard
                label="Total Stories"
                value={stats.stories.total}
                icon="📖"
                color="#34d399"
              />
              <MetricCard
                label="Stories"
                value={stats.stories.total}
                flagged={stats.stories.disabled}
                flaggedLabel="Disabled"
                accent
                icon="🔒"
                color="#34d399"
              />
            </div>
          </section>

          {/* Chapters */}
          <section>
            <p className="text-[10px] tracking-widest text-neutral-600 uppercase mb-3">
              Chapters
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MetricCard
                label="Total Chapters"
                value={stats.chapters.total}
                icon="📄"
                color="#60a5fa"
              />
              <MetricCard
                label="Chapters"
                value={stats.chapters.total}
                flagged={stats.chapters.disabled}
                flaggedLabel="Disabled"
                accent
                icon="🔒"
                color="#60a5fa"
              />
              <div className="col-span-2 sm:col-span-1">
                <MetricCard
                  label="Branches"
                  value={stats.branches.total}
                  icon="🌿"
                  color="#f59e0b"
                />
              </div>
            </div>
          </section>

          {/* Flagged rate chart */}
          <section>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 sm:p-6">
              <div className="mb-4">
                <p className="text-sm font-medium text-neutral-200">
                  Flagged / disabled rate
                </p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  % of each content type that is banned or disabled — scales
                  correctly regardless of total volume
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Fixed explicitly calculated container sizes to stop Recharts layout engine warnings */}
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{ width: chartSize, height: chartSize }}
                >
                  <RadialBarChart
                    width={chartSize}
                    height={chartSize}
                    cx="50%"
                    cy="50%"
                    innerRadius="30%"
                    outerRadius="90%"
                    data={radialData}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar
                      dataKey="pct"
                      background={{ fill: "#262626" }}
                      cornerRadius={4}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadialBarChart>
                </div>

                {/* Legend + progress bars */}
                <div className="w-full flex-1 space-y-4">
                  {radialData.map((d) => (
                    <div key={d.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-sm shrink-0"
                            style={{ background: d.fill }}
                          />
                          <span className="text-neutral-400">{d.name}</span>
                        </span>
                        <span
                          className="font-medium tabular-nums"
                          style={{ color: d.fill }}
                        >
                          {d.pct}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min(d.pct, 100)}%`,
                            background: d.fill,
                          }}
                        />
                      </div>
                      <p className="text-[11px] text-neutral-600">
                        {formatCount(d.flagged)} of {formatCount(d.total)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
