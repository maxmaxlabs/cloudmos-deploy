import { useEffect, useState } from "react";
import { Box, makeStyles, IconButton } from "@material-ui/core";
import { TemplateList } from "./TemplateList";
import { ManifestEdit } from "./ManifestEdit";
import { CreateLease } from "./CreateLease";
import { useHistory, useParams } from "react-router";
import { PrerequisiteList } from "./PrerequisiteList";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { UrlService } from "../../shared/utils/urlUtils";
import { CustomizedSteppers } from "./Stepper";

const steps = ["Checking Prerequisites", "Choose Template", "Create Deployment", "Choose providers"];

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    background: theme.palette.common.white
  },
  title: {
    padding: "4px 1rem"
  },
  button: {
    marginRight: theme.spacing(1)
  },
  backButton: {
    marginRight: theme.spacing(1)
  },
  completed: {
    display: "inline-block"
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  },
  stepContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center"
  },
  stepperRoot: {
    padding: "1rem 0 1.5rem"
  },
  stepLabel: {
    marginTop: "4px"
  }
}));

export function CreateDeploymentWizard() {
  const classes = useStyles();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editedManifest, setEditedManifest] = useState(null);
  const { step, dseq } = useParams();

  const history = useHistory();

  useEffect(() => {
    setEditedManifest(selectedTemplate?.content);
  }, [selectedTemplate]);

  function handleBackClick() {
    let route = "";
    switch (step) {
      case "editManifest":
        route = UrlService.createDeploymentStepTemplate();
        break;
      case "acceptBids":
        route = UrlService.createDeploymentStepManifest();
        break;
      default:
        break;
    }

    if (route) {
      history.replace(route);
    } else {
      history.goBack();
    }
  }

  let activeStep = getStepIndexByParam(step);

  function getStepIndexByParam(step) {
    switch (step) {
      case "chooseTemplate":
        return 1;
      case "editManifest":
        return 2;
      case "acceptBids":
        return 3;
      default:
        return 0;
    }
  }

  return (
    <div className={classes.root}>
      <div className={classes.stepContainer}>
        <Box padding="1rem 0 1rem .5rem">
          <IconButton aria-label="back" onClick={handleBackClick} size="medium">
            <ChevronLeftIcon />
          </IconButton>
        </Box>

        <CustomizedSteppers steps={steps} activeStep={activeStep} />
      </div>

      <div>
        {activeStep === 0 && <PrerequisiteList selectedTemplate={selectedTemplate} setSelectedTemplate={(c) => setSelectedTemplate(c)} />}
        {activeStep === 1 && <TemplateList selectedTemplate={selectedTemplate} setSelectedTemplate={(c) => setSelectedTemplate(c)} />}
        {activeStep === 2 && <ManifestEdit selectedTemplate={selectedTemplate} editedManifest={editedManifest} setEditedManifest={setEditedManifest} />}
        {activeStep === 3 && <CreateLease dseq={dseq} editedManifest={editedManifest} />}
      </div>
    </div>
  );
}
