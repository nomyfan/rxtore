import { useRef } from "react";

interface Box<T> {
  value: T;
}

export function useConstant<T>(value: () => T): T {
  const _box = useRef<Box<T>>();
  if (!_box.current) {
    _box.current = { value: value() };
  }

  return _box.current.value;
}
