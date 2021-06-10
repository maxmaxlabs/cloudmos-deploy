import { makeStyles } from "@material-ui/core";

export const useStyles = makeStyles((theme) => ({
  rawJson: {
    maxHeight: "400px",
    overflowY: "auto",
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
  rawJsonTitle: {
    marginLeft: "1rem",
    fontWeight: "bold"
  }
}));
