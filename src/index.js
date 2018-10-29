import Vue from "vue";
import Buefy from "buefy";
import App from "./app.vue";

import "buefy/dist/buefy.css";
import "@fortawesome/fontawesome-free/css/all.css";

Vue.use(Buefy);

new Vue({
  el: "#app",
  render: h => h(App)
});
