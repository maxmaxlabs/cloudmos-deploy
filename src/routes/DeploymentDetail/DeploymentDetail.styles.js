import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    "& .MuiListItemText-secondary .MuiSvgIcon-root:not(:first-child)": {
      marginLeft: "5px"
    },
    "& .MuiListItemText-secondary .MuiSvgIcon-root": {
      fontSize: "20px"
    }
  },
  cardTitle: {
    display: "flex"
  },
  tabsRoot: {
    minHeight: "36px",
    borderBottom: `1px solid ${theme.palette.grey[300]}`,
    backgroundColor: theme.palette.grey[200],
    "& button": {
      minHeight: "36px"
    }
  },
  selectedTab: {
    fontWeight: "bold"
  }
}));
