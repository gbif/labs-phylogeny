import React from "react";
import {
  AutoComplete,
  Row,
  Col,
  Input,
  Form,
  Button,
  Modal,
  Spin,
  Image,
  Alert,
  message,
} from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import { withRouter } from "react-router-dom";
import _ from "lodash";
import axios from "axios";
import qs from "qs";
import withContext from "../../withContext";

const { TextArea } = Input;

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

class Otl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      names: [],
      node_id: "",
      loading: false,
      showHelp: false,
      error: null,
    };
  }
  componentDidMount = () => {
    const {
      location: { search },
    } = this.props;
    const params = qs.parse(search, { ignoreQueryPrefix: true });
    const ott_node_id = _.get(params, "ott_node_id");
    if (ott_node_id) {
      this.setState({ node_id: ott_node_id }, () =>
        this.getTreeFromOtl(ott_node_id)
      );
    }
  };
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
      this.props.setNewick(_.get(treeResponse, "data.newick"));
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
    this.props.history.push({
      pathname: this.props.location.path,
      search: node_id ? `?ott_node_id=${node_id}` : null,
    });
    try {
      this.setState({ loading: true });

      const treeResponse = await axios.get(
        `//www.gbif.org/api/otl/newick?node_id=${node_id}`
      );
      this.props.setNewick(_.get(treeResponse, "data.newick"));
      this.setState({ loading: false });
    } catch (err) {
      this.setState({ loading: false, error: err });
    }
  };
  render() {
    const { names, loading, node_id, showHelp, error } = this.state;
    const { setNewick, newick, startParsing } = this.props;

    return (
      <React.Fragment>
        <Spin size="large" spinning={loading}>
          {error && (
            <Alert
              style={{ marginBottom: "10px" }}
              message="Error fetching tree"
              description={
                <>
                  <p>
                    Maybe the Node ID was invalid? See{" "}
                    <Button
                      style={{ padding: "0px" }}
                      onClick={() => this.setState({ showHelp: true })}
                      type="link"
                    >
                      How to get a Node ID
                    </Button>
                  </p>
                  <p>
                    The server said:{" "}
                    <strong>{_.get(error, "response.data")}</strong>
                  </p>
                </>
              }
              type="error"
              closable
              onClose={() =>
                this.setState({ error: null, node_id: null }, () => {
                  this.props.history.push({
                    pathname: this.props.location.path,
                  });
                })
              }
            />
          )}
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
              <h3>Or enter a Node ID <InfoCircleOutlined
              onClick={() => this.setState({ showHelp: true })}
            /> directly :</h3>
            </Col>
            <Col flex="auto"></Col>
          </Row>
          <FormItem
            {...formItemLayout}
            help={
              <span>
                Or try an example:{" "}
                <Button
                  type="link"
                  onClick={() =>
                    this.setState({ node_id: "mrcaott30642ott447374" }, () =>
                      this.getTreeFromOtl("mrcaott30642ott447374")
                    )
                  }
                >
                  mrcaott30642ott447374
                </Button>
                <Button
                  type="link"
                  onClick={() =>
                    this.setState({ node_id: "ott852221" }, () =>
                      this.getTreeFromOtl("ott852221")
                    )
                  }
                >
                  ott852221
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
          <FormItem>
            <TextArea
              style={{ marginBottom: "10px" }}
              value={newick}
              onChange={(e) => setNewick(e.target.value)}
              rows={10}
              placeholder="Enter your NEWICK string here"
            />
          </FormItem>
          <Button type="primary" onClick={startParsing} disabled={!newick}>
            Next
          </Button>

          <Modal
            footer={null}
            width="700px"
            title={
              <>
                <img
                  alt="OTL logo"
                  style={{ height: "24px" }}
                  src="/mini-opentree-logo.png"
                />{" "}
                <span>How to get a node from Open Tree of Life</span>
              </>
            }
            visible={showHelp}
            onOk={() => this.setState({ showHelp: false })}
            onCancel={() => this.setState({ showHelp: false })}
          >
            <p>
              When you navigate the Open Tree of Life, you will find the "Node
              id in synthetic tree" property in the Node properties pane on the
              right.{" "}
            </p>
            <Image alt="Open tree node" src="/otlnode.png" width={600} />
          </Modal>
        </Spin>
      </React.Fragment>
    );
  }
}

const mapContextToProps = ({
  setNewick,
  setRawTree,
  setNames,
  setMatchedNames,
  newick,
}) => ({ setNewick, setRawTree, setNames, setMatchedNames, newick });

export default withRouter(withContext(mapContextToProps)(Otl));
