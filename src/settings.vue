<template>
    <div>
        <h2>Files</h2>
        <table class="table" width="100%">
            <thead>
                <tr>
                    <th>File Extension</th>
                    <th>Value</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(command, extension) in settings.fileMappings" :key="extension">
                    <td>{{ extension }}</td>
                    <td width="75%"><b-input v-model="settings.fileMappings[extension]"></b-input></td>
                    <td class="has-text-centered"><button @click="removeExtension(extension)" class="button is-danger">Delete</button></td>
                </tr>
                <tr>
                    <td><b-input v-model="newExtension"></b-input></td>
                    <td><b-input v-model="newCommand"></b-input></td>
                    <td class="has-text-centered"><button @click="addExtension" class="button is-success">Add</button></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<script>
import axios from "axios";

export default {
  props: ["endpoint"],
  data() {
    return {
      settings: { fileMappings: [] },
      newExtension: "",
      newCommand: ""
    };
  },
  mounted() {
    this.syncSettings();
  },
  methods: {
    syncSettings() {
      axios
        .get(this.endpoint + "settings")
        .then(res => {
          this.settings = res.data.result;
        })
        .catch(this.error);
    },
    addExtension() {
      this.settings.fileMappings[this.newExtension] = this.newCommand;
      this.saveSettings();
    },
    removeExtension(extension) {
      this.settings.fileMappings[extension] = undefined;
      this.saveSettings();
    },
    saveSettings() {
      axios
        .put(this.endpoint + "settings", this.settings)
        .then(res => {
          this.settings = res.data.result;
        })
        .catch(this.error);
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

