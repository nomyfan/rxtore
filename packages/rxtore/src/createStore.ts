import { useState, useEffect, useLayoutEffect } from "react";
import { BehaviorSubject, distinctUntilChanged, map } from "rxjs";
import { identical } from "./utils";

const isBrowser = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

const isFunction = (arg: any): arg is Function => typeof arg === "function";

const createStore = <T extends Record<string, any>>(init: T) => {
  const store$ = new BehaviorSubject(init);

  function setStore(
    newStore: (prevStore: T, replace?: false) => Partial<T>,
  ): void;
  function setStore(newStore: (prevStore: T) => T, replace: true): void;
  function setStore(newStore: any, replace?: any): void {
    if (replace) {
      store$.next(newStore(store$.getValue()));
    } else {
      store$.next(
        Object.assign({}, store$.getValue(), newStore(store$.getValue())),
      );
    }
  }

  const useStore = <R>(
    selector: (state: T) => R,
    comparator?: (t1: R, t2: R) => boolean,
  ) => {
    const [_store, _setStore] = useState(() => selector(store$.getValue()));

    useIsomorphicLayoutEffect(() => {
      const subscription = store$
        .pipe(map(selector), distinctUntilChanged(comparator ?? identical))
        .subscribe((newStore) => {
          _setStore(newStore);
        });

      return () => subscription.unsubscribe();
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
