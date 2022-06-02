import { makeStyles, Container, Button, Box, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { TitleLogo } from "../../shared/components/TitleLogo";
import { Layout } from "../../shared/components/Layout";
import { LinkTo } from "../../shared/components/LinkTo";
import { useHistory } from "react-router-dom";
import { useQueryParams } from "../../hooks/useQueryParams";

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
  const queryParams = useQueryParams();
  const isAddAccount = !!queryParams.get("add");
  const history = useHistory();

  return (
    <Layout>
      <div className={classes.root}>
        <TitleLogo />

        <Container maxWidth="xs" className={classes.container}>
          {isAddAccount && (
            <Box display="flex" alignItems="center" justifyContent="space-between" marginBottom="1rem">
              <LinkTo onClick={() => history.goBack()}>Back</LinkTo>
              <Typography variant="h6">
                Add account
              </Typography>
            </Box>
          )}

          <Button className={classes.spacing} variant="outlined" component={Link} to={UrlService.newWallet(isAddAccount)} color="primary">
            Create new account
          </Button>
          <Button className={classes.spacing} variant="outlined" component={Link} to={UrlService.walletImport(isAddAccount)} color="primary">
            Import existing account
          </Button>

          <Box marginTop="1rem" textAlign="center">
            <Typography variant="caption" color="textSecondary">
              All sensitive information is stored only on your device.
            </Typography>
          </Box>
        </Container>
      </div>
    </Layout>
  );
}
