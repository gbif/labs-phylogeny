import React from "react";
import { AutoComplete, Row, Col, Input, Form, Button, message } from "antd";
import { withRouter } from "react-router-dom";
import _ from "lodash";
import axios from "axios";

const { Option } = AutoComplete;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
  },
};

class Upload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { names: [], node_id: "", loading: false };
  }

  getData = async (value) => {
    let response = await axios.get(
      `//api.gbif.org/v1/species/suggest?q=${value}&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c`
    );
    this.setState({ names: response.data });
  };

  getDataFromOtl = async (canonicalName, obj) => {
    const nubKey = _.get(obj, "key");
    this.setState({ value: canonicalName });
    try {
      this.setState({ loading: true });

      const response = await axios.get(
        `//www.gbif.org/api/otl/ottid?canonicalName=${canonicalName}&nubKey=${nubKey}`
      );
      message.info("Got match in Open Tree of Life, fetching Tree");
      const treeResponse = await axios.get(
        `//www.gbif.org/api/otl/newick?ott_id=${_.get(response, "data.ott_id")}`
      );
      this.props.setTree(_.get(treeResponse, "data.newick"));
      this.setState({ loading: false });
    } catch (err) {
      console.log(err.response);
      if (_.get(err, "response.status") === 404) {
        message.info(
          `Sorry no match in Open Tree of Life for ${canonicalName}`
        );
      }
      this.setState({ loading: false });
    }
  };
  getTreeFromOtl = async (node_id) => {
    try {
      this.setState({ loading: true });

      const treeResponse = await axios.get(
        `//www.gbif.org/api/otl/newick?node_id=${node_id}`
      );
      this.props.setTree(_.get(treeResponse, "data.newick"));
      this.setState({ loading: false });
    } catch (err) {
      this.setState({ loading: false });
    }
  };
  render() {
    const { names, loading, node_id } = this.state;
    return (
      <React.Fragment>
        <FormItem
          {...formItemLayout}
          help="Search for a Taxon in GBIF - we will try to get a Tree from Open Tree of Life"
        >
          <AutoComplete
            onSearch={this.getData}
            onSelect={this.getDataFromOtl}
            style={{ width: "100%" }}
            loading={loading}
            allowClear
            placeholder="Type Taxon name"
          >
            {names.map((n) => (
              <Option key={n.key} value={n.canonicalName}>
                {n.canonicalName}
              </Option>
            ))}
          </AutoComplete>
        </FormItem>
        <Row>
          <Col flex="auto"></Col>
          <Col>
            <h3>OR</h3>
          </Col>
          <Col flex="auto"></Col>
        </Row>
        <FormItem
          {...formItemLayout}
          help={
            <span>
              Or try this example:{" "}
              <Button
                type="link"
                onClick={() =>
                  this.setState({ node_id: "mrcaott30642ott447374" })
                }
              >
                mrcaott30642ott447374
              </Button>
            </span>
          }
        >
          <Input.Search
            loading={loading}
            placeholder="Enter a OTL node_id like mrcaott30642ott447374"
            value={node_id}
            onChange={(e) => {
              this.setState({ node_id: e.currentTarget.value });
            }}
            onSearch={this.getTreeFromOtl}
            allowClear
          />
        </FormItem>
        <Row>
          <Col flex="auto"></Col>
          <Col>
            <h3>OR</h3>
          </Col>
          <Col flex="auto"></Col>
        </Row>
      </React.Fragment>
    );
  }
}

export default withRouter(Upload);
