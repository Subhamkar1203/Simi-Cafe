"use client";

import React, { useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Coffee, CalendarDays, Receipt, ShoppingCart, UserRound } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { cn } from "@/lib/utils";



const simiItems = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Menu', icon: Coffee, href: '/menu' },
  { label: 'Reserve', icon: CalendarDays, href: '/reserve' },
  { label: 'Orders', icon: Receipt, href: '/orders' },
  { label: 'Cart', icon: ShoppingCart, isCart: true },
  { label: 'Account', icon: UserRound, href: '/account' },
];

const defaultAccentColor = 'rgb(var(--accent))';

export function Navbar() {
  const pathname = usePathname();
  const { items: cartItems, setIsCartOpen } = useCart();
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const activeIndex = useMemo(() => {
    const index = simiItems.findIndex(item => {
      if (item.isCart) return false;
      return pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));
    });
    return index >= 0 ? index : 0;
  }, [pathname]);

  const textRefs = React.useRef<(HTMLElement | null)[]>([]);
  const itemRefs = React.useRef<(HTMLElement | null)[]>([]);

  React.useEffect(() => {
    const setLineWidth = () => {
      const activeItemElement = itemRefs.current[activeIndex];
      const activeTextElement = textRefs.current[activeIndex];

      if (activeItemElement && activeTextElement) {
        const textWidth = activeTextElement.offsetWidth;
        activeItemElement.style.setProperty('--lineWidth', `${textWidth}px`);
      }
    };

    setLineWidth();

    window.addEventListener('resize', setLineWidth);
    return () => {
      window.removeEventListener('resize', setLineWidth);
    };
  }, [activeIndex]);

  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  const navStyle = useMemo(() => {
    return { '--component-active-color': defaultAccentColor } as React.CSSProperties;
  }, []); 

  return (
    <>


      <style>{`
        .nav-liquid-lens {
          background-color: rgb(var(--surface) / 0.55);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          
          box-shadow: 
            inset 0 0 0 1px rgba(255, 255, 255, 0.15),
            inset 1px 1px 0px 0px rgba(255, 255, 255, 0.4), 
            inset -1px -1px 0px 0px rgba(255, 255, 255, 0.1), 
            0px 4px 20px 0px rgba(0, 0, 0, 0.05);
            
          transition: background-color 400ms ease, box-shadow 400ms ease;
        }
        
        .dark .nav-liquid-lens {
          background-color: rgba(26, 26, 26, 0.4);
          box-shadow: 
            inset 0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 1px 1px 0px 0px rgba(255, 255, 255, 0.1), 
            inset -1px -1px 0px 0px rgba(255, 255, 255, 0.02), 
            0px 4px 20px 0px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      <header className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] md:bottom-auto md:top-4 left-0 right-0 z-[60] flex justify-center pointer-events-none px-3 sm:px-5 md:px-0">
        <div className="relative pointer-events-auto rounded-full p-[2px] w-full sm:w-[90vw] md:w-[90vw] max-w-[800px]">
          {/* ISOLATED BACKGROUND LENS FOR NAVBAR */}
          <span className="nav-liquid-lens absolute inset-0 -z-10 rounded-[inherit] pointer-events-none shadow-[0_8px_32px_rgba(0,0,0,0.12)]" />

          <nav
            className="interactive-nav relative z-10 w-full h-full"
            role="navigation"
            style={navStyle}
          >
            {simiItems.map((item, index) => {
              const isActive = index === activeIndex;
              const IconComponent = item.icon;

              const innerContent = (
                <>
                  <div className="menu__icon relative text-[rgb(var(--foreground)_/_0.7)] transition hover:text-[rgb(var(--foreground))] drop-shadow-sm">
                    <IconComponent className="icon" />
                    {item.isCart && cartItemCount > 0 && (
                      <span className={cn(
                        "absolute -right-2 -top-1.5 flex size-[14px] items-center justify-center rounded-full bg-[rgb(var(--accent))] text-[8px] font-bold text-[rgb(var(--accent-foreground))] shadow-sm transition-transform",
                        isActive ? "-translate-y-2" : ""
                      )}>
                        {cartItemCount}
                      </span>
                    )}
                  </div>
                  <strong
                    className={cn("menu__text", isActive && "active")}
                    ref={(el) => {
                      textRefs.current[index] = el;
                    }}
                  >
                    {item.label}
                  </strong>
                </>
              );

              if (item.href) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={cn("menu__item", isActive && "active")}
                    onClick={() => setIsCartOpen(false)}
                    ref={(el) => {
                      itemRefs.current[index] = el as HTMLElement | null;
                    }}
                    style={{ '--lineWidth': '0px' } as React.CSSProperties}
                    aria-label={item.label}
                    prefetch={true}
                  >
                    {innerContent}
                  </Link>
                );
              }

              return (
                <button
                  key={item.label}
                  className={cn("menu__item", isActive && "active")}
                  onClick={handleCartClick}
                  ref={(el) => {
                    itemRefs.current[index] = el as HTMLElement | null;
                  }}
                  style={{ '--lineWidth': '0px' } as React.CSSProperties}
                  aria-label={item.label}
                >
                  {innerContent}
                </button>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}
