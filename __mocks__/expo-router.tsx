import React from 'react';

export const router = {
  push: (_href: string) => {},
  replace: (_href: string) => {},
  back: () => {},
};

export const useLocalSearchParams = <T extends Record<string, string>>(): T =>
  ({ id: '1' }) as unknown as T;

/** Immediately invokes the callback so focus-triggered loads work in stories. */
export const useFocusEffect = (cb: () => void | (() => void)) => {
  React.useEffect(cb, []);
};

export const Link = ({ children }: { children: React.ReactNode }) =>
  React.createElement(React.Fragment, null, children);
