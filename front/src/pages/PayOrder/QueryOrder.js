//查询订单

import React, { PureComponent } from 'react';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {
    Card, Input, Button, Form, Table, DatePicker,
    Row, Col, Select, Affix, message, Menu, Dropdown,
    Icon, Modal
} from 'antd';
import reqwest from 'reqwest';
import md5 from 'js-md5';
import { changeMoneyFormat } from '@/utils/changeMoneyFormat';
import { changeTimeFormat } from '@/utils/changeTimeFormat';
import { passwordSalt } from '../../../settings';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './QueryOrder.less';
import moment from 'moment';
import 'moment/locale/zh-cn';
import router from 'umi/router';
moment.locale('zh-cn'); 

const FormItem = Form.Item;
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const TextArea = Input.TextArea;

@Form.create()
class QueryOrder extends PureComponent {

    state = {
        startTime: "1970-01-01 00:00:00",
        endTime: "9999-12-31 00:00:00",
        appname: '',  //appBundleId
        currency: '',
        orderData: [],  //表格数据
        pagination: {},  //分页
        loading: false,
        app: [], //应用信息
        curRecord: {}, //被查询详情的记录
        curUserExpiredTime: 0, //被查询详情的订单的用户的过期时间
        curProductInfo: {}, //被查询详情的订单对应的商品信息
        refundInfo: {},
        orderDtl: false,
        deviceDtl: false,

        appDevice: {},

        count: 0, //查询到的订单数
        totalMoney: 0, //总金额

        refundModalVisible: false,
        pwdModalVisible: false,
    }

    //处理点击订单详情事件
    handleOrderDetails = (index) => {
        var records = this.state.orderData;
        var record = records[index];
        reqwest({
            url: '/proxy/member/getMemberInfoByUserId',
            method: 'post',
            data: {
                userId: record["userId"],
            },
            type: 'json',
        }).then((data) => {
            if (data.status == 0) {
                var res = JSON.parse(data.response);
                if (res.code == 200) {
                    this.setState({
                        curUserExpiredTime: res.data.expiredTime,
                    })
                }
            }
        });

        reqwest({
            url: '/proxy/device/queryDeviceByUserId',
            method: 'post',
            data: {
                userId: record["userId"],
            },
            type: 'json',
        }).then((data) => {
            if (data.status == 0) {
                var res = JSON.parse(data.response);
                if (res.code == 200) {
                    this.setState({
                        appDevice: res.data,
                    })
                }
            }
        });

        reqwest({
            url: '/proxy/product/getProductInfoByProductNo',
            method: 'post',
            data: {
                productNo: record["productNo"],
            },
            type: 'json',
        }).then((data) => {
            if (data.status == 0) {
                var res = JSON.parse(data.response);
                if (res.code == 200) {
                    this.setState({ curProductInfo: res.data });
                }
            }
        });

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
                "attr": formatMessage({ id: "payorder.trade-no" }),
                "content": rec["tradeNo"]
            },
            {
                "attr": formatMessage({ id: "payorder.user-id" }),
                "content": rec["userId"]
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
                "attr": formatMessage({ id: "payorder.member-id" }),
                "content": rec["memberId"]
            },
            {
                "attr": formatMessage({ id: "payorder.message" }),
                "content": rec["message"]
            },
            {
                "attr": formatMessage({ id: "payorder.order-id" }),
                "content": rec["orderId"]
            },
            {
                "attr": formatMessage({ id: "payorder.pay-channel-id" }),
                "content": rec["payChannelId"]
            },
            {
                "attr": formatMessage({ id: "payorder.pay-nonce" }),
                "content": rec["payNonce"]
            },
            {
                "attr": formatMessage({ id: "payorder.pay-notification" }),
                "content": rec["payNotification"]
            },
            {
                "attr": formatMessage({ id: "payorder.pay-notify-id" }),
                "content": rec["payNotifyId"]
            },
            {
                "attr": formatMessage({ id: "payorder.pay-prepay-id" }),
                "content": rec["payPrepayId"]
            },
            {
                "attr": formatMessage({ id: "payorder.pay-query-result" }),
                "content": rec["payQueryResult"]
            },
            {
                "attr": formatMessage({ id: "payorder.pay-trade-no" }),
                "content": rec["payTradeNo"]
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
            {
                "attr": formatMessage({ id: "payorder.product-subtitle" }),
                "content": rec["productSubtitle"]
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
                        <Button className={styles.detailBtn} style={{ marginLeft: 20 }} onClick={this.handleRefund}>
                            <FormattedMessage id="payorder.refund" />
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

    handleRefund = () => {
        this.setState({
            refundModalVisible: true,
        })
    }


    handleDeviceDetails = (userId) => {
        reqwest({
            url: '/proxy/device/queryDeviceByUserId',
            method: 'post',
            data: {
                userId: userId,
            },
            type: 'json',
        }).then((data) => {
            if (data.status == 0) {
                var res = JSON.parse(data.response);
                if (res.code == 200) {
                    this.setState({
                        deviceDtl: true,
                        appDevice: res.data,
                    })
                } else {
                    message.error(formatMessage({ id: "device.fail.query-device-by-user-id" }), 1);
                }
            } else {
                message.error(formatMessage({ id: "device.fail.query-device-by-user-id" }), 1);
            }
        });
    }

    //渲染设备详情页
    renderDeviceDetails = () => {
        var appDevice = this.state.appDevice;

        if (appDevice === null) {
            return (
                <Card>
                    <p><FormattedMessage id="member.nothing" /></p>
                    <br />
                    <Button type="primary" onClick={this.handleDeviceFinish}>
                        <FormattedMessage id="app.return" />
                    </Button>
                </Card>
            )
        }

        var data = [
            {
                "title": formatMessage({ id: "device.ad-id" }),
                "dataIndex": appDevice["adId"],
            },
            {
                "title": formatMessage({ id: "device.api-version-code" }),
                "dataIndex": appDevice["apiVersionCode"]
            },
            {
                "title": formatMessage({ id: "device.app-bundle-id" }),
                "dataIndex": appDevice["appBundleId"],
            },
            {
                "title": formatMessage({ id: "device.app-version-code" }),
                "dataIndex": appDevice["appVersionCode"],
            },
            {
                "title": formatMessage({ id: "device.app-version-name" }),
                "dataIndex": appDevice["appVersionName"],
            },
            {
                "title": formatMessage({ id: "device.channel-id" }),
                "dataIndex": appDevice["channelId"],
            },
            {
                "title": formatMessage({ id: "device.client-message" }),
                "dataIndex": appDevice["clientMessage"],
            },
            {
                "title": formatMessage({ id: "member.create-time" }),
                "dataIndex": changeTimeFormat(appDevice["createTime"]),
            },
            {
                "title": formatMessage({ id: "device.device-id" }),
                "dataIndex": appDevice["deviceId"],
            },
            {
                "title": formatMessage({ id: "member.expired-time" }),
                "dataIndex": changeTimeFormat(appDevice["expiredTime"]),
            },
            {
                "title": formatMessage({ id: "device.is-pro" }),
                "dataIndex": (appDevice["isPro"] ? formatMessage({ id: "app.true" }) : formatMessage({ id: "app.false" })),
            },
            {
                "title": formatMessage({ id: "device.jailbreak-flag" }),
                "dataIndex": appDevice["jailbreakFlag"],
            },
            {
                "title": formatMessage({ id: "device.last-report-time" }),
                "dataIndex": changeTimeFormat(appDevice["lastReportTime"]),
            },
            {
                "title": formatMessage({ id: "device.manufacturer" }),
                "dataIndex": appDevice["manufacturer"],
            },
            {
                "title": formatMessage({ id: "member.member-id" }),
                "dataIndex": appDevice["memberId"],
            },
            {
                "title": formatMessage({ id: "device.operator-name" }),
                "dataIndex": appDevice["operatorName"],
            },
            {
                "title": formatMessage({ id: "device.os-device-code" }),
                "dataIndex": appDevice["osDeviceCode"],
            },
            {
                "title": formatMessage({ id: "device.os-name" }),
                "dataIndex": appDevice["osName"],
            },
            {
                "title": formatMessage({ id: "device.os-version" }),
                "dataIndex": appDevice["osVersion"],
            },
            {
                "title": formatMessage({ id: "device.phone-model" }),
                "dataIndex": appDevice["phoneModel"],
            },
            {
                "title": formatMessage({ id: "device.platform" }),
                "dataIndex": appDevice["platform"],
            },
            {
                "title": formatMessage({ id: "device.request-count" }),
                "dataIndex": appDevice["requestCount"],
            },
            {
                "title": formatMessage({ id: "member.user-id" }),
                "dataIndex": appDevice["userId"],
            },
        ];

        var appDeviceColumns = [
            {
                dataIndex: "title",
            },
            {
                dataIndex: "dataIndex",
            }
        ];

        return (
                <Card>
                    <div>
                        <Affix offsetTop={10}>
                            <Button className={styles.detailBtn} type="primary" onClick={this.handleDeviceFinish}>
                                <FormattedMessage id="app.return" />
                            </Button>
                        </Affix>
                        <Table 
                            bordered
                            showHeader={false}
                            pagination={false}
                            dataSource={data}
                            columns={appDeviceColumns}
                        />
                    </div>
                </Card>
        )
    }

    handleDeviceFinish = () => {
        this.setState({
            appDevice: {},
            deviceDtl: false,
        })
    };

    //该用户所有订单
    handleAllOrderDetails = (userId) => {
        reqwest({
            url: '/proxy/payorder/getOrderInfoByUserId',
            method: 'post',
            data: {
                page: 1,
                size: 10,
                userId: userId,
            },
            type: 'json',
        }).then((data) => {
            const pagination = { ...this.state.pagination };
            var res = JSON.parse(data.response);
            pagination.total = res.data.pageInfo.total;

            var totalMoney = res.data.summary.totalMoney * 1.0 / 100;
            var total = totalMoney.toFixed(2);
            this.setState({
                loading: false,
                orderData: res.data.pageInfo.list,
                pagination,
                count: res.data.summary.count,
                totalMoney: total,
            });
        });
    }

    //处理渲染
    renderCard = () => {
        return (this.state.orderDtl ? this.renderOrderDetails() : (this.state.deviceDtl? this.renderDeviceDetails() : this.renderRecords()));
    }

    //渲染表格数据
    renderRecords = () => {
        const { 
            form: { getFieldDecorator },
        } = this.props;
        
        var columns = [
            {
                title: formatMessage({ id: "payorder.user-id" }),
                dataIndex: 'userId',
                width: '22.3%',
                fixed: 'left',
            },
            {
                title: formatMessage({ id: "payorder.app-id" }),
                dataIndex: 'appBundleId',
                width: '20.5%',
            },
            {
                title: formatMessage({ id: "payorder.pay-amount" }),
                dataIndex: 'productPayAmount',
                width: '10%',
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
                width: '12%',
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
                width: '12%',
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
                fixed: 'right',
                render: (text, record, index) => {
                    const menu = (
                        <Menu>
                            <Menu.Item>
                                {/* 注意要加bind函数！！！ */}
                                <a href="#" onClick={this.handleOrderDetails.bind(this, index)}>
                                    <FormattedMessage id="payorder.order-detail" />
                                </a>
                            </Menu.Item>
                            <Menu.Item>
                                <a href="#" onClick={this.handleDeviceDetails.bind(this, record["userId"])}>
                                    <FormattedMessage id="payorder.device-detail" />
                                </a>
                            </Menu.Item>
                            <Menu.Item>
                                <a href="#" onClick={this.handleAllOrderDetails.bind(this, record["userId"])}>
                                    <FormattedMessage id="payorder.all-orders" />
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
                                            this.state.app.length == 0 ? (
                                                <Select placeholder={formatMessage({ id: "payorder.placeholder.app" })} >
                                                    <Option value=""><FormattedMessage id="payorder.option" /></Option>
                                                </Select>
                                            ) : (
                                                <Select placeholder={formatMessage({ id: "payorder.placeholder.app" })} >
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
                            dataSource={this.state.orderData}
                            pagination={this.state.pagination}
                            loading={this.state.loading}
                            onChange={this.handleTableChange}
                            scroll={{ x: 1200, y: 600 }}
                        />
                    </div>
                </div>
            </Card>
        )
    }

    //根据页码请求数据，默认获取前十条数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        reqwest({
            url: '/proxy/payorder/getOrderInfo',
            method: 'post',
            data: {
                page: 1,
                size: 10,
                ...params,
            },
            type: 'json',
        }).then((data) => {
            const pagination = { ...this.state.pagination };
            var res = JSON.parse(data.response);
            pagination.total = res.data.pageInfo.total;

            var totalMoney = res.data.summary.totalMoney * 1.0 / 100;
            var total = totalMoney.toFixed(2);
            this.setState({
                loading: false,
                orderData: res.data.pageInfo.list,
                pagination,
                count: res.data.summary.count,
                totalMoney: total,
            });
        });
    };

    //处理换页
    handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({ pagination: pager });
        this.fetch({
            page: pagination.current,
            startTime: this.state.startTime,
            endTime: this.state.endTime,
            appname: this.state.appname,
            currency: this.state.currency,
        });
    };

    //初始化，获取当天的订单数据和应用列表
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
                    page: 1,
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
        return (
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
                                    <div className={styles.total}>{this.state.totalMoney}</div>
                                    <div className={styles.yuan}><FormattedMessage id="payorder.summary.yuan" /></div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Card>
            </div>
        )
    }

    handleRefundCancel = () => {
        this.setState({
            refundModalVisible: false,
        })
    }

    handleSubmitRefundInfo = e => {
        const { form } = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.setState({
                    refundInfo: {
                        newExpiredTime: values.newExpiredTime.format('YYYY-MM-DD HH:mm:ss'),
                        remark: values.remark,
                    },
                    pwdModalVisible: true,
                })
            }
        });
    }

    handlePasswordCancel = () => {
        this.setState({
            pwdModalVisible: false,
        })
    }

    handleSubmitPassword = e => {
        const { form } = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                reqwest({
                    url: '/proxy/payorder/refund',
                    method: 'post',
                    data: {
                        adminName: localStorage.getItem('adminName'),
                        password: md5(md5(passwordSalt + values.password)),
                        oldExpiredTime: moment(this.state.curUserExpiredTime).format('YYYY-MM-DD HH:mm:ss'),
                        newExpiredTime: this.state.refundInfo.newExpiredTime,
                        tradeNo: this.state.curRecord["tradeNo"],
                        userId: this.state.curRecord["userId"],
                        remark: this.state.refundInfo.remark,
                    },
                    type: 'json',
                }).then((data) => {
                    var res = JSON.parse(data.response);

                    if (res.code == 400) {
                        if (res.message == "1") {
                            message.error(formatMessage({ id: "app.wrong-password"}), 1);
                        } else if (res.message == "2") {
                            message.error(formatMessage({ id: "payorder.no-order"}), 1);
                            // this.setState({
                            //     curRecord: {},
                            //     curUserExpiredTime: 0,
                            //     curProductInfo: {},
                            //     refundInfo: {},
                            //     pwdModalVisible: false,
                            //     refundModalVisible: false,
                            //     orderDtl: false,
                            // })
                            window.location.href = '/payorder/query';
                        }
                    } else if (res.code == 200) {
                        message.success(formatMessage({ id: "payorder.refund.success" }), 1);
                        // this.setState({
                        //     curRecord: {},
                        //     curUserExpiredTime: 0,
                        //     refundInfo: {},
                        //     pwdModalVisible: false,
                        //     refundModalVisible: false,
                        //     orderDtl: false,
                        // })
                        window.location.href = '/payorder/query';
                    }
                })
            }
        })
    }
    
    //渲染页面
    render() {
        const {
            form: { getFieldDecorator },
        } = this.props;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 7 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 12 },
                md: { span: 10 },
            },
        };

        const submitFormLayout = {
            wrapperCol: {
              xs: { span: 24, offset: 0 },
              sm: { span: 10, offset: 7 },
            },
        };

        const curProductInfo = this.state.curProductInfo;
        var productInfoArray = [];
        if (curProductInfo.productNo) {
            productInfoArray = [
                { id: "product.product-no", content: curProductInfo.productNo },
                { id: "product.product-title", content: curProductInfo.productTitle },
                { id: "device.app-bundle-id", content: curProductInfo.appBundleId },
                { id: "device.platform", content: curProductInfo.platform },
                { id: "activationcode.service-years", content: curProductInfo.serviceYears },
                { id: "activationcode.service-months", content: curProductInfo.serviceMonths },
                { id: "activationcode.service-days", content: curProductInfo.serviceHours },
            ];
        }

        const curDevice = this.state.appDevice;
        var deviceInfoArray = [];
        if (curDevice.deviceId) {
            deviceInfoArray = [
                { id: "device.device-id", content: curDevice.deviceId },
                { id: "device.app-version-code", content: curDevice.appVersionCode },
                { id: "device.app-version-name", content: curDevice.appVersionName },
                { id: "device.phone-model", content: curDevice.phoneModel },
                { id: "device.os-name", content: curDevice.osName },
                { id: "device.os-version", content: curDevice.osVersion },
            ];
        }

        return (
            <PageHeaderWrapper title={<FormattedMessage id="payorder.query" />}>
                <div>{this.renderCard()}</div>
                <Modal
                    destroyOnClose
                    width={1000}
                    visible={this.state.refundModalVisible}
                    title={formatMessage({ id: "payorder.refund" })}
                    onCancel={this.handleRefundCancel}
                    footer={null}>
                    <Row>
                        <Col span={15}>
                            <Form onSubmit={this.handleSubmitRefundInfo}>
                                <FormItem {...formItemLayout} label={<FormattedMessage id="payorder.trade-no" />}>
                                    <span>{this.state.curRecord["tradeNo"]}</span>
                                </FormItem>
                                <FormItem {...formItemLayout} label={<FormattedMessage id="payorder.user-id" />}>
                                    <span>{this.state.curRecord["userId"]}</span>
                                </FormItem>
                                <FormItem {...formItemLayout} label={<FormattedMessage id="payorder.refund.before-expired-time" />}>
                                    <span>{changeTimeFormat(this.state.curUserExpiredTime)}</span>
                                </FormItem>
                                <FormItem {...formItemLayout} label={<FormattedMessage id="payorder.refund.after-expired-time" />}>
                                    {getFieldDecorator('newExpiredTime', { initialValue: moment() })(
                                        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
                                    )}
                                </FormItem>
                                <FormItem {...formItemLayout} label={<FormattedMessage id="activationcode.remark" />}>
                                    {getFieldDecorator('remark')(
                                        <TextArea rows={5} placeholder={formatMessage({ id: "activationcode.placeholder.remark" })} />
                                    )}
                                </FormItem>
                                <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
                                    <Button type="primary" htmlType="submit">
                                        <FormattedMessage id="app.ok" />
                                    </Button>
                                </FormItem>
                            </Form>
                        </Col>
                        <Col span={9}>
                            <Card>
                                {productInfoArray.length == 0 ? (
                                    <div style={{ paddingTop: 10, marginLeft: -15 }}>
                                        <FormattedMessage id="product.no-product" />
                                    </div>
                                ) : (
                                    <div style={{ paddingTop: 10, marginLeft: -15 }}>
                                        {productInfoArray.map((item, index) => {
                                            return (
                                                <Row>
                                                    <Col span={9}>
                                                        <span><FormattedMessage id={item.id} />：</span>
                                                    </Col>
                                                    <Col span={15}>
                                                        <span>{item.content}</span>
                                                    </Col>
                                                </Row>
                                            );
                                        })}
                                    </div>
                                )}
                                {deviceInfoArray.length == 0 ? (
                                    <div style={{ marginLeft: -15, paddingBottom: 10 }}>
                                        <FormattedMessage id="product.no-product" />
                                    </div>
                                ) : (
                                    <div style={{ marginLeft: -15, paddingBottom: 10 }}>
                                        {deviceInfoArray.map((item, index) => {
                                            return (
                                                <Row>
                                                    <Col span={9}>
                                                        <span><FormattedMessage id={item.id} />：</span>
                                                    </Col>
                                                    <Col span={15}>
                                                        <span>{item.content}</span>
                                                    </Col>
                                                </Row>
                                            );
                                        })}
                                    </div>
                                )}
                            </Card>
                        </Col>
                    </Row>
                </Modal>
                <Modal
                    destroyOnClose
                    centered
                    width={480}
                    visible={this.state.pwdModalVisible}
                    title={formatMessage({ id: "member.password" })}
                    onCancel={this.handlePasswordCancel}
                    footer={null}>
                    <Form onSubmit={this.handleSubmitPassword}>
                        <FormItem {...formItemLayout} label={<FormattedMessage id="member.enter-password" />}>
                            {getFieldDecorator('password')(
                            <Input.Password />
                            )}
                        </FormItem>
                        <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
                            <Button type="primary" htmlType="submit">
                                <FormattedMessage id="app.ok" />
                            </Button>
                        </FormItem>
                    </Form>
                </Modal>
            </PageHeaderWrapper>
        )
    }
}

export default QueryOrder;