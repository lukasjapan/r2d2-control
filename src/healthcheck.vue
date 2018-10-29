<template>
    <div>
        <div v-if="online === null" class="tag is-large is-warning">
            <b-icon
                pack="fas"
                icon="sync-alt"
                custom-class="fa-spin">
            </b-icon>
            <span>Checking</span>
        </div>
        <div v-if="online === true" class="tag is-large is-success">
            <b-icon
                pack="fas"
                icon="check">
            </b-icon>
            <span>Online</span>
        </div>
        <div v-if="online === false" class="tag is-large is-danger">
            <b-icon
                pack="fas"
                icon="exclamation-triangle">
            </b-icon>
            <span>Offline</span>
        </div>
    </div>
</template>
<script>
import axios from "axios";

export default {
  props: ["endpoint"],
  data() {
    return {
      online: null
    };
  },
  mounted() {
    this.updateStatus();
  },
  methods: {
    updateStatus() {
      axios
        .get(this.endpoint + "health-check", {
          timeout: 1000
        })
        .then(res => {
          this.online = true;
        })
        .catch(err => {
          this.online = false;
        })
        .finally(() => {
          setTimeout(this.updateStatus, 5000);
        });
    }
  }
};
</script>

