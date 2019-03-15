import React, { PureComponent } from 'react';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {
    Card, Input, Button, Form, message, Modal, Row, Col, Affix, Tabs, Table
} from 'antd';
import reqwest from 'reqwest';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { changeTimeFormat } from '@/utils/changeTimeFormat';
import styles from './QueryMember.less';
import md5 from 'js-md5';
import { passwordSalt } from '../../../settings';

const FormItem = Form.Item;
const { TextArea } = Input;
const TabPane = Tabs.TabPane;

@Form.create()
class TransferLicense extends PureComponent {
    state = {
        targetId: '',
        sourceId: '',
        remark: '',
        pwdModalVisible: false,
        infoVisible: false,
        memberInfo: {},
        deviceInfo: {},
        submitted: false,
        result: {},

        transferList: [],
        loading: false,
        pagination: {},
    };

    //处理提交
    handleSubmit = e => {
        const { form } = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.setState({
                    sourceId: values.sourceId,
                    targetId: values.targetId,
                    remark: values.remark,
                    pwdModalVisible: true,
                })
            }
        })
    }

    //处理提交密码
    handleSubmitPassword = e => {
        const { form } = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                reqwest({
                    url: '/proxy/member/transferLicense',
                    method: 'post',
                    data: {
                        adminName: localStorage.getItem('adminName'),
                        password: md5(md5(passwordSalt + values.password)),
                        sourceId: this.state.sourceId,
                        targetId: this.state.targetId,
                        remark: this.state.remark,
                    },
                    type: 'json',
                }).then((data) => {
                    var res = JSON.parse(data.response);

                    if (res.code == 200) {
                        message.success(formatMessage({ id: "license.success-transfer" }), 1);
                        this.setState({
                            result: res.data,
                            pwdModalVisible: false,
                            submitted: true,
                        })
                    }
                    else if (res.code == 400) {
                        switch (res.message) {
                            case "0":
                                message.error(formatMessage({ id: "app.wrong-password" }), 1);
                                break;
                            case "1":
                                message.error(formatMessage({ id: "license.no-source" }), 1);
                                this.setState({
                                    sourceId: '',
                                    targetId: '',
                                    pwdModalVisible: false,
                                })
                                break;
                            case "2":
                                message.error(formatMessage({ id: "license.source-expired" }), 1);
                                this.setState({
                                    sourceId: '',
                                    targetId: '',
                                    pwdModalVisible: false,
                                })
                                break;
                            case "4":
                                message.error(formatMessage({ id: "license.target-device-not-exist"}), 1);
                                this.setState({
                                    sourceId: '',
                                    targetId: '',
                                    pwdModalVisible: false,
                                })
                                break;
                            default: 
                                this.setState({
                                    sourceId: '',
                                    targetId: '',
                                    pwdModalVisible: false,
                                })
                                message.warn(formatMessage({ id: "license.target-not-expired" }), 1)
                        }
                    }
                })
            }
        })
    }

    //关闭输入密码对话框
    handlePasswordCancel = () => {
        this.setState({
            pwdModalVisible: false,
        })
    }

    fetch = (params = {}) => {
        this.setState({ loading: true });
        reqwest({
            url: '/proxy/member/getTransferList',
            method: 'post',
            data: {
                page: 1,
                size: 10,
                ...params,
            },
            type: 'json',
        }).then((data) => {
            if (data.status == 0) {
                var res = JSON.parse(data.response);
                const pagination = { ...this.state.pagination };
                pagination.total = res.data.total;
                this.setState({
                    transferList: res.data.list,
                    loading: false,
                    pagination,
                })
            }
        })
    }

    onTabChange = (key) => {
        if (key == "1") {
            this.setState({
                sourceId: '',
                targetId: '',
                memberInfo: {},
                deviceInfo: {},
                result: {},
                infoVisible: false,
                submitted: false,
            });
        } else if (key == "2") {
            this.fetch();
        }
    }

    handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({ pagination: pager });
        this.fetch({
            page: pagination.current,
        })
    }

    renderCard = () => {
        return (
            <Card bordered={false}>
                <Tabs defaultActiveKey="1" onChange={this.onTabChange}>
                    <TabPane tab={formatMessage({ id: "license.transfer-license" })} key="1">{this.renderFormTab()}</TabPane>
                    <TabPane tab={formatMessage({ id: "license.transfer-list" })} key="2">{this.renderListTab()}</TabPane>
                </Tabs>
            </Card>
        )
    }

    renderListTab = () => {
        var columns = [
            {
                title: formatMessage({ id: "license.source" }),
                children: [
                    {
                        title: formatMessage({ id: "member.user-id" }),
                        dataIndex: 'fromUserId',
                    },
                    {
                        title: formatMessage({ id: "member.expired-time" }),
                        dataIndex: 'fromExpiredTime',
                        render: text => {
                            return (<div>{changeTimeFormat(text)}</div>);
                        }
                    }
                ],
            },
            {
                title: formatMessage({ id: "license.target" }),
                children: [
                    {
                        title: formatMessage({ id: "member.user-id" }),
                        dataIndex: 'toUserId',
                    },
                    {
                        title: formatMessage({ id: "member.expired-time" }),
                        children: [
                            {
                                title: formatMessage({ id: "license.old-expired-time" }),
                                dataIndex: 'toUserOldExpiredTime',
                                render: text => {
                                    return (<div>{changeTimeFormat(text)}</div>);
                                }
                            },
                            {
                                title: formatMessage({ id: "license.new-expired-time"}),
                                dataIndex: 'toUserNewExpiredTime',
                                render: text => {
                                    return (<div>{changeTimeFormat(text)}</div>);
                                }
                            }
                        ],
                    }
                ]
            }
        ];

        return (
            <div>
                <Table 
                    bordered
                    columns={columns}
                    dataSource={this.state.transferList}
                    loading={this.state.loading}
                    pagination={this.state.pagination}
                    onChange={this.handleTableChange}
                />
            </div>
        )
    }

    renderFormTab = () => {
        return (this.state.submitted ? this.renderResult() : this.renderInitialPage());
    }

    //从结果页返回
    handleFinish = () => {
        this.setState({
            sourceId: '',
            targetId: '',
            memberInfo: {},
            deviceInfo: {},
            result: {},
            infoVisible: false,
            submitted: false,
        })
    }

    //渲染结果页面
    renderResult = () => {
        return (
            <div style={{ paddingTop: 30, paddingBottom: 10 }}>
                <Affix offsetTop={10}>
                    <Button className={styles.detailBtn} type="primary" onClick={this.handleFinish}>
                        <FormattedMessage id="app.return" />
                    </Button> 
                </Affix>
                <Row>
                    <Col span={12}>
                        <h3><FormattedMessage id="license.query-source" /></h3>
                        <div style={{ marginTop: 20 }}>
                            <div>
                                <span><FormattedMessage id="member.user-id" />: </span>
                                <span>{this.state.sourceId}</span>
                            </div>
                            <div>
                                <span><FormattedMessage id="member.expired-time" />: </span>
                                <span>{changeTimeFormat(this.state.result["sourceExpiredTime"])}</span>
                            </div>
                        </div>
                    </Col>
                    <Col span={12}>
                        <h3><FormattedMessage id="license.query-target" /></h3>
                        <div style={{ marginTop: 20 }}>
                            <div>
                                <span><FormattedMessage id="member.user-id" />: </span>
                                <span>{this.state.targetId}</span>
                            </div>
                            <div>
                                <span><FormattedMessage id="member.expired-time" />: </span>
                                <span>{changeTimeFormat(this.state.result["targetExpiredTime"])}</span>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        )
    }

    //渲染初始页面
    renderInitialPage = () => {
        return (
            <div style={{ paddingTop: 30, paddingBottom: 10 }}>
                <Row>
                    <Col span={16}><div>{this.renderFormCard()}</div></Col>
                    <Col span={8}><div>{this.renderInfo()}</div></Col>
                </Row>
            </div>
        )
    }

    //渲染表单
    renderFormCard = () => {
        const {
            form: { getFieldDecorator },
        } = this.props;

        const form = this.props.form;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 7 },
            },
            wrapperCol: {
                xs: { span: 38 },
                sm: { span: 18 },
                md: { span: 13 },
            },
        };

        return (
            <Card bordered={false}>
                <Form onSubmit={this.handleSubmit}>
                    <FormItem {...formItemLayout} label={<FormattedMessage id="license.source-id" />}>
                        {getFieldDecorator('sourceId', {
                            rules: [{
                                required: true, message: formatMessage({ id: "license.alert.source-id"}),
                            }],
                        })(
                            <Input allowClear />
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label={<FormattedMessage id="license.target-id" />}>
                        {getFieldDecorator('targetId', {
                            rules: [{
                                required: true, message: formatMessage({ id: "license.alert.target-id"}),
                            }],
                        })(
                            <Input allowClear />
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label={<FormattedMessage id="activationcode.remark" />}>
                        {getFieldDecorator('remark')(
                            <TextArea rows={5} placeholder={formatMessage({ id: "activationcode.placeholder.remark" })} />
                        )}
                    </FormItem>
                    <FormItem style={{ marginTop: 32, paddingLeft: 50, paddingRight: 50 }}>
                        <Row>
                            <Col span={6}>
                                <Button type="primary" htmlType="submit">
                                    <FormattedMessage id="license.transfer" />
                                </Button>
                            </Col>
                            <Col span={9}>
                                <Button 
                                    onClick={this.handleSearch.bind(this, form.getFieldValue('sourceId'))} 
                                    icon="search" 
                                    style={{ marginLeft: 9 }}
                                >
                                    <FormattedMessage id="license.query-source" />
                                </Button>
                            </Col>
                            <Col span={9}>
                                <Button 
                                    onClick={this.handleSearch.bind(this, form.getFieldValue('targetId'))} 
                                    icon="search" 
                                    style={{ marginLeft: 0 }}
                                >
                                    <FormattedMessage id="license.query-target" />
                                </Button>
                            </Col>
                        </Row>
                    </FormItem>
                </Form>
            </Card>
        )
    }

    //查询信息
    handleSearch = (id) => {
        if (id == null || id == "") {
            message.warn("Empty!", 1);
        } else {
            reqwest({
                url: '/proxy/member/getMemberInfoByUserId',
                method: 'post',
                data: {
                    userId: id,
                },
                type: 'json',
            }).then((data) => {
                if (data.status == 0) {
                    var res = JSON.parse(data.response);
                    if (res.code == 200) {
                        this.setState({
                            memberInfo: res.data,
                        })
                    } else {
                        this.setState({
                            memberInfo: {},
                        })
                    }
                } else {
                    this.setState({
                        memberInfo: {},
                    })
                }
            });

            reqwest({
                url: '/proxy/device/queryDeviceByUserId',
                method: 'post',
                data: {
                    userId: id,
                },
                type: 'json',
            }).then((data) => {
                if (data.status == 0) {
                    var res = JSON.parse(data.response);
                    if (res.code == 200) {
                        this.setState({ deviceInfo: res.data })
                    } else {
                        this.setState({ deviceInfo: {} });
                    }
                } else {
                    this.setState({ deviceInfo: {} });
                }
            });

            this.setState({ infoVisible: true });
        }
    }

    renderInfo = () => {
        if (this.state.infoVisible) {
            return (
                <Card style={{ marginTop: 12, marginLeft: -40, paddingTop: 30, paddingBottom: 100 }}>
                    {this.state.memberInfo.userId ? (
                        <div style={{ marginLeft: -10 }}>
                            <div>
                                <span><FormattedMessage id="member.user-id" />: </span>
                                <span>{this.state.memberInfo.userId}</span>
                            </div>
                            <div>
                                <span><FormattedMessage id="member.expired-time" />: </span>
                                <span>{changeTimeFormat(this.state.memberInfo.expiredTime)}</span>
                            </div>
                        </div>
                    ) : (
                        <span><FormattedMessage id="license.not-exist-member" /><br /></span>
                    )}
                    {this.state.deviceInfo.userId ? (
                        <div style={{ marginLeft: -10 }}>
                            <div>
                                <span><FormattedMessage id="device.app-bundle-id" />: </span>
                                <span>{this.state.deviceInfo.appBundleId}</span>
                            </div>
                            <div>
                                <span><FormattedMessage id="device.phone-model" />: </span>
                                <span>{this.state.deviceInfo.phoneModel}</span>
                            </div>
                            <div>
                                <span><FormattedMessage id="device.os-version" />: </span>
                                <span>{this.state.deviceInfo.osVersion}</span>
                            </div>
                            <div>
                                <span><FormattedMessage id="device.app-version-code" />: </span>
                                <span>{this.state.deviceInfo.appVersionCode}</span>
                            </div>
                            <div>
                                <span><FormattedMessage id="device.app-version-name" />: </span>
                                <span>{this.state.deviceInfo.appVersionName}</span>
                            </div>
                        </div>
                    ) : (
                        <span><FormattedMessage id="license.not-exist-device" /></span>
                    )}
                </Card>
            )
        }
    }

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
            <PageHeaderWrapper title={<FormattedMessage id="license.transfer-license" />}>
                <div>{this.renderCard()}</div>
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

export default TransferLicense;