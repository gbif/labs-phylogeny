import React, { useEffect, useState } from "react";
import { PhyloTree } from "./PhyloTree";
import { Radio, AutoComplete, Slider, Tooltip, Checkbox, Row, Col, Button } from "antd";
import {downloadSVG} from "./download"
import "./tree.css";
import {
  AlignLeftOutlined,
  AlignRightOutlined,
  DownloadOutlined,
} from "@ant-design/icons";


const Option = AutoComplete.Option;
export const PhyloTreeContainer = (props) => {
  const { nameMap, focusedNode } = props;
  const [leafSuggestions, setLeafSuggestions] = useState([]);
  const [q, setQ] = useState("");
  const [highlightedLeaf, setHighlightedLeaf] = useState();
  const [radial, setRadial] = useState(false);
  const [alignTips, setAlignTips] = useState(false);
  const [spacingX, setSpacingX] = useState(14);
  const [spacingY, setSpacingY] = useState(30);
  const [maxRadius, setMaxRadius] = useState(768);
  const [asc, setAsc] = useState(null);
  const [showScale, setShowScale] = useState(true)
  const [allowZoom, setAllowZoom] = useState(false)
  const [colorLabels, setColorLabels]  = useState(false)

  useEffect(() => {
    const suggestions = Object.keys(nameMap)
      .filter((name) => !!nameMap[name].matchedName)
      .map((name) => ({ key: name, label: nameMap[name].matchedName }));
    setLeafSuggestions(suggestions);
  }, [nameMap]);
  useEffect(() => {
    if (focusedNode) {
      const focused = leafSuggestions.find(
        (s) => s.label === focusedNode.node.firstLeaf
      );
      if (focused) {
        setHighlightedLeaf(focused.key);
      }
    }
  }, [focusedNode]);
  return (
    <div
      className="treeArea"
      style={{ display: "flex", flexDirection: "column" }}
    >
      <div className="tree-controls" style={{ zIndex: 1000 }}>
        <AutoComplete
          style={{ width: 400, maxWidth: "100%" }}
          value={q}
          onChange={(q) => {
            if (!q) {
              setQ("");
              setHighlightedLeaf();
            } else {
              setQ(q);
            }
          }}
          onSelect={(leafIndex) => {
            console.log("test");
            setHighlightedLeaf(leafIndex);
            /* const selectedNode = nodeIdMap[leafIndex];
            const selectedLeafIndex = selectedNode.leafIndex;
            setHighlightedLeaf(selectedLeafIndex); */
            //  scrollToItem({ leafIndex: selectedLeafIndex });
            setQ("");
          }}
          placeholder="Search tree"
          allowClear
        >
          {leafSuggestions
            .filter((i) => i.label.indexOf(q.toLowerCase()) > -1)
            .map((o) => (
              <Option key={o.key} value={o.key} label={o.label}>
                <span dangerouslySetInnerHTML={{ __html: o.label }}></span>{" "}
              </Option>
            ))}
        </AutoComplete>
      </div>
      <div className="tree-controls">
        <Row>
          <Col flex="auto">
            <Row>
              <Col>
                <Radio.Group
                  style={{ marginRight: "10px" }}
                  size="small"
                  options={[
                    { value: false, label: <AlignLeftOutlined /> },
                    { value: true, label: <AlignRightOutlined /> },
                  ]}
                  onChange={(e) => setAlignTips(e.target.value)}
                  value={alignTips}
                  optionType="button"
                  buttonStyle="solid"
                />
              </Col>
              <Col>
                <Radio.Group
                  size="small"
                  options={[
                    { value: false, label: "Linear" },
                    { value: true, label: "Radial" },
                  ]}
                  onChange={(e) => {
                    if(e.target.value === true){
                        setAlignTips(true)
                    }
                    setRadial(e.target.value)}
                  } 
                  value={radial}
                  optionType="button"
                  buttonStyle="solid"
                />
              </Col>
              <Col>
                <span style={{ marginLeft: "10px" }}>Deepest clades to: </span>
                <Radio.Group
                  size="small"
                  options={[
                    { value: false, label: "Bottom" },
                    { value: true, label: "Top" },
                    { value: null, label: "Don't sort" },
                  ]}
                  onChange={(e) => setAsc(e.target.value)}
                  value={asc}
                  optionType="button"
                  buttonStyle="solid"
                />
              </Col>
              <Col>
              <Tooltip title="Downlad tree as SVG">
                  <Button style={{ marginLeft: "10px" }}  size="small" onClick={() => downloadSVG("svg", document.getElementById("tree_container"))} ><DownloadOutlined /></Button>
                  </Tooltip>
              </Col>
              <Col flex="auto"></Col>
              <Col>
                <Slider
                tooltip={{formatter: () => "Vertical spacing"}}
                  disabled={radial}
                  style={{ width: "50px", marginTop: "0px" }}
                  min={1}
                  max={60}
                  defaultValue={spacingY}
                  onChange={setSpacingY}
                />
                
              </Col>
            </Row>
            <Row>
                <Col>
                <Checkbox checked={showScale} onChange={e => setShowScale(e.target.checked)}>Show scale</Checkbox>
                </Col>
                <Col>
                <Checkbox checked={allowZoom} onChange={e => setAllowZoom(e.target.checked)}>Zoomable</Checkbox>

                </Col>
                <Col>
                <Checkbox checked={colorLabels} onChange={e => setColorLabels(e.target.checked)}>Color labels</Checkbox>

                </Col>
            </Row>
          </Col>
          

          <Col span={1}>
           {!radial && <Slider
            tooltip={{formatter: () => "Horizontal spacing"}}
              style={{ height: "50px" }}
              vertical
              min={1}
              max={128}
              defaultValue={spacingX}
              onChange={setSpacingX}
            />}
            {radial && <Slider
            tooltip={{formatter: () => "Max radius"}}
              style={{ height: "50px" }}
              vertical
              min={468}
              max={2048}
              defaultValue={maxRadius}
              onChange={setMaxRadius}
            />}
          </Col>
        </Row>
      </div>
      <PhyloTree
        {...props}
        highlightedLeaf={highlightedLeaf}
        spacingY={spacingY}
        spacingX={spacingX}
        maxRadius={maxRadius}
        radial={radial}
        alignTips={alignTips}
        asc={asc}
        showScale={showScale}
        allowZoom={allowZoom}
        colorLabels={colorLabels}
      />
    </div>
  );
};
