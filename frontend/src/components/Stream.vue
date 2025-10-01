<template>
  <div>
    <video
      id="my-player"
      ref="videoPlayer"
      preload="auto"
      width="100%"
      height="100%"
      data-setup="{}"
      autoplay
      @loadeddata="videoData"
      @timeupdate="timeUpdate"
      @pause="pause"
      @seeking="timeUpdate"
      @ended="videoChange"
    ></video>
  </div>
</template>

<script>
import Hls from "hls.js";

export default {
  name: "Stream",
  data() {
    return {
      videoSource_m3u8: "http://localhost:3000/video/video.m3u8",
      // videoSource_m3u8:
      //   "https://d3qay1g4np21qm.cloudfront.net/output/video_4k.m3u8",
      hls: null,
    };
  },
  mounted() {
    if (Hls.isSupported) {
      this.hls = new Hls();
      this.hls.loadSource(this.videoSource_m3u8);
      this.hls.attachMedia(this.$refs.videoPlayer);
      this.hls.on(Hls.Events.MANIFEST_PARSED, () => {
        this.$refs.videoPlayer.play();
      });
    }
  },
  beforeDestroy() {
    if (this.hls) {
      this.hls.destroy();
    }
  },
  methods: {
    videoData(ev) {
      //프레임 정상화
      // const currentFrame = this.$store.getters.getCurrentFrame;
      // const swapCount = this.$store.getters.getSwapCount;
      // console.log(ev.target.webkitDecodedFrameCount, currentFrame);
      // console.log(swapCount);
      // if (currentFrame === 0) {
      //   this.$store.commit("setCurrentFrame", -2);
      // } else {
      //   this.$store.commit(
      //     "setCurrentFrame",
      //     -ev.target.webkitDecodedFrameCount + currentFrame - 1 - swapCount,
      //   );
      // }
      this.$store.commit("setCurrentVideo", ev.target);

      const interval = setInterval(() => {
        this.$parent.getPrediction();
      }, 100);
      this.$store.commit("setCurrentInterval", interval);
      const videoElement = ev.target;
      const width = videoElement.videoWidth;
      const height = videoElement.videoHeight;
      console.log(`Actual video resolution: ${width}x${height}`);
    },
    timeUpdate() {
      this.$parent.timeUpdate(
        this.$refs.videoPlayer.currentTime,
        this.$refs.videoPlayer.duration
      );
      this.$store.commit("setCurrentTime", this.$refs.videoPlayer.currentTime);
      console.log(this.hls.levels, this.hls.currentLevel);
      // console.log(this.$refs.videoPlayer.currentTime);
    },
    pause() {
      this.$refs.audioPlayer1.pause();
    },
    audioData(ev) {
      console.log(ev);
      this.$store.commit("setCurrentAudio", ev.target);
    },
    videoChange() {
      this.$parent.videoChange();
      console.log("videoChange");
    },
  },
};
</script>

<style scoped>
#my-player {
  border-radius: 1rem;
}
</style>
