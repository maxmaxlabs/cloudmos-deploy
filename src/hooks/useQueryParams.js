import { useLocation } from "react-router-dom";

export function useQueryParams() {
  const location = useLocation();
  console.log(location.search);
  return new URLSearchParams(location.search);
}
