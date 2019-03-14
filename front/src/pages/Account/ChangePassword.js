//修改密码

import React, { PureComponent } from 'react';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {
    Card, Input, Button, Form, message
} from 'antd';
import reqwest from 'reqwest';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { setAuthority } from '@/utils/authority';
import md5 from 'js-md5';
import { passwordSalt } from '../../../settings';

const FormItem = Form.Item;

@Form.create()
class ChangePassword extends PureComponent {
    state = {
        submitted: false,
        confirmDirty: false,
    }

    handleConfirmBlur = (e) => {
        const value = e.target.value;
        this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    }

    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password')) {
            callback(formatMessage({ id: "app.change-password.alert.confirm" }));
        }
        else {
            callback();
        }
    }
    
    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form;
        if (value && this.state.confirmDirty) {
            form.validateFields(['confirm'], { force: true });
        }
        callback();
    }

    //处理提交
    handleSubmit = e => {
        const { form } = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                reqwest({
                    url: '/proxy/account/changePassword',
                    method: 'post',
                    data: {
                        userName: localStorage.getItem('adminName'),
                        oldPassword: md5(md5(passwordSalt + values.oldPassword)),
                        newPassword: md5(md5(passwordSalt + values.password)),
                    },
                }).then((data) => {
                    var res = JSON.parse(data.response);

                    //回应为400表示旧密码错误，为200则为成功
                    if (res.code == 400) {
                        message.error(formatMessage({ id: "app.wrong-password" }), 1);
                    }
                    else if (res.code == 200) {
                        message.success(formatMessage({ id: "app.change-password.alert.success" }), 1);
                        setAuthority('guest');
                        window.location.href='/';
                    }
                })
            }
        })
    }

    //渲染表单
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
                    <FormItem {...formItemLayout} label={<FormattedMessage id="app.change-password.old-password"/>}>
                        {getFieldDecorator('oldPassword', {
                            rules: [{
                                required: true, message: formatMessage({ id: "app.change-password.alert.password"}),
                            }],
                        })(
                            <Input.Password />
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label={<FormattedMessage id="app.change-password.new-password"/>}>
                        {getFieldDecorator('password', {
                            rules: [{
                                required: true, message: formatMessage({ id: "app.change-password.alert.password"}),
                            }, {
                                validator: this.validateToNextPassword,
                            }],
                        })(
                            <Input.Password />
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label={<FormattedMessage id="app.change-password.confirm-password"/>}>
                        {getFieldDecorator('confirm', {
                            rules: [{
                                required: true, message: formatMessage({ id: "app.change-password.alert.password"}),
                            }, {
                                validator: this.compareToFirstPassword,
                            }],
                        })(
                            <Input.Password onBlur={this.handleConfirmBlur} />
                        )}
                    </FormItem>
                    <FormItem {...submitFormLayout} style={{ marginTop: 32, marginLeft: 128 }}>
                        <Button type="primary" htmlType="submit">
                            <FormattedMessage id="app.submit" />
                        </Button>
                    </FormItem>
                </Form>
            </Card>
        )
    }

    //渲染页面
    renderCard = () => {
        return (this.state.submitted ? null : this.renderForm());
    }

    //渲染
    render() {
        return (
            <PageHeaderWrapper title={<FormattedMessage id="menu.account.change-password" />}>
                <div>{this.renderCard()}</div>
            </PageHeaderWrapper>
        )
    }
}

export default ChangePassword;