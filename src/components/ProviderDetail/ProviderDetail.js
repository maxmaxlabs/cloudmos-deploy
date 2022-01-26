import {
  makeStyles,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Box,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Typography
} from "@material-ui/core";
import { Address } from "../../shared/components/Address";
import { SpecDetail } from "../../shared/components/SpecDetail";
import { roundDecimal } from "../../shared/utils/math";
import { getTotalProviderResource } from "../../shared/utils/providerUtils";

const useStyles = makeStyles((theme) => ({
  content: {
    padding: "1rem"
  }
}));

export const ProviderDetail = ({ provider, address, onClose }) => {
  const classes = useStyles();
  const activeResources = getTotalProviderResource(provider.active);
  const availableResources = getTotalProviderResource(provider.available);
  const pendingResources = getTotalProviderResource(provider.pending);

  return (
    <Dialog maxWidth="xs" aria-labelledby="provider-detail-dialog-title" open={true} onClose={onClose}>
      <DialogTitle id="provider-detail-dialog-title">Provider Details</DialogTitle>
      <DialogContent dividers className={classes.content}>
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} size="small">
            <TableBody>
              <TableRow>
                <TableCell component="th" scope="row">
                  <strong>Name</strong>
                </TableCell>
                <TableCell align="center">{provider.name}</TableCell>
              </TableRow>
              {address && (
                <TableRow>
                  <TableCell component="th" scope="row">
                    <strong>Address</strong>
                  </TableCell>
                  <TableCell align="center">
                    <Address address={address} isCopyable />
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell component="th" scope="row">
                  <strong>Orders</strong>
                </TableCell>
                <TableCell align="center">{provider.orderCount}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  <strong>Deployments</strong>
                </TableCell>
                <TableCell align="center">{provider.deploymentCount}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" scope="row">
                  <strong>Leases</strong>
                </TableCell>
                <TableCell align="center">{provider.leaseCount}</TableCell>
              </TableRow>

              {provider.error && (
                <TableRow>
                  <TableCell component="th" scope="row">
                    <strong>Error</strong>
                  </TableCell>
                  <TableCell align="center">{provider.error}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box marginTop="1rem">
          <Box marginBottom={1}>
            <Typography variant="body2">
              <strong>Available resources</strong>
            </Typography>
          </Box>
          <SpecDetail
            cpuAmount={roundDecimal(availableResources.cpu)}
            memoryAmount={availableResources.memory}
            storageAmount={availableResources.storage}
            size="medium"
            color="primary"
          />
        </Box>

        <Box marginTop="1rem">
          <Box marginBottom={1}>
            <Typography variant="body2">
              <strong>Active resources</strong>
            </Typography>
          </Box>
          <SpecDetail
            cpuAmount={roundDecimal(activeResources.cpu)}
            memoryAmount={activeResources.memory}
            storageAmount={activeResources.storage}
            size="small"
            color="default"
          />
        </Box>

        <Box marginTop="1rem">
          <Box marginBottom={1}>
            <Typography variant="body2">
              <strong>Pending resources</strong>
            </Typography>
          </Box>
          <SpecDetail
            cpuAmount={roundDecimal(pendingResources.cpu)}
            memoryAmount={pendingResources.memory}
            storageAmount={pendingResources.storage}
            size="small"
            color="default"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button autoFocus variant="contained" onClick={onClose} color="primary" size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
