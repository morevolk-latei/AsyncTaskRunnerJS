const getNode = selector => document.querySelector(selector);

// <div class="task"></div> 
// for (let i = 4; i <= 50; i++) {
//   getNode('#taskQueue').appendChild(
//     createNode('div', { class: 'task flex justify-center align-center', content: i })
//   );
// }

function createNode(nodeName, nodeConfig) {
  const node = document.createElement(nodeName);
  nodeConfig.class && (node.className = nodeConfig.class);
  node.textContent = 'T' + nodeConfig.content;
  node.id = 'T' + nodeConfig.content;

  return node;
}
