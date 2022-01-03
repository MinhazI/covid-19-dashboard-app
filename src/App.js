import { useEffect, useState } from "react";
import { initializeApp, setLogLevel } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { Row, Col, Typography, Space, Spin, Card, PageHeader } from 'antd';
import moment from 'moment';
import Loader from "react-loader-spinner";
import numeral from "numeral";
import { Line } from 'react-chartjs-2';
import faker from 'faker';
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
  const [startDate, setStartDate] = useState("2020-01-27");

  const allCovidDataFromFirebase = []

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


  useEffect(() => {
    const activeCases = [];
    const totalCases = [];
    const allDates = [];
    const totalDeaths = [];
    const totalRecovered = [];
    const covidDataRef = ref(db, currentDate);
    onValue(covidDataRef, (snapshot) => {
      setCurrentCovidData(snapshot.val());
    });
    let proceed = false;
    const labels = [];
    const covidDataAll = ref(db);
    onValue(covidDataAll, (snapshot) => {
      snapshot.forEach(
        ss => {
          allCovidDataFromFirebase.push(ss.val());
          activeCases.push(ss.val().local_active_cases);
          allDates.push(ss.val().current_date);
          totalCases.push(ss.val().local_total_cases);
          totalDeaths.push(ss.val().local_deaths);
          totalRecovered.push(ss.val().local_recovered);
        }
      )

      for (let x = 1; x <= activeCases.length - 1; x++) {
        const date = moment(startDate).add(x, 'days').format("YYYY-MM-DD")
        labels.push(date)
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
          {
            label: 'Total Death',
            data: totalDeaths,
            borderColor: 'rgb(186, 76, 88)',
            backgroundColor: 'rgba(186, 76, 88, 0.5)',
          },
          {
            label: 'Total Recovered',
            data: totalRecovered,
            borderColor: 'rgb(24, 165, 88)',
            backgroundColor: 'rgba(24, 165, 88, 0.5)',
          }
        ],
      };

      setAllDataForCharts(allCovidDataForChart)

      setDataLoaded(true);
    })
  }, [])


  return (
    dataLoaded ?
      <div className="stats--container">
        <Row>
          <Col className="gutter-row hide-pc" span={24} xs={24} md={24} lg={24}>
            <PageHeader
              className="site-page-header"
              title="COVID-19 Sri Lanka Stats"
              footer={`Last Updated: ${moment(currentCovidData.last_update).format('MMMM Do YYYY, h:mm:ss a')}`}
            />
          </Col>
          <Col className="gutter-row hide-mobile" span={24} xs={24} md={24} lg={24}>
            <PageHeader
              className="site-page-header"
              title="COVID-19 Sri Lanka Stats"
              subTitle={`Last Updated: ${moment(currentCovidData.last_update).format('MMMM Do YYYY, h:mm:ss a')}`}
            />
          </Col>
        </Row>
        <Row justify="space-around" align="middle" className="stats--row">
          <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
            <Card title="Local new cases" bordered={true}>
              <Title level={2} className="stats--numbers">{numeral(currentCovidData.local_new_cases).format(0, 0)}</Title>
            </Card>
          </Col>
          <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
            <Card title="Local new deaths" bordered={true}>
              <Title level={2} className="stats--numbers">{numeral(currentCovidData.local_new_deaths).format(0, 0)}</Title>
            </Card>
          </Col>
          <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
            <Card title="Local total cases" bordered={true}>
              <Title level={2} className="stats--numbers">{numeral(currentCovidData.local_total_cases).format(0, 0)}</Title>
            </Card>
          </Col>
          <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
            <Card title="Local total recovered" bordered={true}>
              <Title level={2} className="stats--numbers">{numeral(currentCovidData.local_recovered).format(0, 0)}</Title>
            </Card>
          </Col>
          <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
            <Card title="Local total deaths" bordered={true}>
              <Title level={2} className="stats--numbers">{numeral(currentCovidData.local_deaths).format(0, 0)}</Title>
            </Card>
          </Col>
          <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
            <Card title="Local active cases" bordered={true}>
              <Title level={2} className="stats--numbers">{numeral(currentCovidData.local_active_cases).format(0, 0)}</Title>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col className="gutter-row" align="middle" span={12} xs={24} lg={12} md={12}>
            <Card title="Total Statistics as Graph">
              <Line options={options} data={allDataForCharts} />;
            </Card>
          </Col>
          <Col className="gutter-row" align="middle" span={12} xs={24} lg={12} md={12}>
            <Card title="Total vs Active Cases">
              <Line options={options} data={totalActiveStatsForCharts} />;
            </Card>
          </Col>
        </Row>
        <Row>
          <Col className="gutter-row" span={24} xs={24} lg={24} md={24} style={{ textAlign: "center", bottom: 0, paddingTop: 30 }}>
            <Title level={5}>An Innovation of Win Authority - A brand of Win Innovative Solutions (Private) Limited</Title>
            <Title level={5}>Data taken from Health Promo Bureau, Sri Lanka</Title>
          </Col>
        </Row>
        {/* {allCovidData.map((data) => <>
          <Row style={{marginBottom: 100}}>
            <Col className="gutter-row" span={24} xs={24} lg={24} md={24}>
            <Title level={4}>{data.current_date}</Title>
            </Col>
            <Col className="gutter-row" span={4} xs={24} lg={4} md={4}>
              <Title level={3}>Local total cases</Title>
              <Title level={4}>{data.local_total_cases}</Title>
            </Col>
            <Col className="gutter-row" span={4} xs={24} lg={4} md={4}>
              <Title level={3}>Local total recovered</Title>
              <Title level={4}>{data.local_recovered}</Title>
            </Col>
            <Col className="gutter-row" span={4} xs={24} lg={4} md={4}>
              <Title level={3}>Local total deaths</Title>
              <Title level={4}>{data.local_deaths}</Title>
            </Col>
            <Col className="gutter-row" span={4} xs={24} lg={4} md={4}>
              <Title level={3}>Local active cases</Title>
              <Title level={4}>{data.local_active_cases}</Title>
            </Col>
            <Col className="gutter-row" span={4} xs={24} lg={4} md={4}>
              <Title level={3}>Local new cases</Title>
              <Title level={4}>{data.local_new_cases}</Title>
            </Col>
            <Col className="gutter-row" span={4} xs={24} lg={4} md={4}>
              <Title level={3}>Local new deaths</Title>
              <Title level={4}>{data.local_new_deaths}</Title>
            </Col>

          </Row>
        </>)} */}


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
