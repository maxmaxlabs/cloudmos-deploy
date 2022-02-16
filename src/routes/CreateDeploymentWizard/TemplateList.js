import React from "react";
import { IconButton, makeStyles, List, ListItem, ListSubheader, ListItemSecondaryAction, ListItemText } from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";
import { useHistory } from "react-router";
import { Helmet } from "react-helmet-async";
import { UrlService } from "../../shared/utils/urlUtils";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper
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
      <List className={classes.root} subheader={<ListSubheader>What do you want to deploy?</ListSubheader>}>
        <ListItem dense button onClick={() => selectTemplate(emptyTemplate)}>
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
          <ListItemText primary="From a file" secondary="Load a deploy.yml file from the computer." />
        </ListItem>
        <ListItem dense button onClick={() => fromGallery()}>
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
  title: "Hello-world",
  code: "hello-world",
  category: "General",
  description: "Simple web application showing hello world.",
  githubUrl: "https://github.com/tombeynon/akash-hello-world",
  valuesToChange: [{ field: "accept", initialValue: "www.yourwebsite.com" }],
  content: `---
version: "2.0"

services:
  web:
    image: tombeynon/akash-hello-world:release-v0.1.1
    expose:
      - port: 80
        as: 80
        accept:
          - www.yourwebsite.com
        to:
          - global: true

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  placement:
    dcloud:
      attributes:
        host: akash
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
      pricing:
        web:
          denom: uakt
          amount: 100

deployment:
  web:
    dcloud:
      profile: web
      count: 1`
};
