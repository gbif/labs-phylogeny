import React, { useState } from "react";
import { AutoComplete, Row, Col, Input, Form, Button, message, Transfer } from "antd";
import { withRouter } from "react-router-dom";
import _ from "lodash";
import axios from "axios";
import withContext from "../../withContext";

const { TextArea } = Input;

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

const TreeGenerator = (props) => {
  const [names, setNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [higherTaxonKey, setHigherTaxonKey] = useState(null);
  const [sequencedTaxa, setSequencedTaxa] = useState([])
  const [selectedSequences, setSelectedSequences] = useState([])
  const [targetKeys, setTargetKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  
  const { setNewick, newick, startParsing } = props;


  const getTaxonData = async (value) => {
    let response = await axios.get(
      `//api.gbif.org/v1/species/suggest?q=${value}&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c`
    );
    setNames(response.data);
  };

  const getSequencedTaxaForHigherTaxon = async (key) => {
    try {
      setLoading(true)
      const response = await axios.get(
        `//api.gbif.org/v1/occurrence/search?advanced=true&dwca_extension=http:%2F%2Frs.gbif.org%2Fterms%2F1.0%2FDNADerivedData&taxon_key=${key}&limit=100`
      );
      setSequencedTaxa(response.data.results)
      setLoading(false)
    } catch (err) {
      console.log(err.response);
      
      setLoading(false)
    }
  };
  const prepareSequences = () => {
    const keyMap = targetKeys.reduce((obj, cur) => {obj[cur] = true; return obj}, {})
    const data = sequencedTaxa.filter(t => !!keyMap[t.key]).map(t => ({scientificName: t.scientificName, sequence: _.get(t, `extensions["http://rs.gbif.org/terms/1.0/DNADerivedData"][0]["http://rs.gbif.org/terms/dna_sequence"]`)}))
    return data
  }

  const getTree = async () => {
    try {
      const data = prepareSequences();
      const treeResponse = await axios.post(
        `//localhost:9000/tree`,
        data
      );
      setNewick(_.get(treeResponse, "data.newick"));
      setLoading(false)
    } catch (err) {
      console.log(err)
      setLoading(false)
    }
  }

  const handleChange = (nextTargetKeys, direction, moveKeys) => {
    setTargetKeys(nextTargetKeys)

    console.log('targetKeys: ', nextTargetKeys);
    console.log('direction: ', direction);
    console.log('moveKeys: ', moveKeys);
  };

const handleSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys])

    console.log('sourceSelectedKeys: ', sourceSelectedKeys);
    console.log('targetSelectedKeys: ', targetSelectedKeys);
  };
 const renderFooter = (props, {direction}) => {
    if (direction === 'right' && targetKeys.length > 1) {
      return (
        <Button type="primary" style={{ float: 'right', margin: 5 }} onClick={getTree}>
          Generate tree
        </Button>
      );
    }
    
  };

  return (
    <React.Fragment>
      <Row>
        <Col span={20}>
      <FormItem {...formItemLayout} help="Find a Taxon in GBIF">
        <AutoComplete
          onSearch={getTaxonData}
          onSelect={(label, obj) => setHigherTaxonKey(_.get(obj, "key"))}
          style={{ width: "100%" }}
          loading={loading}
          options={names.map((n) => ({
            value: n.canonicalName,
            key: n.key,
            label: n.canonicalName,
          }))}
          allowClear
        >
        </AutoComplete>
      </FormItem>
      </Col><Col span={4}>
      <Button
                disabled={!higherTaxonKey}
                type="primary"
                onClick={() => getSequencedTaxaForHigherTaxon(higherTaxonKey)}
              >
                Get data
              </Button>
      </Col>
      </Row>
     {sequencedTaxa.length > 0 && <Transfer
          dataSource={sequencedTaxa}
          titles={['Source', 'Target']}
          targetKeys={targetKeys}
          selectedKeys={selectedKeys}
          onChange={handleChange}
          onSelectChange={handleSelectChange}
          listStyle={{width: 360, height: 400}}
         // onScroll={this.handleScroll}
          render={item => `${item.scientificName} (${item.species || item.genus + ' sp.' || item.family + ' sp.'})`}
          showSearch
          footer={renderFooter}
          oneWay
          style={{ marginBottom: 16, width: 100 }}
        />}
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
    </React.Fragment>
  );
};

const mapContextToProps = ({
  setNewick,
  setRawTree,
  setNames,
  setMatchedNames,
  newick,
}) => ({ setNewick, setRawTree, setNames, setMatchedNames, newick });

export default withRouter(withContext(mapContextToProps)(TreeGenerator));
