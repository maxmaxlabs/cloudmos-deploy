import CloseIcon from "@material-ui/icons/Close";
import { RAW_JSON_DEPLOYMENT, RAW_JSON_LEASES } from "../../shared/constants";
import { Button, Typography, Box } from "@material-ui/core";
import { syntaxHighlight } from "../../shared/utils/stringUtils";
import { useStyles } from "./DeploymentJsonViewer.styles";

export function DeploymentJsonViewer({ deployment, leases, setShownRawJson, shownRawJson }) {
  const classes = useStyles();

  const getRawJson = (json) => {
    let value;

    switch (json) {
      case RAW_JSON_DEPLOYMENT:
        value = deployment;
        break;
      case RAW_JSON_LEASES:
        value = leases;
        break;
    }

    return JSON.stringify(value, null, 2);
  };

  const getRawJsonTitle = (json) => {
    let title = "";

    switch (json) {
      case RAW_JSON_DEPLOYMENT:
        title = "Deployment JSON";
        break;
      case RAW_JSON_LEASES:
        title = "Leases JSON";
        break;
    }

    return title;
  };

  return (
    <Box>
      <Box display="flex">
        <Button variant="contained" color="primary" onClick={() => setShownRawJson(null)} startIcon={<CloseIcon />}>
          Close
        </Button>

        <Typography variant="h6" className={classes.rawJsonTitle}>
          {getRawJsonTitle(shownRawJson)}
        </Typography>
      </Box>

      <pre className={classes.rawJson}>
        <code
          dangerouslySetInnerHTML={{
            __html: syntaxHighlight(getRawJson(shownRawJson))
          }}
        ></code>
      </pre>
    </Box>
  );
}
