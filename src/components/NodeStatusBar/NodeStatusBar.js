import { makeStyles, AppBar, Toolbar, Box, CircularProgress, Typography, Button } from "@material-ui/core";
import { NodeStatus } from "../../shared/components/NodeStatus";
import { useSettings } from "../../context/SettingsProvider";
import { useEffect, useState } from "react";
import GitHubIcon from "@material-ui/icons/GitHub";
import { SettingsModal } from "../../shared/components/SettingsModal";

const useStyles = makeStyles((theme) => ({
  toolbar: {
    minHeight: "30px",
    maxHeight: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  link: {
    textDecoration: "none",
    color: "inherit",
    display: "inline-flex",
    fontSize: ".75rem",
    alignItems: "center"
  },
  githubIcon: {
    fontSize: "1rem"
  },
  caption: {
    color: theme.palette.grey["600"],
    fontWeight: "bold",
    fontSize: ".7rem"
  }
}));

export const NodeStatusBar = () => {
  const classes = useStyles();
  const { settings, isRefreshingNodeStatus, refreshNodeStatuses } = useSettings();
  const { selectedNode, isCustomNode, customNode } = settings;
  const shownNode = isCustomNode ? customNode : selectedNode;
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  useEffect(() => {
    const refreshNodeIntervalId = setInterval(async () => {
      await refreshNodeStatuses();
    }, 60_000); // refresh every 1min

    return () => {
      clearInterval(refreshNodeIntervalId);
    };
  }, []);

  const onSettingsModalClose = () => {
    refreshNodeStatuses(isCustomNode);
    setIsEditingSettings(false);
  };

  return (
    <AppBar position="static" color="default">
      {isEditingSettings && <SettingsModal onClose={onSettingsModalClose} />}

      <Toolbar variant="dense" className={classes.toolbar}>
        <Box display="flex" alignItems="center" width="100%">
          {shownNode && (
            <a href="#" onClick={() => setIsEditingSettings(true)} className={classes.link}>
              Node:
              <Box marginLeft=".5rem">{shownNode?.id}</Box>
              <Box marginLeft="1rem">
                <NodeStatus latency={Math.floor(shownNode?.latency)} status={shownNode?.status} variant="dense" />
              </Box>
            </a>
          )}

          {!shownNode && isCustomNode && <>Custom node...</>}

          {isRefreshingNodeStatus && (
            <Box marginLeft="1rem">
              <CircularProgress size=".75rem" />
            </Box>
          )}
        </Box>

        <Box display="flex" alignItems="center" whiteSpace="nowrap">
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
              <GitHubIcon className={classes.githubIcon} />
            </Box>
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
