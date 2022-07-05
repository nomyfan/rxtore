import { useEffect } from "react";
import type { Observable } from "rxjs";
import { useMemorizedFn } from "./useMemorizedFn";

function useSubscription<T>(
  source$: Observable<T>,
  subscriber: (value: T) => void
) {
  const memorizedSubscriber = useMemorizedFn(subscriber);
  useEffect(() => {
    const sub = source$.subscribe(memorizedSubscriber);

    return () => sub.unsubscribe();
  }, [source$, memorizedSubscriber]);
}

export { useSubscription };
