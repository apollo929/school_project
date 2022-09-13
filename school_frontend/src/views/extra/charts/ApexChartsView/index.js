import React, {
  useState,
  useCallback,
  useEffect
} from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import {
  Box,
  Breadcrumbs,
  Container,
  Grid,
  Link,
  Typography,
  makeStyles
} from '@material-ui/core';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import Page from 'src/components/Page';
import AreaChart from './AreaChart';
import LineChart from './LineChart'; 

import axios from 'axios';
import { API_BASE_URL } from 'src/config';
import useIsMountedRef from 'src/hooks/useIsMountedRef';

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }
}));

function ApexChartsView() {
  const classes = useStyles();

  const isMountedRef = useIsMountedRef();
  const [score, setScore] = useState();
  //const { customerId } = useParams();
  const [namedata, setNamedata] = useState([]);
  const [sum, setSum] = useState([]);
  const [average, setAverage] = useState([]);

  const getScore = useCallback(() => {
    console.log('called getScore function');
    axios
      .post(`${API_BASE_URL}/subject/get_score`)
      .then((response) => {
        console.log('------>');
        console.log(response.data.score);
        var score = response.data.score;

        var namedata = score.map((item) => item.studentname);
        var sum = score.map((item) => item.sum != null ? item.sum.toPrecision(3) : 0);
        var average = score.map((item) =>item.average != null ? item.average.toPrecision(3) : 0);
        console.log(namedata);
        console.log(sum);
        console.log(average);
        if (isMountedRef.current) {
          setScore(response.data.score);
          setNamedata(namedata);
          setSum(sum);
          setAverage(average);
        }
      });
  }, [isMountedRef]);
  
  useEffect(() => {
    getScore();
  }, [getScore]);

  if (!score) {
    return null;
  }

  return (
    <Page
      className={classes.root}
      title="ScoreCharts"
    >
      <Container maxWidth="lg">
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          aria-label="breadcrumb"
        >
          <Link
            variant="body1"
            color="inherit"
            to="/app/extra/charts/apex"
            component={RouterLink}
          >
            Score Management
          </Link>
          <Typography
            variant="body1"
            color="textPrimary"
          >
            Score
          </Typography>
        </Breadcrumbs>
        <Typography
          variant="h3"
          color="textPrimary"
        >
          ScoreCharts
        </Typography>
        <Box mt={3}>
          <Grid
            container
            spacing={3}
          >
            <Grid
              item
              xs={12}
            >
              <LineChart namedata = {namedata} sum = {sum} average = {average}/>
            </Grid>
            <Grid
              item
              xs={12}
              md={12}
            >
              <AreaChart namedata = {namedata} sum = {sum} average = {average}/>
            </Grid>

          </Grid>
        </Box>
      </Container>
    </Page>
  );
}

export default ApexChartsView;
