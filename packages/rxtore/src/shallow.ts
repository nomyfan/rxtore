import { identical, zip, union } from "./utils";

type PlainObject<V = unknown> = Record<string | symbol, V>;

function shallow<T>(v1: T, v2: T): boolean {
  const v1IsArray = v1 instanceof Array;
  const v2IsArray = v2 instanceof Array;
  if (v1IsArray && v2IsArray) {
    if (v1.length !== v2.length) {
      return false;
    }

    return zip(v1, v2).every(([it1, it2]) => identical(it1, it2));
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

    const keys = union(keys1, keys2);
    return shallow(
      keys.map((key) => (v1 as PlainObject)[key]),
      keys.map((key) => (v2 as PlainObject)[key])
    );
  }

  return identical(v1, v2);
}

export { shallow };
