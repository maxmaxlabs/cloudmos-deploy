import { makeStyles, AppBar, Toolbar, Box, CircularProgress, Typography, Button, Chip } from "@material-ui/core";
import { NodeStatus } from "../../shared/components/NodeStatus";
import { useSettings } from "../../context/SettingsProvider";
import { useEffect, useState } from "react";
import GitHubIcon from "@material-ui/icons/GitHub";
import { SettingsModal } from "../../shared/components/SettingsModal";
import { networks } from "../../shared/networks";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { SelectNetworkModal } from "../SelectNetworkModal";
import { LinkTo } from "../../shared/components/LinkTo";
import { useAppVersion } from "../../hooks/useAppVersion";

const useStyles = makeStyles((theme) => ({
  toolbar: {
    minHeight: "30px",
    maxHeight: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  link: {
    "&&": {
      textDecoration: "none",
      color: "inherit",
      display: "inline-flex",
      fontSize: ".75rem",
      alignItems: "center",
      padding: "1px 2px",
      borderRadius: "4px",
      height: "20px",
      transition: "all .3s ease",
      "&:hover": {
        backgroundColor: theme.palette.grey["300"]
      }
    }
  },
  icon: {
    fontSize: "1rem"
  },
  caption: {
    color: theme.palette.grey["600"],
    fontWeight: "bold",
    fontSize: ".7rem"
  },
  button: {
    textTransform: "initial"
  },
  flexAlign: {
    display: "flex",
    alignItems: "center"
  },
  betaChip: {
    height: "12px",
    fontSize: "10px",
    fontWeight: "bold"
  }
}));

export const NodeStatusBar = () => {
  const classes = useStyles();
  const { appVersion } = useAppVersion();
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [isSelectingNetwork, setIsSelectingNetwork] = useState(false);
  const { settings, isRefreshingNodeStatus, refreshNodeStatuses, selectedNetworkId } = useSettings();
  const { selectedNode, isCustomNode, customNode } = settings;
  const shownNode = isCustomNode ? customNode : selectedNode;
  const selectedNetwork = networks.find((n) => n.id === selectedNetworkId);

  useEffect(() => {
    const refreshNodeIntervalId = setInterval(async () => {
      await refreshNodeStatuses();
    }, 60_000); // refresh every 1min

    return () => {
      clearInterval(refreshNodeIntervalId);
    };
  }, [refreshNodeStatuses]);

  const onSettingsModalClose = () => {
    refreshNodeStatuses();
    setIsEditingSettings(false);
  };

  const onSelectNetworkModalClose = () => {
    setIsSelectingNetwork(false);
  };

  return (
    <AppBar position="static" color="default">
      {isEditingSettings && <SettingsModal onClose={onSettingsModalClose} />}
      {isSelectingNetwork && <SelectNetworkModal onClose={onSelectNetworkModalClose} />}

      <Toolbar variant="dense" className={classes.toolbar}>
        <Box className={classes.flexAlign}>
          <Box className={classes.flexAlign}>
            <LinkTo onClick={() => setIsSelectingNetwork(true)} className={classes.link}>
              <Box component="span" fontWeight="bold">
                Network:
              </Box>
              <Box component="span" marginLeft=".5rem">
                {selectedNetwork?.title}
              </Box>
              <ExpandMore className={classes.icon} />
            </LinkTo>
          </Box>

          <Box marginLeft="1rem" className={classes.flexAlign}>
            {shownNode && (
              <LinkTo onClick={() => setIsEditingSettings(true)} className={classes.link}>
                <Box component="span" fontWeight="bold">
                  Node:
                </Box>
                <Box marginLeft=".5rem">{shownNode?.id}</Box>
                <ExpandMore className={classes.icon} />

                <Box marginLeft=".5rem">
                  <NodeStatus latency={Math.floor(shownNode?.latency)} status={shownNode?.status} variant="dense" />
                </Box>
              </LinkTo>
            )}

            {!shownNode && isCustomNode && (
              <LinkTo onClick={() => setIsEditingSettings(true)} className={classes.link}>
                Custom node...
              </LinkTo>
            )}

            {isRefreshingNodeStatus && (
              <Box marginLeft="1rem">
                <CircularProgress size=".75rem" />
              </Box>
            )}
          </Box>
        </Box>

        <Box display="flex" alignItems="center" whiteSpace="nowrap">
          <Box marginRight={1}>
            <Chip label={`beta v${appVersion}`} color="secondary" size="small" className={classes.betaChip} />
          </Box>

          <Button onClick={() => window.electron.openUrl("https://github.com/Akashlytics/akashlytics-deploy/issues")} size="small">
            <Typography variant="caption" className={classes.caption}>
              Submit an issue
            </Typography>
          </Button>
          <Box>|</Box>
          <Button onClick={() => window.electron.openUrl("https://github.com/Akashlytics/akashlytics-deploy")} size="small">
            <Typography variant="caption" className={classes.caption}>
              Fork me!
            </Typography>
            <Box component="span" display="inline-flex" marginLeft=".5rem">
              <GitHubIcon className={classes.icon} />
            </Box>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
