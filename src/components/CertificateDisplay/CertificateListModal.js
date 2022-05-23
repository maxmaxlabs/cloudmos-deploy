import {
  Button,
  makeStyles,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableCell,
  TableRow
} from "@material-ui/core";
import { useCertificate } from "../../context/CertificateProvider";
import CheckIcon from "@material-ui/icons/Check";
import { FormattedDate } from "react-intl";

const useStyles = makeStyles((theme) => ({
  label: {
    fontWeight: "bold"
  },
  dialogContent: {
    padding: "1rem"
  }
}));

export function CertificateListModal({ onClose, revokeCertificate }) {
  const classes = useStyles();
  const { validCertificates, localCert, selectedCertificate } = useCertificate();

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Certificates</DialogTitle>
      <DialogContent dividers className={classes.dialogContent}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell align="center">Selected</TableCell>
                <TableCell align="center">Local cert</TableCell>
                <TableCell align="center">Issued on</TableCell>
                <TableCell align="center">Expires</TableCell>
                <TableCell align="center">Serial</TableCell>
                <TableCell align="center"></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {validCertificates.map((cert) => (
                <TableRow key={cert.serial}>
                  <TableCell align="center">{cert.serial === selectedCertificate?.serial && <CheckIcon color="primary" />}</TableCell>
                  <TableCell align="center">{cert.parsed === localCert?.certPem && <CheckIcon color="primary" />}</TableCell>

                  <TableCell align="center">
                    <FormattedDate value={cert.pem.issuedOn} year="numeric" month="2-digit" day="2-digit" hour="2-digit" minute="2-digit" />
                  </TableCell>
                  <TableCell align="center">
                    <FormattedDate value={cert.pem.expiresOn} year="numeric" month="2-digit" day="2-digit" hour="2-digit" minute="2-digit" />
                  </TableCell>
                  <TableCell align="center">{cert.serial}</TableCell>
                  <TableCell align="center">
                    <Button onClick={() => revokeCertificate(cert)} color="secondary" size="small">
                      Revoke
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
