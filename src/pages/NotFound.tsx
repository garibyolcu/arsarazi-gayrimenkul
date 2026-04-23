import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <p className="text-xl text-muted-foreground">Sayfa bulunamadı</p>
      <p className="text-sm text-muted-foreground max-w-md text-center">
        Aradığınız sayfa mevcut değil veya taşınmış olabilir.
      </p>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Geri Dön
        </Button>
        <Link to="/">
          <Button><Home className="h-4 w-4 mr-1" /> Ana Sayfa</Button>
        </Link>
      </div>
    </div>
  );
}
