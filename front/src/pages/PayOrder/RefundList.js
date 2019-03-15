/*
 *查看退款列表
 */

 import React, { PureComponent } from 'react';
 import { formatMessage, FormattedMessage } from 'umi/locale';
import { 
    Card, Table, Affix, Button
} from 'antd';
import { changeTimeFormat } from '@/utils/changeTimeFormat';
import reqwest from 'reqwest';  //ajax格式的请求函数
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

class RefundList extends PureComponent {
    state = {
        refundList: [],
        pagination: {},
        loading: false,
        refundDtl: false,
        curRecord: {},
    }

    componentDidMount() {
        this.fetch();
    }

    fetch = (params = {}) => {
        this.setState({ loading: true });
        reqwest({
            url: '/proxy/payorder/getRefundList',
            method: 'post',
            data: {
                page: 1,
                size: 10,
                ...params,
            },
            type: 'json',
        }).then((data) => {
            var res = JSON.parse(data.response);
            const pagination = {...this.state.pagination};
            pagination.total = res.data.total;
            this.setState({
                loading: false,
                refundList: res.data.list,
                pagination,
            })
        })
    }

    columns = [
        {
            title: formatMessage({ id: "payorder.user-id" }),
            dataIndex: 'userId',
            width: '26%',
        },
        {
            title: formatMessage({ id: "payorder.refund.before-expired-time" }),
            dataIndex: 'beforeExpiredTime',
            width: '18%',
            render: text => {
                return (<div>{changeTimeFormat(text)}</div>);
            },
        },
        {
            title: formatMessage({ id: "payorder.refund.after-expired-time" }),
            dataIndex: 'afterExpiredTime',
            width: '18%',
            render: text => {
                return (<div>{changeTimeFormat(text)}</div>);
            },
        },
        {
            title: formatMessage({ id: "payorder.refund-status" }),
            dataIndex: 'refundStatus',
            width: '15%',
            render: text => {
                var str = formatMessage({ id: (text == 200? "payorder.refund.success-status" : "payorder.refund.fail-status") })
                return (<div>{str}</div>);
            },
        },
        {
            dataIndex: 'operation',
            render: (text, record, index) => {
                return (
                    <a href="#" onClick={this.handleRefundDetails.bind(this, record)}>
                        <FormattedMessage id="payorder.refund-details" />
                    </a>
                )
            }
        }
    ];

    handleRefundDetails = (record) => {
        this.setState({
            refundDtl: true,
            curRecord: record,
        })
    }

    handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({ pagination: pager });
        this.fetch({
            page: pagination.current,
        })
    }

    renderTable = () => {
        return (
            <Card bordered={false}>
                <Table
                    bordered
                    dataSource={this.state.refundList}
                    columns={this.columns}
                    pagination={this.state.pagination}
                    loading={this.state.loading}
                    onChange={this.handleTableChange}
                />
            </Card>
        )
    }

    renderRefundDetails = () => {
        var record = this.state.curRecord;
        const data = [
            {
                "title": formatMessage({ id: "payorder.refund-id" }),
                "dataIndex": record['refundId'],
            },
            {
                "title": formatMessage({ id: "payorder.refund.order-trade-no" }),
                "dataIndex": record['orderTradeNo'],
            },
            {
                "title": formatMessage({ id: "payorder.user-id" }),
                "dataIndex": record['userId'],
            },
            {
                "title": formatMessage({ id: "payorder.refund.before-expired-time" }),
                "dataIndex": changeTimeFormat(record['beforeExpiredTime']),
            },
            {
                "title": formatMessage({ id: "payorder.refund.after-expired-time" }),
                "dataIndex": changeTimeFormat(record['afterExpiredTime']),
            },
            {
                "title": formatMessage({ id: "payorder.refund-status" }),
                "dataIndex": formatMessage({ id: (record['refundStatus'] == 200? "payorder.refund.success-status" : "payorder.refund.fail-status") }),
            },
            {
                "title": formatMessage({ id: "payorder.create-time" }),
                "dataIndex": changeTimeFormat(record['createTime']),
            },
            {
                "title": formatMessage({ id: "app.cell-operator" }),
                "dataIndex": record['cellOperator'],
            },
            {
                "title": formatMessage({ id: "app.remark" }),
                "dataIndex": record['remark'],
            },
        ];

        const cols = [
            {
                dataIndex: 'title',
            },
            {
                dataIndex: 'dataIndex',
            },
        ];

        return (
            <Card bordered={false}>
                <Affix offsetTop={10}>
                    <Button type="primary" onClick={this.handleRefundDetailFinish}>
                        <FormattedMessage id="app.return" />
                    </Button>
                </Affix>
                <Table
                    bordered
                    dataSource={data}
                    columns={cols}
                    showHeader={false}
                    pagination={false}
                    style={{ marginTop: 10 }}
                />
            </Card>
        )
    }

    handleRefundDetailFinish = () => {
        this.setState({
            refundDtl: false,
            curRecord: {},
        })
    }

    render() {
        return (
            <PageHeaderWrapper title={<FormattedMessage id="payorder.refund-list" />}>
                {this.state.refundDtl ? this.renderRefundDetails() : this.renderTable()}
            </PageHeaderWrapper>
        )
    }
}

export default RefundList;