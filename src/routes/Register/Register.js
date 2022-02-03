import { makeStyles, Container, Button } from "@material-ui/core";
import { Link } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { TitleLogo } from "../../shared/components/TitleLogo";

const useStyles = makeStyles((theme) => ({
  root: { padding: "5% 0" },
  title: {
    fontWeight: "bold",
    fontSize: "3rem",
    textAlign: "center"
  },
  spacing: {
    marginBottom: "1rem"
  },
  container: {
    paddingTop: "5rem",
    display: "flex",
    flexDirection: "column"
  }
}));

export function Register() {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <TitleLogo />

      <Container maxWidth="xs" className={classes.container}>
        <Button className={classes.spacing} variant="outlined" component={Link} to={UrlService.newWallet()} color="primary">
          Create new account
        </Button>
        <Button className={classes.spacing} variant="outlined" component={Link} to={UrlService.walletImport()} color="primary">
          Import existing account
        </Button>
      </Container>
    </div>
  );
}
