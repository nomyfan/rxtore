import { useEffect, useRef, useState } from "react";
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  type Unsubscribable,
} from "rxjs";
import * as R from "ramda";

const id = <T>(v: T) => v;

const identical = R.identical;

const shallow = <T>(v1: T, v2: T) => {
  if (v1 instanceof Array && v2 instanceof Array) {
    if (v1.length !== v2.length) {
      return false;
    }
    return R.all(([it1, it2]) => identical(it1, it2), R.zip(v1, v2));
  }

  if (typeof v1 === "object" && typeof v2 === "object") {
    const keys = R.union(Object.keys(v1), Object.keys(v2));
    if (!keys.length) {
      return true;
    }
    return shallow(
      R.map((key) => v1[key], keys),
      R.map((key) => v2[key], keys)
    );
  }

  return identical(v1, v2);
};

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
        .pipe(map(selector), distinctUntilChanged(comparator ?? identical))
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
