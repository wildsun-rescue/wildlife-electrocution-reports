import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    display: 'grid',
    gridTemplateRows: 'auto max-content',
    marginLeft: theme.spacing(6),
    marginRight: theme.spacing(6),
  },
  logo: {
    height: '20vh',
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'block',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(6),
  },
  content: {
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
  photosDialogContent: {
    width: '100%',
  },
  photoPreviewRow: {
    display: 'flex',
  },
  photoPreview: {
    width: 150,
    height: 150,
    marginRight: theme.spacing(2),
    border: '2px solid transparent',
    outline: '1px solid #999',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    backgroundSize: 'contain',
    backgroundColor: 'black',
  },
  camera: {
    '& .react-html5-camera-photo > video, .react-html5-camera-photo > img': {
      width: 'inherit',
      height: '40vh',
    },
  },
  photosDone: {
    height: '40vh',
    display: 'grid',
    gridTemplateRows: 'max-content max-content max-content',
    placeItems: 'center',
    gridColumnGap: theme.spacing(2),
    placeContent: 'center',
  },
  textFieldsHeader: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(-2),
  },
  textFieldsSection: {
  },
  ajaxError: {
    marginTop: theme.spacing(4),
    color: 'red',
  },
  buttons: {
    // justifySelf: 'right',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
  },
  button: {
    // marginLeft: theme.spacing(1),
  },
  thankYouPage: {
    textAlign: 'center',
  },
  thankYou: {
    marginBottom: theme.spacing(4),
  },
}), { withTheme: true })

export default useStyles
