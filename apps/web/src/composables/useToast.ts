import { readonly, shallowRef } from "vue";

type ToastVariant = "default" | "success" | "error";

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
  variant?: ToastVariant;
}

interface ToastItem extends Required<Pick<ToastOptions, "title" | "duration" | "variant">> {
  id: string;
  description?: string;
  open: boolean;
}

const toasts = shallowRef<ToastItem[]>([]);

export function useToast() {
  function showToast(options: ToastOptions) {
    const toast: ToastItem = {
      id: crypto.randomUUID(),
      open: true,
      title: options.title,
      description: options.description,
      duration: options.duration ?? 3200,
      variant: options.variant ?? "default",
    };

    toasts.value = [...toasts.value, toast];

    window.setTimeout(() => {
      dismissToast(toast.id);
    }, toast.duration);

    return toast.id;
  }

  function dismissToast(id: string) {
    toasts.value = toasts.value.map((toast) =>
      toast.id === id ? { ...toast, open: false } : toast,
    );

    window.setTimeout(() => {
      toasts.value = toasts.value.filter((toast) => toast.id !== id);
    }, 220);
  }

  return {
    toasts: readonly(toasts),
    toast: showToast,
    dismissToast,
  };
}
