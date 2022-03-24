import { Box, CircularProgress, makeStyles, Typography, Paper } from "@material-ui/core";
import { ResponsivePie } from "@nivo/pie";
import { uaktToAKT } from "../../shared/utils/priceUtils";
import { customColors } from "../../shared/theme";
import { PriceValue } from "../../shared/components/PriceValue";
import { humanFileSize } from "../../shared/utils/unitUtils";

const useStyles = makeStyles((theme) => ({
  legendRow: {
    display: "flex",
    alignItems: "center",
    fontSize: ".75rem",
    lineHeight: "1.25rem"
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
  },
  networkCapacityContainer: {
    padding: "1rem"
  },
  networkCapacityBar: {
    height: "10px",
    width: "100%",
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: "10px",
    overflow: "hidden"
  },
  networkCapacityIndicator: {
    backgroundColor: theme.palette.primary.main,
    height: "100%"
  },
  networkCapacityDesc: {
    paddingTop: "2px",
    fontSize: ".6rem",
    lineHeight: ".6rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  }
}));

export const DashboardInfoPanel = ({ balances, isLoadingBalances, escrowSum, networkCapacity, isLoadingNetworkCapacity }) => {
  const classes = useStyles();
  const data = balances ? getData(balances, escrowSum) : [];
  const filteredData = data.filter((x) => x.value);
  const total = balances ? balances.balance + balances.rewards + balances.delegations + balances.unbondings + escrowSum : 0;
  const hasBalance = balances && total !== 0;

  const getColor = (bar) => colors[bar.id];

  return (
    <Box display="flex" alignItems="center" marginBottom="1rem" padding="0 1rem" justifyContent="space-between">
      {(isLoadingBalances || isLoadingNetworkCapacity) && !balances && (
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
              colors={getColor}
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
          <Box padding={hasBalance ? 0 : "1rem"}>
            {data.map((balance, i) => (
              <div className={classes.legendRow} key={i}>
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

      {networkCapacity && (
        <Box padding="1rem" flexBasis="40%" justifySelf="flex-end">
          <Paper elevation={0} className={classes.networkCapacityContainer}>
            <Typography variant="h1" className={classes.title}>
              Network Capacity
            </Typography>
            <Box marginBottom=".5rem">
              <div className={classes.networkCapacityBar}>
                <div
                  className={classes.networkCapacityIndicator}
                  style={{ width: `${Math.round(((networkCapacity.activeCPU + networkCapacity.pendingCPU) / networkCapacity.totalCPU) * 100)}%` }}
                />
              </div>
              <div className={classes.networkCapacityDesc}>
                <div>
                  <strong>CPU</strong>
                </div>
                <div>
                  {Math.round(networkCapacity.activeCPU + networkCapacity.pendingCPU)}&nbsp;CPU&nbsp;/&nbsp;{Math.round(networkCapacity.totalCPU)}&nbsp;CPU
                </div>
              </div>
            </Box>

            <Box marginBottom=".5rem">
              <div className={classes.networkCapacityBar}>
                <div
                  className={classes.networkCapacityIndicator}
                  style={{ width: `${Math.round(((networkCapacity.activeMemory + networkCapacity.pendingMemory) / networkCapacity.totalMemory) * 100)}%` }}
                />
              </div>
              <div className={classes.networkCapacityDesc}>
                <div>
                  <strong>RAM</strong>
                </div>
                <div>
                  {humanFileSize(networkCapacity.activeMemory + networkCapacity.pendingMemory)}&nbsp;/&nbsp;{humanFileSize(networkCapacity.totalMemory)}
                </div>
              </div>
            </Box>

            <Box marginBottom=".5rem">
              <div className={classes.networkCapacityBar}>
                <div
                  className={classes.networkCapacityIndicator}
                  style={{ width: `${Math.round(((networkCapacity.activeStorage + networkCapacity.pendingStorage) / networkCapacity.totalStorage) * 100)}%` }}
                />
              </div>
              <div className={classes.networkCapacityDesc}>
                <div>
                  <strong>STORAGE</strong>
                </div>
                <div>
                  {humanFileSize(networkCapacity.activeStorage + networkCapacity.pendingStorage)}&nbsp;/&nbsp;{humanFileSize(networkCapacity.totalStorage)}
                </div>
              </div>
            </Box>
          </Paper>
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
