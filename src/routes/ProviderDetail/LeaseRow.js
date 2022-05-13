import React, {  } from "react";
import {
  makeStyles,
  TableRow,
  TableCell} from "@material-ui/core";
import { Link } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { PricePerMonth } from "../../shared/components/PricePerMonth";
import { PriceEstimateTooltip } from "../../shared/components/PriceEstimateTooltip";
import { FormattedNumber } from "react-intl";
import { uaktToAKT, getAvgCostPerMonth } from "../../shared/utils/priceUtils";
import { StatusPill } from "../../shared/components/StatusPill";
import isEqual from "lodash/isEqual";

const useStyles = makeStyles((theme) => ({
  flexCenter: {
    display: "flex",
    alignItems: "center"
  }
}));

export const LeaseRow = React.memo(
  function MemoLeaseRow({ lease }) {
    const classes = useStyles();
    return (
      <TableRow>
        <TableCell component="th" scope="row">
          <StatusPill state={lease.state} size="small" />
        </TableCell>
        <TableCell>
          <Link to={UrlService.deploymentDetails(lease.dseq)}>{lease.dseq}</Link>
        </TableCell>
        <TableCell>
          <div className={classes.flexCenter}>
            <PricePerMonth perBlockValue={uaktToAKT(lease.price.amount, 6)} />
            <PriceEstimateTooltip value={uaktToAKT(lease.price.amount, 6)} />
            <span className={classes.monthlyCost}>
              <FormattedNumber value={lease.price.amount} maximumSignificantDigits={18} />
              uakt ({`~${getAvgCostPerMonth(lease.price.amount)}akt/month`})
            </span>
          </div>
        </TableCell>
      </TableRow>
    );
  },
  (prevProps, nextProps) => {
    return isEqual(prevProps, nextProps);
  }
);
