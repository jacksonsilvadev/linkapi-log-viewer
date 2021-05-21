<template>
  <v-navigation-drawer
      v-model="drawer"
      absolute
      @input="changedDrawer"
			right
			:width="jsonActive ? '1000':'650'"
			class="logger-viewer"
      temporary
    >
      <v-card
					class="mx-auto"
					elevation="0"
				>
					<v-card-title
						class="sidebar-gradient white--text"
					>
						<span class="title">Log - {{ itemSelected.uniqueKey }}</span>
			      <v-spacer></v-spacer>
            <v-icon @click="drawer = false" class="white--text">mdi-close</v-icon>

					</v-card-title>
					<v-card-text class="py-0">
						<v-row>
							<v-col>
								<v-timeline dense class="timeline max-min-height-timeline">
									<v-timeline-item v-for="(item, index) in itemSelected.items" :key="item.uniqueKey + item.timestamp + index"
										fill-dot
										small 
										@click.native.stop="selectJsonView(item.data, index)"
									>
										<template v-slot:icon>
											<div class="content-log" :class="item.status.toLowerCase() + '-background'">
												{{ formatDate(item.timestamp) }} 
											</div>
										</template>
                    <v-card class="log-text">
										  {{item.name}}
                      <v-spacer></v-spacer>
                      <v-icon v-if="index === activeIndex" small :class="item.status.toLowerCase() + '-text'">mdi-checkbox-blank-circle</v-icon>
                    </v-card>
									</v-timeline-item>
								</v-timeline>
							</v-col>
							<v-col v-if="jsonActive">
								<json-viewer class=".max-min-height-timeline" :value="jsonValue" copyable boxed expanded></json-viewer>
							</v-col>
						</v-row>
					</v-card-text>
				</v-card>
    </v-navigation-drawer>
</template>

<script>
import { parseISO } from 'date-fns'; 
import { format } from 'date-fns-tz';

export default {
  props: ['itemSelected'],
  data() {
    return {
      jsonActive: false,
      jsonValue: '',
      drawer: false,
      activeIndex: null
    }
  },
  methods: {
    formatDate(date) {
      const parsedDate = parseISO(date);
      return format(parsedDate, 'dd/MM/yyyy HH:mm:ss', {
        timeZone: 'America/Sao_Paulo',
      });
    },
    selectJsonView(data, index) {
      this.jsonValue = data || 'null'
      this.activeIndex = index
      this.jsonActive = true
    },
    active(){
      this.drawer = true
      this.jsonValue = ''
      this.activeIndex = null
      this.jsonActive = false
    },
    changedDrawer(value){
      if(!value) {
        this.jsonValue = ''
        this.activeIndex = null
        this.jsonActive = false
      }
    }
  }
}
</script>

<style>
.content-log {
	width: 100px;
	display: flex;
	align-items: center;
	justify-content: center;
	text-align: center;
	color: #fff;
	position: relative;
	padding: 10px;
	border-radius: 3px;
}

.log-text {
  padding: 20px;
  display: flex;
}

.timeline {
  overflow: auto;
}

.timeline .v-timeline-item {
	cursor: pointer
}

.timeline  .v-timeline-item__body {
	margin-left: 15px;
}
.jv-code.open.boxed {
  max-height: 77vh !important;
}
</style>