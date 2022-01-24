import { Box, CircularProgress, Typography } from "@material-ui/core";
import { useSettings } from "./context/SettingsProvider";
import { AutoUpdater } from "./components/AutoUpdater";
import { AppContainer } from "./AppContainer";

export const AppSettingsContainer = () => {
  const { isLoadingSettings } = useSettings();

  return (
    <>
      <AutoUpdater />

      {isLoadingSettings ? (
        <Box display="flex" alignItems="center" justifyContent="center" height="100%" width="100%" flexDirection="column">
          <Box paddingBottom="1rem">
            <CircularProgress size="3rem" />
          </Box>
          <div>
            <Typography variant="h5">Loading settings...</Typography>
          </div>
        </Box>
      ) : (
        <AppContainer />
      )}
    </>
  );
};
