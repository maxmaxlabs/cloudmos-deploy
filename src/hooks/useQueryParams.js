import { useLocation } from "react-router-dom";

export function useQueryParams() {
  const location = useLocation();
  return new URLSearchParams(location.search);
}
