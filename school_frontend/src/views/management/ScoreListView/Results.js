/* eslint-disable radix */
/* eslint-disable max-len */
import React, {useState, useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {Link as RouterLink} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {useHistory} from 'react-router';
import ReactLoading from 'react-loading';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import PerfectScrollbar from 'react-perfect-scrollbar';
import {useSnackbar} from 'notistack';
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
import {CheckSquare as CheckSquareIcon, Edit as EditIcon, ArrowRight as ArrowRightIcon, Search as SearchIcon} from 'react-feather';
import getInitials from 'src/utils/getInitials';
import {SET_SCORES} from 'src/actions/scoreActions';
import {API_BASE_URL} from 'src/config';

const sortOptions = [
    {
        value: 1,
        label: 'Alphabetical A-Z'
    }, {
        value: 2,
        label: 'Alphabetical Z-A'
    }, {
        value: 3,
        label: 'Class'
    }
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
        fontSize: 16
    },
    tableWrapper: {
        minHeight: '50vh'
    },
    noDataIconWrapper: {
        textAlign: 'center',
        marginTop: '80px',
        display: 'flex',
        justifyContent: 'center'
    },
    noDataIconWrapperSecond: {
        width: '86px',
        padding: '27px',
        borderRadius: '46px',
        backgroundColor: '#ececef'
    },
    noDataTextWrapper: {
        textAlign: 'center',
        marginTop: '20px'
    },
    noDataText: {
        fontSize: '17px'
    }
}));
let source;

function Results({
    className,
    oldScores,
    oldTotalCount,
    ...rest
}) {
    const classes = useStyles();
    const history = useHistory();
    const isMountedRef = useIsMountedRef();

    const account = useSelector((state) => state.account);

    const [scores, setScores] = useState(oldScores);
    const [totalCount, setTotalCount] = useState(oldTotalCount);
    const [selectedScores, setSelectedScores] = useState([]);
    const [page, setPage] = useState(0);
    const [limit, setLimit] = useState(50);
    const [searchText, setSearchText] = useState();
    const [sort, setSort] = useState(1);
    const {enqueueSnackbar} = useSnackbar();
    const [isLoading, setLoading] = useState(false);
    const [isLoadingSecond, setLoadingSecond] = useState(false);
    const [isNoData, setNoData] = useState(false);
    const dispatch = useDispatch();

    const getScores = async () => {
        if (source) {
            source.cancel('Cancelled the request');
        }
        source = axiosOrigin
            .CancelToken
            .source();

        const data = {
            page: page || 0,
            limit: limit || 50,
            sort: sort || 1,
            isActive: sort === 2,
            searchText
        };
        console.log(
            'page=>' + page + ' limit=>' + limit + ' sort=>' + sort + ' searchText=>' +
            searchText
        );
        axios
            .post(
                `${API_BASE_URL}/subject/score_load`,
                data,
                {cancelToken: source.token}
            )
            .then(async (response) => {
                console.log(response.data.scores);
                if (isMountedRef.current) {
                    source = null;
                    setLoading(false);
                    setLoadingSecond(false);
                    // set Score data
                    setScores(response.data.scores);
                    setTotalCount(response.data.totalCount);
                    setNoData(response.data.totalCount < 1);

                    dispatch({
                        type: SET_SCORES,
                        payload: {
                            scores: response.data.scores,
                            totalCount: response.data.totalCount
                        }
                    });
                }
            })
            .catch(() => {
                source = null;
                // setLoading(false); setLoadingSecond(false);
            });
    };

    useEffect(() => {
        if (scores.length < 1) {
            setLoading(true);
            getScores();
        }
    }, []);

    useEffect(() => {
        if (scores.length < 1) {
            setLoading(true);
            getScores();
        } else {
            setLoadingSecond(true);
            getScores();
        }
    }, [limit, searchText, sort, page]);

    if (!scores) {
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

    const handleSelectAllScores = (event) => {
        setSelectedScores(
            event.target.checked
                ? scores.map((score) => score.id)
                : []
        );
    };

    const handleSelectOneScore = (event, scoreId) => {
        if (!selectedScores.includes(scoreId)) {
            setSelectedScores((prevSelected) => [
                ...prevSelected,
                scoreId
            ]);
        } else {
            setSelectedScores(
                (prevSelected) => prevSelected.filter((id) => id !== scoreId)
            );
        }
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

                }
            });
        }
    }

    const handleEdit = async () => {
        history.push(`/app/management/scores/${selectedScores[0]}/edit`);
    };
    // Usually query is done on backend with indexing solutions
    const enableBulkOperations = selectedScores.length > 0;
    const selectedSomeScores = selectedScores.length > 0 && selectedScores.length < scores.length;
    const selectedAllScores = selectedScores.length === scores.length;

    return (
    <> < Card className = {
        clsx(classes.root, className)
    } {
        ...rest
    } > <Box p={2} minHeight={56} display="flex" alignItems="center">
        <TextField
            className={classes.queryField}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SvgIcon fontSize="small" color="action">
                            <SearchIcon/>
                        </SvgIcon>
                    </InputAdornment>
                )
            }}
            onChange={handleQueryChange}
            placeholder="Search score"
            value={searchText}
            variant="outlined"/>
        <Box flexGrow={1}/>
        <TextField
            label="Sort By"
            name="sort"
            onChange={handleSortChange}
            select="select"
            SelectProps={{
                native: true
            }}
            value={sort}
            variant="outlined">
            {
                sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))
            }
        </TextField>
    </Box>
        {
        enableBulkOperations && (
            <div className={classes.bulkOperations}>
                <div className={classes.bulkActions}>
                    <Checkbox
                        checked={selectedAllScores}
                        indeterminate={selectedSomeScores}
                        onChange={handleSelectAllScores}/>
                    {
                        account.user.role == 'admin' || account.user.role == 'teacher'? (
                        <Button variant="outlined" className={classes.bulkAction} onClick={handleEdit}>
                            Edit
                        </Button>
                        ) : (
                        <Button variant="outlined" className={classes.bulkAction}>
                        No Edit
                    </Button>)
                    } 
                </div>
            </div>
        )
    } < PerfectScrollbar > <Box minWidth={700} className={classes.tableWrapper}>
        <Table>
            <TableHead>
                <TableRow>
                    <TableCell padding="checkbox">
                        <Checkbox
                            checked={selectedAllScores}
                            indeterminate={selectedSomeScores}
                            onChange={handleSelectAllScores}/>
                    </TableCell>
                    <TableCell>
                        Name
                    </TableCell>
                    <TableCell>
                        Class
                    </TableCell>
                    <TableCell>
                        Maths
                    </TableCell>
                    <TableCell>
                        English
                    </TableCell>
                    <TableCell>
                        Physics
                    </TableCell>
                    <TableCell>
                        Chemistry
                    </TableCell>
                    <TableCell>
                        History
                    </TableCell>
                    <TableCell>
                        Biology
                    </TableCell>
                    {
                    account.user.role == 'admin' || account.user.role == 'teacher'? (
                    <TableCell align="right">
                        Actions
                    </TableCell>
                     ) : (<></>)
                    } 
                </TableRow>
            </TableHead>
            {
                isNoData
                    ? (
                        <Box position="absolute" left="44%" display="flex" justifyContent="center">
                            <Box>
                                <Box className={classes.noDataIconWrapper}>
                                    <Box className={classes.noDataIconWrapperSecond}>
                                        <CheckSquareIcon className={classes.noDataIcon}/>
                                    </Box>
                                </Box>
                                <Box className={classes.noDataTextWrapper}>
                                    <Typography
                                        variant="body2"
                                        color="textSecondary"
                                        className={classes.noDataText}>
                                        There are no scores in your account.
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )
                    : (<></>)
            }
            {
                isLoading
                    ? (
                        <Box position="absolute" left="44%" display="flex" justifyContent="center">
                            <Box>
                                <ReactLoading
                                    type="bubbles"
                                    color="rgba(88,80,236,1)"
                                    height="100px"
                                    width="120px"/>
                                <Typography variant="body2" color="textSecondary">
                                    Loading Scores...
                                </Typography>
                            </Box>
                        </Box>
                    )
                    : (<></>)
            }
            <TableBody>
                {
                    scores.map((score) => {
                            // if((score.role != 'admin') && (score.role != 'student')){
                            const isScoreSelected = selectedScores.includes(score.id);

                            return (
                                <TableRow hover="hover" key={score.id} selected={isScoreSelected}>
                                    <TableCell padding="checkbox">
                                        <Checkbox
                                            checked={isScoreSelected}
                                            onChange={(event) => handleSelectOneScore(event, score.id)}
                                            value={isScoreSelected}/>
                                    </TableCell>
                                    <TableCell>
                                        <Box display="flex" alignItems="center">
                                            <Avatar className={classes.avatar} src={('http://localhost:5000' + score.avatar.replace("public", ""))}>
                                                {
                                                    getInitials(
                                                        `${score.studentname.split(' ')[0]} ${score.studentname.split(' ')[1]}`
                                                    )
                                                }
                                            </Avatar>
                                            <div>
                                            {
                                            account.user.role == 'admin' || account.user.role == 'teacher'? (
                                                <Link
                                                    color="inherit"
                                                    component={RouterLink}
                                                    to={`/app/management/scores/${score.id}/edit`}
                                                    variant="h6">
                                                    {score.studentname}
                                                </Link>
                                                ) : (
                                                <Link
                                                    color="inherit"
                                                    component={RouterLink}
                                                    variant="h6">
                                                    {score.studentname}
                                                </Link>
                                                )
                                            } 
                                                <Typography variant="body2" color="textSecondary">
                                                    <Link
                                                        color="inherit"
                                                        component={RouterLink}
                                                        to={`/app/management/scores/${score.id}/edit`}
                                                        variant="h6"></Link>
                                                </Typography>
                                            </div>
                                        </Box>
                                    </TableCell>
                                    <TableCell>{score.classes}</TableCell>
                                    <TableCell>{
                                            score.maths == 0
                                                ? ''
                                                : score.maths
                                        }</TableCell>
                                    <TableCell>{
                                            score.english == 0
                                                ? ''
                                                : score.english
                                        }</TableCell>
                                    <TableCell>{
                                            score.physics == 0
                                                ? ''
                                                : score.physics
                                        }</TableCell>
                                    <TableCell>{
                                            score.chemistry == 0
                                                ? ''
                                                : score.chemistry
                                        }</TableCell>
                                    <TableCell>{
                                            score.history == 0
                                                ? ''
                                                : score.history
                                        }</TableCell>
                                    <TableCell>{
                                            score.biology == 0
                                                ? ''
                                                : score.biology
                                        }</TableCell>
                                    {
                                    account.user.role == 'admin' || account.user.role == 'teacher' ? (
                                    <TableCell align="right">
                                        <IconButton
                                            component={RouterLink}
                                            to={`/app/management/scores/${score.id}/edit`}>
                                            <SvgIcon fontSize="small">
                                                <EditIcon/>
                                            </SvgIcon>
                                        </IconButton>
                                    </TableCell>
                                    ) : (<></>)
                                } 
                                </TableRow>
                            );
                        })
                    }
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
            rowsPerPageOptions={[5, 10, 25, 50]}/>
                        {
                        isLoadingSecond
                            ? (
                                <Box className={classes.loadingPopup}>
                                    LOADING
                                </Box>
                            )
                            : (<></>)
                    }</Card>

                </>
                );
            }

                Results.propTypes = {
                    className: PropTypes.string,
                    oldScores: PropTypes.array,
                    oldTotalCount: PropTypes.number
                };

export default Results;