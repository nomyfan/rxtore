import { useState, useCallback } from "react";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import { identical } from "./utils";
import { useObservable } from "./useObservable";
import { useSubscription } from "./useSubscription";

const isFunction = (arg: any): arg is Function => typeof arg === "function";

const createStore = <T extends Record<string, any>>(init: T) => {
  const store$ = new BehaviorSubject(init);

  const useStore = <R>(
    selector: (state: T) => R,
    comparator?: (t1: R, t2: R) => boolean
  ) => {
    const [_store, _setStore] = useState(() => selector(store$.getValue()));

    const observable$ = useObservable(
      store$.pipe(map(selector), distinctUntilChanged(comparator ?? identical))
    );

    useSubscription(observable$, (newStore) => {
      _setStore(newStore);
    });

    const setStore = useCallback((newStore: (prevStore: T) => T) => {
      store$.next(newStore(store$.getValue()));
    }, []);

    return { store: _store, setStore };
  };

  const observable$ = store$.asObservable();

  const next = (value: T | ((value: T) => T)) => {
    if (isFunction(value)) {
      store$.next(value(store$.getValue()));
    } else {
      store$.next(value);
    }
  };

  const getValue: () => Readonly<T> = () => store$.getValue();

  return { useStore, observable$, next, getValue };
};

export { createStore };
