import { useEffect, useState } from "react";
import { Box, makeStyles, Stepper, Step, StepButton, Typography, IconButton } from "@material-ui/core";
import { TemplateList } from "./TemplateList";
import { ManifestEdit } from "./ManifestEdit";
import { CreateLease } from "./CreateLease";
import { useHistory, useParams } from "react-router";
import { PrerequisiteList } from "./PrerequisiteList";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import { UrlService } from "../../shared/utils/urlUtils";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    background: theme.palette.common.white
  },
  title: {
    padding: ".5rem 1rem"
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
    width: "100%"
  },
  stepperRoot: {
    padding: "1rem 0 1.5rem"
  }
}));

export function CreateDeploymentWizard() {
  const classes = useStyles();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editedManifest, setEditedManifest] = useState(null);
  const { step, dseq } = useParams();

  const history = useHistory();
  const steps = getSteps();

  useEffect(() => {
    setEditedManifest(selectedTemplate?.content);
  }, [selectedTemplate]);

  function handleBackClick() {
    let route = "";
    switch (step) {
      case "chooseTemplate":
        route = UrlService.createDeployment();
        break;
      case "editManifest":
        route = UrlService.createDeploymentStepTemplate();
        break;
      case "acceptBids":
        route = UrlService.createDeploymentStepManifest();
        break;
      default:
        break;
    }
    history.replace(route);
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

  function isStepComplete() {
    return false;
  }

  return (
    <div className={classes.root}>
      <Box display="flex" alignItems="center" padding=".5rem 1rem">
        <IconButton aria-label="back" onClick={handleBackClick} size="small">
          <ChevronLeftIcon />
        </IconButton>
        <Box marginLeft=".5rem">
          <Typography variant="h5">Create a new deployment</Typography>
        </Box>
      </Box>

      <div className={classes.stepContainer}>
        <Stepper alternativeLabel activeStep={activeStep} classes={{ root: classes.stepperRoot }}>
          {steps.map((label, index) => {
            const stepProps = {};
            const buttonProps = {};
            return (
              <Step key={label} {...stepProps}>
                <StepButton disabled completed={isStepComplete(index)} {...buttonProps}>
                  {label}
                </StepButton>
              </Step>
            );
          })}
        </Stepper>
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

function getSteps() {
  return ["Checking Prerequisites", "Choose Template", "Create Deployment", "Accept Bids"];
}
