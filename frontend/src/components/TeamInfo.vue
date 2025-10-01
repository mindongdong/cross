<template>
  <div class="team-info">
    <div class="team-selector">
      <div
        class="team__icon"
        @click="
          detailToggle = false;
          teamHome = true;
        "
      >
        <!-- <p class="team__icon--name" draggable="false">{{ home_teamName }}</p> -->
        <img
          class="team__icon--img"
          draggable="false"
          src="@/assets/flags/kor-flag.png"
        />
      </div>
      <div
        class="team__icon"
        @click="
          detailToggle = false;
          teamHome = false;
        "
      >
        <!-- <p class="team__icon--name" draggable="false">{{ away_teamName }}</p> -->
        <img
          class="team__icon--img"
          draggable="false"
          src="@/assets/flags/ger-flag.png"
        />
      </div>
    </div>
    <div class="team__card" v-if="detailToggle">
      <div
        class="team__playerInfo"
        v-for="(player, idx) in home_lineup"
        :key="idx"
        v-if="detailIndex == idx"
      >
        <p class="playerInfo__name">{{ player }}</p>
        <div class="playerInfo__detail">
          <div class="playerInfo__detail--col">
            <p class="playerInfo__detailInfo">
              {{ players[player].belong }}
            </p>
            <p class="playerInfo__detailInfo">{{ home_teamName }}</p>
            <p class="playerInfo__detailInfo">{{ players[player].birth }}</p>
            <p class="playerInfo__detailInfo">{{ players[player].position }}</p>
          </div>
          <!-- <div class="playerInfo__detail--icons">
            <img
              class="playerInfo__icon"
              :src="require(`@/assets/playerIcons/${specsList[idx][0]}.png`)"
            />
            <img
              class="playerInfo__icon"
              :src="require(`@/assets/playerIcons/${specsList[idx][1]}.png`)"
            />
            <img
              class="playerInfo__icon"
              :src="require(`@/assets/playerIcons/${specsList[idx][2]}.png`)"
            />
          </div> -->
        </div>
        <img
          class="playerInfo__img"
          @click="imageClick(player)"
          :src="require(`@/assets/player/${player}.png`)"
        />
      </div>
      <div>
        <img class="playerInfo__icon" src="@/assets/playerIcons/vs_white.png" />
      </div>
      <div
        class="team__playerInfo"
        v-for="(player, idx) in away_lineup"
        :key="idx"
        v-if="detailIndex == idx"
      >
        <p class="playerInfo__name">{{ player }}</p>
        <div class="playerInfo__detail">
          <div class="playerInfo__detail--col">
            <p class="playerInfo__detailInfo">{{ players[player].belong }}</p>
            <p class="playerInfo__detailInfo">{{ away_teamName }}</p>
            <p class="playerInfo__detailInfo">{{ players[player].birth }}</p>
            <p class="playerInfo__detailInfo">{{ players[player].position }}</p>
          </div>
          <div class="playerInfo__detail--icons">
            <!-- <img
              class="playerInfo__icon"
              :src="
                require(`@/assets/playerIcons/${specsList[idx + 11][0]}.png`)
              "
            />
            <img
              class="playerInfo__icon"
              :src="
                require(`@/assets/playerIcons/${specsList[idx + 11][1]}.png`)
              "
            />
            <img
              class="playerInfo__icon"
              :src="
                require(`@/assets/playerIcons/${specsList[idx + 11][2]}.png`)
              "
            /> -->
          </div>
        </div>
        <img
          class="playerInfo__img"
          @click="imageClick(player)"
          :src="require(`@/assets/player/${player}.png`)"
        />
      </div>
    </div>
    <ul class="team__playerList" v-else-if="teamHome">
      <li
        class="playerList__player"
        v-for="(player, idx) in home_lineup"
        :key="idx"
        @click="
          detailToggle = true;
          detailIndex = idx;
        "
      >
        <p class="playerList__name">{{ player }}</p>
        <img
          class="playerList__img"
          :src="require(`@/assets/player/${player}.png`)"
        />
      </li>
    </ul>
    <ul class="team__playerList" v-else>
      <li
        class="playerList__player"
        v-for="(player, idx) in away_lineup"
        :key="idx"
        @click="
          detailToggle = true;
          detailIndex = idx;
        "
      >
        <p class="playerList__name">{{ player }}</p>
        <img
          class="playerList__img"
          :src="require(`@/assets/player/${player}.png`)"
        />
      </li>
    </ul>
  </div>
</template>

<script>
import { getMatchLineup } from "@/api/index";

export default {
  name: "Team",
  props: {},
  data() {
    return {
      teamHome: true,
      detailToggle: false,
      detailIndex: 0,
      home_teamName: "",
      away_teamName: "",
      home_lineup: [],
      away_lineup: [],
      specsList: [
        ["GK 능숙한 펀칭", "GK 적극적 크로스 수비", "GK 침착한 일대일 수비"],
        ["강철몸", "슬라이딩 태클 선호", "아웃사이드 슈팅.크로스"],
        ["리더십", "장거리 스로인", "팀 플레이어"],
        ["긴 패스 선호", "주발 선호", "패스 마스터"],
        ["예리한 감아차기", "중거리 슛 선호", "칩슛 선호"],
        ["선호 포지션 고집", "테크니컬 드리블러", "화려한 개인기"],
        ["유리몸", "플레이 메이커", "승부욕"],
        ["스위퍼 키퍼", "얼리 크로스 선호", "패스 마스터"],
        ["개인 플레이 선호", "테크니컬 드리블러", "아웃사이드 슈팅.크로스"],
        ["강철몸", "주발 선호", "중거리 슛 선호"],
        ["화려한 개인기", "스피드 드리블러", "패스 마스터"],
        ["GK 능숙한 펀칭", "GK 적극적 크로스 수비", "GK 침착한 일대일 수비"],
        ["슬라이딩 태클 선호", "리더십", "강철몸"],
        ["패스 마스터", "강철몸", "슬라이딩 태클 선호"],
        ["장거리 스로인", "팀 플레이어", "긴 패스 선호"],
        ["스위퍼 키퍼", "장거리 스로인", "강철몸"],
        ["리더십", "팀 플레이어", "플레이 메이커"],
        ["긴 패스 선호", "선호 포지션 고집", "승부욕"],
        ["스피드 드리블러", "화려한 개인기", "중거리 슛 선호"],
        ["개인 플레이 선호", "예리한 감아차기", "패스 마스터"],
        ["스피드 드리블러", "아웃사이드 슈팅.크로스", "화려한 개인기"],
        ["파워 헤더", "트러블 메이커", "초 장거리 스로인"],
      ],
      players: {
        조현우: {
          belong: "대구 FC",
          birth: "1991년 9월 2일",
          position: "골키퍼(GK)",
        },
        이용: {
          belong: "경남 FC",
          birth: "1986년 3월 24일",
          position: "수비수(DF)",
        },
        윤영선: {
          belong: "성남 FC",
          birth: "1988년 10월 4일",
          position: "수비수(DF)",
        },
        김영권: {
          belong: "강원 FC",
          birth: "1989년 4월 27일",
          position: "수비수(DF)",
        },
        홍철: {
          belong: "수원 삼성",
          birth: "1989년 2월 17일",
          position: "수비수(DF)",
        },
        이재성: {
          belong: "홀스타인 킬",
          birth: "1992년 8월 10일",
          position: "미드필더(MF)",
        },
        정우영: {
          belong: "칼리즈 FC",
          birth: "1989년 12월 14일",
          position: "미드필더(MF)",
        },
        장현수: {
          belong: "포항 스틸러스",
          birth: "1991년 6월 28일",
          position: "수비수(DF)",
        },
        문선민: {
          belong: "인천 유나이티드",
          birth: "1992년 4월 12일",
          position: "공격수(FW)",
        },
        주세종: {
          belong: "아산 무궁화",
          birth: "1990년 4월 22일",
          position: "미드필더(MF)",
        },
        구자철: {
          belong: "아우크스부르크",
          birth: "1990년 2월 10일",
          position: "미드필더(MF)",
        },
        황희찬: {
          belong: "잘츠부르크",
          birth: "1996년 1월 26일",
          position: "공격수(FW)",
        },
        고요한: {
          belong: "경남 FC",
          birth: "1988년 1월 25일",
          position: "수비수(DF)",
        },
        손흥민: {
          belong: "토트넘 핫스퍼",
          birth: "1992년 7월 8일",
          position: "공격수(FW)",
        },
        "M. 노이어": {
          belong: "바이에른 뮌헨",
          birth: "1986년 3월 27일",
          position: "골키퍼(GK)",
        },
        "J. 키미히": {
          belong: "바이에른 뮌헨",
          birth: "1995년 2월 8일",
          position: "수비수(DF)",
        },
        "M. 훔멜스": {
          belong: "바이에른 뮌헨",
          birth: "1988년 12월 16일",
          position: "수비수(DF)",
        },
        "N. 슐레": {
          belong: "바이에른 뮌헨",
          birth: "1991년 8월 31일",
          position: "수비수(DF)",
        },
        "J. 헥터": {
          belong: "FC 쾰른",
          birth: "1990년 5월 21일",
          position: "수비수(DF)",
        },
        "J. 브란트": {
          belong: "보루시아 도르트문트",
          birth: "1996년 5월 31일",
          position: "미드필더(MF)",
        },
        "S. 케디라": {
          belong: "유벤투스",
          birth: "1987년 4월 16일",
          position: "미드필더(MF)",
        },
        "M. 고메스": {
          belong: "바이에른 뮌헨",
          birth: "1995년 5월 6일",
          position: "미드필더(MF)",
        },
        "T. 뮐러": {
          belong: "바이에른 뮌헨",
          birth: "1989년 9월 13일",
          position: "공격수(FW)",
        },
        "T. 크로스": {
          belong: "레알 마드리드",
          birth: "1990년 1월 4일",
          position: "미드필더(MF)",
        },
        "L. 고레츠카": {
          belong: "바이에른 뮌헨",
          birth: "1995년 2월 6일",
          position: "미드필더(MF)",
        },
        "M. 외질": {
          belong: "아스널",
          birth: "1988년 10월 15일",
          position: "미드필더(MF)",
        },
        "M. 로이스": {
          belong: "보루시아 도르트문트",
          birth: "1989년 5월 31일",
          position: "공격수(FW)",
        },
        "T. 베르너": {
          belong: "첼시 FC",
          birth: "1996년 3월 6일",
          position: "공격수(FW)",
        },
      },
    };
  },
  async mounted() {
    const lineup = await getMatchLineup(this.$store.getters.getCurrentTime);
    console.log(lineup.data);
    const team_list = Object.keys(lineup.data);
    this.home_teamName = team_list[0];
    this.away_teamName = team_list[1];
    this.home_lineup = lineup.data[team_list[0]];
    this.away_lineup = lineup.data[team_list[1]];
    console.log(this.home_lineup);
  },
  methods: {
    imageClick(player) {
      //부모에 있는 imageClick 함수를 호출
      console.log(player);
      const parentComponent = this.$parent;
      parentComponent.imageClick(player);
    },
    setDetailIndex(teamHome, idx) {
      console.log(idx);
      this.$store.commit("setToggleListTrue", "info");
      this.detailToggle = true;
      this.detailIndex = idx;
      this.teamHome = teamHome;
    },
  },
};
</script>

<style scoped>
.team-info {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  /* box-shadow: 0px 0px 8px 5px rgba(255, 255, 255, 0.3); */
  /* box-shadow: 0px 2px 8px -1px rgba(0, 0, 0, 1); */
  border-radius: 1rem;
  z-index: 9998;
  color: rgb(218, 222, 218);
  font-weight: 400;
  transition: all 0.3s ease;
}
.team-info:hover {
  background: rgba(0, 0, 0, 0.35);
  box-shadow: 0px 2px 6px -1px rgba(0, 0, 0, 1);
}
.team-selector {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: space-evenly;
  /* align-items: center; */
}
.team__container {
  width: 50%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.team__card {
  width: 100%;
  height: 95%;
  display: flex;
  align-items: center;
}
.team__playerInfo {
  width: 100%;
  height: 90%;
  background: rgba(0, 0, 0, 0.5);
  /* box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.7); */
  /* backdrop-filter: blur(10px); */
  border-radius: 1rem;
  position: relative;
}
.playerInfo__name {
  font-size: 1rem;
  font-weight: 800;
  margin: 0.8rem;
  margin-left: 1.3rem;
}
.playerInfo__detail {
  width: calc(100% - 13.5rem);
  height: calc(100% - 3.5rem);
  margin-left: 0.8rem;
  padding-left: 0.5rem;
  background: rgba(0, 0, 0, 0.5);
  box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.7);
  border-radius: 0.5rem;
  /* backdrop-filter: blur(10px);  border-radius: 1rem; */
  display: flex;
  align-items: center;
  justify-items: space-evenly;
}
.playerInfo__detail--col {
  width: 80%;
  height: 90%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
}
.playerInfo__detailInfo {
  margin-left: 0.4rem;
  font-size: 0.8rem;
}
.playerInfo__detail--icons {
  display: flex;
  margin-right: 0.5rem;
}
.playerInfo__icon {
  width: 2rem;
  height: 2rem;
  margin: 0.2rem;
}
.playerInfo__img {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 11.5rem;
  height: 16rem;
  cursor: pointer;
  object-position: center;
  object-fit: contain;
  opacity: 0.9;
  transition: all 0.3s ease;
}
.playerInfo__img:hover {
  width: 12rem;
  height: 16.5rem;
  opacity: 1;
}

.team__icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  /* box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.7); */
  /* backdrop-filter: blur(10px); */
  margin: 0 0.5rem 0 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  object-fit: contain;
  transition: all 0.3s ease;
}
.team__icon:hover {
  /* margin-top: -1px; */
  background: rgba(40, 40, 40, 0.5);
  box-shadow: 0px 1px 4px -1px rgba(0, 0, 0, 1);
}
.team__icon--img {
  width: 2rem;
  height: 2rem;
  opacity: 0.9;
  transition: all 0.3s ease; /* 애니메이션을 추가합니다. */
}
.team__icon--img:hover {
  width: 2.2rem;
  height: 2.2rem;
}
.team__playerList {
  width: 89%;
  height: 95%;
  overflow-x: auto;
  white-space: nowrap;
  display: flex;
  align-items: center;
}
.playerList__player {
  top: -0.25rem;
  width: 6.5rem;
  height: 10rem;
  background: rgba(0, 0, 0, 0.5);
  /* box-shadow: 0px 0px 3px rgba(0, 0, 0, 0.7); */
  /* backdrop-filter: blur(10px); */
  margin-left: 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  flex-shrink: 0; /* add this property to keep the width fixed */
  transition: all 0.5s ease; /* 애니메이션을 추가합니다. */
}
.playerList__player:hover {
  width: 7.5rem;
  height: 10.5rem;
  background: rgba(19, 19, 19, 0.5);
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 1);
  transition: all 0.3s ease; /* 애니메이션을 추가합니다. */
}
.playerList__name {
  width: 100%;
  height: 10%;
  font-size: 0.9rem;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 4px;
}
.playerList__img {
  width: 95%;
  height: 85%;
  position: absolute;
  bottom: 0;
  object-position: center;
  object-fit: contain;
  opacity: 1;
}
/* Customize the scrollbar background and thickness */
.team__playerList::-webkit-scrollbar {
  height: 8px; /* Adjust the thickness of the scrollbar */
}

.team__playerList::-webkit-scrollbar-track {
  background: rgba(
    255,
    255,
    255,
    0.1
  ); /* Set the background color of the scrollbar track */
}

.team__playerList::-webkit-scrollbar-thumb {
  background: rgba(
    255,
    255,
    255,
    0.3
  ); /* Set the background color of the scrollbar thumb */
  border-radius: 8px; /* Set the border radius of the scrollbar thumb */
}
</style>
