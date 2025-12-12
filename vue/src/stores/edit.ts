import { defineStore } from 'pinia'
import axios from "axios";
import type {Node} from "@/types/node.ts"
import type { FileInfo } from "@/types/text.ts";
import type { Rectangle } from "@/types/rect.ts";
import type { NodeType } from "./nodeTypes.ts";
import type {Edge} from "@/types/edges.ts";
import { Message } from "@arco-design/web-vue";
import { RectangleType } from "@/types/rect.ts";
import {RectangleColorType} from "../types/rect.ts";

export const useEditStore = defineStore('editStore', {
    state: () => ({
        article: null as string,
        currentPDFPage: 1 as number,
        totalPages: 1 as number,
        sequence: null as string,
        nodes: [] as Node,
        nodeTypes: [] as NodeType[],
        edges: [] as Edge,
        rects: [] as Rectangle,
        editGraph: false,
        fileList: false,
        fileinfos: [] as FileInfo,
        pdfPreviewUrl: null as string,
        server: "http://localhost:8088",
    }),
    getters: {
        getCurrentPage: (state) => { },
        getCurrentPageItem: (state) => { },
    },
    actions: {
        addNode(node: Node) {
            this.nodes.push(node);
        },
        deleteNode(node: Node) {
            this.nodes.splice(this.nodes.indexOf(node), 1);
        },
        updateNode(old_node: Node, new_node: Node) {
            const ind = this.nodes.findIndex(x => old_node.name === x.name)
            this.nodes[ind] = new_node;
        },
        getArticleTitle() {
            return this.article
        },
        setArticleTitle(article) {
            this.article = article
        },
        openGraphEditor() {
            this.editGraph = true
        },
        closeGraphEditor() {
            this.nodes = [] as NodeType[];
            this.edges = [] as Edge[];
            this.editGraph = false
        },
        openFileList() {
            this.fileList = true
        },
        closeFileList() {
            this.fileList = false
        },
        getSequence() {
            return this.sequence
        },
        setSequence(sequence) {
            this.sequence = sequence
        },
        getAllFileInfoList(): FileInfo[] {
            axios.get("/api/text/articletitles").then(res => {
                this.fileinfos = res.data
                return this.fileinfos
            })
        },
        setPDFPreviewUrl(url: string) {
            this.pdfPreviewUrl = url
        },
        getPDFPreviewUrl: () => {
            return this.pdfPreviewUrl
        },
        setRects(rects: Rectangle[]) {
            this.rects = [...rects]   // 防止被外部引用污染
        },
        addRect(rect: Rectangle) {
            this.rects.push(rect)
        },
        addEdge(edge: Edge){
            this.edges.push(edge)
        },
        deleteEdge(edge: Edge){
            this.edges.splice(this.edges.indexOf(edge), 1);
        },
        deleteEditingRect() {
            this.rects = this.rects.filter(rectangle => rectangle.type === RectangleType.COMMITED);
        },
        clearAllRects() {
            this.rects = [];
        },
        getRects(queryEnable=false) {
            if (queryEnable) {
                axios.get("/api/text/querySentences",
                    {
                        params: {
                            article: this.article,
                            page: this.currentPDFPage,
                        }
                    }).then(res => {
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
                            id: item.id || item.sentence_id || ""
                        }
                        if (item.article === this.article) {
                            this.addRect(rectObj)
                        }

                    })
                    return this.rects;
                })
            }
            else {
                return this.rects
            }
        },
        queryRects(){
            return new Promise((resolve) => {
                axios.get("/api/text/querySentences",
                    {
                        params: {
                            article: this.article,
                            page: this.currentPDFPage,
                        }
                    }).then(res => {
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
                                id: item.id || item.sentence_id || ""
                            }
                            if (item.article === this.article) {
                                newRects.push(rectObj);
                            }
                        });
                        this.setRects(newRects);
                        resolve(newRects);
                    }).catch((error) => {
                        console.error("查询rects失败:", error);
                        resolve([]);
                    });
            });
        },
        getAllNodeTypes() {
            localStorage.removeItem('nodeTypes');
            const node_types: NodeType[] = [];
            axios.get("/api/graph/getAllNodeType").then((res) => {
                res.data.forEach(item => {
                    node_types.push({ id: item.id, name: item.name, color: item.color } as NodeType);
                })
                this.nodeTypes = node_types;
                localStorage.setItem('nodeTypes', JSON.stringify(node_types));
                return node_types;
            })
        },
        addNodeType(type: NodeType) {
            axios.post("/api/graph/addNodeType",
                { name: type.name, color: type.color })
                .then((res) => {
                    return res.data;
                })
        },
        updateNodeType(type: NodeType) {
            axios.post("/api/graph/addNodeType",
                { id: type.id, name: type.name, color: type.color })
                .then((res) => {
                    return res.data;
                })
        },
        nextPDFPage() {
            this.currentPDFPage++;
            this.clearAllRects();  
        },
        lastPDFPage() {
            this.currentPDFPage--;
            this.clearAllRects();   
        },
        setTotalPages(page: number) {
            this.totalPages = page;
        },
        jumpPDFPage(page: number) {
            this.currentPDFPage = page;
            this.clearAllRects();  
        },
        queryGraphBySeq(seq: string) {
            this.sequence = seq;
            axios.get("/api/graph/getGraphFromSeq", {params: {sequence: seq}}).then((res) => {
                console.log(res.data);
                let nodes = [] as Node[];
                let edges = [] as Edge[];

                res.data.nodes.forEach(node => {
                    const n: Node = {
                        label: node.label,
                        name: node.name,
                        sequence: node.sequence,
                        article: node.article
                    }
                    nodes.push(n);
                })

                res.data.edges.forEach(edge => {
                    const e: Edge = {
                        name: edge.name,
                        from_node_name: edge.from_node_name,
                        from_node_label: edge.from_node_label,
                        to_node_name: edge.to_node_name,
                        to_node_label: edge.to_node_label,
                        sequence: edge.sequence,
                        article: edge.article
                    }
                    edges.push(e);
                })
                this.nodes = nodes;
                this.edges = edges;
            })
        },
        commit() {
            let nodeObjs = []
            let rectObjs = [];
            let edgeObjs = [];
            this.nodes.forEach(node => {
                let node_str = JSON.stringify(node);
                let node_obj = JSON.parse(node_str);
                nodeObjs.push(node_obj);
            })
            this.rects.forEach(rectangle => {
                let seq_obj: object = {
                    text: this.sequence,
                    x0: rectangle.left,
                    y0: rectangle.top,
                    x1: rectangle.left + rectangle.width,
                    y1: rectangle.top + rectangle.height,
                    article: this.article,
                    page: this.currentPDFPage,
                }
                rectObjs.push(seq_obj);
            })
            this.edges.forEach(edge => {
                let seq_obj: object = {
                    name: edge.name,
                    from_node_label: edge.from_node_label,
                    from_node_name: edge.from_node_name,
                    to_node_label: edge.to_node_label,
                    to_node_name: edge.to_node_name,
                    sequence: edge.sequence,
                    article: edge.article,
                }
                edgeObjs.push(seq_obj);
            })
            axios.post("/api/graph/commit", {
                sequence: this.sequence,
                nodes: nodeObjs,
                edges: edgeObjs,
            }).then((res) => {
                Message.success("上传数据成功")
            })

            axios.post("/api/text/uploadSentences", rectObjs).then((res) => {
                this.deleteEditingRect()
                this.queryRects()
                Message.success("上传标记成功")
            })
        }
    }


})