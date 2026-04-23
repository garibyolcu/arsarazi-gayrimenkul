import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  ArrowLeft,
  Target,
  Award,
  Users,
  TrendingUp,
  Shield,
} from "lucide-react";

export default function About() {
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

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold">Hakkımızda</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Arsarazi Gayrimenkul, 2010 yılından bu yana Türkiye'nin önde gelen gayrimenkul danışmanlık firmalarından biridir.
            Satış, kiralama, yatırım danışmanlığı ve ekspertiz hizmetleri sunuyoruz.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <Award className="h-10 w-10 mx-auto text-primary" />
              <h3 className="font-semibold">15+ Yıllık Tecrübe</h3>
              <p className="text-sm text-muted-foreground">
                Gayrimenkul sektöründe uzun yıllara dayanan bilgi birikimi.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <Users className="h-10 w-10 mx-auto text-primary" />
              <h3 className="font-semibold">Uzman Ekip</h3>
              <p className="text-sm text-muted-foreground">
                Sertifikalı danışmanlarımızla profesyonel hizmet.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <TrendingUp className="h-10 w-10 mx-auto text-primary" />
              <h3 className="font-semibold">Yüksek Başarı Oranı</h3>
              <p className="text-sm text-muted-foreground">
                Hızlı ve verimli işlem süreçleri.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center space-y-3">
              <Shield className="h-10 w-10 mx-auto text-primary" />
              <h3 className="font-semibold">Güvenilirlik</h3>
              <p className="text-sm text-muted-foreground">
                Şeffaf süreçler ve yasal güvence.
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center">Misyonumuz</h2>
          <p className="text-muted-foreground text-center max-w-2xl mx-auto">
            Misyonumuz, müşterilerimize en iyi gayrimenkul deneyimini sunmak, şeffaf ve güvenilir
            bir ortamda hayallerindeki mülkü bulmalarına yardımcı olmaktır.
          </p>
        </div>

        <div className="bg-primary text-white rounded-2xl p-8 text-center space-y-4">
          <Target className="h-10 w-10 mx-auto" />
          <h2 className="text-2xl font-bold">Vizyonumuz</h2>
          <p className="max-w-2xl mx-auto opacity-90">
            Türkiye'nin en güvenilir ve tercih edilen gayrimenkul platformu olmak,
            teknoloji ve insan odaklı yaklaşımımızla sektörde öncü olmak.
          </p>
          <Link to="/ilanlar">
            <Button variant="secondary" className="mt-4">
              İlanları İncele
            </Button>
          </Link>
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
