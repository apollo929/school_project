import React from 'react';
import Chart from 'react-apexcharts';
import {Card, CardContent, Typography, useTheme} from '@material-ui/core';

function LineChart({namedata, sum, average}) {
    const theme = useTheme();
    console.log(average);
    const chart = {
        options: {
            chart: {
                background: theme.palette.background.paper,
                stacked: false,
                toolbar: {
                    show: false
                },
                zoom: false
            },
            colors: [
                '#1f87e6', '#ff5c7c'
            ],
            dataLabels: {
                enabled: false
            },
            grid: {
                borderColor: theme.palette.divider,
                yaxis: {
                    lines: {
                        show: false
                    }
                }
            },
            legend: {
                show: true,
                position: 'top',
                horizontalAlign: 'right',
                labels: {
                    colors: theme.palette.text.secondary
                }
            },
            markers: {
                size: 4,
                strokeColors: [
                    '#1f87e6', '#27c6db'
                ],
                strokeWidth: 0,
                shape: 'circle',
                radius: 2,
                hover: {
                    size: undefined,
                    sizeOffset: 2
                }
            },
            stroke: {
                width: 3,
                curve: 'smooth',
                lineCap: 'butt',
                dashArray: [0, 3]
            },
            theme: {
                mode: theme.palette.type
            },
            tooltip: {
                theme: theme.palette.type
            },
            xaxis: {
                axisBorder: {
                    color: theme.palette.divider
                },
                axisTicks: {
                    show: true,
                    color: theme.palette.divider
                },
                categories: namedata,
                labels: {
                    style: {
                        colors: theme.palette.text.secondary
                    }
                }
            },
            yaxis: [
                {
                    axisBorder: {
                        show: true,
                        color: theme.palette.divider
                    },
                    axisTicks: {
                        show: true,
                        color: theme.palette.divider
                    },
                    labels: {
                        style: {
                            colors: theme.palette.text.secondary
                        }
                    }
                }, {
                    axisTicks: {
                        show: true,
                        color: theme.palette.divider
                    },
                    axisBorder: {
                        show: true,
                        color: theme.palette.divider
                    },
                    labels: {
                        style: {
                            colors: theme.palette.text.secondary
                        }
                    },
                    opposite: true
                }
            ]
        },
        series: [
            {
                name: 'sum score',
                data: sum,
            },{
                name: 'average score',
                data: average
            }
        ]
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h4" color="textPrimary">
                    Score Graphics
                </Typography>
                <Chart type="line" height="300" {...chart}/>
            </CardContent>
        </Card>
    );
}

export default LineChart;
