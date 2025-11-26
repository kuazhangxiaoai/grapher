import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import ArcoVue from "@arco-design/web-vue";
import "@arco-design/web-vue/dist/arco.css";
import ArcoVueIcon from "@arco-design/web-vue/es/icon";

// 导入字体图标
import "./assets/iconfont/iconfont.css";
createApp(App).use(ArcoVue).use(ArcoVueIcon).mount("#app");
