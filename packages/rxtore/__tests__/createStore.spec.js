import { renderHook, act } from "@testing-library/react-hooks/dom";
import { createStore, id } from "../index";
import { filter, map } from "rxjs";

describe("useStore", () => {
  it("should return the initial store", () => {
    const initStore = { name: "rxtore" };
    const { useStore } = createStore(initStore);
    const { result } = renderHook(() => useStore(id));

    expect(result.current.store).toEqual(initStore);
  });

  it("should return updated store", () => {
    const { useStore } = createStore({ name: "rxtore" });
    const { result } = renderHook(() => useStore(id));

    act(() => {
      result.current.setStore(() => ({ name: "rxtore-updated" }));
    });

    expect(result.current.store).toEqual({ name: "rxtore-updated" });
  });

  it("should return selected partial", () => {
    const { useStore } = createStore({
      name: "rxtore",
      description: "Reactive",
    });

    const { result } = renderHook(() =>
      useStore((state) => ({ name: state.name }))
    );

    expect(result.current.store).toEqual({ name: "rxtore" });
  });

  it("should not update because the partial compared is not updated", () => {
    const { useStore } = createStore({
      revision: "1",
      name: "rxtore",
      description: "Reactive",
    });

    const { result } = renderHook(() =>
      useStore(
        (state) => ({ name: state.name, revision: state.revision }),
        (s1, s2) => s1.name === s2.name
      )
    );

    act(() => {
      result.current.setStore((state) => ({
        ...state,
        description: "Boom!",
        revision: "2",
      }));
    });

    expect(result.current.store).toEqual({ name: "rxtore", revision: "1" });
  });
});

describe("observable", () => {
  it("should get updates from subscription", () => {
    const { observable$, next } = createStore({ name: "rxtore", revision: 1 });

    let nextValue = null;
    observable$
      .pipe(
        filter((v) => {
          return v.revision > 2;
        }),
        map((v) => ({ name: v.name }))
      )
      .subscribe((value) => (nextValue = value));

    next({ name: "rxtore2", revision: 2 });
    expect(nextValue).toBeNull();

    next({ name: "rxtore3", revision: 3 });
    expect(nextValue).toEqual({ name: "rxtore3" });
  });

  it("should be able to get latest value", () => {
    const { getValue, next } = createStore({ name: "rxtore", revision: 1 });

    expect(getValue()).toEqual({ name: "rxtore", revision: 1 });

    next({ name: "rxtore2", revision: 2 });
    expect(getValue()).toEqual({ name: "rxtore2", revision: 2 });
  });

  it("should able to get latest value from next factory", () => {
    const { getValue, next } = createStore({ name: "rxtore", revision: 1 });

    next((st) => {
      if (st.revision === 1) {
        return {
          ...st,
          revision: 2,
          name: "rxtore2",
        };
      }
      return st;
    });

    expect(getValue()).toEqual({ name: "rxtore2", revision: 2 });
  });
});
