//查询会员信息

import React, { PureComponent } from 'react';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {
    Card, Input, Button, Form, Table, Row, Col, Affix, Modal, DatePicker, message, Menu, Dropdown, Icon
} from 'antd';
import reqwest from 'reqwest';
import { changeTimeFormat } from '@/utils/changeTimeFormat';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './QueryMember.less';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
import md5 from 'js-md5';
import { passwordSalt } from '../../../settings';

const FormItem = Form.Item;

@Form.create()
class QueryMember extends PureComponent {

    state = {
        memberData: [], //当前查到的会员信息
        pagination: {}, //主页会员表格分页
        loading: false, //主页会员表格加载状态
        partOfUserId: '', //当前输入的userId部分

        curUserId: '', //当前选择的userId

        orderDtl: false,  //是否在查看订单信息
        ordersPagination: {}, //订单详情表格分页
        ordersLoading: false, //订单详情表格加载状态
        orderData: [], //当前选择查看的用户的订单信息
        
        deviceDtl: false, //是否在查看设备详情
        appDevice: {}, //当前选择查看的设备信息

        memberDtl: false, //是否在查看会员信息
        curMember: {}, //当前选择查看或修改的会员信息
        
        editModalVisible: false, //是否打开修改信息对话框
        editedMemberInfo: {}, //修改后的信息
        curIndex: 0,

        pwdModalVisible: false, //是否打开输入密码对话框

        recentAccessList: [], //最近被查看过会员详情的会员
    }

    //发送请求
    fetch = (params = {}) => {
        this.setState({ loading: true });
        reqwest({
            url: '/proxy/member/queryMember',
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
            pagination.total = res.data.total;

            this.setState({
                loading: false,
                memberData: res.data.list,
                pagination,
            })
        })
    }

    //处理换页
    handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({ pagination: pager });
        this.fetch({
            page: pagination.current,
            partOfUserId: this.state.partOfUserId,
        });
    }

    //处理查询
    handleSearch = e => {
        const { form } = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.setState({ partOfUserId: values.partOfUserId, });

                this.fetch({
                    partOfUserId: values.partOfUserId,
                });
            }
        });
    }

    //渲染表格数据
    renderTable = () => {
        const {
            form: { getFieldDecorator },
        } = this.props;

        var columns = [
            {
                title: formatMessage({ id: "member.user-id" }),
                dataIndex: "userId",
                width: '30%',
            },
            {
                title: formatMessage({ id: "member.nickname" }),
                dataIndex: "nickname",
                width: '16%',
            },
            {
                title: formatMessage({ id: "member.create-time" }),
                dataIndex: "createTime",
                width: '19%',
                render: text => {
                    var dateString = changeTimeFormat(text);
                    return (
                        <div>{dateString}</div>
                    )
                }
            },
            {
                title: formatMessage({ id: "member.expired-time" }),
                dataIndex: "expiredTime",
                width: '19%',
                render: text => {
                    var dateString = changeTimeFormat(text);
                    return (
                        <div>{dateString}</div>
                    )
                }
            },
            {
                dataIndex: "operation",
                render: (text, record, index) => {
                    const menu = (
                        <Menu>
                            <Menu.Item>
                                <a href="#" onClick={this.handleMemberDetails.bind(this, index)}>
                                    <FormattedMessage id="member.member-info" />
                                </a>
                            </Menu.Item>
                            <Menu.Item>
                                <a href="#" onClick={this.handleDeviceDetails.bind(this, record["userId"])}>
                                    <FormattedMessage id="member.device-info" />
                                </a>
                            </Menu.Item>
                            <Menu.Item>
                                <a href="#" onClick={this.handleOrderDetails.bind(this, record["userId"])}>
                                    <FormattedMessage id="member.order-info" />
                                </a>
                            </Menu.Item>
                            <Menu.Item>
                                <a href="#" onClick={this.handleEditMember.bind(this, index)}>
                                    <FormattedMessage id="member.edit" />
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
                            <Row className={styles.col} gutter={{ md: 8, lg: 24, xl: 48 }}>
                                <Col md={8} sm={24}>
                                    <FormItem label={<FormattedMessage id="member.user-id" />}>
                                        {getFieldDecorator('partOfUserId', {
                                            rules: [{ required: true, message: formatMessage({ id: "member.alert.part-of-user-id" }) }]
                                        })(
                                            <Input
                                                allowClear
                                                placeholder={formatMessage({ id: "member.placeholder.part-of-user-id" })} 
                                            />
                                        )}
                                    </FormItem>
                                </Col>
                                <Col md={8} sm={24}>
                                    <Button type="primary" htmlType="submit">
                                    <FormattedMessage id="app.query" />
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </div>
                    {/* 表格部分 */}
                    <div>
                        <Table 
                            bordered
                            columns={columns}
                            dataSource={this.state.memberData}
                            pagination={this.state.pagination}
                            loading={this.state.loading}
                            onChange={this.handleTableChange}
                        />
                    </div>
                    {/* 最近查看部分 */}
                    <hr style={{ marginTop: 48 }} />
                    <div style={{ marginTop: 10 }}>
                        <h2><FormattedMessage id="member.recent" /></h2>
                        {this.state.recentAccessList.map((item, index) => {
                            return (
                                <div>
                                    <a href="#" onClick={this.handleClickRecent.bind(this, item)}>
                                        {item}
                                    </a>
                                    <br />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </Card>
        )
    }

    //处理点击最近查看会员
    handleClickRecent = (item) => {
        this.fetch({
            partOfUserId: item,
        })
    }

    //处理修改会员信息
    handleEditMember = (index) => {
        var members = this.state.memberData;
        var editedMember = members[index];

        this.setState({
            editModalVisible: true,
            curMember: editedMember,
            curIndex: index,
        })
    }

    //处理点击会员详情事件
    handleMemberDetails = (index) => {
        var member = this.state.memberData[index];

        reqwest({
            url: '/proxy/member/saveRecentAccess',
            method: 'post',
            data: {
                saveId: member["userId"],
            },
            type: 'json',
        }).then((data) => {
            if (data.response == 1) {
                message.error('缓存失败', 1);
            }
        })

        this.setState({
            memberDtl: true,
            curMember: member
        })
    }

    //渲染会员详情页
    renderMemberDetails = () => {
        var curMember = this.state.curMember;
        var data = [
            {
                "title": formatMessage({ id: "member.user-id" }),
                "dataIndex": curMember["userId"],
            },
            {
                "title": formatMessage({ id: "member.member-id" }),
                "dataIndex": curMember["memberId"]
            },
            {
                "title": formatMessage({ id: "member.member-name" }),
                "dataIndex": curMember["memberName"],
            },
            {
                "title": formatMessage({ id: "member.create-time" }),
                "dataIndex": changeTimeFormat(curMember["createTime"]),
            },
            {
                "title": formatMessage({ id: "member.expired-time" }),
                "dataIndex": changeTimeFormat(curMember["expiredTime"]),
            },
            {
                "title": formatMessage({ id: "member.nickname" }),
                "dataIndex": curMember["nickname"],
            },
            {
                "title": formatMessage({ id: "member.sex" }),
                "dataIndex": curMember["sex"],
            },
            {
                "title": formatMessage({ id: "member.phone-number" }),
                "dataIndex": curMember["phoneNumber"],
            },
            {
                "title": formatMessage({ id: "member.email" }),
                "dataIndex": curMember["email"],
            },
            {
                "title": formatMessage({ id: "member.qq-id" }),
                "dataIndex": curMember["qqId"],
            },
            {
                "title": formatMessage({ id: "member.weibo-id" }),
                "dataIndex": curMember["weiboId"],
            },
            {
                "title": formatMessage({ id: "member.wx-id" }),
                "dataIndex": curMember["wxId"],
            },
            {
                "title": formatMessage({ id: "member.country" }),
                "dataIndex": curMember["country"],
            },
            {
                "title": formatMessage({ id: "member.province" }),
                "dataIndex": curMember["province"],
            },
            {
                "title": formatMessage({ id: "member.city" }),
                "dataIndex": curMember["city"],
            },
            {
                "title": formatMessage({ id: "member.signature" }),
                "dataIndex": curMember["signature"],
            },
            {
                "title": formatMessage({ id: "member.coin-amount" }),
                "dataIndex": curMember["coinAmount"],
            },
            {
                "title": formatMessage({ id: "member.head-hd-url" }),
                "dataIndex": curMember["headHdUrl"],
            },
            {
                "title": formatMessage({ id: "member.head-url" }),
                "dataIndex": curMember["headUrl"],
            },
            {
                "title": formatMessage({ id: "member.token" }),
                "dataIndex": curMember["token"],
            },
        ];

        var cols = [
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
                        <Button className={styles.detailBtn} type="primary" onClick={this.handleMemberFinish}>
                            <FormattedMessage id="app.return" />
                        </Button>
                    </Affix>
                    <Table
                        bordered
                        dataSource={data}
                        columns={cols}
                        showHeader={false}
                        pagination={false}
                    />
                </div>
            </Card>
        )
    }

    //从会员详情页返回
    handleMemberFinish = () => {
        //从redis获取最近查看订单
        reqwest({
            url: '/proxy/member/getRecentAccess',
            method: 'get',
            type: 'json',
        }).then((data) => {
            this.setState({
                curMember: {},
                recentAccessList: data.response,
                memberDtl: false,
            })
        })
    }

    //处理点击设备详情事件
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
        })
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

    //从设备详情页返回
    handleDeviceFinish = () => {
        this.setState({
            deviceDtl: false,
            appDevice: {},
        })
    };

    //发送查询用户订单信息请求
    fetchOrders = (params = {}) => {
        this.setState({ ordersLoading: true });
        reqwest({
            url: '/proxy/member/queryOrdersByUserId',
            method: 'post',
            data: {
                page: 1,
                size: 10,
                userId: this.state.curUserId,
                ...params,
            },
            type: 'json',
        }).then((data) => {
            const ordersPagination = { ...this.state.ordersPagination };
            var res = JSON.parse(data.response);
            ordersPagination.total = res.data.total;

            this.setState({
                ordersLoading: false,
                orderData: res.data.list,
                ordersPagination,
            })
        })
    }

    //处理订单详情点击事件
    handleOrderDetails = (userId) => {
        this.setState({ orderDtl: true, curUserId: userId });

        this.fetchOrders({
            userId: userId,
        })
    }

    //渲染订单详情页
    renderOrderDetails = () => {
        var orderData = this.state.orderData;

        var orderColumns = [
            {
                title: formatMessage({ id: "payorder.app-id" }),
                dataIndex: 'appBundleId',
                width: 160,
            },
            {
                title: formatMessage({ id: "payorder.pay-amount" }),
                dataIndex: 'productPayAmount',
                width: 85,
                render: text => {
                    var num = parseInt(text) * 1.0 / 100;
                    num = num.toFixed(2);
                    return (
                        <div>{num}</div>
                    );
                }
            },
            {
                title: formatMessage({ id: "payorder.currency" }),
                dataIndex: 'productPayCurrency',
                width: 70
            },
            {
                title: formatMessage({ id: "payorder.order-status"}),
                dataIndex: 'orderStatus',
                width: 80,
                render: text => {
                    if (text == 1) {
                        return (<div><FormattedMessage id="payorder.unfinished" /></div>);
                    }
                    else {
                        return (<div><FormattedMessage id="payorder.finished" /></div>)
                    }
                }
            },
            {
                title: formatMessage({ id: "payorder.create-time" }),
                dataIndex: 'createTime',
                width: 100,
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
                width: 100,
                render: text => {
                    if (text === null) {
                        return (<div><FormattedMessage id="payorder.unfinished" /></div>)
                    }

                    var dateString = changeTimeFormat(text);
                    return (
                        <div>{dateString}</div>
                    )
                },
            },
        ];

        return (
            <Card>
                <Affix offsetTop={10}>
                    <Button className={styles.detailBtn} type="primary" onClick={this.handleOrderFinish}>
                        <FormattedMessage id="app.return" />
                    </Button>
                </Affix>
                <div>
                    <FormattedMessage id="payorder.message.front" />
                    <span className={styles.message}>{this.state.curUserId}</span>
                    <FormattedMessage id="payorder.message.back" />
                </div>
                <Table 
                    bordered
                    columns={orderColumns}
                    dataSource={orderData}
                    loading={this.state.ordersLoading}
                    onChange={this.handleOrderTableChange}
                    pagination={this.state.ordersPagination}
                />
            </Card>
        )
    }

    //订单详情表格换页
    handleOrderTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.ordersPagination };
        pager.current = pagination.current;
        this.setState({ ordersPagination: pager });
        this.fetchOrders({
            page: pagination.current,
        })
    }

    //从订单详情页返回
    handleOrderFinish = () => {
        this.setState({
            orderDtl: false,
            curUserId: '',
        })
    }

    //修改信息后刷新表格
    reloadMemberTable = (index, info) => {
        var data = this.state.memberData;
        data[index].expiredTime = info.expiredTime;
        data[index].nickname = info.nickname;
        data[index].email = info.email;
        data[index].signature = info.signature;
    }

    //提交修改的信息
    handleSubmitEditedInfo = e => {
        const { form } = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                var editedMemberInfo = {
                    expiredTime: values.expiredTime.format('YYYY-MM-DD HH:mm:ss'),
                    nickname: values.nickname,
                    email: values.email,
                    signature: values.signature,
                    userId: this.state.curMember["userId"],
                }

                this.setState({
                    editedMemberInfo: editedMemberInfo,
                    pwdModalVisible: true,
                })
            }
        });
    }

    //提交密码
    handleSubmitPassword = e => {
        const { form } = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                var adminName = localStorage.getItem('adminName');
                var editedMemberInfo = this.state.editedMemberInfo;
                
                reqwest({
                    url: '/proxy/member/modifyMember',
                    method: 'post',
                    data: {
                        adminName: adminName,
                        password: md5(md5(passwordSalt + values.password)),
                        expiredTime: editedMemberInfo.expiredTime,
                        nickname: editedMemberInfo.nickname,
                        email: editedMemberInfo.email,
                        signature: editedMemberInfo.signature,
                        userId: editedMemberInfo.userId,
                    },
                    type: 'json',
                }).then((data) => {
                    var res = JSON.parse(data.response);

                    //回应为400表示密码错误，为200则为成功
                    if (res.code == 400) {
                        message.error(formatMessage({ id: "app.wrong-password" }), 1);
                    } else if (res.code == 200) {
                        message.success(formatMessage({ id: "member.success-edit" }), 1);
                        this.reloadMemberTable(this.state.curIndex, this.state.editedMemberInfo);
                        this.setState({
                            editModalVisible: false,
                            pwdModalVisible: false,
                            curMember: {},
                            editedMemberInfo: {},
                            curIndex: 0,
                        })
                    }
                })
            }
        });
    }

    //关闭修改会员信息对话框
    handleEditCancel = () => {
        this.setState({
            editModalVisible: false,
            curMember: {},
            curIndex: 0,
        })
    }

    //关闭输入密码对话框
    handlePasswordCancel = () => {
        this.setState({
            pwdModalVisible: false,
        })
    }

    componentDidMount() {
        //从redis获取最近查看订单
        reqwest({
            url: '/proxy/member/getRecentAccess',
            method: 'get',
            type: 'json',
        }).then((data) => {
            this.setState({
                recentAccessList: data.response,
            })
        })
    }

    //渲染卡片
    renderCard = () => {
        return (
            this.state.deviceDtl ? this.renderDeviceDetails() : (
                this.state.memberDtl ? this.renderMemberDetails() : (
                    this.state.orderDtl ? this.renderOrderDetails() : this.renderTable())));
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

        return (
            <PageHeaderWrapper title={formatMessage({ id: "member.query" })} >
                <div>{this.renderCard()}</div>
                <Modal
                    destroyOnClose
                    width={650}
                    visible={this.state.editModalVisible}
                    title={formatMessage({ id: "member.edit" })}
                    onCancel={this.handleEditCancel}
                    footer={null}>
                    <Form onSubmit={this.handleSubmitEditedInfo}>
                        <FormItem {...formItemLayout} label={<FormattedMessage id="member.user-id" />}>
                            <span>{this.state.curMember["userId"]}</span>
                        </FormItem>
                        <FormItem {...formItemLayout} label={<FormattedMessage id="member.expired-time" />}>
                            {getFieldDecorator('expiredTime', { initialValue: moment(this.state.curMember["expiredTime"]) })(
                            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label={<FormattedMessage id="member.nickname" />}>
                            {getFieldDecorator('nickname', { initialValue: this.state.curMember["nickname"] })(
                            <Input allowClear />
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label={<FormattedMessage id="member.email" />}>
                            {getFieldDecorator('email', { initialValue: this.state.curMember["email"] })(
                            <Input allowClear />
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label={<FormattedMessage id="member.signature" />}>
                            {getFieldDecorator('signature', { initialValue: this.state.curMember["signature"] })(
                            <Input allowClear />
                            )}
                        </FormItem>
                        <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
                            <Button type="primary" htmlType="submit">
                                <FormattedMessage id="app.save" />
                            </Button>
                        </FormItem>
                    </Form>
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

export default QueryMember;