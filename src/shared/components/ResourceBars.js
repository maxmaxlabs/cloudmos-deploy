import { makeStyles, Box } from "@material-ui/core";
import { humanFileSize } from "../utils/unitUtils";

const useStyles = makeStyles((theme) => ({
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

export const ResourceBars = ({ activeCPU, pendingCPU, totalCPU, activeMemory, pendingMemory, totalMemory, activeStorage, pendingStorage, totalStorage }) => {
  const classes = useStyles();

  return (
    <>
      <Box marginBottom=".5rem">
        <div className={classes.networkCapacityBar}>
          <div className={classes.networkCapacityIndicator} style={{ width: `${Math.round(((activeCPU + pendingCPU) / totalCPU) * 100)}%` }} />
        </div>
        <div className={classes.networkCapacityDesc}>
          <div>
            <strong>CPU</strong>
          </div>
          <div>
            {Math.round(activeCPU + pendingCPU)}&nbsp;CPU&nbsp;/&nbsp;{Math.round(totalCPU)}&nbsp;CPU
          </div>
        </div>
      </Box>

      <Box marginBottom=".5rem">
        <div className={classes.networkCapacityBar}>
          <div className={classes.networkCapacityIndicator} style={{ width: `${Math.round(((activeMemory + pendingMemory) / totalMemory) * 100)}%` }} />
        </div>
        <div className={classes.networkCapacityDesc}>
          <div>
            <strong>RAM</strong>
          </div>
          <div>
            {humanFileSize(activeMemory + pendingMemory)}&nbsp;/&nbsp;{humanFileSize(totalMemory)}
          </div>
        </div>
      </Box>

      <Box marginBottom=".5rem">
        <div className={classes.networkCapacityBar}>
          <div className={classes.networkCapacityIndicator} style={{ width: `${Math.round(((activeStorage + pendingStorage) / totalStorage) * 100)}%` }} />
        </div>
        <div className={classes.networkCapacityDesc}>
          <div>
            <strong>STORAGE</strong>
          </div>
          <div>
            {humanFileSize(activeStorage + pendingStorage)}&nbsp;/&nbsp;{humanFileSize(totalStorage)}
          </div>
        </div>
      </Box>
    </>
  );
};
