<template>
  <div class="layout">
    <h1 class="title">능력치 비교</h1>
    <header class="option">
      <div class="option-L">
        <h1 class="option__description">선수 1</h1>
        <div class="dropdown">
          <select v-model="selectedPlayer_1" @change="fetchPlayerStats">
            <option disabled value="">select</option>
            <option disabled value="">{{ home_teamName }}</option>
            <option v-for="player in home_lineup" :key="player" :value="player">
              {{ player }}
            </option>
            <option disabled value="">{{ away_teamName }}</option>
            <option v-for="player in away_lineup" :key="player" :value="player">
              {{ player }}
            </option>
          </select>
        </div>
      </div>
      <div class="option-L">
        <h1 class="option__description">선수 2</h1>
        <div class="dropdown">
          <select v-model="selectedPlayer_2" @change="fetchPlayerStats">
            <option disabled value="">select</option>
            <option disabled value="">{{ home_teamName }}</option>
            <option v-for="player in home_lineup" :key="player" :value="player">
              {{ player }}
            </option>
            <option disabled value="">{{ away_teamName }}</option>
            <option v-for="player in away_lineup" :key="player" :value="player">
              {{ player }}
            </option>
          </select>
        </div>
      </div>
    </header>
    <div class="chart">
      <Radar :data="chartData" :options="chartOptions" :style="chartStyle" />
    </div>
  </div>
</template>

<script>
import { getMatchLineup, getPlayerStats } from "@/api/index.js";
import { Radar } from "vue-chartjs";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);
export default {
  name: "MatchStats",
  components: { Radar },
  data() {
    return {
      selectedPlayer_1: "",
      selectedPlayer_2: "",
      playerStats_1: null,
      playerStats_2: null,
      home_teamName: "",
      away_teamName: "",
      home_lineup: [],
      away_lineup: [],
    };
  },
  computed: {
    chartData() {
      return {
        labels: ["공격 포인트", "슈팅", "패스", "수비", "골키퍼"],
        datasets: [
          {
            label: this.selectedPlayer_1 ? this.selectedPlayer_1 : "",
            fill: true,
            backgroundColor: "rgba(255,99,132,0.1)",
            borderColor: "rgba(255,99,132,1)",
            pointBackgroundColor: "rgba(255,99,132,1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(255,99,132,1)",
            data: this.playerStats_1
              ? Object.values(this.playerStats_1).map((value) => value * 100)
              : [0, 0, 0, 0, 0],
          },
          {
            label: this.selectedPlayer_2 ? this.selectedPlayer_2 : "",
            fill: true,
            backgroundColor: "rgba(150, 230, 180, 0.1)",
            borderColor: "rgba(150, 230, 180, 1)",
            pointBackgroundColor: "rgba(150, 230, 180, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(150, 230, 180, 1)",
            data: this.playerStats_2
              ? Object.values(this.playerStats_2).map((value) => value * 100)
              : [0, 0, 0, 0, 0],
          },
        ],
      };
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "white", // Set color to white
            },
          },
        },
        scales: {
          r: {
            suggestedMin: 0, // Set min value
            suggestedMax: 100, // Set max value
            pointLabels: {
              color: "white",
              font: {
                size: 14,
              },
            },
            ticks: {
              backdropColor: "rgba(0, 0, 0, 0.0)",
              color: "white",
            },
            grid: {
              color: "rgba(255, 255, 255, 0.8)",
              lineWidth: 0.5,
            },
            angleLines: {
              color: "rgba(255, 255, 255, 0.8)",
              lineWidth: 0.5,
            }
          },
        },
      };
    },
    chartStyle() {
      return {
        width: "100%",
        height: "100%",
      };
    },
  },
  methods: {
    async fetchPlayerStats() {
      if (this.selectedPlayer_1 !== "") {
        const response = await getPlayerStats(this.selectedPlayer_1);
        this.playerStats_1 = response.data;
        console.log(this.playerStats_1);
      }
      if (this.selectedPlayer_2 !== "") {
        const response = await getPlayerStats(this.selectedPlayer_2);
        this.playerStats_2 = response.data;
        console.log(this.playerStats_2);
      }
    },
  },
  created() {
    this.selectedRecord = Object.values(this.recordDict)[0];
  },
  async mounted() {
    const lineup = await getMatchLineup(this.$store.getters.getCurrentTime);
    console.log(lineup.data);
    const team_list = Object.keys(lineup.data);
    this.home_teamName = team_list[0];
    this.away_teamName = team_list[1];
    this.home_lineup = lineup.data[team_list[0]];
    this.away_lineup = lineup.data[team_list[1]];
  },
  beforeDestroy() {
    clearInterval(this.timeInterval);
  },
};
</script>

<style scoped>
.layout {
  width: 100%;
  height: 100%;
}
.title {
  color: white;
  font-size: 1rem;
  text-align: center;
  padding: 0.5rem;
}
.option {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.4rem 0;
  border-top: 2px solid rgba(0, 0, 0, 0.3);
  border-bottom: 2px solid rgba(0, 0, 0, 0.3);
}

.option__description {
  color: white;
  font-size: 0.8rem;
  margin-bottom: 0.4rem;
  font-weight: bold;
}

.option-L {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dropdown {
  position: relative;
  display: flex;
  align-items: center;
}

.dropdown select {
  background-color: transparent;
  color: white;
  padding: 4px;
  border: 1px solid white;
  border-radius: 5px;
  font-size: 0.8rem;
  appearance: none; /* this will remove the default arrow in some browsers */
  width: 80px;
  outline: none;
}

.dropdown::after {
  /* create a custom dropdown arrow */
  content: "⌄";
  font-size: 10px;
  position: absolute;
  right: 10px;
  top: 5px;
  color: white;
}

.chart {
  width: 100%;
  height: 80%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
