import { makeStyles, AppBar, Toolbar, Box, Typography, Button, Chip } from "@material-ui/core";
import YouTubeIcon from "@material-ui/icons/YouTube";
import TwitterIcon from "@material-ui/icons/Twitter";
import GitHubIcon from "@material-ui/icons/GitHub";
import { DiscordIcon } from "../../shared/components/DiscordIcon";
import { LinkTo } from "../../shared/components/LinkTo";
import { useAppVersion } from "../../hooks/useAppVersion";

const useStyles = makeStyles((theme) => ({
  root: {
    top: "auto",
    bottom: 0,
    borderTop: `1px solid ${theme.palette.grey[300]}`,
    overflow: "hidden"
  },
  toolbar: {
    minHeight: "30px",
    maxHeight: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between"
  },
  socialLinks: {
    display: "flex",
    transition: ".3s all ease",
    margin: 0,
    padding: 0,
    "& li": {
      margin: "0 .5rem",
      display: "flex",
      alignItems: "center"
    },
    "& path": {
      fill: theme.palette.common.black,
      transition: ".3s all ease"
    }
  },
  socialIcon: {
    height: "1rem",
    width: "1rem",
    display: "block",
    margin: "0 auto",
    "&:hover": {
      color: theme.palette.primary.main,
      "& path": {
        fill: theme.palette.primary.main
      }
    }
  },
  caption: {
    color: theme.palette.grey["600"],
    fontWeight: "bold",
    fontSize: ".6rem"
  },
  betaChip: {
    height: "12px",
    fontSize: "10px",
    fontWeight: "bold",
    marginLeft: ".5rem"
  },
  akashLink: {
    marginLeft: "1rem"
  },
  akashImage: {
    height: "20px"
  }
}));

export const Footer = () => {
  const classes = useStyles();
  const { appVersion } = useAppVersion();

  return (
    <AppBar position="fixed" color="default" elevation={0} component="footer" className={classes.root} id="footer">
      <Toolbar variant="dense" className={classes.toolbar}>
        <Box display="flex" alignItems="center">
          {appVersion && (
            <>
              <Typography variant="caption" className={classes.caption}>
                <strong>v{appVersion}</strong>
              </Typography>

              <Chip label="beta" color="secondary" size="small" className={classes.betaChip} />
            </>
          )}

          <LinkTo onClick={() => window.electron.openUrl("https://akash.network")} className={classes.akashLink}>
            <img src="./images/powered-by-akash.svg" alt="Akashlytics Logo" className={classes.akashImage} />
          </LinkTo>
        </Box>

        <Box display="flex" alignItems="center">
          <Box marginRight="1rem">
            <Button
              onClick={() => window.electron.openUrl("https://www.mintscan.io/akash/validators/akashvaloper14mt78hz73d9tdwpdvkd59ne9509kxw8yj7qy8f")}
              size="small"
            >
              <Typography variant="caption" className={classes.caption}>
                Validator
              </Typography>
            </Button>
          </Box>

          <ul className={classes.socialLinks}>
            <li>
              <LinkTo onClick={() => window.electron.openUrl("https://discord.gg/rXDFNYnFwv")} className={classes.socialLink}>
                <DiscordIcon className={classes.socialIcon} />
              </LinkTo>
            </li>
            <li>
              <LinkTo
                onClick={() => window.electron.openUrl("https://www.youtube.com/channel/UC1rgl1y8mtcQoa9R_RWO0UA?sub_confirmation=1")}
                className={classes.socialLink}
              >
                <YouTubeIcon className={classes.socialIcon} />
              </LinkTo>
            </li>
            <li>
              <LinkTo onClick={() => window.electron.openUrl("https://twitter.com/akashlytics")} className={classes.socialLink}>
                <TwitterIcon className={classes.socialIcon} />
              </LinkTo>
            </li>
            <li>
              <LinkTo onClick={() => window.electron.openUrl("https://github.com/Akashlytics/akashlytics-deploy")} className={classes.socialLink}>
                <GitHubIcon className={classes.socialIcon} />
              </LinkTo>
            </li>
          </ul>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
