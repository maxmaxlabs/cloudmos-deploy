import { useQuery } from "react-query";
import { QueryKeys } from "./queryKeys";
import axios from "axios";
import { ApiUrlService } from "../shared/utils/apiUtils";
import { deploymentToDto } from "../shared/utils/deploymentDetailUtils";
import { useSettings } from "../context/SettingsProvider";

async function getDeploymentList(apiEndpoint, address) {
  if (!address) throw new Error("address must be defined.");

  const response = await axios.get(ApiUrlService.deploymentList(apiEndpoint, address));
  let deployments = response.data;

  return deployments.deployments.map((d) => deploymentToDto(d));
}

export function useDeploymentList(address, options) {
  const { settings } = useSettings();
  return useQuery(QueryKeys.getDeploymentListKey(address), () => getDeploymentList(settings.apiEndpoint, address), options);
}
