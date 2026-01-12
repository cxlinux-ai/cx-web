export interface ChampionAmbassador {
  name: string;
  title: string;
  achievement: string;
  achievementDetail: string;
  reach: string;
  github: string;
  avatar: string;
  linkedin?: string;
  quote?: string;
}

export const championAmbassador: ChampionAmbassador = {
  name: "Suyash Dongre",
  title: "Hackathon Champion Ambassador",
  achievement: "Smart India Hackathon Grand Final Winner",
  achievementDetail: "Won ₹300,000 in India's largest hackathon",
  reach: "50K+ India dev community",
  github: "suyashdongre",
  avatar: "https://github.com/suyashdongre.png",
  quote: "The best hackathons are BUILD competitions. Ship code, not slide decks."
};
