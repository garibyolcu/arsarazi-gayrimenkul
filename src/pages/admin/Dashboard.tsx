import { useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  ClipboardList,
  Users,
  Clock,
  Eye,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6"];

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: "Aktif",
    PASSIVE: "Pasif",
    POTENTIAL: "Potansiyel",
    SOLD: "Satıldı",
    RENTED: "Kiralandı",
  };
  return labels[status] || status;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = trpc.report.dashboard.useQuery();
  const { data: portfolio } = trpc.report.portfolio.useQuery();
  const { data: txSummary } = trpc.report.transactionSummary.useQuery();

  const portfolioPieData = useMemo(() => {
    if (!portfolio?.byStatus) return [];
    return portfolio.byStatus.map((item) => ({
      name: statusLabel(item.status),
      value: item.count,
    }));
  }, [portfolio]);

  const monthlyBarData = useMemo(() => {
    if (!txSummary?.monthly) return [];
    return [...txSummary.monthly].reverse().map((item) => ({
      month: item.month,
      count: item.count,
      commission: Number(item.totalCommission || 0),
    }));
  }, [txSummary]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Genel bakış ve özet istatistikler</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Aktif Portföy"
          value={stats?.activeProperties ?? 0}
          icon={Building2}
          loading={statsLoading}
        />
        <StatCard
          title="Bu Ay İşlem"
          value={stats?.monthlyTransactions ?? 0}
          icon={ClipboardList}
          loading={statsLoading}
        />
        <StatCard
          title="Toplam Müşteri"
          value={stats?.totalCustomers ?? 0}
          icon={Users}
          loading={statsLoading}
        />
        <StatCard
          title="Bekleyen İşlem"
          value={stats?.pendingTransactions ?? 0}
          icon={Clock}
          loading={statsLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aylık İşlem ve Komisyon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" name="İşlem Sayısı" />
                  <Bar dataKey="commission" fill="#16a34a" name="Komisyon (TL)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Portföy Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={portfolioPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {portfolioPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Properties */}
      <RecentProperties />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  loading,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  loading: boolean;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <Skeleton className="h-8 w-16 mt-1" />
            ) : (
              <p className="text-2xl font-bold">{value.toLocaleString("tr-TR")}</p>
            )}
          </div>
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentProperties() {
  const { data, isLoading } = trpc.property.list.useQuery({ status: "ACTIVE", page: 1, limit: 5 });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Son Eklenen Portföyler</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {data?.items?.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{p.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.city}, {p.district} • {Number(p.price).toLocaleString("tr-TR")} {p.currency}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.status === "ACTIVE" ? "default" : "secondary"}>
                    {p.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Eye className="h-3 w-3" /> {p.views}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
