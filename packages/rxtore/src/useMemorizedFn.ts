import { useMemo, useRef } from "react";

type Fn = (this: any, ...args: any[]) => any;

type PickFunction<T extends Fn> = (
  this: ThisParameterType<T>,
  ...args: Parameters<T>
) => ReturnType<T>;

function useMemorizedFn<T extends Fn>(fn: T) {
  const ref = useRef(fn);

  ref.current = useMemo(() => fn, [fn]);

  const memorizedFn = useRef<PickFunction<T>>();
  if (!memorizedFn.current) {
    memorizedFn.current = function (this, ...args) {
      return ref.current.apply(this, args);
    };
  }

  return memorizedFn.current!;
}

export { useMemorizedFn };
