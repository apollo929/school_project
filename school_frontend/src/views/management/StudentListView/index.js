import React from 'react';
// import ReactDOM from 'react-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Container,
  makeStyles
} from '@material-ui/core';
import Page from 'src/components/Page';

import Header from './Header';
import Results from './Results';
// import axios from 'src/axios';
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }
}));

function CustomerListView() {
  const classes = useStyles();
  const { students, totalCount } = useSelector((state) => state.student);
  
  return (
    <Page
      className={classes.root}  
      title="Student List"
    >
      <Container maxWidth={false}>
        <Header />
        <Box mt={3}>
          <Results oldStudents={students} oldTotalCount={totalCount} /> 
        </Box>
      </Container>
    </Page>
  );
}

export default CustomerListView;
