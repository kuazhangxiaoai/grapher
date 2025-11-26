import { findShortestPath, findAllPath } from "@antv/algorithm";
import { Message } from "@arco-design/web-vue";

// 下载图片(官方,透明)
export async function downloadImage(graph: any) {
  const dataURL = await graph.toDataURL();
  const [head, content] = dataURL.split(",");
  const contentType = head.match(/:(.*?);/)![1];

  const bstr = atob(content);
  let length = bstr.length;
  const u8arr = new Uint8Array(length);

  while (length--) {
    u8arr[length] = bstr.charCodeAt(length);
  }

  const blob = new Blob([u8arr], { type: contentType });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "graph.png";
  a.click();
}

// 切换布局的函数
export const changeLayout = (graph: any, layoutType: string) => {
  if (!graph) return;

  console.log(`切换到 ${layoutType} 布局`); // 添加日志
  // 根据布局类型定义不同的配置
  const layoutConfig = {
    force: {
      type: "force",
      preventOverlap: true
    },
    radial: {
      type: "radial",
      preventOverlap: true
    },
    dagre: {
      type: "dagre",
      rankdir: "LR",
      align: "UL",
      nodesep: 80,
      ranksep: 100,
      controlPoints: true
    },
    concentric: {
      type: "concentric",
      minNodeSpacing: 60,
      preventOverlap: true,
      sortBy: "degree",
      equidistant: false,
      startRadius: 10,
      nodeSize: 40
    },
    grid: {
      type: "grid",
      preventOverlap: true,
      nodeSize: 40,
      sortBy: "cluster"
    },
    circular: {
      type: "circular",
      radius: 250,
      preventOverlap: true,
      nodeSize: 40,
      ordering: "degree"
    },
    fruchterman: {
      type: "fruchterman",
      preventOverlap: true,
      gravity: 10,
      speed: 5,
      nodeClusterBy: "cluster",
      clustering: true,
      clusterGravity: 20,
      maxIteration: 500,
      workerEnabled: true
    }
  };

  // 更新布局
  graph.setLayout(layoutConfig[layoutType]);

  // 显式调用layout方法，确保布局被应用
  graph.layout();
  // // 布局计算完成后适配视图
  graph.once("afterlayout", () => {
    graph.fitView();
    // graph.zoomBy(0.9);
    console.log(`${layoutType} 布局计算完成`);
  });
};

// 添加新函数 - 支持自定义布局配置
export const applyCustomLayout = (graph: any, layoutConfig: any) => {
  if (!graph || !layoutConfig || !layoutConfig.type) {
    console.error("无效的布局配置");
    return;
  }

  console.log(`应用自定义布局: ${layoutConfig.type}`);

  // 更新布局
  graph.setLayout(layoutConfig);

  // 显式调用layout方法，确保布局被应用
  graph.layout();

  // 布局计算完成后适配视图
  graph.once("afterlayout", () => {
    graph.fitView();
    console.log(`自定义布局计算完成`);
  });
};

// 下载图片(自定义,不透明)
export async function downloadCustomImage(graph: any) {
  // 获取原始透明背景的图像数据
  const dataURL = await graph.toDataURL();

  // 创建一个新的 Image 对象加载原始图像
  const img = new Image();
  img.src = dataURL;

  // 等待图像加载完成
  await new Promise(resolve => {
    img.onload = resolve;
  });

  // 创建一个新的 Canvas，大小与原图相同
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  // 获取 Canvas 上下文并填充白色背景
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 将原始图像绘制到白色背景上
  ctx.drawImage(img, 0, 0);

  // 获取带白色背景的新图像数据
  const newDataURL = canvas.toDataURL("image/png");

  // 处理新的图像数据并下载
  const [head, content] = newDataURL.split(",");
  const contentType = head.match(/:(.*?);/)![1];

  const bstr = atob(content);
  let length = bstr.length;
  const u8arr = new Uint8Array(length);

  while (length--) {
    u8arr[length] = bstr.charCodeAt(length);
  }

  const blob = new Blob([u8arr], { type: contentType });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "graph.png";
  a.click();
}

/**
 * 在两个选中节点之间查找最短路径并高亮显示
 * @param graph G6图实例
 * @param graphData 图数据
 * @param directed 是否为有向图，默认为false
 * @returns 是否成功高亮路径
 */
export const findAndHighlightShortestPath = (
  graph: any,
  graphData: any,
  startNode: string,
  endNode: string,
  directed: boolean = false
) => {
  try {
    // 获取选中的节点

    // 检查是否选择了正好两个节点
    if (!startNode || !endNode) {
      Message.error("请选择两个节点以查找最短路径");
      return {
        success: false
      };
    }

    // 获取并高亮最短路径
    const { length, path } = findShortestPath(
      graphData,
      startNode,
      endNode,
      directed
    );

    if (length === Infinity) {
      Message.error("未找到两节点之间的路径");
      return {
        success: false
      };
    }

    // 创建状态映射对象
    const states: Record<string, string> = {};

    // 处理节点状态
    graphData.nodes.forEach(node => {
      const id = typeof node === "string" ? node : node.id;
      if (path.includes(id)) {
        states[id] = "highlight"; // 高亮路径上的节点
      } else {
        states[id] = "inactive"; // 其他节点设为非活动状态
      }
    });

    // 处理边状态
    graphData.edges.forEach(edge => {
      const id = typeof edge === "string" ? edge : edge.id;
      const source = typeof edge === "string" ? "" : edge.source;
      const target = typeof edge === "string" ? "" : edge.target;

      // 检查边的两端是否在路径上且相邻
      const sourceIndex = path.indexOf(source);
      const targetIndex = path.indexOf(target);

      if (sourceIndex === -1 || targetIndex === -1) {
        states[id] = "inactive";
        return;
      }

      // 如果是相邻节点（路径中相邻），高亮该边
      if (Math.abs(sourceIndex - targetIndex) === 1) {
        states[id] = "highlight";
      } else {
        states[id] = "inactive";
      }
    });

    // 应用状态到图元素
    graph.setElementState(states);

    // 将路径上的元素置于前面
    graph.frontElement(path);

    return {
      success: true,
      message: `找到最短路径，长度为 ${length}`,
      path: path
    };
  } catch (error) {
    console.error("查找最短路径失败:", error);
    Message.error("查找最短路径时发生错误");
    return {
      success: false
    };
  }
};

/**
 * 在两个节点之间查找所有路径并高亮显示
 * @param graph G6图实例
 * @param graphData 图数据
 * @param startNode 起始节点ID
 * @param endNode 终止节点ID
 * @param directed 是否为有向图，默认为false
 * @returns 包含路径信息的对象，包括节点路径和对应的边路径
 */
export const findAndHighlightAllPaths = (
  graph: any,
  graphData: any,
  startNode: string,
  endNode: string,
  directed: boolean = false
) => {
  try {
    // 检查是否提供了两个节点
    if (!startNode || !endNode) {
      Message.error("请选择两个节点以查找路径");
      return {
        success: false
      };
    }

    // 获取所有路径
    const allPaths = findAllPath(graphData, startNode, endNode, directed);

    // 检查是否找到路径
    if (!allPaths || allPaths.length === 0) {
      Message.error("未找到路径");
      return {
        success: false,
        paths: [],
        edgePaths: []
      };
    }

    // 创建状态映射对象
    const states: Record<string, string> = {};

    // 获取所有路径中涉及的节点
    const pathNodes = new Set<string>();
    const pathEdges = new Set<string>();

    // 存储每条路径的边ID序列
    const edgePaths: string[][] = [];

    // 收集所有路径上的节点和边
    allPaths.forEach(path => {
      // 添加路径上的所有节点
      path.forEach(nodeId => pathNodes.add(nodeId));

      // 当前路径的边ID数组
      const currentPathEdges: string[] = [];

      // 添加路径上的所有边
      for (let i = 0; i < path.length - 1; i++) {
        const sourceId = path[i];
        const targetId = path[i + 1];

        // 查找匹配的边
        graphData.edges.forEach(edge => {
          const edgeSource = typeof edge === "string" ? "" : edge.source;
          const edgeTarget = typeof edge === "string" ? "" : edge.target;

          if (
            (edgeSource === sourceId && edgeTarget === targetId) ||
            (!directed && edgeSource === targetId && edgeTarget === sourceId)
          ) {
            const edgeId = typeof edge === "string" ? edge : edge.id;
            pathEdges.add(edgeId);

            // 将边ID添加到当前路径的边集合中
            currentPathEdges.push(edgeId);
          }
        });
      }

      // 将当前路径的边ID序列添加到结果中
      edgePaths.push(currentPathEdges);
    });

    // 处理节点状态
    graphData.nodes.forEach(node => {
      const id = typeof node === "string" ? node : node.id;
      if (pathNodes.has(id)) {
        states[id] = "highlight"; // 高亮路径上的节点
      } else {
        states[id] = "inactive"; // 其他节点设为非活动状态
      }
    });

    // 处理边状态
    graphData.edges.forEach(edge => {
      const id = typeof edge === "string" ? edge : edge.id;
      if (pathEdges.has(id)) {
        states[id] = "highlight"; // 高亮路径上的边
      } else {
        states[id] = "inactive"; // 其他边设为非活动状态
      }
    });

    // 应用状态到图元素
    graph.setElementState(states);

    // 将路径上的元素置于前面
    graph.frontElement(Array.from(pathNodes));

    // 构建完整的路径信息，包含节点路径和对应的边路径
    const completePaths = allPaths.map((nodePath, index) => {
      return {
        nodes: nodePath,
        edges: edgePaths[index]
      };
    });

    return {
      success: true,
      message: `找到 ${allPaths.length} 条路径`,
      paths: allPaths, // 保留原有的节点路径返回
      edgePaths: edgePaths, // 返回所有路径的边ID
      completePaths: completePaths // 返回节点和边组合的完整路径信息
    };
  } catch (error) {
    console.error("查找所有路径失败:", error);
    Message.error("查找所有路径时发生错误");
    return {
      success: false,
      paths: [],
      edgePaths: [],
      completePaths: []
    };
  }
};

/**
 * 判断两个节点之间是否可以连线
 * @param graph G6图实例
 * @param sourceNodeId 源节点ID
 * @param targetNodeId 目标节点ID
 * @returns boolean 是否可以连线
 */
export const canCreateEdge = (
  graph: any,
  sourceNodeId: string,
  targetNodeId: string
): boolean => {
  // 判断是否是自连接
  if (sourceNodeId === targetNodeId) {
    return false;
  }

  // 获取源节点的所有关联边
  const sourceEdges = graph.getRelatedEdgesData(sourceNodeId);
  // 获取目标节点的所有关联边
  const targetEdges = graph.getRelatedEdgesData(targetNodeId);

  // 检查源节点到目标节点的边
  const sourceToTarget = sourceEdges.filter(
    edge => edge.source === sourceNodeId && edge.target === targetNodeId
  );

  // 检查目标节点到源节点的边
  const targetToSource = targetEdges.filter(
    edge => edge.source === targetNodeId && edge.target === sourceNodeId
  );

  // 如果两个方向都已经有边,则不能再连线
  if (sourceToTarget.length > 1 && targetToSource.length > 1) {
    return false;
  }

  // 如果当前要创建的是从源节点到目标节点的边,且该方向已经有边,则不能再连线
  if (sourceToTarget.length > 1) {
    return false;
  }

  // 如果当前要创建的是从目标节点到源节点的边,且该方向已经有边,则不能再连线
  if (targetToSource.length > 1) {
    return false;
  }

  return true;
};
