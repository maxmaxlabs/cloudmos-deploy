import { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepButton from '@material-ui/core/StepButton';
import Typography from '@material-ui/core/Typography';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import {
  Card,
  CardHeader,
  CardContent,
  IconButton
} from "@material-ui/core";
import { TemplateList } from "./TemplateList";
import { ManifestEdit } from "./ManifestEdit";
import { CreateLease } from "./CreateLease";
import { useHistory } from "react-router";
import { PrerequisiteList } from "./PrerequisiteList";

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  button: {
    marginRight: theme.spacing(1),
  },
  backButton: {
    marginRight: theme.spacing(1),
  },
  completed: {
    display: 'inline-block',
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

export function CreateDeploymentWizard(props) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(new Set());
  const [isNextDisabled, setIsNextDisabled] = useState(true);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editedManifest, setEditedManifest] = useState(null);

  const history = useHistory();
  const steps = getSteps();

  const { address, selectedWallet } = props;

  useEffect(() => {
    setEditedManifest(selectedTemplate?.content);
  }, [selectedTemplate])

  const totalSteps = () => {
    return getSteps().length;
  };

  const completedSteps = () => {
    return completed.size;
  };

  const allStepsCompleted = () => {
    return completedSteps() === totalSteps();
  };

  const isLastStep = () => {
    return activeStep === totalSteps() - 1;
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStep = (step) => () => {
    setActiveStep(step);
  };

  const handleComplete = () => {
    const newCompleted = new Set(completed);
    newCompleted.add(activeStep);
    setCompleted(newCompleted);

    if (completed.size !== totalSteps()) {
      handleNext();
    }
  };

  function isStepComplete(step) {
    return completed.has(step);
  }

  function handleBackClick() {
    history.push("/");
  }

  return (
    <>
      <Card variant="outlined">
        <CardHeader title={<>
          <IconButton aria-label="back" onClick={handleBackClick}>
            <ChevronLeftIcon />
          </IconButton>
          Create a new deployment
         </>} />
        <CardContent>
          <div className={classes.root}>
            <Stepper alternativeLabel activeStep={activeStep}>
              {steps.map((label, index) => {
                const stepProps = {};
                const buttonProps = {};
                return (
                  <Step key={label} {...stepProps}>
                    <StepButton
                      onClick={handleStep(index)}
                      completed={isStepComplete(index)}
                      {...buttonProps}
                    >
                      {label}
                    </StepButton>
                  </Step>
                );
              })}
            </Stepper>
            <div>
              {activeStep === 0 && <PrerequisiteList handleNext={handleComplete} refreshBalance={props.refreshBalance} />}
              {activeStep === 1 && <TemplateList handleNext={handleComplete} selectedTemplate={selectedTemplate} setSelectedTemplate={c => setSelectedTemplate(c)} />}
              {activeStep === 2 && <ManifestEdit handleNext={handleComplete} setIsNextDisabled={setIsNextDisabled} editedManifest={editedManifest} setEditedManifest={setEditedManifest} />}
              {activeStep === 3 && <CreateLease handleNext={handleComplete} dseq={"1136891"} address={address} selectedWallet={selectedWallet} />}
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

function getSteps() {
  return ['Checking Prerequisites', 'Choose Template', 'Create Deployment', 'Create a Lease'];
}