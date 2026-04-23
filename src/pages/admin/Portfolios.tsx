import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Building2,
  Search,
  Plus,
  Grid3X3,
  List,
  Eye,
  MapPin,
  Bed,
  Maximize,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";

export default function Portfolios() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data, isLoading, refetch } = trpc.property.list.useQuery({
    status: statusFilter as any,
    type: typeFilter as any,
    search: search || undefined,
    page,
    limit,
  });

  const updateStatus = trpc.property.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Durum güncellendi");
      refetch();
    },
  });

  const deleteProperty = trpc.property.delete.useMutation({
    onSuccess: () => {
      toast.success("Portföy silindi");
      refetch();
    },
  });

  const totalPages = data?.total ? Math.ceil(data.total / limit) : 0;

  const statusLabel = (s: string) => {
    const labels: Record<string, string> = {
      ACTIVE: "Aktif", PASSIVE: "Pasif", POTENTIAL: "Potansiyel",
      SOLD: "Satıldı", RENTED: "Kiralandı",
    };
    return labels[s] || s;
  };

  const typeLabel = (t: string) => {
    const labels: Record<string, string> = {
      APARTMENT: "Daire", HOUSE: "Villa", LAND: "Arsa",
      COMMERCIAL: "Ticari", OFFICE: "Ofis", WAREHOUSE: "Depo",
    };
    return labels[t] || t;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Portföy Yönetimi</h1>
          <p className="text-muted-foreground">{data?.total ?? 0} portföy</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            <Button variant={viewMode === "grid" ? "default" : "ghost"} size="icon" className="rounded-none" onClick={() => setViewMode("grid")}>
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === "list" ? "default" : "ghost"} size="icon" className="rounded-none" onClick={() => setViewMode("list")}>
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" /> Yeni Portföy
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Yeni Portföy Ekle</DialogTitle>
              </DialogHeader>
              <NewPropertyForm onSuccess={() => refetch()} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Portföy ara..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tümü</SelectItem>
            <SelectItem value="ACTIVE">Aktif</SelectItem>
            <SelectItem value="PASSIVE">Pasif</SelectItem>
            <SelectItem value="POTENTIAL">Potansiyel</SelectItem>
            <SelectItem value="SOLD">Satıldı</SelectItem>
            <SelectItem value="RENTED">Kiralandı</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tip" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Tümü</SelectItem>
            <SelectItem value="APARTMENT">Daire</SelectItem>
            <SelectItem value="HOUSE">Villa</SelectItem>
            <SelectItem value="LAND">Arsa</SelectItem>
            <SelectItem value="COMMERCIAL">Ticari</SelectItem>
            <SelectItem value="OFFICE">Ofis</SelectItem>
            <SelectItem value="WAREHOUSE">Depo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {data?.items?.map((p) => (
                <Card key={p.id} className="overflow-hidden">
                  <div className="aspect-[4/3] bg-muted relative">
                    {p.images?.[0] ? (
                      <img src={p.images[0].url} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                        <Building2 className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-sm line-clamp-1">{p.title}</p>
                      <Badge variant="outline" className="shrink-0 text-xs">{typeLabel(p.type)}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {p.city}, {p.district}
                    </p>
                    <p className="font-bold text-primary text-sm">
                      {Number(p.price).toLocaleString("tr-TR")} {p.currency}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {p.roomCount && <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{p.roomCount}</span>}
                      {p.area && <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{p.area}m²</span>}
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.views}</span>
                    </div>
                    <div className="flex gap-1 pt-1">
                      <Select value={p.status} onValueChange={(v) => updateStatus.mutate({ id: p.id, status: v as any })}>
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["ACTIVE", "PASSIVE", "POTENTIAL", "SOLD", "RENTED"].map((s) => (
                            <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                        if (confirm("Silmek istediğinize emin misiniz?")) deleteProperty.mutate({ id: p.id });
                      }}>
                        <Trash2 className="h-3 w-3 text-red-500" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">Portföy</th>
                      <th className="text-left p-3 font-medium">Tip</th>
                      <th className="text-left p-3 font-medium">Konum</th>
                      <th className="text-left p-3 font-medium">Fiyat</th>
                      <th className="text-left p-3 font-medium">Durum</th>
                      <th className="text-left p-3 font-medium">Görüntülenme</th>
                      <th className="text-left p-3 font-medium">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.items?.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="font-medium">{p.title}</span>
                          </div>
                        </td>
                        <td className="p-3">{typeLabel(p.type)}</td>
                        <td className="p-3 text-muted-foreground">{p.city}, {p.district}</td>
                        <td className="p-3 font-medium">
                          {Number(p.price).toLocaleString("tr-TR")} {p.currency}
                        </td>
                        <td className="p-3">
                          <Select value={p.status} onValueChange={(v) => updateStatus.mutate({ id: p.id, status: v as any })}>
                            <SelectTrigger className="h-7 w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["ACTIVE", "PASSIVE", "POTENTIAL", "SOLD", "RENTED"].map((s) => (
                                <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-3">{p.views}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                              if (confirm("Silmek istediğinize emin misiniz?")) deleteProperty.mutate({ id: p.id });
                            }}>
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Önceki</Button>
              <span className="text-sm text-muted-foreground">Sayfa {page} / {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Sonraki</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NewPropertyForm({ onSuccess }: { onSuccess: () => void }) {
  const utils = trpc.useUtils();
  const create = trpc.property.create.useMutation({
    onSuccess: () => {
      toast.success("Portföy eklendi");
      utils.property.list.invalidate();
      onSuccess();
    },
  });

  const [form, setForm] = useState({
    title: "", slug: "", description: "", price: 0, currency: "TRY",
    type: "APARTMENT", listingType: "SALE", status: "ACTIVE",
    city: "", district: "", area: 0, roomCount: 0, bathroomCount: 0,
    floor: 0, floorCount: 0, hasParking: false, hasGarden: false,
    hasElevator: false, hasFurnished: false, heatingType: "", buildYear: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({
      ...form,
      price: Number(form.price),
      slug: form.slug || form.title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    } as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Başlık *</Label>
          <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
        </div>
        <div className="space-y-1">
          <Label>Slug</Label>
          <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label>Fiyat *</Label>
          <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} required />
        </div>
        <div className="space-y-1">
          <Label>Para Birimi</Label>
          <Input value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} />
        </div>
        <div className="space-y-1">
          <Label>Alan (m²)</Label>
          <Input type="number" value={form.area} onChange={e => setForm({ ...form, area: Number(e.target.value) })} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label>Tip</Label>
          <Select value={form.type} onValueChange={v => setForm({ ...form, type: v as any })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["APARTMENT", "HOUSE", "LAND", "COMMERCIAL", "OFFICE", "WAREHOUSE"].map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>İşlem Türü</Label>
          <Select value={form.listingType} onValueChange={v => setForm({ ...form, listingType: v as any })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SALE">Satılık</SelectItem>
              <SelectItem value="RENT">Kiralık</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Şehir</Label><Input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} /></div>
        <div className="space-y-1"><Label>İlçe</Label><Input value={form.district} onChange={e => setForm({ ...form, district: e.target.value })} /></div>
      </div>
      <Button type="submit" className="w-full" disabled={create.isPending}>
        {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kaydet"}
      </Button>
    </form>
  );
}
