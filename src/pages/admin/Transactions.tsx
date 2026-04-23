import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Plus,
  Loader2,
  User,
  Clock,
} from "lucide-react";

const statusLabels: Record<string, string> = {
  LEAD: "Potansiyel", NEGOTIATION: "Müzakere", OFFER: "Teklif",
  CONTRACT: "Sözleşme", CLOSED: "Tamamlandı", CANCELLED: "İptal",
};

const statusColors: Record<string, string> = {
  LEAD: "bg-blue-100 text-blue-700",
  NEGOTIATION: "bg-yellow-100 text-yellow-700",
  OFFER: "bg-purple-100 text-purple-700",
  CONTRACT: "bg-orange-100 text-orange-700",
  CLOSED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function Transactions() {
  const [selectedTx, setSelectedTx] = useState<number | null>(null);

  const { data, refetch } = trpc.transaction.list.useQuery({
    page: 1,
    limit: 100,
  });

  const { data: txDetail } = trpc.transaction.getById.useQuery(
    { id: selectedTx! },
    { enabled: !!selectedTx }
  );

  const updateStatus = trpc.transaction.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Durum güncellendi");
      refetch();
    },
  });

  const addNote = trpc.transaction.addNote.useMutation({
    onSuccess: () => {
      toast.success("Not eklendi");
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">İşlem Takibi</h1>
          <p className="text-muted-foreground">{data?.total ?? 0} işlem</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-1" /> Yeni İşlem</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Yeni İşlem</DialogTitle></DialogHeader>
            <NewTransactionForm onSuccess={() => refetch()} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Kanban View */}
      <div className="flex flex-wrap gap-4 overflow-x-auto pb-2">
        {["LEAD", "NEGOTIATION", "OFFER", "CONTRACT", "CLOSED", "CANCELLED"].map((status) => {
          const items = data?.items?.filter((t) => t.status === status) ?? [];
          return (
            <div key={status} className="w-64 shrink-0">
              <div className={`p-2 rounded-t-md font-medium text-sm ${statusColors[status]}`}>
                {statusLabels[status]} ({items.length})
              </div>
              <div className="bg-muted/50 rounded-b-md p-2 space-y-2 min-h-[200px]">
                {items.map((tx) => (
                  <Card key={tx.id} className="cursor-pointer hover:shadow-md" onClick={() => setSelectedTx(tx.id)}>
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">{tx.type}</Badge>
                        <span className="text-xs text-muted-foreground">#{tx.id}</span>
                      </div>
                      <p className="font-medium text-sm">{tx.property?.title || "Portföy bilgisi yok"}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" /> {tx.agent?.name}
                      </div>
                      {tx.agreedPrice && (
                        <p className="text-sm font-bold text-primary">
                          {Number(tx.agreedPrice).toLocaleString("tr-TR")} TL
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>İşlem Detayı #{selectedTx}</DialogTitle>
          </DialogHeader>
          {txDetail && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Select value={txDetail.status} onValueChange={(v) => updateStatus.mutate({ id: txDetail.id, status: v as any })}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge>{txDetail.type}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Portföy:</span> {txDetail.property?.title || "-"}</div>
                <div><span className="text-muted-foreground">Danışman:</span> {txDetail.agent?.name || "-"}</div>
                <div><span className="text-muted-foreground">Alıcı:</span> {txDetail.buyer?.firstName} {txDetail.buyer?.lastName}</div>
                <div><span className="text-muted-foreground">Satıcı:</span> {txDetail.seller?.firstName} {txDetail.seller?.lastName}</div>
                {txDetail.agreedPrice && (
                  <div><span className="text-muted-foreground">Fiyat:</span> {Number(txDetail.agreedPrice).toLocaleString("tr-TR")} TL</div>
                )}
                {txDetail.commission && (
                  <div><span className="text-muted-foreground">Komisyon:</span> {Number(txDetail.commission).toLocaleString("tr-TR")} TL</div>
                )}
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Zaman Çizelgesi</h4>
                <div className="space-y-2">
                  {txDetail.events?.map((event, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="font-medium">{event.eventType}</p>
                        <p className="text-muted-foreground text-xs">{event.description} • {new Date(event.eventDate).toLocaleDateString("tr-TR")}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Notlar</h4>
                <div className="space-y-2">
                  {txDetail.notes?.map((note, i) => (
                    <div key={i} className="bg-muted p-2 rounded text-sm">
                      <p>{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-1">{note.author?.name} • {new Date(note.createdAt).toLocaleDateString("tr-TR")}</p>
                    </div>
                  ))}
                </div>
                <NoteForm onSubmit={(content) => addNote.mutate({ transactionId: txDetail.id, content })} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NoteForm({ onSubmit }: { onSubmit: (content: string) => void }) {
  const [content, setContent] = useState("");
  return (
    <div className="flex gap-2 mt-2">
      <Input value={content} onChange={e => setContent(e.target.value)} placeholder="Not ekle..." />
      <Button size="sm" onClick={() => { onSubmit(content); setContent(""); }}>Ekle</Button>
    </div>
  );
}

function NewTransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const create = trpc.transaction.create.useMutation({
    onSuccess: () => {
      toast.success("İşlem oluşturuldu");
      onSuccess();
    },
  });

  const [form, setForm] = useState({
    type: "SALE", status: "LEAD", propertyId: 0, buyerId: 0, sellerId: 0,
    agreedPrice: 0, commission: 0, commissionRate: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({
      ...form,
      propertyId: form.propertyId || undefined,
      buyerId: form.buyerId || undefined,
      sellerId: form.sellerId || undefined,
    } as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Tip</Label>
          <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="SALE">Satış</SelectItem>
              <SelectItem value="RENT">Kiralama</SelectItem>
              <SelectItem value="LEASE">Kira Sözleşmesi</SelectItem>
              <SelectItem value="VALUATION">Değerleme</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1"><Label>Portföy ID</Label><Input type="number" value={form.propertyId} onChange={e => setForm({ ...form, propertyId: Number(e.target.value) })} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1"><Label>Alıcı ID</Label><Input type="number" value={form.buyerId} onChange={e => setForm({ ...form, buyerId: Number(e.target.value) })} /></div>
        <div className="space-y-1"><Label>Satıcı ID</Label><Input type="number" value={form.sellerId} onChange={e => setForm({ ...form, sellerId: Number(e.target.value) })} /></div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1"><Label>Fiyat</Label><Input type="number" value={form.agreedPrice} onChange={e => setForm({ ...form, agreedPrice: Number(e.target.value) })} /></div>
        <div className="space-y-1"><Label>Komisyon</Label><Input type="number" value={form.commission} onChange={e => setForm({ ...form, commission: Number(e.target.value) })} /></div>
        <div className="space-y-1"><Label>Oran %</Label><Input type="number" value={form.commissionRate} onChange={e => setForm({ ...form, commissionRate: Number(e.target.value) })} /></div>
      </div>
      <Button type="submit" className="w-full" disabled={create.isPending}>
        {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Oluştur"}
      </Button>
    </form>
  );
}
