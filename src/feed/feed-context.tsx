import {
  createContext,
  FC,
  PropsWithChildren,
  useMemo,
  useRef,
  useState,
  MutableRefObject
} from "react";

type Context = {
  startIndex: number,
  setStartIndex: (nextStartIndex: number) => void;
  offsetsRef: MutableRefObject<number[]>;
}

const defaultValue: Context = {
  startIndex: 0,
  setStartIndex: () => {},
  offsetsRef: {current: []} as MutableRefObject<number[]>,
};

export const feedContext = createContext(defaultValue);

export const FeedProvider: FC<PropsWithChildren<{}>> = ({children}) => {
  const [startIndex, setStartIndex] = useState(0);
  const offsetsRef = useRef<number[]>([]);

  const context: Context = useMemo(
    () => ({
      startIndex,
      setStartIndex,
      offsetsRef,
    }),
    [startIndex],
  )

  return (
    <feedContext.Provider value={context}>
      {children}
    </feedContext.Provider>
  );
};
