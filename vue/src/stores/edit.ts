import {defineStore} from 'pinia'
import type {FileInfo} from "../types/text.ts";
import axios from "axios";

export const useEditStore = defineStore('editStore', {
    state: ()=>({
        article: null as string,
        sequence: null as string,
        nodes: [] as Node,
        edges: [] as Edge,
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
        }
    }


})