import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  ArrowLeft,
  Calendar,
  Home,
  Check,
  Share2,
  Heart,
  Eye,
  Loader2,
  Phone,
  Mail,
} from "lucide-react";
import { useState } from "react";

export default function PropertyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: property, isLoading } = trpc.property.getBySlug.useQuery(
    { slug: slug! },
    { enabled: !!slug }
  );

  const [selectedImage, setSelectedImage] = useState(0);
  const [favorited, setFavorited] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">İlan bulunamadı.</p>
        <Link to="/ilanlar">
          <Button>İlanlara Dön</Button>
        </Link>
      </div>
    );
  }

  const listingLabel = property.listingType === "SALE" ? "Satılık" : "Kiralık";
  const typeLabel: Record<string, string> = {
    APARTMENT: "Daire",
    HOUSE: "Villa",
    LAND: "Arsa",
    COMMERCIAL: "Ticari",
    OFFICE: "Ofis",
    WAREHOUSE: "Depo",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            Geri
          </button>
          <Link to="/" className="flex items-center gap-2 font-bold ml-auto">
            <Building2 className="h-5 w-5 text-primary" />
            Arsarazi
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-2">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden relative">
                {property.images?.[selectedImage] ? (
                  <img
                    src={property.images[selectedImage].url}
                    alt={property.images[selectedImage].altText || property.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Building2 className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="text-sm">{listingLabel}</Badge>
                  <Badge variant="secondary" className="text-sm">{typeLabel[property.type]}</Badge>
                </div>
              </div>
              {property.images && property.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {property.images.map((img, i) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(i)}
                      className={`w-20 h-20 rounded-md overflow-hidden shrink-0 border-2 ${
                        i === selectedImage ? "border-primary" : "border-transparent"
                      }`}
                    >
                      <img src={img.url} alt={img.altText || ""} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <h1 className="text-2xl font-bold">{property.title}</h1>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {property.fullAddress || `${property.city}, ${property.district}, ${property.neighborhood}`}
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" /> {property.views} görüntülenme
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(property.createdAt).toLocaleDateString("tr-TR")}
                </span>
              </div>
            </div>

            <Separator />

            {/* Key Features */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {property.roomCount !== null && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Bed className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Oda</p>
                    <p className="font-semibold">{property.roomCount}</p>
                  </div>
                </div>
              )}
              {property.bathroomCount !== null && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Bath className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Banyo</p>
                    <p className="font-semibold">{property.bathroomCount}</p>
                  </div>
                </div>
              )}
              {property.area !== null && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Maximize className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Alan</p>
                    <p className="font-semibold">{property.area} m²</p>
                  </div>
                </div>
              )}
              {property.floor !== null && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Home className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Kat</p>
                    <p className="font-semibold">{property.floor}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Detaylar</TabsTrigger>
                <TabsTrigger value="features">Özellikler</TabsTrigger>
                <TabsTrigger value="location">Konum</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="space-y-4 mt-4">
                <p className="text-muted-foreground leading-relaxed">
                  {property.description || "Açıklama bulunmamaktadır."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.buildYear && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Yapım Yılı</span>
                      <span className="font-medium">{property.buildYear}</span>
                    </div>
                  )}
                  {property.heatingType && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Isıtma</span>
                      <span className="font-medium">{property.heatingType}</span>
                    </div>
                  )}
                  {property.floorCount && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Kat Sayısı</span>
                      <span className="font-medium">{property.floorCount}</span>
                    </div>
                  )}
                  {property.netArea && (
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-muted-foreground">Net Alan</span>
                      <span className="font-medium">{property.netArea} m²</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Otopark</span>
                    <span className="font-medium">{property.hasParking ? <Check className="h-4 w-4 text-green-600" /> : "Hayır"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Asansör</span>
                    <span className="font-medium">{property.hasElevator ? <Check className="h-4 w-4 text-green-600" /> : "Hayır"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Bahçe</span>
                    <span className="font-medium">{property.hasGarden ? <Check className="h-4 w-4 text-green-600" /> : "Hayır"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Eşyalı</span>
                    <span className="font-medium">{property.hasFurnished ? <Check className="h-4 w-4 text-green-600" /> : "Hayır"}</span>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="features" className="mt-4">
                {property.features ? (
                  <div className="flex flex-wrap gap-2">
                    {(property.features as string[]).map((feature, i) => (
                      <Badge key={i} variant="secondary">{feature}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Özellik listesi bulunmamaktadır.</p>
                )}
              </TabsContent>
              <TabsContent value="location" className="mt-4">
                {property.latitude && property.longitude ? (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-10 w-10 mx-auto text-primary mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {property.latitude}, {property.longitude}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Harita entegrasyonu için Leaflet.js eklenebilir.
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Konum bilgisi bulunmamaktadır.</p>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <Card className="sticky top-20">
              <CardContent className="p-6 space-y-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {Number(property.price).toLocaleString("tr-TR")} {property.currency}
                  </p>
                  {property.pricePerSqm && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {Number(property.pricePerSqm).toLocaleString("tr-TR")} {property.currency}/m²
                    </p>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button className="w-full" size="lg">
                    <Phone className="h-4 w-4 mr-2" />
                    İletişime Geç
                  </Button>
                  <Button variant="outline" className="w-full" size="lg">
                    <Mail className="h-4 w-4 mr-2" />
                    Mesaj Gönder
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setFavorited(!favorited)}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${favorited ? "fill-red-500 text-red-500" : ""}`} />
                    {favorited ? "Favoriden Çıkar" : "Favoriye Ekle"}
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share2 className="h-4 w-4 mr-1" />
                    Paylaş
                  </Button>
                </div>

                <Separator />

                {/* Agent */}
                {property.agent && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Danışman</p>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-medium">
                        {property.agent.name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium">{property.agent.name}</p>
                        <p className="text-xs text-muted-foreground">{property.agent.phone}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
