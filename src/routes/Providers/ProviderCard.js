import { makeStyles, Grid, Paper } from "@material-ui/core";
import { ProviderSummary } from "./ProviderSummary";
import { useHistory } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    padding: ".5rem",
    borderRadius: ".3rem",
    cursor: "pointer",
    transition: "background-color .2s ease",
    "&:hover": {
      backgroundColor: theme.palette.grey[200]
    }
  },
}));

export function ProviderCard({ provider, favoriteProviders, setFavoriteProviders, leases }) {
  const classes = useStyles();
  const history = useHistory();

  const cardClick = () => {
    history.push(UrlService.providerDetail(provider.owner))
  }

  return (
    <Grid item xs={12}>
      <Paper elevation={1} className={classes.root} onClick={cardClick}>
        <ProviderSummary provider={provider} favoriteProviders={favoriteProviders} setFavoriteProviders={setFavoriteProviders} leases={leases} />
      </Paper>
    </Grid >
  );
}
