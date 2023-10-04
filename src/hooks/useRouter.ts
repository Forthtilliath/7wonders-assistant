import { useMemo } from 'react';
import {
  matchRoutes,
  RouteObject,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

import queryString from 'query-string';

export const useRouter = (routes: RouteObject[]) => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [{ route }] = matchRoutes(routes, location) ?? [
    { route: { path: null } },
  ];

  return useMemo(() => {
    return {
      pathname: location.pathname,
      path: route.path,
      query: {
        ...queryString.parse(location.search), // Convert string to object
        ...params,
      },
      location,
      navigate,
    };
  }, [params, location, navigate, route.path]);
};
