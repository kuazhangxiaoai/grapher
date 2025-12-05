import {defineStore} from 'pinia'
import axios from "axios";
import type {FileInfo} from "../types/text.ts";
import type {Rectangle} from "../types/rect.ts";
import type {NodeType} from "./nodeTypes.ts";

export const useEditStore = defineStore('editStore', {
    state: ()=>({
        article: null as string,
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
        getCurrentPage:(state) => {},
        getCurrentPageItem: (state) => {},
    },
    actions: {
        addNode(node: NodeType) {
            this.nodes.push(node);
        },
        deleteNode(node: NodeType) {
            this.nodes.splice(this.nodes.indexOf(node), 1);
        },
        updateNode(old_node: Node, new_node:Node) {
            const ind = this.nodes.findIndex(x => old_node.name === x.name)
            this.nodes[ind] = new_node;
        },
        getArticleTitle(){
            return this.article
        },
        setArticleTitle(article){
            this.article = article
        },
        openGraphEditor(){
            this.editGraph = true
        },
        closeGraphEditor(){
            this.editGraph = false
        },
        openFileList(){
            this.fileList = true
        },
        closeFileList(){
            this.fileList = false
        },
        getSequence(){
            return this.sequence
        },
        setSequence(sequence){
            this.sequence = sequence
        },
        getAllFileInfoList():FileInfo[]{
            axios.get("/api/text/articletitles").then(res=>{
                this.fileinfos = res.data
                return this.fileinfos
            })
        },
        setPDFPreviewUrl(url:string){
            this.pdfPreviewUrl = url
        },
        getPDFPreviewUrl:()=>{
            return this.pdfPreviewUrl
        },
        setRects(rects:Rectangle[]){
            this.rects = rects
        },
        getRects(){
            return this.rects
        },
        getAllNodeTypes(){
            localStorage.removeItem('nodeTypes');
            const node_types: NodeType[] = [];
            axios.get("/api/graph/getAllNodeType").then((res) => {
                res.data.forEach(item => {
                    node_types.push({id: item.id, name: item.name, color: item.color} as NodeType);
                })
                this.nodeTypes = node_types;
                localStorage.setItem('nodeTypes', JSON.stringify(node_types));
                return node_types;
            })
        },
        addNodeType(type:NodeType){
            axios.post("/api/graph/addNodeType",
                {name: type.name, color: type.color})
                .then((res) => {
                    return res.data;
                })
        }
    }


})