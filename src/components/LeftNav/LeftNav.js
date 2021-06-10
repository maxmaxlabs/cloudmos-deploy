import { List, ListItem, ListItemText, makeStyles, ListItemIcon } from "@material-ui/core";
import DashboardIcon from "@material-ui/icons/Dashboard";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import SettingsIcon from "@material-ui/icons/Settings";
import { Link } from "react-router-dom";

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

  const routes = [
    { title: "Dashboard", icon: <DashboardIcon />, url: "/" },
    { title: "Deployments", icon: <CloudUploadIcon />, url: "/" },
    { title: "Settings", icon: <SettingsIcon />, url: "/" }
  ];

  return (
    <List className={classes.root}>
      {routes.map((route) => (
        <ListItem button key={route.title} component={Link} to={route.url}>
          <ListItemIcon>{route.icon}</ListItemIcon>
          <ListItemText primary={route.title} />
        </ListItem>
      ))}
    </List>
  );
};
