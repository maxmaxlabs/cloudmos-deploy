import { gt, neq } from "semver";
import { mainnetId, testnetId, edgenetId } from "../constants";
import { networks } from "../networks";

const migrations = {
  // Migrate local storage keys to have prefixed account
  "0.14.0": () => {
    const ignoredKeys = ["ga_user_id", "isBetaBannerSeen", "latestUpdatedVersion", `${mainnetId}/wallets`, `${testnetId}/wallets`, `${edgenetId}/wallets`];
    const updatedStorage = {};

    function getWalletAddress(networkId) {
      return Object.keys(localStorage)
        .filter((key) => key.startsWith(networkId) && key.endsWith(".wallet"))
        .map((key) => key.replace(".wallet", "").replace(`${networkId}/`, ""))[0];
    }

    function migrateKeyToAddress(key, address) {
      let newKey;
      if ((key.startsWith(mainnetId) || key.startsWith(testnetId) || key.startsWith(edgenetId)) && address) {
        const keyArray = key.split("/");
        keyArray.splice(1, 0, address);

        newKey = keyArray.join("/");
      }

      return newKey;
    }

    networks.forEach((network) => {
      const walletAddress = getWalletAddress(network.id);

      if (walletAddress) {
        const _walletKey = `${network.id}/${walletAddress}.wallet`;
        const _certKey = `${network.id}/${walletAddress}.crt`;
        const _certKeyKey = `${network.id}/${walletAddress}.key`;
        const wallet = JSON.parse(localStorage.getItem(_walletKey));
        const cert = localStorage.getItem(_certKey);
        const certKey = localStorage.getItem(_certKeyKey);

        const newWallet = {
          ...wallet,
          selected: true
        };

        if (cert && certKey) {
          newWallet["cert"] = cert;
          newWallet["certKey"] = certKey;
        }

        // Set the wallets array for current network
        localStorage.setItem(`${network.id}/wallets`, JSON.stringify([newWallet]));

        // Clean up
        localStorage.removeItem(_certKey);
        localStorage.removeItem(_certKeyKey);
        localStorage.removeItem(_walletKey);
      }

      Object.keys(localStorage)
        .filter((x) => x.startsWith(network.id))
        .forEach((key) => {
          if (!ignoredKeys.includes(key)) {
            const newKey = migrateKeyToAddress(key, walletAddress);
            if (newKey) {
              updatedStorage[newKey] = localStorage.getItem(key);
              // Update the localStorage with  the new keys prefixed with network id
              localStorage.setItem(newKey, localStorage.getItem(key));

              // Clean up the localStorage for unused keys
              localStorage.removeItem(key);
            }
          } else {
            updatedStorage[key] = localStorage.getItem(key);
          }
        });
    });

    // notify local storage hooks to update their values
    window.dispatchEvent(new Event("local-storage"));

    console.log(`Migration for version 0.14.0:`, updatedStorage);
  },
  // Migrate local storage keys to have prefixed network id
  "0.6.0": () => {
    const ignoredKeys = ["ga_user_id", "isBetaBannerSeen", "latestUpdatedVersion"];
    const updatedStorage = {};

    Object.keys(localStorage).forEach((key) => {
      if (!ignoredKeys.includes(key)) {
        const newKey = `${mainnetId}/${key}`;
        updatedStorage[newKey] = localStorage.getItem(key);
        // Update the localStorage with  the new keys prefixed with network id
        localStorage.setItem(newKey, localStorage.getItem(key));
        localStorage.removeItem(key);
      } else {
        updatedStorage[key] = localStorage.getItem(key);
      }
    });

    localStorage.setItem("selectedNetworkId", mainnetId);

    // notify local storage hooks to update their values
    window.dispatchEvent(new Event("local-storage"));

    console.log(`Migration for version 0.6.0:`, updatedStorage);
  }
};

// Store latestUpdatedVersion in localStorage
// Check if latestUpdatedVersion is < currentVersion
// If so run all the version > until current is reached.
export const migrateLocalStorage = () => {
  const currentVersion = window.electron.getAppVersion();
  let latestUpdatedVersion = localStorage.getItem("latestUpdatedVersion");

  if (!latestUpdatedVersion) {
    // It's an upgrade from an old version
    if (Object.keys(localStorage).some((key) => key.endsWith(".data") || key.endsWith(".wallet"))) {
      latestUpdatedVersion = "0.5.0";
    } else {
      // It's a brand new installation
      latestUpdatedVersion = currentVersion;
      localStorage.setItem("selectedNetworkId", mainnetId);
    }
  }

  // Only apply migrations if there was a previous version
  if (latestUpdatedVersion && neq(currentVersion, latestUpdatedVersion)) {
    Object.keys(migrations).forEach((version) => {
      if (gt(version, latestUpdatedVersion)) {
        try {
          console.log(`Applying version ${version}`);
          // Execute local storage migration
          migrations[version]();
        } catch (error) {
          console.log(error);
        }
      }
    });
  }

  // Update the latestUpdatedVersion
  localStorage.setItem("latestUpdatedVersion", currentVersion);
};
