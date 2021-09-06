import { useQuery } from "react-query";
import { QueryKeys } from "./queryKeys";
import axios from "axios";
import { ApiUrlService } from "../shared/utils/apiUtils";
import { useSettings } from "../context/SettingsProvider";

// Block
async function getBlock(apiEndpoint, id) {
  const response = await axios.get(ApiUrlService.block(apiEndpoint, id));

  return response.data;
}

export function useBlock(id, options) {
  const { settings } = useSettings();
  return useQuery(QueryKeys.getBlockKey(id), () => getBlock(settings.apiEndpoint, id), options);
}
