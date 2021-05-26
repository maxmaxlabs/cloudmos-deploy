import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Radio from '@material-ui/core/Radio';
import IconButton from '@material-ui/core/IconButton';
import CommentIcon from '@material-ui/icons/Comment';
import GitHubIcon from '@material-ui/icons/GitHub';


const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

const templates = [
  {
    title: "Empty",
    code: "empty",
    description: "An empty template with some basic config to get started."
  },
  {
    title: "Hello-world",
    code: "hello-world",
    description: "Simple web application showing hello world.",
    githubUrl: "https://github.com/tombeynon/akash-hello-world"
  },
  {
    title: "Wordpress",
    code: "wordpress",
    description: "A Wordpress web application with MySQL database.",
    githubUrl: "https://github.com/tombeynon/akash-deploy/wiki/Examples#wordpress"
  },
  {
    title: "Akash archive node",
    code: "akash-archie-node",
    description: "",
    githubUrl: "https://github.com/tombeynon/akash-archive-node"
  }
]

export function TemplateList(props) {
  const classes = useStyles();
  const [selected, setSelected] = React.useState(null);

  const handleToggle = (value) => () => {
    setSelected(value);
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
            <ListItem key={value.code} role={undefined} dense button onClick={handleToggle(value.code)}>
              <ListItemIcon>
                <Radio
                  checked={selected === value.code}
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