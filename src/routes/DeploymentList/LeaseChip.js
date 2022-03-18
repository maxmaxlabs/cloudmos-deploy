import { useEffect, useState } from "react";
import { makeStyles, Box, Chip } from "@material-ui/core";
import { StatusPill } from "../../shared/components/StatusPill";

const useStyles = makeStyles((theme) => ({
  leaseChip: {
    height: "20px",
    marginLeft: ".5rem"
  }
}));

export const LeaseChip = ({ lease, providers }) => {
  const classes = useStyles();
  const [providerName, setProviderName] = useState(null);

  useEffect(() => {
    const providerInfo = providers?.find((p) => p.owner === lease?.provider);

    if (providerInfo) {
      const providerUri = new URL(providerInfo.host_uri);
      setProviderName(providerUri.hostname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers]);

  return (
    <Chip
      key={lease.id}
      size="small"
      className={classes.leaseChip}
      label={
        <>
          <span>
            GSEQ: <strong>{lease.gseq}</strong>
          </span>
          <Box component="span" marginLeft=".5rem">
            OSEQ: <strong>{lease.oseq}</strong>
          </Box>
          <Box component="span" marginLeft=".5rem">
            Status: <strong>{lease.state}</strong>
          </Box>

          {providerName && (
            <Box component="span" marginLeft=".5rem">
              Name: <strong>{providerName}</strong>
            </Box>
          )}
        </>
      }
      icon={<StatusPill state={lease.state} size="small" />}
    />
  );
};
