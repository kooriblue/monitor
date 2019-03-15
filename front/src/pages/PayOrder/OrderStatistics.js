//订单统计

import React, { PureComponent } from 'react';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {
    Card, Input, Button, Form, Table, DatePicker, Row, Col, Tabs, Select, message
} from 'antd';
// import { TimelineChart, MiniArea } from 'ant-design-pro/lib/Charts';
import {
    G2, Chart, Geom, Axis, Tooltip,
    Coord, Legend, Label
} from 'bizcharts';
import DataSet from '@antv/data-set';

import reqwest from 'reqwest';
import { changeMoneyFormat } from '@/utils/changeMoneyFormat';
import { changeTimeFormat } from '@/utils/changeTimeFormat';

import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './QueryOrder.less';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn'); 

const FormItem = Form.Item;
const RangePicker = DatePicker.RangePicker;
const TabPane = Tabs.TabPane;
const Option = Select.Option;

@Form.create()
class OrderStatistics extends PureComponent {
    state = {
        startDate: moment().subtract(6, 'days').format('YYYY-MM-DD 00:00:00'),
        endDate: moment().format('YYYY-MM-DD 23:59:59'),
        dateBaseData: [], //折线图数据
        count: 0, //折线图订单笔数
        totalAmount: 0, //折线图订单

        appBaseData: [], //饼状图数据
        app: [],
        appBundleId: '',
        currency: '',
    }

    componentDidMount() {
        reqwest({
            url: '/proxy/payorder/getAppInfo',
            method: 'post',
            type: 'json',
        }).then((data) => {
            if (typeof(data.response) == "string") {
                var res = JSON.parse(data.response);
                    
                this.setState({
                    app: res.data,
                });
            } else {
                message.error(formatMessage({ id: "app.fail-get-app-list" }), 1);
            }
            
        });

        this.fetchGroupByDate({
            startDate: moment().subtract(6, 'days').format('YYYY-MM-DD 00:00:00'),
            endDate: moment().format('YYYY-MM-DD 23:59:59'),
            appBundleId: '',
            currency: '',
        });

        this.fetchGroupByApp({
            startDate: moment().subtract(6, 'days').format('YYYY-MM-DD 00:00:00'),
            endDate: moment().format('YYYY-MM-DD 23:59:59'),
        })
    }

    transformDateBasedData = (startDate, endDate, data = []) => {
        var result = [];
        var numOfDays = ((moment(endDate).unix() - moment(startDate).unix()) / (60*60*24)).toFixed(0);
        var seek = 0;

        for (var i = 0; i < numOfDays; i++) {
            var curDate = moment(startDate).add(i, 'days');
            var curSummary = {};
            curSummary["date"] = curDate.format('YYYY-MM-DD').substr(2);

            // for (var j = 0; j < this.state.app.length; j++) {
            //     curSummary[this.state.app[j].appBundleId] = 0;
            // }

            // while (seek < data.length && data[seek].date === curDate.valueOf()) {
            //     curSummary[data[seek]["appBundleId"]] = (data[seek]["totalAmount"] / 100).toFixed(2);
            //     seek++;
            // }
            
            curSummary["totalAmount"] = (0).toFixed(2);
            curSummary["rmbTotalAmount"] = (0).toFixed(2);
            curSummary["usdTotalAmount"] = (0).toFixed(2);
            if (seek < data.length && data[seek].date === curDate.valueOf()) {
                curSummary["totalAmount"] = (data[seek]["totalAmount"] / 100).toFixed(2);
                curSummary["rmbTotalAmount"] = (data[seek]["rmbTotalAmount"] == null ? (0).toFixed(2) : (data[seek]["rmbTotalAmount"] / 100).toFixed(2));
                curSummary["usdTotalAmount"] = (data[seek]["usdTotalAmount"] == null ? (0).toFixed(2) : (data[seek]["usdTotalAmount"] / 100).toFixed(2));
                seek++;
            }
            result.push(curSummary);
        }
        return result;
    }

    fetchGroupByDate = (params = {}) => {
        reqwest({
            url: '/proxy/payorder/getOrderSummaryGroupByDate',
            method: 'post',
            data: params,
            type: 'json',
        }).then((data) => {
            if (data.status == 0) {
                var res = JSON.parse(data.response);
                if (res.code == 200) {
                    var dateBaseData = this.transformDateBasedData(params.startDate, params.endDate, res.data.dateOrderSummary);
                    this.setState({
                        dateBaseData: dateBaseData,
                        count: res.data.orderSummary.count,
                        totalAmount: (res.data.orderSummary.totalMoney / 100).toFixed(2),
                    })
                } else {
                    this.setState({
                        dateBaseData: [],
                        count: 0,
                        totalAmount: (0).toFixed(2),
                    })
                }
            } else {
                message.error(formatMessage({ id: "payorder.statistics.fail-to-get-summary-date" }), 1);
            }
        })
    }

    fetchGroupByApp = (params = {}) => {
        reqwest({
            url: '/proxy/payorder/getOrderSummaryGroupByApp',
            method: 'post',
            data: params,
            type: 'json',
        }).then((data) => {
            var res = JSON.parse(data.response);

            if (res.data.appOrderStatus == 0) {
                this.setState({
                    appBaseData: res.data.appOrderSummary,
                })
            } else {
                this.setState({
                    appBaseData: [],
                })
            }
        })
    }

    handleTimeChange = (time, timeString) => {
        this.setState({
            startDate: time[0].format('YYYY-MM-DD 00:00:00'),
            endDate: time[1].format('YYYY-MM-DD 23:59:59'),
        })

        this.fetchGroupByDate({
            startDate: time[0].format('YYYY-MM-DD 00:00:00'),
            endDate: time[1].format('YYYY-MM-DD 23:59:59'),
            appBundleId: this.state.appBundleId,
            currency: this.state.currency,
        });

        this.fetchGroupByApp({
            startDate: time[0].format('YYYY-MM-DD 00:00:00'),
            endDate: time[1].format('YYYY-MM-DD 23:59:59'),
        })
    }

    handleSearch = e => {
        const { form } = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.setState({
                    currency: values.currency,
                    appBundleId: values.appBundleId,
                })

                this.fetchGroupByDate({
                    startDate: this.state.startDate,
                    endDate: this.state.endDate,
                    appBundleId: values.appBundleId,
                    currency: values.currency,
                })
            }
        })
    }

    renderLineChart = () => {
        const { 
            form: { getFieldDecorator },
        } = this.props;

        const dateBaseCols = {
            "date": {
                tickCount: (this.state.dateBaseData.length >= 31 ? 15 : this.state.dateBaseData.length),
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
            {
                title: 'RMB',
                dataIndex: 'rmbTotalAmount',
            },
            {
                title: 'USD',
                dataIndex: 'usdTotalAmount',
            }
        ];

        var tableData = [];
        for (var i = 0; i < this.state.dateBaseData.length; i++) {
            tableData.push(this.state.dateBaseData[this.state.dateBaseData.length - i - 1]);
        }

        return (
            <div>
                {/* 选择条件 */}
                <div className={styles.tableListForm} style={{ marginBottom: 30 }}>
                    <Form onSubmit={this.handleSearch}>
                        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                            <Col md={8} sm={24}>
                                <FormItem label={<FormattedMessage id="device.app-bundle-id" />}>
                                    {getFieldDecorator('appBundleId', { initialValue: "" })(
                                        this.state.app.length == 0 ? (
                                            <Select
                                                placeholder={formatMessage({ id: "payorder.placeholder.app" })}
                                            >
                                                <Option value=""><FormattedMessage id="payorder.option" /></Option>
                                            </Select>
                                        ) : (
                                            <Select
                                                placeholder={formatMessage({ id: "payorder.placeholder.app" })}
                                            >
                                                <Option value=""><FormattedMessage id="payorder.statistics.all-app" /></Option>
                                                {this.state.app.map((item, index) => {
                                                        return <Option value={item.appBundleId}>{item.appName}</Option>
                                                    })
                                                }
                                            </Select>
                                        )
                                    )}
                                </FormItem>
                            </Col>
                            <Col md={8} sm={24}>
                                <FormItem label={<FormattedMessage id="payorder.currency" />}>
                                    {getFieldDecorator('currency', { initialValue: "" })(
                                        <Select>
                                            <Option value=""><FormattedMessage id="payorder.statistics.all-currency" /></Option>
                                            <Option value="RMB">RMB</Option>
                                            <Option value="USD">USD</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col md={8} sm={24}>
                                <span className={styles.submitButton}>
                                    <Button type="primary" htmlType="submit">
                                        <FormattedMessage id="app.query" />
                                    </Button>
                                </span>
                            </Col>
                        </Row>
                    </Form>
                </div>
                {/* 总数 */}
                <div>
                    <Card className={styles.summary} bordered={false}>
                        <Row type="flex" justify="space-around">
                            <Col>
                                <div>
                                    <div><FormattedMessage id="payorder.summary.count" /></div>
                                    <div className={styles.money}>
                                        <div className={styles.total}>{this.state.count}</div>
                                        <div className={styles.yuan}><FormattedMessage id="payorder.summary.bi" /></div>
                                    </div>
                                </div>
                            </Col>
                            <Col>
                                <div>
                                    <div><FormattedMessage id="payorder.summary.total-money" /></div>
                                    <div className={styles.money}>
                                        <div className={styles.total}>{this.state.totalAmount}</div>
                                        <div className={styles.yuan}><FormattedMessage id="payorder.summary.yuan" /></div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </div>
                {/* 折线图 */}
                {this.state.dateBaseData.length == 0 ? (
                    <h3><FormattedMessage id="payorder.statistics.date-empty" /></h3>
                ) : (
                    <Chart
                        style={{ marginLeft: -30, paddingRight: 30 }}
                        height={-window.innerHeight / 4 + 600}
                        data={this.state.dateBaseData}
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
        
        const dv = new DataView();
        dv.source(this.state.appBaseData).transform({
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
                {this.state.appBaseData.length == 0 ? (
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
                    dataSource={this.state.appBaseData}
                />
            </div>
        )
    }

    handleTabsChange = (key) => {
        if (key == "1") {

        } else if (key == "2") {

        }
    }

    render() {
        return (
            <PageHeaderWrapper title={<FormattedMessage id="payorder.statistics" />}>
                <Card>
                    <Tabs
                        defaultActiveKey="1"
                        onChange={this.handleTabsChange}
                        tabBarExtraContent={
                            <div className={styles.tableListForm} style={{ marginLeft: 10 }}>
                                <span><FormattedMessage id="payorder.time-range" />: </span>
                                <RangePicker
                                    defaultValue={[moment().subtract(6, 'days'), moment()]}
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