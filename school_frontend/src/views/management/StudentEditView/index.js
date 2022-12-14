  import React, {
  useState,
  useCallback,
  useEffect
} from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  makeStyles
} from '@material-ui/core';
import axios from 'axios';
import Page from 'src/components/Page';
import useIsMountedRef from 'src/hooks/useIsMountedRef';
import { API_BASE_URL } from 'src/config';
import CustomerEditForm from './CustomerEditForm';
import Header from './Header';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }
}));

function CustomerEditView() {
  const classes = useStyles();
  const isMountedRef = useIsMountedRef();
  const [customer, setCustomer] = useState();
  const { customerId } = useParams();

  const getCustomer = useCallback(() => {
    console.log('called getCustomer function');
    axios
      .get(`${API_BASE_URL}/user/${customerId}`)
      .then((response) => {
        console.log('------>'+response.data.customer);
        if (isMountedRef.current) {
          setCustomer(response.data.customer);
        }
      });
  }, [isMountedRef]);
  
  useEffect(() => {
    getCustomer();
  }, [getCustomer]);

  if (!customer) {
    return null;
  }

  return (
    <Page
      className={classes.root}
      title="Student Edit"
    >
      <Container maxWidth="lg">
        <Header />
        <Box mt={5}>
          <CustomerEditForm customer={customer} />
        </Box>
      </Container>
    </Page>
  );
}

export default CustomerEditView;
