import { useQuery } from "react-query";
import { QueryKeys } from "./queryKeys";
import axios from "axios";
import { ApiUrlService, loadWithPagination } from "../shared/utils/apiUtils";
import { useSettings } from "../context/SettingsProvider";
import { providerStatusToDto, getNetworkCapacityDto } from "../shared/utils/providerUtils";
import { cloudmosApi } from "../shared/constants";

async function getProviderDetail(apiEndpoint, owner) {
  if (!owner) return {};

  const response = await axios.get(ApiUrlService.providerDetail(apiEndpoint, owner));

  return response.data;
}

export function useProviderDetail(owner, options) {
  const { settings } = useSettings();
  return useQuery(QueryKeys.getProviderDetailKey(owner), () => getProviderDetail(settings.apiEndpoint, owner), options);
}

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

async function getDataNodeProviders() {
  const response = await axios.get(`${cloudmosApi}/providers`);

  return response.data;
}

export function useDataNodeProviders(options) {
  return useQuery(QueryKeys.getDataNodeProvidersKey(), () => getDataNodeProviders(), {
    ...options,
    refetchInterval: 15000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: false
  });
}

async function getProviderStatus(providerUri) {
  const statusResponse = await window.electron.queryProvider(`${providerUri}/status`, "GET");
  let versionResponse = {};

  try {
    versionResponse = await window.electron.queryProvider(`${providerUri}/version`, "GET");
  } catch (error) {
    console.log(error);
  }

  const result = providerStatusToDto(statusResponse, versionResponse);

  return result;
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

async function getAuditors() {
  const response = await axios.get("https://raw.githubusercontent.com/maxmaxlabs/cloudmos-deploy/master/auditors.json");

  return response.data;
}

export function useAuditors(options) {
  return useQuery(QueryKeys.getAuditorsKey(), () => getAuditors(), {
    ...options,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false
  });
}
