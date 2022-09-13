/* eslint-disable react/no-array-index-key */
/* eslint-disable no-shadow */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import * as Yup from 'yup';
import { Formik } from 'formik';
import {
  Box,
  Button,
  Chip,
  FormHelperText,
  IconButton,
  SvgIcon,
  TextField,
  Typography,
  makeStyles
} from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';
import { Plus as PlusIcon } from 'react-feather';
import { useSnackbar } from 'notistack';
import axios from 'axios';
import { API_BASE_URL } from 'src/config';

const classesOptions = ['','1 - 1','1 - 2','1 - 3','2 - 1','2 - 2','2 - 3','3 - 1','3 - 2','3 - 3'];

const useStyles = makeStyles((theme) => ({
  root: {},
  addTab: {
    marginLeft: theme.spacing(2)
  },
  tag: {
    '& + &': {
      marginLeft: theme.spacing(1)
    }
  },
  datePicker: {
    '& + &': {
      marginLeft: theme.spacing(2)
    }
  }
}));

function ProjectDetails({
  className,
  onBack,
  onNext,
  ...rest
}) {
  const classes = useStyles();
  const [tag, setTag] = useState('');
  const { enqueueSnackbar } = useSnackbar();

  return (
    <Formik 
      initialValues={{
        classes: '',
        //tags: []
        tag: ''
      }}
      validationSchema={Yup.object().shape({
        projectName: Yup.string().min(3, 'Must be at least 3 characters').max(255).required('Required'),
        tags: Yup.array(),
        startDate: Yup.date(),
        endDate: Yup.date(),
        // classes: Yup.string().required('select class'),
      })}
      onSubmit={async (values, {
        setErrors,
        setStatus,
        setSubmitting
      }) => {
        try {
          console.log("start form");
          console.log(' tag=>'+values.tag);
          // const response = await axios.post(`${API_BASE_URL}/subject/subject_create`, values);
          
          // setStatus({ success: response.data.status });
          setSubmitting(false);
          enqueueSnackbar('Subject created', {
            variant: 'success',
            action: <Button>See all</Button>
          });
          if (onNext) {
            onNext();
          }
        } catch (err) {
          setErrors({ submit: err.message });
          setStatus({ success: false });
          setSubmitting(false);
        }
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        setFieldValue,
        setFieldTouched,
        touched,
        values
      }) => (
        <form 
          onSubmit={handleSubmit}
          className={clsx(classes.root, className)}
          {...rest}
        >
          <Typography
            variant="h3"
            color="textPrimary"
            style = {{textAlign:'center'}}
          >
            Select class and create the subject
          </Typography>
          <Box mt={2} p={3}>
            <TextField
              fullWidth
              label="Select Class"
              name="classes"
              onChange={handleChange}
              select
              required
              SelectProps={{ native: true }}
              value={values.classes}
              variant="outlined"
            >
              {classesOptions.map((classes) => (
                <option
                  key={classes}
                  value={classes}
                >
                  {classes}
                </option>
              ))}
            </TextField>
            <Box
              mt={3}
              display="flex"
              alignItems="center"
            >
              <TextField
                fullWidth
                label="Subjects"
                name="tag"
                value={values.tag}
                onChange={(e) => setFieldValue('tag', e.target.value)}
                variant="outlined"
              />
              <IconButton
                variant="contained"
                className={classes.addTab}
                type="submit"
             
                // onClick={() => {
                //   if (!tag) {
                //     return;
                //   }

                //   //setFieldValue('tags', [...values.tags, tag]);
                //   setTag('');
                // }}
              >
                <SvgIcon>
                  <PlusIcon />
                </SvgIcon>
              </IconButton>
            </Box>
            {/* <Box mt={2}>
              {values.tags.map((tag, i) => (
                <Chip
                  variant="outlined"
                  key={i}
                  label={tag}
                  className={classes.tag}
                  onDelete={() => {
                    const newTags = values.tags.filter((t) => t !== tag);

                    setFieldValue('tags', newTags);
                  }}
                />
              ))}
            </Box> */}
         
          </Box>
        </form>
      )}
    </Formik>

  );
}

ProjectDetails.propTypes = {
  className: PropTypes.string,
  onNext: PropTypes.func,
  onBack: PropTypes.func
};

export default ProjectDetails;
