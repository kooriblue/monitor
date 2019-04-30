import React, { PureComponent } from 'react';
import {
    Input, Button, Card, Table, Row, Col, Form, Select, Affix, message
} from 'antd';
import { FormattedMessage, formatMessage } from 'umi/locale';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { changeTimeFormat } from '@/utils/changeTimeFormat';
import styles from './QueryDevice.less';
import { connect } from 'dva';
const FormItem = Form.Item;
const Option = Select.Option;

@connect(({ appinfo, device, loading }) => ({
    appinfo,
    device,
    quering: loading.effects['device/query'],
}))
@Form.create()
class QueryDevice extends PureComponent {
    state = {
        deviceDtl: false,
        curDevice: {},
    };

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch({
            type: 'appinfo/appinfo',
        })

        this.fetch({ userId: '', appBundleId: '' });
    }

    componentWillUnmount() {
        const { dispatch } = this.props;
        dispatch({
            type: 'device/clear'
        })
    }

    fetch = (params = {}) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'device/query',
            payload: params,
        })
    }

    handleSearch = e => {
        const { form } = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
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
            quering,
            device,
            appinfo,
        } = this.props;

        var columns = [
            {
                title: formatMessage({ id: "member.user-id" }),
                dataIndex: 'userId',
                width: '22.5%'
            },
            {
                title: formatMessage({ id: "device.device-id" }),
                dataIndex: 'adId',
                width: '18%'
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
                title: formatMessage({ id: "member.create-time" }),
                dataIndex: 'createTime',
                width: '18%',
                render: text => <span>{changeTimeFormat(text)}</span>
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
                                        appinfo.appInfo.length == 0 ? (
                                            <Select placeholder={formatMessage({ id: "payorder.placeholder.app" })} >
                                                <Option value=""><FormattedMessage id="payorder.option" /></Option>
                                            </Select>
                                        ) : (
                                            <Select placeholder={formatMessage({ id: "payorder.placeholder.app" })} >
                                                <Option value=""><FormattedMessage id="payorder.option" /></Option>
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
                                <Button type="primary" htmlType="submit">
                                <FormattedMessage id="app.query" />
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </div>
                <div style={{ color: 'rgba(103, 125, 221, 0.795)' }}>
                    * <FormattedMessage id="device.pro-row" />
                </div>
                {/* 表格部分 */}
                <div>
                    <Table
                        bordered
                        columns={columns}
                        dataSource={device.deviceData}
                        pagination={{ pageSize: 10 }}
                        loading={quering}
                        rowClassName={this.handleProRow}
                    />
                </div>
            </Card>
        )
    }

    handleProRow = (record, index) => {
        return (record["isPro"] ? styles.enabledRow : styles.unenabledRow);
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
                "title": formatMessage({ id: "member.create-time" }),
                "dataIndex": changeTimeFormat(device["createTime"]),
            },
            {
                "title": formatMessage({ id: "device.is-pro" }),
                "dataIndex": (device["isPro"] ? formatMessage({ id: "app.true" }) : formatMessage({ id: "app.false" })),
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