import { useEffect, useState } from "react";
import { initializeApp, setLogLevel } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue, set } from "firebase/database";
import { Row, Col, Typography, Space, Spin, Card, PageHeader } from 'antd';
import moment from 'moment';
import Loader from "react-loader-spinner";
import numeral from "numeral";

export default function App() {

  const [currentCovidData, setCurrentCovidData] = useState([]);
  const [allCovidData, setAllCovidData] = useState([])
  const [dataLoaded, setDataLoaded] = useState(false);

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
    const covidDataRef = ref(db, currentDate);
    onValue(covidDataRef, (snapshot) => {
      setCurrentCovidData(snapshot.val());
      // setDataLoaded(true)
      // console.log(currentCovidData)
    });

    const covidDataAll = ref(db);
    onValue(covidDataAll, (snapshot) => {
      snapshot.forEach(
        ss => { allCovidDataFromFirebase.push(ss.val()) }
      )
      setAllCovidData(allCovidDataFromFirebase);
      setDataLoaded(true)
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
              {numeral(currentCovidData.local_new_cases).format(0, 0)}
            </Card>
          </Col>
          <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
            <Card title="Local new deaths" bordered={true}>
              {numeral(currentCovidData.local_new_deaths).format(0, 0)}
            </Card>
          </Col>
          <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
            <Card title="Local total cases" bordered={true}>
              {numeral(currentCovidData.local_total_cases).format(0, 0)}
            </Card>
          </Col>
          <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
            <Card title="Local total recovered" bordered={true}>
              {numeral(currentCovidData.local_recovered).format(0, 0)}
            </Card>
          </Col>
          <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
            <Card title="Local total deaths" bordered={true}>
              {numeral(currentCovidData.local_deaths).format(0, 0)}
            </Card>
          </Col>
          <Col className="gutter-row" span={6} xs={24} lg={4} md={4}>
            <Card title="Local active cases" bordered={true}>
              {numeral(currentCovidData.local_active_cases).format(0, 0)}
            </Card>
          </Col>
        </Row>
        <Row>
          <Col className="gutter-row" span={24} xs={24} lg={24} md={24} style={{ textAlign: "center", bottom: 0 }}>
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
