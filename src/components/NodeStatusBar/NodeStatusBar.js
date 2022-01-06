import { makeStyles, AppBar, Toolbar, Box, CircularProgress, IconButton, Typography, Button } from "@material-ui/core";
import { NodeStatus } from "../../shared/components/NodeStatus";
import { useSettings } from "../../context/SettingsProvider";
import { Link } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { useEffect } from "react";
import GitHubIcon from "@material-ui/icons/GitHub";

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
  const { selectedNode } = settings;

  useEffect(() => {
    const refreshNodeIntervalId = setInterval(async () => {
      await refreshNodeStatuses();
    }, 60_000); // refresh every 1min

    return () => {
      clearInterval(refreshNodeIntervalId);
    };
  }, []);

  return (
    <AppBar position="static" color="default">
      <Toolbar variant="dense" className={classes.toolbar}>
        <Box display="flex" alignItems="center" width="100%">
          <Link to={UrlService.settings()} className={classes.link}>
            Node:
            <Box marginLeft=".5rem">{selectedNode.id}</Box>
            <Box marginLeft="1rem">
              <NodeStatus latency={Math.floor(selectedNode.latency)} status={selectedNode.status} variant="dense" />
            </Box>
          </Link>

          {isRefreshingNodeStatus && (
            <Box marginLeft="1rem">
              <CircularProgress size=".75rem" />
            </Box>
          )}
        </Box>

        <Box display="flex" alignItems="center" whiteSpace="nowrap">
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
