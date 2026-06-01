"use client";

import { Toast, Toaster, createToaster } from "@ark-ui/react/toast";
import { Portal } from "@ark-ui/react/portal";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export const toaster = createToaster({
  placement: "bottom-end",
  gap: 16,
  overlap: true,
  duration: 4000,
});

export function GlobalToaster() {
  return (
    <Portal>
      <Toaster toaster={toaster}>
        {(toast) => {
          // Determine icon and colors based on type
          const isError = toast.type === "error";
          const isSuccess = toast.type === "success";
          
          return (
            <Toast.Root className="group relative overflow-anywhere bg-[rgb(var(--surface-raised))] backdrop-blur-xl rounded-2xl shadow-xl border border-[rgb(var(--border-soft))] min-w-[320px] max-w-sm p-4 pr-10 transition-all duration-300 ease-out will-change-transform h-(--height) opacity-(--opacity) translate-x-(--x) translate-y-(--y) scale-(--scale) z-(--z-index) data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-bottom-10 sm:data-[state=open]:slide-in-from-right-full">
              
              <div className="flex items-start gap-3">
                {isError && <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />}
                {!isError && !isSuccess && <Info className="w-5 h-5 text-[rgb(var(--accent))] shrink-0 mt-0.5" />}
                
                <div className="flex flex-col gap-1">
                  <Toast.Title className="font-serif font-bold text-[rgb(var(--foreground))] text-base leading-none">
                    {toast.title}
                  </Toast.Title>
                  {toast.description && (
                    <Toast.Description className="text-sm font-medium text-[rgb(var(--foreground)_/_0.6)] leading-snug">
                      {toast.description}
                    </Toast.Description>
                  )}
                </div>
              </div>

              <Toast.CloseTrigger className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-[rgb(var(--surface-muted))] transition-colors text-[rgb(var(--foreground)_/_0.4)] hover:text-[rgb(var(--foreground))] focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]">
                <X className="w-4 h-4" />
              </Toast.CloseTrigger>
            </Toast.Root>
          );
        }}
      </Toaster>
    </Portal>
  );
}
