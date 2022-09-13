/* eslint-disable no-console */
import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { API_BASE_URL } from 'src/config';
import { useSnackbar } from 'notistack';
import axios from "axios";
import PropTypes from 'prop-types';
import clsx from 'clsx';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography,
  makeStyles
} from '@material-ui/core';
import { updateProfile } from 'src/actions/accountActions';
// import { updateAvatar } from 'src/actions/accountActions';
import { setAvatar } from 'src/actions/accountActions';
import authService from 'src/services/authService';
export const UPDATE_PROFILE = '@account/update-profile';
const useStyles = makeStyles((theme) => ({
  root: {},
  name: {
    marginTop: theme.spacing(1)
  },
  avatar: {
    height: 100,
    width: 100,
    '&:hover': {
      boxShadow: 'none',
      backgroundColor: '#bdbdbd',
      cursor: 'pointer',
    }
  }
}));

function ProfileDetails({ user, className, ...rest }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isFilePicked, setIsFilePicked] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const form = useRef(null);
  const [avatarHover, setAvatarHover] = useState(false);
  const avatarInputFile = useRef(null);
  const formSubmit = useRef(null);
  const account = useSelector((state) => state.account);

  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files);
    setIsFilePicked(true);
    //setFile(event.target.files);
    console.log('-111111111-');
    console.log(event.target.files[0]);
  }

  const changeHandler = (e) => {
    const file = e.target.files[0];
    console.log("file", file);

    // if (file.size > 1024 * 1024 * 10) {
    //   console.log('Error: File size cannot exceed more than 10MB');
    //   return;
    // }

    setSelectedFile(file);
    setIsFilePicked(true);
  };

  const handleSubmission = async (event) => {
    // e.preventDefault();
    // const formData = new FormData();
    // formData.append('avatar', selectedFile);
    // console.log('===save===');
    // const fileurl = URL.createObjectURL(selectedFile);
    // const value = {
    //   avatar: fileurl,
    // }
    // console.log(value);
    // try {
    //   //await dispatch(updateProfile(formData));
    //   //await dispatch(updateAvatar(formData));
    //   console.log("======");
      // await dispatch(setAvatar(value));

    //   enqueueSnackbar('Profile image updated', {
    //     variant: 'success'
    //   });
    // } catch (error) {
    //   console.log(error);
    // }
    event.preventDefault();
    const data = new FormData();
    for (var x = 0; x < selectedFile.length; x++) {
        data.append('file', selectedFile[x])
    }
    console.log('-222222222-');
    console.log(selectedFile[0]);
    console.log('-333333333-');
    console.log(selectedFile);
    console.log('-444444444-');
    console.log(data);
    await dispatch(setAvatar(data));
    // const request = axios.post(`${API_BASE_URL}/user/setavatar`, data);
    // return (dispatch) => {
    //   request.then((response) => dispatch({
    //     type: UPDATE_PROFILE,
    //     payload: response.data
    //   }));
    // };
        // .then(res => {
        //   console.log('-444444444-');
        //   console.log(res.statusText)
        // })

  };

  const handleSubmissionClearAvatar = async (e) => {
    e.preventDefault();
    setSelectedFile('');
    const formData = new FormData();
    formData.append('clearAvatar', '1');
    console.log('===clear===');
    try {
      await dispatch(updateProfile(formData));
      enqueueSnackbar('Profile image Cleared', {
        variant: 'success'
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card
      className={clsx(classes.root, className)}
      {...rest}
    >
      <CardContent>
        <Box>
          <div>
            <form ref={form} onSubmit={handleSubmission}>
              <input type="file" id="avatarFile" ref={avatarInputFile} style={{ display: 'none' }} onChange={handleFileChange} />
              <div>
                <Button type="submit" id="formSubmit" ref={formSubmit} style={{ display: 'none' }}>Submit</Button>
              </div>
            </form>
          </div>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          flexDirection="column"
          textAlign="center"
        >
          <Avatar
            className={classes.avatar}
            onMouseEnter={() => {
              setAvatarHover(true);
            }}
            onMouseLeave={() => {
              setAvatarHover(false);
            }}
            src={selectedFile ? URL.createObjectURL(selectedFile[0]):('http://localhost:5000' + user.avatar.replace("public", ""))}
            //src="http://localhost:5000/images/1643564453592-avatar_11.png"
            onClick={() => { avatarInputFile.current.click(); }}
          >
            Upload
          </Avatar>
          <Typography
            className={classes.name}
            gutterBottom
            variant="h3"  
            color="textPrimary"
          >
            {`${user.firstName} ${user.lastName}`}
          </Typography>
    
        </Box>
      </CardContent>
      { selectedFile && (
        <CardActions>
          <Button
            fullWidth
            variant="text"
            onClick={() => { formSubmit.current.click(); }}
          >
            Save picture
          </Button>
        </CardActions>
      )}
      <CardActions>
        <Button
          fullWidth
          variant="text"
          onClick={handleSubmissionClearAvatar}
        >
          Remove picture
        </Button>
      </CardActions>
    </Card>
  );
}

ProfileDetails.propTypes = {
  className: PropTypes.string,
  user: PropTypes.object.isRequired
};

export default ProfileDetails;
