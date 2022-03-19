import MemoryIcon from "@material-ui/icons/Memory";
import StorageIcon from "@material-ui/icons/Storage";
import SpeedIcon from "@material-ui/icons/Speed";
import { makeStyles, Box, LinearProgress, Paper } from "@material-ui/core";
import { humanFileSize } from "../utils/unitUtils";
import clsx from "clsx";
import PowerSettingsNewIcon from "@material-ui/icons/PowerSettingsNew";
import BlockIcon from "@material-ui/icons/Block";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    borderRadius: 0
  },
  defaultColor: {
    color: "rgba(0,0,0,.25)",
    borderColor: "rgba(0,0,0,.20) !important"
  },
  activeColor: {
    color: theme.palette.grey[700],
    borderColor: "rgba(0,0,0,.25) !important"
  },
  serverRow: {
    width: "110px",
    border: "1px solid",
    borderRightWidth: "2px",
    borderLeftWidth: "2px",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    padding: "2px 4px"
  },
  serverTop: {
    width: "100%",
    display: "flex",
    borderBottom: "12px solid",
    height: "16px",
    borderTop: "2px solid",
    borderRight: "1px solid",
    borderLeft: "1px solid",
    position: "relative"
  },
  serverDot: {
    position: "absolute",
    width: "4px",
    height: "4px",
    borderRadius: "4px",
    bottom: "-8px",
    backgroundColor: theme.palette.primary.contrastText
  },
  serverDotActive: {
    animation: "$glow 1s ease-in-out infinite alternate",
    backgroundColor: theme.palette.primary.main
  },
  progressActive: {
    height: "2px",
    width: "50%",
    opacity: "0.5",
    borderRight: "10px solid"
  },
  statusIcon: {
    position: "absolute",
    top: "3px",
    right: "4px",
    fontSize: ".7rem",
    color: theme.palette.primary.contrastText
  },
  activeIcon: {
    color: theme.palette.primary.main
  },
  specIcon: {
    fontSize: "1rem"
  },
  specDetail: {
    marginLeft: "1rem",
    flexGrow: 1,
    textAlign: "left",
    fontWeight: "bold",

    fontSize: ".8rem",
    lineHeight: ".8rem"
  },
  "@keyframes glow": {
    "0%": {
      boxShadow: `0 0 0px ${theme.palette.primary.main}, 0 0 2px ${theme.palette.primary.main}, 0 0 4px ${theme.palette.primary.main}`
    },
    "100%": {
      boxShadow: `0 0 4px ${theme.palette.primary.main}, 0 0 6px ${theme.palette.primary.main}, 0 0 8px ${theme.palette.primary.main}`
    }
  }
}));

export function SpecDetailNew({ cpuAmount, memoryAmount, storageAmount, isActive }) {
  const classes = useStyles();
  return (
    <Paper className={classes.root} elevation={isActive ? 2 : 0}>
      <div className={clsx(classes.serverTop, classes.defaultColor, { [classes.activeColor]: isActive })}>
        {isActive && (
          <>
            <LinearProgress className={clsx(classes.progressActive, classes.activeColor)} />
            <PowerSettingsNewIcon className={clsx(classes.statusIcon, classes.activeIcon)} />
          </>
        )}

        {!isActive && <BlockIcon className={classes.statusIcon} />}

        <Box className={clsx(classes.serverDot, { [classes.serverDotActive]: isActive })} left="6px" />
        <Box className={clsx(classes.serverDot, { [classes.serverDotActive]: isActive })} left="12px" />
        <Box className={clsx(classes.serverDot, { [classes.serverDotActive]: isActive })} left="18px" />
      </div>
      <div className={clsx(classes.serverRow, classes.defaultColor, { [classes.activeColor]: isActive })}>
        <SpeedIcon className={clsx(classes.specIcon, classes.defaultColor, { [classes.activeColor]: isActive, [classes.activeIcon]: isActive })} />
        <div className={clsx(classes.specDetail, classes.defaultColor, { [classes.activeColor]: isActive })}>{cpuAmount + " vcpu"}</div>
      </div>

      <div className={clsx(classes.serverRow, classes.defaultColor, { [classes.activeColor]: isActive })}>
        <MemoryIcon className={clsx(classes.specIcon, classes.defaultColor, { [classes.activeColor]: isActive, [classes.activeIcon]: isActive })} />
        <div className={clsx(classes.specDetail, classes.defaultColor, { [classes.activeColor]: isActive })}>{humanFileSize(memoryAmount)}</div>
      </div>

      <div className={clsx(classes.serverRow, classes.defaultColor, { [classes.activeColor]: isActive })}>
        <StorageIcon className={clsx(classes.specIcon, classes.defaultColor, { [classes.activeColor]: isActive, [classes.activeIcon]: isActive })} />
        <div className={clsx(classes.specDetail, classes.defaultColor, { [classes.activeColor]: isActive })}>{humanFileSize(storageAmount)}</div>
      </div>
      <Box width="100%" display="flex" borderBottom="4px solid" className={clsx(classes.defaultColor, { [classes.activeColor]: isActive })} />
    </Paper>
  );
}
