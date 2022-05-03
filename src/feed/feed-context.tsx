import {
  createContext,
  FC,
  PropsWithChildren,
  useMemo,
  useRef,
  useState,
} from "react";

type Context = {
  startIndex: number,
  setStartIndex: (nextStartIndex: number) => void;
  offsets: Map<number, number>;
}

const defaultValue: Context = {
  startIndex: 0,
  setStartIndex: () => {},
  offsets: new Map<number, number>(),
};

export const feedContext = createContext(defaultValue);

export const FeedProvider: FC<PropsWithChildren<{}>> = ({children}) => {
  const [startIndex, setStartIndex] = useState(0);
  const offsetsRef = useRef(new Map<number, number>());

  const context: Context = useMemo(
    () => ({
      startIndex,
      setStartIndex,
      offsets: offsetsRef.current,
    }),
    [startIndex],
  )

  return (
    <feedContext.Provider value={context}>
      {children}
    </feedContext.Provider>
  );
};
