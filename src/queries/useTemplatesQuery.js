import { useQuery } from "react-query";
import { QueryKeys } from "./queryKeys";
import axios from "axios";
import { cloudmosApi } from "../shared/constants";

async function getTemplates() {
  const response = await axios.get(`${cloudmosApi}/templates`);
  let categories = response.data.filter((x) => (x.templates || []).length > 0);
  categories.forEach((c) => {
    c.templates.forEach((t) => (t.category = c.title));
  });
  const templates = categories.flatMap((x) => x.templates);

  return { categories, templates };
}

export function useTemplates(options) {
  return useQuery(QueryKeys.getTemplatesKey(), () => getTemplates(), {
    ...options,
    refetchInterval: 60000 * 2, // Refetch templates every 2 minutes
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });
}
