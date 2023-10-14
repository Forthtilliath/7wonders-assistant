export const flattenRoutes = (routes: Route[]): MenuItem[] => {
  const flattenedRoutes: MenuItem[] = [];

  routes.forEach((route) => {
    if (route.icon && route.path && route.label) {
      flattenedRoutes.push({
        icon: route.icon,
        label: route.label,
        path: route.path,
      });
    }

    if (route.children) {
      const childrenRoutes = flattenRoutes(route.children);
      flattenedRoutes.push(...childrenRoutes);
    }
  });

  return flattenedRoutes;
};

type GetLabelAndPrevious = (
  pathname: string,
  routes: Route[]
) => { label?: string; previous?: boolean };

export const getLabelAndPrevious: GetLabelAndPrevious = (pathname, routes) => {
  let label: string | undefined;
  let previous: boolean | undefined;

  const findLabelAndPrevious = (routes: Route[]): void => {
    for (const route of routes) {
      // Échapper les caractères spéciaux de l'expression régulière
      const escapedPath = route.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      // Remplacer les paramètres par des groupes de capture
      const regexPath = escapedPath.replace(/:(\w+)/g, '([^/]+)');

      // Ajouter des ancres pour correspondre à l'URL complète
      const regex = new RegExp(`^${regexPath}$`);

      if (regex.test(pathname)) {
        label = route.label;
        previous = route.previous;
        break;
      }

      if (route.children) {
        findLabelAndPrevious(route.children);
      }
    }
  };

  findLabelAndPrevious(routes);

  return { label, previous };
};

export function sum(arr: number[]): number {
  return arr.reduce((total, n) => total + n, 0);
}

export function avg(arr: number[]): number {
  return sum(arr) / arr.length;
}
