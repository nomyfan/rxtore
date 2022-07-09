import { shallow } from "../index";

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
