<template>
  <v-app id="drag-and-drop-zone">
    <v-tabs
      v-model="currentTab"
      show-arrows
      hide-slider
    >
      <v-tab
        v-for="(tab, i) in tabs"
        :key="tab.id"
        :title="tab.filePath"
        :href="'#tab' + tab.id"
      >
        {{ tab.fileName }}

        <v-btn
          v-show="showCloseButton()"
          text
          icon
          @click.stop.prevent="closeTab(i)"
        >
          <v-icon small>
            mdi-close
          </v-icon>
        </v-btn>
      </v-tab>

      <v-btn
        v-if="this.tabs.length < 5"
        text
        icon
        @click="newTab"
      >
        <v-icon small>
          mdi-plus
        </v-icon>
      </v-btn>
      <v-spacer />
      <v-switch
        v-model="$vuetify.theme.dark"
        class="switch-theme"
        hide-details
        small
      >
        <template #label>
          <v-icon
            v-if="$vuetify.theme.dark"
            small
          >
            mdi-theme-light-dark
          </v-icon>
          <v-icon
            v-else
            small
          >
            mdi-theme-light-dark
          </v-icon>
        </template>
      </v-switch>
    </v-tabs>

    <v-tabs-items v-model="currentTab">
      <v-tab-item
        v-for="tab in tabs"
        :key="tab.id"
        :value="'tab' + tab.id"
      >
        <file-chooser
          v-if="!tab.filePath"
          @change="onFileChanged($event, tab)"
        />
		
        <file-viewer 
          v-if="tab.filePath" 
          ref="fileViewer" 
          :file="tab.filePath" 
          :file-settings="tab.fileSettings"
          @fileNotFoundError="fileNotFoundErrorHandler"
          @errorHandler="errorMessage"
        />
      </v-tab-item>
    </v-tabs-items>

    <message-dialog 
      :show="showMessageDialog" 
      :severity="'error'" 
      :title="messageDialogTitle" 
      :message="messageDialogMessage"
      @close="closeMessageDialog"
    />
  </v-app>
</template>

<script>
	const Tab = require("./tab");
	const remote = window.electron.remote;
	const fs = window.node.fs;
	const FileSettings = require("./fileSettings");
	const UserPreferences = require("./userPreferences");
	const OpenNewFileCommand = require("./commands/openNewFileCommand");
	const FileChooser = require("./components/FileChooser").default;
	const FileViewer = require("./components/FileViewer").default;
	const MessageDialog = require("./components/MessageDialog").default;

	let userPreferences = new UserPreferences();

	export default {
		components: {
			FileChooser, 
			FileViewer, 
			MessageDialog
		},
		data() {
			return {
				tabs: [],
				currentTab: null,
				showMessageDialog: false,
				messageDialogTitle: '',
				messageDialogMessage: ''
			}
		},
		mounted: function() {
			this.$vuetify.theme.dark = true
			userPreferences.getFiles().forEach(file => {
				if (fs.existsSync(file.path)) {
					let tab = new Tab(file.name, file.path, FileSettings.createFromSettings(file.settings));

					this.tabs.push(tab);
				}
				else {
					userPreferences.removeFile(file.path);
				}
			});

			if (remote.getGlobal('arguments').file) {
				const file = remote.getGlobal('arguments').file;
				try {
					new OpenNewFileCommand(
						file, 
						this.tabs, 
						userPreferences
					)
					.execute();
				}
				catch(error) {
					this.showFileNotFoundMessageDialog(file);
				}
			}
			
			if (this.tabs.length === 0) {
				this.tabs.push(new Tab(this.$t("new-file")));
			}
		},
		methods: {
			newTab() {
				if(this.tabs.length < 5) {
					this.tabs.push(new Tab(this.$t("new-file")));
				}
			},
			closeTab(index) {
				userPreferences.removeFile(this.tabs[index].filePath);

				this.tabs.splice(index, 1);
			},
			showCloseButton() {
				return this.tabs.length > 1
			},
			onFileChanged(event, tab) {
				if (event.target.files.length > 0) {
					const selectedFileName = event.target.files[0].name;
					const selectedFilePath = event.target.files[0].path;
					const fileSettings = new FileSettings();

					tab.setFileName(selectedFileName);
					tab.setFilePath(selectedFilePath);
					tab.setFileSettings(fileSettings);

					userPreferences.addFile(selectedFileName, selectedFilePath, fileSettings);
				}
			},
			fileNotFoundErrorHandler(event) {
				this.showFileNotFoundMessageDialog(event.file);
			},
			showFileNotFoundMessageDialog(file) {
				this.showMessageDialog = true;
				this.messageDialogTitle = this.$i18n.t("warning");
				this.messageDialogMessage = this.$i18n.t("file-no-exists", {filename: file});
			},
			closeMessageDialog() {
				this.showMessageDialog = false;
			},
			errorMessage(event) {
				this.showMessageDialog = true;
				this.messageDialogTitle = this.$i18n.t("warning");
				this.messageDialogMessage = event.message 
			}
		}
	}
</script>

<style>
.v-tabs  {
	flex: none;	
}

.v-tabs-bar__content {
	display: flex;
	align-items: center;
}

.switch-theme {
	margin-top: 0;
	padding-top: 0;
	margin-right: 15px;
}
</style>