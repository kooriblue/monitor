//订单统计

import React, { PureComponent } from 'react';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {
    Card, Table, DatePicker, Row, Col, Tabs, Select
} from 'antd';
import {
    G2, Chart, Geom, Axis, Tooltip,
    Coord, Legend, Label
} from 'bizcharts';
import DataSet from '@antv/data-set';
import { connect } from 'dva';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './QueryOrder.less';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn'); 

const RangePicker = DatePicker.RangePicker;
const TabPane = Tabs.TabPane;
const Option = Select.Option;

@connect(({ appinfo, payorder }) => ({
    appinfo, payorder,
}))
class OrderStatistics extends PureComponent {
    state = {
        startDate: moment().startOf('year').format('YYYY-MM-DD 00:00:00'),
        endDate: moment().endOf('year').format('YYYY-MM-DD 23:59:59'),
        appBundleId: '',
        curTab: 1,
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({
            type: 'appinfo/appinfo',
        });

        this.fetchGroupByDate({
            startDate: moment().startOf('year').format('YYYY-MM-DD 00:00:00'),
            endDate: moment().endOf('year').format('YYYY-MM-DD 23:59:59'),
            appBundleId: '',
        });
    }

    componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch({
            type: 'payorder/clear'
        });
    }

    transformDateBasedData = (startDate, endDate, data = []) => {
        var result = [];
        var numOfDays = ((moment(endDate).unix() - moment(startDate).unix()) / (60*60*24)).toFixed(0);
        var seek = 0;

        for (var i = 0; i < numOfDays; i++) {
            var curDate = moment(startDate).add(i, 'days');
            var curSummary = {};
            curSummary["date"] = curDate.format('YYYY-MM-DD').substr(2);
            
            curSummary["totalAmount"] = (0).toFixed(2);
            if (seek < data.length && data[seek].date === curDate.valueOf()) {
                curSummary["totalAmount"] = (data[seek]["totalAmount"] / 100).toFixed(2);
                seek++;
            }
            result.push(curSummary);
        }
        return result;
    }

    fetchGroupByDate = (params = {}) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'payorder/summaryGroupByDate',
            payload: params,
        })
    }

    fetchGroupByApp = (params = {}) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'payorder/summaryGroupByApp',
            payload: params,
        })
        // reqwest({
        //     url: '/proxy/payorder/getOrderSummaryGroupByApp',
        //     method: 'post',
        //     data: params,
        //     type: 'json',
        // }).then((data) => {
        //     var res = JSON.parse(data.response);

        //     if (res.data.appOrderStatus == 0) {
        //         this.setState({
        //             appBaseData: res.data.appOrderSummary,
        //         })
        //     } else {
        //         this.setState({
        //             appBaseData: [],
        //         })
        //     }
        // })
    }

    handleTimeChange = (time) => {
        this.setState({
            startDate: time[0].format('YYYY-MM-DD 00:00:00'),
            endDate: time[1].format('YYYY-MM-DD 23:59:59'),
        })

        if (this.state.curTab === 1) {
            this.fetchGroupByDate({
                startDate: time[0].format('YYYY-MM-DD 00:00:00'),
                endDate: time[1].format('YYYY-MM-DD 23:59:59'),
                appBundleId: this.state.appBundleId,
            });
        } else if (this.state.curTab === 2) {
            this.fetchGroupByApp({
                startDate: time[0].format('YYYY-MM-DD 00:00:00'),
                endDate: time[1].format('YYYY-MM-DD 23:59:59'),
            })
        }
    }

    handleAppChange = (value) => {
        this.setState({
            appBundleId: value,
        })

        this.fetchGroupByDate({
            startDate: this.state.startDate,
            endDate: this.state.endDate,
            appBundleId: value,
        })
    }

    renderLineChart = () => {
        const {
            payorder,
        } = this.props;

        const dateBaseData = this.transformDateBasedData(this.state.startDate, this.state.endDate, payorder.dateBaseData);

        const dateBaseCols = {
            "date": {
                tickCount: (dateBaseData.length >= 31 ? 15 : dateBaseData.length),
                range: [0.02, 0.98]
            },
            "totalAmount": {
                min: 0.00,
                type: 'linear',
            }
        };

        const tableCols = [
            {
                title: formatMessage({ id: "payorder.statistics.date" }),
                dataIndex: 'date',
                width: '30%',
            },
            {
                title: formatMessage({ id: "payorder.statistics.total-amount" }),
                dataIndex: 'totalAmount',
            },
        ];

        var tableData = [];
        for (var i = 0; i < dateBaseData.length; i++) {
            tableData.push(dateBaseData[dateBaseData.length - i - 1]);
        }

        return (
            <div>
                {/* 总数 */}
                <div>
                    <Card className={styles.summary} bordered={false}>
                        <Row type="flex" justify="space-around">
                            <Col>
                                <div>
                                    <div><FormattedMessage id="payorder.summary.count" /></div>
                                    <div className={styles.money}>
                                        <div className={styles.total}>{payorder.count}</div>
                                        <div className={styles.yuan}><FormattedMessage id="payorder.summary.bi" /></div>
                                    </div>
                                </div>
                            </Col>
                            <Col>
                                <div>
                                    <div><FormattedMessage id="payorder.summary.total-money" /></div>
                                    <div className={styles.money}>
                                        <div className={styles.total}>{payorder.totalAmount}</div>
                                        <div className={styles.yuan}><FormattedMessage id="payorder.summary.yuan" /></div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </div>
                {/* 折线图 */}
                {dateBaseData.length == 0 ? (
                    <h3><FormattedMessage id="payorder.statistics.date-empty" /></h3>
                ) : (
                    <div>
                    <Chart
                        style={{ marginLeft: -30, paddingRight: 30 }}
                        height={-window.innerHeight / 4 + 600}
                        data={dateBaseData}
                        scale={dateBaseCols}
                        forceFit>
                        {/* 横坐标 */}
                        <Axis 
                            name="date" 
                            label={{
                                rotate: 50,
                                offset: 20,
                            }} 
                        />
                        {/* 纵坐标 */}
                        <Axis name="totalAmount"/>
                        {/* 鼠标移到图上时的提示 */}
                        <Tooltip crosshairs={{ type: "y" }} />
                        {/* 图的表示方式 */}
                        {/* 折线 */}
                        <Geom type="line" position="date*totalAmount" size={2} />
                        {/* 区域 */}
                        <Geom type="area" position="date*totalAmount" />
                        {/* 标志点 */}
                        {/* <Geom
                            type="point"
                            position="date*totalAmount"
                            size={4}
                            shape={"circle"}
                            style={{
                                stroke: "#fff",
                                lineWidth: 1
                            }}
                        /> */}
                    </Chart>
                    </div>
                )}
                {/* 直观数据 */}
                <hr />
                <Table
                    bordered
                    columns={tableCols}
                    dataSource={tableData}
                />
            </div>
        )
    }

    renderPieChart = () => {
        const { DataView } = DataSet;
        const { payorder } = this.props;
        
        const dv = new DataView();
        dv.source(payorder.appBaseData).transform({
            type: "percent",
            field: "totalAmount",
            dimension: "item",
            as: "percent"
        });

        const appBaseCols = {
            percent: {
                formatter: val => {
                    val = val * 100;
                    val = val.toFixed(2);
                    val = val + "%";
                    return val;
                }
            }
        };

        const tableCols = [
            {
                title: formatMessage({ id: "device.app-bundle-id" }),
                dataIndex: 'item',
                width: '30%',
            },
            {
                title: formatMessage({ id: "payorder.statistics.total-amount" }),
                dataIndex: 'totalAmount',
                render: text => {
                    var val = (text * 1.0 / 100).toFixed(2);
                    return (
                        <div>{val}</div>
                    )
                }
            }
        ];

        return (
            <div>
                {payorder.appBaseData.length == 0 ? (
                    <h3><FormattedMessage id="payorder.statistics.date-empty" /></h3>
                ) : (
                    <Chart
                        height={-window.innerHeight / 4 + 600}
                        data={dv}
                        scale={appBaseCols}
                        padding={[20, 140, 20, 40]}
                        forceFit
                    >
                        {/* 描述坐标系，theta为极坐标系 */}
                        <Coord type="theta" radius={0.75} />
                        <Axis name="percent" />
                        {/* 图中元素意义的说明 */}
                        <Legend
                            position="right"
                            offsetY={-window.innerHeight / 2 + 120}
                            offsetX={-100}
                        />
                        <Tooltip
                            showTitle={false}
                            itemTpl="<li><span style=&quot;background-color:{color};&quot; class=&quot;g2-tooltip-marker&quot;></span>{name}: {value}</li>"
                        />
                        <Geom 
                            type="intervalStack"
                            position="percent"
                            color="item"
                            tooltip={[
                                "item*percent",
                                (item, percent) => {
                                    percent = percent * 100;
                                    percent = percent.toFixed(2);
                                    percent = percent + "%";
                                    return {
                                        name: item,
                                        value: percent
                                    };
                                }
                            ]}
                        >
                            <Label
                                content="percent"
                                offset={-40}
                                textStyle={{
                                    rotate: 0,
                                    textAlign: "center",
                                    shadowBlur: 2,
                                    shadowColor: "rgba(0, 0, 0, .45)"
                                }}
                            />
                        </Geom>
                    </Chart>
                )}
                <hr />
                <Table
                    bordered
                    columns={tableCols}
                    dataSource={payorder.appBaseData}
                />
            </div>
        )
    }

    handleTabsChange = (key) => {
        const { dispatch } = this.props;
        if (key == "1") {
            this.setState({ curTab: 1 });
            this.fetchGroupByDate({
                startDate: this.state.startDate,
                endDate: this.state.endDate,
                appBundleId: '',
            });
    
        } else if (key == "2") {
            this.setState({ curTab: 2 });
            this.fetchGroupByApp({
                startDate: this.state.startDate,
                endDate: this.state.endDate,
            })
        }
    }

    render() {
        const { appinfo } = this.props;
        return (
            <PageHeaderWrapper title={<FormattedMessage id="payorder.statistics" />}>
                <Card>
                    <Tabs
                        defaultActiveKey="1"
                        onChange={this.handleTabsChange}
                        tabBarExtraContent={
                            <div className={styles.tableListForm} style={{ marginLeft: 10 }}>
                                <RangePicker
                                    defaultValue={[moment().startOf('year'), moment().endOf('year')]}
                                    onChange={this.handleTimeChange}
                                    ranges = {{
                                        '今天': [moment().startOf('day'), moment().endOf('day')],
                                        '过去一周': [moment().subtract(6, 'days'), moment()],
                                        '本月': [moment().startOf('month'), moment().endOf('month')],
                                        '上个月': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
                                        '今年': [moment().startOf('year'), moment().endOf('year')],
                                        '去年': [moment().subtract(1, 'years').startOf('year'), moment().subtract(1, 'years').endOf('year')],
                                    }}
                                    style={{ marginLeft: 10 }}
                                />
                                {this.state.curTab === 1 ? (
                                    <span style={{ marginLeft: 5 }}>
                                        {appinfo.appInfo.length == 0 ? (
                                            <Select
                                                defaultValue=""
                                                placeholder={formatMessage({ id: "payorder.placeholder.app" })}
                                            >
                                                <Option value=""><FormattedMessage id="payorder.option" /></Option>
                                            </Select>
                                        ) : (
                                            <Select
                                                defaultValue=""
                                                placeholder={formatMessage({ id: "payorder.placeholder.app" })}
                                                onChange={this.handleAppChange}
                                            >
                                                <Option value=""><FormattedMessage id="payorder.statistics.all-app" /></Option>
                                                {appinfo.appInfo.map((item, index) => {
                                                        return <Option value={item.appBundleId}>{item.appName}</Option>
                                                    })
                                                }
                                            </Select>
                                        )}
                                    </span>
                                ) : (
                                    <span></span>
                                )}
                            </div>
                        }
                    >
                        <TabPane tab={formatMessage({ id: "payorder.statistics.line-chart-tab" })} key="1">{this.renderLineChart()}</TabPane>
                        <TabPane tab={formatMessage({ id: "payorder.statistics.pie-chart-tab" })} key="2">{this.renderPieChart()}</TabPane>
                    </Tabs>
                </Card>
            </PageHeaderWrapper>
        )
    }
}

export default OrderStatistics;