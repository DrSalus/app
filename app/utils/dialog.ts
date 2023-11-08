import { useCallback, useState } from "react";

type OpenDialogFn<T> = (item?: T) => void;
type Dialog<T> = [boolean, T | null, OpenDialogFn<T>, () => void];

export function useDialog<T>(): Dialog<T> {
  const [isOpen, setOpen] = useState(false);
  const [item, setItem] = useState<T | null>(null);

  const open = useCallback((item?: T) => {
    setItem(item ?? null);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setItem(null);
    setOpen(false);
  }, []);

  return [isOpen, item, open, close];
}
