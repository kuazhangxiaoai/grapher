import type {
  BaseBehaviorOptions,
  RuntimeContext,
  IPointerEvent
} from "@antv/g6";
import { BaseBehavior, CanvasEvent } from "@antv/g6";

interface ClickAddNodeOptions extends BaseBehaviorOptions {
  fill: string;
}

export class ClickAddNode extends BaseBehavior<ClickAddNodeOptions> {
  static defaultOptions: Partial<ClickAddNodeOptions> = {
    fill: "red"
  };
  constructor(context: RuntimeContext, options: ClickAddNodeOptions) {
    super(context, Object.assign({}, ClickAddNode.defaultOptions, options));
    this.bindEvents();
  }
  private bindEvents() {
    const { graph } = this.context;
    graph.on(CanvasEvent.CLICK, this.addNode);
  }
  private addNode = (event: IPointerEvent) => {
    const { graph } = this.context;

    // 获取事件的客户端坐标
    const { clientX, clientY } = event.nativeEvent as PointerEvent;

    // 将客户端坐标转换为画布坐标（考虑视口变换）
    const point = graph.getCanvasByClient([clientX, clientY]);

    // 使用转换后的坐标添加节点
    graph.addNodeData([
      {
        id: "node-" + Date.now(),
        style: {
          x: point[0],
          y: point[1],
          fill: this.options.fill
        }
      }
    ]);

    graph.draw();
  };
  private unbindEvents() {
    const { graph } = this.context;
    graph.off(CanvasEvent.CLICK, this.addNode);
  }
  public destroy() {
    // 销毁时解绑事件
    this.unbindEvents();
    super.destroy();
  }
}
