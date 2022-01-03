import { makeStyles, AppBar, Toolbar, Box, CircularProgress } from "@material-ui/core";
import { NodeStatus } from "../../shared/components/NodeStatus";
import { useSettings } from "../../context/SettingsProvider";
import { Link } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { useEffect } from "react";

const useStyles = makeStyles((theme) => ({
  toolbar: {
    minHeight: "30px",
    maxHeight: "30px"
  },
  link: {
    textDecoration: "none",
    color: "inherit",
    display: "inline-flex",
    fontSize: ".75rem",
    alignItems: "center"
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
      </Toolbar>
    </AppBar>
  );
};
