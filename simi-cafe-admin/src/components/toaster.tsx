"use client";

import { Toast, Toaster, createToaster } from "@ark-ui/react/toast";
import { Portal } from "@ark-ui/react/portal";
import { X, CheckCircle, ExclamationCircle, InfoCircle } from "react-bootstrap-icons";

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
          const isError = toast.type === "error";
          const isSuccess = toast.type === "success";
          
          return (
            <Toast.Root className="group relative overflow-anywhere bg-[var(--admin-surface)] rounded-xl shadow-lg border border-[var(--admin-border)] min-w-[320px] max-w-sm p-4 pr-10 transition-all duration-300 ease-out will-change-transform h-(--height) opacity-(--opacity) translate-x-(--x) translate-y-(--y) scale-(--scale) z-[9999]">
              
              <div className="flex items-start gap-3">
                {isError && <ExclamationCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
                {isSuccess && <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />}
                {!isError && !isSuccess && <InfoCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}
                
                <div className="flex flex-col gap-1">
                  <Toast.Title className="font-semibold text-[var(--admin-text)] text-sm leading-none">
                    {toast.title}
                  </Toast.Title>
                  {toast.description && (
                    <Toast.Description className="text-sm text-[var(--admin-text-muted)] leading-snug">
                      {toast.description}
                    </Toast.Description>
                  )}
                </div>
              </div>

              <Toast.CloseTrigger className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[var(--admin-surface-hover)] transition-colors text-[var(--admin-text-muted)] hover:text-[var(--admin-text)] focus:outline-none focus:ring-2 focus:ring-blue-500">
                <X className="w-4 h-4" />
              </Toast.CloseTrigger>
            </Toast.Root>
          );
        }}
      </Toaster>
    </Portal>
  );
}
