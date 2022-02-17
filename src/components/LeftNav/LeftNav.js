import { List, ListItem, ListItemText, makeStyles, ListItemIcon, IconButton, Tooltip } from "@material-ui/core";
import DashboardIcon from "@material-ui/icons/Dashboard";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import SettingsIcon from "@material-ui/icons/Settings";
import CollectionsIcon from "@material-ui/icons/Collections";
import MenuOpenIcon from "@material-ui/icons/MenuOpen";
import { Link, useLocation } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { accountBarHeight, statusBarHeight } from "../../shared/constants";
import clsx from "clsx";

export const closedDrawerWidth = 58;
export const drawerWidth = 200;

const useStyles = makeStyles((theme) => ({
  root: {
    flexShrink: 0,
    borderRight: "1px solid rgba(0,0,0,0.1)",
    position: "fixed",
    height: `calc(100% - ${accountBarHeight}px - ${statusBarHeight * 2}px)`,
    transition: "width .3s ease"
  },
  list: {
    padding: 0,
    overflow: "hidden"
  },
  listText: {
    marginLeft: "1.5rem",
    lineHeight: "1rem",
    transition: "opacity .3s ease"
  },
  closedListItemIcon: {
    minWidth: 0
  },
  notSelected: {
    color: theme.palette.text.secondary
  },
  selected: {
    fontWeight: "bold"
  },
  tooltip: {
    fontSize: "1rem",
    fontWeight: "normal"
  }
}));

export const LeftNav = ({ onOpenMenuClick, isNavOpen }) => {
  const classes = useStyles();
  const location = useLocation();

  const routes = [
    { title: "Dashboard", icon: (props) => <DashboardIcon {...props} />, url: UrlService.dashboard() },
    { title: "Deployments", icon: (props) => <CloudUploadIcon {...props} />, url: UrlService.deploymentList() },
    { title: "Templates", icon: (props) => <CollectionsIcon {...props} />, url: UrlService.templates() },
    { title: "Settings", icon: (props) => <SettingsIcon {...props} />, url: UrlService.settings() }
  ];

  return (
    <div className={classes.root} style={{ width: isNavOpen ? drawerWidth : closedDrawerWidth }}>
      <List className={classes.list}>
        <ListItem>
          <ListItemIcon>
            <IconButton size="small" onClick={onOpenMenuClick}>
              <MenuOpenIcon />
            </IconButton>
          </ListItemIcon>
        </ListItem>

        {routes.map((route) => {
          const isSelected = location.pathname === route.url;
          const listItemIcon = (
            <ListItemIcon color="primary" className={classes.closedListItemIcon}>
              {route.icon({ color: isSelected ? "primary" : "default" })}
            </ListItemIcon>
          );

          return (
            <ListItem button key={route.title} component={Link} to={route.url} selected={isSelected}>
              {isNavOpen ? (
                listItemIcon
              ) : (
                <Tooltip classes={{ tooltip: classes.tooltip }} arrow title={route.title} placement="right">
                  {listItemIcon}
                </Tooltip>
              )}

              <ListItemText
                primary={route.title}
                primaryTypographyProps={{
                  className: clsx(classes.listText, { [classes.selected]: isSelected, [classes.notSelected]: !isSelected }),
                  style: { opacity: isNavOpen ? 1 : 0 }
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </div>
  );
};
