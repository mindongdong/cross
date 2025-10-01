<template>
  <div class="layout">
    <img class="background-image" src="@/assets/background_pro.png" />
    <router-link to="/begginerViewer" class="mode">
      <div class="mode-info">
        <h1 class="mode-info__title">비기너</h1>
        <p class="mode-info__description">
          축구를 쉽고 재밌게 즐길<br />
          수 있도록 스트리밍과 함께<br />
          콘텐츠를 제공하는 모드입니다.<br />
        </p>
      </div>
    </router-link>
    <router-link to="/proViewer" class="mode">
      <div class="mode-info">
        <h1 class="mode-info__title">프로</h1>
        <p class="mode-info__description">
          축구를 분석적으로 즐길<br />
          수 있도록 스트리밍과 함께<br />
          통계 데이터를 제공하는 모드입니다.<br />
        </p>
      </div>
    </router-link>
  </div>
</template>

<script>
export default {
  name: "MainPage",
};
</script>

<style scoped>
img {
  object-fit: cover;
  user-drag: none;
  -webkit-user-drag: none;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}
.layout {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  position: relative;
}
.background-image {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mode {
  width: 35rem;
  height: 35rem;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 2rem;
  z-index: 9998;
  text-decoration: none;
}
.mode-info {
  width: 100%;
  height: 40%;
  padding: 3rem;
}
.mode-info__title {
  color: #fff;
  font-family: Inter;
  font-size: 4rem;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.mode-info__description {
  color: rgba(255, 255, 255, 0.7);
  font-family: Inter;
  font-size: 1.3rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
</style>
