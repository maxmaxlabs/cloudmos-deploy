import { Tooltip, Typography, Box, makeStyles } from "@material-ui/core";
import { PriceValue } from "./PriceValue";
import InfoIcon from "@material-ui/icons/Info";
import { averageDaysInMonth } from "../../shared/utils/date";
import { averageBlockTime } from "../utils/priceUtils";

const useStyles = makeStyles((theme) => ({
  tooltip: {
    fontSize: "1rem"
  },
  tooltipIcon: {
    marginLeft: ".5rem",
    fontSize: "1rem",
    color: theme.palette.grey[500]
  },
  chip: {
    height: "16px"
  }
}));

export const PriceEstimateTooltip = ({ value }) => {
  const classes = useStyles();
  return (
    <Tooltip
      classes={{ tooltip: classes.tooltip }}
      arrow
      title={
        <Box>
          <Typography variant="caption">Price estimation:</Typography>
          <div>
            <strong>
              <PriceValue value={value} />
            </strong>{" "}
            per block (~{averageBlockTime}sec.)
          </div>

          <div>
            <strong>
              <PriceValue value={value * (60 / averageBlockTime) * 60 * 24} />
            </strong>{" "}
            per day
          </div>

          <div>
            <strong>
              <PriceValue value={value * (60 / averageBlockTime) * 60 * 24 * averageDaysInMonth} />
            </strong>{" "}
            per month
          </div>
        </Box>
      }
    >
      <InfoIcon className={classes.tooltipIcon} fontSize="small" />
    </Tooltip>
  );
};
