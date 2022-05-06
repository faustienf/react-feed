import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

type Context = {
  startIndex: number,
  changeStartIndex: (nextStartIndex: number) => void;
  offsets: Map<number, number>;
  changeOffset: (index: number, height: number) => void; 
  getLastOffset: () => number;
  getPrevOffset: () => number;
}

const defaultValue: Context = {
  startIndex: 0,
  changeStartIndex: () => {},
  offsets: new Map<number, number>(),
  changeOffset: () => {},
  getLastOffset: () => 0,
  getPrevOffset: () => 0,
};

export const feedContext = createContext(defaultValue);

export const FeedProvider: FC<PropsWithChildren<{}>> = ({children}) => {
  const [startIndex, changeStartIndex] = useState(0);
  const startIndexRef = useRef(startIndex);
  startIndexRef.current = startIndex;
  
  const offsetsRef = useRef(new Map<number, number>());
  const offsets = offsetsRef.current;

  const changeOffset = useCallback(
    (index: number, height: number) => {
      const prevOffset = offsets.get(index - 1) || 0;
      const currentOffset = offsets.get(index) || 0;
      const newCurrentOffset = index 
        ? height + prevOffset
        : height;

      offsets.set(index, newCurrentOffset);

      // redefine offsets by diff
      const diff = newCurrentOffset - currentOffset;
      if (diff !== 0) {
        for (
          let nextIndex = index + 1;
          nextIndex < offsets.size;
          ++nextIndex
        ) {
          const nextOffset = offsets.get(nextIndex) || 0;
          offsets.set(nextIndex, nextOffset + diff)
        }
      }
    },
    [offsets],
  );

  const getLastOffset = useCallback(
    () => offsets.get(offsets.size - 1) || 0,
    [offsets],
  );

  const getPrevOffset = useCallback(
    () => offsets.get(startIndexRef.current - 1) || 0,
    [offsets],
  );

  const context: Context = useMemo(
    () => ({
      startIndex,
      changeStartIndex,
      offsets,
      changeOffset,
      getLastOffset,
      getPrevOffset,
    }),
    [
      changeStartIndex,
      getLastOffset,
      getPrevOffset,
      offsets,
      changeOffset,
      startIndex
    ],
  );

  return (
    <feedContext.Provider value={context}>
      {children}
    </feedContext.Provider>
  );
};
