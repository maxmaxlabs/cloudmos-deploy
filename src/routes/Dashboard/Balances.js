import { Box, CircularProgress, makeStyles } from "@material-ui/core";
import { ResponsivePie } from "@nivo/pie";
import { uaktToAKT } from "../../shared/utils/priceUtils";
import { customColors } from "../../shared/theme";
import { PriceValue } from "../../shared/components/PriceValue";

const useStyles = makeStyles((theme) => ({
  legendRow: {
    display: "flex",
    alignItems: "center"
  },
  legendColor: {
    width: "1rem",
    height: "1rem",
    borderRadius: "1rem"
  },
  legendLabel: {
    marginLeft: "1rem",
    fontWeight: "bold",
    width: "100px"
  },
  legendValue: {
    marginLeft: "1rem",
    width: "100px"
  }
}));

export const Balances = ({ balances, isLoadingBalances, escrowSum }) => {
  const classes = useStyles();
  const data = balances ? getData(balances, escrowSum) : [];
  const filteredData = data.filter((x) => x.value);
  const total = balances ? balances.balance + balances.rewards + balances.delegations + balances.redelegations + balances.unbondings + escrowSum : 0;

  const getColor = (bar) => colors[bar.id];

  return (
    <Box display="flex" alignItems="center" marginBottom="1rem">
      <Box height="200px" width="220px" display="flex" alignItems="center" justifyContent="center">
        {isLoadingBalances && <CircularProgress size="3rem" />}
        <ResponsivePie
          data={filteredData}
          margin={{ top: 15, right: 15, bottom: 15, left: 0 }}
          innerRadius={0.6}
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

      {balances && (
        <div>
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
        </div>
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
  redelegations: "#4B5CBE",
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
    {
      id: "redelegations",
      label: "Redelegations",
      value: balances.redelegations,
      color: colors.redelegations
    },
    {
      id: "unbondings",
      label: "Unbondings",
      value: balances.unbondings,
      color: colors.unbondings
    }
  ];
};
