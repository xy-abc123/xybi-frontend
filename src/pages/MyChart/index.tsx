import React, {useEffect, useState} from 'react';
import {listMyChartByPageUsingPost} from "@/services/xybi/chartController";
import {Avatar, Card, List, message, Result} from "antd";
import ReactECharts from "echarts-for-react";
import {useModel} from "@@/exports";
import Search from "antd/es/input/Search";


const MyChartPage: React.FC = () => {


  const initSearchParams = {
    current: 1,
    pageSize: 3,
    sortField:'createTime',
    sortOrder:'desc'


  }
  const [searchParams, setSearchParams] = useState<API.ChartQueryRequest>({...initSearchParams})
  const [chartList, setChartlist] = useState<API.Chart[]>()
  const [total, setTotal] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const {initialState} = useModel('@@initialState');
  const {currentUser} = initialState ?? {}
  const loadData = async () => {
    setLoading(true)
    try {
      const res = await listMyChartByPageUsingPost(searchParams)
      if (res.data) {
        setChartlist(res.data.records ?? [])
        setTotal(res.data.total ?? 0);

        //隐藏图表的title
        if (res.data.records) {
          res.data.records.forEach(data => {
            if(data.status==='succeed'){
              const chartOption = JSON.parse(data.genChart ?? '{}')
              chartOption.title = undefined
              data.genChart = JSON.stringify(chartOption);
            }

          })
        }
      } else {
        message.error('获取图表失败')
      }
    } catch (e: any) {
      message.error('获取图表失败' + e.message)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [searchParams]);

  return (
    <div className={'MyChartPa ge'}>
      <div>
        <Search placeholder={'请输入图表名称'} loading={loading} enterButton onSearch={(value) => {
          setSearchParams({
            ...searchParams,
            name: value,
          })
        }}/>
      </div>
      <div style={{marginBottom: 16}}/>
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 1,
          md: 1,
          lg: 2,
          xl: 2,
          xxl: 2

        }}
        size="large"
        pagination={{
          onChange: (page, pageSize) => {
            setSearchParams({
              ...searchParams,
              current: page,
              pageSize: pageSize
            })
          },
          current: searchParams.current,
          pageSize: searchParams.pageSize,
          total: total
        }}
        loading={loading}
        dataSource={chartList}
        footer={
          <div>
            <b>ant design</b> footer part
          </div>
        }
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card>
              <List.Item.Meta
                avatar={<Avatar src={currentUser?.userAvatar}/>}
                title={item.name}
                description={item.chartType ? ('图表类型:' + item.chartType) : undefined}
              />
              <>
                {
                  item.status==='wait'&&<>
                    <Result status="warning"
                            title="待生成"
                            subTitle={item.execMessage??'当前生成队列繁忙,请耐心等待'}/>
                  </>
                }
                {
                  item.status === 'succeed' && <>
                    <div style={{marginBottom: 16}}></div>
                    {'分析目标:' + item.goal}
                    <div style={{marginBottom: 16}}></div>
                    <ReactECharts option={JSON.parse(item.genChart ?? '{}')}/>
                  </>
                }
                {
                  item.status==='running'&&<>
                    <Result status="info"
                            title="图表生成中"
                            subTitle={item.execMessage}/>
                  </>
                }
                {
                  item.status==='field'&&<>
                    <Result status="error"
                            title="图表生成失败"
                            subTitle={item.execMessage}/>
                  </>
                }

              </>
              分析结论:<br/>
              {item.genResult}
            </Card>

          </List.Item>
        )}
      />
    </div>
  )

};
export default MyChartPage;
