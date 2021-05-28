import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Radio from '@material-ui/core/Radio';
import IconButton from '@material-ui/core/IconButton';
import GitHubIcon from '@material-ui/icons/GitHub';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

export function TemplateList(props) {
  const classes = useStyles();

  const { selectedTemplate, setSelectedTemplate } = props;

  useEffect(() => {
    props.setIsNextDisabled(!selectedTemplate)
  }, [selectedTemplate])

  const handleToggle = (value) => () => {
    setSelectedTemplate(templates.find(t => t.code === value));
  };

  function handleGithubOpen(value) {
    window.electron.openUrl(value.githubUrl);
  }

  return (
    <>
      <List className={classes.root}>
        {templates.map((value) => {
          const labelId = `checkbox-list-label-${value.code}`;

          return (
            <ListItem key={value.code} dense button onClick={handleToggle(value.code)}>
              <ListItemIcon>
                <Radio
                  checked={selectedTemplate?.code === value.code}
                  //onChange={handleChange}
                  value={value.code}
                  name="radio-button-demo"
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value.title} secondary={value.description} />
              {value.githubUrl && (
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="github" onClick={() => handleGithubOpen(value)}>
                    <GitHubIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              )}
            </ListItem>
          );
        })}
      </List>
    </>
  )
}


const templates = [
  {
    title: "Empty",
    code: "empty",
    description: "An empty template with some basic config to get started.",
    content: ""
  },
  {
    title: "Hello-world",
    code: "hello-world",
    description: "Simple web application showing hello world.",
    githubUrl: "https://github.com/tombeynon/akash-hello-world",
    content: `---
version: "2.0"

services:
  web:
    image: tombeynon/akash-hello-world:release-v0.1.1
    expose:
      - port: 80
        as: 80
        accept:
          - akashhw.tombeynon.co.uk
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
          amount: 1

deployment:
  web:
    dcloud:
      profile: web
      count: 1`
  },
  {
    title: "Wordpress",
    code: "wordpress",
    description: "A Wordpress web application with MySQL database.",
    githubUrl: "https://github.com/tombeynon/akash-deploy/wiki/Examples#wordpress",
    content: `---
    version: "2.0"
    services:
      db:
        image: mysql/mysql-server:latest
        env:
          - MYSQL_ROOT_PASSWORD=notmypw
          - MYSQL_DATABASE=DBNAME#1
          - MYSQL_USER=DBUSER#1
          - MYSQL_PASSWORD=notmypw
        expose:
          - port: 3306
            to:
              - service: wordpress
      wordpress:
        depends-on:
          - db
        image: wordpress:latest
        env:
          - WORDPRESS_DB_HOST=db
          - WORDPRESS_DB_NAME=DBNAME#1
          - WORDPRESS_DB_USER=DBUSER#1
          - WORDPRESS_DB_PASSWORD=notmypw
          - WORDPRESS_TABLE_PREFIX=wp_
        expose:
          - port: 80
            accept:
              - YOURDOMAIN.COM
            to:
              - global: true
   
    profiles:
      compute:
        wordpress:
          resources:
            cpu:
              units: 1
            memory:
              size: 1Gi
            storage:
              size: 2Gi
        db:
          resources:
            cpu:
              units: 0.5
            memory:
              size: 512Mi
            storage:
              size: 512Mi
      placement:
        eastcoast:
          pricing:
            wordpress:
              denom: uakt
              amount: 5000
            db:
              denom: uakt
              amount: 5000
    deployment:
      wordpress:
        eastcoast:
          profile: wordpress
          count: 1
      db:
        eastcoast:
          profile: db
          count: 1`
  },
  {
    title: "Akash archive node",
    code: "akash-archie-node",
    description: "Example of how to run an Akash node on the Akash network.",
    githubUrl: "https://github.com/tombeynon/akash-archive-node",
    content: `---
    version: "2.0"
    
    services:
      akash:
        image: tombeynon/akash-archive-node:0.12.1
        env:
          - AKASH_MONIKER=my-node-name
        expose:
          - port: 8080
            as: 80
            to:
              - global: true
          - port: 26656
            to:
              - global: true
          - port: 26657
            to:
              - global: true
          - port: 1317
            to:
              - global: true
          - port: 9090
            to:
              - global: true
    
    profiles:
      compute:
        akash:
          resources:
            cpu:
              units: 1
            memory:
              size: 2Gi
            storage:
              size: 32Gi
      placement:
        dcloud:
          attributes:
            host: akash
          signedBy:
            anyOf:
              - akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63
          pricing:
            akash:
              denom: uakt
              amount: 10
    
    deployment:
      akash:
        dcloud:
          profile: akash
          count: 1`
  }
]