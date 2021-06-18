import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  tabContent: {
    padding: 0,
    height: 500,
    overflowY: "hidden",
    display: "flex",
    flexDirection: "column"
  },
  badge: {
    right: "-1rem",
    top: "50%",
    fontSize: ".5rem",
    height: ".9rem",
    fontWeight: "bold"
  },
  label: { fontSize: ".9rem", fontWeight: "bold" },
  tabPanel: { overflowY: "auto", padding: ".5rem" },
  messages: {
    maxHeight: 100,
    overflowY: "auto"
  },
  messagesData: {
    overflowX: "auto",
    whiteSpace: "pre",
    overflowWrap: "break-word",
    fontSize: ".9rem"
  },
  fullWidth: {
    width: "100%"
  },
  feeButton: {
    flexGrow: 1,
    flexBasis: "33.333333%"
  },
  feeButtonLabel: {
    display: "block",
    lineHeight: "1rem",
    padding: ".5rem 0"
  },
  feeButtonLabelAmount: {
    fontSize: ".8rem",
    color: "grey", // TODO Theme
    fontWeight: "lighter",
    paddingTop: 4
  },
  textWhite: {
    color: "#ffffff"
  },
  setGasLink: {
    display: "flex",
    justifyContent: "flex-end",
    padding: "2px",
    paddingBottom: "1rem",
    fontSize: ".9rem",
    fontWeight: "bold"
  },
  actionButton: {
    flexGrow: 1,
    flexBasis: "50%"
  }
}));
