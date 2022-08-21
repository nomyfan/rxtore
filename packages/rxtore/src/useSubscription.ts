import { useEffect } from "react";
import type { Observable } from "rxjs";

function useSubscription<T>(
  source$: Observable<T>,
  observer: (value: T) => void
) {
  useEffect(() => {
    const sub = source$.subscribe(observer);

    return () => sub.unsubscribe();
  }, [source$]);
}

export { useSubscription };
