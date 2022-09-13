/* eslint-disable no-use-before-define */
/* eslint-disable react/prop-types */
import React, {useEffect, useState} from 'react';
import {useLocation, matchPath} from 'react-router';
import {Link as RouterLink} from 'react-router-dom';
import {useSelector} from 'react-redux';
import PerfectScrollbar from 'react-perfect-scrollbar';
import PropTypes from 'prop-types';

import {
    Avatar, Box,
    //Chip,
    Divider,
    Drawer,
    Hidden,
    Link,
    List,
    ListSubheader,
    Typography,
    makeStyles
} from '@material-ui/core';
// import ReceiptIcon from '@material-ui/icons/ReceiptOutlined';
import {
    // Briefcase as BriefcaseIcon,
    Calendar as CalendarIcon,
    // ShoppingCart as ShoppingCartIcon, Folder as FolderIcon,
    BarChart as BarChartIcon,
    // Lock as LockIcon, UserPlus as UserPlusIcon, Shield as ShieldIcon, AlertCircle
    // as AlertCircleIcon,
    Trello as TrelloIcon,
    // User as UserIcon, Layout as LayoutIcon,
    Edit as EditIcon,
    // DollarSign as DollarSignIcon, Mail as MailIcon, MessageCircle as
    // MessageCircleIcon, PieChart as PieChartIcon, Share2 as ShareIcon,
    Users as UsersIcon
} from 'react-feather';
import Logo from 'src/components/Logo';
import NavItem from './NavItem';
let navConfigreal = [];
const navConfig1 = [
    {
        subheader: 'Member Management',
        items: [
            {
                title: 'Teacher',
                icon: UsersIcon,
                href: '/app/management/customers'
            }, {
                title: 'Student',
                icon: UsersIcon,
                href: '/app/management/students'
            }
        ]
    }, {
        subheader: 'Schedule Management',
        items: [
            {
                title: 'by Calendar',
                href: '/app/calendar',
                icon: CalendarIcon
            }
        ]
    }, {
        subheader: 'Score Management',
        items: [
            {
                icon: BarChartIcon,
                title: 'by Charts',
                href: '/app/extra/charts/apex'
            }, {
                icon: EditIcon,
                title: 'input score',
                // href: '/app/extra/forms/formik',
                href: '/app/management/scores'
            }
        ]
    }
];
const navConfig2 = [
    {
        subheader: 'Member Management',
        items: [
            {
                title: 'Student',
                icon: UsersIcon,
                href: '/app/management/students'
            }
        ]
    }, {
        subheader: 'Schedule Management',
        items: [
            {
                title: 'by Calendar',
                href: '/app/calendar',
                icon: CalendarIcon
            }
        ]
    }, {
        subheader: 'Score Management',
        items: [
            {
                icon: BarChartIcon,
                title: 'by Charts',
                href: '/app/extra/charts/apex'
            }, {
                icon: EditIcon,
                title: 'input score',
                // href: '/app/extra/forms/formik',
                href: '/app/management/scores'
            }
        ]
    }
];
const navConfig3 = [
   {
        subheader: 'Schedule Management',
        items: [
            {
                title: 'by Calendar',
                href: '/app/calendar',
                icon: CalendarIcon
            }
        ]
    }, {
        subheader: 'Score Management',
        items: [
            {
                icon: BarChartIcon,
                title: 'by Charts',
                href: '/app/extra/charts/apex'
            }, {
                icon: EditIcon,
                title: 'input score',
                // href: '/app/extra/forms/formik',
                href: '/app/management/scores'
            }
        ]
    }
];
function renderNavItems({
    items,
    ...rest
}) {
    return (
        <List disablePadding="disablePadding">
            {
                items.reduce((acc, item) => reduceChildRoutes({
                    acc,
                    item,
                    ...rest
                }), [])
            }
        </List>
    );
}

function reduceChildRoutes({
    acc,
    pathname,
    item,
    depth = 0
}) {
    const key = item.title + depth;

    if (item.items) {
        const open = matchPath(pathname, {
            path: item.href,
            exact: false
        });

        acc.push(
            <NavItem
                depth={depth}
                icon={item.icon}
                key={key}
                info={item.info}
                open={Boolean(open)}
                title={item.title}>
                {
                    renderNavItems({
                        depth: depth + 1,
                        pathname,
                        items: item.items
                    })
                }
            </NavItem>
        );
    } else {
        acc.push(
            <NavItem
                depth={depth}
                href={item.href}
                icon={item.icon}
                key={key}
                info={item.info}
                title={item.title}/>
        );
    }

    return acc;
}

const useStyles = makeStyles(() => ({
    mobileDrawer: {
        width: 256
    },
    desktopDrawer: {
        width: 256,
        top: 64,
        height: 'calc(100% - 64px)'
    },
    avatar: {
        cursor: 'pointer',
        width: 64,
        height: 64
    }
}));

function NavBar({openMobile, onMobileClose}) {
    const classes = useStyles();
    const location = useLocation();
    const account = useSelector((state) => state.account);
    console.log('-----');
    console.log(account);
    useEffect(() => {
        console.log('reload1');
        realnav();
    });

    useEffect(() => {
        console.log('reload2');
        if (openMobile && onMobileClose) {
            onMobileClose();
        }
        // eslint-disable-next-line
    }, [location.pathname]);

    const realnav = () => {
        if (account.user.role == 'admin')
            navConfigreal = navConfig1;
        else if (account.user.role == 'teacher')
            navConfigreal = navConfig2;
        else
            navConfigreal = navConfig3;
        return navConfigreal;
    };

    const content = (
        realnav(),
        <Box height="100%" display="flex" flexDirection="column">
            <PerfectScrollbar
                options={{
                    suppressScrollX: true
                }}>
                <Hidden lgUp="lgUp">
                    <Box p={2} display="flex" justifyContent="center">
                        <RouterLink to="/">
                            <Logo/>
                        </RouterLink>
                    </Box>
                </Hidden>
                <Box p={2}>
                    <Box display="flex" justifyContent="center">
                        <RouterLink to="/app/account">
                            <Avatar alt="User" className={classes.avatar}
                                src={('http://localhost:5000' + account.user.avatar.replace("public", ""))}
                            />
                        </RouterLink>
                    </Box>
                    <Box mt={2} textAlign="center">
                        <Link
                            component={RouterLink}
                            to="/app/account"
                            variant="h5"
                            color="textPrimary"
                            underline="none">
                            {`${account.user.firstName} ${account.user.lastName}`}
                        </Link>
                        <Typography variant="body2" color="textSecondary">
                            {/* {user.bio} */}
                        </Typography>
                    </Box>
                </Box>
                <Divider/>
                <Box p={2}>              
                    {  
                        navConfigreal.map((config) => (
                            <List
                                key={config.subheader}
                                subheader={(
                                    <ListSubheader disableGutters="disableGutters" disableSticky="disableSticky">
                                        <b
                                            style={{
                                                fontSize: "16px",
                                                color: '#9975eb'
                                            }}>{config.subheader}</b>
                                    </ListSubheader>
                                )}>
                                {renderNavItems({items: config.items, pathname: location.pathname})}
                            </List>
                        ))
                    }
                </Box>
                <Divider/> 
            </PerfectScrollbar>
        </Box>
    );

    return (
        <> < Hidden lgUp > <Drawer
            anchor="left"
            classes={{
                paper: classes.mobileDrawer
            }}
            onClose={onMobileClose}
            open={openMobile}
            variant="temporary">
            {content}
        </Drawer>
    </Hidden>
    <Hidden mdDown="mdDown">
        <Drawer
            anchor="left"
            classes={{
                paper: classes.desktopDrawer
            }}
            open="open"
            variant="persistent">
            {content}
        </Drawer>
    </Hidden>
</>
    );
}

NavBar.propTypes = {
    onMobileClose: PropTypes.func,
    openMobile: PropTypes.bool
};

export default NavBar;
