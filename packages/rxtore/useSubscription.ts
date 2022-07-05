import { useEffect } from "react";
import type { Observable } from "rxjs";
import { useMemorizedFn } from "./useMemorizedFn";

function useSubscription<T>(
  source$: Observable<T>,
  observer: (value: T) => void
) {
  const memorizedObserver = useMemorizedFn(observer);
  useEffect(() => {
    const sub = source$.subscribe(memorizedObserver);

    return () => sub.unsubscribe();
  }, [source$, memorizedObserver]);
}

export { useSubscription };
