import { Grid, makeStyles, Box, Tooltip } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { getAvgCostPerMonth, getTimeLeft, uaktToAKT } from "../../shared/utils/priceUtils";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import isValid from "date-fns/isValid";
import { StatusPill } from "../../shared/components/StatusPill";
import { LabelValue } from "../../shared/components/LabelValue";
import { PricePerMonth } from "../../shared/components/PricePerMonth";
import { PriceValue } from "../../shared/components/PriceValue";
import { PriceEstimateTooltip } from "../../shared/components/PriceEstimateTooltip";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: "1rem",
    borderBottom: `1px solid ${theme.palette.grey[300]}`
  },
  tooltip: {
    fontSize: "1rem"
  },
  tooltipIcon: {
    fontSize: "1rem",
    color: theme.palette.text.secondary
  }
}));

export function DeploymentSubHeader({ deployment, deploymentCost }) {
  const classes = useStyles();
  const timeLeft = getTimeLeft(deploymentCost, deployment.escrowBalance);
  const avgCost = getAvgCostPerMonth(deploymentCost);

  return (
    <div className={classes.root}>
      <Grid container spacing={1}>
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
              label="Escrow Balance:"
              value={
                <>
                  {uaktToAKT(deployment.escrowBalance, 6)}AKT{" "}
                  <Box component="span" display="inline-flex" marginLeft=".5rem">
                    <Tooltip
                      classes={{ tooltip: classes.tooltip }}
                      arrow
                      title="The escrow account balance will be fully returned to your wallet balance when the deployment is closed."
                    >
                      <InfoIcon className={classes.tooltipIcon} />
                    </Tooltip>
                  </Box>
                </>
              }
            />
            <Box marginLeft=".5rem"></Box>
          </Box>
        </Grid>
        <Grid item xs={4}>
          {deployment.state === "active" && <LabelValue label="Time left:" value={isValid(timeLeft) && formatDistanceToNow(timeLeft)} />}
        </Grid>
        <Grid item xs={3}>
          <LabelValue label="DSEQ:" value={deployment.dseq} />
        </Grid>
        <Grid item xs={5}>
          <LabelValue label="Amount spent:" value={`${uaktToAKT(deployment.transferred.amount, 6)}AKT`} />

          {deployment.transferred.amount && (
            <strong>
              ~<PriceValue value={uaktToAKT(deployment.transferred.amount, 6)} />
            </strong>
          )}
        </Grid>
        <Grid item xs={4}>
          <LabelValue label="Cost/Month:" value={`~${avgCost}AKT`} />
          <Box display="flex" alignItems="center">
            {deploymentCost && <PricePerMonth perBlockValue={uaktToAKT(deploymentCost, 6)} />}
            {deploymentCost && <PriceEstimateTooltip value={uaktToAKT(deploymentCost, 6)} />}
          </Box>
        </Grid>
      </Grid>
    </div>
  );
}
