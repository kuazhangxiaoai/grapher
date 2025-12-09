import { defineStore } from 'pinia'
import axios from "axios";
import type { FileInfo } from "@/types/text.ts";
import type { Rectangle } from "@/types/rect.ts";
import type { NodeType } from "./nodeTypes.ts";
import { Message } from "@arco-design/web-vue";
import { RectangleType } from "@/types/rect.ts";

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
        addNode(node: NodeType) {
            this.nodes.push(node);
        },
        deleteNode(node: NodeType) {
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
        deleteEditingRect() {
            this.rects = this.rects.filter(rectangle => rectangle.type === RectangleType.COMMITED);
        },
        clearAllRects() {
            this.rects = [];
        },
        getRects() {
            return this.rects
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
        commit() {
            let nodeObjs = []
            let rectObjs = [];
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
            axios.post("/api/graph/createNodes", nodeObjs).then((res) => {
                Message.success("上传节点成功")
            })

            axios.post("/api/text/uploadSentences", rectObjs).then((res) => {
                Message.success("上传标记成功")
            })
            //提交
            /*this.nodes.forEach(node => {
                axios.post("/api/graph/createNode", {
                    name: node.name,
                    label: node.label,
                    sequence: node.sequence,
                    article: node.article
                }).then((res) => {
                    Message.success("上传节点成功")
                })
            })
            this.edges.forEach(edge => {
                axios.post("/api/graph/createEdge", {
                    name: edge.name,
                    from_node_name: edge.from_node_name,
                    from_node_label: edge.from_node_label,
                    to_node_name: edge.to_node_name,
                    to_node_label: edge.to_node_label,
                    sequence: edge.sequence,
                    article: edge.article,
                }).then(res=>{

                })
            })*/
        }
    }


})