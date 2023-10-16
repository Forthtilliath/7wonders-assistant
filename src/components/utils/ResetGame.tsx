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
