import React, { PureComponent } from 'react';
import {
    Card, Input, Button, Table, Modal, 
    message, Affix, Form, Select, Menu, 
    Dropdown, Radio, Icon
} from 'antd';
import { formatMessage, FormattedMessage } from 'umi/locale';
import reqwest from 'reqwest';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './style.less';
import md5 from 'js-md5';
import { passwordSalt } from '../../../settings';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;

@Form.create()
class ProductManagement extends PureComponent {
    state = {
        productDtl: false,
        app: [],

        appBundleId: '',
        productList: [],
        loading: false,
        pagination: {},

        curRecord: {},
        curIndex: 0,
        editModalVisible: false,
        editInfo: {},
        pwdModalVisible: false,
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

        this.fetch();
    }

    fetch = (params = {}) => {
        reqwest({
            url: '/proxy/product/queryProducts',
            method: 'post',
            data: {
                page: 0,
                size: 10,
                appBundleId: '',
                ...params,
            },
            type: 'json',
        }).then((data) => {
            if (data.status == 0) {
                var res = JSON.parse(data.response);
                const pagination = { ...this.state.pagination };
                pagination.total = res.data.total;
                this.setState({
                    productList: res.data.list,
                    pagination
                });
            } else {
                message.error(formatMessage({ id: "product.fail-to-get-product" }), 1);
            }
        })
    }

    handleModifyProduct = (index) => {
        this.setState({
            curRecord: this.state.productList[index],
            curIndex: index,
            editModalVisible: true,
        })
    }

    renderInitPage = () => {
        const { form: { getFieldDecorator } } = this.props;

        const columns = [
            {
                title: formatMessage({ id: "device.app-bundle-id" }),
                dataIndex: 'appBundleId',
            },
            {
                title: formatMessage({ id: "product.product-no" }),
                dataIndex: 'productNo',
            },
            {
                title: formatMessage({ id: "product.product-title" }),
                dataIndex: 'productTitle',
            },
            {
                title: formatMessage({ id: "product.product-price" }),
                dataIndex: 'productPrice',
                render: text => {
                    return (
                        <div>{(text / 100).toFixed(2)}</div>
                    )
                }
            },
            {
                dataIndex: 'operation',
                render: (text, record, index) => {
                    const menu = (
                        <Menu>
                            <Menu.Item>
                                <a href="#" onClick={this.handleProductDetails.bind(this, record)}>
                                    <FormattedMessage id="product.details" />
                                </a>
                            </Menu.Item>
                            <Menu.Item>
                                <a href="#" onClick={this.handleModifyProduct.bind(this, index)}>
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
            }
        ];

        return (
            <Card bordered={false}>
                {/* 查询部分 */}
                <div>
                    {this.state.app.length == 0 ? (
                        <Select
                            style={{ width: 400 }}
                            placeholder={formatMessage({ id: "payorder.placeholder.app" })}
                        >
                            <Option value=""><FormattedMessage id="payorder.option" /></Option>
                        </Select>
                    ) : (
                        <Select
                            style={{ width: 400 }}
                            onChange={this.handleAppChange}
                            placeholder={formatMessage({ id: "payorder.placeholder.app" })}
                        >
                            <Option value=""><FormattedMessage id="payorder.statistics.all-app" /></Option>
                            {this.state.app.map((item, index) => {
                                    var str = item.appName + "(" + item.appBundleId + ")";
                                    return <Option value={item.appBundleId}>{str}</Option>
                                })
                            }
                        </Select>
                    )}
                </div>
                <hr />
                {/* 表格部分 */}
                <Table
                    bordered
                    dataSource={this.state.productList}
                    columns={columns}
                    loading={this.state.loading}
                    pagination={this.state.pagination}
                    onChange={this.handleTableChange}
                    rowClassName={this.handleEnabledRow}
                />
            </Card>
        )
    }

    handleEnabledRow = (record, index) => {
        return ((record["isEnabled"] == 0 || record["productPrice"] == 0) ? styles.unenabledRow : styles.enabledRow);
    }

    handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({ pagination: pager });
        this.fetch({
            page: pagination.current
        });
    }

    handleAppChange = (value) => {
        this.setState({ appBundleId: value });
        this.fetch({ appBundleId: value });
    }

    handleProductDetails = (record) => {
        this.setState({
            curRecord: record,
            productDtl: true,
        })
    }

    renderProductDetails = () => {
        var record = this.state.curRecord;
        var data = [
            {
                "title": formatMessage({ id: "device.app-bundle-id" }),
                "dataIndex": record['appBundleId'],
            },
            {
                "title": formatMessage({ id: "product.product-no" }),
                "dataIndex": record['productNo'],
            },
            {
                "title": formatMessage({ id: "product.product-title" }),
                "dataIndex": record['productTitle'],
            },
            {
                "title": formatMessage({ id: "product.subtitle" }),
                "dataIndex": record['productSubtitle'],
            },
            {
                "title": formatMessage({ id: "activationcode.service-years" }),
                "dataIndex": record['serviceYears'],
            },
            {
                "title": formatMessage({ id: "activationcode.service-months" }),
                "dataIndex": record['serviceMonths'],
            },
            {
                "title": formatMessage({ id: "activationcode.service-days" }),
                "dataIndex": record['serviceDays'],
            },
            {
                "title": formatMessage({ id: "product.product-price" }),
                "dataIndex": (record['productPrice'] / 100).toFixed(2),
            },
            {
                "title": formatMessage({ id: "product.product-price-usd" }),
                "dataIndex": record['productPriceUsd'],
            },
            {
                "title": formatMessage({ id: "payorder.currency" }),
                "dataIndex": record['currency'],
            },
            {
                "title": formatMessage({ id: "device.platform" }),
                "dataIndex": record['platform'],
            },
            {
                "title": formatMessage({ id: "product.details" }),
                "dataIndex": record['productDetail'],
            },
            {
                "title": formatMessage({ id: "product.type" }),
                "dataIndex": record['productType'],
            },
            {
                "title": formatMessage({ id: "product.is-enabled" }),
                "dataIndex": (record['isEnabled'] == 1 ? formatMessage({ id: "app.true" }) : formatMessage({ id: "app.false" })),
            },
            {
                "title": formatMessage({ id: "product.id" }),
                "dataIndex": record['productId'],
            },
        ];

        var cols = [
            { dataIndex: 'title' },
            { dataIndex: 'dataIndex' },
        ];

        return (
            <Card bordered={false}>
                <Affix offsetTop={10} style={{ marginBottom: 10 }}>
                    <Button type="primary" onClick={this.handleProductFinish}>
                        <FormattedMessage id="app.return" />
                    </Button>
                </Affix>
                <Table
                    bordered
                    showHeader={false}
                    pagination={false}
                    dataSource={data}
                    columns={cols}
                />
            </Card>
        )
    }

    handleProductFinish = () => {
        this.setState({
            curRecord: {},
            productDtl: false,
        })
    }

    renderCard = () => {
        return (this.state.productDtl ? this.renderProductDetails() : this.renderInitPage());
    }

    handleSubmitEditInfo = e => {
        const { form } = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.setState({
                    editInfo: {
                        productNo: this.state.curRecord["productNo"],
                        productPrice: values.productPrice,
                        productPriceUsd: values.productPriceUsd,
                        isEnabled: values.isEnabled,
                    },
                    pwdModalVisible: true,
                })
            }
        })
    }

    reloadProductTable = (index, info) => {
        var products = this.state.productList;
        products[index].productPrice = info.productPrice;
        products[index].productPriceUsd = info.productPriceUsd;
        products[index].isEnabled = info.isEnabled;
    }

    handleSubmitPassword = e => {
        const { form } = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                reqwest({
                    url: '/proxy/product/modifyProduct',
                    method: 'post',
                    data: {
                        productNo: this.state.editInfo.productNo,
                        productPrice: this.state.editInfo.productPrice,
                        productPriceUsd: this.state.editInfo.productPriceUsd,
                        isEnabled: this.state.editInfo.isEnabled,
                        adminName: localStorage.getItem('adminName'),
                        password: md5(md5(passwordSalt + values.password)),
                    },
                    type: 'json',
                }).then((data) => {
                    if (data.status == 0) {
                        var res = JSON.parse(data.response);
                        if (res.code == 200) {
                            message.success(formatMessage({ id: "product.success.edit" }), 2);
                            window.location.href = "/application/product";
                        } else {
                            if (res.message == "1") {
                                message.error(formatMessage({ id: "app.wrong-password" }), 1);
                            } else {
                                message.error(formatMessage({ id: "product.no-product" }), 1);
                            }
                        }
                    } else {
                        message.error(formatMessage({ id: "product.fail.edit" }), 1);
                        this.setState({
                            editModalVisible: false,
                            pwdModalVisible: false,
                            curIndex: 0,
                            curRecord: {},
                            editInfo: {},
                        })
                    }
                })
            }
        })
    }

    handleEditCancel = () => {
        this.setState({
            curRecord: {},
            curIndex: 0,
            editModalVisible: false,
        })
    }

    handlePasswordCancel = () => {
        this.setState({
            editInfo: {},
            pwdModalVisible: false,
        })
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
            <PageHeaderWrapper title={formatMessage({ id: "product.management" })}>
                <div>{this.renderCard()}</div>
                <Modal
                    destroyOnClose
                    width={650}
                    visible={this.state.editModalVisible}
                    title={formatMessage({ id: "member.edit" })}
                    onCancel={this.handleEditCancel}
                    footer={null}
                >
                    <Form onSubmit={this.handleSubmitEditInfo}>
                        <FormItem {...formItemLayout} label={<FormattedMessage id="product.product-no" />}>
                            <span>{this.state.curRecord["productNo"]}</span>
                        </FormItem>
                        <FormItem {...formItemLayout} label={<FormattedMessage id="product.product-price" />}>
                            {getFieldDecorator('productPrice', { initialValue: this.state.curRecord["productPrice"] })(
                                <Input allowClear />
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label={<FormattedMessage id="product.product-price-usd" />}>
                            {getFieldDecorator('productPriceUsd', { initialValue: this.state.curRecord["productPriceUsd"] })(
                                <Input allowClear />
                            )}
                        </FormItem>
                        <FormItem {...formItemLayout} label={<FormattedMessage id="product.is-enabled" />}>
                            {getFieldDecorator('isEnabled', { initialValue: this.state.curRecord["isEnabled"] })(
                                <RadioGroup>
                                    <Radio value={1}><FormattedMessage id="app.true" /></Radio>
                                    <Radio value={0}><FormattedMessage id="app.false" /></Radio>
                                </RadioGroup>
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
                    visible={this.state.pwdModalVisible}
                    centered
                    width={480}
                    title={formatMessage({ id: "member.password" })}
                    onCancel={this.handlePasswordCancel}
                    footer={null}
                >
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

export default ProductManagement;