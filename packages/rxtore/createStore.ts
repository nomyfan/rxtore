import { useState } from "react";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import * as R from "ramda";
import { useObservable } from "./useObservable";
import { useSubscription } from "./useSubscription";

const createStore = <T>(init: T) => {
  const store$ = new BehaviorSubject(init);

  const useStore = <R>(
    selector: (state: T) => R,
    comparator?: (t1: R, t2: R) => boolean
  ) => {
    const [_store, _setStore] = useState(() => selector(store$.getValue()));

    const observable$ = useObservable(
      store$.pipe(
        map(selector),
        distinctUntilChanged(comparator ?? R.identical)
      )
    );

    useSubscription(observable$, (newStore) => {
      _setStore(newStore);
    });

    const setStore = (newStore: (prevStore: T) => T) => {
      store$.next(newStore(store$.getValue()));
    };

    return { store: _store, setStore };
  };

  const observable$ = store$.asObservable();

  const next = (value: T) => store$.next(value);

  const get: () => Readonly<T> = () => store$.getValue();

  return { useStore, observable$, next, get };
};

export { createStore };
