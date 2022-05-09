import { makeStyles, Box, TableContainer, Table, TableRow, TableCell, TableBody, Paper, Typography, Tooltip } from "@material-ui/core";
import { Address } from "../../shared/components/Address";
import { SpecDetail } from "../../shared/components/SpecDetail";
import { roundDecimal } from "../../shared/utils/math";
import { getTotalProviderResource } from "../../shared/utils/providerUtils";
import InfoIcon from "@material-ui/icons/Info";
import clsx from "clsx";
import { ProviderAttributes } from "../../shared/components/ProviderAttributes";

const useStyles = makeStyles((theme) => ({
  tooltip: {
    fontSize: "1rem",
    padding: ".5rem"
  },
  tooltipIcon: {
    fontSize: "1rem",
    color: theme.palette.text.secondary
  },
  marginLeft: {
    marginLeft: ".5rem"
  }
}));

export const ProviderDetailContent = ({ provider, address }) => {
  const classes = useStyles();
  const activeResources = getTotalProviderResource(provider.active);
  const availableResources = getTotalProviderResource(provider.available);
  const pendingResources = getTotalProviderResource(provider.pending);

  return (
    <>
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
                <strong>Email</strong>
              </TableCell>
              <TableCell align="center">{provider.email}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row">
                <strong>Website</strong>
              </TableCell>
              <TableCell align="center">{provider.website}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row">
                <strong>Akash version</strong>
              </TableCell>
              <TableCell align="center">{provider.akash?.version || "< 0.16.0"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row">
                <strong>Kube version</strong>
              </TableCell>
              <TableCell align="center">{provider.kube ? `${provider.kube?.major}.${provider.kube?.minor}` : "unkown"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell component="th" scope="row">
                <strong>Platform</strong>
              </TableCell>
              <TableCell align="center">{provider.kube?.platform || "unkown"}</TableCell>
            </TableRow>
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
            <strong>Immediately available resources</strong>
          </Typography>
        </Box>
        <SpecDetail
          cpuAmount={roundDecimal(availableResources.cpu - pendingResources.cpu)}
          memoryAmount={availableResources.memory - pendingResources.memory}
          storageAmount={availableResources.storage - pendingResources.storage}
          size="medium"
          color="primary"
        />
      </Box>

      <Box marginTop="1rem">
        <Box marginBottom={1}>
          <Typography variant="body2">
            <Box component="strong" display="flex" alignItems="center">
              Available resources{" "}
              <Tooltip
                classes={{ tooltip: classes.tooltip }}
                arrow
                interactive
                title="Some of these resources might not be available right away because there might be open bids that haven't timed out yet."
              >
                <InfoIcon className={clsx(classes.tooltipIcon, classes.marginLeft)} />
              </Tooltip>
            </Box>
          </Typography>
        </Box>
        <SpecDetail
          cpuAmount={roundDecimal(availableResources.cpu)}
          memoryAmount={availableResources.memory}
          storageAmount={availableResources.storage}
          size="small"
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

      <Box marginTop="1rem">
        <ProviderAttributes provider={provider} />
      </Box>
    </>
  );
};
