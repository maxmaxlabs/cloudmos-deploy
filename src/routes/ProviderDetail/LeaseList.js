import React, { useState, useEffect } from "react";
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
import isEqual from "lodash/isEqual";
import { LeaseRow } from "./LeaseRow";

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

export const LeaseList = React.memo(
  function MemoLeaseList({ leases, isLoadingLeases }) {
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
        let _filteredLeases = [...leases].sort((a, b) => (a.state === "active" ? -1 : 1));

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

        {currentPageLeases?.length === 0 && isLoadingLeases && <CircularProgress />}

        {currentPageLeases?.length === 0 && !isLoadingLeases && (
          <Typography variant="body2">You have 0 {isFilteringActive ? "active" : ""} lease for this provider.</Typography>
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
                    <LeaseRow key={lease.id} lease={lease} />
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
  },
  (prevProps, nextProps) => {
    return isEqual(prevProps, nextProps);
  }
);
