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
  FileText,
  Search,
  Plus,
  Check,
  Loader2,
  Trash2,
  ExternalLink,
} from "lucide-react";

const docLabels: Record<string, string> = {
  TITLE_DEED: "Tapu", POWER_OF_ATTORNEY: "Vekaletname", CONTRACT: "Sözleşme",
  ID_COPY: "Kimlik", FLOOR_PLAN: "Kat Planı", VALUATION_REPORT: "Ekspertiz", OTHER: "Diğer",
};

export default function Documents() {
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [page] = useState(1);

  const { data, isLoading, refetch } = trpc.document.list.useQuery({
    type: typeFilter as any,
    page,
    limit: 20,
  });

  const verifyDoc = trpc.document.verify.useMutation({
    onSuccess: () => { toast.success("Belge onaylandı"); refetch(); },
  });

  const deleteDoc = trpc.document.delete.useMutation({
    onSuccess: () => { toast.success("Belge silindi"); refetch(); },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Belge Arşivi</h1>
          <p className="text-muted-foreground">{data?.total ?? 0} belge</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Yeni Belge</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Belge Ekle</DialogTitle></DialogHeader>
            <NewDocumentForm onSuccess={() => refetch()} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Belge ara..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={typeFilter || "_all"} onValueChange={(v) => setTypeFilter(v === "_all" ? "" : v)}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tüm Türler" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Tümü</SelectItem>
            {Object.entries(docLabels).map(([k, v]) => (
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.items?.map((doc) => (
            <Card key={doc.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm line-clamp-1">{doc.name}</p>
                      <Badge variant="outline" className="text-xs">{docLabels[doc.type]}</Badge>
                    </div>
                  </div>
                  {doc.isVerified && <Check className="h-4 w-4 text-green-600" />}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{doc.description || "Açıklama yok"}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{doc.mimeType || "-"}</span>
                  <span>{doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : "-"}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3 w-3 mr-1" /> Görüntüle
                    </a>
                  </Button>
                  {!doc.isVerified && (
                    <Button size="sm" variant="secondary" onClick={() => verifyDoc.mutate({ id: doc.id })}>
                      <Check className="h-3 w-3 mr-1" /> Onayla
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => {
                    if (confirm("Silmek istediğinize emin misiniz?")) deleteDoc.mutate({ id: doc.id });
                  }}>
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function NewDocumentForm({ onSuccess }: { onSuccess: () => void }) {
  const create = trpc.document.create.useMutation({
    onSuccess: () => { toast.success("Belge eklendi"); onSuccess(); },
  });

  const [form, setForm] = useState({
    name: "", type: "OTHER", fileUrl: "", description: "",
    propertyId: 0, customerId: 0, transactionId: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({
      ...form,
      propertyId: form.propertyId || undefined,
      customerId: form.customerId || undefined,
      transactionId: form.transactionId || undefined,
    } as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1"><Label>Belge Adı *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Tür</Label>
          <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(docLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Dosya URL</Label><Input value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." /></div>
      </div>
      <div className="space-y-1"><Label>Açıklama</Label><Input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
      <Button type="submit" className="w-full" disabled={create.isPending}>
        {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kaydet"}
      </Button>
    </form>
  );
}
