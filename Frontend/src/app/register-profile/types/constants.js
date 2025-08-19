export const sportsOptions = [
  { id: "handball", name: "sports.handball", value: "handball" },
  { id: "basketball", name: "sports.basketball", value: "basketball" },
  { id: "volleyball", name: "sports.volleyball", value: "volleyball" },
  { id: "badminton", name: "sports.badminton", value: "badminton" },
  { id: "athletics", name: "sports.athletics", value: "athletics" },
  { id: "tennis", name: "sports.tennis", value: "tennis" },
  { id: "tabletennis", name: "sports.tabletennis", value: "tabletennis" },
  { id: "karate", name: "sports.karate", value: "karate" },
  { id: "taekwondo", name: "sports.taekwondo", value: "taekwondo" },
  { id: "archery", name: "sports.archery", value: "archery" },
  { id: "esports", name: "sports.esports", value: "esports" },
  { id: "swimming", name: "sports.swimming", value: "swimming" },
  { id: "judo", name: "sports.judo", value: "judo" },
  { id: "fencing", name: "sports.fencing", value: "fencing" },
  { id: "cycling", name: "sports.cycling", value: "cycling" },
  { id: "squash", name: "sports.squash", value: "squash" },
  { id: "weightlifting", name: "sports.weightlifting", value: "weightlifting" },
  { id: "futsal", name: "sports.futsal", value: "futsal" },
  { id: "boxing", name: "sports.boxing", value: "boxing" },
  { id: "gymnastics", name: "sports.gymnastics", value: "gymnastics" },
  { id: "billiards", name: "sports.billiards", value: "billiards" },
  { id: "wrestling", name: "sports.wrestling", value: "wrestling" },
];

export const positionOptions = [
  { id: "goalkeeper", name: "positions.goalkeeper", value: "goalkeeper" },
  { id: "defender", name: "positions.defender", value: "defender" },
  { id: "midfielder", name: "positions.midfielder", value: "midfielder" },
  { id: "forward", name: "positions.forward", value: "forward" },
  { id: "striker", name: "positions.striker", value: "striker" },
  { id: "center", name: "positions.center", value: "center" },
  { id: "point_guard", name: "positions.point_guard", value: "point_guard" },
  {
    id: "shooting_guard",
    name: "positions.shooting_guard",
    value: "shooting_guard",
  },
  {
    id: "small_forward",
    name: "positions.small_forward",
    value: "small_forward",
  },
  {
    id: "power_forward",
    name: "positions.power_forward",
    value: "power_forward",
  },
  { id: "setter", name: "positions.setter", value: "setter" },
  {
    id: "outside_hitter",
    name: "positions.outside_hitter",
    value: "outside_hitter",
  },
  {
    id: "middle_blocker",
    name: "positions.middle_blocker",
    value: "middle_blocker",
  },
  { id: "libero", name: "positions.libero", value: "libero" },
  { id: "singles", name: "positions.singles", value: "singles" },
  { id: "doubles", name: "positions.doubles", value: "doubles" },
  {
    id: "mixed_doubles",
    name: "positions.mixed_doubles",
    value: "mixed_doubles",
  },
  { id: "team", name: "positions.team", value: "team" },
  { id: "individual", name: "positions.individual", value: "individual" },
  { id: "coach", name: "positions.coach", value: "coach" },
  { id: "trainer", name: "positions.trainer", value: "trainer" },
  { id: "instructor", name: "positions.instructor", value: "instructor" },
];

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

// Player role types
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
];

// Coach role types
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

// Sport-specific positions mapping
export const sportPositions = {
  handball: [
    {
      id: "goalkeeper",
      name: "positions.handball.goalkeeper",
      value: "goalkeeper",
    },
    {
      id: "left_wing",
      name: "positions.handball.leftWing",
      value: "left_wing",
    },
    {
      id: "left_back",
      name: "positions.handball.leftBack",
      value: "left_back",
    },
    {
      id: "center_back",
      name: "positions.handball.centerBack",
      value: "center_back",
    },
    {
      id: "right_back",
      name: "positions.handball.rightBack",
      value: "right_back",
    },
    {
      id: "right_wing",
      name: "positions.handball.rightWing",
      value: "right_wing",
    },
    { id: "pivot", name: "positions.handball.pivot", value: "pivot" },
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
    { id: "center", name: "positions.basketball.center", value: "center" },
  ],
  volleyball: [
    { id: "setter", name: "positions.volleyball.setter", value: "setter" },
    {
      id: "outside_hitter",
      name: "positions.volleyball.outsideHitter",
      value: "outside_hitter",
    },
    {
      id: "middle_blocker",
      name: "positions.volleyball.middleBlocker",
      value: "middle_blocker",
    },
    {
      id: "opposite_hitter",
      name: "positions.volleyball.oppositeHitter",
      value: "opposite_hitter",
    },
    { id: "libero", name: "positions.volleyball.libero", value: "libero" },
    {
      id: "defensive_specialist",
      name: "positions.volleyball.defensiveSpecialist",
      value: "defensive_specialist",
    },
  ],
  badminton: [
    { id: "singles", name: "positions.badminton.singles", value: "singles" },
    { id: "doubles", name: "positions.badminton.doubles", value: "doubles" },
    {
      id: "mixed_doubles",
      name: "positions.badminton.mixedDoubles",
      value: "mixed_doubles",
    },
  ],
  athletics: [
    { id: "sprinter", name: "positions.athletics.sprinter", value: "sprinter" },
    {
      id: "middle_distance",
      name: "positions.athletics.middleDistance",
      value: "middle_distance",
    },
    {
      id: "long_distance",
      name: "positions.athletics.longDistance",
      value: "long_distance",
    },
    { id: "hurdler", name: "positions.athletics.hurdler", value: "hurdler" },
    {
      id: "high_jump",
      name: "positions.athletics.highJump",
      value: "high_jump",
    },
    {
      id: "long_jump",
      name: "positions.athletics.longJump",
      value: "long_jump",
    },
    {
      id: "pole_vault",
      name: "positions.athletics.poleVault",
      value: "pole_vault",
    },
    { id: "shot_put", name: "positions.athletics.shotPut", value: "shot_put" },
    { id: "discus", name: "positions.athletics.discus", value: "discus" },
    { id: "javelin", name: "positions.athletics.javelin", value: "javelin" },
    {
      id: "hammer_throw",
      name: "positions.athletics.hammerThrow",
      value: "hammer_throw",
    },
    {
      id: "decathlon",
      name: "positions.athletics.decathlon",
      value: "decathlon",
    },
    {
      id: "heptathlon",
      name: "positions.athletics.heptathlon",
      value: "heptathlon",
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
  ],
  tabletennis: [
    { id: "singles", name: "positions.tabletennis.singles", value: "singles" },
    { id: "doubles", name: "positions.tabletennis.doubles", value: "doubles" },
    {
      id: "mixed_doubles",
      name: "positions.tabletennis.mixedDoubles",
      value: "mixed_doubles",
    },
  ],
  karate: [
    { id: "kata", name: "positions.karate.kata", value: "kata" },
    { id: "kumite", name: "positions.karate.kumite", value: "kumite" },
    { id: "team_kata", name: "positions.karate.teamKata", value: "team_kata" },
  ],
  taekwondo: [
    { id: "poomsae", name: "positions.taekwondo.poomsae", value: "poomsae" },
    { id: "kyorugi", name: "positions.taekwondo.kyorugi", value: "kyorugi" },
    { id: "breaking", name: "positions.taekwondo.breaking", value: "breaking" },
  ],
  archery: [
    { id: "recurve", name: "positions.archery.recurve", value: "recurve" },
    { id: "compound", name: "positions.archery.compound", value: "compound" },
    { id: "barebow", name: "positions.archery.barebow", value: "barebow" },
    {
      id: "traditional",
      name: "positions.archery.traditional",
      value: "traditional",
    },
  ],
  esports: [
    { id: "shooter", name: "positions.esports.shooter", value: "shooter" },
    { id: "strategy", name: "positions.esports.strategy", value: "strategy" },
    { id: "moba", name: "positions.esports.moba", value: "moba" },
    { id: "racing", name: "positions.esports.racing", value: "racing" },
    { id: "fighting", name: "positions.esports.fighting", value: "fighting" },
    {
      id: "sports_simulation",
      name: "positions.esports.sportsSimulation",
      value: "sports_simulation",
    },
  ],
  swimming: [
    {
      id: "freestyle",
      name: "positions.swimming.freestyle",
      value: "freestyle",
    },
    {
      id: "backstroke",
      name: "positions.swimming.backstroke",
      value: "backstroke",
    },
    {
      id: "breaststroke",
      name: "positions.swimming.breaststroke",
      value: "breaststroke",
    },
    {
      id: "butterfly",
      name: "positions.swimming.butterfly",
      value: "butterfly",
    },
    {
      id: "individual_medley",
      name: "positions.swimming.individualMedley",
      value: "individual_medley",
    },
    { id: "relay", name: "positions.swimming.relay", value: "relay" },
    {
      id: "open_water",
      name: "positions.swimming.openWater",
      value: "open_water",
    },
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
  ],
  fencing: [
    { id: "foil", name: "positions.fencing.foil", value: "foil" },
    { id: "epee", name: "positions.fencing.epee", value: "epee" },
    { id: "sabre", name: "positions.fencing.sabre", value: "sabre" },
    { id: "team", name: "positions.fencing.team", value: "team" },
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
  ],
  squash: [
    { id: "singles", name: "positions.squash.singles", value: "singles" },
    { id: "doubles", name: "positions.squash.doubles", value: "doubles" },
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
  ],
  futsal: [
    {
      id: "goalkeeper",
      name: "positions.futsal.goalkeeper",
      value: "goalkeeper",
    },
    { id: "defender", name: "positions.futsal.defender", value: "defender" },
    {
      id: "midfielder",
      name: "positions.futsal.midfielder",
      value: "midfielder",
    },
    { id: "forward", name: "positions.futsal.forward", value: "forward" },
    { id: "pivot", name: "positions.futsal.pivot", value: "pivot" },
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
      id: "folkstyle",
      name: "positions.wrestling.folkstyle",
      value: "folkstyle",
    },
  ],
};
