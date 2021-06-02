import MemoryIcon from "@material-ui/icons/Memory";
import StorageIcon from "@material-ui/icons/Storage";
import SpeedIcon from "@material-ui/icons/Speed";
import { makeStyles, Box } from "@material-ui/core";
import clsx from "clsx";
import { humanFileSize } from "../utils/unitUtils";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    padding: "1rem 0"
  },
  specIcon: {
    fontSize: "2rem"
  },
  specDetail: {
    marginLeft: ".5rem"
  },
  marginLeft: {
    marginLeft: "1rem"
  }
}));

export function SpecDetail({ cpuAmount, memoryAmount, storageAmount }) {
  const classes = useStyles();
  return (
    <Box component="div" className={classes.root}>
      <SpeedIcon className={classes.specIcon} />
      <Box className={classes.specDetail}>{cpuAmount + "vcpu"}</Box>
      <MemoryIcon className={clsx(classes.specIcon, classes.marginLeft)} />
      <Box className={classes.specDetail}>{humanFileSize(memoryAmount)}</Box>
      <StorageIcon className={clsx(classes.specIcon, classes.marginLeft)} />
      <Box className={classes.specDetail}>{humanFileSize(storageAmount)}</Box>
    </Box>
  );
}
