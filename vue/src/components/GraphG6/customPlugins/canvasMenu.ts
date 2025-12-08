import {
  BasePlugin,
  CanvasEvent,
  type BasePluginOptions,
  ExtensionCategory,
  register,
} from "@antv/g6";
import {useEditStore} from "@/stores/edit.ts";

// 从localStorage获取节点类型配置
const getNodeTypeColor = (nodeType: string): string => {
  try {
    const stored = localStorage.getItem('nodeTypes');
    if (stored) {
      const nodeTypes = JSON.parse(stored);
      const type = nodeTypes.find((t: any) => t.name === nodeType);
      if (type) {
        return type.color;
      }
    }
    else
    {
      // 默认颜色或根据类型返回不同颜色
      const defaultColors: Record<string, string> = {
        '默认': '#1783FF',
        '人物': '#F53F3F',
        '组织': '#722ED1',
        '概念': '#52C41A',
        '事件': '#FAAD14'
      };
      return defaultColors[nodeType] || '#1783FF';
    }
  } catch (error) {
    console.error('获取节点类型颜色失败:', error);
    return '#1783FF';
  }
};

interface RemoteDataSourceOptions extends BasePluginOptions {}
interface CanvasMenuPluginOptions {
  // 节点默认填充色
  nodeFill: string;
  // 菜单背景色
  menuBackground: string;
  // 菜单文本颜色
  menuTextColor: string;
  // 菜单悬停背景色
  menuHoverBackground: string;
  // 显示模态框的回调
  onShowNodeModal?: (nodeId: string) => void;
}

export class CanvasMenuPlugin extends BasePlugin<RemoteDataSourceOptions> {
  static defaultOptions: Partial<CanvasMenuPluginOptions> = {
    nodeFill: "#1783FF",
    menuBackground: "#FFFFFF",
    menuTextColor: "#333333",
    menuHoverBackground: "#F5F5F5",
  };

  // 菜单元素
  private menuContainer: HTMLDivElement | null = null;
  // 当前点击位置
  private currentPos = { x: 0, y: 0 };
  // 临时节点ID
  private tempNodeId: string | null = null;
  // 保存原始节点数据
  private originalNodeData: any = null;

  constructor(context, options) {
    super(context, Object.assign({}, CanvasMenuPlugin.defaultOptions, options));
    this.createMenuContainer();
    this.bindEvents();
  }

  // 创建菜单容器
  private createMenuContainer() {
    this.menuContainer = document.createElement("div");
    const style = this.menuContainer.style;
    style.position = "absolute";
    style.zIndex = "10";
    style.display = "none";
    style.padding = "4px 0";
    style.borderRadius = "4px";
    style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.15)";
    style.backgroundColor = this.options.menuBackground;
    style.minWidth = "120px";

    // 添加菜单项
    this.addMenuItem(`添加节点`, this.handleAddNode);

    // 添加到DOM
    document.body.appendChild(this.menuContainer);
  }

  // 添加菜单项
  private addMenuItem(text: string, handler: () => void) {
    if (!this.menuContainer) return;

    const item = document.createElement("div");

    // 创建 iconfont 图标
    const icon = document.createElement("i");
    icon.className = "iconfont icon-plus-circle-fill text-[14px] mr-2"; // 使用 iconfont 的类名

    // 创建文本元素
    const textSpan = document.createElement("span");
    textSpan.textContent = text;

    // 将图标和文本添加到菜单项中
    item.appendChild(icon);
    item.appendChild(textSpan);

    const style = item.style;
    style.padding = "6px 12px";
    style.cursor = "pointer";
    style.fontSize = "14px";
    style.color = this.options.menuTextColor;
    style.display = "flex"; // 使用flex布局
    style.alignItems = "center"; // 垂直居中对齐

    // 添加hover效果
    item.addEventListener("mouseenter", () => {
      item.style.backgroundColor = this.options.menuHoverBackground;
    });

    item.addEventListener("mouseleave", () => {
      item.style.backgroundColor = "transparent";
    });

    // 点击事件
    item.addEventListener("click", () => {
      handler();
      this.hideMenu();
    });

    this.menuContainer.appendChild(item);
  }

  // 绑定事件
  private bindEvents() {
    const { graph } = this.context;
    graph.on(CanvasEvent.CONTEXT_MENU, this.onContextMenu);
    document.addEventListener("click", this.handleDocumentClick);
    graph.on(CanvasEvent.CLICK, this.hideMenu);
  }

  // 文档点击事件
  private handleDocumentClick = (event: MouseEvent) => {
    this.hideMenu();
  };

  // 右键菜单事件
  private onContextMenu = (event) => {
    // 阻止默认右键菜单
    event.preventDefault();

    const { clientX, clientY } = event.nativeEvent as MouseEvent;

    // 将客户端坐标转换为画布坐标
    const graph = this.context.graph;
    const point = graph.getCanvasByClient([clientX, clientY]);

    // 保存当前点击位置用于添加节点
    this.currentPos = { x: point[0], y: point[1] };

    // 显示菜单
    this.showMenu(clientX, clientY);
  };

  // 显示菜单
  private showMenu = (x: number, y: number) => {
    if (!this.menuContainer) return;

    this.menuContainer.style.display = "block";
    this.menuContainer.style.left = `${x}px`;
    this.menuContainer.style.top = `${y}px`;
  };

  // 隐藏菜单
  private hideMenu = () => {
    if (!this.menuContainer) return;
    this.menuContainer.style.display = "none";
  };

  // 处理添加节点
  private handleAddNode = () => {
    const { graph } = this.context;
    useEditStore().getAllNodeTypes()
    // 创建临时节点ID
    const nodeId = "node-" + Date.now();
    this.tempNodeId = nodeId;

    // 添加临时节点
    graph.addNodeData([
      {
        id: nodeId,
        data: { name: "" },
        style: {
          x: this.currentPos.x,
          y: this.currentPos.y,
          fill: this.options.nodeFill,
          labelText: "",
        },
      },
    ]);

    graph.draw();

    // 调用显示模态框的回调
    if (
      this.options.onShowNodeModal &&
      typeof this.options.onShowNodeModal === "function"
    ) {
      this.options.onShowNodeModal(nodeId);
    }
  };

  // 更新节点数据
  public updateNodeData(nodeId: string, nodeData: any) {
    if (!nodeId) return;

    const { graph } = this.context;

    if (nodeData && nodeData.name) {
      // 保存原始数据
      this.originalNodeData = graph.getNodeData(nodeId);
      const color = getNodeTypeColor(nodeData.nodeType)
      // 更新节点
      graph.updateNodeData([
        {
          id: nodeId,
          data: {
            name: nodeData.name,
            description: nodeData.description || "",
            entityType: nodeData.nodeType || "默认",
          },
          style: {
            labelText: nodeData.name,
            // 根据节点类型设置不同样式
            fill: color,
          },
        },
      ]);
      graph.draw();
    } else {
      // 取消或没输入值，删除临时节点
      graph.removeNodeData([nodeId]);
      graph.draw();
    }
  }

  // 清除临时节点ID
  public clearTempNodeId() {
    this.tempNodeId = null;
  }

  // 取消添加节点
  public cancelAddNode() {
    if (this.tempNodeId) {
      const { graph } = this.context;
      graph.removeNodeData([this.tempNodeId]);
      graph.draw();
      this.tempNodeId = null;
    }
  }

  // 解绑事件
  private unbindEvents() {
    const { graph } = this.context;
    graph.off(CanvasEvent.CONTEXT_MENU, this.onContextMenu);
    document.removeEventListener("click", this.handleDocumentClick);
    graph.off(CanvasEvent.CLICK, this.hideMenu);
  }

  // 销毁方法
  public destroy() {
    this.unbindEvents();

    if (this.menuContainer && this.menuContainer.parentNode) {
      this.menuContainer.parentNode.removeChild(this.menuContainer);
      this.menuContainer = null;
    }

    super.destroy();
  }
}
