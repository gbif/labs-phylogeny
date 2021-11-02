export default {
  name: " node",
  key: "0-0",
  children: [
    {
      name: " node",
      length: 0.1,
      key: "0-0-0",
      children: [
        { name: "0-0-0-0 leaf", length: 0.1, key: "0-0-0-0" },
        { name: "0-0-0-1 leaf", length: 0.2, key: "0-0-0-1" },
        { name: "0-0-0-2 leaf", length: 0.3, key: "0-0-0-2" }
      ]
    },
    {
      name: "0-0-1 node",
      length: 0.2, 
      key: "0-0-1",
      children: [
        { name: "0-0-1-0 leaf", length: 0.2, key: "0-0-1-0" },
        { name: "0-0-1-1 leaf", length: 0.3, key: "0-0-1-1" },
        {
          name: "0-0-0-0-1 node",
          length: 0.2, 
          key: "0-0-0-0-1",
          children: [
            { name: "0-0-0-1-0 leaf", length: 0.1, key: "0-0-0-1-0" },
            { name: "0-0-0-1-1 leaf", length: 0.5, key: "0-0-0-1-1" },
            { name: "0-0-0-1-2 leaf", length: 0.2, key: "0-0-0-1-2" }
          ]
        }
      ]
    },
    {
      name: "0-0-2 leaf",
      length: 0.5, 
      key: "0-0-2"
    }
  ]
};
