type MapValueType<T> = T extends Map<any, infer V> ? V : never;

export const binarySearch = <L extends Map<number, any>>(
  list: L,
  comparator: (value: MapValueType<L>, index: number) => number,
): [undefined | MapValueType<L>, number] => {
  let start = 0;
  let end = list.size - 1;

  while (start <= end) {
    const middleIndex = Math.floor((start + end) / 2);
    const position = comparator(list.get(middleIndex), middleIndex);

    // Found!!!
    if (position === 0) {
      return [list.get(middleIndex) as MapValueType<L>, middleIndex];
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
