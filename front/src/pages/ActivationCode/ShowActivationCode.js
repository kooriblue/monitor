/*
 *查看激活码
 */

import React, { PureComponent } from 'react';
import { formatMessage, FormattedMessage } from 'umi/locale';
import { 
    Card, Table 
} from 'antd';
import { changeTimeFormat } from '@/utils/changeTimeFormat';
import reqwest from 'reqwest';  //ajax格式的请求函数
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

// const getValue = obj => 
//     Object.keys(obj).map(key => obj[key]).join(',');

class ShowActivationCode extends PureComponent {
    //该页面的状态
    state = {
        activationCodeData: [],  //表数据
        pagination: {},  //分页
        loading: false,  //加载数据中
    }

    //表格的列
    columns = [
        {
            title: formatMessage({ id: "activationcode" }),
            dataIndex: 'codeSn',
            width: '20%',
            fixed: 'left'
        },
        {
            title: formatMessage({ id: "activationcode.user-id" }),
            dataIndex: 'userId',
            width: '20%'
        },
        {
            title: formatMessage({ id: "activationcode.service-years" }),
            dataIndex: 'serviceYears',
        },
        {
            title: formatMessage({ id: "activationcode.service-months" }),
            dataIndex: 'serviceMonths',
        },
        {
            title: formatMessage({ id: "activationcode.service-days" }),
            dataIndex: 'serviceDays',
        },
        {
            title: formatMessage({ id: "activationcode.service-hours" }),
            dataIndex: 'serviceHours',
        },
        {
            title: formatMessage({ id: "activationcode.binding-app-bundle-id" }),
            dataIndex: 'bindingAppBundleId',
        },
        {
            title: formatMessage({ id: "activationcode.activate-time" }),
            dataIndex: 'activateTime',
            //sorter: (a, b) => a.activateTime - b.activateTime,
            render: text => {
                if (text === null) {
                    return (
                        <div><FormattedMessage id="activationcode.unactivated" /></div>
                    )
                }
                return (
                    <div>{changeTimeFormat(text)}</div>
                )
            },
        },
        {
            title: formatMessage({ id: "activationcode.remark" }),
            dataIndex: 'remark',
        },
    ];

    //根据页码请求数据，默认获取前十条数据
    fetch = (params = {}) => {
        this.setState({ loading: true });
        reqwest({
            url: '/proxy/activationcode/getActivationCodeInfo',
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
            //总数据数
            pagination.total = res.data.total;
            this.setState({
                loading: false,
                activationCodeData: res.data.list,
                pagination,
            });
        });
    };

    //换页时调用该函数
    handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({ pagination: pager });
        this.fetch({
            page: pagination.current,
        });
    };

    //加载该页面时调用该函数
    componentDidMount() {
        this.fetch();
    }

    //查询
    // handleSearch = e => {
    // }

    render() {
        return (
            <PageHeaderWrapper title={<FormattedMessage id="activationcode.show" />}>
                <Card bordered={false}>
                    <div>
                        <Table 
                            bordered
                            columns={this.columns} 
                            dataSource={this.state.activationCodeData}
                            pagination={this.state.pagination}
                            loading={this.state.loading}
                            onChange={this.handleTableChange}
                            scroll={{ x: 1300 }}
                        />
                    </div>
                </Card>
            </PageHeaderWrapper>
        )
    }
}

export default ShowActivationCode;