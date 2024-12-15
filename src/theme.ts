import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    bone: {
      main: string;
    };
    characters: {
      peri: string;
      ex: string;
      quest: string;
      curly: string;
      pence: string;
    };
  }
  interface PaletteOptions {
    bone: {
      main: string;
    };
    characters: {
      peri: string;
      ex: string;
      quest: string;
      curly: string;
      pence: string;
    };
  }
}

export const theme = createTheme({
  typography: {
    fontFamily: '"Rethink Sans", Arial, sans-serif',
    h1: {
      fontFamily: '"Punx Grotesk", Arial, sans-serif',
      fontWeight: 'normal',
    },
    h4: {
      fontFamily: '"Bookman Old Style", serif',
      fontWeight: 'normal',
    },
    subtitle1: {
      fontFamily: '"Bookman Old Style", serif',
      fontStyle: 'italic',
    },
    button: {
      fontFamily: '"Rethink Sans", Arial, sans-serif',
      fontWeight: 800,
      textTransform: 'none',
    },
    body1: {
      fontFamily: '"Rethink Sans", Arial, sans-serif',
      fontWeight: 800,
    },
    body2: {
      fontFamily: '"Rethink Sans", Arial, sans-serif',
      fontWeight: 800,
    },
  },
  palette: {
    common: {
      black: '#000000',
      white: '#FFFFFF',
    },
    bone: {
      main: '#FFFEFA',
    },
    characters: {
      peri: '#E11D21',   // Red
      ex: '#07A9D2',     // Blue
      quest: '#008F40',  // Green
      curly: '#FAC500',  // Yellow
      pence: '#FDD91C',  // Yellow
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FFFEFA', // Bone background color
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: '"Rethink Sans", Arial, sans-serif',
          fontWeight: 800,
          fontSize: '24px',
          letterSpacing: '0.07em',
          padding: '8px 24px',
          borderRadius: '8px',
          backgroundColor: '#000000',
          color: '#FFFFFF',
          '&:hover': {
            backgroundColor: '#000000',
            opacity: 0.75,
          },
        },
      },
    },
  },
});
