import { List, ListItem, ListItemText, makeStyles, ListItemIcon, IconButton, Tooltip, Button } from "@material-ui/core";
import DashboardIcon from "@material-ui/icons/Dashboard";
import CloudIcon from "@material-ui/icons/Cloud";
import SettingsIcon from "@material-ui/icons/Settings";
import CollectionsIcon from "@material-ui/icons/Collections";
import MenuOpenIcon from "@material-ui/icons/MenuOpen";
import MenuIcon from "@material-ui/icons/Menu";
import { Link, useLocation } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { accountBarHeight, statusBarHeight } from "../../shared/constants";
import clsx from "clsx";
import DnsIcon from "@material-ui/icons/Dns";

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
    minWidth: 0,
    zIndex: 100
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
  },
  toggleButton: {
    marginLeft: "-3px"
  },
  deployButtonContainer: {
    paddingLeft: "1rem",
    transition: "opacity .3s ease"
  },
  deployButton: {
    padding: "2px 10px",
    fontSize: ".75rem"
  }
}));

export const LeftNav = ({ onOpenMenuClick, isNavOpen }) => {
  const classes = useStyles();
  const location = useLocation();

  const routes = [
    { title: "Dashboard", icon: (props) => <DashboardIcon {...props} />, url: UrlService.dashboard(), activeRoutes: [UrlService.dashboard()] },
    {
      title: "Deployments",
      icon: (props) => <CloudIcon {...props} />,
      url: UrlService.deploymentList(),
      activeRoutes: [UrlService.deploymentList(), "/deployment"]
    },
    { title: "Templates", icon: (props) => <CollectionsIcon {...props} />, url: UrlService.templates(), activeRoutes: [UrlService.templates()] },
    { title: "Providers", icon: (props) => <DnsIcon {...props} />, url: UrlService.providers(), activeRoutes: [UrlService.providers()] },
    { title: "Settings", icon: (props) => <SettingsIcon {...props} />, url: UrlService.settings(), activeRoutes: [UrlService.settings()] }
  ];

  return (
    <div className={classes.root} style={{ width: isNavOpen ? drawerWidth : closedDrawerWidth }}>
      <List className={classes.list}>
        <ListItem>
          <ListItemIcon className={classes.closedListItemIcon}>
            <IconButton size="small" onClick={onOpenMenuClick} className={classes.toggleButton}>
              {isNavOpen ? <MenuOpenIcon /> : <MenuIcon />}
            </IconButton>
          </ListItemIcon>

          <ListItemText
            primary={
              <Button size="small" variant="contained" color="primary" fullWidth component={Link} to="/createDeployment" className={classes.deployButton}>
                Deploy
              </Button>
            }
            primaryTypographyProps={{
              component: "div",
              className: classes.deployButtonContainer,
              style: { opacity: isNavOpen ? 1 : 0, flex: 1 }
            }}
          />
        </ListItem>

        {routes.map((route) => {
          const isSelected = route.url === UrlService.dashboard() ? location.pathname === "/" : route.activeRoutes.some((x) => location.pathname.startsWith(x));
          const listItemIcon = (
            <ListItemIcon color="primary" className={classes.closedListItemIcon}>
              {route.icon({ color: isSelected ? "primary" : "disabled" })}
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
