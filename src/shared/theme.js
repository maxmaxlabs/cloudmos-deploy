import { createMuiTheme } from "@material-ui/core";

export const customColors = {
  lightBg: "#F5F5F5",
  green: "#47FA56",
  darkBlue: "#131129",
  darkBlue2: "#1D1933",
  brown: "#874302"
};

export const theme = createMuiTheme({
  palette: {
    background: {
      default: customColors.lightBg
    }
  },
  overrides: {
    MuiCssBaseline: {
      "@global": {
        html: {
          WebkitFontSmoothing: "auto"
        }
      }
    },
    MuiInputBase: {
      input: { padding: "10px 14px" }
    },
    MuiOutlinedInput: {
      input: { padding: "10px 14px" }
    },
    MuiInputLabel: {
      outlined: {
        transform: "translate(14px, 12px) scale(1)"
      }
    },
    MuiTooltip: {
      arrow: {
        color: "rgba(0,0,0,.85)"
      },
      tooltip: {
        backgroundColor: "rgba(0,0,0,.85)"
      }
    }
  }
});
