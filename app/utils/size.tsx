import {
  useState,
  useEffect,
  useRef,
  Ref,
  useCallback,
  useLayoutEffect,
} from 'react';
import createDetectElementResize from '../vendor/detectElementResize';

export interface Size {
  width: number;
  height: number;
}

export type RefHandler = (r: any) => void;

export function useDebounce<T = {}>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDelayedSize(delay: number): [Size, RefHandler] {
  const [size, ref] = useSize();
  const delayedSize = useDebounce(size, delay);
  return [delayedSize, ref];
}

export function useSize<T extends Element>(
  avoidInitialization?: boolean,
  padding?: number
): [Size, RefHandler] {
  const ref = useRef<T>();
  const initialValue =
    avoidInitialization === true
      ? { width: 0, height: 0 }
      : { width: window.innerWidth, height: window.innerHeight };
  const [size, setSize] = useState<Size>(initialValue);
  const [intialized, setInitialized] = useState(false);

  const handleChange = useCallback(() => {
    if (ref.current != null) {
      const nextSize = {
        width: ref.current.clientWidth - (padding ?? 0),
        height: ref.current.clientHeight - (padding ?? 0),
      };
      setSize(nextSize);
    }
  }, [setSize, ref]);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }

    const detector = createDetectElementResize();
    const { parentNode } = ref.current;

    detector.addResizeListener(parentNode, handleChange);
    handleChange();
    return () => detector.removeResizeListener(parentNode, handleChange);
  }, [ref.current]);

  return [
    size,
    (r: any) => {
      ref.current = r;
      if (!intialized) {
        setInitialized(true);
      }
    },
  ];
}

export function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState({
    width: 1,
    height: 1,
  });
  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    // Add event listener
    window.addEventListener('resize', handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount
  return windowSize;
}
