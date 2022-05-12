import { useState } from "react";
import { Box, CircularProgress, makeStyles, Typography } from "@material-ui/core";
import { ResponsivePie } from "@nivo/pie";
import { uaktToAKT } from "../../shared/utils/priceUtils";
import { customColors } from "../../shared/theme";
import { PriceValue } from "../../shared/components/PriceValue";
import { ResourceBars } from "../../shared/components/ResourceBars";

const useStyles = makeStyles((theme) => ({
  legendRow: {
    display: "flex",
    alignItems: "center",
    fontSize: ".75rem",
    lineHeight: "1.25rem",
    transition: "opacity .2s ease"
  },
  legendColor: {
    width: "1rem",
    height: "1rem",
    borderRadius: "1rem"
  },
  legendLabel: {
    marginLeft: "1rem",
    fontWeight: "bold",
    width: "90px"
  },
  legendValue: {
    marginLeft: "1rem",
    width: "90px"
  },
  title: {
    fontSize: "1rem",
    fontWeight: "bold",
    marginBottom: ".5rem"
  }
}));

export const DashboardInfoPanel = ({ balances, isLoadingBalances, escrowSum, networkCapacity, isLoadingNetworkCapacity }) => {
  const classes = useStyles();
  const [selectedDataId, setSelectedDataId] = useState(null);
  const data = balances ? getData(balances, escrowSum) : [];
  const filteredData = data.filter((x) => x.value);
  const total = balances ? balances.balance + balances.rewards + balances.delegations + balances.unbondings + escrowSum : 0;
  const hasBalance = balances && total !== 0;

  const _getColor = (bar) => getColor(bar.id, selectedDataId);

  return (
    <Box display="flex" alignItems="center" marginBottom="1rem" padding="0 1rem" justifyContent="space-between">
      {isLoadingBalances && !balances && (
        <Box flexBasis="220px" height="200px" display="flex" alignItems="center" justifyContent="center">
          <CircularProgress size="3rem" />
        </Box>
      )}

      <Box display="flex" alignItems="center">
        {hasBalance && (
          <Box height="200px" width="220px" display="flex" alignItems="center" justifyContent="center">
            <ResponsivePie
              data={filteredData}
              margin={{ top: 15, right: 15, bottom: 15, left: 0 }}
              innerRadius={0.4}
              padAngle={2}
              cornerRadius={4}
              activeOuterRadiusOffset={8}
              colors={_getColor}
              borderWidth={0}
              borderColor={{
                from: "color",
                modifiers: [["darker", 0.2]]
              }}
              valueFormat={(value) => `${uaktToAKT(value, 2)} AKT`}
              enableArcLinkLabels={false}
              arcLabelsSkipAngle={10}
              theme={theme}
            />
          </Box>
        )}

        {balances && (
          <Box padding={hasBalance ? 0 : "1rem"} onMouseLeave={() => setSelectedDataId(null)}>
            {data.map((balance, i) => (
              <div
                className={classes.legendRow}
                key={i}
                onMouseEnter={() => setSelectedDataId(balance.id)}
                style={{ opacity: !selectedDataId || balance.id === selectedDataId ? 1 : 0.3 }}
              >
                <div className={classes.legendColor} style={{ backgroundColor: balance.color }} />
                <div className={classes.legendLabel}>{balance.label}:</div>
                <div className={classes.legendValue}>{uaktToAKT(balance.value, 2)} AKT</div>
                {!!balance.value && (
                  <div>
                    <PriceValue value={uaktToAKT(balance.value, 6)} />
                  </div>
                )}
              </div>
            ))}

            <div className={classes.legendRow}>
              <div className={classes.legendColor} />
              <div className={classes.legendLabel}>Total:</div>
              <div className={classes.legendValue}>
                <strong>{uaktToAKT(total, 2)} AKT</strong>
              </div>
              {!!total && (
                <div>
                  <strong>
                    <PriceValue value={uaktToAKT(total, 6)} />
                  </strong>
                </div>
              )}
            </div>
          </Box>
        )}
      </Box>

      {isLoadingNetworkCapacity && !networkCapacity && (
        <Box flexBasis="40%" height="200px" display="flex" alignItems="center" justifyContent="center">
          <CircularProgress size="3rem" />
        </Box>
      )}

      {networkCapacity && (
        <Box padding="1rem 2rem" flexBasis="40%" justifySelf="flex-end">
          <Typography variant="h1" className={classes.title}>
            Network Capacity
          </Typography>

          <ResourceBars
            activeCPU={networkCapacity.activeCPU}
            pendingCPU={networkCapacity.pendingCPU}
            totalCPU={networkCapacity.totalCPU}
            activeMemory={networkCapacity.activeMemory}
            pendingMemory={networkCapacity.pendingMemory}
            totalMemory={networkCapacity.totalMemory}
            activeStorage={networkCapacity.activeStorage}
            pendingStorage={networkCapacity.pendingStorage}
            totalStorage={networkCapacity.totalStorage}
          />
        </Box>
      )}
    </Box>
  );
};

const theme = {
  background: customColors.lightBg,
  textColor: "#fff",
  fontSize: 12
};

const getColor = (id, selectedId) => {
  if (!selectedId || id === selectedId) {
    return colors[id];
  } else {
    return "#e0e0e0";
  }
};

const colors = {
  balance: "#1B224B",
  escrow: "#263069",
  rewards: "#313E87",
  delegations: "#3B4BA5",
  // redelegations: "#4B5CBE",
  unbondings: "#6977C9"
};

const getData = (balances, escrowSum) => {
  return [
    {
      id: "balance",
      label: "Balance",
      value: balances.balance,
      color: colors.balance
    },
    {
      id: "escrow",
      label: "Escrow",
      value: escrowSum,
      color: colors.escrow
    },
    {
      id: "rewards",
      label: "Rewards",
      value: balances.rewards,
      color: colors.rewards
    },
    {
      id: "delegations",
      label: "Staked",
      value: balances.delegations,
      color: colors.delegations
    },
    // {
    //   id: "redelegations",
    //   label: "Redelegations",
    //   value: balances.redelegations,
    //   color: colors.redelegations
    // },
    {
      id: "unbondings",
      label: "Unbondings",
      value: balances.unbondings,
      color: colors.unbondings
    }
  ];
};
