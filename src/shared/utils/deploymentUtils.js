export async function sendManifestToProvider(providerInfo, manifest, dseq, localCert) {
  console.log("Sending manifest to " + providerInfo?.owner);

  let jsonStr = JSON.stringify(manifest);
  jsonStr = jsonStr.replaceAll('"quantity":{"val', '"size":{"val');
  jsonStr = jsonStr.replaceAll('"mount":', '"readOnlyTmp":');
  jsonStr = jsonStr.replaceAll('"readOnly":', '"mount":');
  jsonStr = jsonStr.replaceAll('"readOnlyTmp":', '"readOnly":');

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

  // Waiting for 5 sec for provider to boot up workload
  await wait(5000);

  return response;
}

async function wait(time) {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res();
    }, time);
  });
}
