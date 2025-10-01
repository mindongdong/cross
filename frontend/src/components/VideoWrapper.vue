<template>
  <div class="modal-wrapper" @keydown.space.prevent="videoPlay">
    <div class="info-header" @mouseover="hideTooltip">
      <div class="components_control">
        <!-- <img
          class="icon"
          src="@/assets/icons/list.png"
          @click="toggleComponentsList"
        /> -->
        <ul class="components_list" :class="{ show: isComponentsListVisible }">
          <li
            v-for="(item, idx) in Object.keys(componentList)"
            :key="idx"
            @click="toggleComponent(item)"
          >
            {{ item }}
          </li>
        </ul>
      </div>
      <div class="video-tools__column">
        <img
          class="icon"
          ref="videoChange"
          v-bind:class="{ icon_on: videoStatus.name !== 'default' }"
          v-for="(videoStatus, idx) in videoStatusList"
          :key="idx"
          v-if="videoStatus.status"
          :src="require(`@/assets/icons/${videoStatus.name}.png`)"
          @click="setupPlayer(videoStatus.name)"
        />
        <img
          v-bind:class="{ icon_on: this.$store.getters.getToggleList['mute'] }"
          class="icon"
          src="@/assets/icons/sound.png"
          @click="volumeControl"
        />
        <img
          v-bind:class="{ icon_on: this.$store.getters.getToggleList['info'] }"
          class="icon"
          src="@/assets/icons/showinfo.png"
          @click="toggleManage('info')"
        />
        <img
          v-bind="{
            class: { icon_on: this.$store.getters.getToggleList['components'] },
          }"
          class="icon"
          src="@/assets/icons/components2.png"
          @click="toggleComponentsList()"
        />
      </div>
      <div v-if="volumeBarVisible" class="volume-bar">
        <input
          type="range"
          min="0"
          max="100"
          v-model="volume"
          @input="setVolume(volume)"
        />
      </div>
    </div>
    <div class="modal-content" @mouseover="hideTooltip"></div>
    <div class="video-control">
      <!-- <button @click="videoPlay">{{ playToggle ? false : true }}</button> -->
      <input
        type="range"
        min="0"
        :max="100"
        v-model="percent"
        @input="seekTime"
        @mousemove="updateTooltip"
        @mouseleave="startHideTooltip"
        :style="rangeStyle"
        class="video-control__range"
      />
      <div
        v-if="showTooltip"
        :style="{ left: `${mouseX}px` }"
        class="time-tooltip"
      >
        {{ tooltipTime }}
      </div>
    </div>
  </div>
</template>

<script>
import Hls from "hls.js";
import { mapGetters, mapMutations } from "vuex";
export default {
  name: "VideoWrapper",
  props: {
    currentTime: {
      type: Number,
      default: 0.0,
    },
    totalTime: {
      type: Number,
      default: 0.0,
    },
  },
  data() {
    return {
      playToggle: true,
      sourceToggle: false,
      currentData: 0,
      percent: 0,
      videoSource_default_m3u8: "http://localhost:3000/video/video.m3u8",
      videoSource_voronoi_m3u8:
        "http://localhost:3000/video/video_voronoi.m3u8",
      videoSource_pass_m3u8: "http://localhost:3000/video/video_passroot.m3u8",
      showTooltip: false,
      tooltipTime: "",
      tooltipStyle: {},
      mouseX: 0,
      tooltipHideTimeout: null,
      isComponentsListVisible: false,
      componentList: {
        "능력치 비교": "PlayerStats",
        "실시간 기록": "MatchStats",
        "공격 시퀀스": "AttackSeq",
        "슈팅 데이터": "ShotStats",
      },
      hls: null,
      videoStatusList: [
        {
          name: "default",
          status: true,
        },
        {
          name: "voronoi",
          status: false,
        },
        {
          name: "pass",
          status: false,
        },
      ],
      volumeBarVisible: false,
      volume: 50,
    };
  },
  computed: {
    rangeStyle() {
      let progress = this.percent;
      let color1 = "#FFFFFF"; // color for the completed part
      let color2 = "#00000077"; // color for the uncompleted part
      return `background: linear-gradient(90deg, ${color1} ${progress}%, ${color2} ${progress}%);`;
    },
    ...mapGetters(["getComponents", "getUnactivateComponents"]),
    components: {
      get() {
        return this.getComponents;
      },
      set(value) {
        this.updateComponents(value);
      },
    },
    unactivate_components: {
      get() {
        return this.getUnactivateComponents;
      },
      set(value) {
        this.updateUnactivateComponents(value);
      },
    },
  },
  watch: {
    currentTime(newTime) {
      this.percent = (newTime / this.totalTime) * 100;
    },
    totalTime(newTotal) {
      this.percent = (this.currentTime / newTotal) * 100;
    },
  },
  methods: {
    ...mapMutations(["updateComponents", "updateUnactivateComponents"]),
    toggleComponent(itemTitle) {
      let found = false;

      // Search for the item in active components
      for (let component of this.components) {
        const index = component.items.findIndex(
          (item) => item.title === this.componentList[itemTitle]
        );
        if (index !== -1) {
          const [item] = component.items.splice(index, 1);
          this.unactivate_components.push(item);
          found = true;
          break;
        }
      }

      // If not found in active components, search in inactive components
      if (!found) {
        const index = this.unactivate_components.findIndex(
          (item) => item.title === this.componentList[itemTitle]
        );
        if (index !== -1) {
          const [item] = this.unactivate_components.splice(index, 1);

          // Move to the items in items with index 1 or 2
          const targetComponent = this.components.find(
            (component) => component.items.length < 2
          );

          if (targetComponent) {
            targetComponent.items.push(item);
          }
        }
      }

      this.updateComponents(this.components);
      this.updateUnactivateComponents(this.unactivate_components);
    },
    toggleManage(icon) {
      this.$store.commit("setToggleList", icon);
      console.log(this.$store.getters.getToggleList);
    },
    toggleComponentsList() {
      this.isComponentsListVisible = !this.isComponentsListVisible;
      console.log(this.isComponentsListVisible);
    },
    seekTime() {
      const video = this.$store.getters.getCurrentVideo;
      const seekto = video.duration * (this.percent / 100);
      video.currentTime = seekto;
      video.play();
    },
    updateTooltip(event) {
      clearTimeout(this.tooltipHideTimeout); // clear the hide tooltip timer
      const video = this.$store.getters.getCurrentVideo;
      const percent = (event.offsetX / event.target.offsetWidth) * 100;
      const time = video.duration * (percent / 100);
      let hours = Math.floor(time / 3600);
      let minutes = Math.floor((time / 60) % 60);
      let seconds = Math.floor(time % 60);
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      if (hours < 10) {
        hours = "0" + hours;
      }
      this.mouseX =
        event.clientX - event.target.getBoundingClientRect().left + 10;
      this.tooltipTime = `${hours}:${minutes}:${seconds}`;
      this.tooltipStyle = {
        left: `${event.pageX}px`,
      };
      this.showTooltip = true;
    },
    startHideTooltip() {
      this.tooltipHideTimeout = setTimeout(this.hideTooltip, 100); // start the hide tooltip timer
    },
    hideTooltip() {
      this.showTooltip = false;
    },
    videoPlay() {
      const video = this.$store.getters.getCurrentVideo;
      this.playToggle = !this.playToggle;
      // console.log(video.paused, this.playToggle);

      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    },
    volumeControl() {
      this.volumeBarVisible = !this.volumeBarVisible;
      this.toggleManage("mute");
    },
    setVolume(volume) {
      this.volume = volume;
      const video = this.$store.getters.getCurrentVideo;
      video.volume = volume / 100;
    },
    setupPlayer(name) {
      this.videoStatusList.forEach((videoStatus, idx) => {
        if (videoStatus.name === name) {
          videoStatus.status = false;
          // 다음 아이템의 status를 true로 바꾸기, 만약 마지막이면 첫번째 아이템으로
          if (idx === this.videoStatusList.length - 1) {
            this.videoStatusList[0].status = true;
          } else {
            this.videoStatusList[idx + 1].status = true;
          }
        }
      });
      const video = this.$store.getters.getCurrentVideo;
      const currentFrame = this.$store.getters.getCurrentFrame;
      console.log(video.webkitDecodedFrameCount, currentFrame);
      // this.$store.commit(
      //   "setCurrentFrame",
      //   video.webkitDecodedFrameCount + currentFrame,
      // );
      // 인터벌 멈추고
      clearInterval(this.$store.getters.getCurrentInterval);

      const nextVideoName = this.videoStatusList.find(
        (videoStatus) => videoStatus.status
      ).name;

      if (Hls.isSupported()) {
        if (this.hls) {
          this.hls.destroy();
        }
        this.hls = new Hls();
        this.hls.loadSource(this[`videoSource_${nextVideoName}_m3u8`]);
        this.hls.attachMedia(video);
        this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play();
        });
      }

      video.currentTime = this.$store.getters.getCurrentTime;
    },
    changeClick() {
      this.$refs.videoChange[0].click();
    },
  },
};
</script>

<style scoped>
img {
  object-fit: contain;
  user-drag: none;
  -webkit-user-drag: none;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}
div {
  box-sizing: border-box;
  color: white;
}
.modal-wrapper {
  width: 100%;
  height: calc(100% - 1rem);
  position: absolute;
  left: 0;
  top: 0;
  z-index: 9997;
}
.left {
  left: 0;
}
.right {
  right: 0;
}
/* 상단 모달 설정 */
.info-header {
  position: relative;
  width: 100%;
  height: 20%;
}
/* 메인으로 나가는 버튼 */
.exit-button {
  cursor: pointer;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  left: 1rem;
  top: 2rem;
  width: 30px;
  height: 30px;
  border-radius: 15px;
  background: rgba(0, 0, 0, 0.6);
}
.exit-button:after {
  position: relative;
  top: 2px;
  content: "\00d7";
  font-size: 30px;
  font-weight: 100;
  color: white;
}

.components_control {
  cursor: pointer;
  position: absolute;
  top: 3rem;
  left: calc(50% + 2.2rem);
  width: 10rem;
  display: flex;
  align-items: center;
  z-index: 9999;
}

.components_list {
  top: 1.4rem;
  width: 6rem;
  height: 9rem;
  display: none;
  align-items: center;
  justify-content: space-between;
  font-size: 1.1rem;
  font-weight: 400;
  position: absolute;
  /* text-decoration: underline; */

  /* left: 2.5rem; */
  padding: 0.8rem;
  flex-direction: column;
  background: rgba(0, 0, 0, 0.5);
  /* box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.7); */
  box-shadow: 0px 2px 8px -1px rgba(0, 0, 0, 1);
  backdrop-filter: blur(10px);
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.components_list.show {
  display: flex;
}
.components_list--li:hover {
  font-size: 1.11rem;
}

/* 승률 모달 */
.match-winrate {
  width: 400px;
  height: 81px;
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  padding: 10px;
  border-radius: 1rem;
}
.match-info {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}
.match-info span {
  color: white;
  font-size: 1rem;
}
.match-info span:nth-child(3) {
  position: absolute;
  left: 5px;
  font-size: 0.8rem;
}
.match-info span:nth-child(4) {
  position: absolute;
  right: 5px;
  font-size: 0.8rem;
}
.match-info img {
  width: 15px;
  height: 15px;
  margin: 0 10px;
  object-fit: contain;
}
.progress-bar__container {
  width: 100%;
  height: 2rem;
  border-radius: 2rem;
  overflow: hidden;
  transition: all 0.5s;
  will-change: transform;
  box-shadow: 0 0 5px hsla(0, 0%, 100%, 0.615);
  position: relative;
  margin-top: 10px;
}
.progress-bar {
  transition: all 0.5s;
  position: absolute;
  height: 100%;
  content: "";
  border-radius: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-family: sans-serif;
}
.progress-bar:first-child {
  width: 42%;
  background-color: #e76f51;
  left: 0;
}
.progress-bar:nth-child(2) {
  width: 58%;
  background-color: #496adf;
  right: 0;
}
/* 중앙 모달 설정 */
.modal-content {
  width: 100%;
  height: 60%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
/* 하단 비디오 컨트롤러 설정 */
.video-control {
  width: 100%;
  height: 20%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  position: relative;
}
.video-progress {
  width: 100%;
  height: 50%;
}
.video-control__range {
  width: 99%;
  height: 7px;
  -webkit-appearance: none;
  border-radius: 5px;
  margin-bottom: 2px;
  background: #ffffff;
}

.video-control__range::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 7px;
  height: 20px;
  background: #ffffff;
  /* box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.5); */
  box-shadow: 0px 2px 8px -1px rgba(0, 0, 0, 1);
  border-radius: 3px;

  transition: background 0.3s;
}
.video-control__range::-moz-range-thumb {
  -webkit-appearance: none;
  width: 7px;
  height: 20px;
  background: #ffffff;
  border-radius: 3px;
  /* box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.5); */
  box-shadow: 0px 2px 8px -1px rgba(0, 0, 0, 1);

  transition: background 0.3s;
}

.video-control__range:hover::-webkit-slider-thumb {
  background: #ffffff;
}
.video-control__range:hover::-moz-range-thumb {
  background: #ffffff;
}

/* 비디오 컨트롤 아이콘 */
.video-tools {
  width: 100%;
  height: 50%;
  position: relative;
  padding: 10px 32px;
  display: flex;
  align-items: flex-end;
}
.video-tools__column {
  position: absolute;
  top: 0.7rem;
  left: calc(50% - 8rem);
  width: 16rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 9999;
  border-radius: 1.5rem;
  /* background: rgba(67, 67, 67, 0.7); */
  background: rgba(0, 0, 0, 0.5);
  /* box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.7); */
  /* box-shadow: 0px 2px 8px -1px rgba(0, 0, 0, 1); */
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}
.video-tools__column:hover {
  /* background: rgba(0, 0, 0, 0.5); */
  box-shadow: 0px 2px 8px -1px rgba(0, 0, 0, 1);
}
.video-tools__column:first-child {
  padding-right: 10px;
  border-right: 1px solid hsla(0, 0%, 100%, 0.5);
}
.video-tools__column:nth-child(2) {
  /* margin-left: 20px; */
}
.video-tools__column:nth-child(3) {
  position: absolute;
  right: 10px;
}

.time-tooltip {
  position: absolute;
  padding: 10px 10px;
  color: white;
  background-color: rgba(5, 5, 5, 0.7);
  border-radius: 20px;
  text-align: center;
  white-space: nowrap;
  font-size: 12px;
  bottom: -2rem;
  transform: translateX(-50%);
  &:after {
    content: "";
    position: absolute;
    top: -25%;
    left: 50%;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 5px solid rgba(255, 255, 255, 0.7);
    transform: translateX(-50%);
  }
}
.timestamp {
  color: white;
  text-align: center;
  font-size: 1rem;
}
.volume-bar {
  position: absolute;
  top: 4rem;
  left: calc(50% - 6.5rem);
  width: 9rem;
  height: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  border-radius: 1.5rem;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}
.button-wrapper {
  width: 1.8rem;
  height: 1.8rem;
  /* border-radius: 10%;
  opacity: 0.5;
  cursor: pointer; */
  /* position: relative;
  margin-right: 20px; */
}
.flag {
  cursor: pointer;
  width: 30px;
  height: 20px;
  object-fit: cover;
}
.icon {
  width: 1.6rem;
  height: 1.6rem;
  opacity: 0.5;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 1.2rem;
  background: rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease; /* 애니메이션을 추가합니다. */
}
.icon-wrapper {
  width: 1.6rem;
  height: 1.6rem;
  opacity: 0.5;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 1.2rem;
  background: rgba(0, 0, 0, 0.5);
  transition: all 0.3s ease; /* 애니메이션을 추가합니다. */
}
.icon:hover {
  width: 2rem;
  height: 2rem;
  opacity: 1;
  padding: 0.2rem;
  border-radius: 1rem;
  background: rgba(33, 33, 33, 0.5);
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 1);
  object-fit: scale-down;
}
.icon_on {
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 10%;
  opacity: 1;
  cursor: pointer;
  padding: 0.4rem;
  border-radius: 1.2rem;
  background: rgba(0, 225, 255, 0.35);
  transition: all 0.3s ease; /* 애니메이션을 추가합니다. */
}
.icon_on:hover {
  opacity: 1;
  background: rgba(93, 236, 255, 0.35);
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 1);
}
.icon-large {
  width: 1.75rem;
  height: 1.75rem;
}
.icon-large2 {
  width: 2rem;
  height: 2rem;
}
.white {
  filter: invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%)
    contrast(103%);
}
.unactivate_components {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
}
</style>
