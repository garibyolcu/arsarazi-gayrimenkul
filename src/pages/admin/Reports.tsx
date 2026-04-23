import { trpc } from "@/providers/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function statusLabel(s: string) {
  const labels: Record<string, string> = {
    ACTIVE: "Aktif", PASSIVE: "Pasif", POTENTIAL: "Potansiyel",
    SOLD: "Satıldı", RENTED: "Kiralandı",
    LEAD: "Potansiyel", NEGOTIATION: "Müzakere", OFFER: "Teklif",
    CONTRACT: "Sözleşme", CLOSED: "Tamamlandı", CANCELLED: "İptal",
  };
  return labels[s] || s;
}

function typeLabel(t: string) {
  const labels: Record<string, string> = {
    APARTMENT: "Daire", HOUSE: "Villa", LAND: "Arsa",
    COMMERCIAL: "Ticari", OFFICE: "Ofis", WAREHOUSE: "Depo",
    SALE: "Satış", RENT: "Kiralama", LEASE: "Kira Söz.", VALUATION: "Değerleme",
  };
  return labels[t] || t;
}

function sourceLabel(s: string) {
  const labels: Record<string, string> = {
    REFERRAL: "Referans", WEBSITE: "Web Sitesi",
    SOCIAL_MEDIA: "Sosyal Medya", WALK_IN: "Yerinden", OTHER: "Diğer",
  };
  return labels[s] || s;
}

function leadStatusLabel(s: string) {
  const labels: Record<string, string> = {
    NEW: "Yeni", CONTACTED: "İletişime Geçildi",
    QUALIFIED: "Nitelikli", CONVERTED: "Dönüştürüldü", LOST: "Kaybedildi",
  };
  return labels[s] || s;
}

export default function Reports() {
  const { data: portfolio, isLoading: pLoading } = trpc.report.portfolio.useQuery();
  const { data: txSummary, isLoading: tLoading } = trpc.report.transactionSummary.useQuery();
  const { data: agentPerf, isLoading: aLoading } = trpc.report.agentPerformance.useQuery();
  const { data: customerSources, isLoading: cLoading } = trpc.report.customerSources.useQuery();

  const portfolioStatusData = (portfolio?.byStatus ?? []).map((item) => ({
    name: statusLabel(item.status),
    value: item.count,
  }));

  const portfolioTypeData = (portfolio?.byType ?? []).map((item) => ({
    name: typeLabel(item.type),
    value: item.count,
  }));

  const monthlyData = [...(txSummary?.monthly ?? [])].reverse().map((item) => ({
    month: item.month,
    count: item.count,
    commission: Number(item.totalCommission || 0),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Raporlar</h1>
        <p className="text-muted-foreground">Analiz ve istatistik raporları</p>
      </div>

      <Tabs defaultValue="portfolio">
        <TabsList>
          <TabsTrigger value="portfolio">Portföy</TabsTrigger>
          <TabsTrigger value="transactions">İşlemler</TabsTrigger>
          <TabsTrigger value="agents">Danışmanlar</TabsTrigger>
          <TabsTrigger value="customers">Müşteriler</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Durum Dağılımı</CardTitle></CardHeader>
              <CardContent>
                {pLoading ? <Skeleton className="h-64 w-full" /> : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={portfolioStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                          {portfolioStatusData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Tip Dağılımı</CardTitle></CardHeader>
              <CardContent>
                {pLoading ? <Skeleton className="h-64 w-full" /> : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={portfolioTypeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                          {portfolioTypeData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader><CardTitle className="text-base">Şehir Bazlı Dağılım</CardTitle></CardHeader>
            <CardContent>
              {pLoading ? <Skeleton className="h-8 w-full" /> : (
                <div className="flex flex-wrap gap-2">
                  {portfolio?.byCity?.map((item) => (
                    <Badge key={item.city} variant="secondary" className="text-sm px-3 py-1">
                      {item.city}: {item.count}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Aylık İşlem ve Komisyon</CardTitle></CardHeader>
            <CardContent>
              {tLoading ? <Skeleton className="h-72 w-full" /> : (
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#2563eb" name="İşlem" />
                      <Bar dataKey="commission" fill="#16a34a" name="Komisyon" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Durum Dağılımı</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {txSummary?.byStatus?.map((item) => (
                    <div key={item.status} className="flex items-center justify-between py-1">
                      <span>{statusLabel(item.status)}</span>
                      <Badge>{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Tip Dağılımı</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {txSummary?.byType?.map((item) => (
                    <div key={item.type} className="flex items-center justify-between py-1">
                      <span>{item.type}</span>
                      <Badge>{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6 mt-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Danışman Performansı</CardTitle></CardHeader>
            <CardContent>
              {aLoading ? <Skeleton className="h-64 w-full" /> : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={agentPerf ?? []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="agentName" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="transactionCount" fill="#2563eb" name="İşlem Sayısı" />
                      <Bar dataKey="totalCommission" fill="#16a34a" name="Komisyon" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Müşteri Kaynakları</CardTitle></CardHeader>
              <CardContent>
                {cLoading ? <Skeleton className="h-64 w-full" /> : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={(customerSources?.bySource ?? []).map((item) => ({
                            name: sourceLabel(item.source),
                            value: item.count,
                          }))}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label
                        >
                          {(customerSources?.bySource ?? []).map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">Lead Durumları</CardTitle></CardHeader>
              <CardContent>
                {cLoading ? <Skeleton className="h-64 w-full" /> : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={(customerSources?.byStatus ?? []).map((item) => ({
                            name: leadStatusLabel(item.status),
                            value: item.count,
                          }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          dataKey="value"
                          label
                        >
                          {(customerSources?.byStatus ?? []).map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
