import React from 'react';
import { Container, makeStyles } from '@material-ui/core';
import Page from 'src/components/Page';
import Header from './Header';
import CustomerCreateForm from './CustomerCreateForm';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }
}));

function CustomerCreateView() {
  const classes = useStyles();

  return (
    <Page
      className={classes.root}
      title="Student Create"
    >
      <Container maxWidth={false}>
        <Header />
        <CustomerCreateForm style = {{marginTop:"30px"}}/>
      </Container>
    </Page>
  );
}

export default CustomerCreateView;
