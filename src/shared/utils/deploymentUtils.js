const stableStringify = require("json-stable-stringify");

// 5AKT aka 5000000uakt
export const defaultInitialDeposit = 5000000;

class CustomValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "CustomValidationError";
  }
}

const specSuffixes = {
  Ki: 1024,
  Mi: 1024 * 1024,
  Gi: 1024 * 1024 * 1024,
  Ti: 1024 * 1024 * 1024 * 1024,
  Pi: 1024 * 1024 * 1024 * 1024 * 1024,
  Ei: 1024 * 1024 * 1024 * 1024 * 1024 * 1024,
  K: 1000,
  M: 1000 * 1000,
  G: 1000 * 1000 * 1000,
  T: 1000 * 1000 * 1000 * 1000,
  P: 1000 * 1000 * 1000 * 1000 * 1000,
  E: 1000 * 1000 * 1000 * 1000 * 1000 * 1000
};

const defaultHTTPOptions = {
  MaxBodySize: 2097152,
  ReadTimeout: 60000,
  SendTimeout: 60000,
  NextTries: 3,
  NextTimeout: 0,
  NextCases: ["off"]
};

// const validationConfig = {
//   maxUnitCPU: 10 * 1000, // 10 CPUs
//   maxUnitMemory: 16 * specSuffixes.Gi, // 16 Gi
//   maxUnitStorage: specSuffixes.Ti, // 1 Ti
//   maxUnitCount: 50,
//   maxUnitPrice: 10000000, // 10akt

//   minUnitCPU: 10,
//   minUnitMemory: specSuffixes.Mi,
//   minUnitStorage: 5 * specSuffixes.Mi,
//   minUnitCount: 1,
//   minUnitPrice: 1,

//   maxGroupCount: 20,
//   maxGroupUnits: 20,

//   maxGroupCPU: 20 * 1000,
//   maxGroupMemory: 32 * specSuffixes.Gi,
//   maxGroupStorage: specSuffixes.Ti
// };

async function getCurrentHeight(apiEndpoint) {
  const response = await fetch(apiEndpoint + "/blocks/latest");
  const data = await response.json();

  const height = parseInt(data.block.header.height);
  return height;
}

function ParseServiceProtocol(input) {
  let result;

  // This is not a case sensitive parse, so make all input
  // uppercase
  if (input) {
    input = input.toUpperCase();
  }

  switch (input) {
    case "TCP":
    case "":
    case undefined: // The empty string (no input) implies TCP
      result = "TCP";
      break;
    case "UDP":
      result = "UDP";
      break;
    default:
      throw new Error("ErrUnsupportedServiceProtocol");
  }

  return result;
}

function parseSizeStr(str) {
  try {
    const suffix = Object.keys(specSuffixes).find((s) => str.toString().toLowerCase().endsWith(s.toLowerCase()));

    if (suffix) {
      const suffixPos = str.length - suffix.length;
      const numberStr = str.substring(0, suffixPos);
      return (parseFloat(numberStr) * specSuffixes[suffix]).toString();
    } else {
      return parseFloat(str);
    }
  } catch (err) {
    console.error(err);
    throw new Error("Error while parsing size: " + str);
  }
}

// Port of: func (sdl *v2ComputeResources) toResourceUnits() types.ResourceUnits
function toResourceUnits(computeResources) {
  if (!computeResources) return {};

  let units = {};
  if (computeResources.cpu) {
    units.cpu = {
      units: { val: (computeResources.cpu.units * 1000).toString() }
      //attributes: computeResources.cpu.attributes TODO
    };
  }
  if (computeResources.memory) {
    units.memory = {
      quantity: { val: parseSizeStr(computeResources.memory.size) }
      //attributes: computeResources.memory.attributes TODO
    };
  }
  if (computeResources.storage) {
    units.storage = {
      quantity: { val: parseSizeStr(computeResources.storage.size) }
      //attributes: computeResources.storage.attributes TODO
    };
  }

  units.endpoints = null;

  return units;
}

// Port of:    func (sdl *v2) Manifest() (manifest.Manifest, error
export function Manifest(yamlJson) {
  let groups = {};

  Object.keys(yamlJson.services).forEach((svcName) => {
    const svc = yamlJson.services[svcName];
    const depl = yamlJson.deployment[svcName];

    Object.keys(depl).forEach((placementName) => {
      const svcdepl = depl[placementName];
      let group = groups[placementName];

      if (!group) {
        group = {
          Name: placementName,
          Services: []
        };
        groups[placementName] = group;
      }

      const compute = yamlJson.profiles.compute[svcdepl.profile];

      const msvc = {
        Name: svcName,
        Image: svc.image,
        Command: null,
        Args: svc.args || null,
        Env: svc.env || null,
        Resources: toResourceUnits(compute.resources),
        Count: svcdepl.count,
        Expose: []
      };

      svc.expose?.forEach((expose) => {
        const proto = ParseServiceProtocol(expose.proto);

        if (expose.to && expose.to.length > 0) {
          expose.to.forEach((to) => {
            msvc.Expose.push({
              Port: expose.port,
              ExternalPort: expose.as || 0,
              Proto: proto,
              Service: to.service || "",
              Global: !!to.global,
              Hosts: expose.accept || null,
              HTTPOptions: getHttpOptions(expose["http_options"])
            });
          });
        } else {
          msvc.Expose.push({
            Port: expose.port,
            ExternalPort: expose.as || 0,
            Proto: proto,
            Service: "",
            Global: false,
            Hosts: expose.accept?.items || null,
            HTTPOptions: getHttpOptions(expose["http_options"])
          });
        }
      });

      msvc.Expose = msvc.Expose.sort((a, b) => {
        if (a.Service !== b.Service) {
          return a.Service < b.Service;
        }
        if (a.Port !== b.Port) {
          return a.Port < b.Port;
        }
        if (a.Proto !== b.Proto) {
          return a.Proto < b.Proto;
        }
        if (a.Global !== b.Global) {
          return a.Global < b.Global;
        }
        return false;
      });

      group.Services.push(msvc);
    });
  });

  let names = Object.keys(groups);
  names = names.sort((a, b) => a < b);

  let result = names.map((name) => groups[name]);
  return result;
}

function shouldBeIngress(expose) {
  return expose.proto === "TCP" && expose.global && 80 === exposeExternalPort(expose);
}

function exposeExternalPort(expose) {
  if (expose.externalPort === 0) {
    return expose.port;
  }

  return expose.externalPort;
}

function getHttpOptions(options = {}) {
  return {
    MaxBodySize: options["max_body_size"] || defaultHTTPOptions.MaxBodySize,
    ReadTimeout: options["read_timeout"] || defaultHTTPOptions.ReadTimeout,
    SendTimeout: options["send_timeout"] || defaultHTTPOptions.SendTimeout,
    NextTries: options["next_tries"] || defaultHTTPOptions.NextTries,
    NextTimeout: options["next_timeout"] || defaultHTTPOptions.NextTimeout,
    NextCases: options["next_cases"] || defaultHTTPOptions.NextCases
  };
}

function DeploymentGroups(yamlJson) {
  let groups = {};

  Object.keys(yamlJson.services).forEach((svcName) => {
    const svc = yamlJson.services[svcName];
    const depl = yamlJson.deployment[svcName];

    if (!depl) {
      throw new CustomValidationError(`Service "${svcName}" is not defined in the "deployment" section.`);
    }

    Object.keys(depl).forEach((placementName) => {
      const svcdepl = depl[placementName];
      const compute = yamlJson.profiles.compute[svcdepl.profile];
      const infra = yamlJson.profiles.placement[placementName];

      if (!infra) {
        throw new CustomValidationError(`The placement "${placementName}" is not defined in the "placement" section.`);
      }

      const price = infra.pricing[svcdepl.profile];

      if (!price) {
        throw new CustomValidationError(`The pricing for the "${svcdepl.profile}" profile is not defined in the "${placementName}" placement definition.`);
      }

      if (!compute) {
        throw new CustomValidationError(`The compute requirements for the "${svcdepl.profile}" profile are not defined in the "compute" section.`);
      }

      price.amount = price.amount.toString(); // Interpreted as number otherwise

      let group = groups[placementName];

      if (!group) {
        group = {
          name: placementName,
          requirements: {
            attributes: infra.attributes && Object.keys(infra.attributes).map((key) => ({ key: key, value: infra.attributes[key] })),
            signed_by: {
              all_of: infra.signedBy?.allOf,
              any_of: infra.signedBy?.anyOf
            }
          },
          resources: []
        };

        if (group.requirements.attributes) {
          group.requirements.attributes = group.requirements.attributes.sort((a, b) => a.key < b.key);
        }

        groups[group.name] = group;
      }

      const resources = {
        resources: toResourceUnits(compute.resources), // Chanded resources => unit
        price: price,
        count: svcdepl.count
      };

      let endpoints = [];
      svc?.expose?.forEach((expose) => {
        expose?.to?.forEach((to) => {
          if (to.global) {
            const proto = ParseServiceProtocol(expose.proto);

            const v = {
              port: expose.port,
              externalPort: expose.as || 0,
              proto: proto,
              service: to.service || null,
              global: !!to.global,
              hosts: expose.accept || null,
              HTTPOptions: getHttpOptions(expose["http_options"])
            };

            // TODO Enum
            const Endpoint_SHARED_HTTP = 0;
            const Endpoint_RANDOM_PORT = 1;

            let kind = Endpoint_RANDOM_PORT;

            if (shouldBeIngress(v)) {
              kind = Endpoint_SHARED_HTTP;
            }

            endpoints.push({ kind: kind });
          }
        });
      });

      resources.resources.endpoints = endpoints;
      group.resources.push(resources);
    });
  });

  let names = Object.keys(groups);
  names = names.sort((a, b) => a < b);

  let result = names.map((name) => groups[name]);
  return result;
}

// https://github.com/cosmos/cosmos-sdk/blob/9fd866e3820b3510010ae172b682d71594cd8c14/types/utils.go#L29
export function SortJSON(jsonStr) {
  return stableStringify(JSON.parse(jsonStr));
}

function _arrayBufferToBase64(buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// https://github.com/ovrclk/akash/blob/04e7a7667dd94b5a15fa039e4f7df5c9ad93be4f/sdl/sdl.go#L120
async function ManifestVersion(manifest) {
  var enc = new TextEncoder();
  let m = JSON.stringify(manifest, (key, value) => {
    if (key === "storage" || key === "memory") {
      let newValue = { ...value };
      newValue.size = newValue.quantity;
      delete newValue.quantity;
      return newValue;
    }
    return value;
  });
  //console.log(SortJSON(m));
  let sortedBytes = enc.encode(SortJSON(m));

  let sum = await crypto.subtle.digest("SHA-256", sortedBytes);

  let base64 = _arrayBufferToBase64(sum);

  return base64;
}

function DepositFromFlags(deposit) {
  return {
    denom: "uakt",
    amount: deposit.toString()
  };
}

export async function NewDeploymentData(apiEndpoint, yamlJson, dseq, fromAddress, deposit = defaultInitialDeposit) {
  const groups = DeploymentGroups(yamlJson);
  const mani = Manifest(yamlJson);
  const ver = await ManifestVersion(mani);
  const id = {
    owner: fromAddress,
    dseq: dseq
  };
  const _deposit = DepositFromFlags(deposit);

  if (!id.dseq) {
    id.dseq = await getCurrentHeight(apiEndpoint);
  }

  return {
    sdl: yamlJson,
    manifest: mani,
    groups: groups,
    deploymentId: id,
    orderId: [],
    leaseId: [],
    version: ver,
    deposit: _deposit
  };
}

export async function sendManifestToProvider(providerInfo, manifest, dseq, localCert) {
  console.log("Sending manifest to " + providerInfo.owner);

  const jsonStr = JSON.stringify(manifest, (key, value) => {
    if (key === "storage" || key === "memory") {
      let newValue = { ...value };
      newValue.size = newValue.quantity;
      delete newValue.quantity;
      return newValue;
    }
    return value;
  });

  // Waiting for 5 sec for provider to have lease
  await wait(5000);

  let response;

  for (let i = 1; i <= 3; i++) {
    console.log("Try #" + i);
    try {
      if (!response) {
        response = await window.electron.queryProvider(
          providerInfo.host_uri + "/deployment/" + dseq + "/manifest",
          "PUT",
          jsonStr,
          localCert.certPem,
          localCert.keyPem
        );

        i = 3;
      }
    } catch (err) {
      if (err.includes && err.includes("no lease for deployment") && i < 3) {
        console.log("Lease not found, retrying...");
        await wait(6000); // Waiting for 6 sec
      } else {
        throw err;
      }
    }
  }

  return response;
}

async function wait(time) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, time);
  });
}
