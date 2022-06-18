import { renderHook, act } from "@testing-library/react-hooks/dom";
import { createStore, id, shallow } from "../index";

describe("shallow comparator", () => {
  it("should return true if the objects are the same", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2 };
    expect(shallow(obj1, obj2)).toBe(true);
  });

  it("should return false if the objects are not the same", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 3 };
    expect(shallow(obj1, obj2)).toBe(false);
  });

  it("should return false if the objects have different keys", () => {
    const obj1 = { a: 1 };
    const obj2 = { a: 1, b: 2 };

    expect(shallow(obj1, obj2)).toBe(false);
  });

  it("should return false if the array have different length", () => {
    const arr1 = [1];
    const arr2 = [1, 2];
    expect(shallow(arr1, arr2)).toBe(false);
  });

  it("should return true if both objects are empty", () => {
    const obj1 = {};
    const obj2 = {};
    expect(shallow(obj1, obj2)).toBe(true);
  });

  it("should return false if the values have different types", () => {
    const obj = {};
    const arr = [];
    expect(shallow(obj, arr)).toBe(false);
  });
});

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
