import Vue from "vue";
import VueRouter from "vue-router";
import Cloud_YAML from "../views/Cloud_YAML.vue";

Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: '/Cloud_YAML' },
  {
    path: "/Cloud_YAML",
    name: "Cloud_YAML",
    component: Cloud_YAML
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
});

export default router;
