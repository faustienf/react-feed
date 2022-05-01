export const binarySearch = <V extends any>(
  array: V[],
  comparator: (value: V, index: number) => number,
): [undefined | V, number] => {
  let start = 0;
  let end = array.length - 1;

  while (start <= end) {
    const middleIndex = Math.floor((start + end) / 2);
    const position = comparator(array[middleIndex], middleIndex);

    // found!!!
    if (position === 0) {
      return [array[middleIndex], middleIndex];
    // move right
    } else if (position > 0) {
      start = middleIndex + 1;
    // move left
    } else {
      end = middleIndex - 1;
    }
  }

  return [undefined, -1];
};
