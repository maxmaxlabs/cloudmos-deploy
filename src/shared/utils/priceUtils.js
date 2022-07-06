import add from "date-fns/add";
import { averageDaysInMonth } from "./date";
import { useBlock } from "../../queries";

export const averageBlockTime = 6.098;

export function uaktToAKT(amount, precision = 3) {
  return Math.round((amount / 1000000 + Number.EPSILON) * Math.pow(10, precision)) / Math.pow(10, precision);
}

export function aktToUakt(amount) {
  return Math.round(parseFloat(amount) * 1000000);
}

export function coinToUAkt(coin) {
  let uakt = null;
  if (coin.denom === "akt") {
    uakt = aktToUakt(parseFloat(coin.amount));
  } else if (coin.denom === "uakt") {
    uakt = parseFloat(coin.amount);
  } else {
    throw Error("Unrecognized denom: " + coin.denom);
  }

  return uakt;
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

export function useRealTimeLeft(pricePerBlock, balance, settledAt, createdAt) {
  const { data: latestBlock } = useBlock("latest", {
    refetchInterval: 30000
  });
  if (!latestBlock) return;

  const latestBlockHeight = latestBlock.block.header.height;
  const blocksPassed = Math.abs(settledAt - latestBlockHeight);
  const blocksSinceCreation = Math.abs(createdAt - latestBlockHeight);

  const blocksLeft = balance / pricePerBlock - blocksPassed;
  const timestamp = new Date().getTime();

  return {
    timeLeft: add(new Date(timestamp), { seconds: blocksLeft * averageBlockTime }),
    escrow: Math.max(blocksLeft * pricePerBlock, 0),
    amountSpent: Math.min(blocksSinceCreation * pricePerBlock, balance)
  };
}
