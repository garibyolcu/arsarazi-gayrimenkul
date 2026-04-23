import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Search,
  MapPin,
  Bed,
  Bath,
  Maximize,
  ArrowRight,
  Phone,
  Mail,
  Menu,
  X,
  ClipboardList,
} from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { data: featured, isLoading } = trpc.property.list.useQuery({
    status: "ACTIVE",
    page: 1,
    limit: 6,
  });

  const [searchCity, setSearchCity] = useState("");
  const [searchType, setSearchType] = useState<string>("");
  const [searchListing, setSearchListing] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <Building2 className="h-5 w-5 text-primary" />
            Arsarazi
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/ilanlar" className="hover:text-primary">İlanlar</Link>
            <Link to="/hakkimizda" className="hover:text-primary">Hakkımızda</Link>
            <Link to="/iletisim" className="hover:text-primary">İletişim</Link>
            <Link to="/login">
              <Button size="sm">Panel Girişi</Button>
            </Link>
          </div>
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <section className="relative bg-gradient-to-br from-slate-900 to-slate-800 text-white py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Arsarazi'de Mülkünüzü Bulun</h1>
          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
            İstanbul, Ankara, İzmir ve tüm Türkiye'de satılık ve kiralık gayrimenkul ilanları.
          </p>
          <div className="bg-white rounded-xl p-4 max-w-4xl mx-auto shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input placeholder="Şehir ara..." value={searchCity} onChange={e => setSearchCity(e.target.value)} className="h-11" />
              <select className="h-11 rounded-md border px-3 text-sm bg-white text-black" value={searchType} onChange={e => setSearchType(e.target.value)}>
                <option value="">Gayrimenkul Tipi</option>
                <option value="APARTMENT">Daire</option>
                <option value="HOUSE">Villa</option>
                <option value="LAND">Arsa</option>
                <option value="COMMERCIAL">Ticari</option>
                <option value="OFFICE">Ofis</option>
              </select>
              <select className="h-11 rounded-md border px-3 text-sm bg-white text-black" value={searchListing} onChange={e => setSearchListing(e.target.value)}>
                <option value="">İşlem Türü</option>
                <option value="SALE">Satılık</option>
                <option value="RENT">Kiralık</option>
              </select>
              <Link to={`/ilanlar?city=${searchCity}&type=${searchType}&listing=${searchListing}`}>
                <Button className="w-full h-11" size="lg">
                  <Search className="h-4 w-4 mr-2" /> Ara
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Öne Çıkan İlanlar</h2>
          <Link to="/ilanlar">
            <Button variant="ghost">Tümünü Gör <ArrowRight className="h-4 w-4 ml-1" /></Button>
          </Link>
        </div>
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground">Yükleniyor...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured?.items?.map((property) => (
              <Link key={property.id} to={`/ilanlar/${property.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    {property.images?.[0] ? (
                      <img src={property.images[0].url} alt={property.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Building2 className="h-10 w-10" /></div>
                    )}
                    <Badge className="absolute top-3 left-3">{property.listingType === "SALE" ? "Satılık" : "Kiralık"}</Badge>
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold line-clamp-1">{property.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{property.city}, {property.district}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {property.roomCount && <span className="flex items-center gap-1"><Bed className="h-3 w-3" />{property.roomCount}</span>}
                      {property.bathroomCount && <span className="flex items-center gap-1"><Bath className="h-3 w-3" />{property.bathroomCount}</span>}
                      {property.area && <span className="flex items-center gap-1"><Maximize className="h-3 w-3" />{property.area}m²</span>}
                    </div>
                    <p className="font-bold text-primary text-lg">{Number(property.price).toLocaleString("tr-TR")} {property.currency}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">Hizmetlerimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card><CardContent className="p-6 text-center space-y-3"><Building2 className="h-10 w-10 mx-auto text-primary" /><h3 className="font-semibold">Satış & Kiralama</h3><p className="text-sm text-muted-foreground">Profesyonel satış ve kiralama danışmanlığı.</p></CardContent></Card>
            <Card><CardContent className="p-6 text-center space-y-3"><ClipboardList className="h-10 w-10 mx-auto text-primary" /><h3 className="font-semibold">Yatırım Danışmanlığı</h3><p className="text-sm text-muted-foreground">Portföy yönetimi ve yatırım stratejileri.</p></CardContent></Card>
            <Card><CardContent className="p-6 text-center space-y-3"><Phone className="h-10 w-10 mx-auto text-primary" /><h3 className="font-semibold">Ekspertiz & Değerleme</h3><p className="text-sm text-muted-foreground">Gayrimenkul değerleme ve ekspertiz hizmetleri.</p></CardContent></Card>
          </div>
        </div>
      </section>

      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="bg-primary rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Bize Ulaşın</h2>
          <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">Gayrimenkul ihtiyaçlarınız için uzman danışmanlarımızdan randevu alın.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/iletisim"><Button variant="secondary" size="lg"><Phone className="h-4 w-4 mr-2" />İletişime Geç</Button></Link>
            <Link to="/ilanlar"><Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary">İlanları İncele</Button></Link>
          </div>
        </div>
      </section>

      <footer className="border-t bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg mb-4"><Building2 className="h-5 w-5 text-primary" />Arsarazi</div>
              <p className="text-sm text-muted-foreground">Türkiye'nin lider gayrimenkul danışmanlık firmalarından biri olarak, satış, kiralama ve yatırım danışmanlığı hizmetleri sunuyoruz.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Hızlı Linkler</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/ilanlar" className="hover:text-primary">İlanlar</Link></li>
                <li><Link to="/hakkimizda" className="hover:text-primary">Hakkımızda</Link></li>
                <li><Link to="/iletisim" className="hover:text-primary">İletişim</Link></li>
                <li><Link to="/login" className="hover:text-primary">Yönetim Paneli</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">İletişim</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Phone className="h-3 w-3" />+90 555 000 00 01</li>
                <li className="flex items-center gap-2"><Mail className="h-3 w-3" />info@arsarazi.com</li>
                <li className="flex items-center gap-2"><MapPin className="h-3 w-3" />İstanbul, Türkiye</li>
              </ul>
            </div>
          </div>
          <Separator className="my-8" />
          <p className="text-center text-sm text-muted-foreground">© {new Date().getFullYear()} Arsarazi Gayrimenkul. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
