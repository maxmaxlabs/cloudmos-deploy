import add from "date-fns/add";

const averageBlockTime = 6.174;

export function uaktToAKT(amount, precision = 1000) {
  return (
    Math.round((amount / 1000000 + Number.EPSILON) * precision) / precision
  );
}

export function getAvgCostPerMonth(pricePerBlock) {
  const averagePrice = (pricePerBlock * 31 * 24 * 60 * 60) / averageBlockTime;
  return uaktToAKT(averagePrice);
}

export function getTimeLeft(pricePerBlock, balance) {
  const blocksLeft = balance / pricePerBlock;
  const timestamp = new Date().getTime();
  return add(new Date(timestamp), { seconds: blocksLeft * averageBlockTime });
}
