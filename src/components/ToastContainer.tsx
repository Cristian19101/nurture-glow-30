import { useToastCustom } from '@/lib/toast-context';

export function ToastContainer() {
  const { toasts, remove } = useToastCustom();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-[9999]">
      {toasts.map(toast => (
        <div
          key={toast.id}
          onClick={() => remove(toast.id)}
          className={`glass-card !p-4 min-w-[280px] cursor-pointer animate-slide-in border-l-[3px] ${
            toast.type === 'success' ? 'border-l-accent' :
            toast.type === 'error' ? 'border-l-destructive' :
            'border-l-primary'
          }`}
        >
          <strong className="text-foreground text-sm block">{toast.title}</strong>
          <span className="text-muted-foreground text-xs">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
