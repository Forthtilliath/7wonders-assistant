import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useGameStore } from '@/lib';

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

  useEffect(() => {
    if (!routesGame.has(pathname)) resetGame();
  }, [pathname, resetGame, routesGame]);

  return null;
}
