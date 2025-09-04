
export const tWithFallback = (t, key, fallbackText = null) => {
  const translated = t(key);

  if (translated === key) {
  
    if (fallbackText) {
      return fallbackText;
    }


    const lastPart = key.split(".").pop();
    return formatKeyToText(lastPart);
  }

  return translated;
};

const formatKeyToText = (key) => {
  return (
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  );
};


export const translatePosition = (t, sport, position) => {
  const key = `positions.${sport}.${position}`;
  return tWithFallback(t, key, formatKeyToText(position));
};


export const translateNationality = (t, nationality) => {
  const key = `nationalities.${nationality}`;
  return tWithFallback(t, key, formatKeyToText(nationality));
};

export const translateSport = (t, sport) => {
  const key = `sports.${sport}`;
  return tWithFallback(t, key, formatKeyToText(sport));
};
