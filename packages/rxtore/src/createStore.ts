import { useState, useEffect, useLayoutEffect } from "react";
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  startWith,
} from "rxjs";
import { identical } from "./utils";
import { useConstant } from "./useConstant";

const isBrowser = !!(
  typeof window !== "undefined" &&
  window.document &&
  window.document.createElement
);

const useIsomorphicLayoutEffect = isBrowser ? useLayoutEffect : useEffect;

const isFunction = (arg: any): arg is Function => typeof arg === "function";

function createHook<T>(
  store$: Observable<T>,
  getValue: () => T,
  next: (value: T) => void,
) {
  function setStore(
    newStore: (prevStore: T, replace?: false) => Partial<T>,
  ): void;
  function setStore(newStore: (prevStore: T) => T, replace: true): void;
  function setStore(newStore: any, replace?: any): void {
    if (replace) {
      next(newStore(getValue()));
    } else {
      next(Object.assign({}, getValue(), newStore(getValue())));
    }
  }

  const useStoreValue = <R>(
    selector: (state: T) => R,
    comparator?: (t1: R, t2: R) => boolean,
  ) => {
    const initialValue = useConstant(() => getValue());
    const [_store, _setStore] = useState(() => selector(initialValue));

    useIsomorphicLayoutEffect(() => {
      const subscription = store$
        .pipe(
          filter((v) => v !== initialValue),
          map(selector),
        )
        .pipe(
          startWith(_store),
          distinctUntilChanged(comparator ?? identical),
          filter((v) => v !== _store),
        )
        .subscribe((newStore) => {
          _setStore(newStore);
        });

      return () => subscription.unsubscribe();
    }, []);

    return _store;
  };

  const useSetStore = () => setStore;

  const useStore = <R>(
    selector: (state: T) => R,
    comparator?: (t1: R, t2: R) => boolean,
  ) => {
    const store = useStoreValue(selector, comparator);
    const setStore = useSetStore();

    return { store, setStore };
  };

  return { useStore, useStoreValue, useSetStore };
}

function createObservable<T extends Record<string, any>>(init: T) {
  const store$ = new BehaviorSubject(init);

  const observable$ = store$.asObservable();

  const next = (value: T | ((value: T) => T)) => {
    if (isFunction(value)) {
      store$.next(value(store$.getValue()));
    } else {
      store$.next(value);
    }
  };

  const getValue: () => Readonly<T> = () => store$.getValue();

  return { observable$, getValue, next };
}

function createStore<T extends Record<string, any>>(init: T) {
  const { observable$, getValue, next } = createObservable(init);

  const { useStore, useStoreValue, useSetStore } = createHook<T>(
    observable$,
    getValue,
    next,
  );

  return { useStore, useSetStore, useStoreValue, observable$, next, getValue };
}

export { createStore, createHook };
