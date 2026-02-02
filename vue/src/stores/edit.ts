import { defineStore } from "pinia";
import axios from "axios";
import type { Node } from "@/types/node.ts";
import type { FileInfo } from "@/types/text.ts";
import type { Rectangle } from "@/types/rect.ts";
import type { NodeType } from "./nodeTypes.ts";
import type { Edge } from "@/types/edges.ts";
import { Message, Modal } from "@arco-design/web-vue";
import { RectangleType } from "@/types/rect.ts";
import { RectangleColorType } from "../types/rect.ts";
import apiClient from "@/services/apiClient";
export const useEditStore = defineStore("editStore", {
  state: () => ({
    article: "" as unknown as string,
    currentPDFPage: 1 as number,
    totalPages: 1 as number,
    sequence: "" as unknown as string,
    nodes: [] as Node[],
    nodeTypes: [] as NodeType[],
    edges: [] as Edge[],
    rects: [] as Rectangle[],
    editGraph: false,
    editGraphPanel: false,
    fileList: false,
    fileinfos: [] as FileInfo[],
    pdfPreviewUrl: "" as unknown as string,
    server: "http://localhost:8088",
    graphRequestCancelToken: null as any,
    project: "" as unknown as string,
    committing: false,
    deleting: false,
    refreshing: false,
    loadingNodeTypes: false,
  }),
  getters: {
    getCurrentPage: (state) => {},
    getCurrentPageItem: (state) => {},
  },
  actions: {
    async getServer() {
      this.server = await apiClient.get("/api/user/server").then((res: any) => {
        this.server = res.data;
        return this.server;
      });
    },
    addNode(node: Node) {
      // 检查是否已存在同名节点
      const isDuplicate = this.nodes.some(
        (existingNode) => existingNode.name === node.name,
      );
      if (isDuplicate) {
        console.error("节点名称已存在:", node.name);
        Message.error("节点名称已存在，请输入不同的名称");
        return;
      }
      this.nodes.push(node);
    },
    deleteNode(node: Node) {
      this.nodes.splice(this.nodes.indexOf(node), 1);
    },
    deleteNodeByName(name: string) {
      this.edges = this.edges.filter(
        (edge) => edge.from_node_name != name && edge.to_node_name != name,
      );
      this.nodes = this.nodes.filter((node) => node.name != name);
    },
    updateNode(old_node: Node, new_node: Node) {
      const ind = this.nodes.findIndex((x) => old_node.name === x.name);
      this.nodes[ind] = new_node;
    },
    getArticleTitle() {
      return this.article;
    },
    setArticleTitle(article: string) {
      this.article = article;
    },
    openGraphEditor() {
      this.editGraph = true;
      this.editGraphPanel = false;
    },
    closeGraphEditor() {
      this.nodes = [] as NodeType[];
      this.edges = [] as Edge[];
      this.sequence = "";
      this.editGraph = false;
    },
    openGraphEditorPanel() {
      this.editGraphPanel = true;
      this.editGraph = false;
    },
    closeGraphEditorPanel() {
      this.nodes = [] as NodeType[];
      this.edges = [] as Edge[];
      this.sequence = "";
      this.editGraphPanel = false;
    },
    openFileList() {
      this.fileList = true;
    },
    closeFileList() {
      this.fileList = false;
    },
    getSequence() {
      return this.sequence;
    },
    setSequence(sequence) {
      this.sequence = sequence;
    },
    addSequence(sequence) {
      this.sequence += sequence;
    },
    getAllFileInfoList(project: string) {
      apiClient
        .get("/api/text/articletitles", { params: { project: project } })
        .then((res) => {
          this.fileinfos = res.data;
        });
    },
    setPDFPreviewUrl(url: string) {
      this.pdfPreviewUrl = url;
    },
    getPDFPreviewUrl: () => {
      return this.pdfPreviewUrl;
    },
    setRects(rects: Rectangle[]) {
      this.rects = [...rects]; // 防止被外部引用污染
    },
    addRect(rect: Rectangle) {
      this.rects.push(rect);
    },
    addRects(rects: Rectangle[]) {
      this.rects = [...this.rects, ...rects];
    },
    addEdge(edge: Edge) {
      this.edges.push(edge);
    },
    saveRectToLocalStorage() {
      localStorage.setItem("editingRect", JSON.stringify(this.rects));
    },
    getRectFromLocalStorage() {
      const rect_str = localStorage.getItem("editingRect");
      const saved_rects = JSON.parse(rect_str);
      return saved_rects;
    },
    deleteEdge(edge: Edge) {
      this.edges.splice(this.edges.indexOf(edge), 1);
    },
    deleteEditingRect() {
      this.rects = this.rects.filter(
        (rectangle) => rectangle.type === RectangleType.COMMITED,
      );
    },
    clearAllRects() {
      this.rects = [];
    },
    getRects(queryEnable = false) {
      if (queryEnable) {
        apiClient
          .get("/api/text/querySentences", {
            params: {
              article: this.article,
              page: this.currentPDFPage,
              project: localStorage.getItem("grapher-project") as string,
            },
          })
          .then((res) => {
            res.data.forEach((item) => {
              let rectObj: Rectangle = {
                x: item.x0,
                y: item.y0,
                width: item.x1 - item.x0,
                height: item.y1 - item.y0,
                left: item.x0,
                top: item.y0,
                right: item.x1,
                bottom: item.y1,
                color: RectangleColorType.COMMITED,
                type: RectangleType.COMMITED,
                page: item.page,
                text: item.sequence || "",
                id: item.id || item.sentence_id || "",
              };
              if (item.article === this.article) {
                this.addRect(rectObj);
              }
            });
            return this.rects;
          });
      } else {
        return this.rects;
      }
    },
    queryRects() {
      return new Promise((resolve) => {
        // 只有当article存在时才调用API，否则返回空数组
        if (!this.article) {
          this.setRects([]);
          resolve([]);
          return;
        }

        apiClient
          .get("/api/text/querySentences", {
            params: {
              article: this.article,
              page: this.currentPDFPage,
              project: localStorage.getItem("grapher-project") as string,
            },
          })
          .then((res) => {
            let newRects: Rectangle[] = [];
            res.data.forEach((item) => {
              let rectObj: Rectangle = {
                x: item.x0,
                y: item.y0,
                width: item.x1 - item.x0,
                height: item.y1 - item.y0,
                left: item.x0,
                top: item.y0,
                right: item.x1,
                bottom: item.y1,
                color: RectangleColorType.COMMITED,
                type: RectangleType.COMMITED,
                page: item.page,
                text: item.sequence || "",
                id: item.id || item.sentence_id || "",
              };
              if (item.article === this.article) {
                newRects.push(rectObj);
              }
            });
            this.setRects(newRects);
            resolve(newRects);
          })
          .catch((error) => {
            console.error("查询rects失败:", error);
            resolve([]);
          });
      });
    },
    async getAllNodeTypes() {
      // 检查是否正在加载，避免重复请求
      if (this.loadingNodeTypes) {
        return this.nodeTypes;
      }

      this.loadingNodeTypes = true;
      const project = localStorage.getItem("grapher-project");

      try {
        const res = await apiClient.get("/api/graph/getNodeTypeByProject", {
          params: { project: project },
        });
        const node_types: NodeType[] = res.data.map(
          (item: any) =>
            ({
              id: item.id,
              name: item.name,
              color: item.color,
            }) as NodeType,
        );

        this.nodeTypes = node_types;
        localStorage.setItem("nodeTypes", JSON.stringify(node_types));
        return node_types;
      } catch (error) {
        console.error("获取节点类型失败:", error);
        // 可以考虑从本地存储恢复数据
        const storedTypes = localStorage.getItem("nodeTypes");
        if (storedTypes) {
          this.nodeTypes = JSON.parse(storedTypes);
          return this.nodeTypes;
        }
        return [];
      } finally {
        this.loadingNodeTypes = false;
      }
    },
    addNodeType(type: NodeType) {
      const project = localStorage.getItem("grapher-project");
      apiClient
        .post("/api/graph/addNodeType", {
          name: type.name,
          color: type.color,
          project,
        })
        .then((res) => {
          return res.data;
        });
    },
    updateNodeType(type: NodeType) {
      const project = localStorage.getItem("grapher-project");
      apiClient
        .post("/api/graph/updateNodeType", {
          id: type.id,
          name: type.name,
          color: type.color,
          project,
        })
        .then((res) => {
          return res.data;
        });
    },
    getEditingRects() {
      return this.rects.filter((r) => r.type == RectangleType.EDITING);
    },
    nextPDFPage() {
      this.saveRectToLocalStorage()
      this.currentPDFPage++;
    },
    lastPDFPage() {
      this.saveRectToLocalStorage()
      this.currentPDFPage--;
    },
    setTotalPages(page: number) {
      this.totalPages = page;
    },
    jumpPDFPage(page: number) {
      this.currentPDFPage = page;
    },
    queryGraphByArticle(article: string) {
      this.article = article;
      this.sequence = "";
      return new Promise((resolve, reject) => {
        apiClient
          .get("/api/graph/getGraphFromArticle", {
            params: {
              article: article,
              project: localStorage.getItem("grapher-project"),
            },
          })
          .then((res: any) => {
            const nodes: any = [];
            const edges: any = [];

            // for render
            let graph_data: any = {
              nodes: [],
              edges: [],
            };
            // 创建节点映射，方便快速查找
            const nodeMap = new Map();
            res.data.nodes.forEach((node: any) => {
              const nodeItem: any = {
                id: node.name,
                data: {
                  name: node.name,
                  description: "",
                  entityType: node.label || "默认",
                },
                style: {
                  labelText: node.name,
                  fill: node.color,
                },
              };
              graph_data.nodes.push(nodeItem);
              nodeMap.set(node.name, nodeItem);
            });

            res.data.edges.forEach((edge: any, index: any) => {
              // 只添加有效的边，即源节点和目标节点都存在的边
              if (
                nodeMap.has(edge.from_node_name) &&
                nodeMap.has(edge.to_node_name)
              ) {
                graph_data.edges.push({
                  id: "edge-" + index.toString(),
                  data: { name: edge.name },
                  target: edge.to_node_name,
                  source: edge.from_node_name,
                });
              } else {
                console.warn(
                  `Skipping invalid edge: ${edge.name} (source: ${edge.from_node_name}, target: ${edge.to_node_name}) - one or both nodes not found`,
                );
              }
            });

            //for restore
            res.data.nodes.forEach((node: any) => {
              const n: any = {
                label: node.label,
                name: node.name,
                sequence: node.sequence || "",
                article: node.article,
                color: node.color, // 添加color字段，确保节点颜色能正确传递
              };
              nodes.push(n);
            });

            res.data.edges.forEach((edge: any) => {
              const e: any = {
                name: edge.name,
                from_node_name: edge.from_node_name,
                from_node_label: edge.from_node_label,
                to_node_name: edge.to_node_name,
                to_node_label: edge.to_node_label,
                sequence: edge.sequence || "",
                article: edge.article,
              };
              edges.push(e);
            });
            this.nodes = nodes;
            this.edges = edges;

            resolve(graph_data);
          });
      });
    },

    queryGraphBySeq(seq: string) {
      this.sequence = seq;

      // 取消之前的请求
      if (this.graphRequestCancelToken) {
        console.log(
          `[queryGraphBySeq] 取消之前的请求，当前新请求的sequence: ${seq}`,
        );
        this.graphRequestCancelToken.cancel(
          "Operation canceled due to new request.",
        );
      }

      // 创建新的取消令牌
      this.graphRequestCancelToken = axios.CancelToken.source();

      console.log(`[queryGraphBySeq] 发起新请求，sequence: ${seq}`);

      apiClient
        .get("/api/graph/getGraphFromSeq", {
          params: {
            sequence: seq || "",
            project: localStorage.getItem("grapher-project") as string,
          },
          cancelToken: this.graphRequestCancelToken.token,
        })
        .then((res: any) => {
          console.log(res.data);
          let nodes: any = [] as Node[];
          let edges: any = [] as Edge[];

          res.data.nodes.forEach((node: any) => {
            const n: any = {
              label: node.label,
              name: node.name,
              sequence: node.sequence || "",
              article: node.article,
              color: node.color, // 添加color字段，确保节点颜色能正确传递
            };
            nodes.push(n);
          });

          res.data.edges.forEach((edge: any) => {
            const e: any = {
              name: edge.name,
              from_node_name: edge.from_node_name,
              from_node_label: edge.from_node_label,
              to_node_name: edge.to_node_name,
              to_node_label: edge.to_node_label,
              sequence: edge.sequence || "",
              article: edge.article,
            };
            edges.push(e);
          });
          this.nodes = nodes;
          this.edges = edges;
        })
        .catch((error: any) => {
          if (axios.isCancel(error)) {
            console.log("Request canceled:", error.message);
          } else {
            console.error("Error fetching graph data:", error);
            Message.error("获取关系图数据失败");
          }
        });
    },
    initProject() {
      const storedProject = localStorage.getItem("grapher-project");
      if (storedProject) {
        this.project = storedProject;
      }
    },

    setProjectName(projectName: string) {
      this.project = projectName;
    },

    setCommiting(flag: boolean) {
      this.commiting = flag;
    },

    setRefreshing(flag: boolean) {
      this.refreshing = flag;
    },

    commit() {
      // 设置committing状态为true，触发Home.vue中的watcher更新画布
      this.committing = true;

      let nodeObjs: any = [];
      let rectObjs: any = [];
      let edgeObjs: any = [];
      this.nodes.forEach((node: any) => {
        let node_str = JSON.stringify(node);
        let node_obj = JSON.parse(node_str);
        node_obj.project = this.project;
        nodeObjs.push(node_obj);
      });
      this.rects.forEach((rectangle: any) => {
        let seq_obj: any = {
          text: this.sequence || "",
          x0: rectangle.left,
          y0: rectangle.top,
          x1: rectangle.left + rectangle.width,
          y1: rectangle.top + rectangle.height,
          article: this.article,
          page: rectangle.page,
          project: this.project,
        };
        rectObjs.push(seq_obj);
      });
      this.edges.forEach((edge: any) => {
        let seq_obj: any = {
          name: edge.name,
          from_node_label: edge.from_node_label,
          from_node_name: edge.from_node_name,
          to_node_label: edge.to_node_label,
          to_node_name: edge.to_node_name,
          sequence: edge.sequence || "",
          article: this.article,
          project: this.project,
        };
        edgeObjs.push(seq_obj);
      });
      apiClient
        .post("/api/graph/commit", {
          sequence: this.sequence || "",
          nodes: nodeObjs,
          edges: edgeObjs,
        })
        .then((res: any) => {
          Message.success("上传数据成功");
        })
        .catch((error: any) => {
          Message.error(error);
        });

      apiClient.post("/api/text/uploadSentences", rectObjs).then((res: any) => {
        this.deleteEditingRect();
        this.queryRects();
        Message.success("上传标记成功");
      });
    },
    setCommitting(flag: boolean) {
      this.committing = flag;
    },

    setDeleting(flag: boolean) {
      this.deleting = flag;
    },

    // 重置状态，确保每次进入画布页面都显示当前项目的初始状态
    resetState() {
      this.article = "";
      this.sequence = "";
      this.nodes = [];
      this.edges = [];
      this.rects = [];
      this.pdfPreviewUrl = "";
      this.currentPDFPage = 1;
      this.totalPages = 1;
    },

    //删除语句
    deleteSequence(sequence: string) {
      // 从当前rects中找到对应的矩形，获取位置和页面信息
      const targetRect = this.rects.find((rect) => rect.text === sequence);
      const x0 = targetRect?.left || 0;
      const y0 = targetRect?.top || 0;
      const x1 = targetRect?.right || 0;
      const y1 = targetRect?.bottom || 0;
      const page = targetRect?.page || this.currentPDFPage;

      Modal.confirm({
        title: "确认删除",
        content: "确定要删除当前句子吗？",
        okText: "删除",
        cancelText: "取消",
        okButtonProps: {
          status: "danger",
        },
        onOk: () => {
          apiClient
            .post("/api/text/deleteSequence", {
              text: sequence,
              x0,
              y0,
              x1,
              y1,
              article: this.article,
              page,
              project: localStorage.getItem("grapher-project") as string,
            })
            .then((res: any) => {
              Message.success("删除成功");
              // 删除成功后，关闭编辑器并重新加载PDF信息
              this.closeGraphEditor();
              this.queryRects();
            });
          this.rects = this.rects.filter(
            (rectangle: any) => rectangle.text != sequence,
          );
        },
      });
    },

    //删除文章
    deleteArticle(article: string) {
      Modal.confirm({
        title: "确认删除",
        content: "确定要删除这篇文章吗？",
        okText: "删除",
        cancelText: "取消",
        okButtonProps: {
          status: "danger",
        },
        onOk: () => {
          apiClient
            .post("/api/text/deleteArticle", {
              title: article,
              project: localStorage.getItem("grapher-project") as string,
            })
            .then((res: any) => {
              Message.success("删除成功");
              // 删除成功后重新获取文件列表
              this.getAllFileInfoList(
                localStorage.getItem("grapher-project") as string,
              );
            });
        },
      });
    },
  },
});
