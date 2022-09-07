import MemoryIcon from "@material-ui/icons/Memory";
import StorageIcon from "@material-ui/icons/Storage";
import SpeedIcon from "@material-ui/icons/Speed";
import { makeStyles, Box } from "@material-ui/core";
import { humanFileSize } from "../utils/unitUtils";
import { Chip } from "@material-ui/core";
import clsx from "clsx";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center"
  },
  defaultColor: {
    borderColor: "rgba(0,0,0,.15)"
  },
  chipRoot: {
    padding: "2px 0",
    height: "auto",
    backgroundColor: theme.palette.grey[100],
    borderRadius: "2rem"
  },
  chipLabel: {
    display: "flex",
    alignItems: "center",
    padding: "2px 0"
  },
  specIconSmall: {
    fontSize: ".8rem"
  },
  specIconMedium: {
    fontSize: "1.5rem"
  },
  specIconLarge: {
    fontSize: "2rem"
  },
  specDetail: {
    marginLeft: ".5rem"
  },
  specDetailSmall: {
    fontSize: ".8rem",
    lineHeight: ".8rem"
  },
  specDetailMedium: {
    fontSize: ".9rem",
    lineHeight: ".8rem"
  },
  specDetailLarge: {
    fontSize: "1rem",
    lineHeight: ".8rem"
  },
  gutterSmall: {
    marginLeft: ".5rem"
  },
  gutterMedium: {
    marginLeft: ".75rem"
  },
  gutterLarge: {
    marginLeft: "1rem"
  }
}));

export function SpecDetail({ cpuAmount, memoryAmount, storageAmount, color = "default", size = "large", gutterSize = "large" }) {
  const classes = useStyles();
  return (
    <Box component="div" className={classes.root}>
      <Chip
        variant="outlined"
        color={color}
        classes={{ root: classes.chipRoot }}
        className={clsx({ [classes.defaultColor]: color === "default" })}
        label={
          <div className={classes.chipLabel}>
            <SpeedIcon
              className={clsx({
                [classes.specIconSmall]: size === "small",
                [classes.specIconMedium]: size === "medium",
                [classes.specIconLarge]: size === "large"
              })}
            />
            <Box
              className={clsx(classes.specDetail, {
                [classes.specDetailSmall]: size === "small",
                [classes.specDetailMedium]: size === "medium",
                [classes.specDetailLarge]: size === "large"
              })}
            >
              {cpuAmount + " vCPU"}
            </Box>
          </div>
        }
      />
      <Chip
        variant="outlined"
        color={color}
        classes={{ root: classes.chipRoot }}
        className={clsx({
          [classes.defaultColor]: color === "default",
          [classes.gutterSmall]: gutterSize === "small",
          [classes.gutterMedium]: gutterSize === "medium",
          [classes.gutterLarge]: gutterSize === "large"
        })}
        label={
          <div className={classes.chipLabel}>
            <MemoryIcon
              className={clsx({
                [classes.specIconSmall]: size === "small",
                [classes.specIconMedium]: size === "medium",
                [classes.specIconLarge]: size === "large"
              })}
            />
            <Box
              className={clsx(classes.specDetail, {
                [classes.specDetailSmall]: size === "small",
                [classes.specDetailMedium]: size === "medium",
                [classes.specDetailLarge]: size === "large"
              })}
            >
              {humanFileSize(memoryAmount)}
            </Box>
          </div>
        }
      />
      <Chip
        variant="outlined"
        color={color}
        classes={{ root: classes.chipRoot }}
        className={clsx({
          [classes.defaultColor]: color === "default",
          [classes.gutterSmall]: gutterSize === "small",
          [classes.gutterMedium]: gutterSize === "medium",
          [classes.gutterLarge]: gutterSize === "large"
        })}
        label={
          <div className={classes.chipLabel}>
            <StorageIcon
              className={clsx({
                [classes.specIconSmall]: size === "small",
                [classes.specIconMedium]: size === "medium",
                [classes.specIconLarge]: size === "large"
              })}
            />
            <Box
              className={clsx(classes.specDetail, {
                [classes.specDetailSmall]: size === "small",
                [classes.specDetailMedium]: size === "medium",
                [classes.specDetailLarge]: size === "large"
              })}
            >
              {humanFileSize(storageAmount)}
            </Box>
          </div>
        }
      />
    </Box>
  );
}
