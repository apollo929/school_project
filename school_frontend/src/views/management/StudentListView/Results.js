/* eslint-disable radix */
/* eslint-disable max-len */
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { useHistory } from 'react-router';
import ReactLoading from 'react-loading';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useSnackbar } from 'notistack';
import useIsMountedRef from 'src/hooks/useIsMountedRef';
import {
  Avatar,
  Box,
  Button,
  Card,
  Checkbox,
  Dialog,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  makeStyles
} from '@material-ui/core';
import axios from 'axios';
import axiosOrigin from 'axios';
import {
  CheckSquare as CheckSquareIcon,
  Edit as EditIcon,
  ArrowRight as ArrowRightIcon,
  Search as SearchIcon
} from 'react-feather';
import getInitials from 'src/utils/getInitials';
import { SET_STUDENTS } from 'src/actions/studentActions';
import { API_BASE_URL } from 'src/config';


const sortOptions = [
  {
    value: 1,
    label: 'Alphabetical A-Z'
  },
  {
    value: 2,
    label: 'Alphabetical Z-A'
  },
  {
    value: 3,
    label: 'Class'
  },
];

const useStyles = makeStyles((theme) => ({
  root: {},
  queryField: {
    width: 500
  },
  bulkOperations: {
    position: 'relative'
  },
  bulkActions: {
    paddingLeft: 4,
    paddingRight: 4,
    marginTop: 6,
    position: 'absolute',
    width: '100%',
    zIndex: 2,
    backgroundColor: theme.palette.background.default
  },
  bulkAction: {
    marginLeft: theme.spacing(2)
  },
  avatar: {
    height: 42,
    width: 42,
    marginRight: theme.spacing(1)
  },
  loadingPopup: {
    position: 'absolute',
    left: '50%',
    top: '30%',
    background: '#555555',
    color: '#fff',
    borderRadius: '5px',
    padding: '10px',
    fontFamily: theme.typography.fontFamily,
    fontSize: 16,
  },
  tableWrapper: {
    minHeight: '50vh',
  },
  noDataIconWrapper: {
    textAlign: 'center',
    marginTop: '80px',
    display: 'flex',
    justifyContent: 'center',
  },
  noDataIconWrapperSecond: {
    width: '86px',
    padding: '27px',
    borderRadius: '46px',
    backgroundColor: '#ececef',
  },
  noDataTextWrapper: {
    textAlign: 'center',
    marginTop: '20px',
  },
  noDataText: {
    fontSize: '17px',
  },
}));
let source;

function Results({
  className, oldStudents, oldTotalCount, ...rest
}) {
  const classes = useStyles();
  const history = useHistory();
  const isMountedRef = useIsMountedRef();
  const [viewConfirmBulkDelete, setViewConfirmBulkDelete] = useState(false);
  const [students, setStudents] = useState(oldStudents);
  const [totalCount, setTotalCount] = useState(oldTotalCount);

  const [selectedStudents, setSelectedStudents] = useState([]);
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(50);
  const [searchText, setSearchText] = useState();
  const [sort, setSort] = useState(1);
  const { enqueueSnackbar } = useSnackbar();
  const [isLoading, setLoading] = useState(false);
  const [isLoadingSecond, setLoadingSecond] = useState(false);
  const [isNoData, setNoData] = useState(false);
  const dispatch = useDispatch();

  const getStudents = async () => {
    if (source) {
      source.cancel('Cancelled the request');
    }
    source = axiosOrigin.CancelToken.source();

    const data = {
      page: page || 0,
      limit: limit || 50,
      sort: sort || 1,
      isActive: sort === 2,
      searchText,
    };
    console.log('page=>'+page+' limit=>'+limit+' sort=>'+sort+' searchText=>'+searchText);
    axios.post(`${API_BASE_URL}/user/load_student`, data, {
      cancelToken: source.token
    })
      .then(async (response) => {
        console.log(response.data.students);
        if (isMountedRef.current) {
          source = null;
          setLoading(false);
          setLoadingSecond(false);
          // set students data
          setStudents(response.data.students);
          setTotalCount(response.data.totalCount);
          setNoData(response.data.totalCount < 1);

          dispatch({
            type: SET_STUDENTS,
            payload: {
              students: response.data.students,
              totalCount: response.data.totalCount,
            }
          });
        }
      })
      .catch(() => {
        source = null;
        // setLoading(false);
        // setLoadingSecond(false);
      });
  };

  useEffect(() => {
    if (students.length < 1) {
      setLoading(true);
      getStudents();
    }
  }, []);

  useEffect(() => {
    if (students.length < 1) {
      setLoading(true);
      getStudents();
    } else {
      setLoadingSecond(true);
      getStudents();
    }
  }, [limit, searchText, sort, page]);

  if (!students) {
    return null;
  }

  const handleQueryChange = (event) => {
    event.persist();
    setSearchText(event.target.value);
  };

  const handleSortChange = (event) => {
    event.persist();
    const newSort = parseInt(event.target.value);
    setSort(newSort);
  };

  const handlePageChange = (event, newPage) => {
    event.persist();
    setPage(newPage);
  };

  const handleLimitChange = (event) => {
    event.persist();
    setLimit(event.target.value);
    setPage(0);
  };

  const handleSelectAllStudents = (event) => {
    setSelectedStudents(event.target.checked
      ? students.map((student) => student.id)
      : []);
  };

  const handleSelectOneStudent = (event, studentId) => {
    if (!selectedStudents.includes(studentId)) {
      setSelectedStudents((prevSelected) => [...prevSelected, studentId]);
    } else {
      setSelectedStudents((prevSelected) => prevSelected.filter((id) => id !== studentId));
    }
  };

  const processAfterDeleteDone = (rtn_status) => {
    if (rtn_status) {
      enqueueSnackbar('Student deleted', {
        variant: 'success',
        action: <Button>See all</Button>
      });
    } else {
      enqueueSnackbar('Error Occured! Can not delete Student.', {
        variant: 'error',
        action: <Button>See all</Button>
      });
    }
    setSelectedStudents([]);
    getStudents();
  };

  // confirm delete
  const onConfirmBulkDelteNo = () => {
    setViewConfirmBulkDelete(false);
  };

  async function asyncForEach(array, callback) {
    if (array.length < 1) {
      return;
    }

    const arrToCheckExecuted = [];
    for (let index = 0; index < array.length; index++) {
      callback(array[index], index, array).then((success) => {
        if (success) {
          arrToCheckExecuted.push(1);
        } else {
          arrToCheckExecuted.push(0);
        }

        if (arrToCheckExecuted.length >= array.length) {
          const rtn = arrToCheckExecuted.every((currentValue) => currentValue === 1);
          processAfterDeleteDone(rtn);
        }
      });
    }
  }

  const handleDelete = async () => {
    setViewConfirmBulkDelete(true);
  };
  const processConfirmBulkDelete = async () => {
    asyncForEach(selectedStudents, async (selectedStudent) => {
      const response = await axios.delete(`${API_BASE_URL}/user/${selectedStudent}`);
      if (!response.data.status) {
        return false;
      }
      return true;
    });
  };
  const onConfirmBulkDeleteYes = () => {
    setViewConfirmBulkDelete(false);
    processConfirmBulkDelete();
  };

  const handleEdit = async () => {
    history.push(`/app/management/students/${selectedStudents[0]}/edit`);
  };
  // Usually query is done on backend with indexing solutions
  const enableBulkOperations = selectedStudents.length > 0;
  const selectedSomeStudents = selectedStudents.length > 0 && selectedStudents.length < students.length;
  const selectedAllStudents = selectedStudents.length === students.length;

  return (
    <>
      <Card
        className={clsx(classes.root, className)}
        {...rest}
      >
        <Box
          p={2}
          minHeight={56}
          display="flex"
          alignItems="center"
        >
          <TextField
            className={classes.queryField}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SvgIcon
                    fontSize="small"
                    color="action"
                  >
                    <SearchIcon />
                  </SvgIcon>
                </InputAdornment>
              )
            }}
            onChange={handleQueryChange}
            placeholder="Search students"
            value={searchText}
            variant="outlined"
          />
          <Box flexGrow={1} />
          <TextField
            label="Sort By"
            name="sort"
            onChange={handleSortChange}
            select
            SelectProps={{ native: true }}
            value={sort}
            variant="outlined"
          >
            {sortOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </TextField>
        </Box>
        {enableBulkOperations && (
          <div className={classes.bulkOperations}>
            <div className={classes.bulkActions}>
              <Checkbox
                checked={selectedAllStudents}
                indeterminate={selectedSomeStudents}
                onChange={handleSelectAllStudents}
              />
              <Button
                variant="outlined"
                className={classes.bulkAction}
                onClick={handleDelete}
              >
                Delete
              </Button>
              <Button
                variant="outlined"
                className={classes.bulkAction}
                onClick={handleEdit}
              >
                Edit
              </Button>
            </div>
          </div>
        )}
        <PerfectScrollbar>
          <Box
            minWidth={700}
            className={classes.tableWrapper}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedAllStudents}
                      indeterminate={selectedSomeStudents}
                      onChange={handleSelectAllStudents}
                    />
                  </TableCell>
                  <TableCell>
                    Name
                  </TableCell>
                  {/* <TableCell>
                    Email
                  </TableCell> */}
                  <TableCell>
                    Phone
                  </TableCell>
                  <TableCell>
                    Country
                  </TableCell>
                  <TableCell>
                    Class
                  </TableCell>
                  <TableCell align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              {isNoData ? (
                <Box
                  position="absolute"
                  left="44%"
                  display="flex"
                  justifyContent="center"
                >
                  <Box>
                    <Box className={classes.noDataIconWrapper}>
                      <Box className={classes.noDataIconWrapperSecond}>
                        <CheckSquareIcon className={classes.noDataIcon} />
                      </Box>
                    </Box>
                    <Box className={classes.noDataTextWrapper}>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        className={classes.noDataText}
                      >
                        There are no students in your account.
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ) : (<></>)}
              {isLoading ? (
                <Box
                  position="absolute"
                  left="44%"
                  display="flex"
                  justifyContent="center"
                >
                  <Box>
                    <ReactLoading type="bubbles" color="rgba(88,80,236,1)" height="100px" width="120px" />
                    <Typography
                      variant="body2"
                      color="textSecondary"
                    >
                      Loading Students...
                    </Typography>
                  </Box>
                </Box>
              ) : (<></>)}
              <TableBody>
                {students.map((student) => {
                  if((student.role != 'admin') && (student.role != 'teacher')){
                  const isStudentSelected = selectedStudents.includes(student.id);
                    console.log(">>>>>>>")
                    console.log(student.avatar);
                  return (
                    <TableRow
                      hover
                      key={student.id}
                      selected={isStudentSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isStudentSelected}
                          onChange={(event) => handleSelectOneStudent(event, student.id)}
                          value={isStudentSelected}
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          display="flex"
                          alignItems="center"
                        >
                          <Avatar
                            className={classes.avatar}
                            src={('http://localhost:5000' + student.avatar.replace("public", ""))}
                            // src="http://localhost:5000/images/1643573274246-avatar_6.png"
                          >
                            {getInitials(`${student.firstName} ${student.lastName}`)}
                          </Avatar>
                          <div>
                            <Link
                                color="inherit"
                                component={RouterLink}
                                to={`/app/management/students/${student.id}/edit`}
                                variant="h6"
                              >
                                {student.firstName}
                                {' '}
                                {student.lastName}
                              </Link>
                            <Typography
                                variant="body2"
                                color="textSecondary"
                              >
                                <Link
                                  color="inherit"
                                  component={RouterLink}
                                  to={`/app/management/students/${student.id}/edit`}
                                  variant="h6"
                                >
                                  {student.email}
                                </Link>
                              </Typography>
                          </div>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {student.phone}
                      </TableCell>
                      <TableCell>
                        {student.country}
                      </TableCell>
                      <TableCell>
                        {student.classes}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          component={RouterLink}
                          to={`/app/management/students/${student.id}/edit`}
                        >
                          <SvgIcon fontSize="small">
                            <EditIcon />
                          </SvgIcon>
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                }})}
              </TableBody>
            </Table>
          </Box>
        </PerfectScrollbar>
        <TablePagination
          component="div"
          count={totalCount}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleLimitChange}
          page={page}
          rowsPerPage={limit}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
        {isLoadingSecond ? (
          <Box
            className={classes.loadingPopup}
          >
            LOADING
          </Box>
        ) : (<></>)}
      </Card>
      <Dialog open={viewConfirmBulkDelete}>
        <Box p={2} className={classes.confirmPopupHeader}>
          <Typography
            align="left"
            gutterBottom
            variant="h3"
            color="textPrimary"
          >
            Are you sure?
          </Typography>
        </Box>
        <Divider />
        <Box p={2}>
          <Typography
            align="left"
            gutterBottom
            variant="p"
            color="textPrimary"
          >
            Would you like to delete selected records?
          </Typography>
        </Box>
        <Divider />
        <Box
          p={2}
          display="flex"
          alignItems="center"
        >
          <Box flexGrow={1} />
          <Button onClick={onConfirmBulkDelteNo}>
            No
          </Button>
          <Button
            variant="contained"
            color="secondary"
            className={classes.confirmButton}
            onClick={onConfirmBulkDeleteYes}
          >
            Yes
          </Button>
        </Box>
      </Dialog>
    </>
  );
}

Results.propTypes = {
  className: PropTypes.string,
  oldStudents: PropTypes.array,
  oldTotalCount: PropTypes.number
};

export default Results;
