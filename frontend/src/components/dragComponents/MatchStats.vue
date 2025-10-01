<template>
  <div class="layout">
    <h1 class="title">실시간 기록</h1>
    <header class="option">
      <div class="option-L">
        <h1 class="option__description">팀</h1>
        <div class="dropdown">
          <select v-model="selectedTeam" @change="fetchMatchStats">
            <option value="">전체</option>
            <option :value="home_teamName">{{ home_teamName }}</option>
            <option :value="away_teamName">{{ away_teamName }}</option>
          </select>
        </div>
      </div>
      <div class="option-L">
        <h1 class="option__description">기록</h1>
        <div class="dropdown">
          <select v-model="selectedRecord" @change="fetchMatchStats">
            <option
              v-for="record in Object.keys(this.recordDict)"
              :key="record"
              :value="recordDict[record]"
            >
              {{ record }}
            </option>
          </select>
        </div>
      </div>
    </header>
    <div class="chart">
      <Bar :data="chartData" :options="chartOptions" :style="chartStyle" />
    </div>
  </div>
</template>

<script>
import {getMatchLineup, getMatchStats} from "@/api/index.js";
import {Bar} from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
);
export default {
  name: "MatchStats",
  components: {Bar},
  data() {
    return {
      selectedTeam: "",
      selectedRecord: "",
      matchStats: [],
      filteredStats: [],
      home_teamName: "",
      away_teamName: "",
      home_lineup: [],
      away_lineup: [],
      player_list: [],
      recordDict: {
        득점: "goals",
        도움: "assists",
        슛: "total_shots",
        "유효 슛": "shots_on_target",
        파울: "fouls",
        패스: "total_passes",
        "키 패스": "key_passes",
        "패스 성공률": "pass_accuracy",
        인터셉트: "interceptions",
        태클: "tackle",
        "태클 성공률": "tackle_accuracy",
        클리어: "clearances",
        선방: "successful_saves",
      },
      timeInterval: null,
    };
  },
  computed: {
    chartData() {
      let sortedData = [...this.filteredStats];

      // Filter out the data with '0' x-axis value
      sortedData = sortedData.filter(item => item[this.selectedRecord] !== 0);

      // Sort data in descending order
      sortedData.sort(
        (a, b) => b[this.selectedRecord] - a[this.selectedRecord],
      );

      return {
        labels: sortedData.map(item => item.player_name),
        datasets: [
          {
            label: this.selectedRecord,
            data: sortedData.map(item => item[this.selectedRecord]),
            //backgroundColor를 지정할건데, item.team_name을 기준으로 색을 지정하고 싶다.
            //item.team_name이 독일이면 빨간색, 대한민국이면 초록색으로 지정하고 싶다.
            backgroundColor: sortedData.map(item =>
              item.team_name === "독일"
                ? "rgba(150, 230, 180, 0.8)"
                : "rgba(255,99,132,0.8)",
            ),
          },
        ],
      };
    },
    chartOptions() {
      return {
        indexAxis: "y",
        responsive: true,
        scales: {
          x: {
            ticks: {
              color: "white", // Set color to white
              // callback: (value, index) => {
              //   // Return label only if corresponding y-axis value is not 0
              //   if (this.chartData.datasets[0].data[index] !== 0) {
              //     return this.chartData.labels[index];
              //   } else {
              //     return null;
              //   }
              // },
            },
          },
          y: {
            ticks: {
              color: "white", // Set color to white
              font: {
                size: 10,
              },
            },
          },
        },
        plugins: {
          legend: {
            labels: {
              color: "white", // Set color to white
            },
          },
          tooltip: {},
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
    async fetchMatchStats() {
      // console.log(this.selectedTeam, this.selectedRecord);
      if (this.selectedRecord) {
        const response = await getMatchStats(
          this.$store.getters.getCurrentTime,
        );
        this.matchStats = response.data;

        this.filteredStats = this.matchStats
          .filter(
            item =>
              this.selectedTeam === "" || item.team_name === this.selectedTeam,
          )
          .map(item => ({
            player_name: item.player_name,
            team_name: item.team_name,
            [this.selectedRecord]: item[this.selectedRecord],
          }));
        console.log(this.filteredStats);
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
    this.timeInterval = setInterval(async () => {
      const response = await getMatchStats(this.$store.getters.getCurrentTime);
      this.matchStats = response.data;
      this.filteredStats = this.matchStats
        .filter(
          item =>
            this.selectedTeam === "" || item.team_name === this.selectedTeam,
        )
        .map(item => ({
          player_name: item.player_name,
          team_name: item.team_name,
          [this.selectedRecord]: item[this.selectedRecord],
        }));
    }, 1000);
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
  justify-content: center;
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
  height: 75%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
