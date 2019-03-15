import React, { PureComponent } from 'react';
import {
    Input, Button, Card, Table, Row, Col, Form, Select, Affix, message
} from 'antd';
import { FormattedMessage, formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import reqwest from 'reqwest';
import { changeTimeFormat } from '@/utils/changeTimeFormat';
import styles from './QueryDevice.less';
const FormItem = Form.Item;
const Option = Select.Option;

@Form.create()
class QueryDevice extends PureComponent {
    state = {
        deviceDtl: false,
        loading: false,
        pagination: {},

        deviceData: [],
        curDevice: {},
        app: [],
        
        userId: '',
        appBundleId: '',
    };

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
    }

    componentWillUnmount() {
        this.setState({
            deviceDtl: false,
            loading: false,
            pagination: {},

            deviceData: [],
            curDevice: {},
            app: [],
            
            userId: '',
            appBundleId: '',
        })
    }

    fetch = (params = {}) => {
        if (params.appBundleId == "" && params.userId == "") {
            message.warn(formatMessage({ id: "device.warn.empty-selection" }), 1);
        } else {
            this.setState({ loading: true });
            reqwest({
                url: '/proxy/device/queryDevice',
                method: 'post',
                data: {
                    page: 1,
                    size: 10,
                    ...params,
                },
                type: 'json',
            }).then((data) => {
                if (data.status == 1) {
                    message.error(formatMessage({ id: "device.fail.query-device" }), 1);
                } else if (data.status == 0) {
                    const pagination = { ...this.state.pagination };
                    var res = JSON.parse(data.response);
                    pagination.total = res.data.total;

                    this.setState({
                        loading: false,
                        deviceData: res.data.list,
                        pagination,
                    })
                }
            })
        }
    }

    handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({ pagination: pager });
        this.fetch({
            page: pagination.current,
            userId: this.state.userId,
            appBundleId: this.state.appBundleId,
        })
    }

    handleSearch = e => {
        const { form } = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.setState({
                    userId: (((values.userId === null) || (typeof(values.userId) == "undefined"))? '':values.userId),
                    appBundleId: (((values.appBundleId === null) || (typeof(values.appBundleId) == "undefined"))? '':values.appBundleId),
                })

                this.fetch({
                    userId: (((values.userId === null) || (typeof(values.userId) == "undefined"))? '':values.userId),
                    appBundleId: (((values.appBundleId === null) || (typeof(values.appBundleId) == "undefined"))? '':values.appBundleId),
                })
            }
        })
    }

    renderInitialPage = () => {
        const {
            form: { getFieldDecorator },
        } = this.props;

        var columns = [
            {
                title: formatMessage({ id: "member.user-id" }),
                dataIndex: 'userId',
                width: '22.5%'
            },
            {
                title: formatMessage({ id: "device.device-id" }),
                dataIndex: 'deviceId',
                width: '27.5%'
            },
            {
                title: formatMessage({ id: "device.platform" }),
                dataIndex: 'platform',
                width: '12%'
            },
            {
                title: formatMessage({ id: "device.app-bundle-id" }),
                dataIndex: 'appBundleId',
                width: '18%',
            },
            {
                dataIndex: 'operation',
                width: '20%',
                render: (text, record, index) => {
                    return (
                        <a href="#" onClick={this.handleDeviceDetails.bind(this, record)}>
                            <FormattedMessage id="member.device-info" />
                        </a>
                    )
                }
            }
        ]

        return (
            <Card bordered={false}>
                {/* 查询部分 */}
                <div className={styles.tableListForm}>
                    <Form onSubmit={this.handleSearch}>
                        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
                            <Col md={8} sm={24}>
                                <FormItem label={<FormattedMessage id="member.user-id" />}>
                                    {getFieldDecorator('userId')(
                                        <Input
                                            allowClear
                                            placeholder={formatMessage({ id: "member.placeholder.part-of-user-id" })}
                                        />
                                    )}
                                </FormItem>
                            </Col>
                            <Col md={8} sm={24}>
                                <FormItem label={<FormattedMessage id="payorder.application" />}>
                                    {getFieldDecorator('appBundleId')(
                                        this.state.app.length == 0 ? (
                                            <Select placeholder={formatMessage({ id: "payorder.placeholder.app" })} >
                                                <Option value=""><FormattedMessage id="payorder.option" /></Option>
                                            </Select>
                                        ) : (
                                            <Select placeholder={formatMessage({ id: "payorder.placeholder.app" })} >
                                                <Option value=""><FormattedMessage id="payorder.option" /></Option>
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
                        dataSource={this.state.deviceData}
                        pagination={this.state.pagination}
                        loading={this.state.loading}
                        onChange={this.handleTableChange}
                    />
                </div>
            </Card>
        )
    }

    handleDeviceDetails = (record) => {
        this.setState({
            curDevice: record,
            deviceDtl: true,
        })
    }

    renderDeviceDetails = () => {
        var device = this.state.curDevice;

        var data = [
            {
                "title": formatMessage({ id: "device.ad-id" }),
                "dataIndex": device["adId"],
            },
            {
                "title": formatMessage({ id: "device.api-version-code" }),
                "dataIndex": device["apiVersionCode"]
            },
            {
                "title": formatMessage({ id: "device.app-bundle-id" }),
                "dataIndex": device["appBundleId"],
            },
            {
                "title": formatMessage({ id: "device.app-version-code" }),
                "dataIndex": device["appVersionCode"],
            },
            {
                "title": formatMessage({ id: "device.app-version-name" }),
                "dataIndex": device["appVersionName"],
            },
            {
                "title": formatMessage({ id: "device.channel-id" }),
                "dataIndex": device["channelId"],
            },
            {
                "title": formatMessage({ id: "device.client-message" }),
                "dataIndex": device["clientMessage"],
            },
            {
                "title": formatMessage({ id: "member.create-time" }),
                "dataIndex": changeTimeFormat(device["createTime"]),
            },
            {
                "title": formatMessage({ id: "device.device-id" }),
                "dataIndex": device["deviceId"],
            },
            {
                "title": formatMessage({ id: "member.expired-time" }),
                "dataIndex": changeTimeFormat(device["expiredTime"]),
            },
            {
                "title": formatMessage({ id: "device.is-pro" }),
                "dataIndex": (device["isPro"] ? formatMessage({ id: "app.true" }) : formatMessage({ id: "app.false" })),
            },
            {
                "title": formatMessage({ id: "device.jailbreak-flag" }),
                "dataIndex": device["jailbreakFlag"],
            },
            {
                "title": formatMessage({ id: "device.last-report-time" }),
                "dataIndex": changeTimeFormat(device["lastReportTime"]),
            },
            {
                "title": formatMessage({ id: "device.manufacturer" }),
                "dataIndex": device["manufacturer"],
            },
            {
                "title": formatMessage({ id: "member.member-id" }),
                "dataIndex": device["memberId"],
            },
            {
                "title": formatMessage({ id: "device.operator-name" }),
                "dataIndex": device["operatorName"],
            },
            {
                "title": formatMessage({ id: "device.os-device-code" }),
                "dataIndex": device["osDeviceCode"],
            },
            {
                "title": formatMessage({ id: "device.os-name" }),
                "dataIndex": device["osName"],
            },
            {
                "title": formatMessage({ id: "device.os-version" }),
                "dataIndex": device["osVersion"],
            },
            {
                "title": formatMessage({ id: "device.phone-model" }),
                "dataIndex": device["phoneModel"],
            },
            {
                "title": formatMessage({ id: "device.platform" }),
                "dataIndex": device["platform"],
            },
            {
                "title": formatMessage({ id: "device.request-count" }),
                "dataIndex": device["requestCount"],
            },
            {
                "title": formatMessage({ id: "member.user-id" }),
                "dataIndex": device["userId"],
            },
        ];

        var deviceColumns = [
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
                        columns={deviceColumns}
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

    renderCard = () => {
        return (this.state.deviceDtl ? this.renderDeviceDetails() : this.renderInitialPage());
    }

    render() {
        return(
            <PageHeaderWrapper title={<FormattedMessage id="device.query" />}>
                <div>{this.renderCard()}</div>
            </PageHeaderWrapper>
        )
    }
}

export default QueryDevice;