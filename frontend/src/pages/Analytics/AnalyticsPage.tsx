import { useEffect, useState } from "react";
import { Navigate } from "react-router";
import Chart from "react-apexcharts";
import { apiRequest } from "../../api/client";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Card from "../../components/ui/card/Card";
import { useAuth } from "../../hooks/useAuth";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MonthPoint {
  month: string;
  value: number;
}

interface MethodBreakdown {
  method: string;
  count: number;
  total: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
}

interface Analytics {
  kpis: {
    mrr: number;
    revenue_this_month: number;
    active_subscriptions: number;
    total_members: number;
    pending_payments_count: number;
    pending_payments_total: number;
    avg_meet_attendance: number;
  };
  revenue_by_month: MonthPoint[];
  payments_by_method: MethodBreakdown[];
  subscriptions_by_status: StatusBreakdown[];
  new_members_by_month: MonthPoint[];
  readings_by_status: StatusBreakdown[];
  meets_by_month: MonthPoint[];
}

// ── Labels ────────────────────────────────────────────────────────────────────

const SUBSCRIPTION_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  ACTIVE: "Ativa",
  EXPIRED: "Expirada",
  CANCELED: "Cancelada",
};

const READING_LABELS: Record<string, string> = {
  PLANNED: "Planejada",
  IN_PROGRESS: "Em andamento",
  FINISHED: "Finalizada",
  CANCELED: "Cancelada",
};

const METHOD_LABELS: Record<string, string> = {
  PIX: "PIX",
  CASH: "Dinheiro",
  MP: "Mercado Pago",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatMonthLabel(month: string) {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  const canView = Boolean(user?.is_admin || user?.is_financial);

  useEffect(() => {
    if (!canView) return;
    apiRequest<Analytics>("/analytics/")
      .then(setData)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView]);

  if (!canView) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <PageMeta title="Analytics | Clube de Leitura" description="Painel de indicadores do clube" />
      <div className="mx-auto max-w-screen-xl px-4 py-6 sm:px-6">
        <PageBreadCrumb pageTitle="Analytics" />

        {loading || !data ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
              />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {/* ── KPIs ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard label="Receita recorrente (MRR)" value={formatMoney(data.kpis.mrr)} />
              <KpiCard label="Receita este mês" value={formatMoney(data.kpis.revenue_this_month)} />
              <KpiCard label="Assinaturas ativas" value={String(data.kpis.active_subscriptions)} />
              <KpiCard label="Membros" value={String(data.kpis.total_members)} />
              <KpiCard
                label="Pagamentos pendentes"
                value={String(data.kpis.pending_payments_count)}
                sub={formatMoney(data.kpis.pending_payments_total)}
              />
              <KpiCard
                label="Frequência média nos encontros"
                value={data.kpis.avg_meet_attendance.toLocaleString("pt-BR")}
                sub="participantes por encontro"
              />
            </div>

            {/* ── Revenue chart ────────────────────────────────────── */}
            <ChartCard title="Receita confirmada (últimos 12 meses)">
              <Chart
                type="bar"
                height={300}
                series={[{ name: "Receita", data: data.revenue_by_month.map((p) => p.value) }]}
                options={{
                  chart: { toolbar: { show: false }, fontFamily: "inherit" },
                  colors: ["#4430b0"],
                  plotOptions: { bar: { borderRadius: 4, columnWidth: "55%" } },
                  dataLabels: { enabled: false },
                  xaxis: { categories: data.revenue_by_month.map((p) => formatMonthLabel(p.month)) },
                  yaxis: { labels: { formatter: (v: number) => formatMoney(v) } },
                  tooltip: { y: { formatter: (v: number) => formatMoney(v) } },
                  grid: { strokeDashArray: 4 },
                }}
              />
            </ChartCard>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* ── New members ──────────────────────────────────── */}
              <ChartCard title="Novos membros por mês">
                <Chart
                  type="area"
                  height={280}
                  series={[{ name: "Novos membros", data: data.new_members_by_month.map((p) => p.value) }]}
                  options={{
                    chart: { toolbar: { show: false }, fontFamily: "inherit" },
                    colors: ["#634fcf"],
                    dataLabels: { enabled: false },
                    stroke: { curve: "smooth", width: 2 },
                    xaxis: { categories: data.new_members_by_month.map((p) => formatMonthLabel(p.month)) },
                    yaxis: { labels: { formatter: (v: number) => String(Math.round(v)) } },
                    grid: { strokeDashArray: 4 },
                  }}
                />
              </ChartCard>

              {/* ── Meets per month ──────────────────────────────── */}
              <ChartCard title="Encontros por mês">
                <Chart
                  type="bar"
                  height={280}
                  series={[{ name: "Encontros", data: data.meets_by_month.map((p) => p.value) }]}
                  options={{
                    chart: { toolbar: { show: false }, fontFamily: "inherit" },
                    colors: ["#d9183b"],
                    plotOptions: { bar: { borderRadius: 4, columnWidth: "45%" } },
                    dataLabels: { enabled: false },
                    xaxis: { categories: data.meets_by_month.map((p) => formatMonthLabel(p.month)) },
                    yaxis: { labels: { formatter: (v: number) => String(Math.round(v)) } },
                    grid: { strokeDashArray: 4 },
                  }}
                />
              </ChartCard>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* ── Subscriptions by status ──────────────────────── */}
              <ChartCard title="Assinaturas por estado">
                {data.subscriptions_by_status.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <Chart
                    type="donut"
                    height={280}
                    series={data.subscriptions_by_status.map((s) => s.count)}
                    options={{
                      chart: { fontFamily: "inherit" },
                      labels: data.subscriptions_by_status.map(
                        (s) => SUBSCRIPTION_LABELS[s.status] ?? s.status
                      ),
                      colors: ["#634fcf", "#48b0d9", "#d9183b", "#9aa1ac"],
                      legend: { position: "bottom" },
                      dataLabels: { enabled: true },
                    }}
                  />
                )}
              </ChartCard>

              {/* ── Readings by status ────────────────────────────── */}
              <ChartCard title="Leituras por estado">
                {data.readings_by_status.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <Chart
                    type="donut"
                    height={280}
                    series={data.readings_by_status.map((r) => r.count)}
                    options={{
                      chart: { fontFamily: "inherit" },
                      labels: data.readings_by_status.map(
                        (r) => READING_LABELS[r.status] ?? r.status
                      ),
                      colors: ["#48b0d9", "#4430b0", "#22c55e", "#9aa1ac"],
                      legend: { position: "bottom" },
                      dataLabels: { enabled: true },
                    }}
                  />
                )}
              </ChartCard>
            </div>

            {/* ── Payments by method table ─────────────────────────── */}
            <ChartCard title="Pagamentos confirmados por método">
              {data.payments_by_method.length === 0 ? (
                <EmptyChart />
              ) : (
                <div className="overflow-x-auto font-ui">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:text-gray-400">
                        <th className="py-2 pr-4">Método</th>
                        <th className="py-2 pr-4">Pagamentos</th>
                        <th className="py-2">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {data.payments_by_method.map((row) => (
                        <tr key={row.method}>
                          <td className="py-2.5 pr-4 text-gray-800 dark:text-white/80">
                            {METHOD_LABELS[row.method] ?? row.method}
                          </td>
                          <td className="py-2.5 pr-4 text-gray-500 dark:text-gray-400">{row.count}</td>
                          <td className="py-2.5 font-medium text-gray-900 dark:text-white">
                            {formatMoney(row.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ChartCard>
          </div>
        )}
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <span className="font-ui text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <h4 className="mt-1 font-heading text-2xl text-gray-800 dark:text-white/90">{value}</h4>
      {sub && <span className="font-ui text-xs text-gray-400 dark:text-gray-500">{sub}</span>}
    </Card>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="font-ui">
      <h3 className="mb-4 font-heading text-base text-gray-800 dark:text-white/90">{title}</h3>
      {children}
    </Card>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[200px] items-center justify-center font-ui text-sm text-gray-400 dark:text-gray-500">
      Sem dados suficientes ainda.
    </div>
  );
}
