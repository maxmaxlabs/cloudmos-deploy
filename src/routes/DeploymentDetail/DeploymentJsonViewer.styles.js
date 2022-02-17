import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  root: {
    flexBasis: "50%",
    overflow: "auto"
  },
  rawJson: {
    border: "1px solid #f3f3f3",
    padding: "1rem",
    "& .string": {
      color: "green"
    },
    "& .number": {
      color: "darkorange"
    },
    "& .boolean": {
      color: "blue"
    },
    "& .null": {
      color: "magenta"
    },
    "& .key": {
      color: "red"
    }
  },
  title: {
    fontWeight: "bold",
    marginLeft: ".5rem"
  }
}));
