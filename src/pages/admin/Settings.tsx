import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Loader2,
  Trash2,
  Shield,
} from "lucide-react";

const roleLabels: Record<string, string> = {
  ADMIN: "Admin", MANAGER: "Yönetici", AGENT: "Danışman", VIEWER: "Görüntüleyici",
};

export default function AdminSettings() {
  const { data: users, isLoading, refetch } = trpc.user.list.useQuery({});

  const deleteUser = trpc.user.delete.useMutation({
    onSuccess: () => { toast.success("Kullanıcı silindi"); refetch(); },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="text-muted-foreground">Sistem ve kullanıcı yönetimi</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Kullanıcı Yönetimi
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Yeni Kullanıcı</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader><DialogTitle>Yeni Kullanıcı Ekle</DialogTitle></DialogHeader>
                <NewUserForm onSuccess={() => refetch()} />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-2">
              {users?.items?.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                      {u.name?.[0] ?? "U"}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={u.role === "ADMIN" ? "default" : "secondary"}>{roleLabels[u.role]}</Badge>
                    {!u.isActive && <Badge variant="outline">Pasif</Badge>}
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                      if (confirm("Silmek istediğinize emin misiniz?")) deleteUser.mutate({ id: u.id });
                    }}>
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Sistem Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between py-1 border-b">
            <span className="text-muted-foreground">Uygulama Adı</span>
            <span className="font-medium">Arsarazi Gayrimenkul Yönetim Sistemi</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span className="text-muted-foreground">Versiyon</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between py-1 border-b">
            <span className="text-muted-foreground">Stack</span>
            <span className="font-medium">React + Hono + tRPC + Drizzle + MySQL</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function NewUserForm({ onSuccess }: { onSuccess: () => void }) {
  const create = trpc.auth.register.useMutation({
    onSuccess: () => { toast.success("Kullanıcı eklendi"); onSuccess(); },
    onError: (err) => toast.error(err.message),
  });

  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "AGENT", phone: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate(form as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1"><Label>Ad Soyad *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
      <div className="space-y-1"><Label>E-posta *</Label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
      <div className="space-y-1"><Label>Şifre *</Label><Input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} /></div>
      <div className="space-y-1"><Label>Rol</Label>
        <Select value={form.role} onValueChange={v => setForm({ ...form, role: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(roleLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1"><Label>Telefon</Label><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
      <Button type="submit" className="w-full" disabled={create.isPending}>
        {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kaydet"}
      </Button>
    </form>
  );
}
