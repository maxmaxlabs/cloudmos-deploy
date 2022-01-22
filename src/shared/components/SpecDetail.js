import MemoryIcon from "@material-ui/icons/Memory";
import StorageIcon from "@material-ui/icons/Storage";
import SpeedIcon from "@material-ui/icons/Speed";
import { makeStyles, Box } from "@material-ui/core";
import { humanFileSize } from "../utils/unitUtils";
import { Chip } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center"
  },
  chipRoot: {
    padding: "2px 0",
    height: "auto"
  },
  chipLabel: {
    display: "flex",
    alignItems: "center",
    padding: "2px 0"
  },
  specIcon: {
    fontSize: "2rem"
  },
  specDetail: {
    marginLeft: ".5rem",
    fontSize: "1rem"
  },
  marginLeft: {
    marginLeft: "1rem"
  }
}));

export function SpecDetail({ cpuAmount, memoryAmount, storageAmount, color }) {
  const classes = useStyles();
  return (
    <Box component="div" className={classes.root}>
      <Chip
        variant="outlined"
        color={color}
        classes={{ root: classes.chipRoot }}
        label={
          <div className={classes.chipLabel}>
            <SpeedIcon className={classes.specIcon} />
            <Box className={classes.specDetail}>{cpuAmount + "vcpu"}</Box>
          </div>
        }
      />
      <Chip
        variant="outlined"
        color={color}
        classes={{ root: classes.chipRoot }}
        className={classes.marginLeft}
        label={
          <div className={classes.chipLabel}>
            <MemoryIcon className={classes.specIcon} />
            <Box className={classes.specDetail}>{humanFileSize(memoryAmount)}</Box>
          </div>
        }
      />
      <Chip
        variant="outlined"
        color={color}
        classes={{ root: classes.chipRoot }}
        className={classes.marginLeft}
        label={
          <div className={classes.chipLabel}>
            <StorageIcon className={classes.specIcon} />
            <Box className={classes.specDetail}>{humanFileSize(storageAmount)}</Box>
          </div>
        }
      />
    </Box>
  );
}
