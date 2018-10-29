<template>
<div class="container">
  <div class="hero-body">
        <div class="columns">
            <div class="column is-one-fifth">
                <img src="./img/r2d2.png" width="64" height="64">
            </div>
            <div class="column">
                <h1 class="title">
                    The R2-D2 Control Panel
                </h1>
                <h2 class="subtitle">
                    Help me, Obi-Wan Kenobi. You’re my only hope.
                </h2>
            </div>
            <div class="column is-one-fifth has-text-right">
                <healthcheck :endpoint="endpoint" />
            </div>
        </div>
        <b-tabs v-model="activeTab">
            <b-tab-item label="Files" :disabled="needAuthorization">
                <files  :endpoint="endpoint"/>
            </b-tab-item>

            <b-tab-item label="Settings" :disabled="needAuthorization">
                <settings :endpoint="endpoint" />
            </b-tab-item>

            <b-tab-item :visible="needAuthorization" label="Authorize">
                Authorization thingy here.
            </b-tab-item>
        </b-tabs>
  </div>
</div>
</template> 
<script>
import files from "./files.vue";
import healthcheck from "./healthcheck.vue";
import settings from "./settings.vue";

export default {
  data() {
    return {
      endpoint: "http://localhost:3000/",
      needAuthorization: false,
      activeTab: 0
    };
  },
  components: { files, healthcheck, settings }
};
</script>
