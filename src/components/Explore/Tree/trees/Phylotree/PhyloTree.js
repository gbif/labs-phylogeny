import React, { useEffect, useState, useRef } from "react";
import _ from "lodash";
import { phylotree } from "phylotree";

import { StyledTree } from "./styles";

const formatLabel = (element, data, nameMap, color, colorLabels, isHighlighted, isLeaf) => {
  const nameMatch = _.get(nameMap, `[${data.data.name}].matchedName`);
  //element.style("fill", highlighted[data.id].color, "important");
  element.select("text").text("");
  if(!nameMatch){
    element.select("text").append("tspan").text(data.data.name).append("tspan").text(" [unmatched]") //.style("font-weight", 900, "important")
    element.style("fill", "#999", "important"
    ) //.attr('title', 'this could not be matched to the GBIF taxonopmy');
  }
  else if (nameMatch) {
    element.select("text").append("tspan").text(_.get(nameMap, `[${data.data.name}].match.canonicalName`));

  /*   const elm = document.createElement("p");
    elm.innerHTML = nameMatch;   
   if (nameMatch.indexOf('<i>') > -1) {
     
      elm.childNodes.forEach((e) => {
        if (e.tagName === "I") {
          element
            .select("text")
            .append("tspan")
            .text(e.textContent)
            .style("font-style", "italic", "important");
        } else {
          element.select("text").append("tspan").text(e.textContent);
        }
      });
    } else {
      element.select("text").append("tspan").text(nameMatch);
    } */
  }
  if(isHighlighted){
    element.style("font-weight", 900, "important")
    .style("text-decoration", "underline", "important")
  }

  if(color && isLeaf){
    let circle = element.select('circle').node();

    if(!circle){
      element.append('circle').attr('r', 3).style("fill", color, "important").style("stroke", color, "important")
    } else {
      element.select('circle').attr('r', 3).style("fill", color, "important").style("stroke", color, "important")
    } 

    if(colorLabels){
      element.style("fill", color, "important") //.style("font-weight", 300, "important")
    }
    
/*     if(color && isLeaf){
      let rect = element.select('rect').node();
  
      if(!rect){
        element.append('rect').attr('width', 2).attr('y', -8).attr('height', 16).style("fill", color, "important").style("stroke", color, "important")
      } else {
        element.select('rect').attr('width', 2).attr('y', -8).attr('height', 16).style("fill", color, "important").style("stroke", color, "important")
      } 
      
    } */
    
   
    // element.style("fill", color, "important");
  }
  
};

export const PhyloTree = ({
  newick: nwk,
  radial,
  alignTips,
  spacingX = 14,
  spacingY = 30,
  maxRadius = 768,
  colorLabels = false,
  asc,
  showScale = true,
  allowZoom = false,
  onNodeClick,
  onToggle,
  highlighted,
  highlightedLeaf,
  nameMap,
}) => {
  const [tree, setTree] = useState(null);
  const [asc_, setAsc_] = useState(null);
  const [hoveredNode, setHoveredNode] = useState();
  const [currentHighlightedLeaf, setCurrentHighlightedLeaf] = useState(null);

  const elm = useRef(null);

  const scrollToNode = (node) => {
    let nodes = document.querySelectorAll(
      `[data-node-name="${node.data.name}"]`
    );
    nodes[0].scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: alignTips ? "start" : "center",
    });
  };
const renderTree = () => {

  let highlightedLeafNode;
   tree.render({
    container: "#tree_container",
    //  "max-radius": 468,
    //  zoom: true,
    //'show-menu': false,
    /*    align-tips: false
annular-limit: 0.38196601125010515
attribute-list: []
binary-selectable: false
bootstrap: false
branches: "step"
brush: true
collapsible: true
color-fill: true
compression: 0.2
container: "#tree_container"
draw-size-bubbles: false
edge-styler: null
hide: true
internal-names: false
is-radial: false
label-nodes-with-name: false
layout: "left-to-right"
left-offset: 0
left-right-spacing: "fixed-step"
logger: console {debug: ƒ, error: ƒ, info: ƒ, log: ƒ, warn: ƒ, …}
max-radius: 768
maximum-per-level-spacing: 100
maximum-per-node-spacing: 100
minimum-per-level-spacing: 10
minimum-per-node-spacing: 2
node-span: null
node-styler: (element, data) => {…}
node_circle_size: ƒ ()
reroot: true
restricted-selectable: false
scaling: true
selectable: true
show-labels: true
show-menu: true
show-scale: "top"
top-bottom-spacing: "fixed-step"
transitions: null
zoom: false */
    /* 'internal-names': true,
     */
    "max-radius": maxRadius,
    "brush": false,
    "zoom": allowZoom,
    "align-tips": alignTips,
    "is-radial": radial,
    "show-scale": showScale ? "top" : false,
    "show-menu": false,
    "selectable": false,
    "left-right-spacing:": "fit-to-size",
    "node-styler": (element, data) => {
      const isLeafNode = tree.isLeafNode(data)
      element.on("click", function (e) {
        if (typeof onToggle === "function") {
          let taxonKeys = [];
          let tips;
          tips = [data];
          if (
            isLeafNode &&
            !!nameMap[data.data.name].matchedName
          ) {
            taxonKeys = [nameMap[data.data.name].match.usageKey];
          } else {
            tips = tree.selectAllDescendants(data, true, false);
            if (tips) {
              taxonKeys = tips
                .filter(
                  (n) =>
                    !!nameMap[n.data.name] &&
                    !!nameMap[n.data.name].matchedName
                )
                .map((n) => nameMap[n.data.name].match.usageKey);
            }
          }
          let firstLeaf = _.get(tips, "[0].data")
              ? _.get(nameMap, `[${tips[0].data.name}].matchedName`, `${tips[0].data.name} [unmatched]`)
              : "",
            firstLeafIndex = _.get(tips, "[0].id"),
            lastLeaf = _.get(tips, `[${tips.length - 1}].data`)
              ? _.get(
                  nameMap,
                  `[${tips[tips.length - 1].data.name}].matchedName`,
                  `${tips[tips.length - 1].data.name} [unmatched]`
                )
              : "",
            leafIndex = _.get(tips, `[${tips.length - 1}].id`);
          onToggle({
            node: data,
            taxonKeys,
            firstLeaf,
            firstLeafIndex,
            lastLeaf,
            leafIndex,
          });
        }
      });
      element.on("mouseover", (e, x) => {
        let hoveredNode_;
        if (isLeafNode) {
          hoveredNode_ = {
            isLeafNode: true,
            firstLeaf:_.get(nameMap, `[${data.data.name}].matchedName`, `${data.data.name} [unmatched]`) ,
          };
        } else {
          let tips = tree.selectAllDescendants(data, true, false);
          hoveredNode_ = {
            isLeafNode: false,
            firstLeaf:  _.get(nameMap, `[${tips[0].data.name}].matchedName`, `${tips[0].data.name} [unmatched]`),
            lastLeaf: _.get(nameMap, `[${tips[tips.length - 1].data.name}].matchedName`, `${tips[tips.length - 1].data.name} [unmatched]`)
          };
        }
        setHoveredNode(hoveredNode_);
      });
      element.on("mouseleave", () => {
        setHoveredNode(null);
      });
      if (isLeafNode) {
        element.style("cursor", "pointer", "important");
      }
      const pathToRoot = tree.pathToRoot(data);
      const colorNode = pathToRoot.find((n) => !!highlighted[n.id]);
      let color;
      if (highlighted[data.id]) {
        color = highlighted[data.id].color
      } else if (colorNode) {
        color = highlighted[colorNode.id].color
       
      }

      if (data.data.name === highlightedLeaf) {
        highlightedLeafNode = data;
       
      }
      formatLabel(
        element,
        data,
        nameMap,
        color,
        colorLabels,
        data.data.name === highlightedLeaf,
        isLeafNode
      );
    },
    "edge-styler": (element, data) => {
      const pathToRoot = tree.pathToRoot(data.target);
      const colorNode = pathToRoot.find((n) => !!highlighted[n.id]);

      if (highlighted[data.source.id]) {
        element.style(
          "stroke",
          highlighted[data.source.id].color,
          "important"
        );
      } else if (colorNode) {
        element.style(
          "stroke",
          highlighted[colorNode.id].color,
          "important"
        );
      }
    },
  });

  /* rt.nodeLabel((n) => {
    if (
      n.data.name &&
      nameMap[n.data.name] &&
      nameMap[n.data.name].matchedName
    ) {
      return nameMap[n.data.name].matchedName;
    } else if (n.data.name === "root") {
      return "";
    } else if (n.data.name) {
      return `${n.data.name} (unmatched)`;
    } else {
      return "";
    }
  }); */
  if (elm.current) {
    elm.current.append(tree.display.show());

    if (
      highlightedLeaf !== currentHighlightedLeaf &&
      highlightedLeafNode
    ) {
      scrollToNode(highlightedLeafNode, tree);
      setCurrentHighlightedLeaf(highlightedLeaf);
    }
  }

}
  const init = () => {
    if (nwk) {
      try {
        const tree = new phylotree(nwk);
        setTree(tree);

      } catch (err) {
        console.log(err);
      }
    }
  };

  useEffect(() => {
    init();
  }, [nwk]);

  useEffect(() => {
    if(tree){
      renderTree();
    }
  }, [highlighted, highlightedLeaf, showScale, allowZoom, onNodeClick, maxRadius, colorLabels, tree]);

  useEffect(() => {
    if (tree) {
      tree.display.radial(radial).update();
    }
  }, [radial, tree]);

  useEffect(() => {
    if (tree) {
      tree.display.alignTips(alignTips).update();
    }
  }, [alignTips, tree]);
  useEffect(() => {
    if (tree) {
      tree.display.spacing_x(spacingX).update();
    }
  }, [spacingX, tree]);
  useEffect(() => {
    if (tree) {
      console.log(tree.display.spacing_y());
      tree.display.spacing_y(spacingY).update();
    }
  }, [spacingY, tree]);

  useEffect(() => {
    if (tree && asc != null) {
      setAsc_(asc);
      tree.resortChildren(function (a, b) {
        return (b.height - a.height || b.value - a.value) * (asc ? 1 : -1);
      });
    } else if (tree && asc_ !== asc) {
      setAsc_(asc);
      init();
    }
  }, [asc, asc_, init, tree]);

  return (
    <React.Fragment>
      <StyledTree className="tree-tree" id="tree_container" ref={elm} />
      {hoveredNode && (
        <div
          className="gb-snack-bar"
          dangerouslySetInnerHTML={{
            __html: hoveredNode.isLeafNode
              ? hoveredNode.firstLeaf
              : `${hoveredNode.firstLeaf} - ${hoveredNode.lastLeaf}`,
          }}
        />
      )}
    </React.Fragment>
  );
};
