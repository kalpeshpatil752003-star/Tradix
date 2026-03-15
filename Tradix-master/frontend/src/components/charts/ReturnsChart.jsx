import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetDailyPnlReturnsQuery } from 'state/api/charts/chartsApi';
import ReactApexChart from 'react-apexcharts';

const ReturnsChartOptions = {
    chart: { type: 'bar', height: 350, toolbar: { show: false } },
    colors: ["#089981"],
    plotOptions: {
        bar: {
            colors: { ranges: [{ from: -1000000, to: 0, color: '#f23645' }] },
            columnWidth: '45%', borderRadius: 4
        }
    },
    dataLabels: { enabled: false },
    xaxis: { type: 'datetime', labels: { rotate: -90 } },
};

const ReturnsChart = () => {
    const id = useSelector((state) => state.account?.selectedAccount?.AccountId);
    const { data, isLoading } = useGetDailyPnlReturnsQuery(id, { refetchOnMountOrArgChange: true, skip: !id });
    const [series, setSeries] = useState([{ name: 'Daily Returns', data: [] }]);
    const [options, setOptions] = useState(ReturnsChartOptions);
    const currentMode = useSelector((state) => state.global.mode);

    useEffect(() => {
        setOptions((prevState) => ({
            ...prevState,
            grid: { borderColor: currentMode === 'light' ? '#e5e7eb' : '#4b5563' },
            xaxis: {
                categories: Array.isArray(data?.journalDates) ? data.journalDates : [],
                labels: { style: { colors: currentMode === 'light' ? '#111827' : '#9ca3af' } },
            },
            yaxis: {
                title: { text: 'Growth' },
                labels: {
                    style: { colors: currentMode === 'light' ? '#111827' : '#9ca3af' },
                    formatter: (y) => parseFloat(y).toFixed(2) + "%"
                }
            },
        }));
        setSeries([{ name: 'Daily Returns', data: Array.isArray(data?.TotalRoi) && data.TotalRoi.length > 0 ? data.TotalRoi : [] }]);
    }, [currentMode, data, isLoading]);

    return <ReactApexChart options={options} series={series} type="bar" height={365} />;
};

export default ReturnsChart;
