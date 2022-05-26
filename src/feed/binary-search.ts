type ArrayValue<T> = T extends (infer V)[] ? (V | undefined) : never;

export const binarySearch = <L extends any[]>(
  list: L,
  comparator: (value: ArrayValue<L>, index: number) => number,
): [undefined | ArrayValue<L>, number] => {
  let start = 0;
  let end = list.length - 1;

  while (start <= end) {
    const middleIndex = Math.floor((start + end) / 2);
    const position = comparator(list[middleIndex], middleIndex);

    // Found!!!
    if (position === 0) {
      return [list[middleIndex], middleIndex];
    }

    if (position > 0) {
      // Move right
      start = middleIndex + 1;
    } else {
      // Move left
      end = middleIndex - 1;
    }
  }

  return [undefined, -1];
};
