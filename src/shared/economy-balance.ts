export const BALANCE = {
  version:2, growth:'1.15', maxUnits:10000, precision:80, maxExponent:1000,
  offlineDays:7, extendedOfflineDays:14, returnAfterMs:5*60000,
  tierMilestones:[1,5,25,50,100,150,200,250,300,350,400,500],
  visualMilestones:[1,10,50,100,250,500], achievementMilestones:[1,10,25,50,100,200,350,500],
  prestigeBase:'1e12', prestigeExponent:'.5', prestigeBonus:'.05',
  // Study rewards scale with installed production; the floor starts the economy.
  focusFloorPerMinute:24, focusRateMinutes:2, reviewFloor:40, reviewRateMinutes:.5,
  maxRewardedReviewsPerDay:100, consistencyThresholdMinutes:10, consistencyThresholdReviews:5,
  consistencyPerDay:.03, consistencyCap:.3,
  activeRateMinutes:{ memory:3, office:5, harvest:.3, gather:.05 },
  signalEveryMs:45*60000, maxStoredSignals:24, maxConcurrentEvents:2,
  achievementPerIndex:.002, buildPerPoint:.015, maxBuildBonus:.3,
  pulseMaximum:64, motorBudgetPerDay:1200,
  installationCosts:['40','2000','5e4','2e6','1e8','1e10','1e12','1e15','1e18','1e21','1e25','1e30','1e36','1e43','1e51','1e60'],
  installationRates:['3','60','900','18000','4e5','1e7','3e8','1e10','5e11','5e13','2e16','1e19','1e23','1e28','1e34','1e41'],
} as const;
