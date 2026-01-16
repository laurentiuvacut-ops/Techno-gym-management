import { shopItems } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const getStockVariant = (stock: string) => {
    if (stock === "In Stock") return "success";
    if (stock === "Low Stock") return "warning";
    return "destructive";
};

export default function ShopPage() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          Gym Shop
        </h1>
        <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed">
          Fuel your workout with our selection of supplements and gear.
        </p>
      </div>

      <div className="bg-card rounded-lg border">
        <ul className="divide-y divide-border">
          {shopItems.map((item) => (
            <li key={item.id} className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.price}</p>
              </div>
              <Badge variant={getStockVariant(item.stock)}>{item.stock}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
