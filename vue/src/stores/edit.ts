import {defineStore} from 'pinia'

export const useEditStore = defineStore('editStore', {
    state: ()=>({
        article: null as string,
        sequence: null as string,
        nodes: [] as Node,
        edges: [] as Edge,
        editGraph: false,
    }),

    getters: {

    },
    actions: {
        openGraphEditor(){
            this.editGraph = true
        },
        closeGraphEditor(){
            this.editGraph = false
        },
        getSequence(){
            return this.sequence
        },
        setSequence(sequence){
            this.sequence = sequence
        }
    }


})