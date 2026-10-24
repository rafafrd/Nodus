// GAM-06 (rules v3). Rates are per minute internally; the interface shows per second.
// Values are this project's own; see docs/design/GAME_DESIGN.md for the targets they serve.
export const BALANCE = {
  version:3, growth:'1.15', maxUnits:10000, precision:80, maxExponent:1000,
  offlineDays:7, extendedOfflineDays:14, returnAfterMs:5*60000,
  tierMilestones:[1,5,25,50,100,150,200,250,300,350,400,500],
  visualMilestones:[1,10,50,100,250,500], achievementMilestones:[1,10,25,50,100,200,350,500],
  prestigeBase:'1e12', prestigeExponent:'.5', prestigeBonus:'.05',
  activeRateMinutes:{ memory:3 },
  maxConcurrentEvents:3, achievementPerIndex:.002,
  // Core click: base value, at most this many clicks per batch and one click per 40 ms of real time.
  clickBase:1, maxClickBatch:40, clickIntervalMs:40,
  // Flash ("Lampejo"): appears after 4–9 min of watched time, stays 12 s, never during Focus.
  flashWatchMinMs:4*60000, flashWatchMaxMs:9*60000, flashLifetimeMs:12000, watchGapMs:3000,
  findBankShare:.1, findMinutes:12, findFloorMinutes:.5,
  // Garden: unlocked once 10 Collectors were owned; seeds cost one minute of production.
  gardenUnlock:{producer:'collectors',count:10}, seedMinutes:1, seedFloor:10, dewBonus:.03,
  // Council: unlocked once 5 Workshops were owned; deliberations regenerate.
  councilUnlock:{producer:'workshops',count:5}, councilSeats:[1,.6,.35], deliberationsMax:3, deliberationMs:30*60000,
  installationCosts:['10','85','800','8000','9e4','1.1e6','1.4e7','2e8','3e9','5e10','9e11','1.6e13','3e14','6e15','1.2e17','2.5e18'],
  installationRates:['7.2','54','420','3000','19800','132000','9e5','6.6e6','4.8e7','3.6e8','3e9','2.4e10','2.1e11','1.8e12','1.56e13','1.38e14'],
} as const;
/** Rates and costs of rules v2 (GAM-04/05), kept only to convert saved progress (game-migration.ts). */
export const BALANCE_V2 = {
  installationCosts:['40','2000','5e4','2e6','1e8','1e10','1e12','1e15','1e18','1e21','1e25','1e30','1e36','1e43','1e51','1e60'],
  installationRates:['3','60','900','18000','4e5','1e7','3e8','1e10','5e11','5e13','2e16','1e19','1e23','1e28','1e34','1e41'],
} as const;
