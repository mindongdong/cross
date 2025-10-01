<template>
  <div class="layout">
    <h1 class="title">공격 시퀀스</h1>
    <canvas ref="soccerCanvas" :width="canvasWidth" :height="canvasHeight">
    </canvas>
  </div>
</template>

<script>
import {getAttackSequence} from "@/api/index.js";
export default {
  name: "AttackSeq",
  data() {
    return {
      canvasWidth: 600, // adjust based on your need
      canvasHeight: (600 * 228.846153846) / 350, // adjust based on your need
      timeInterval: null,
      attackSeqData: null,
      currentIndex: 0,
      indexList: [],
    };
  },
  computed: {
    colorDict() {
      return {
        독일: "rgba(150, 230, 180, 0.8)",
        대한민국: "rgba(255, 99, 132, 0.8)",
      };
    },
  },
  watch: {
    attackSeqData: {
      handler() {
        this.$nextTick(() => {
          // The DOM is updated. Now you can perform any post-update operations.
          this.drawSequenceData();
        });
      },
      deep: true,
    },
  },
  mounted() {
    this.drawPitch();
    this.timeInterval = setInterval(async () => {
      const response = await getAttackSequence(
        this.$store.getters.getCurrentTime - 1.5,
      );
      this.attackSeqData = response.data.attack_sequence;
      this.currentIndex = response.data.index;
      this.indexList = Object.keys(response.data.attack_sequence.start_x);
      this.filteredIndexList = this.indexList.filter(
        index => index <= this.currentIndex,
      );
      // console.log(this.indexList);
    }, 500);
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
        2 * Math.PI,
      );
      context.stroke();

      // Draw the center spot
      context.beginPath();
      context.arc(
        this.canvasWidth / 2,
        this.canvasHeight / 2,
        2,
        0,
        2 * Math.PI,
      );
      context.fill();

      // Draw penalty areas
      this.drawRectangle(
        context,
        this.canvasWidth - 200 / 3,
        (this.canvasHeight - 440 / 3) / 2,
        200 / 3,
        440 / 3,
      );
      this.drawRectangle(
        context,
        0,
        (this.canvasHeight - 440 / 3) / 2,
        200 / 3,
        440 / 3,
      );

      // Draw goal areas
      this.drawRectangle(
        context,
        this.canvasWidth - 100 / 3,
        (this.canvasHeight - 180 / 3) / 2,
        100 / 3,
        180 / 3,
      );
      this.drawRectangle(
        context,
        0,
        (this.canvasHeight - 180 / 3) / 2,
        100 / 3,
        180 / 3,
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
    determineLineOrientation(start_x, start_y, end_x, end_y) {
      let dx = end_x - start_x;
      let dy = end_y - start_y;

      if (Math.abs(dx) > Math.abs(dy)) {
        return true;
      } else if (Math.abs(dy) > Math.abs(dx)) {
        return false;
      } else {
        return true;
      }
    },
    determineLineDirection(start_x, start_y, end_x, end_y) {
      let dx = end_x - start_x;
      let dy = end_y - start_y;

      let xDirection = dx > 0 ? "right" : "left";
      let yDirection = dy > 0 ? "up" : "down";

      console.log(dx, xDirection);
      console.log(dy, yDirection);

      return {
        xDirection: xDirection,
        yDirection: yDirection,
      };
    },
    drawArrow(context, fromx, fromy, tox, toy, color) {
      const headLength = 10; // length of the arrowhead

      // Draw main line
      context.moveTo(fromx, fromy);
      context.lineTo(tox, toy);
      context.strokeStyle = color;
      context.stroke();

      // Calculate angle of the line
      const angle = Math.atan2(toy - fromy, tox - fromx);

      // Draw arrowhead
      context.moveTo(tox, toy);
      context.lineTo(
        tox - headLength * Math.cos(angle - Math.PI / 6),
        toy - headLength * Math.sin(angle - Math.PI / 6),
      );
      context.lineTo(
        tox - headLength * Math.cos(angle + Math.PI / 6),
        toy - headLength * Math.sin(angle + Math.PI / 6),
      );
      context.lineTo(tox, toy);
      context.lineTo(
        tox - headLength * Math.cos(angle - Math.PI / 6),
        toy - headLength * Math.sin(angle - Math.PI / 6),
      );
      // Line added to close the path for the arrowhead (this ensures filling works correctly)

      context.fillStyle = color;
      context.fill(); // This will fill the arrowhead
      context.stroke(); // This will outline the arrowhead
    },

    drawSequenceData() {
      let canvas = this.$refs.soccerCanvas;
      let context = canvas.getContext("2d");

      context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.drawPitch();

      let period = this.$store.getters.getCurrentTime < 2882 ? "1H" : "2H";
      // period가 1H일 때는 독일이 reverseX, reverseY 적용 한국은 reverseY만 적용
      // period가 2H일 때는 독일은 reverseY만 적용 한국은 reverseX, reverseY 적용
      let first_idx = this.filteredIndexList[0];

      let team_list = Object.values(this.attackSeqData.team_name);
      let diff_team_list = team_list.map(team => team === team_list[0]);
      console.log(diff_team_list);

      this.filteredIndexList.forEach((eventIndex, idx) => {
        let teamName = this.attackSeqData.team_name[first_idx];
        let reverseBoolean =
          (teamName === "대한민국" && period === "1H") ||
          (teamName === "독일" && period === "2H")
            ? true
            : false;

        let circle_startX = reverseBoolean
          ? this.scaleX(this.attackSeqData.start_x[eventIndex])
          : this.reverseX(this.attackSeqData.start_x[eventIndex]);
        let circle_startY = reverseBoolean
          ? this.reverseY(this.attackSeqData.start_y[eventIndex])
          : this.scaleY(this.attackSeqData.start_y[eventIndex]);
        let line_startX = reverseBoolean
          ? this.scaleX(this.attackSeqData.start_x[eventIndex - 1])
          : this.reverseX(this.attackSeqData.start_x[eventIndex - 1]);
        let line_startY = reverseBoolean
          ? this.reverseY(this.attackSeqData.start_y[eventIndex - 1])
          : this.scaleY(this.attackSeqData.start_y[eventIndex - 1]);
        let line_endX = reverseBoolean
          ? this.scaleX(this.attackSeqData.end_x[eventIndex - 1])
          : this.reverseX(this.attackSeqData.end_x[eventIndex - 1]);
        let line_endY = reverseBoolean
          ? this.reverseY(this.attackSeqData.end_y[eventIndex - 1])
          : this.scaleY(this.attackSeqData.end_y[eventIndex - 1]);

        // 중간에 껴있는 다른 팀에 대한 경합은 위치를 다시 바꿔준다.
        if (!diff_team_list[idx]) {
          circle_startX =
            circle_startX ===
            this.scaleX(this.attackSeqData.start_x[eventIndex])
              ? this.reverseX(this.attackSeqData.start_x[eventIndex])
              : this.scaleX(this.attackSeqData.start_x[eventIndex]);
          circle_startY =
            circle_startY ===
            this.scaleY(this.attackSeqData.start_y[eventIndex])
              ? this.reverseY(this.attackSeqData.start_y[eventIndex])
              : this.scaleY(this.attackSeqData.start_y[eventIndex]);
        }

        if (!diff_team_list[idx - 1]) {
          line_startX =
            line_startX ===
            this.scaleX(this.attackSeqData.start_x[eventIndex - 1])
              ? this.reverseX(this.attackSeqData.start_x[eventIndex - 1])
              : this.scaleX(this.attackSeqData.start_x[eventIndex - 1]);
          line_startY =
            line_startY ===
            this.scaleY(this.attackSeqData.start_y[eventIndex - 1])
              ? this.reverseY(this.attackSeqData.start_y[eventIndex - 1])
              : this.scaleY(this.attackSeqData.start_y[eventIndex - 1]);
          line_endX =
            line_endX === this.scaleX(this.attackSeqData.end_x[eventIndex - 1])
              ? this.reverseX(this.attackSeqData.end_x[eventIndex - 1])
              : this.scaleX(this.attackSeqData.end_x[eventIndex - 1]);
          line_endY =
            line_endY === this.scaleY(this.attackSeqData.end_y[eventIndex - 1])
              ? this.reverseY(this.attackSeqData.end_y[eventIndex - 1])
              : this.scaleY(this.attackSeqData.end_y[eventIndex - 1]);
        }

        // let booleanAxis = this.determineLineOrientation(
        //   this.attackSeqData.start_x[eventIndex - 1],
        //   this.attackSeqData.start_y[eventIndex - 1],
        //   this.attackSeqData.end_x[eventIndex - 1],
        //   this.attackSeqData.end_y[eventIndex - 1]
        // );

        // let direction = this.determineLineDirection(
        //   this.attackSeqData.start_x[eventIndex - 1],
        //   this.attackSeqData.start_y[eventIndex - 1],
        //   this.attackSeqData.end_x[eventIndex - 1],
        //   this.attackSeqData.end_y[eventIndex - 1]
        // );

        // if (booleanAxis) {
        //   // Horizontal line
        //   if (direction.xDirection === "right") {
        //     line_startX = line_startX + 12;
        //   } else if (direction.xDirection === "left") {
        //     line_startX = line_startX - 12;
        //   } else {
        //     line_startX = line_startX + 12;
        //   }
        // } else {
        //   // Vertical line
        //   if (direction.yDirection === "up") {
        //     line_startY = line_startY + 12;
        //   } else if (direction.yDirection === "down") {
        //     line_startY = line_startY - 12;
        //   } else {
        //     line_startY = line_startY + 12;
        //   }
        // }

        // Draw circle at start position
        context.beginPath();
        context.arc(circle_startX, circle_startY, 12, 0, 2 * Math.PI, false);
        context.fillStyle = "rgba(255, 255, 255, 1)";
        context.fill();

        // Add border to circle
        context.lineWidth = 3; // Adjust this value for desired border thickness
        context.strokeStyle =
          this.colorDict[this.attackSeqData.team_name[eventIndex]]; // Or any desired color
        context.stroke();

        // Draw line to end position, if it exists
        if (this.attackSeqData.end_x[eventIndex - 1]) {
          context.beginPath();
          this.drawArrow(
            context,
            line_startX,
            line_startY,
            line_endX,
            line_endY,
            this.colorDict[this.attackSeqData.team_name[eventIndex - 1]],
          );
        }

        // Draw the event index modulo 100 as the number
        context.font = "14px Arial";
        context.fillStyle = "black";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(String(idx % 100), circle_startX, circle_startY);

        // 만약, 마지막 인덱스라면 eventIndex - 1이 아닌 eventIndex로 라인을 그려준다.
        if (idx === Object.keys(this.attackSeqData.player_name).length - 1) {
          const last_line_endX = reverseBoolean
            ? this.scaleX(this.attackSeqData.end_x[eventIndex])
            : this.reverseX(this.attackSeqData.end_x[eventIndex]);
          const last_line_endY = reverseBoolean
            ? this.reverseY(this.attackSeqData.end_y[eventIndex])
            : this.scaleY(this.attackSeqData.end_y[eventIndex]);
          context.beginPath();
          this.drawArrow(
            context,
            circle_startX,
            circle_startY,
            last_line_endX,
            last_line_endY,
            this.colorDict[this.attackSeqData.team_name[eventIndex]],
          );
        }
      });
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
</style>
