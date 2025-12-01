import {defineStore} from 'pinia'
import type {Node} from "../types/node.ts";
import type {Edge} from "../types/edges.ts"

export const GraphStore = defineStore('graph', {
    state: ()=>({
        article: null as string,
        sequence: null as string,

    }),
    getters: {

    },
    actions: {

    }

})