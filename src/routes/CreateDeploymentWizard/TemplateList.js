import React from "react";
import { Box, Typography, IconButton, makeStyles, List, ListItem, ListItemSecondaryAction, ListItemText, ListItemAvatar } from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";
import { useHistory } from "react-router";
import { Helmet } from "react-helmet-async";
import { UrlService } from "../../shared/utils/urlUtils";
import InsertDriveFileIcon from "@material-ui/icons/InsertDriveFile";
import CloudIcon from '@material-ui/icons/Cloud';
import DescriptionIcon from '@material-ui/icons/Description';
import CollectionsIcon from "@material-ui/icons/Collections";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper
  },
  logoItem: {
    width: "2.7rem",
    height: "2.7rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.grey[200],
    borderRadius: "50%",
    color: theme.palette.primary.main
  }
}));

export function TemplateList(props) {
  const classes = useStyles();
  const history = useHistory();
  const { setSelectedTemplate } = props;

  function handleGithubOpen(value) {
    window.electron.openUrl(value.githubUrl);
  }

  function selectTemplate(template) {
    setSelectedTemplate(template);
    history.push("/createDeployment/editManifest");
  }

  async function fromFile() {
    const fileDef = await window.electron.openTemplateFromFile();

    if (fileDef) {
      setSelectedTemplate({
        title: "From file",
        code: "from-file",
        category: "General",
        description: fileDef.path,
        content: fileDef.content
      });
      history.push("/createDeployment/editManifest");
    }
  }

  function fromGallery() {
    history.push(UrlService.templates());
  }

  return (
    <>
      <Helmet title="Create Deployment - Template List" />

      <Box padding="1rem">
        <Typography variant="h5"><strong>What do you want to deploy?</strong></Typography>
      </Box>

      <List className={classes.root}>
        <ListItem dense button onClick={() => selectTemplate(emptyTemplate)}>
          <ListItemAvatar>
            <div className={classes.logoItem}>
              <InsertDriveFileIcon />
            </div>
          </ListItemAvatar>
          <ListItemText primary={emptyTemplate.title} secondary={emptyTemplate.description} />
          {emptyTemplate.githubUrl && (
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="github" onClick={() => handleGithubOpen(emptyTemplate)}>
                <GitHubIcon />
              </IconButton>
            </ListItemSecondaryAction>
          )}
        </ListItem>
        <ListItem dense button onClick={() => selectTemplate(helloWorldTemplate)}>
          <ListItemAvatar>
            <div className={classes.logoItem}>
              <CloudIcon />
            </div>
          </ListItemAvatar>
          <ListItemText primary={helloWorldTemplate.title} secondary={helloWorldTemplate.description} />
          {helloWorldTemplate.githubUrl && (
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="github" onClick={() => handleGithubOpen(helloWorldTemplate)}>
                <GitHubIcon />
              </IconButton>
            </ListItemSecondaryAction>
          )}
        </ListItem>
        <ListItem dense button onClick={() => fromFile()}>
          <ListItemAvatar>
            <div className={classes.logoItem}>
              <DescriptionIcon />
            </div>
          </ListItemAvatar>
          <ListItemText primary="From a file" secondary="Load a deploy.yml file from the computer." />
        </ListItem>
        <ListItem dense button onClick={() => fromGallery()}>
          <ListItemAvatar>
            <div className={classes.logoItem}>
              <CollectionsIcon />
            </div>
          </ListItemAvatar>
          <ListItemText primary="Browse template gallery" secondary="Explore the template gallery for a great variety of pre-made template by the community." />
        </ListItem>
      </List>
    </>
  );
}

const emptyTemplate = {
  title: "Empty",
  code: "empty",
  category: "General",
  description: "An empty template with some basic config to get started.",
  content: ""
};
const helloWorldTemplate = {
  title: "Hello Akash World",
  code: "hello-world",
  category: "General",
  description: "Simple next.js web application showing hello world.",
  githubUrl: "https://github.com/Akashlytics/hello-akash-world",
  valuesToChange: [],
  content: `# Welcome to the Akash Network! 🚀☁
# This file is called a Stack Definition Laguage (SDL)
# SDL is a human friendly data standard for declaring deployment attributes. 
# The SDL file is a "form" to request resources from the Network. 
# SDL is compatible with the YAML standard and similar to Docker Compose files.

---
# Indicates version of Akash configuration file. Currently only "2.0" is accepted.
version: "2.0"

# The top-level services entry contains a map of workloads to be ran on the Akash deployment. Each key is a service name; values are a map containing the following keys:
# https://docs.akash.network/intro-to-akash/stack-definition-language#services
services:
  # The name of the service "web"
  web:
    # The docker container image with version. You must specify a version, the "latest" tag doesn't work.
    image: akashlytics/hello-akash-world:0.2.0
    # You can map ports here https://docs.akash.network/intro-to-akash/stack-definition-language#services.expose
    expose:
      - port: 3000
        as: 80
        to:
          - global: true

# The profiles section contains named compute and placement profiles to be used in the deployment.
# https://docs.akash.network/intro-to-akash/stack-definition-language#profiles
profiles:
  # profiles.compute is map of named compute profiles. Each profile specifies compute resources to be leased for each service instance uses uses the profile.
  # https://docs.akash.network/intro-to-akash/stack-definition-language#profiles.compute
  compute:
    # The name of the service
    web:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 512Mi

# profiles.placement is map of named datacenter profiles. Each profile specifies required datacenter attributes and pricing configuration for each compute profile that will be used within the datacenter. It also specifies optional list of signatures of which tenants expects audit of datacenter attributes.
# https://docs.akash.network/intro-to-akash/stack-definition-language#profiles.placement
  placement:
    dcloud:
      pricing:
        # The name of the service
        web:
          denom: uakt
          amount: 1000

# The deployment section defines how to deploy the services. It is a mapping of service name to deployment configuration.
# https://docs.akash.network/intro-to-akash/stack-definition-language#deployment
deployment:
  # The name of the service
  web:
    dcloud:
      profile: web
      count: 1
`
};
