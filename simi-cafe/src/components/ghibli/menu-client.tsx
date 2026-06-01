"use client";

import { useMemo, useState, useEffect, memo, useCallback } from "react";
import { Leaf, ShoppingBag, Heart, Search, ArrowUpDown, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroContentCard } from "@/components/ui/hero-content-card";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

export interface MenuItem {
  id: number;
  name: string;
  category_name: string;
  description: string;
  price: string;
  image_url: string;
  diet_type_name: string;
  is_available: number;
  is_seasonal: number;
  tag_names?: string;
}

const MenuItemCard = memo(({ 
  item, 
  isFav, 
  toggleFavorite, 
  addItem 
}: { 
  item: MenuItem; 
  isFav: boolean; 
  toggleFavorite: (id: number, isFav: boolean) => void;
  addItem: any;
}) => {
  const isAvail = Boolean(item.is_available);
  const itemDiet = item.diet_type_name || "Unknown";

  return (
    <article
      className="group relative flex flex-col overflow-hidden rounded-[2.5rem] border border-[rgb(var(--border-soft)_/_0.8)] bg-[rgb(var(--surface-raised)_/_0.95)] backdrop-blur-2xl transition-all duration-700 ease-out hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)] hover:border-[rgb(var(--accent)_/_0.4)]"
    >
      <div className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 pointer-events-none rounded-[2.5rem] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]" />
      
      <div className="p-3 pb-0">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05)] bg-[rgb(var(--surface-muted))]">
          <Image
            src={item.image_url || "/images/placeholder.jpg"}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={cn(
              "object-cover transition-all duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:scale-110",
              !item.image_url && 'opacity-75 mix-blend-luminosity saturate-50'
            )}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          
          {!isAvail && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <span className="rounded-full bg-white/95 px-5 py-2.5 text-[10px] font-extrabold uppercase tracking-[0.25em] text-black shadow-xl">Sold Out</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-7 pt-6">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-[rgb(var(--forest))] drop-shadow-sm">{item.category_name}</p>
              <div className="mt-2.5 flex items-start justify-between gap-3">
                <h2 className="font-serif text-[length:var(--fs-h3)] font-bold leading-tight tracking-tight text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--accent))] transition-colors duration-500">{item.name}</h2>
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.preventDefault();
                    toggleFavorite(item.id, isFav);
                  }}
                  className={cn(
                    "flex size-[38px] shrink-0 items-center justify-center rounded-full border transition-all duration-300 shadow-sm",
                    isFav 
                      ? "border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-900/50 dark:bg-rose-950/40" 
                      : "border-[rgb(var(--border-soft))] bg-transparent text-muted-foreground hover:bg-[rgb(var(--surface-muted))] hover:text-foreground"
                  )}
                  aria-label="Toggle favorite"
                >
                  <Heart className={cn("size-4 transition-transform", isFav && "fill-current scale-110")} />
                </motion.button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-[length:var(--fs-body)] leading-relaxed text-muted-foreground line-clamp-2 opacity-90">{item.description}</p>
        </div>
        
        <div className="mt-8 flex flex-col gap-6">
          <div className="flex items-end justify-between">
            <p className="text-[length:var(--fs-h3)] font-bold tracking-tighter site-price">₹{item.price}</p>
            <div className="flex flex-wrap gap-2 justify-end">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-current/10 bg-[rgb(var(--surface)_/_0.5)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <Leaf className={cn("size-3", itemDiet === "Vegan" ? "text-green-600" : itemDiet === "Veg" ? "text-green-500" : itemDiet === "Non-Veg" ? "text-red-400" : "text-amber-500")} />
                {itemDiet}
              </span>
              {item.tag_names && item.tag_names.split(",").slice(0, 1).map((tagName: string, i: number) => (
                <span key={i} className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[rgb(var(--accent)_/_0.2)] bg-[rgb(var(--accent)_/_0.05)] text-[rgb(var(--accent-foreground))] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
                  {tagName}
                </span>
              ))}
            </div>
          </div>
          <Button 
            onClick={() => addItem({
              menu_item_id: item.id,
              name: item.name,
              price: Number(item.price),
              quantity: 1,
              image_url: item.image_url
            })}
            disabled={!isAvail}
            className="w-full rounded-[1.25rem] h-14 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] font-bold tracking-wide bg-[rgb(var(--forest))] text-white hover:bg-[rgb(var(--forest)_/_0.9)]"
          >
            <ShoppingBag className="mr-2 size-4" /> Add to Cart
          </Button>
        </div>
      </div>
    </article>
  );
});

export function MenuClient({ initialMenuData }: { initialMenuData: any }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();
  
  const [category, setCategory] = useState("All");
  const [diet, setDiet] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [favorites, setFavorites] = useState<number[]>([]);

  const items = initialMenuData?.items || [];
  const categories: string[] = initialMenuData?.items ? ["All", ...Array.from(new Set(initialMenuData.items.map((i: MenuItem) => i.category_name))) as string[]] : [];
  const dietTypes: string[] = initialMenuData?.dietTypes && initialMenuData.dietTypes.length > 0 ? ["All", ...initialMenuData.dietTypes] : ["All", "Veg", "Non-Veg", "Vegan"];
  
  useEffect(() => {
    async function fetchFavorites() {
      if (user) {
        try {
          const res = await fetch("/api/user/favorites");
          const data = await res.json();
          if (data.favorites) {
            setFavorites(data.favorites.map((f: MenuItem) => f.id));
          }
        } catch (err) {
          console.error("Failed to load favorites", err);
        }
      } else {
        setFavorites([]);
      }
    }
    fetchFavorites();
  }, [user]);

  const toggleFavorite = useCallback(async (itemId: number, isFav: boolean) => {
    if (!user) {
      router.push('/account?msg=favorites');
      return;
    }

    const method = isFav ? "DELETE" : "POST";
    const url = isFav ? `/api/user/favorites?menu_item_id=${itemId}` : "/api/user/favorites";
    
    try {
      setFavorites(prev => isFav ? prev.filter(id => id !== itemId) : [...prev, itemId]);
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: isFav ? null : JSON.stringify({ menu_item_id: itemId })
      });
    } catch (e) {
      console.error(e);
      // Revert on fail
      setFavorites(prev => !isFav ? prev.filter(id => id !== itemId) : [...prev, itemId]);
    }
  }, [user, router]);

  const visibleItems = useMemo(() => {
    let filtered = items.filter((item: MenuItem) => {
      if (category !== "All" && item.category_name !== category) return false;
      if (diet !== "All" && item.diet_type_name !== diet) return false;
      if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    if (sort === "price-low") {
      filtered.sort((a: MenuItem, b: MenuItem) => Number(a.price) - Number(b.price));
    } else if (sort === "price-high") {
      filtered.sort((a: MenuItem, b: MenuItem) => Number(b.price) - Number(a.price));
    }

    return filtered;
  }, [items, category, diet, search, sort]);

  return (
    <div className="site-page relative px-5 pb-16 pt-6 sm:pt-8 md:pb-32 md:pt-32 sm:px-8">
      <section className="relative mx-auto max-w-7xl z-10">
        <HeroContentCard
          className="max-w-2xl"
          eyebrow={<><Sparkles className="size-4 text-[rgb(var(--accent))]" /> Our Menu</>}
          title="What would you like today?"
          description="Browse and plan your order. Order ahead for pickup or dine-in."
        />

        <div className="mt-10 flex flex-col gap-5 rounded-3xl p-5 md:flex-row md:items-center md:justify-between site-panel shadow-sm">
          {categories.length > 0 && (
            <Tabs value={category} onValueChange={setCategory}>
              <TabsList className="h-auto flex-wrap justify-start bg-transparent gap-2">
                {categories.map((item) => (
                  <TabsTrigger 
                    key={item} 
                    value={item}
                    className="data-[state=active]:bg-[rgb(var(--accent))] data-[state=active]:text-[rgb(var(--accent-foreground))] data-[state=active]:shadow-md rounded-full px-5 py-2 font-bold transition-all border border-transparent data-[state=inactive]:border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-raised)_/_0.4)] hover:bg-[rgb(var(--surface-raised)_/_0.9)]"
                  >
                    {item}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
          <RadioGroup value={diet} onValueChange={setDiet} className="flex flex-wrap gap-4">
            {dietTypes.map((item) => (
              <label key={item} className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
                <RadioGroupItem value={item} />
                {item}
              </label>
            ))}
          </RadioGroup>
        </div>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search for food..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-raised)_/_0.85)] py-3 pl-11 pr-5 text-sm font-semibold outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)]"
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ArrowUpDown className="size-4" />
            <select 
              value={sort} 
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-[rgb(var(--border-soft))] bg-[rgb(var(--surface-raised)_/_0.85)] px-4 py-3 outline-none shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] font-semibold"
            >
              <option value="default">Default Sort</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleItems.length === 0 ? (
            <p className="col-span-full py-10 text-center text-lg text-muted-foreground">
              No items found.
            </p>
          ) : (
            visibleItems.map((item: MenuItem) => {
              const isFav = favorites.includes(item.id);
              return (
                <MenuItemCard 
                  key={item.id} 
                  item={item} 
                  isFav={isFav} 
                  toggleFavorite={toggleFavorite} 
                  addItem={addItem} 
                />
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
