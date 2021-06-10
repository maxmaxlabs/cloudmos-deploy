import { Typography, Box } from "@material-ui/core";
import { syntaxHighlight } from "../../shared/utils/stringUtils";
import { useStyles } from "./DeploymentJsonViewer.styles";

export function DeploymentJsonViewer({ jsonObj, title }) {
  const classes = useStyles();

  const rawJson = JSON.stringify(jsonObj, null, 2);

  return (
    <Box>
      <Box display="flex">
        <Typography variant="h6" className={classes.title}>
          {title}
        </Typography>
      </Box>

      <pre className={classes.rawJson}>
        <code
          dangerouslySetInnerHTML={{
            __html: syntaxHighlight(rawJson)
          }}
        ></code>
      </pre>
    </Box>
  );
}
