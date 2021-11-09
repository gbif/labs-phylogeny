import React, { useState } from "react";
import { AutoComplete, Row, Col, Input, Form, Button, message, Transfer, Spin } from "antd";
import { withRouter } from "react-router-dom";
import _ from "lodash";
import axios from "axios";
import withContext from "../../withContext";
const BOLD_DATASET_KEY = "040c5662-da76-4782-a48e-cdea1892d14c";

const datasets = [
  {key: "040c5662-da76-4782-a48e-cdea1892d14c", title: "BOLD"}
]
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
  const [generatingTree, setGeneratingTree] = useState(false);
  const [dataset, setDataset] = useState(datasets[0])
  const { setNewick, newick, startParsing } = props;

  //const GBIF_API_KEY = localStorage.getItem('GBIF_API_KEY');

  const getTaxonData = async (value) => {
    let response = await axios.get(
      `//api.gbif.org/v1/species/search?status=accepted&q=${value}&datasetKey=d7dddbf4-2cf0-4f39-9b2a-bb099caae36c`
    );
    setNames(_.get(response, 'data.results', []));
  };

  const getSequencedTaxaForHigherTaxon = async (key) => {
    keepData()
    const query = `query {
      occurrenceSearch(predicate: {type: and, predicates: [
        {type: equals, key: "taxonKey", value: ${key}}, 
        {type: equals, key: "dwcaExtension", value: "http://rs.gbif.org/terms/1.0/DNADerivedData"},
        {type: equals, key: "datasetKey", value: "${dataset.key}"}
      ]}) {
        facet {
          gbifClassification_acceptedUsage_key(size:250) {
            key
            count
            taxon {
              rank
              scientificName
              formattedName
            }
          }
        }
      }
    }`
    try {
      setLoading(true)
/*       const response = await axios.get(
        `//api.gbif.org/v1/occurrence/search?advanced=true&dwca_extension=http:%2F%2Frs.gbif.org%2Fterms%2F1.0%2FDNADerivedData&taxon_key=${key}&limit=100`
      ); */
      const response = await axios.get(
        `https://graphql.gbif.org/graphql?query=${query}`
      );
      const taxa = _.get(response, 'data.data.occurrenceSearch.facet.gbifClassification_acceptedUsage_key');
      setSequencedTaxa(dataset.key === BOLD_DATASET_KEY ? taxa.filter(t => t.taxon.rank === "UNRANKED") : taxa);
      setLoading(false)
    } catch (err) {
      console.log(err.response);
      
      setLoading(false)
    }
  };
  const keepData = () => {
    const keyMap = getTagetKeyMap();
    setSelectedSequences([...selectedSequences, ...sequencedTaxa.filter(t => !!keyMap[t.key])])
  }
  const getTagetKeyMap = () => targetKeys.reduce((obj, cur) => {obj[cur] = true; return obj}, {});
  const decorateWithSequences = async (data) => {
    for (const d of data) {
      const occ = await axios.get(
        `//api.gbif.org/v1/occurrence/search?taxonKey=${d.key}&datasetKey=${dataset.key}&dwca_extension=http:%2F%2Frs.gbif.org%2Fterms%2F1.0%2FDNADerivedData&limit=1`
      )
      d.sequence = _.get(occ, 'data.results[0].extensions["http://rs.gbif.org/terms/1.0/DNADerivedData"][0]')
    }
    return data;
  }
  const prepareSequences = async () => {
    const keyMap = getTagetKeyMap()
    const data = [...sequencedTaxa, ...selectedSequences].filter(t => !!keyMap[t.key])
    
    //.map(t => ({scientificName: t.scientificName, sequence: _.get(t, `extensions["http://rs.gbif.org/terms/1.0/DNADerivedData"][0]["http://rs.gbif.org/terms/dna_sequence"]`)}));
    await decorateWithSequences(data)
    return data.map(t => ({scientificName: t.taxon.scientificName, sequence: _.get(t, `sequence["http://rs.gbif.org/terms/dna_sequence"]`)}))
  }

  const getTree = async () => {
    setNewick(null)
    setGeneratingTree(true)
    try {
      const data = await prepareSequences();
      const treeResponse = await axios.post(
        `//localhost:9000/tree`,
        data
      );
      setNewick(_.get(treeResponse, "data.newick"));
      setGeneratingTree(false)
    } catch (err) {
      console.log(err)
      setGeneratingTree(false)
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
        <Button type="primary" style={{ float: 'right', margin: 5 }} onClick={getTree} loading={generatingTree} disabled={generatingTree}>
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
          dataSource={[...sequencedTaxa, ...selectedSequences]}
          titles={['Source', 'Target']}
          targetKeys={targetKeys}
          selectedKeys={selectedKeys}
          onChange={handleChange}
          onSelectChange={handleSelectChange}
          listStyle={{width: 360, height: 400}}
         // onScroll={this.handleScroll}
          render={item => <span dangerouslySetInnerHTML={{__html: item.taxon.formattedName}}></span>}
          showSearch
          footer={renderFooter}
          oneWay
          style={{ marginBottom: 16, width: 100 }}
        />}
      <FormItem>
      <Spin spinning={generatingTree} >
        <TextArea
          style={{ marginBottom: "10px" }}
          value={newick}
          onChange={(e) => setNewick(e.target.value)}
          rows={10}
          placeholder="Enter your NEWICK string here"
        />
        </Spin>
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
