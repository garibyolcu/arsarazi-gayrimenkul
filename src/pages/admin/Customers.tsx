import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Star,
  Loader2,
  Trash2,
  Pencil,
} from "lucide-react";

const typeLabels: Record<string, string> = {
  BUYER: "Alıcı", SELLER: "Satıcı", RENTER: "Kiracı",
  LANDLORD: "Mülk Sahibi", INVESTOR: "Yatırımcı",
};

const sourceLabels: Record<string, string> = {
  REFERRAL: "Referans", WEBSITE: "Web Sitesi",
  SOCIAL_MEDIA: "Sosyal Medya", WALK_IN: "Yerinden", OTHER: "Diğer",
};

export default function Customers() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null);

  const { data, isLoading, refetch } = trpc.customer.list.useQuery({
    type: typeFilter as any,
    search: search || undefined,
    page,
    limit: 20,
  });

  const { data: customerDetail } = trpc.customer.getById.useQuery(
    { id: selectedCustomer! },
    { enabled: !!selectedCustomer }
  );

  const deleteCustomer = trpc.customer.delete.useMutation({
    onSuccess: () => {
      toast.success("Müşteri silindi");
      refetch();
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Müşteri Yönetimi</h1>
          <p className="text-muted-foreground">{data?.total ?? 0} müşteri</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Yeni Müşteri</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Yeni Müşteri</DialogTitle></DialogHeader>
            <NewCustomerForm onSuccess={() => refetch()} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Müşteri ara..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter || "_all"} onValueChange={(v) => setTypeFilter(v === "_all" ? "" : v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tüm Tipler" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Tümü</SelectItem>
            {Object.entries(typeLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted"><tr>
                <th className="text-left p-3 font-medium">Müşteri</th>
                <th className="text-left p-3 font-medium">Tip</th>
                <th className="text-left p-3 font-medium">İletişim</th>
                <th className="text-left p-3 font-medium">Konum</th>
                <th className="text-left p-3 font-medium">Değerlendirme</th>
                <th className="text-left p-3 font-medium">İşlemler</th>
              </tr></thead>
              <tbody>
                {data?.items?.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedCustomer(c.id)}>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {c.firstName[0]}{c.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium">{c.firstName} {c.lastName}</p>
                          {c.companyName && <p className="text-xs text-muted-foreground">{c.companyName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3"><Badge variant="outline">{typeLabels[c.type]}</Badge></td>
                    <td className="p-3">
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {c.phone && <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {c.phone}</div>}
                        {c.email && <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {c.email}</div>}
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      <div className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {c.city}{c.district ? `, ${c.district}` : ""}</div>
                    </td>
                    <td className="p-3">
                      {c.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span>{c.rating}</span>
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Pencil className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); if (confirm("Silmek istediğinize emin misiniz?")) deleteCustomer.mutate({ id: c.id }); }}>
                          <Trash2 className="h-3 w-3 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data?.total && data.total > 20 && (
            <div className="flex items-center justify-center gap-2 p-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Önceki</Button>
              <span className="text-sm text-muted-foreground">Sayfa {page}</span>
              <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)}>Sonraki</Button>
            </div>
          )}
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Müşteri Detayı</DialogTitle></DialogHeader>
          {customerDetail && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-medium">
                  {customerDetail.firstName[0]}{customerDetail.lastName[0]}
                </div>
                <div>
                  <p className="font-bold text-lg">{customerDetail.firstName} {customerDetail.lastName}</p>
                  <Badge>{typeLabels[customerDetail.type]}</Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Telefon:</span> {customerDetail.phone || "-"}</div>
                <div><span className="text-muted-foreground">Email:</span> {customerDetail.email || "-"}</div>
                <div><span className="text-muted-foreground">Şehir:</span> {customerDetail.city || "-"}</div>
                <div><span className="text-muted-foreground">İlçe:</span> {customerDetail.district || "-"}</div>
                <div><span className="text-muted-foreground">Kaynak:</span> {sourceLabels[customerDetail.source]}</div>
                <div><span className="text-muted-foreground">Bütçe:</span> {customerDetail.budgetMin ? `${Number(customerDetail.budgetMin).toLocaleString("tr-TR")} - ${Number(customerDetail.budgetMax).toLocaleString("tr-TR")} ${customerDetail.budgetCurrency}` : "-"}</div>
              </div>
              {customerDetail.notes && customerDetail.notes.length > 0 && (
                <div>
                  <p className="font-medium text-sm mb-2">Notlar</p>
                  <div className="space-y-1">
                    {customerDetail.notes.map((note: any, i: number) => (
                      <div key={i} className="bg-muted p-2 rounded text-sm">
                        <p>{note.content}</p>
                        <p className="text-xs text-muted-foreground">{new Date(note.createdAt).toLocaleDateString("tr-TR")}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewCustomerForm({ onSuccess }: { onSuccess: () => void }) {
  const create = trpc.customer.create.useMutation({
    onSuccess: () => {
      toast.success("Müşteri eklendi");
      onSuccess();
    },
  });

  const [form, setForm] = useState({
    firstName: "", lastName: "", type: "BUYER", phone: "", email: "",
    city: "", district: "", budgetMin: 0, budgetMax: 0, source: "WALK_IN",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({ ...form, budgetMin: form.budgetMin || undefined, budgetMax: form.budgetMax || undefined } as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Ad *</Label><Input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required /></div>
        <div className="space-y-1"><Label>Soyad *</Label><Input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Tip</Label>
          <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(typeLabels).map(([k]) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Kaynak</Label>
          <Select value={form.source} onValueChange={v => setForm({ ...form, source: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(sourceLabels).map(([k]) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Telefon</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
        <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
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
