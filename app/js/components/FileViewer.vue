<template>
  <div>
    <v-divider />
    <v-toolbar :height="toolbarHeight">
      <v-col cols="4">
        <v-text-field
          v-model="filter.uniqueKey"
          label="UniqueKey"
          clearable
          hide-details
        />
      </v-col>
      <v-col cols="2">
        <v-checkbox
          v-model="filter.partial"
          hide-details
          label="Partial"
        />
      </v-col>
      <v-col cols="4">
        <v-select
          v-model="filter.status"
          :items="[
            'SUCCESS',
            'ERROR',
            'PENDING',
            'NORESULTS',
            'REJECTED',
            'ALERT',
          ]"
          hide-details
          clearable
          label="Status"
        />
      </v-col>
      <v-spacer />

      <v-btn
        :disabled="loadingRefresh"
        text
        icon
        :loading="loading"
        color="grey darken-1"
        @click="settingsButtonClicked"
      >
        <v-icon
          style="font-size: 24px"
          class="refresh-icon"
        >
          mdi-refresh
        </v-icon>
      </v-btn>
    </v-toolbar>
    <v-divider />
    <v-data-table
      :headers="headers"
      height="70vh"
      :items="logsSort"
      disable-pagination
      :loading="loading"
      loading-text="Reading file wait please"
      fixed-header
      hide-default-footer
      class="log-table"
    >
      <template #[`item.buttons`]="{ item }">
        <v-icon @click="showLog(item)">
          mdi-eye
        </v-icon>
      </template>

      <template #[`item.status`]="{ item }">
        <span
          class="capitalize"
          :class="item.status.toLowerCase() + '-text'"
        >{{
          item.status.toLowerCase()
        }}</span>
      </template>
    </v-data-table>
    <sidebar-viewer
      ref="sidebar-viewer"
      :item-selected="itemSelected"
    />
  </div>
</template>

<script>
import SidebarViewer from "../components/SidebarViewer";


const LogFile = require("../file");

export default {
  components: {
    SidebarViewer,
  },
  props: ["file", "fileSettings"],
  data() {
    return {
      drawer: false,
      itemSelected: {},
      jsonValue: "",
      reader: null,
      jsonActive: false,
      loading: false,
      loadingRefresh: false,
      headers: [
        {
          text: "Status",
          sortable: false,
          value: "status",
        },
        { text: "Time", sortable: false, class: "table-header", value: "time" },
        {
          text: "UniqueKey",
          sortable: false,
          class: "table-header",
          value: "uniqueKey",
        },
        { text: "", sortable: false, value: "buttons" },
      ],
      filter: {
        status: null,
        uniqueKey: null,
      },
      toolbarHeight: 100,
      currentFileSettings: this.fileSettings,
      logs: [],
      logsSort: [],
    };
  },
  watch: {
    filter: {
      deep: true,
      handler(value) {
        const { uniqueKey, status, partial } = value;
        if (!uniqueKey && !status) {
          this.logsSort = this.logs;
          return;
        }

        const statusUpper = status ? status.toUpperCase() : null;
        const uniqueKeyUpper = uniqueKey ? uniqueKey.toUpperCase() : null;

        this.logsSort = this.logs.filter((l) => {
          const logStatus = l.status.toUpperCase();
          const logUniqueKey = l.uniqueKey.toUpperCase();

          if (uniqueKey && !status) {
            return partial
              ? logUniqueKey.includes(uniqueKeyUpper)
              : uniqueKeyUpper === logUniqueKey;
          } else if (status && !uniqueKey) {
            return logStatus === statusUpper;
          } else if (status && uniqueKey) {
            return (
              logStatus === statusUpper &&
              (partial
                ? logUniqueKey.includes(uniqueKeyUpper)
                : uniqueKeyUpper === logUniqueKey)
            );
          }

        });
      },
    },
  },
  mounted: function() {
    window.addEventListener("resize", this.handleResize);

    this.startReader();
  },
  beforeDestroy: function() {
    window.removeEventListener("resize", this.handleResize);
  },
  methods: {
    async settingsButtonClicked() {
      this.loadingRefresh = true

      await this.startReader();

      setTimeout(() => this.loadingRefresh = false , 5000)
    },
    showLog(item) {
      this.itemSelected = item;
      this.$refs["sidebar-viewer"].active();
    },
    async startReader() {
      try {
        this.loading = true;
        console.time('reader')
        this.reader = new LogFile(this.file, 1000);
  
        const { success, data, code } = await this.reader.start();
        if(!success) {
          if(code === 'ext') {
            this.$emit('errorHandler', { message: this.$i18n.t("ext-not-accept", {ext: data}) })
            return;
          }
        }
        this.logs = data;
        this.logsSort = data;
        
      } catch (error) {
        this.$emit('errorHandler', { message: this.$i18n.t("error", {stack: error}) })
      } finally {
        console.timeEnd('reader')
        this.loading = false;
      }
    },
  },
};
</script>

<style>
.log-table th {
  font-weight: 800;
  color: #000 !important;
  font-size: 0.9rem !important;
}
</style>
