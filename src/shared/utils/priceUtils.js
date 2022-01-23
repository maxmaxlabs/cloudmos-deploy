import add from "date-fns/add";
import { averageDaysInMonth } from "./date";

export const averageBlockTime = 6.174;

export function uaktToAKT(amount, precision = 3) {
  return Math.round((amount / 1000000 + Number.EPSILON) * Math.pow(10, precision)) / Math.pow(10, precision);
}

export function aktToUakt(amount) {
  return Math.round(parseFloat(amount) * 1000000);
}

export function getAvgCostPerMonth(pricePerBlock) {
  const averagePrice = (pricePerBlock * averageDaysInMonth * 24 * 60 * 60) / averageBlockTime;
  return uaktToAKT(averagePrice);
}

export function getTimeLeft(pricePerBlock, balance) {
  const blocksLeft = balance / pricePerBlock;
  const timestamp = new Date().getTime();
  return add(new Date(timestamp), { seconds: blocksLeft * averageBlockTime });
}
