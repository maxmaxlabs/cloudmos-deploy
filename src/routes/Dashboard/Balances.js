import { Box, makeStyles } from "@material-ui/core";
import { ResponsivePie } from "@nivo/pie";
import { uaktToAKT } from "../../shared/utils/priceUtils";

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
    marginLeft: "1rem"
  }
}));

export const Balances = ({ balances, isLoadingBalances, escrowSum }) => {
  const classes = useStyles();
  const data = balances ? getData(balances, escrowSum) : [];
  const filteredData = data.filter((x) => x.value);

  const getColor = (bar) => colors[bar.id];

  return (
    <Box display="flex" alignItems="center" marginBottom="1rem">
      <Box height="200px" width="220px">
        <ResponsivePie
          data={filteredData}
          margin={{ top: 15, right: 15, bottom: 15, left: 0 }}
          innerRadius={0.6}
          activeOuterRadiusOffset={8}
          colors={getColor}
          borderWidth={1}
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

      <div>
        {data.map((balance, i) => (
          <div className={classes.legendRow} key={i}>
            <div className={classes.legendColor} style={{ backgroundColor: balance.color }} />
            <div className={classes.legendLabel}>{balance.label}:</div>
            <div className={classes.legendValue}>{uaktToAKT(balance.value, 2)} AKT</div>
          </div>
        ))}
      </div>
    </Box>
  );
};

const theme = {
  background: "#ffffff",
  textColor: "#fff",
  fontSize: 12
};

const colors = {
  balance: "#4dceff",
  rewards: "#1bd821",
  delegations: "#303f9f",
  redelegations: "#f9ec55",
  unbondings: "#F82530",
  escrow: "#9c21f9"
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
    },
    {
      id: "escrow",
      label: "Escrow",
      value: escrowSum,
      color: colors.escrow
    }
  ];
};
