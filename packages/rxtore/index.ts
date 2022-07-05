import { useEffect, useRef, useState } from "react";
import {
  BehaviorSubject,
  distinctUntilChanged,
  map,
  type Unsubscribable,
} from "rxjs";
import * as R from "ramda";
import { useObservable } from "./useObservable";
import { useSubscription } from "./useSubscription";

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
    const keys1 = Reflect.ownKeys(v1 as unknown as object);
    const keys2 = Reflect.ownKeys(v2 as unknown as object);
    if (keys1.length !== keys2.length) {
      return false;
    }
    if (keys1.length === 0 && keys2.length === 0) {
      return true;
    }

    const keys = R.union(keys1, keys2);
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

export { createStore, shallow, id };
