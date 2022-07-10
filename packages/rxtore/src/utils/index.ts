function identical<T>(v1: T, v2: T): boolean {
  return v1 === v2;
}

function zip<T1, T2>(arr1: T1[], arr2: T2[]): [T1, T2][] {
  const len = Math.min(arr1.length, arr2.length);

  const ret: [T1, T2][] = [];

  for (let i = 0; i < len; i++) {
    ret.push([arr1[i], arr2[i]]);
  }

  return ret;
}

function union<T>(arr1: T[], arr2: T[]): T[] {
  return [...new Set([...arr1, ...arr2])];
}

export { identical, zip, union };
