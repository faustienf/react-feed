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
  setStartIndex: (nextStartIndex: number) => void;
  offsets: Map<number, number>;
  setOffset: (height: number, index: number) => void; 
}

const defaultValue: Context = {
  startIndex: 0,
  setStartIndex: () => {},
  offsets: new Map<number, number>(),
  setOffset: () => {},
};

export const feedContext = createContext(defaultValue);

export const FeedProvider: FC<PropsWithChildren<{}>> = ({children}) => {
  const [startIndex, setStartIndex] = useState(0);
  const offsetsRef = useRef(new Map<number, number>());
  const offsets = offsetsRef.current;

  const setOffset = useCallback(
    (height: number, index: number) => {
      const prevOffset = offsets.get(index - 1) || 0;
      const currentOffset = offsets.get(index) || 0;
      const newCurrentOffset = index 
        ? height + prevOffset
        : height;

      offsets.set(index, newCurrentOffset);

      // redefine offsets by diff
      const diff = newCurrentOffset - currentOffset;
      if (diff > 0) {
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

  const context: Context = useMemo(
    () => ({
      startIndex,
      setStartIndex,
      offsets,
      setOffset,
    }),
    [offsets, setOffset, startIndex],
  )

  return (
    <feedContext.Provider value={context}>
      {children}
    </feedContext.Provider>
  );
};
