import React from "react";
import { IconButton, Button, makeStyles, List, ListItem, ListItemIcon, ListSubheader, ListItemSecondaryAction, ListItemText, Radio } from "@material-ui/core";
import GitHubIcon from "@material-ui/icons/GitHub";
import { useHistory } from "react-router";
import { Helmet } from "react-helmet-async";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: theme.palette.background.paper
  }
}));

export function TemplateList(props) {
  const classes = useStyles();
  const history = useHistory();

  const { selectedTemplate, setSelectedTemplate } = props;

  const handleToggle = (value) => {
    setSelectedTemplate(templates.find((t) => t.code === value));
  };

  function handleGithubOpen(value) {
    window.electron.openUrl(value.githubUrl);
  }

  function handleNextClick() {
    history.push("/createDeployment/editManifest");
  }

  const categories = templates.map((x) => x.category).filter((value, index, self) => self.indexOf(value) === index);

  return (
    <>
      <Helmet title="Create Deployment - Template List" />

      {categories.map((category) => (
        <List key={category} className={classes.root} subheader={<ListSubheader>{category}</ListSubheader>}>
          {templates
            .filter((x) => x.category === category)
            .map((value) => {
              const labelId = `checkbox-list-label-${value.code}`;

              return (
                <ListItem key={value.code} dense button onClick={() => handleToggle(value.code)}>
                  <ListItemIcon>
                    <Radio checked={selectedTemplate?.code === value.code} value={value.code} name="radio-button-demo" />
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
      ))}

      <Button variant="contained" color="primary" disabled={!selectedTemplate} onClick={handleNextClick}>
        Continue
      </Button>
    </>
  );
}

const templates = [
  {
    title: "Empty",
    code: "empty",
    category: "General",
    description: "An empty template with some basic config to get started.",
    content: ""
  },
  {
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
    category: "General",
    description: "A Wordpress web application with MySQL database.",
    githubUrl: "https://github.com/tombeynon/akash-deploy/wiki/Examples#wordpress",
    valuesToChange: [{ field: "accept", initialValue: "YOURDOMAIN.COM" }],
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
    category: "General",
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
  },
  {
    title: "Minecraft Server",
    code: "minecraft-server",
    category: "Games",
    description: "Akash hosted multiplayer minecraft server.",
    githubUrl: "https://github.com/ChandraStation/minecraft_akash/blob/main/deploy.yml",
    content: `---
version: "2.0"

services:
  web:
    image: itzg/minecraft-server:java16-openj9
    env:
      - EULA=TRUE
      - PVP=TRUE
      - MOTD="Minecraft Servers via Akashlytics"
      - MODE=survival
      - VIEW_DISTANCE=6
      - ENABLE_COMMAND_BLOCK=true
      - ENABLE_RCON=false
      - SPAWN_PROTECTION=34
      - HARDCORE=false
      - MAX_PLAYERS=150
      - OPS=Thinny
      - DIFFICULTY=normal
      - SERVER_NAME=Akashlytics
      - MEMORY=12G
      - TYPE=PAPER
    expose:
      - port: 25565
        as: 80
        to:
          - global: true
profiles:
  compute:
    web:
      resources:
        cpu:
          units: 10
        memory:
          size: 16Gi
        storage:
          size: 50Gi
  placement:
    westcoast:
      attributes:
      pricing:
        web: 
          denom: uakt
          amount: 1000

deployment:
  web:
    westcoast:
      profile: web
      count: 1`
  },
  {
    title: "Tetris",
    code: "tetris",
    category: "Games",
    description: "Tetris (Russian: Тетрис [ˈtɛtrʲɪs]) is a tile-matching video game created by Russian software engineer Alexey Pajitnov in 1984.",
    githubUrl: "https://github.com/ovrclk/awesome-akash/tree/master/tetris",
    content: `---
version: "2.0"

services:
  web:
    image: bsord/tetris
    expose:
      - port: 80
        as: 80
        to:
          - global: true

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.1
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  placement:
    westcoast:
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
      pricing:
        web:
          denom: uakt
          amount: 1000

deployment:
  web:
    westcoast:
      profile: web
      count: 1`
  },
  {
    title: "Minesweeper",
    code: "minesweeper",
    category: "Games",
    description: "Minesweeper is a clone of one of the most popular classic game fully written on react.js.",
    githubUrl: "https://github.com/ovrclk/awesome-akash/tree/master/minesweeper",
    content: `---
version: "2.0"

services:
  minesweeper:
    image: creepto/minesweeper
    expose:
      - port: 3000
        as: 80
        to:
          - global: true
profiles:
  compute:
    minesweeper:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  placement:
    westcoast:
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
      pricing:
        minesweeper: 
          denom: uakt
          amount: 1000

deployment:
  minesweeper:
    westcoast:
      profile: minesweeper
      count: 1`
  },
  {
    title: "Snake",
    code: "snake",
    category: "Games",
    description: "A simple javascript snake game saves scores of players in database(mongoDB) and computes rank of player.",
    githubUrl: "https://github.com/ovrclk/awesome-akash/tree/master/snake-game",
    content: `---
version: "2.0"

services:
  mongo:
    image: library/mongo:latest
    expose:
      - port: 27017
        as: 27017
        to:
          - service: mongo
  snake:
    image: harish1551/snake-game:latest
    env:
      - DB_HOST=mongo
    depends_on:
      - mongo
    expose:
      - port: 8000
        as: 80
        to:
          - global: true

profiles:
  compute:
    snake:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 1G
    mongo:
      resources:
        cpu:
          units: 0.5
        memory:
          size: 512Mi
        storage:
          size: 128Mi
  placement:
    westcoast:
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
      pricing:
        snake: 
          denom: uakt
          amount: 9000
        mongo: 
          denom: uakt
          amount: 5000

deployment:
  snake:
    westcoast:
      profile: snake
      count: 1
  mongo:
    westcoast:
      profile: mongo
      count: 1`
  },
  {
    title: "Supermario",
    code: "super-mario",
    category: "Games",
    description: "The Super Mario games follow Mario's adventures, typically in the fictional Mushroom Kingdom with Mario as the player character.",
    githubUrl: "https://github.com/ovrclk/awesome-akash/tree/master/supermario",
    content: `---
version: "2.0"

services:
  web:
    image: pengbai/docker-supermario 
    expose:
      - port: 8080
        as: 80
        to:
          - global: true

profiles:
  compute:
    web:
      resources:
        cpu:
          units: 0.1
        memory:
          size: 512Mi
        storage:
          size: 512Mi
  placement:
    westcoast:
      signedBy:
        anyOf:
          - "akash1365yvmc4s7awdyj3n2sav7xfx76adc6dnmlx63"
      pricing:
        web: 
          denom: uakt
          amount: 3000

deployment:
  web:
    westcoast:
      profile: web
      count: 1
`
  }
];
