import React from 'react'
import {
  CssBaseline,
} from '@material-ui/core'
import { createMuiTheme } from '@material-ui/core/styles'
import { ThemeProvider } from '@material-ui/styles'

import WildlifeReportForm from './WildlifeReportForm'

const theme = createMuiTheme({
  // palette: {
  //   secondary: {
  //     main: green[500],
  //   },
  // },
})

export default () => (
  <>
    <CssBaseline>
      <ThemeProvider theme={theme}>
        <WildlifeReportForm />
      </ThemeProvider>
    </CssBaseline>
  </>
)
