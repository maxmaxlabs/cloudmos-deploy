import { Box, Typography } from "@material-ui/core";
import { StatusPill } from "./StatusPill";

/**
 *
 * @param {number} latency
 * @param {string} status
 * @param {string} variant "regular" | "dense"
 * @returns
 */
export const NodeStatus = ({ latency, status, variant = "regular" }) => {
  return (
    <Box display="flex" alignItems="center">
      <div>
        <Typography variant="caption">
          {latency}ms{latency >= 10000 && "+"}
        </Typography>
      </div>
      <div>
        <StatusPill state={status === "active" ? "active" : "closed"} size={variant === "regular" ? "medium" : "small"} />
      </div>
    </Box>
  );
};
