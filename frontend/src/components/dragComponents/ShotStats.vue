<template>
  <div class="layout">
    <h1 class="title">슈팅 데이터</h1>
    <canvas
      ref="soccerCanvas"
      @mousemove="handleMouseMove"
      :width="canvasWidth"
      :height="canvasHeight"
    ></canvas>
    <div
      v-if="tooltipVisible"
      :style="{ top: tooltipY - 12 + 'px', left: tooltipX + 'px' }"
      class="tooltip"
    >
      {{ tooltipText }}
    </div>
  </div>
</template>

<script>
import { getMatchShots } from "@/api/index.js";
export default {
  name: "AttackSeq",
  data() {
    return {
      canvasWidth: 600, // adjust based on your need
      canvasHeight: (600 * 228.846153846) / 350, // adjust based on your need
      timeInterval: null,
      shotData: null,
      team1Goals: null,
      team2Goals: null,
      failedShots: null,
      circles: [], // we will keep track of all circles here
      tooltipVisible: false,
      tooltipX: 0,
      tooltipY: 0,
      tooltipText: "",
    };
  },
  computed: {
    goalColorDict() {
      return {
        독일: "rgba(255,150,180,1)",
        대한민국: "rgba(255,150,180,1)",
      };
    },
    shotColorDict() {
      return {
        독일: "rgba(150,230,180,0.8)",
        대한민국: "rgba(255,99,132,0.8)",
      };
    },
  },
  async mounted() {
    this.timeInterval = setInterval(async () => {
      const response = await getMatchShots(this.$store.getters.getCurrentTime);
      this.team1Goals = response.data.team1;
      this.team2Goals = response.data.team2;
      this.failedShots = response.data.failed_shots;
      console.log(response.data);
      this.drawShotData(response.data);
    }, 2000);
    this.drawPitch();
  },
  methods: {
    drawPitch() {
      let canvas = this.$refs.soccerCanvas;
      let context = canvas.getContext("2d");

      // Set pitch color
      context.fillStyle = "rgba(0,0,0,0.3)"; // set as per your requirement

      // Draw the outer rectangle
      context.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      // Set line color
      context.strokeStyle = "#ffffff"; // set as per your requirement
      context.lineWidth = 2;

      // Draw the boundary lines
      context.strokeRect(1, 1, this.canvasWidth - 3, this.canvasHeight - 3);

      // Draw the center line
      context.beginPath();
      context.moveTo(this.canvasWidth / 2, 5);
      context.lineTo(this.canvasWidth / 2, this.canvasHeight - 5);
      context.stroke();

      // Draw the center circle
      context.beginPath();
      context.arc(
        this.canvasWidth / 2,
        this.canvasHeight / 2,
        26.6666666667,
        0,
        2 * Math.PI
      );
      context.stroke();

      // Draw the center spot
      context.beginPath();
      context.arc(
        this.canvasWidth / 2,
        this.canvasHeight / 2,
        2,
        0,
        2 * Math.PI
      );
      context.fill();

      // Draw penalty areas
      this.drawRectangle(
        context,
        this.canvasWidth - 200 / 3,
        (this.canvasHeight - 440 / 3) / 2,
        200 / 3,
        440 / 3
      );
      this.drawRectangle(
        context,
        0,
        (this.canvasHeight - 440 / 3) / 2,
        200 / 3,
        440 / 3
      );

      // Draw goal areas
      this.drawRectangle(
        context,
        this.canvasWidth - 100 / 3,
        (this.canvasHeight - 180 / 3) / 2,
        100 / 3,
        180 / 3
      );
      this.drawRectangle(
        context,
        0,
        (this.canvasHeight - 180 / 3) / 2,
        100 / 3,
        180 / 3
      );

      // After drawing everything, add the text to top-left
      context.font = "16px Arial"; // You can adjust the font size and type
      context.fillStyle = "rgba(150,230,180,0.8)"; // Font color
      context.fillText(
        this.team1Goals.name + " : " + this.team1Goals.xg + " xG",
        10,
        25
      );
      context.fillStyle = "rgba(255,99,132,0.8)"; // Font color
      context.fillText(
        this.team2Goals.name + " : " + this.team2Goals.xg + " xG",
        10,
        45
      );
    },
    drawRectangle(context, x, y, width, height) {
      context.beginPath();
      context.rect(x, y, width, height);
      context.stroke();
    },
    drawCircle(context, x, y, radius) {
      context.beginPath();
      context.arc(x, y, radius, 0, 2 * Math.PI);
      context.fill();
    },
    drawShots(data, key) {
      if (data.length === 0) {
        return;
      }
      let canvas = this.$refs.soccerCanvas;
      let context = canvas.getContext("2d");

      data.forEach((shot) => {
        let x = shot.x;
        let y = shot.y;
        let canvasX = this.scaleX(x);
        let canvasY = this.reverseY(y);
        if (shot.period === "1H") {
          canvasX = this.reverseX(x);
          canvasY = this.reverseY(y);
        }

        context.beginPath();
        context.arc(
          canvasX,
          canvasY,
          Math.sqrt(shot.xg) * 30,
          0,
          Math.PI * 2,
          false
        ); // size is now related to xg
        // failedShots이면 shotColorDict으로 색을 지정하고, 아니면 goalColorDict으로 색을 지정한다.
        context.fillStyle =
          key === "failed_shots"
            ? this.shotColorDict[shot.team_name]
            : this.goalColorDict["대한민국"];
        context.fill();

        this.circles.push({
          x: canvasX,
          y: canvasY,
          radius: Math.sqrt(shot.xg) * 20,
          text: shot.display_name,
        });
      });
    },
    drawShotData(data) {
      let canvas = this.$refs.soccerCanvas;
      let context = canvas.getContext("2d");
      context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.drawPitch();
      const dataList = Object.keys(data).reverse();
      dataList.forEach((key) => {
        if (key === "team2") {
          this.drawShots(data[key].goals, key);
        } else if (key === "failed_shots") {
          this.drawShots(data[key], key);
        }
      });
    },
    scaleX(x) {
      // Transform x from the event's coordinate system to SVG's coordinate system.
      // This function depends on the actual size of your SVG and your event's coordinate system.
      // Here we simply use x as is.
      const calX = this.canvasWidth / 104;
      x = x * calX;
      return x;
    },
    scaleY(y) {
      // Transform y from the event's coordinate system to SVG's coordinate system.
      // This function depends on the actual size of your SVG and your event's coordinate system.
      // Here we simply use y as is.
      const calY = this.canvasHeight / 68;
      y = y * calY;
      return y;
    },
    reverseX(x) {
      const calX = this.canvasWidth / 104;
      x = (104 - x) * calX; // Subtract x from the maximum X value (104)
      return x;
    },
    reverseY(y) {
      const calY = this.canvasHeight / 68;
      y = (68 - y) * calY; // Subtract y from the maximum Y value (68)
      return y;
    },
    handleMouseMove(event) {
      // calculate mouse position relative to the canvas
      let rect = this.$refs.soccerCanvas.getBoundingClientRect();
      let x = event.clientX - rect.left;
      let y = event.clientY - rect.top;

      let isMouseInsideCircle = false;

      // check if the mouse is inside any circle
      for (let circle of this.circles) {
        let dx = x - circle.x;
        let dy = y - circle.y;
        if (dx * dx + dy * dy < circle.radius * circle.radius) {
          isMouseInsideCircle = true;
          circle.hovered = true;
          // the mouse is inside this circle, show the tooltip
          this.tooltipVisible = true;
          this.tooltipX = event.clientX;
          this.tooltipY = event.clientY;
          this.tooltipText = circle.text;
          return;
        } else {
          circle.hovered = false;
        }
      }

      if (!isMouseInsideCircle) {
        // the mouse is not inside any circle, hide the tooltip
        this.tooltipVisible = false;
      }
    },
  },
  beforeDestroy() {
    clearInterval(this.timeInterval);
  },
};
</script>

<style scoped>
.title {
  width: 97%;
  color: white;
  font-size: 1rem;
  text-align: center;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.3);
}
.layout {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}
canvas {
  border: 1px solid #000;
  position: relative;
}
.tooltip {
  padding: 5px;
  pointer-events: none;
  font-size: 1rem;
  font-weight: 700;
}
</style>
