import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'grid',
    gridTemplateRows: 'auto max-content',
  },
  content: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  introduction: {
    // marginBottom: theme.spacing(2),
  },
  fieldLabel: {
    marginTop: theme.spacing(4),
  },
  mapPlaceholder: {
    height: '50vh',
    display: 'grid',
    placeItems: 'center',
    gridTemplateRows: 'max-content max-content',
    placeContent: 'center',
    background: '#DDD',
  },
  map: {
    height: '50vh',
    width: '50vw',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      width: '80vw',
    },
  },
  photoButton: {
    marginBottom: theme.spacing(2),
  },
  camera: {
    width: 300,
    height: 300,
  },
  textFieldsHeader: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(-2),
  },
  textFieldsSection: {
  },
  buttons: {
    // justifySelf: 'right',
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
  },
  button: {
    // marginLeft: theme.spacing(1),
  },
}), { withTheme: true })

export default useStyles
