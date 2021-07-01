import Analytics from "electron-google-analytics";
const { nanoid } = require("nanoid");

export const HOSTNAME = "https://deploy.akashlytics.com";
const LOCAL_STORAGE_USERID_KEY = "ga_user_id";

export let analytics;

export function initAnalytics() {
  analytics = new Analytics("UA-196085161-1");

  let userId = localStorage.getItem(LOCAL_STORAGE_USERID_KEY);

  if (!userId) {
    userId = nanoid();
    localStorage.setItem(LOCAL_STORAGE_USERID_KEY, userId);
  }

  analytics.set("uid", userId);
  analytics.set("userId", userId);
}
