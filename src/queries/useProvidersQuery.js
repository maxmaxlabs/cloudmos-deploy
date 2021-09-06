import { useQuery } from "react-query";
import { QueryKeys } from "./queryKeys";
import axios from "axios";
import { ApiUrlService } from "../shared/utils/apiUtils";
import { useSettings } from "../context/SettingsProvider";

async function getProviders(apiEndpoint) {
  const response = await axios.get(ApiUrlService.providers(apiEndpoint));

  return response.data.providers;
}

export function useProviders(options) {
  const { settings } = useSettings();
  return useQuery(QueryKeys.getProvidersKey(), () => getProviders(settings.apiEndpoint), options);
}
