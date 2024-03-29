
function main(container) {
    const graph = new mxGraph(container);
  
    const parent = graph.getDefaultParent();
    graph.getModel().beginUpdate();
    try {
      const v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30);
      const v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30);
      const e1 = graph.insertEdge(parent, null, '30%', v1, v2);
    } finally {
      graph.getModel().endUpdate();
    }
  
    // 判断drop是否有效
    const dropGraph = function (evt) {
      const x = mxEvent.getClientX(evt);
      const y = mxEvent.getClientY(evt);
      // 获取 x,y 所在的元素
      const elt = document.elementFromPoint(x, y);
      // 如果鼠标落在graph容器
      if (mxUtils.isAncestorNode(graph.container, elt)) {
        return graph;
      }
      // 鼠标落在其他地方
      return null;
    };
  
    // drop成功后新建一个节点
    const dropSuccessCb = function (graph, evt, target, x, y) {
      const cell = new mxCell('Test', new mxGeometry(0, 0, 120, 40));
      cell.vertex = true;
      const cells = graph.importCells([cell], x, y, target);
      if (cells != null && cells.length > 0) {
        graph.setSelectionCells(cells);
      }
    };
  
    // 插入节点方法2
    // const dropSuccessCb = function (graph, evt, target, x, y) {
    //   const cell = new mxCell('Test', new mxGeometry(x, y, 120, 40));
    //   cell.vertex = true;
    //   const parent = graph.getDefaultParent();
    //   graph.addCell(cell, parent);
    //   graph.setSelectionCell(cell);
    // };
  
  
    // Creates a DOM node that acts as the drag source
    var img = mxUtils.createImage('assets/img/pika.jpg');
    img.style.width = '48px';
    img.style.height = '48px';
    document.getElementById('model').appendChild(img);
  
    // Creates the element that is being for the actual preview.
    var dragElt = document.createElement('div');
    dragElt.style.border = 'dashed black 1px';
    dragElt.style.width = '120px';
    dragElt.style.height = '40px';
  
    var ds = mxUtils.makeDraggable(img, dropGraph, dropSuccessCb, dragElt, null, null, graph.autoscroll, true);
    // Restores original drag icon while outside of graph
    ds.createDragElement = mxDragSource.prototype.createDragElement;
}