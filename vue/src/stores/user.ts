import { defineStore } from 'pinia'
import axios from "axios";
import {Message} from "@arco-design/web-vue";
import type {User} from "@/types/user.ts"
import type {Project} from "@/types/project.ts"

export const useUserStore = defineStore('userStore', {
  state: () => ({
    user: null as User,
    project: null as Project,
    projects: [] as Project[],
  }),
  getters: {
    isLoggedIn: (state)=>{
      return !!state.user
    },
  },
  actions: {
    initUser() {
      const storedUser = localStorage.getItem('grapher-user')
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }
    },

    login(user: User) {
      axios.post("/api/user/login", {
        username: user.username,
        password: user.password,
      }).then(res => {
        this.user = user;
        localStorage.setItem('grapher-user', JSON.stringify(user));
      }).catch(err => {
        Message.error("用户名或密码错误")
      })
    },

    logout() {
      this.user = null;
      localStorage.removeItem('grapher-user');
    },

    getProjectList(username: string) {
      axios.get("/api/user/getProjectList", {
        params: {username: username}
      }).then(res => {
        let project_list = []
        res.data.forEach(project => {
          project_list.push({
            id: project.id,
            name: project.project_name,
            descript: project.descript,
            graph_db: project.graph_db,
            createTime: project.create_time,
          } as Project);
        })
        this.projects = project_list;
      })
    },

    createProject(project: Project, username: string) {
      axios.post("/api/user/createProject", {
        id: 9999,
        project_name: project.name,
        username: username,
        graph_db: project.graph_db,
        descript: project.descript,
      }).then(res => {
        this.getProjectList(username)
      })
    },

    deleteProject(project: Project, username: string) {
      axios.post("/api/user/deleteProject", {
        id: project.id,
        project_name: project.name,
        username: username,
        graph_db: project.graph_db,
        descript: project.descript,
      }).then(res => {
        this.getProjectList(username)
      })
    },

    getProjectByName(name: string) {
      const project = this.projects.find((project) => project.name === name);
      return project;
    }
  }
})
