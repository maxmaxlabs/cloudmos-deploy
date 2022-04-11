import { Grid, makeStyles, Box, Tooltip } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import WarningIcon from "@material-ui/icons/Warning";
import { getAvgCostPerMonth, uaktToAKT, useRealTimeLeft } from "../../shared/utils/priceUtils";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import isValid from "date-fns/isValid";
import { StatusPill } from "../../shared/components/StatusPill";
import { LabelValue } from "../../shared/components/LabelValue";
import { PricePerMonth } from "../../shared/components/PricePerMonth";
import { PriceValue } from "../../shared/components/PriceValue";
import { PriceEstimateTooltip } from "../../shared/components/PriceEstimateTooltip";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: ".5rem 1rem",
    borderBottom: `1px solid ${theme.palette.grey[300]}`
  },
  tooltip: {
    fontSize: "1rem"
  },
  tooltipIcon: {
    fontSize: "1rem",
    color: theme.palette.text.secondary
  },
  warningIcon: {
    color: theme.palette.error.main
  },
  costChip: {
    display: "inline-flex",
    alignItems: "baseline",
    padding: "4px 8px",
    backgroundColor: theme.palette.grey[800],
    color: "white",
    borderRadius: "4px",
    marginTop: "4px",
    fontSize: ".75rem",
    "& svg": {
      color: theme.palette.primary.contrastText
    }
  }
}));

export function DeploymentSubHeader({ deployment, deploymentCost }) {
  const classes = useStyles();
  const realTimeLeft = useRealTimeLeft(deploymentCost, deployment.escrowBalance, deployment.escrowAccount.settled_at, deployment.createdAt);
  const avgCost = getAvgCostPerMonth(deploymentCost);
  const isActive = deployment.state === "active";

  return (
    <div className={classes.root}>
      <Grid container spacing={0}>
        <Grid item xs={3}>
          <LabelValue
            label="Status:"
            value={
              <>
                <div>{deployment.state}</div>
                <StatusPill state={deployment.state} />
              </>
            }
          />
        </Grid>
        <Grid item xs={5}>
          <Box display="flex" alignItems="center">
            <LabelValue
              label="Escrow balance:"
              value={
                <>
                  {uaktToAKT(isActive ? realTimeLeft?.escrow : deployment.escrowBalance, 6)}&nbsp;AKT
                  <Box component="span" display="inline-flex" marginLeft=".5rem">
                    <Tooltip
                      classes={{ tooltip: classes.tooltip }}
                      arrow
                      title="The escrow account balance will be fully returned to your wallet balance when the deployment is closed."
                    >
                      <InfoIcon className={classes.tooltipIcon} />
                    </Tooltip>

                    {!!realTimeLeft && realTimeLeft.escrow < 0 && isActive && (
                      <Tooltip
                        classes={{ tooltip: classes.tooltip }}
                        arrow
                        title="Your deployment is out of funds and can be closed by your provider at any time now. You can add funds to keep active."
                      >
                        <WarningIcon color="error" className={clsx(classes.tooltipIcon, classes.warningIcon)} />
                      </Tooltip>
                    )}
                  </Box>
                </>
              }
            />
            <Box marginLeft=".5rem"></Box>
          </Box>
        </Grid>
        <Grid item xs={4}>
          {isActive && <LabelValue label="Time left:" value={isValid(realTimeLeft?.timeLeft) && `~${formatDistanceToNow(realTimeLeft?.timeLeft)}`} />}
        </Grid>
        <Grid item xs={3}>
          <LabelValue label="DSEQ:" value={deployment.dseq} />
        </Grid>
        <Grid item xs={5}>
          <LabelValue label="Amount spent:" value={`${uaktToAKT(isActive ? realTimeLeft?.amountSpent : deployment.transferred.amount, 6)} AKT`} />
        </Grid>
        <Grid item xs={4}>
          <LabelValue label="Cost/Month:" value={`~${avgCost} AKT`} />
        </Grid>
      </Grid>

      <Box className={classes.costChip}>
        <div>
          Balance:&nbsp;
          <strong>
            <PriceValue value={uaktToAKT(isActive ? realTimeLeft?.escrow : deployment.escrowBalance, 6)} />
          </strong>
        </div>

        <Box marginLeft="1rem">
          Spent:&nbsp;
          <strong>
            <PriceValue value={uaktToAKT(isActive ? realTimeLeft?.amountSpent : deployment.transferred.amount, 6)} />
          </strong>
        </Box>

        {!!deploymentCost && (
          <Box display="flex" alignItems="center" marginLeft="1rem">
            Cost:&nbsp; <PricePerMonth perBlockValue={uaktToAKT(deploymentCost, 6)} typoVariant="caption" />
            <PriceEstimateTooltip value={uaktToAKT(deploymentCost, 6)} />
          </Box>
        )}
      </Box>
    </div>
  );
}
