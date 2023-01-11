<div align="left">
  
  <a href="https://aimeos.org/">
    <img src="./public/icons/android-chrome-192x192.png" alt="Cloudmos Deploy logo" title="Cloudmos Deploy" align="left" height="40" />
</a>
  
  # Cloudmos Deploy
 
**Cloudmos Deploy** is an app that let's you deploy any [docker container](https://www.docker.com/) on the [Akash Network](https://akash.network) in a few clicks... 🛠
  
![version](https://img.shields.io/github/stars/maxmaxlabs/cloudmos-deploy)
![license](https://img.shields.io/github/license/maxmaxlabs/cloudmos-deploy)
[![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/bukotsunikki.svg?style=social&label=Follow%20%cloudmosio)](https://twitter.com/cloudmosio)
[![https://discord.gg/gc2VqQ9BTG](https://img.shields.io/badge/discord-join-7289DA.svg?logo=discord&longCache=true&style=flat)](https://discord.gg/gc2VqQ9BTG)
  
</div>

##  Installation:

The latest version of the tool can be downloaded from the Cloudmos website:
https://cloudmos.io/cloud-deploy or from the [release page.](https://github.com/maxmaxlabs/cloudmos-deploy/releases)

### Linux

For some distributions you might have to disable the gpu sandbox to make it work, like so:

`./Cloudmos-Deploy-0.17.2.AppImage --disable-gpu-sandbox`

### Running locally:

Running with npm

```
npm install
# Start the react app
npm start
# Start the electron app
npm run electron-dev
```

## Features

- ✔ Cross-platform (Windows, MacOS, Linux)
- 🔎 Akash Provider Search and Network Statistics
- ⚙️ 100+ Application [Template gallery](https://github.com/ovrclk/awesome-akash)
- 🚀 Deployment Manager : Create/Update/Manage deployments
- 📄 Real-time log and events viewer
- 🏦 Wallet Manager : Send/Receive Transactions and Create/Import/Export your wallet 
- 🔐 Secure : Your private key and certificate never leave your computer
- 🛠 More to come...

## Add new applications to the Template gallery

Want to see your application in Cloudmos Deploy?  Create a pull request on the [awesome-akash](https://github.com/ovrclk/awesome-akash) repository.  Once the pull requested is accepted on the main branch the new application will appear in Cloudmos Deploy > Templates.

## Support us! 
- `akash13265twfqejnma6cc93rw5dxk4cldyz2zyy8cdm`
- Delegate to our [Akash validator node](https://cloudmos.io/validators/akashvaloper14mt78hz73d9tdwpdvkd59ne9509kxw8yj7qy8f)

## Useful links

- [Website](https://cloudmos.io/cloud-deploy)
- [Youtube Channel (with tutorials)](https://www.youtube.com/channel/UC1rgl1y8mtcQoa9R_RWO0UA)
- [Discord](https://discord.gg/dsGZzUR4yb)
- [Twitter](https://twitter.com/cloudmosio)

## Disclaimer

- Cloudmos Deploy is currently in BETA. We strongly suggest you start with a new wallet and a small amount of AKT until we further stabilize the product.
- We're not responsible for any loss or damages related to using the app.
- The app has a high chance of containing bugs since it's in BETA, use at your own risk.
- [Only x86_64 processors are officially supported for Akash implementations.](https://docs.akash.network/guides/deploy/cloudmos-deploy-installation#cpu-support) But if the docker image is built [setting the target platform to linux/amd64](https://stackoverflow.com/a/69119815/8215759) it [is possible that it will work from others processors](https://github.com/ovrclk/docs/pull/239).


