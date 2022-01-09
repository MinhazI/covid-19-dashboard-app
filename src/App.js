import { useEffect, useState } from "react";
import { initializeApp, setLogLevel } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue, set } from "firebase/database";
import {getPerformance} from "firebase/performance"
import { Row, Col, Typography, Space, Spin, Card, PageHeader, Tag, Button } from 'antd';
import moment from 'moment';
import Loader from "react-loader-spinner";
import numeral from "numeral";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Footer } from "antd/lib/layout/layout";
import { isIOS } from "react-device-detect";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

export default function App() {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentCovidData, setCurrentCovidData] = useState([]);
  const [allDataForCharts, setAllDataForCharts] = useState([]);
  const [totalActiveStatsForCharts, setTotalActiveStatsForCharts] = useState([]);
  const [dailyStatsForCharts, setDailyStatsForCharts] = useState([]);
  const [startDate, setStartDate] = useState("2020-01-27");
  const [dailyStatisticsForCharts, setDailyStatisticsForCharts] = useState([])

  const [allCovidDataFromFirebase, setAllCovidDataFromFirebase] = useState([])
  const [activeCases, setActiveCases] = useState([]);
  const [totalCases, setTotalCases] = useState([]);
  const [allDates, setAllDates] = useState([]);
  const [totalDeaths, setTotalDeaths] = useState([]);
  const [totalRecovered, setTotalRecovered] = useState([]);
  const [newCases, setNewCases] = useState([]);
  const [newDeaths, setNewDeaths] = useState([]);
  const [newRecovered, setNewRecovered] = useState([]);
  const [newActiveCases, setNewActiveCases] = useState([]);
  const [newRecoveredStat, setNewRecoveredStat] = useState([]);
  const [newActiveCasesStat, setNewActiveCasesStat] = useState([]);

  const [statType, setStatType] = useState("Daily Statistics")

  const firebaseConfig = {
    apiKey: "AIzaSyBZYkkdD6P92MCb2X1jVb49aEHmZwC3pwk",
    authDomain: "covid-19-tracker-63c03.firebaseapp.com",
    databaseURL: "https://covid-19-tracker-63c03.firebaseio.com",
    projectId: "covid-19-tracker-63c03",
    storageBucket: "covid-19-tracker-63c03.appspot.com",
    messagingSenderId: "124645243004",
    appId: "1:124645243004:web:db0760c2c0a5f3328df1f9",
    measurementId: "G-1BWFZ0SF0H"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);
  const currentDate = moment().format("YYYY-MM-DD")

  const { Title } = Typography;
  getAnalytics(app);
  getPerformance(app);


  useEffect(() => {
    const lastSevenDaysDates = [];
    const lastSevenDaysActiveCases = [];
    const lastSevenDaysDeaths = [];
    const lastSevenDaysRecovery = [];
    const lastSevenNewCases = [];

    const covidDataRef = ref(db, currentDate);
    onValue(covidDataRef, (snapshot) => {
      currentCovidData.length = 0;
      setCurrentCovidData(snapshot.val());
    });

    const labels = [];
    const labelss = [];
    const covidDataAll = ref(db);
    onValue(covidDataAll, (snapshot) => {
      allCovidDataFromFirebase.length = 0;
      activeCases.length = 0;
      allDates.length = 0;
      totalCases.length = 0;
      totalDeaths.length = 0;
      totalRecovered.length = 0;
      newCases.length = 0;
      newDeaths.length = 0;
      snapshot.forEach(
        ss => {
          allCovidDataFromFirebase.push(ss.val());
          activeCases.push(ss.val().local_active_cases);
          allDates.push(ss.val().current_date);
          totalCases.push(ss.val().local_total_cases);
          totalDeaths.push(ss.val().local_deaths);
          totalRecovered.push(ss.val().local_recovered);
          newCases.push(ss.val().local_new_cases);
          newDeaths.push(ss.val().local_new_deaths);
        }
      )

      labels.length = 0;
      for (let x = 1; x <= activeCases.length - 1; x++) {
        const date = moment(startDate).add(x, 'days').format("YYYY-MM-DD")
        labels.push(date)
      }

      newRecovered.length = 0
      newRecovered.push(totalRecovered[0]);
      for (let x = 0; x <= totalRecovered.length - 2; x++) {
        const oldRecovery = totalRecovered[x];
        const newRecovery = totalRecovered[x + 1];
        const newRecoveryValue = newRecovery - oldRecovery;
        if (newRecoveryValue <= 0) {
          newRecovered.push(0);
        } else {
          newRecovered.push(newRecoveryValue);
        }
      }


      newActiveCases.length = 0;
      newActiveCases.push(activeCases[0]);
      for (let x = 0; x <= activeCases.length - 2; x++) {
        const oldActiveCases = activeCases[x];
        const newActiveCasesNew = activeCases[x + 1];
        const newActiveCasesValue = newActiveCasesNew - oldActiveCases;
        if (newActiveCasesValue <= 0) {
          newActiveCases.push(0);
        } else {
          newActiveCases.push(newActiveCasesValue);
        }
      }

      setNewRecoveredStat(newRecovered[newRecovered.length - 1]);
      setNewActiveCasesStat(newActiveCases[newActiveCases - 1]);
      lastSevenDaysActiveCases.length = 0
      lastSevenDaysDeaths.length = 0
      lastSevenDaysRecovery.length = 0;
      lastSevenNewCases.length = 0
      for (let x = totalCases.length - 8; x <= totalCases.length - 2; x++) {
        lastSevenDaysDeaths.push(newDeaths[x]);
        lastSevenDaysActiveCases.push(newActiveCases[x]);
        lastSevenDaysRecovery.push(newRecovered[x]);
        lastSevenNewCases.push(newCases[x]);
      }

      const totalActiveData = {
        labels,
        datasets: [
          {
            label: 'Active Cases',
            data: activeCases,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Total Cases',
            data: totalCases,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
        ],
      };

      setTotalActiveStatsForCharts(totalActiveData);

      const allCovidDataForChart = {
        labels: labels,
        datasets: [
          {
            label: 'Active Cases',
            data: activeCases,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
          {
            label: 'Total Cases',
            data: totalCases,
            borderColor: 'rgb(53, 162, 235)',
            backgroundColor: 'rgba(53, 162, 235, 0.5)',
          },
          {
            label: 'Total Death',
            data: totalDeaths,
            borderColor: 'rgb(199, 47, 50)',
            backgroundColor: 'rgba(199, 47, 50, 0.5)',
          },
          {
            label: 'Total Recovered',
            data: totalRecovered,
            borderColor: 'rgb(24, 165, 88)',
            backgroundColor: 'rgba(24, 165, 88, 0.5)',
          }
        ],
      };

      setAllDataForCharts(allCovidDataForChart);

      if (isIOS) {
        labelss.length = 0;
        for (let x = 0; x <= 6; x++) {
          const date = moment().format("YYYY-MM-DD");
          const sevenDateBefore = moment(date).subtract(7, 'days').format("YYYY-MM-DD");
          const newDate = moment(sevenDateBefore).add(x, 'days').format("YYYY-MM-DD")
          labelss.push(String(newDate));
          // console.log("New Date: " + newDate);
        }
      } else {
        labelss.length = 0;
        for (let x = 0; x <= 6; x++) {
          const date = moment().format("dddd, YYYY-MM-DD");
          const sevenDateBefore = moment(date).subtract(7, 'days').format("dddd, YYYY-MM-DD");
          const newDate = moment(sevenDateBefore).add(x, 'days').format("dddd, YYYY-MM-DD")
          labelss.push(String(newDate));
          // console.log("New Date: " + newDate);
        }
      }


      const dailyStats = {
        labels: labelss,
        datasets: [
          {
            label: 'Daily New Case(s)',
            data: lastSevenNewCases,
            borderColor: 'rgba(251, 171, 126, 0.7)',
            backgroundColor: 'rgba(251, 171, 126, 0.5)',
          },
          {
            label: 'Daily New Death(s)',
            data: lastSevenDaysDeaths,
            borderColor: 'rgba(199, 47, 50, 0.7)',
            backgroundColor: 'rgba(199, 47, 50, 0.5)',
          },
          {
            label: 'Daily New Recovered',
            data: lastSevenDaysRecovery,
            borderColor: 'rgba(24, 165, 88, 0.7)',
            backgroundColor: 'rgba(24, 165, 88, 0.5)',
          },

        ],
      };


      setDailyStatisticsForCharts(dailyStats);
      // console.log("last7Days: " + last7Labels)

      // const dailyStats = {
      //   last7Labels,
      //   datasets: [
      //     {
      //       label: 'Daily Cases',
      //       data: lastSevenNewCases,
      //       borderColor: 'rgba(255, 99, 132, 0.7)',
      //       backgroundColor: 'rgba(255, 99, 132, 0.5)',
      //     },
      //     {
      //       label: 'Daily Death',
      //       data: lastSevenDaysDeaths,
      //       borderColor: 'rgba(53, 162, 235, 0.7)',
      //       backgroundColor: 'rgba(53, 162, 235, 0.5)',
      //     },
      //     {
      //       label: 'Daily Recovered',
      //       data: lastSevenDaysRecovery,
      //       borderColor: 'rgba(24, 165, 88, 0.7)',
      //       backgroundColor: 'rgba(24, 165, 88, 0.5)',
      //     }
      //   ],
      // };

      // console.log("Charts thingy: " + JSON.stringify(dailyStatisticsForCharts))
      setDataLoaded(true);
    })
  }, [])


  return (
    dataLoaded ?
      <div className="stats--container">
        <Row>
          <Col className="gutter-row" span={24} xs={24} md={24} lg={24}>
            <PageHeader
              className="site-page-header"
              title="COVID-19 Sri Lanka Stats"
              tags={<Tag color="blue">{statType}</Tag>}
              subTitle={`Last Updated: ${moment(currentCovidData.last_update).format('MMMM Do YYYY, h:mm:ss a')}`}
              extra={[
                statType === "Daily Statistics" ? <><Button key="3" onClick={() => setStatType("Daily Statistics")} type="primary">Daily Statistics</Button>,
                  <Button key="2" onClick={() => setStatType("Total Statistics")} >Total Statistics</Button></> : <><Button key="3" onClick={() => setStatType("Daily Statistics")} >Daily Statistics</Button>,
                  <Button key="2" onClick={() => setStatType("Total Statistics")} type="primary">Total Statistics</Button></>
              ]}
            />
          </Col>
        </Row>
        {statType === "Daily Statistics" ? <>
          <Row justify="space-around" align="middle" className="daily--stats--row">
            <Col span={24} xs={24} md={24} lg={24}>
              <Title level={2}>Latest stats at a glance</Title>
            </Col>
            <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
              <Card bordered={false} className="local-new-cases-wrapper">
                <Title level={4} className="">new COVID-19 cases</Title>
                <Title level={2} className="stats--numbers">{numeral(currentCovidData.local_new_cases).format(0, 0)}</Title>
              </Card>
            </Col>
            <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
              <Card bordered={false} className="local-new-recovered-wrapper">
                <Title level={4}>new COVID-19 recovered</Title>
                <Title level={2} className="stats--numbers">{numeral(newRecoveredStat).format(0, 0)}</Title>
              </Card>
            </Col>
            <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
              <Card bordered={false} className="local-new-deaths-wrapper">
                <Title level={4}>new COVID-19 deaths</Title>
                <Title level={2} className="stats--numbers">{numeral(currentCovidData.local_new_deaths).format(0, 0)}</Title>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col className="gutter-row charts-container" align="middle" span={24} xs={24} lg={24} md={24}>
              <Card>
                <Title level={3} className="seven-days-graphs-title">Last Seven (7) Days Statistics in a Graph</Title>
                <Col span={15} xs={24} lg={15} md={15} className="charts-wrapper">
                  <Line options={options} data={dailyStatisticsForCharts} />;
                </Col>
              </Card>
            </Col>
          </Row></>
          : <>
            <Row justify="space-around" align="middle" className="stats--row">
              <Col span={24} xs={24} md={24} lg={24}>
                <Title level={2}>Total Statistics at a glance</Title>
              </Col>
              <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
                <Card bordered={false} className="local-total-cases-wrapper">
                  <Title level={4}>total COVID-19 cases</Title>
                  <Title level={2} className="stats--numbers">{numeral(currentCovidData.local_total_cases).format(0, 0)}</Title>
                </Card>
              </Col>
              <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
                <Card bordered={false} className="local-total-recovered-wrapper">
                  <Title level={4}>total COVID-19 recovered</Title>
                  <Title level={2} className="stats--numbers">{numeral(currentCovidData.local_recovered).format(0, 0)}</Title>
                </Card>
              </Col>
              <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
                <Card bordered={false} className="local-total-deaths-wrapper">
                  <Title level={4}>total COVID-19 deaths</Title>
                  <Title level={2} className="stats--numbers">{numeral(currentCovidData.local_deaths).format(0, 0)}</Title>
                </Card>
              </Col>
              <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
                <Card bordered={false} className="local-active-cases-wrapper">
                  <Title level={4}>Local active cases</Title>
                  <Title level={2} className="stats--numbers">{numeral(currentCovidData.local_active_cases).format(0, 0)}</Title>
                </Card>
              </Col>
            </Row>
            <Row>
              <Col className="gutter-row" align="middle" span={12} xs={24} lg={12} md={12}>
                <Card title="Total Statistics as Graph">
                  <Col span={24} xs={24} lg={24} md={24} className="charts-wrapper">
                    <Line options={options} data={allDataForCharts} />;
                  </Col>
                </Card>
              </Col>
              <Col className="gutter-row charts-wrapper" align="middle" span={12} xs={24} lg={12} md={12}>
                <Card title="Total vs Active Cases">
                  <Col span={24} xs={24} lg={24} md={24} className="charts-wrapper">
                    <Line options={options} data={totalActiveStatsForCharts} />;
                  </Col>
                </Card>
              </Col>
            </Row></>}


        <Footer>
          <Col className="gutter-row" span={24} xs={24} lg={24} md={24} style={{ textAlign: "center", bottom: 0, paddingTop: 30 }}>
            <Title level={5}>Copyright © 2022 <a href="https://www.winauthority.com" target="_blank" rel="noreferrer">Win Innovative Solutions (Private) Limited</a></Title>
            <Title level={5} className="footer-secondary-text">Data collected from Health Promotion Bureau, Sri Lanka</Title>
          </Col>
        </Footer>
      </div>
      :
      <Row justify="space-around" align="middle" className="loader--container">

        <Col span={24} xs={24} lg={24} md={24}>
          {/*<Spin size="large" tip="We are loading the stats. Please hold on. If this persists please drop us an email at hello[@]winauthority.com" />*/}
          <Loader type="Rings" color="#013c7e" height={150} width={150} />
          <Title level={5}>Loading...</Title>
        </Col>
      </Row>
  )

}
