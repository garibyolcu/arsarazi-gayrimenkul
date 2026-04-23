import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Building2,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Grid3X3,
  List,
  ArrowLeft,
  Eye,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export default function PropertyList() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    status: (searchParams.get("status") as any) || undefined,
    type: (searchParams.get("type") as any) || undefined,
    listingType: (searchParams.get("listing") as any) || undefined,
    city: searchParams.get("city") || "",
    district: "",
    minPrice: undefined as number | undefined,
    maxPrice: undefined as number | undefined,
    sortBy: (searchParams.get("sortBy") as any) || "createdAt",
    sortOrder: (searchParams.get("sortOrder") as any) || "desc",
    page: 1,
    limit: 12,
  });

  const debouncedCity = useDebounce(filters.city, 300);

  const { data, isLoading } = trpc.property.list.useQuery({
    status: filters.status,
    type: filters.type,
    listingType: filters.listingType,
    city: debouncedCity,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  });

  const totalPages = data?.total ? Math.ceil(data.total / filters.limit) : 0;

  const FilterPanel = () => (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">İşlem Türü</label>
        <Select
          value={filters.listingType || "ALL"}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, listingType: v === "ALL" ? undefined : v, page: 1 }))
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tümü</SelectItem>
            <SelectItem value="SALE">Satılık</SelectItem>
            <SelectItem value="RENT">Kiralık</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Gayrimenkul Tipi</label>
        <Select
          value={filters.type || "ALL"}
          onValueChange={(v) =>
            setFilters((f) => ({ ...f, type: v === "ALL" ? undefined : v, page: 1 }))
          }
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tümü</SelectItem>
            <SelectItem value="APARTMENT">Daire</SelectItem>
            <SelectItem value="HOUSE">Villa</SelectItem>
            <SelectItem value="LAND">Arsa</SelectItem>
            <SelectItem value="COMMERCIAL">Ticari</SelectItem>
            <SelectItem value="OFFICE">Ofis</SelectItem>
            <SelectItem value="WAREHOUSE">Depo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium">Şehir</label>
        <Input
          className="mt-1"
          placeholder="Şehir ara..."
          value={filters.city}
          onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value, page: 1 }))}
        />
      </div>

      <div>
        <label className="text-sm font-medium">İlçe</label>
        <Input
          className="mt-1"
          placeholder="İlçe ara..."
          value={filters.district}
          onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value, page: 1 }))}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-sm font-medium">Min Fiyat</label>
          <Input
            type="number"
            className="mt-1"
            placeholder="Min"
            value={filters.minPrice || ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, minPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 }))
            }
          />
        </div>
        <div>
          <label className="text-sm font-medium">Max Fiyat</label>
          <Input
            type="number"
            className="mt-1"
            placeholder="Max"
            value={filters.maxPrice || ""}
            onChange={(e) =>
              setFilters((f) => ({ ...f, maxPrice: e.target.value ? Number(e.target.value) : undefined, page: 1 }))
            }
          />
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={() =>
          setFilters({
            status: undefined,
            type: undefined,
            listingType: undefined,
            city: "",
            district: "",
            minPrice: undefined,
            maxPrice: undefined,
            sortBy: "createdAt",
            sortOrder: "desc",
            page: 1,
            limit: 12,
          })
        }
      >
        Filtreleri Sıfırla
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b bg-white/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <ArrowLeft className="h-4 w-4" />
            <Building2 className="h-5 w-5 text-primary" />
            Arsarazi
          </Link>
          <div className="flex-1" />
          <Link to="/login">
            <Button size="sm">Panel Girişi</Button>
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20 bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filtreler
              </h3>
              <FilterPanel />
            </div>
          </aside>

          {/* Mobile Filters */}
          {mobileFiltersOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setMobileFiltersOpen(false)}>
              <div className="absolute right-0 top-0 h-full w-80 bg-white p-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Filtreler</h3>
                  <Button variant="ghost" size="sm" onClick={() => setMobileFiltersOpen(false)}>Kapat</Button>
                </div>
                <ScrollArea className="h-[calc(100vh-100px)]">
                  <FilterPanel />
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold">İlanlar</h1>
                <p className="text-sm text-muted-foreground">
                  {data?.total ?? 0} ilan bulundu
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setMobileFiltersOpen(true)}
                >
                  <SlidersHorizontal className="h-4 w-4 mr-1" />
                  Filtreler
                </Button>
                <Select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onValueChange={(v) => {
                    const [sortBy, sortOrder] = v.split("-") as [any, any];
                    setFilters((f) => ({ ...f, sortBy, sortOrder }));
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc">En Yeni</SelectItem>
                    <SelectItem value="price-asc">Fiyat (Artan)</SelectItem>
                    <SelectItem value="price-desc">Fiyat (Azalan)</SelectItem>
                    <SelectItem value="views-desc">En Çok Görüntülenen</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border rounded-md overflow-hidden">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    className="rounded-none"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    className="rounded-none"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {data?.items?.map((property) => (
                      <Link key={property.id} to={`/ilanlar/${property.slug}`}>
                        <Card className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                            {property.images?.[0] ? (
                              <img
                                src={property.images[0].url}
                                alt={property.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <Building2 className="h-10 w-10" />
                              </div>
                            )}
                            <Badge className="absolute top-3 left-3">
                              {property.listingType === "SALE" ? "Satılık" : "Kiralık"}
                            </Badge>
                          </div>
                          <CardContent className="p-4 space-y-2">
                            <h3 className="font-semibold line-clamp-1">{property.title}</h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {property.city}, {property.district}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {property.roomCount && (
                                <span className="flex items-center gap-1">
                                  <Bed className="h-3 w-3" /> {property.roomCount}
                                </span>
                              )}
                              {property.bathroomCount && (
                                <span className="flex items-center gap-1">
                                  <Bath className="h-3 w-3" /> {property.bathroomCount}
                                </span>
                              )}
                              {property.area && (
                                <span className="flex items-center gap-1">
                                  <Maximize className="h-3 w-3" /> {property.area}m²
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" /> {property.views}
                              </span>
                            </div>
                            <p className="font-bold text-primary">
                              {Number(property.price).toLocaleString("tr-TR")} {property.currency}
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data?.items?.map((property) => (
                      <Link key={property.id} to={`/ilanlar/${property.slug}`}>
                        <Card className="overflow-hidden hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row">
                            <div className="w-full sm:w-48 aspect-square sm:aspect-auto bg-muted relative overflow-hidden shrink-0">
                              {property.images?.[0] ? (
                                <img
                                  src={property.images[0].url}
                                  alt={property.title}
                                  className="w-full h-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <Building2 className="h-10 w-10" />
                                </div>
                              )}
                            </div>
                            <CardContent className="p-4 flex-1 flex flex-col justify-between">
                              <div>
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-semibold">{property.title}</h3>
                                  <Badge>
                                    {property.listingType === "SALE" ? "Satılık" : "Kiralık"}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                  <MapPin className="h-3 w-3" />
                                  {property.city}, {property.district}
                                </p>
                              </div>
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  {property.roomCount && (
                                    <span className="flex items-center gap-1">
                                      <Bed className="h-3 w-3" /> {property.roomCount}
                                    </span>
                                  )}
                                  {property.area && (
                                    <span className="flex items-center gap-1">
                                      <Maximize className="h-3 w-3" /> {property.area}m²
                                    </span>
                                  )}
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" /> {property.views}
                                  </span>
                                </div>
                                <p className="font-bold text-primary">
                                  {Number(property.price).toLocaleString("tr-TR")} {property.currency}
                                </p>
                              </div>
                            </CardContent>
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filters.page <= 1}
                      onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
                    >
                      Önceki
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Sayfa {filters.page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={filters.page >= totalPages}
                      onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
                    >
                      Sonraki
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
