import { useState, useEffect } from "react";
import {
  makeStyles,
  Typography,
  Box,
  Paper,
  CircularProgress,
  TableHead,
  TableContainer,
  Table,
  TableRow,
  TableCell,
  TableBody,
  FormControlLabel,
  Checkbox
} from "@material-ui/core";
import Pagination from "@material-ui/lab/Pagination";
import { Link } from "react-router-dom";
import { UrlService } from "../../shared/utils/urlUtils";
import { PricePerMonth } from "../../shared/components/PricePerMonth";
import { PriceEstimateTooltip } from "../../shared/components/PriceEstimateTooltip";
import { FormattedNumber } from "react-intl";
import { uaktToAKT, getAvgCostPerMonth } from "../../shared/utils/priceUtils";
import { StatusPill } from "../../shared/components/StatusPill";

const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: "1.5rem"
  },
  flexCenter: {
    display: "flex",
    alignItems: "center"
  },
  monthlyCost: {
    marginLeft: ".5rem"
  }
}));

export function LeaseList({ leases, isLoadingLeases }) {
  const [page, setPage] = useState(1);
  const classes = useStyles();
  const [filteredLeases, setFilteredLeases] = useState(leases || []);
  const [isFilteringActive, setIsFilteringActive] = useState(false);
  const rowsPerPage = 12;
  const start = (page - 1) * rowsPerPage;
  const end = start + rowsPerPage;
  const currentPageLeases = filteredLeases.slice(start, end);
  const pageCount = Math.ceil(filteredLeases.length / rowsPerPage);

  useEffect(() => {
    if (leases) {
      let _filteredLeases = [...leases];

      if (isFilteringActive) {
        _filteredLeases = _filteredLeases.filter((x) => x.state === "active");
      }

      setFilteredLeases(_filteredLeases);
    }
  }, [leases, isFilteringActive]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const onIsActiveChange = (ev, value) => {
    setPage(1);
    setIsFilteringActive(value);
  };

  return (
    <>
      <Box paddingTop="1rem" paddingBottom=".5rem" display="flex" alignItems="center">
        <Typography variant="h5" className={classes.title}>
          Your leases
        </Typography>

        <Box marginLeft="1rem">
          <FormControlLabel control={<Checkbox checked={isFilteringActive} onChange={onIsActiveChange} color="primary" />} label="Active" />
        </Box>
      </Box>

      {isLoadingLeases && <CircularProgress />}

      {currentPageLeases?.length === 0 && !isLoadingLeases && (
        <>
          <Typography variant="body2">You have 0 {isFilteringActive ? "active" : ""} lease for this provider.</Typography>
        </>
      )}

      {currentPageLeases?.length > 0 && (
        <>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>State</TableCell>
                  <TableCell>Dseq</TableCell>
                  <TableCell>Price</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {currentPageLeases.map((lease, i) => (
                  <TableRow key={i}>
                    <TableCell component="th" scope="row">
                      <StatusPill state={lease.state} size="small" />
                    </TableCell>
                    <TableCell>
                      <Link to={UrlService.deploymentDetails(lease.dseq)}>{lease.dseq}</Link>
                    </TableCell>
                    <TableCell>
                      <div className={classes.flexCenter}>
                        <PricePerMonth perBlockValue={uaktToAKT(lease.price.amount, 6)} />
                        <PriceEstimateTooltip value={uaktToAKT(lease.price.amount, 6)} />
                        <span className={classes.monthlyCost}>
                          <FormattedNumber value={lease.price.amount} maximumSignificantDigits={18} />
                          uakt ({`~${getAvgCostPerMonth(lease.price.amount)}akt/month`})
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box padding="1rem 1rem 2rem">
            <Pagination count={pageCount} onChange={handleChangePage} page={page} size="large" />
          </Box>
        </>
      )}
    </>
  );
}
