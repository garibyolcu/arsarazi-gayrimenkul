import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Building2,
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Loader2,
  CheckCircle,
} from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const leadMutation = trpc.lead.create.useMutation({
    onSuccess: () => {
      toast.success("Mesajınız gönderildi! En kısa sürede size dönüş yapacağız.");
      setForm({ name: "", phone: "", email: "", message: "" });
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    leadMutation.mutate({
      source: "WEBSITE",
      name: form.name,
      phone: form.phone,
      email: form.email,
      message: form.message,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-sm hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Ana Sayfa
          </Link>
          <Link to="/" className="flex items-center gap-2 font-bold ml-auto">
            <Building2 className="h-5 w-5 text-primary" />
            Arsarazi
          </Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-3xl md:text-4xl font-bold">İletişim</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Gayrimenkul ihtiyaçlarınız için bize ulaşın. Uzman danışmanlarımız size yardımcı olmaktan mutluluk duyacaktır.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">İletişim Bilgileri</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Telefon</p>
                      <p className="text-sm text-muted-foreground">+90 555 000 00 01</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">E-posta</p>
                      <p className="text-sm text-muted-foreground">info@arsarazi.com</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Adres</p>
                      <p className="text-sm text-muted-foreground">
                        Moda Caddesi No:45, Kadıköy/İstanbul
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Çalışma Saatleri</p>
                      <p className="text-sm text-muted-foreground">
                        Pazartesi - Cumartesi: 09:00 - 18:00
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Bize Mesaj Gönderin</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Adınız Soyadınız *</Label>
                      <Input
                        id="name"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Ahmet Yılmaz"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefon</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        placeholder="+90 555 123 45 67"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="ornek@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mesajınız *</Label>
                    <Textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Ne tür bir gayrimenkul arıyorsunuz? Bütçeniz ve tercihleriniz hakkında bize bilgi verin."
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full"
                    disabled={leadMutation.isPending}
                  >
                    {leadMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Gönder
                  </Button>
                  {leadMutation.isSuccess && (
                    <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                      <CheckCircle className="h-4 w-4" />
                      Mesajınız başarıyla gönderildi!
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="border-t bg-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Arsarazi Gayrimenkul. Tüm hakları saklıdır.
        </div>
      </footer>
    </div>
  );
}
