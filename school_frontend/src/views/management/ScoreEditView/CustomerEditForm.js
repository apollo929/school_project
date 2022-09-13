import React, {useEffect, useState} from 'react';
import GooglePlacesAutocomplete, {geocodeByPlaceId} from 'react-google-places-autocomplete';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router';
import clsx from 'clsx';
import * as Yup from 'yup';
import {Formik} from 'formik';
import {useSnackbar} from 'notistack';
import {
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    Grid,
    Switch,
    TextField,
    Typography,
    makeStyles
} from '@material-ui/core';
import axios from 'axios';
import {API_BASE_URL} from 'src/config';
import {buildCommaSeparatedString} from 'src/utils/helper';

const useStyles = makeStyles(() => ({
    root: {},
    googlePlacesAutocomplete: {
        width: '100%',
        height: '100%',
        paddingLeft: '13px',
        fontSize: '16px',
        '& div[class$="-control"]': {
            height: '56px'
        },
        zIndex: 10
    }
}));

function CustomerEditForm({
    className,
    customer,
    ...rest
}) {
    const classes = useStyles();
    const {enqueueSnackbar} = useSnackbar();
    const history = useHistory();
    const [address, setAddress] = useState();
    const [setFieldValueFunc, setSetFieldValueFunc] = useState(() => {});

    useEffect(() => {
        const elems = document.querySelectorAll("div[class*='-placeholder']");
        if (elems.length >= 1) {
            elems[0].innerHTML = 'Begin typing address here...';
        }
    }, []);

    const getAddressObject = (address_components, fullAddr) => {
        const ShouldBeComponent = {
            street_number: ['street_number'],
            postal_code: ['postal_code'],
            street: [
                'street_address', 'route'
            ],
            province: [
                'administrative_area_level_1', 'administrative_area_level_2', 'administrative_area_level_3', 'administrative_area_level_4', 'administrative_area_level_5'
            ],
            city: [
                'locality',
                'sublocality',
                'sublocality_level_1',
                'sublocality_level_2',
                'sublocality_level_3',
                'sublocality_level_4'
            ],
            country: ['country']
        };

        const rtn_address = {
            street_number: '',
            postal_code: '',
            street: '',
            province: '',
            city: '',
            country: ''
        };

        address_components.forEach((component) => {
            for (let shouldBe in ShouldBeComponent) {
                if (ShouldBeComponent[shouldBe].indexOf(component.types[0]) !== -1) {
                    if (shouldBe === 'country') {
                        rtn_address[shouldBe] = component.short_name;
                    } else {
                        rtn_address[shouldBe] = component.long_name;
                    }
                }
            }
        });

        // Fix the shape to match our schema
        rtn_address.address = `${rtn_address.street_number} ${rtn_address.street}`;
        // delete rtn_address.street_number; delete rtn_address.street;
        if (rtn_address.country === 'US') {
            rtn_address.state = rtn_address.province;
            delete rtn_address.province;
        }
        console.log(rtn_address);
        setFieldValueFunc('aptSuite', '');
        setFieldValueFunc('city', '');
        setFieldValueFunc('state', '');
        setFieldValueFunc('country', '');
        setFieldValueFunc('postalCode', '');

        setFieldValueFunc('aptSuite', rtn_address.address);
        setFieldValueFunc('city', rtn_address.city);
        setFieldValueFunc('state', rtn_address.state);
        setFieldValueFunc('country', rtn_address.country);
        setFieldValueFunc('postalCode', rtn_address.postal_code);
        setFieldValueFunc('fullAddr', fullAddr);
        return rtn_address;
    };

    useEffect(() => {
        const func = async () => {
            const geocodeObj = address && address.value && (
                await geocodeByPlaceId(address.value.place_id)
            );
            const fullAddr = address && address.label;
            const addressObject = geocodeObj && getAddressObject(
                geocodeObj[0].address_components,
                fullAddr
            );
        };
        func();
    }, [address]);

    return (
        <Formik
            initialValues={{
                studentname: customer.studentname,
                classes: customer.classes,
                maths: customer.maths || '',
                english: customer.english || '',
                physics: customer.physics || '',
                chemistry: customer.chemistry || '',
                history: customer.history || '',
                biology: customer.biology || ''
            }}
            validationSchema={Yup
                .object()
                .shape({
                    maths: Yup
                        .number()
                        .min(0)
                        .max(10),
                    english: Yup
                        .number()
                        .min(0)
                        .max(10),
                    physics: Yup
                        .number()
                        .min(0)
                        .max(10),
                    chemistry: Yup
                        .number()
                        .min(0)
                        .max(10),
                    history: Yup
                        .number()
                        .min(0)
                        .max(10),
                    biology: Yup
                        .number()
                        .min(0)
                        .max(10)
                })}
            onSubmit={async (values, {resetForm, setErrors, setStatus, setSubmitting}) => {
                try {
                    const arrAddress = [values.aptSuite, values.city, values.state, values.country];
                    values.fullAddr = buildCommaSeparatedString(arrAddress);

                    // console.log('---------->');
                    // console.log(
                    //     'maths=>' + values.maths + ' english=>' + values.english + ' physics=>' +
                    //     values.physics + ' chemistry=>' + values.chemistry + ' history=>' + values.history +
                    //     ' biology=>' + values.biology
                    // );
                    // console.log(customer.id);
                    
                    const response = await axios.put(`${API_BASE_URL}/subject/${customer.id}`, values);

                    setStatus({success: response.data.status});
                    setSubmitting(false);
                    enqueueSnackbar('Score Inputed', {
                        variant: 'success',
                        action: <Button>See all</Button>
                    });
                    history.push('/app/management/scores');
                } catch (error) {
                    setStatus({success: false});
                    setErrors({submit: error.message});
                    setSubmitting(false);
                }
            }}>
            {
                ({
                    errors,
                    handleBlur,
                    handleChange,
                    handleSubmit,
                    isSubmitting,
                    touched,
                    values,
                    setFieldValue
                }) => (
                    <form
                        className={clsx(classes.root, className)}
                        onSubmit={handleSubmit}
                        {...rest}>
                        <input type="hidden" value={values.fullAddr} name="fullAddr"/>
                        <input type="hidden" value={values.studentname} name="studentname"/>
                        <input type="hidden" value={values.classes} name="classes"/>
                        <Card>
                            <CardContent>
                                <Grid container="container" spacing={3}>
                                    <Grid item="item" md={4} xs={12}>
                                        <TextField
                                            error={Boolean(touched.maths && errors.maths)}
                                            fullWidth="fullWidth"
                                            helperText={touched.maths && errors.maths}
                                            label="Maths"
                                            name="maths"
                                            type='number'
                                            onBlur={handleBlur}
                                            onChange={handleChange}
          
                                            value={values.maths}
                                            variant="outlined"/>
                                    </Grid>
                                    <Grid item="item" md={4} xs={12}>
                                        <TextField
                                            error={Boolean(touched.english && errors.english)}
                                            fullWidth="fullWidth"
                                            helperText={touched.english && errors.english}
                                            label="English"
                                            name="english"
                                            type='number'
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                            
                                            value={values.english}
                                            variant="outlined"/>
                                    </Grid>
                                    <Grid item="item" md={4} xs={12}>
                                        <TextField
                                            error={Boolean(touched.physics && errors.physics)}
                                            fullWidth="fullWidth"
                                            helperText={touched.physics && errors.physics}
                                            label="Physics"
                                            name="physics"
                                            type='number'
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                      
                                            value={values.physics}
                                            variant="outlined"/>
                                    </Grid>
                                    <Grid item="item" md={4} xs={12}>
                                        <TextField
                                            error={Boolean(touched.chemistry && errors.chemistry)}
                                            fullWidth="fullWidth"
                                            helperText={touched.chemistry && errors.chemistry}
                                            label="Chemistry"
                                            name="chemistry"
                                            type='number'
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                          
                                            value={values.chemistry}
                                            variant="outlined"/>
                                    </Grid>
                                    <Grid item="item" md={4} xs={12}>
                                        <TextField
                                            error={Boolean(touched.history && errors.history)}
                                            fullWidth="fullWidth"
                                            helperText={touched.history && errors.history}
                                            label="History"
                                            name="history"
                                            type='number'
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                         
                                            value={values.history}
                                            variant="outlined"/>
                                    </Grid>
                                    <Grid item="item" md={4} xs={12}>
                                        <TextField
                                            error={Boolean(touched.biology && errors.biology)}
                                            fullWidth="fullWidth"
                                            helperText={touched.biology && errors.biology}
                                            label="Biology"
                                            name="biology"
                                            type='number'
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                          
                                            value={values.biology}
                                            variant="outlined"/>
                                    </Grid>

                                </Grid>
                                <Box mt={2}>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        type="submit"
                                        disabled={isSubmitting}>
                                        Input Score
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </form>
                )
            }
        </Formik>
    );
}

CustomerEditForm.propTypes = {
    className: PropTypes.string,
    customer: PropTypes.object.isRequired
};

export default CustomerEditForm;
