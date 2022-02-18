import { Typography, Box } from "@material-ui/core";
import { syntaxHighlight } from "../../shared/utils/stringUtils";
import { useStyles } from "./DeploymentJsonViewer.styles";
import { ViewPanel } from "../../shared/components/ViewPanel";

export function DeploymentJsonViewer({ jsonObj, title }) {
  const classes = useStyles();

  const rawJson = JSON.stringify(jsonObj, null, 2);

  return (
    <div className={classes.root}>
      <Box display="flex">
        <Typography variant="h6" className={classes.title}>
          {title}
        </Typography>
      </Box>

      <ViewPanel bottomElementId="footer" overflow="auto">
        <pre className={classes.rawJson}>
          <code
            dangerouslySetInnerHTML={{
              __html: syntaxHighlight(rawJson)
            }}
          ></code>
        </pre>
      </ViewPanel>
    </div>
  );
}
