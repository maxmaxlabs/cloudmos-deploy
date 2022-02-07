import { List, ListItem, ListItemText, makeStyles, ListItemIcon } from "@material-ui/core";
import DashboardIcon from "@material-ui/icons/Dashboard";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import SettingsIcon from "@material-ui/icons/Settings";
import CollectionsIcon from '@material-ui/icons/Collections';
import { Link, useLocation } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";

const drawerWidth = 200;

const useStyles = makeStyles((theme) => ({
  root: {
    width: drawerWidth,
    flexShrink: 0,
    borderRight: "1px solid rgba(0,0,0,0.1)"
  },
  drawerPaper: {
    width: drawerWidth
  },
  toolbar: theme.mixins.toolbar
}));

export const LeftNav = () => {
  const classes = useStyles();
  const location = useLocation();

  const routes = [
    { title: "Dashboard", icon: <DashboardIcon />, url: UrlService.dashboard() },
    { title: "Deployments", icon: <CloudUploadIcon />, url: UrlService.deploymentList() },
    { title: "Templates", icon: <CollectionsIcon />, url: UrlService.templates() },
    { title: "Settings", icon: <SettingsIcon />, url: UrlService.settings() }
  ];

  return (
    <List className={classes.root}>
      {routes.map((route) => (
        <ListItem button key={route.title} component={Link} to={route.url} selected={location.pathname === route.url}>
          <ListItemIcon>{route.icon}</ListItemIcon>
          <ListItemText primary={route.title} />
        </ListItem>
      ))}
    </List>
  );
};
