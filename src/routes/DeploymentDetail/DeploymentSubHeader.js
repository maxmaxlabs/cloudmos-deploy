import { makeStyles, Box, Tooltip } from "@material-ui/core";
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
    height: "77px",
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
  grid: {
    padding: ".5rem 0",
    maxWidth: "800px",
    display: "flex"
  },
  gridItem: {
    padding: "0 1rem",
    lineHeight: "1.5rem"
  },
  costPanel: {
    padding: ".5rem 1rem",
    fontSize: ".875rem",
    borderRight: `1px solid ${theme.palette.grey[300]}`,
    whiteSpace: "nowrap",
    display: "flex",
    height: "100%"
  }
}));

export function DeploymentSubHeader({ deployment, leases }) {
  const classes = useStyles();
  const hasLeases = leases && leases.length > 0;
  const deploymentCost = hasLeases ? leases.reduce((prev, current) => prev + current.price.amount, 0) : 0;
  const realTimeLeft = useRealTimeLeft(deploymentCost, deployment.escrowBalance, deployment.escrowAccount.settled_at, deployment.createdAt);
  const avgCost = getAvgCostPerMonth(deploymentCost);
  const isActive = deployment.state === "active";
  const hasActiveLeases = hasLeases && leases.some((l) => l.state === "active");

  return (
    <div className={classes.root}>
      <Box display="flex" alignItems="center">
        <Box className={classes.costPanel}>
          <div>
            <div>Balance:</div>
            <div>Spent:</div>
            {!!deploymentCost && (
              <Box display="flex" alignItems="center">
                Cost:
                <PriceEstimateTooltip value={uaktToAKT(deploymentCost, 6)} />
              </Box>
            )}
          </div>

          <Box paddingLeft="1rem">
            <div>
              <strong>
                <PriceValue value={uaktToAKT(isActive && hasActiveLeases ? realTimeLeft?.escrow : deployment.escrowBalance, 6)} />
              </strong>
            </div>
            <div>
              <strong>
                <PriceValue value={uaktToAKT(isActive && hasActiveLeases ? realTimeLeft?.amountSpent : deployment.transferred.amount, 6)} />
              </strong>
            </div>

            {!!deploymentCost && (
              <Box display="flex" alignItems="center">
                <PricePerMonth perBlockValue={uaktToAKT(deploymentCost, 6)} typoVariant="body2" />
              </Box>
            )}
          </Box>
        </Box>

        <div className={classes.grid}>
          <div className={classes.gridItem}>
            <LabelValue
              label="Status:"
              value={
                <>
                  <div>{deployment.state}</div>
                  <StatusPill state={deployment.state} style={{ marginLeft: ".5rem" }} />
                </>
              }
            />
            <LabelValue label="DSEQ:" value={deployment.dseq} />
          </div>

          <div className={classes.gridItem}>
            <Box display="flex" alignItems="center">
              <LabelValue
                label="Balance:"
                value={
                  <>
                    {uaktToAKT(isActive && hasActiveLeases ? realTimeLeft?.escrow : deployment.escrowBalance, 6)}&nbsp;AKT
                    <Box component="span" display="inline-flex" marginLeft=".5rem">
                      <Tooltip
                        classes={{ tooltip: classes.tooltip }}
                        arrow
                        title="The escrow account balance will be fully returned to your wallet balance when the deployment is closed."
                      >
                        <InfoIcon className={classes.tooltipIcon} />
                      </Tooltip>

                      {isActive && hasActiveLeases && !!realTimeLeft && realTimeLeft.escrow <= 0 && (
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
            </Box>
            <LabelValue label="Spent:" value={`${uaktToAKT(isActive && hasActiveLeases ? realTimeLeft?.amountSpent : deployment.transferred.amount, 6)} AKT`} />
          </div>
          <div className={classes.gridItem}>
            {isActive && hasActiveLeases && (
              <LabelValue label="Time left:" value={isValid(realTimeLeft?.timeLeft) && `~${formatDistanceToNow(realTimeLeft?.timeLeft)}`} />
            )}
            <LabelValue label="Cost/Month:" value={`${avgCost} AKT`} />
          </div>
        </div>
      </Box>
    </div>
  );
}
