import { useQuery } from "react-query";
import { QueryKeys } from "./queryKeys";
import axios from "axios";
import { ApiUrlService, loadWithPagination } from "../shared/utils/apiUtils";
import { useSettings } from "../context/SettingsProvider";
import { providerStatusToDto, getNetworkCapacityDto } from "../shared/utils/providerUtils";

async function getProviders(apiEndpoint) {
  const providers = await loadWithPagination(ApiUrlService.providers(apiEndpoint), "providers", 1000);

  return providers;
}

export function useProviders(options) {
  const { settings } = useSettings();
  return useQuery(QueryKeys.getProvidersKey(), () => getProviders(settings.apiEndpoint), {
    ...options,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });
}

async function getProviderStatus(providerUri) {
  const response = await window.electron.queryProvider(`${providerUri}/status`, "GET");
  const res = providerStatusToDto(response);

  console.log(res);
  return res;
}

export function useProviderStatus(providerUri, options) {
  return useQuery(QueryKeys.getProviderStatusKey(providerUri), () => getProviderStatus(providerUri), options);
}

async function getNetworkCapacity() {
  const response = await axios.get(ApiUrlService.networkCapacity());
  return getNetworkCapacityDto(response.data);
}

export function useNetworkCapacity(options) {
  return useQuery(QueryKeys.getNetworkCapacity(), () => getNetworkCapacity(), options);
}
