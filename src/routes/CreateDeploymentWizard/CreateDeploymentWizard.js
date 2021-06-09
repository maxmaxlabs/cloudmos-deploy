import { useEffect, useState } from "react";
import { makeStyles, Stepper, Step, StepButton, Card, CardHeader, CardContent, IconButton } from "@material-ui/core";
import { TemplateList } from "./TemplateList";
import { ManifestEdit } from "./ManifestEdit";
import { CreateLease } from "./CreateLease";
import { useHistory, useParams } from "react-router";
import { PrerequisiteList } from "./PrerequisiteList";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%"
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
    history.push("/");
  }

  let activeStep = 0;
  switch (step) {
    case "chooseTemplate":
      activeStep = 1;
      break;
    case "editManifest":
      activeStep = 2;
      break;
    case "acceptBids":
      activeStep = 3;
      break;
  }

  function handleStep(index) {
    console.log("handleStep: " + index);
  }

  function isStepComplete() {
    return false;
  }

  return (
    <>
      <Card variant="outlined">
        <CardHeader
          title={
            <>
              <IconButton aria-label="back" onClick={handleBackClick}>
                <ChevronLeftIcon />
              </IconButton>
              Create a new deployment
            </>
          }
        />
        <CardContent>
          <div className={classes.root}>
            <Stepper alternativeLabel activeStep={activeStep}>
              {steps.map((label, index) => {
                const stepProps = {};
                const buttonProps = {};
                return (
                  <Step key={label} {...stepProps}>
                    <StepButton onClick={() => handleStep(index)} completed={isStepComplete(index)} {...buttonProps}>
                      {label}
                    </StepButton>
                  </Step>
                );
              })}
            </Stepper>
            <div>
              {activeStep === 0 && <PrerequisiteList />}
              {activeStep === 1 && <TemplateList selectedTemplate={selectedTemplate} setSelectedTemplate={(c) => setSelectedTemplate(c)} />}
              {activeStep === 2 && <ManifestEdit editedManifest={editedManifest} setEditedManifest={setEditedManifest} />}
              {activeStep === 3 && <CreateLease dseq={dseq} editedManifest={editedManifest} />}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function getSteps() {
  return ["Checking Prerequisites", "Choose Template", "Create Deployment", "Accept Bids"];
}
