import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";

import ArcoVue from "@arco-design/web-vue";
import "@arco-design/web-vue/dist/arco.css";
import ArcoVueIcon from "@arco-design/web-vue/es/icon";
import './assets/style/pdf.css';

// 导入字体图标
import "./assets/iconfont/iconfont.css";
const app = createApp(App);
app.use(ArcoVue).use(ArcoVueIcon).use(router).mount("#app");
