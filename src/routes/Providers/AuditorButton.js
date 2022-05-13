import { useState } from "react";
import { IconButton } from "@material-ui/core";
import SecurityIcon from "@material-ui/icons/Security";
import { AuditorsModal } from "./AuditorsModal";

export function AuditorButton({ provider }) {
  const [isViewingAuditors, setIsViewingAuditors] = useState(false);

  const onAuditorClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsViewingAuditors(true);
  };

  const onClose = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setIsViewingAuditors(false);
  };

  return (
    <>
      <IconButton onClick={onAuditorClick} size="small">
        <SecurityIcon fontSize="small" color="primary" />
      </IconButton>

      {isViewingAuditors && <AuditorsModal provider={provider} onClose={onClose} />}
    </>
  );
}
