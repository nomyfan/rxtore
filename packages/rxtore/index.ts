import { useEffect, useRef, useState } from "react";
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  type Unsubscribable,
} from "rxjs";
import * as R from "ramda";

type PlainObject<V = unknown> = Record<string | symbol, V>;

const id = <T>(v: T) => v;

function shallow<T>(v1: T, v2: T): boolean {
  const v1IsArray = v1 instanceof Array;
  const v2IsArray = v2 instanceof Array;
  if (v1IsArray && v2IsArray) {
    if (v1.length !== v2.length) {
      return false;
    }
    return R.all(([it1, it2]) => R.identical(it1, it2), R.zip(v1, v2));
  }

  if (
    typeof v1 === "object" &&
    !v1IsArray &&
    typeof v2 === "object" &&
    !v2IsArray
  ) {
    const keys = R.union(
      Reflect.ownKeys(v1 as unknown as object),
      Reflect.ownKeys(v2 as unknown as object)
    );
    if (!keys.length) {
      return true;
    }
    return shallow(
      R.map((key) => (v1 as PlainObject)[key], keys),
      R.map((key) => (v2 as PlainObject)[key], keys)
    );
  }

  return R.identical(v1, v2);
}

const createStore = <T>(init: T) => {
  const store$ = new BehaviorSubject(init);

  const useStore = <R>(
    selector: (state: T) => R,
    comparator?: (t1: R, t2: R) => boolean
  ) => {
    const [_store, _setStore] = useState(() => selector(store$.getValue()));

    const subscription = useRef<Unsubscribable | null>(null);
    if (!subscription.current) {
      subscription.current = store$
        .pipe(map(selector), distinctUntilChanged(comparator ?? R.identical))
        .subscribe((newStore) => {
          _setStore(newStore);
        });
    }

    useEffect(() => {
      return () => {
        subscription.current?.unsubscribe();
        subscription.current = null;
      };
    }, []);

    const setStore = (newStore: (prevStore: T) => T) => {
      store$.next(newStore(store$.getValue()));
    };

    return { store: _store, setStore };
  };

  return { useStore };
};

export { createStore, shallow, id };
