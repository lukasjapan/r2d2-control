<template>
    <div>
        <div>{{ path }}</div>
        <table class="table">
            <thead>
                <th></th>
                <th>Name</th>
                <th></th>
            </thead>
            <tbody>
                <tr v-if="path != '/'">
                    <td><b-icon pack="fas" icon="folder"/></td>
                    <td><a @click="showPath(upperPath(path))">..</a></td>
                    <td></td>
                </tr>
                <tr v-for="(stat, file) in files" :key="file">
                    <td>
                        <b-icon v-if="stat.isFile" pack="fas" icon="file"/>
                        <b-icon v-if="stat.isDirectory" pack="fas" icon="folder"/>
                    </td>
                    <td width="100%">
                        <a v-if="stat.isFile" :href="endpoint + 'files' + path + file" target="_blank">{{ file }}</a>
                        <a v-if="stat.isDirectory" @click="showPath(path + file + '/')">{{ file }}</a>
                    </td>
                    <td>
                        <button @click="play(path + file)" class="button is-info" :disabled="es != null || stat.isFile == false">
                            <b-icon pack="fas" icon="play"/>
                            <span>Play</span>
                        </button>
                    </td>
                </tr>
                <tr v-if="Object.keys(files).length > 1">
                    <td colspan="3"  class="has-text-right">
                        <button @click="cancelPlay" class="button is-danger" :disabled="es == null">Cancel</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="box logging" ref="log">
            <div v-if="log.length == 0" class="has-text-gray">&lt;No output&gt;</div>
            <template v-for="(entry, i) in log">
                <div :key="i" v-if="entry.stdout" class="has-text-dark">{{ entry.stdout }}</div>
                <div :key="i" v-if="entry.stderr" class="has-text-danger">{{ entry.stderr }}</div>
            </template>
        </div>
    </div>
</template>
<style scoped>
.logging {
  overflow-y: auto;
  max-height: 200px;
}
</style>
<script>
import axios from "axios";
import p from "path";

export default {
  props: { endpoint: String, initialPath: { type: String, default: "/" } },
  data() {
    return { path: this.initialPath, files: {}, log: [], es: null };
  },
  mounted() {
    this.showPath(this.initialPath);
  },
  methods: {
    showPath(path) {
      axios
        .get(this.endpoint + "files" + path)
        .then(res => {
          this.path = path;
          this.files = res.data;
        })
        .catch(this.error);
    },
    upperPath(path) {
      return (p.resolve(path + "..") + "/").replace("//", "/");
    },
    play(file) {
      if (this.es) {
        this.error({ message: "Already playing, please cancel first." });
        return;
      }
      this.log = [];
      var wasOpened = false;

      this.es = new EventSource(this.endpoint + "play?file=" + file);
      this.es.onopen = () => {
        wasOpened = true;
      };
      this.es.onerror = () => {
        if (wasOpened) {
          // why doesn't the error object give more information?
          // anyway, if already opened, expect end of playing.
          this.es.close();
        } else {
          this.error({
            message:
              "Problem with EventSource. " +
              "Is the API server up and configured?"
          });
        }
        this.es = null;
      };
      this.es.onmessage = message => {
        const data = JSON.parse(message.data);
        if (this.log.length > 500) this.log = this.log.slice(1);
        this.log.push(data);
        setTimeout(this.scrollDown, 0);
      };
    },
    cancelPlay() {
      if (!this.es) return;
      this.es.close();
      this.es = null;
      this.log = [];
    },
    scrollDown() {
      this.$refs.log.scrollTop = this.$refs.log.scrollHeight;
    },
    error(e) {
      this.$snackbar.open({
        message: e.message,
        type: "is-warning",
        position: "is-top"
      });
    }
  }
};
</script>

