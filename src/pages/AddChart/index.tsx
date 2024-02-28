import {Button, Card, Col, Divider, Form, Input, message, Row, Select, Space, Spin, Upload,} from 'antd';
import React, {useState} from 'react';
import TextArea from "antd/es/input/TextArea";
import {UploadOutlined} from "@ant-design/icons";
import {genChartByAiUsingPost} from "@/services/xybi/chartController";

import ReactECharts from  'echarts-for-react';


/**
 * 添加图表(同步)
 * @constructor
 */
const AddChart: React.FC = () => {

  const [chart, setChart] = useState<API.BiResponse>();
  const [option, setOption] = useState<any>();
  const [submitting, setSubmitting] = useState<boolean>(false);

  /**
   * 提交
   * @param values
   */

  const onFinish = async (values: any) => {
    if (submitting){
      return
    }
    setSubmitting(true);
    console.log(values.file)
    setChart(undefined);
    setOption(undefined);
    //todo 对接后端 上传数据
    const params = {
      ...values,
      file: undefined
    }
    try {
      const res = await genChartByAiUsingPost(params, {}, values.file.file.originFileObj)
      console.log(res)
      if (!res.data){
        message.error("分析失败")
      }
      else{
        message.success("分析成功")

        const chartOption=JSON.parse(res.data.genChart ?? '');
        if (!chartOption){
          throw new Error("图表解析错误")
        }else{
          setChart(res.data)
          setOption(chartOption)
        }
      }
    } catch (e: any) {
      message.error("分析失败" + e.message)
    }
    setSubmitting(false)
  };


  // @ts-ignore
  return (
    <div className="addChart">
      <Row gutter={24}>
        <Col span={12}>
          <Card title={'智能分析'}>
            <Form
              name="addChart"
              labelAlign={"left"}
              labelCol={{span:4}}
              onFinish={onFinish}
              initialValues={{}}
            >
              <Form.Item name="goal" label="分析目标" rules={[{required: true, message: '请输入分析目标'}]}>
                <TextArea placeholder="请输入你的分析需求"/>
              </Form.Item>
              <Form.Item name="name" label="图表名称">
                <Input placeholder="请输入你的图表名称"/>
              </Form.Item>

              <Form.Item name="chartType" label="图表类型">
                <Select options={[
                  {value: '折线图', label: '折线图'},
                  {value: '柱状图', label: '柱状图'},
                  {value: '堆叠图', label: '堆叠图'},
                  {value: '饼图', label: '饼图'},
                  {value: '雷达图', label: '雷达图'},
                ]}>
                </Select>
              </Form.Item>

              <Form.Item
                name="file"
                label="原始数据"
              >
                <Upload name="file" maxCount={1}>
                  <Button icon={<UploadOutlined/>}>上传文件</Button>
                </Upload>
              </Form.Item>


              <Form.Item wrapperCol={{span: 12, offset: 4}}>
                <Space>
                  <Button type="primary" htmlType="submit" loading={submitting} disabled={submitting}>
                    提交
                  </Button>
                  <Button htmlType="reset">重置</Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>

        </Col>
        <Col span={12}>
          <Card title={'分析结论'}>
            {chart?.genResult ?? <div>请先在左侧提交</div>}
            <Spin spinning={submitting}/>
          </Card>
          <Divider/>
          <Card title={'可视化图表'}>
            {
              option ? <ReactECharts option={option}/> : <div>请先在左侧提交</div>
            }
            <Spin spinning={submitting}/>
          </Card>
        </Col>
      </Row>


    </div>


  );
};
export default AddChart;
