//添加激活码

import React, { PureComponent } from 'react';
import { connect } from 'dva';  //使用dva路由连接到model
import { formatMessage, FormattedMessage } from 'umi/locale';  //设置需要采用不同语言的内容
import { Form, Input, Button, Card, Select } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import reqwest from 'reqwest';  //ajax格式的请求函数
// import { routerRedux } from 'dva/router';
// import router from 'umi/router';

const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;

//connect with models
// @connect(({ loading }) => ({
//     submitting: loading.effects['activationcode/submitActivationCodeForm'],
// }))
// @connect(({ activationcode }) => ({
//     data: activationcode.codeSn,
// }))
@Form.create()
class ActivationCodeForm extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            codeSn: '',
            submitted: false,
            app: [],
        };
    }

    renderCard = () => {
        return (this.state.submitted ? this.renderResult() : this.renderForm());
    }

    handleFinish = () => {
        this.setState({
            submitted: false,
            codeSn: '',
        })
    };

    renderResult = () => {
        return (
            <Card bordered={false}>
                <h1><FormattedMessage id="activationcode.code-generated" /></h1>
                <p>{this.state.codeSn}</p>
                <Button type="primary" onClick={this.handleFinish}><FormattedMessage id="activationcode.add-more" /></Button>
            </Card>
        );
    };

    handleSubmit = e => {
        const { dispatch, form } = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                //antdpro自带方法
                // dispatch({
                //     type: 'activationcode/submitActivationCodeForm',
                //     payload: values,
                // });

                //fetch方法
                //fetch('/proxy/submitActivationCode', {
                //     method: "POST",
                //     headers: {
                //       'Content-Type': 'application/x-www-form-urlencoded'
                //     },
                //     body: `serviceYears=${values.serviceYears}&serviceMonths=${values.serviceMonths}&serviceDays=${values.serviceDays}&serviceHours=${values.serviceHours}&remark=${values.remark}`
                //   }).then(res => res.json()).then(json => {
                //       this.setState({codeSn: json.codeSn});
                //       alert("提交成功\n" + this.state.codeSn.data);
                //   })

                reqwest({
                    url: '/proxy/activationcode/submitActivationCode',
                    method: 'post',
                    data: {
                        serviceYears: values.serviceYears,
                        serviceMonths: values.serviceMonths,
                        serviceDays: values.serviceDays,
                        serviceHours: values.serviceHours,
                        remark: values.remark,
                        bindingAppBundleId: values.bindingAppBundleId,
                    },
                    type: 'json',
                }).then((data) => {
                    var res = JSON.parse(data.response);
                    this.setState({
                        codeSn: res.data,
                        submitted: true,
                    })
                })
            }
        });
    };

    renderForm = () => {
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
            <Card bordered={false}>
                <Form onSubmit={this.handleSubmit}>
                    <FormItem {...formItemLayout} label={<FormattedMessage id="activationcode.service-years" />}>
                        {getFieldDecorator('serviceYears', {
                        rules: [{ required: true, message: formatMessage({ id: 'activationcode.alert.years' }) }],
                        })(
                            <Input allowClear placeholder={formatMessage({ id: "activationcode.placeholder.number" })} />
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label={<FormattedMessage id="activationcode.service-months" />}>
                        {getFieldDecorator('serviceMonths', {
                        rules: [{ required: true, message: formatMessage({ id: 'activationcode.alert.months' }) }],
                        })(
                        <Input allowClear placeholder={formatMessage({ id: "activationcode.placeholder.number" })} />
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label={<FormattedMessage id="activationcode.service-days" />}>
                        {getFieldDecorator('serviceDays', {
                        rules: [{ required: true, message: formatMessage({ id: 'activationcode.alert.days' }) }],
                        })(
                        <Input allowClear placeholder={formatMessage({ id: "activationcode.placeholder.number" })} />
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label={<FormattedMessage id="activationcode.service-hours" />}>
                        {getFieldDecorator('serviceHours', {
                        rules: [{ required: true, message: formatMessage({ id: 'activationcode.alert.hours' }) }],
                        })(
                        <Input allowClear placeholder={formatMessage({ id: "activationcode.placeholder.number" })} />
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label={<FormattedMessage id="device.app-bundle-id" />}>
                        {getFieldDecorator('bindingAppBundleId')(
                            this.state.app.length == 0 ? (
                                <Select placeholder={formatMessage({ id: "payorder.placeholder.app" })} >
                                    <Option value=""><FormattedMessage id="payorder.option" /></Option>
                                </Select>
                            ) : (
                                <Select placeholder={formatMessage({ id: "payorder.placeholder.app" })} >
                                    <Option value=""><FormattedMessage id="payorder.option" /></Option>
                                    {this.state.app.map((item, index) => {
                                            var str = item.appName + "(" + item.appBundleId + ")";
                                            return <Option value={item.appBundleId}>{str}</Option>
                                        })
                                    }
                                </Select>
                            )
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label={<FormattedMessage id="activationcode.remark" />}>
                        {getFieldDecorator('remark')(
                            <TextArea rows={5} placeholder={formatMessage({ id: "activationcode.placeholder.remark" })} />
                        )}
                    </FormItem>
                    <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
                        <Button type="primary" htmlType="submit">
                            <FormattedMessage id="app.submit" />
                        </Button>
                    </FormItem>
                </Form>
            </Card>
        )
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
    }

    render() {
        return (
            <PageHeaderWrapper
                title={<FormattedMessage id="activationcode.generate" />}
                content={<FormattedMessage id="activationcode.description" />}
            >
                <div>{this.renderCard()}</div>
            </PageHeaderWrapper>
        );
    }
}

export default ActivationCodeForm;