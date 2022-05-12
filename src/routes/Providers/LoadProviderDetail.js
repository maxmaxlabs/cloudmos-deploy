import { makeStyles, Button, Dialog, DialogContent, DialogActions, DialogTitle, CircularProgress, Box } from "@material-ui/core";
import { useEffect } from "react";
import { useProviderStatus } from "../../queries";
import { ProviderDetailContent } from "../../components/ProviderDetail/ProviderDetailContent";
import Alert from "@material-ui/lab/Alert";

const useStyles = makeStyles((theme) => ({
  content: {
    padding: "1rem"
  }
}));

export const LoadProviderDetail = ({ provider, address, onClose }) => {
  const classes = useStyles();
  const {
    data: providerStatus,
    isLoading: isLoadingStatus,
    refetch: fetchProviderStatus,
    isError
  } = useProviderStatus(provider.host_uri, {
    enabled: false,
    retry: false
  });

  useEffect(() => {
    fetchProviderStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Dialog maxWidth="xs" aria-labelledby="provider-detail-dialog-title" open={true} onClose={onClose} fullWidth>
      <DialogTitle id="provider-detail-dialog-title">Provider Details</DialogTitle>
      <DialogContent dividers className={classes.content}>
        {!isError ? (
          isLoadingStatus || !providerStatus ? (
            <Box display="flex" alignItems="center" justifyContent="center">
              <CircularProgress size="3rem" />
            </Box>
          ) : (
            <ProviderDetailContent provider={{ ...provider, ...providerStatus }} address={address} />
          )
        ) : (
          <Alert variant="outlined" severity="warning">
            Provider details not available for this provider... :(
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button autoFocus variant="contained" onClick={onClose} color="primary" size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
