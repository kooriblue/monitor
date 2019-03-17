//查询订单

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {
    Card, Button, Form, Table, DatePicker,
    Row, Col, Select, Affix, Menu, Dropdown,
    Icon
} from 'antd';
import { changeMoneyFormat } from '@/utils/changeMoneyFormat';
import { changeTimeFormat } from '@/utils/changeTimeFormat';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './QueryOrder.less';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
// import reqwest from 'reqwest';
// import md5 from 'js-md5';
// import { passwordSalt } from '../../../settings';

const FormItem = Form.Item;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;

@connect(({ appinfo, payorder, loading }) => ({
    appinfo,
    payorder,
    quering: loading.effects['payorder/query'],
}))
@Form.create()
class QueryOrder extends PureComponent {

    state = {
        startTime: "1970-01-01 00:00:00",
        endTime: "9999-12-31 00:00:00",
        appname: '',  //appBundleId
        currency: '',
        pagination: {},  //分页
        curRecord: {}, //被查询详情的记录
        orderDtl: false,
        deviceDtl: false,

        appDevice: {},
    }

    //初始化，获取当天的订单数据和应用列表
    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({
            type: 'appinfo/appinfo',
        });
        // reqwest({
        //     url: '/proxy/payorder/getAppInfo',
        //     method: 'post',
        //     type: 'json',
        // }).then((data) => {
        //     if (typeof(data.response) == "string") {
        //         var res = JSON.parse(data.response);
                    
        //         this.setState({
        //             app: res.data,
        //         });
        //     } else {
        //         message.error(formatMessage({ id: "app.fail-get-app-list" }), 1);
        //     }
            
        // });

        var date = new Date();
        var month = ((date.getMonth()+1) < 10) ? ('0'+(date.getMonth()+1)) : (date.getMonth()+1);
        var day = (date.getDate() < 10) ? ('0'+date.getDate()) : date.getDate();
        var start = date.getFullYear() + '-' + month + '-' + day + ' 00:00:00';
        var end = date.getFullYear() + '-' + month + '-' + day + ' 23:59:59';

        this.fetch({
            startTime: start,
            endTime: end,
            appname: '',
            currency: ''
        });

        this.setState({
            startTime: start,
            endTime: end,
        })
    }

    componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch({
            type: 'payorder/clear',
        })
    }

    //处理点击订单详情事件
    handleOrderDetails = (record) => {
        this.setState({
            curRecord: record,
            orderDtl: true,
        });
    }

    

    //渲染详情页
    renderOrderDetails = () => {
        var rec = this.state.curRecord;

        var details = [
            {
                "attr": formatMessage({ id: "payorder.member-id" }),
                "content": rec["memberId"]
            },
            {
                "attr": formatMessage({ id: "payorder.order-id" }),
                "content": rec["orderId"]
            },
            {
                "attr": formatMessage({ id: "payorder.app-id" }),
                "content": rec["appBundleId"]
            },
            {
                "attr": formatMessage({ id: "payorder.create-time" }),
                "content": changeTimeFormat(rec["createTime"])
            },
            {
                "attr": formatMessage({ id: "payorder.finish-time" }),
                "content": changeTimeFormat(rec["finishTime"])
            },
            {
                "attr": formatMessage({ id: "payorder.pay-channel-id" }),
                "content": (rec["payChannelId"] == 1 ? '支付宝' : 'PayPal')
            },
            {
                "attr": formatMessage({ id: "payorder.product-count" }),
                "content": rec["productCount"]
            },
            {
                "attr": formatMessage({ id: "payorder.product-detail" }),
                "content": rec["productDetail"]
            },
            {
                "attr": formatMessage({ id: "payorder.product-no" }),
                "content": rec["productNo"]
            },
            {
                "attr": formatMessage({ id: "payorder.pay-amount" }),
                "content": changeMoneyFormat(rec["productPayAmount"])
            },
            {
                "attr": formatMessage({ id: "payorder.currency" }),
                "content": rec["productPayCurrency"]
            },
            {
                "attr": formatMessage({ id: "payorder.product-price" }),
                "content": changeMoneyFormat(rec["productPrice"])
            },
            {
                "attr": formatMessage({ id: "payorder.product-title" }),
                "content": rec["productTitle"]
            },
            
        ];

        var cols = [
            {
                dataIndex: "attr",
                width: 140,
            },
            {
                dataIndex: "content",
            }
        ];

        return (
            <Card bordered={false}>
                <div>
                    <Affix offsetTop={10}>
                        <Button className={styles.detailBtn} type="primary" onClick={this.handleOrderFinish}>
                            <FormattedMessage id="app.return" />
                        </Button>
                    </Affix>
                    <Table 
                        bordered
                        showHeader={false}
                        pagination={false}
                        dataSource={details}
                        columns={cols}
                    />
                </div>
            </Card>
        )
    }

    handleOrderFinish = () => {
        this.setState({
            curRecord: {},
            orderDtl: false,
            curUserExpiredTime: 0,
            curProductInfo: {},
        })
    };

    //渲染表格数据
    renderRecords = () => {
        const { 
            form: { getFieldDecorator },
            appinfo,
            payorder,
            quering
        } = this.props;
        
        var columns = [
            {
                title: formatMessage({ id: "payorder.member-id" }),
                dataIndex: 'memberId',
                width: '10%',
                fixed: 'left',
            },
            {
                title: formatMessage({ id: "payorder.app-id" }),
                dataIndex: 'appBundleId',
                width: '15%',
            },
            {
                title: formatMessage({ id: "payorder.pay-amount" }),
                dataIndex: 'productPayAmount',
                width: '13%',
                render: text => {
                    var num = changeMoneyFormat(text);
                    return (
                        <div>{num}</div>
                    );
                }
            },
            {
                title: formatMessage({ id: "payorder.currency" }),
                dataIndex: 'productPayCurrency',
                width: '10%'
            },
            {
                title: formatMessage({ id: "payorder.create-time" }),
                dataIndex: 'createTime',
                width: '19%',
                render: text => {
                    var dateString = changeTimeFormat(text);
                    return (
                        <div>{dateString}</div>
                    )
                },
            },
            {
                title: formatMessage({ id: "payorder.finish-time" }),
                dataIndex: 'finishTime',
                width: '19%',
                render: text => {
                    var dateString = changeTimeFormat(text);
                    return (
                        <div>{dateString}</div>
                    )
                },
            },
            {
                title: formatMessage({ id: "payorder.operation" }),
                dataIndex: 'operation',
                render: (text, record, index) => {
                    const menu = (
                        <Menu>
                            <Menu.Item>
                                {/* 注意要加bind函数！！！ */}
                                <a href="#" onClick={this.handleOrderDetails.bind(this, record)}>
                                    <FormattedMessage id="payorder.order-detail" />
                                </a>
                            </Menu.Item>
                        </Menu>
                    );

                    return (
                        <Dropdown overlay={menu}>
                            <a className="ant-dropdown-link" href="#">
                                <FormattedMessage id="member.choose-operation" /> <Icon type="down" />
                            </a>
                        </Dropdown>
                    )
                }
            },
        ];

        return (
            <Card bordered={false}>
                <div>
                    {/* 查询部分 */}
                    <div className={styles.tableListForm}>
                       <Form onSubmit={this.handleSearch}>
                            <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                                <FormItem label={<FormattedMessage id="payorder.time-range" />}>
                                    {getFieldDecorator('timeRange', { initialValue: [moment().startOf('day'), moment().endOf('day')]})(
                                        <RangePicker 
                                            showTime
                                            ranges = {{
                                                '今天': [moment().startOf('day'), moment().endOf('day')],
                                                '昨天': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day')],
                                                '本月': [moment().startOf('month'), moment().endOf('month')],
                                                '上个月': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')],
                                                '今年': [moment().startOf('year'), moment().endOf('year')],
                                                '去年': [moment().subtract(1, 'years').startOf('year'), moment().subtract(1, 'years').endOf('year')]
                                            }}
                                            format="YYYY-MM-DD HH:mm:ss"
                                        />
                                    )}
                                </FormItem>
                            </Row>
                            <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                                <Col md={8} sm={24}>
                                    <FormItem label={<FormattedMessage id="payorder.application" />}>
                                        {getFieldDecorator('appname', { initialValue: "" })(
                                            appinfo.appInfo.length == 0 ? (
                                                <Select placeholder={formatMessage({ id: "payorder.placeholder.app" })} >
                                                    <Option value=""><FormattedMessage id="payorder.option" /></Option>
                                                </Select>
                                            ) : (
                                                <Select placeholder={formatMessage({ id: "payorder.placeholder.app" })} >
                                                    <Option value=""><FormattedMessage id="payorder.statistics.all-app" /></Option>
                                                    {appinfo.appInfo.map((item, index) => {
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
                                            <Select placeholder={formatMessage({ id: "payorder.placeholder.currency" })} >
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
                    {/* 统计信息部分 */}
                    <div>{this.renderSummary()}</div>
                    {/* 表格部分 */}
                    <div>
                        <Table
                            columns={columns}
                            dataSource={payorder.orderData}
                            pagination={{ pageSize: 10 }}
                            loading={quering}
                            scroll={{ y: 600 }}
                        />
                    </div>
                </div>
            </Card>
        )
    }

    //根据页码请求数据，默认获取前十条数据
    fetch = (params = {}) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'payorder/query',
            payload: {
                ...params,
            }
        })
        // this.setState({ loading: true });
        // reqwest({
        //     url: '/proxy/payorder/getOrderInfo',
        //     method: 'post',
        //     data: {
        //         page: 1,
        //         size: 10,
        //         ...params,
        //     },
        //     type: 'json',
        // }).then((data) => {
        //     const pagination = { ...this.state.pagination };
        //     var res = JSON.parse(data.response);
        //     pagination.total = res.data.pageInfo.total;

        //     var totalMoney = res.data.summary.totalMoney * 1.0 / 100;
        //     var total = totalMoney.toFixed(2);
        //     this.setState({
        //         loading: false,
        //         orderData: res.data.pageInfo.list,
        //         pagination,
        //         count: res.data.summary.count,
        //         totalMoney: total,
        //     });
        // });
    };

    //处理查询
    handleSearch = e => {
        const { form } = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                
                var timeRange = values.timeRange;
                var st = this.state.startTime;
                var en = this.state.endTime;
                this.setState({
                    startTime: ((typeof(timeRange) == "undefined")? st:timeRange[0].format('YYYY-MM-DD HH:mm:ss')),
                    endTime: ((typeof(timeRange) == "undefined")? en:timeRange[1].format('YYYY-MM-DD HH:mm:ss')),
                    appname: (((values.appname === null) || (typeof(values.appname) == "undefined"))? '':values.appname),
                    currency: (((values.currency === null) || (typeof(values.currency) == "undefined"))? '':values.currency),
                })
                
                this.fetch({
                    startTime: ((typeof(timeRange) == "undefined")? st:timeRange[0].format('YYYY-MM-DD HH:mm:ss')),
                    endTime: ((typeof(timeRange) == "undefined")? en:timeRange[1].format('YYYY-MM-DD HH:mm:ss')),
                    appname: (((values.appname === null) || (typeof(values.appname) == "undefined"))? '':values.appname),
                    currency: (((values.currency === null) || (typeof(values.currency) == "undefined"))? '':values.currency),
                });
            }
        });
    }

    //渲染统计信息
    renderSummary = () => {
        const { payorder } = this.props;
        return (
            <div>
                <Card className={styles.summary} bordered={false}>
                    <Row type="flex" justify="space-around">
                        <Col>
                            <div>
                                <div><FormattedMessage id="payorder.summary.count" /></div>
                                <div className={styles.money}>
                                    <div className={styles.total}>{payorder.orderData.length}</div>
                                    <div className={styles.yuan}><FormattedMessage id="payorder.summary.bi" /></div>
                                </div>
                            </div>
                        </Col>
                        <Col>
                            <div>
                                <div><FormattedMessage id="payorder.summary.total-money" /></div>
                                <div className={styles.money}>
                                    <div className={styles.total}>{payorder.totalMoney}</div>
                                    <div className={styles.yuan}><FormattedMessage id="payorder.summary.yuan" /></div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </div>
        )
    }

    //处理渲染
    renderCard = () => {
        return (this.state.orderDtl ? this.renderOrderDetails() : (this.state.deviceDtl? this.renderDeviceDetails() : this.renderRecords()));
    }
    
    //渲染页面
    render() {
        return (
            <PageHeaderWrapper title={<FormattedMessage id="payorder.query" />}>
                <div>{this.renderCard()}</div>
            </PageHeaderWrapper>
        )
    }
}

export default QueryOrder;