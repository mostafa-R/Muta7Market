// Main sports options list
export const sportsOptions = [
  { id: "volleyball", name: "sports.volleyball", value: "volleyball" },
  { id: "basketball", name: "sports.basketball", value: "basketball" },
  { id: "wrestling", name: "sports.wrestling", value: "wrestling" },
  { id: "archery", name: "sports.archery", value: "archery" },
  { id: "handball", name: "sports.handball", value: "handball" },
  { id: "athletics", name: "sports.athletics", value: "athletics" },
  { id: "karate", name: "sports.karate", value: "karate" },
  { id: "taekwondo", name: "sports.taekwondo", value: "taekwondo" },
  { id: "esports", name: "sports.esports", value: "esports" },
  { id: "football", name: "sports.football", value: "football" },
  { id: "futsal", name: "sports.futsal", value: "futsal" },
  { id: "fencing", name: "sports.fencing", value: "fencing" },
  { id: "swimming", name: "sports.swimming", value: "swimming" },
  // Existing sports that weren't mentioned in requirements but should remain
  { id: "tennis", name: "sports.tennis", value: "tennis" },
  { id: "tabletennis", name: "sports.tabletennis", value: "tabletennis" },
  { id: "badminton", name: "sports.badminton", value: "badminton" },
  { id: "judo", name: "sports.judo", value: "judo" },
  { id: "cycling", name: "sports.cycling", value: "cycling" },
  { id: "squash", name: "sports.squash", value: "squash" },
  { id: "weightlifting", name: "sports.weightlifting", value: "weightlifting" },
  { id: "boxing", name: "sports.boxing", value: "boxing" },
  { id: "gymnastics", name: "sports.gymnastics", value: "gymnastics" },
  { id: "billiards", name: "sports.billiards", value: "billiards" },
  
];

// Sport-specific positions mapping with updated comprehensive lists
export const sportPositions = {
  volleyball: [
    {
      id: "outside_hitter",
      name: "positions.volleyball.outsideHitter",
      value: "outside_hitter",
    },
    {
      id: "opposite_hitter",
      name: "positions.volleyball.oppositeHitter",
      value: "opposite_hitter",
    },
    {
      id: "setter",
      name: "positions.volleyball.setter",
      value: "setter",
    },
    {
      id: "middle_blocker",
      name: "positions.volleyball.middleBlocker",
      value: "middle_blocker",
    },
    {
      id: "libero",
      name: "positions.volleyball.libero",
      value: "libero",
    },
    {
      id: "defensive_specialist",
      name: "positions.volleyball.defensiveSpecialist",
      value: "defensive_specialist",
    },
    {
      id: "serving_specialist",
      name: "positions.volleyball.servingSpecialist",
      value: "serving_specialist",
    },
    {
      id: "other",
      name: "sports.other",
      value: "other",
    },
  ],

  basketball: [
    {
      id: "point_guard",
      name: "positions.basketball.pointGuard",
      value: "point_guard",
    },
    {
      id: "shooting_guard",
      name: "positions.basketball.shootingGuard",
      value: "shooting_guard",
    },
    {
      id: "small_forward",
      name: "positions.basketball.smallForward",
      value: "small_forward",
    },
    {
      id: "power_forward",
      name: "positions.basketball.powerForward",
      value: "power_forward",
    },
    {
      id: "center",
      name: "positions.basketball.center",
      value: "center",
    },
    {
      id: "other",
      name: "sports.other",
      value: "other",
    },
  ],

  wrestling: [
    {
      id: "freestyle",
      name: "positions.wrestling.freestyle",
      value: "freestyle",
    },
    {
      id: "greco_roman",
      name: "positions.wrestling.grecoRoman",
      value: "greco_roman",
    },
    {
      id: "other",
      name: "sports.other",
      value: "other",
    },
  ],

  archery: [
    {
      id: "white_arrow",
      name: "positions.archery.whiteArrow",
      value: "white_arrow",
    },
    {
      id: "black_arrow",
      name: "positions.archery.blackArrow",
      value: "black_arrow",
    },
    {
      id: "blue_arrow",
      name: "positions.archery.blueArrow",
      value: "blue_arrow",
    },
    {
      id: "red_arrow",
      name: "positions.archery.redArrow",
      value: "red_arrow",
    },
    {
      id: "yellow_arrow",
      name: "positions.archery.yellowArrow",
      value: "yellow_arrow",
    },
    {
      id: "green_arrow",
      name: "positions.archery.greenArrow",
      value: "green_arrow",
    },
    {
      id: "other",
      name: "sports.other",
      value: "other",
    },
  ],

  handball: [
    {
      id: "pivot",
      name: "positions.handball.pivot",
      value: "pivot",
    },
    {
      id: "right_wing",
      name: "positions.handball.rightWing",
      value: "right_wing",
    },
    {
      id: "right_back",
      name: "positions.handball.rightBack",
      value: "right_back",
    },
    {
      id: "playmaker",
      name: "positions.handball.playmaker",
      value: "playmaker",
    },
    {
      id: "goalkeeper",
      name: "positions.handball.goalkeeper",
      value: "goalkeeper",
    },
    {
      id: "left_back",
      name: "positions.handball.leftBack",
      value: "left_back",
    },
    {
      id: "left_wing",
      name: "positions.handball.leftWing",
      value: "left_wing",
    },
    {
      id: "other",
      name: "sports.other",
      value: "other",
    },
  ],

  athletics: [
    {
      id: "100m",
      name: "positions.athletics.100m",
      value: "100m",
    },
    {
      id: "200m",
      name: "positions.athletics.200m",
      value: "200m",
    },
    {
      id: "400m",
      name: "positions.athletics.400m",
      value: "400m",
    },
    {
      id: "800m",
      name: "positions.athletics.800m",
      value: "800m",
    },
    {
      id: "1500m",
      name: "positions.athletics.1500m",
      value: "1500m",
    },
    {
      id: "5000m",
      name: "positions.athletics.5000m",
      value: "5000m",
    },
    {
      id: "10000m",
      name: "positions.athletics.10000m",
      value: "10000m",
    },
    {
      id: "marathon",
      name: "positions.athletics.marathon",
      value: "marathon",
    },
    {
      id: "100m_hurdles",
      name: "positions.athletics.100mHurdles",
      value: "100m_hurdles",
    },
    {
      id: "110m_hurdles",
      name: "positions.athletics.110mHurdles",
      value: "110m_hurdles",
    },
    {
      id: "400m_hurdles",
      name: "positions.athletics.400mHurdles",
      value: "400m_hurdles",
    },
    {
      id: "long_jump",
      name: "positions.athletics.longJump",
      value: "long_jump",
    },
    {
      id: "high_jump",
      name: "positions.athletics.highJump",
      value: "high_jump",
    },
    {
      id: "triple_jump",
      name: "positions.athletics.tripleJump",
      value: "triple_jump",
    },
    {
      id: "pole_vault",
      name: "positions.athletics.poleVault",
      value: "pole_vault",
    },
    {
      id: "shot_put",
      name: "positions.athletics.shotPut",
      value: "shot_put",
    },
    {
      id: "discus_throw",
      name: "positions.athletics.discusThrow",
      value: "discus_throw",
    },
    {
      id: "hammer_throw",
      name: "positions.athletics.hammerThrow",
      value: "hammer_throw",
    },
    {
      id: "javelin_throw",
      name: "positions.athletics.javelinThrow",
      value: "javelin_throw",
    },
    {
      id: "race_walking",
      name: "positions.athletics.raceWalking",
      value: "race_walking",
    },
    {
      id: "other",
      name: "sports.other",
      value: "other",
    },
  ],

  karate: [
    {
      id: "white_belt",
      name: "positions.karate.whiteBelt",
      value: "white_belt",
    },
    {
      id: "yellow_belt",
      name: "positions.karate.yellowBelt",
      value: "yellow_belt",
    },
    {
      id: "orange_belt",
      name: "positions.karate.orangeBelt",
      value: "orange_belt",
    },
    {
      id: "green_belt",
      name: "positions.karate.greenBelt",
      value: "green_belt",
    },
    {
      id: "blue_belt",
      name: "positions.karate.blueBelt",
      value: "blue_belt",
    },
    {
      id: "brown_belt",
      name: "positions.karate.brownBelt",
      value: "brown_belt",
    },
    {
      id: "red_belt",
      name: "positions.karate.redBelt",
      value: "red_belt",
    },
    {
      id: "other",
      name: "sports.other",
      value: "other",
    },
  ],

  taekwondo: [
    {
      id: "white_belt",
      name: "positions.taekwondo.whiteBelt",
      value: "white_belt",
    },
    {
      id: "yellow_belt",
      name: "positions.taekwondo.yellowBelt",
      value: "yellow_belt",
    },
    {
      id: "green_belt",
      name: "positions.taekwondo.greenBelt",
      value: "green_belt",
    },
    {
      id: "blue_belt",
      name: "positions.taekwondo.blueBelt",
      value: "blue_belt",
    },
    {
      id: "red_belt",
      name: "positions.taekwondo.redBelt",
      value: "red_belt",
    },
    {
      id: "black_belt",
      name: "positions.taekwondo.blackBelt",
      value: "black_belt",
    },
    {
      id: "other",
      name: "sports.other",
      value: "other",
    },
  ],

  esports: [
    {
      id: "moba",
      name: "positions.esports.moba",
      value: "moba",
    },
    {
      id: "fighting_games",
      name: "positions.esports.fightingGames",
      value: "fighting_games",
    },
    {
      id: "rts",
      name: "positions.esports.rts",
      value: "rts",
    },
    {
      id: "fps",
      name: "positions.esports.fps",
      value: "fps",
    },
    {
      id: "battle_royale",
      name: "positions.esports.battleRoyale",
      value: "battle_royale",
    },
    {
      id: "sports_simulation",
      name: "positions.esports.sportsSimulation",
      value: "sports_simulation",
    },
    {
      id: "racing_simulation",
      name: "positions.esports.racingSimulation",
      value: "racing_simulation",
    },
    {
      id: "mobile_games",
      name: "positions.esports.mobileGames",
      value: "mobile_games",
    },
    {
      id: "fifa",
      name: "positions.esports.fifa",
      value: "fifa",
    },
    {
      id: "rocket_league",
      name: "positions.esports.rocketLeague",
      value: "rocket_league",
    },
    {
      id: "other",
      name: "sports.other",
      value: "other",
    },
  ],

  football: [
    {
      id: "goalkeeper",
      name: "positions.football.goalkeeper",
      value: "goalkeeper",
    },
    {
      id: "right_back",
      name: "positions.football.rightBack",
      value: "right_back",
    },
    {
      id: "left_back",
      name: "positions.football.leftBack",
      value: "left_back",
    },
    {
      id: "center_back",
      name: "positions.football.centerBack",
      value: "center_back",
    },
    {
      id: "cdm",
      name: "positions.football.cdm",
      value: "cdm",
    },
    {
      id: "right_winger",
      name: "positions.football.rightWinger",
      value: "right_winger",
    },
    {
      id: "left_winger",
      name: "positions.football.leftWinger",
      value: "left_winger",
    },
    {
      id: "midfielder",
      name: "positions.football.midfielder",
      value: "midfielder",
    },
    {
      id: "cam",
      name: "positions.football.cam",
      value: "cam",
    },
    {
      id: "striker",
      name: "positions.football.striker",
      value: "striker",
    },
    {
      id: "other",
      name: "sports.other",
      value: "other",
    },
  ],

  futsal: [
    {
      id: "goalkeeper",
      name: "positions.futsal.goalkeeper",
      value: "goalkeeper",
    },
    {
      id: "defender",
      name: "positions.futsal.defender",
      value: "defender",
    },
    {
      id: "winger",
      name: "positions.futsal.winger",
      value: "winger",
    },
    {
      id: "pivot_flank",
      name: "positions.futsal.pivotFlank",
      value: "pivot_flank",
    },
    {
      id: "fixo_pivot",
      name: "positions.futsal.fixoPivot",
      value: "fixo_pivot",
    },
    {
      id: "other",
      name: "sports.other",
      value: "other",
    },
  ],

  fencing: [
    {
      id: "e_under",
      name: "positions.fencing.eUnder",
      value: "e_under",
    },
    {
      id: "d_under",
      name: "positions.fencing.dUnder",
      value: "d_under",
    },
    {
      id: "c_under",
      name: "positions.fencing.cUnder",
      value: "c_under",
    },
    {
      id: "beginner",
      name: "positions.fencing.beginner",
      value: "beginner",
    },
    {
      id: "unclassified",
      name: "positions.fencing.unclassified",
      value: "unclassified",
    },
    {
      id: "foil",
      name: "positions.fencing.foil",
      value: "foil",
    },
    {
      id: "epee",
      name: "positions.fencing.epee",
      value: "epee",
    },
    {
      id: "sabre",
      name: "positions.fencing.sabre",
      value: "sabre",
    },
    {
      id: "other",
      name: "sports.other",
      value: "other",
    },
  ],

  swimming: [
    {
      id: "freestyle_50m",
      name: "positions.swimming.freestyle50m",
      value: "freestyle_50m",
    },
    {
      id: "freestyle_100m",
      name: "positions.swimming.freestyle100m",
      value: "freestyle_100m",
    },
    {
      id: "freestyle_200m",
      name: "positions.swimming.freestyle200m",
      value: "freestyle_200m",
    },
    {
      id: "backstroke_50m",
      name: "positions.swimming.backstroke50m",
      value: "backstroke_50m",
    },
    {
      id: "backstroke_100m",
      name: "positions.swimming.backstroke100m",
      value: "backstroke_100m",
    },
    {
      id: "backstroke_200m",
      name: "positions.swimming.backstroke200m",
      value: "backstroke_200m",
    },
    {
      id: "breaststroke_50m",
      name: "positions.swimming.breaststroke50m",
      value: "breaststroke_50m",
    },
    {
      id: "breaststroke_100m",
      name: "positions.swimming.breaststroke100m",
      value: "breaststroke_100m",
    },
    {
      id: "breaststroke_200m",
      name: "positions.swimming.breaststroke200m",
      value: "breaststroke_200m",
    },
    {
      id: "butterfly_50m",
      name: "positions.swimming.butterfly50m",
      value: "butterfly_50m",
    },
    {
      id: "butterfly_100m",
      name: "positions.swimming.butterfly100m",
      value: "butterfly_100m",
    },
    {
      id: "butterfly_200m",
      name: "positions.swimming.butterfly200m",
      value: "butterfly_200m",
    },
    {
      id: "relay_200m",
      name: "positions.swimming.relay200m",
      value: "relay_200m",
    },
    {
      id: "relay_400m",
      name: "positions.swimming.relay400m",
      value: "relay_400m",
    },
    {
      id: "relay_800m",
      name: "positions.swimming.relay800m",
      value: "relay_800m",
    },
    {
      id: "medley_race",
      name: "positions.swimming.medleyRace",
      value: "medley_race",
    },
    {
      id: "other",
      name: "sports.other",
      value: "other",
    },
  ],

  tennis: [
    { id: "singles", name: "positions.tennis.singles", value: "singles" },
    { id: "doubles", name: "positions.tennis.doubles", value: "doubles" },
    {
      id: "mixed_doubles",
      name: "positions.tennis.mixedDoubles",
      value: "mixed_doubles",
    },
    { id: "other", name: "sports.other", value: "other" },
  ],

  tabletennis: [
    { id: "singles", name: "positions.tabletennis.singles", value: "singles" },
    { id: "doubles", name: "positions.tabletennis.doubles", value: "doubles" },
    {
      id: "mixed_doubles",
      name: "positions.tabletennis.mixedDoubles",
      value: "mixed_doubles",
    },
    { id: "other", name: "sports.other", value: "other" },
  ],

  badminton: [
    { id: "singles", name: "positions.badminton.singles", value: "singles" },
    { id: "doubles", name: "positions.badminton.doubles", value: "doubles" },
    {
      id: "mixed_doubles",
      name: "positions.badminton.mixedDoubles",
      value: "mixed_doubles",
    },
    { id: "other", name: "sports.other", value: "other" },
  ],

  judo: [
    {
      id: "lightweight",
      name: "positions.judo.lightweight",
      value: "lightweight",
    },
    {
      id: "middleweight",
      name: "positions.judo.middleweight",
      value: "middleweight",
    },
    {
      id: "heavyweight",
      name: "positions.judo.heavyweight",
      value: "heavyweight",
    },
    { id: "team", name: "positions.judo.team", value: "team" },
    { id: "other", name: "sports.other", value: "other" },
  ],

  cycling: [
    {
      id: "road_racing",
      name: "positions.cycling.roadRacing",
      value: "road_racing",
    },
    {
      id: "track_cycling",
      name: "positions.cycling.trackCycling",
      value: "track_cycling",
    },
    {
      id: "mountain_biking",
      name: "positions.cycling.mountainBiking",
      value: "mountain_biking",
    },
    { id: "bmx", name: "positions.cycling.bmx", value: "bmx" },
    {
      id: "cyclocross",
      name: "positions.cycling.cyclocross",
      value: "cyclocross",
    },
    { id: "other", name: "sports.other", value: "other" },
  ],

  squash: [
    { id: "singles", name: "positions.squash.singles", value: "singles" },
    { id: "doubles", name: "positions.squash.doubles", value: "doubles" },
    { id: "other", name: "sports.other", value: "other" },
  ],

  weightlifting: [
    { id: "snatch", name: "positions.weightlifting.snatch", value: "snatch" },
    {
      id: "clean_jerk",
      name: "positions.weightlifting.cleanJerk",
      value: "clean_jerk",
    },
    {
      id: "powerlifting",
      name: "positions.weightlifting.powerlifting",
      value: "powerlifting",
    },
    { id: "other", name: "sports.other", value: "other" },
  ],

  boxing: [
    {
      id: "lightweight",
      name: "positions.boxing.lightweight",
      value: "lightweight",
    },
    {
      id: "welterweight",
      name: "positions.boxing.welterweight",
      value: "welterweight",
    },
    {
      id: "middleweight",
      name: "positions.boxing.middleweight",
      value: "middleweight",
    },
    {
      id: "heavyweight",
      name: "positions.boxing.heavyweight",
      value: "heavyweight",
    },
    { id: "other", name: "sports.other", value: "other" },
  ],

  gymnastics: [
    {
      id: "floor_exercise",
      name: "positions.gymnastics.floorExercise",
      value: "floor_exercise",
    },
    {
      id: "pommel_horse",
      name: "positions.gymnastics.pommelHorse",
      value: "pommel_horse",
    },
    {
      id: "still_rings",
      name: "positions.gymnastics.stillRings",
      value: "still_rings",
    },
    { id: "vault", name: "positions.gymnastics.vault", value: "vault" },
    {
      id: "parallel_bars",
      name: "positions.gymnastics.parallelBars",
      value: "parallel_bars",
    },
    {
      id: "horizontal_bar",
      name: "positions.gymnastics.horizontalBar",
      value: "horizontal_bar",
    },
    {
      id: "uneven_bars",
      name: "positions.gymnastics.unevenBars",
      value: "uneven_bars",
    },
    {
      id: "balance_beam",
      name: "positions.gymnastics.balanceBeam",
      value: "balance_beam",
    },
    {
      id: "rhythmic",
      name: "positions.gymnastics.rhythmic",
      value: "rhythmic",
    },
    {
      id: "trampoline",
      name: "positions.gymnastics.trampoline",
      value: "trampoline",
    },
    { id: "other", name: "sports.other", value: "other" },
  ],

  billiards: [
    {
      id: "eight_ball",
      name: "positions.billiards.eightBall",
      value: "eight_ball",
    },
    {
      id: "nine_ball",
      name: "positions.billiards.nineBall",
      value: "nine_ball",
    },
    { id: "snooker", name: "positions.billiards.snooker", value: "snooker" },
    {
      id: "straight_pool",
      name: "positions.billiards.straightPool",
      value: "straight_pool",
    },
    { id: "other", name: "sports.other", value: "other" },
  ],
};

export const statusOptions = [
  { id: "available", name: "player.status.freeAgent", value: "available" },
  { id: "contracted", name: "player.status.contracted", value: "contracted" },
  {
    id: "transferred",
    name: "player.status.transferred",
    value: "transferred",
  },
];

export const categoryOptions = [
  { id: "elite", name: "players.category.elite", value: "elite" },
  {
    id: "professional",
    name: "players.category.professional",
    value: "professional",
  },
  { id: "amateur", name: "players.category.amateur", value: "amateur" },
];

export const genderOptions = [
  { id: "Male", name: "registerProfile.form.personalInfo.male", value: "male" },
  {
    id: "Female",
    name: "registerProfile.form.personalInfo.female",
    value: "female",
  },
];

export const currencyOptions = [
  { id: "SAR", name: "SAR", value: "SAR" },
  { id: "USD", name: "USD", value: "USD" },
  { id: "EUR", name: "EUR", value: "EUR" },
  { id: "GBP", name: "GBP", value: "GBP" },
];

export const playerRoleTypes = [
  {
    id: "youth_player",
    name: "playerRoles.youthPlayer",
    value: "youth_player",
  },
  {
    id: "junior_player",
    name: "playerRoles.juniorPlayer",
    value: "junior_player",
  },
  {
    id: "first_team_player",
    name: "playerRoles.firstTeamPlayer",
    value: "first_team_player",
  },
  {
    id: "reserve_player",
    name: "playerRoles.reservePlayer",
    value: "reserve_player",
  },
  {
    id: "professional_player",
    name: "playerRoles.professionalPlayer",
    value: "professional_player",
  },
  {
    id: "amateur_player",
    name: "playerRoles.amateurPlayer",
    value: "amateur_player",
  },
  {
    id: "academy_player",
    name: "playerRoles.academyPlayer",
    value: "academy_player",
  },
  {
    id: "other",
    name: "playerRoles.other",
    value: "other",
  },
];

export const coachRoleTypes = [
  { id: "head_coach", name: "coachRoles.headCoach", value: "head_coach" },
  {
    id: "assistant_coach",
    name: "coachRoles.assistantCoach",
    value: "assistant_coach",
  },
  {
    id: "goalkeeper_coach",
    name: "coachRoles.goalkeeperCoach",
    value: "goalkeeper_coach",
  },
  {
    id: "fitness_coach",
    name: "coachRoles.fitnessCoach",
    value: "fitness_coach",
  },
  {
    id: "technical_coach",
    name: "coachRoles.technicalCoach",
    value: "technical_coach",
  },
  { id: "youth_coach", name: "coachRoles.youthCoach", value: "youth_coach" },
  { id: "physio", name: "coachRoles.physio", value: "physio" },
  {
    id: "tactical_analyst",
    name: "coachRoles.tacticalAnalyst",
    value: "tactical_analyst",
  },
  {
    id: "strength_conditioning_coach",
    name: "coachRoles.strengthConditioningCoach",
    value: "strength_conditioning_coach",
  },
  {
    id: "other",
    name: "coachRoles.other",
    value: "other",
  },
];

export const nationalities = [
  { id: "saudi", name: "nationalities.saudi", value: "saudi" },
  { id: "uae", name: "nationalities.uae", value: "uae" },
  { id: "egypt", name: "nationalities.egypt", value: "egypt" },
  { id: "morocco", name: "nationalities.morocco", value: "morocco" },
  { id: "kuwait", name: "nationalities.kuwait", value: "kuwait" },
  { id: "qatar", name: "nationalities.qatar", value: "qatar" },
  { id: "bahrain", name: "nationalities.bahrain", value: "bahrain" },
  { id: "oman", name: "nationalities.oman", value: "oman" },
  { id: "jordan", name: "nationalities.jordan", value: "jordan" },
  { id: "lebanon", name: "nationalities.lebanon", value: "lebanon" },
  { id: "syria", name: "nationalities.syria", value: "syria" },
  { id: "iraq", name: "nationalities.iraq", value: "iraq" },
  { id: "libya", name: "nationalities.libya", value: "libya" },
  { id: "tunisia", name: "nationalities.tunisia", value: "tunisia" },
  { id: "algeria", name: "nationalities.algeria", value: "algeria" },
  { id: "sudan", name: "nationalities.sudan", value: "sudan" },
  { id: "yemen", name: "nationalities.yemen", value: "yemen" },
  { id: "other", name: "nationalities.other", value: "other" },
];

export const formSections = [
  {
    id: "personal",
    titleKey: "registerProfile.sections.personal",
    icon: "👤",
    description: "Personal and basic information",
  },
  {
    id: "sports",
    titleKey: "registerProfile.sections.sports",
    icon: "⚽",
    description: "Sports and position details",
  },
  {
    id: "financial",
    titleKey: "registerProfile.sections.financial",
    icon: "💰",
    description: "Salary and contract information",
  },
  {
    id: "transfer",
    titleKey: "registerProfile.sections.transfer",
    icon: "🔄",
    description: "Transfer and contract details",
  },
  {
    id: "contact",
    titleKey: "registerProfile.sections.contact",
    icon: "📞",
    description: "Contact and agent information",
  },
  {
    id: "social",
    titleKey: "registerProfile.sections.social",
    icon: "🌐",
    description: "Social media links",
  },
  {
    id: "media",
    titleKey: "registerProfile.sections.media",
    icon: "📁",
    description: "Photos, videos and documents",
  },
  {
    id: "terms",
    titleKey: "registerProfile.sections.terms",
    icon: "📋",
    description: "Terms and conditions",
  },
];
