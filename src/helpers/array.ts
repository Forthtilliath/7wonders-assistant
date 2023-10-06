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

export const getLabelAndPrevious = (
  pathname: string,
  routes: Route[]
): { label: string | undefined; previous: boolean | undefined } => {
  let label: string | undefined;
  let previous: boolean | undefined;

  const findLabelAndPrevious = (routes: Route[]): void => {
    for (const route of routes) {
      if (route.path === pathname) {
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
