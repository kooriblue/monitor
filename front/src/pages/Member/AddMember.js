//新增会员

import React, { PureComponent } from 'react';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {
    Card, Input, Button, Form, Modal, DatePicker, message
} from 'antd';
import reqwest from 'reqwest';
import { changeTimeFormat } from '@/utils/changeTimeFormat';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

const FormItem = Form.Item;

@Form.create()
class AddMember extends PureComponent {
    state = {
        submitted: false,
        memberInfo: {},
    };

    renderCard = () => {
        return (this.state.submitted ? this.renderResult() : this.renderForm());
    }

    handleFinish = () => {
        this.setState({
            submitted: false,
            memberInfo: {},
        })
    };

    renderResult = () => {
        return (
            <Card bordered={false}>
                <h2><FormattedMessage id="member.success.add" /></h2>
                <p><FormattedMessage id="member.user-id" />: {this.state.memberInfo["userId"]}</p>
                <p><FormattedMessage id="member.create-time" />: {changeTimeFormat(this.state.memberInfo["createTime"])}</p>
                <p><FormattedMessage id="member.expired-time" />: {changeTimeFormat(this.state.memberInfo["expiredTime"])}</p>
                <Button type="primary" onClick={this.handleFinish}><FormattedMessage id="activationcode.add-more" /></Button>
            </Card>
        );
    };

    handleSubmit = e => {
        const { form } = this.props;
        e.preventDefault();
        form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                reqwest({
                    url: '/proxy/member/addMember',
                    method: 'post',
                    data: {
                        userId: values.userId,
                        expiredTime: values.expiredTime.format('YYYY-MM-DD HH:mm:ss'),
                    },
                    type: 'json',
                }).then((data) => {
                    var res = JSON.parse(data.response);
                    if (res.code == 200) {
                        this.setState({
                            memberInfo: res.data,
                            submitted: true,
                        })
                    } else {
                        message.error(formatMessage({ id: "member.error.exist" }), 1);
                    }
                })
            }
        })
    }

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
                    <FormItem {...formItemLayout} label={<FormattedMessage id="member.user-id" />}>
                        {getFieldDecorator('userId', {
                        rules: [{ required: true, message: formatMessage({ id: "member.alert.part-of-user-id" }) }],
                        })(
                            <Input allowClear placeholder={formatMessage({ id: "member.placeholder.user-id" })} />
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label={<FormattedMessage id="member.expired-time" />}>
                        {getFieldDecorator('expiredTime', {
                        rules: [{ required: true, message: formatMessage({ id: "member.alert.expired-time" }) }],
                        })(
                            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
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

    render() {
        return (
            <PageHeaderWrapper title={<FormattedMessage id="member.add" />}>
                <div>{this.renderCard()}</div>
            </PageHeaderWrapper>
        )
    }
}

export default AddMember;