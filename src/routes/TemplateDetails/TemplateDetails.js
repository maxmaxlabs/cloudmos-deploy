import { useState } from "react";
import { Box, Tabs, Button, Tab, makeStyles, Typography, IconButton } from "@material-ui/core";
import PublishIcon from "@material-ui/icons/Publish";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import GitHubIcon from "@material-ui/icons/GitHub";
import { useParams, useHistory } from "react-router";
import { Link } from "react-router-dom";
import { useTemplates } from "../../context/TemplatesProvider";
import MonacoEditor from "react-monaco-editor";
import ReactMarkdown from "react-markdown";
import { UrlService } from "../../shared/utils/urlUtils";
import { Helmet } from "react-helmet-async";
import { ViewPanel } from "../../shared/components/ViewPanel";
import { monacoOptions } from "../../shared/constants";

const useStyles = makeStyles((theme) => ({
  root: {
    "& img": {
      maxWidth: "100%"
    }
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginLeft: ".5rem"
  },
  titleContainer: {
    display: "flex",
    padding: "1rem"
  },
  deployBtn: {
    marginLeft: "auto"
  }
}));

export function TemplateDetails() {
  const [activeTab, setActiveTab] = useState("README");
  const { templatePath } = useParams();
  const { getTemplateByPath } = useTemplates();
  const history = useHistory();
  const classes = useStyles();
  const template = getTemplateByPath(templatePath);

  function handleBackClick() {
    history.push(UrlService.templates());
  }

  function handleOpenGithub() {
    window.electron.openUrl(template.githubUrl);
  }

  return (
    <Box className={classes.root}>
      <Helmet title="Deployment Detail" />

      <Box className={classes.titleContainer}>
        <Box display="flex" alignItems="center">
          <IconButton aria-label="back" onClick={handleBackClick}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h3" className={classes.title}>
            {template.name}
          </Typography>

          <Box marginLeft="1rem">
            <IconButton aria-label="View on github" title="View on Github" onClick={handleOpenGithub} size="small">
              <GitHubIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Button
          className={classes.deployBtn}
          variant="contained"
          size="medium"
          color="primary"
          component={Link}
          to={UrlService.createDeploymentFromTemplate(template.path)}
        >
          <PublishIcon />
          &nbsp;Deploy
        </Button>
      </Box>

      <Tabs value={activeTab} onChange={(ev, value) => setActiveTab(value)} indicatorColor="primary" textColor="primary">
        <Tab value="README" label="README" />
        <Tab value="SDL" label="SDL" />
        {template.guide && <Tab value="GUIDE" label="GUIDE" />}
      </Tabs>

      {activeTab === "README" && (
        <ViewPanel bottomElementId="footer" overflow="auto" padding="1rem">
          <ReactMarkdown linkTarget="_blank">{template.readme}</ReactMarkdown>
        </ViewPanel>
      )}
      {activeTab === "SDL" && (
        <ViewPanel bottomElementId="footer" overflow="hidden">
          <MonacoEditor height="100%" language="yaml" theme="vs-dark" value={template.deploy} options={monacoOptions} />
        </ViewPanel>
      )}
      {activeTab === "GUIDE" && (
        <ViewPanel bottomElementId="footer" overflow="auto" padding="1rem">
          <ReactMarkdown linkTarget="_blank">{template.guide}</ReactMarkdown>
        </ViewPanel>
      )}
    </Box>
  );
}
