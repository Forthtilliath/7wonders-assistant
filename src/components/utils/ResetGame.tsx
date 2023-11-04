import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useGameStore } from '@lib';
import { ROUTES } from '@constants';

function getScoresPaths(routes: Route[]) {
  let paths = new Set('/');

  for (const route of routes) {
    if (route.path.startsWith('/scores/')) {
      paths.add(route.path);
    }

    if (route.children) {
      paths = new Set([...paths, ...getScoresPaths(route.children)]);
    }
  }

  return paths;
}

/**
 * Resets the game state when the current pathname changes.
 * If the previous pathname was a scores path and the current pathname is not a scores path,
 * it calls the `resetGame` function from the game store to reset the game state.
 */
export function ResetGame() {
  const resetGame = useGameStore((s) => s.resetGame);
  const { pathname } = useLocation();
  const routesGame = useMemo(() => getScoresPaths(ROUTES), []);
  const prevPathname = useRef('/');

  useEffect(() => {
    if (routesGame.has(prevPathname.current) && !routesGame.has(pathname)) {
      resetGame();
    }

    return () => {
      prevPathname.current = pathname;
    };
  }, [pathname, resetGame, routesGame]);

  return null;
}
