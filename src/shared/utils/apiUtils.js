import { networkVersion, cloudmosApi } from "../constants";
import axios from "axios";

export class ApiUrlService {
  static deploymentList(apiEndpoint, address) {
    return `${apiEndpoint}/akash/deployment/${networkVersion}/deployments/list?filters.owner=${address}`;
  }
  static deploymentDetail(apiEndpoint, address, dseq) {
    return `${apiEndpoint}/akash/deployment/${networkVersion}/deployments/info?id.owner=${address}&id.dseq=${dseq}`;
  }
  static bidList(apiEndpoint, address, dseq) {
    return `${apiEndpoint}/akash/market/${networkVersion}/bids/list?filters.owner=${address}&filters.dseq=${dseq}`;
  }
  static leaseList(apiEndpoint, address, dseq) {
    return `${apiEndpoint}/akash/market/${networkVersion}/leases/list?filters.owner=${address}${dseq ? "&filters.dseq=" + dseq : ""}`;
  }
  static providers(apiEndpoint) {
    return `${apiEndpoint}/akash/provider/${networkVersion}/providers`;
  }
  static providerDetail(apiEndpoint, owner) {
    return `${apiEndpoint}/akash/provider/${networkVersion}/providers/${owner}`;
  }
  static block(apiEndpoint, id) {
    return `${apiEndpoint}/blocks/${id}`;
  }
  static balance(apiEndpoint, address) {
    return `${apiEndpoint}/cosmos/bank/v1beta1/balances/${address}`;
  }
  static rewards(apiEndpoint, address) {
    return `${apiEndpoint}/cosmos/distribution/v1beta1/delegators/${address}/rewards`;
  }
  static redelegations(apiEndpoint, address) {
    return `${apiEndpoint}/cosmos/staking/v1beta1/delegators/${address}/redelegations`;
  }
  static delegations(apiEndpoint, address) {
    return `${apiEndpoint}/cosmos/staking/v1beta1/delegations/${address}`;
  }
  static unbonding(apiEndpoint, address) {
    return `${apiEndpoint}/cosmos/staking/v1beta1/delegators/${address}/unbonding_delegations`;
  }
  static networkCapacity() {
    return `${cloudmosApi}/getNetworkCapacity`;
  }
}

export async function loadWithPagination(baseUrl, dataKey, limit) {
  let items = [];
  let nextKey = null;
  // let callCount = 1;
  // let totalCount = null;

  do {
    const _hasQueryParam = hasQueryParam(baseUrl);
    let queryUrl = `${baseUrl}${_hasQueryParam ? "&" : "?"}pagination.limit=${limit}&pagination.count_total=true`;
    if (nextKey) {
      queryUrl += "&pagination.key=" + encodeURIComponent(nextKey);
    }
    // console.log(`Querying ${dataKey} [${callCount}] from : ${queryUrl}`);
    const response = await axios.get(queryUrl);
    const data = response.data;

    // if (!nextKey) {
    //   totalCount = data.pagination.total;
    // }

    items = items.concat(data[dataKey]);
    nextKey = data.pagination.next_key;
    // callCount++;

    // console.log(`Got ${items.length} of ${totalCount}`);
  } while (nextKey);

  return items.filter((item) => item);
}

function hasQueryParam(url) {
  return /[?&]/gm.test(url);
}
