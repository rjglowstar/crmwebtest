export const environment = {
  production: false,
  apiIdentityUrl: 'http://localhost:4592/api/',
  apiBackOfficeFileUploadUrl: 'http://localhost:26962/api/',
  apiFrontOfficeFileUploadUrl: 'http://localhost:26962/api/',
  apiFileUploadUrl: 'http://localhost:26962/api/',
  apiPricingUrl: 'http://172.20.2.53:9897/api/',

  invStoneArrowBlackImageUrl: '/Arrow_Black_BG.jpg',
  invStoneHeartBlackImageUrl: '/Heart_Black_BG.jpg',
  invStoneAsetWhiteImageUrl: '/Aset_white_bg.jpg',
  invStoneIdealWhiteImageUrl: '/ideal_white_bg.jpg',
  invStoneOfficeLightBlackImageUrl: '/office_light_black_bg.jpg',

  imageURL:"https://diamdna.azureedge.net/imaged/{stoneId}/still.jpg",
  videoURL:"https://diamdna.azureedge.net/Vision360.html?d={stoneId}&sr=-30&s=30",
  nVideoURL:"https://diamdna.azureedge.net/imaged/{stoneId}/{stoneId}.html",
  certiURL:"https://diamdna.azureedge.net/reports/{certiNo}.pdf#zoom=150",
  otherImageBaseURL:"https://diamdna.azureedge.net/imaged/{stoneId}",

  notificationSocketUrl: 'wss://localhost:44392/',
  notificationBaseUrl: 'http://localhost:44392/',
  proposalUrl: 'http://localhost:9200/',
  backOffliceBaseUrl: "http://localhost:25264/api/",
  frontOfficeBaseUrl: "https://localhost:44363/api/",
};
