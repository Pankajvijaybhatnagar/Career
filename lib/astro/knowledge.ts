import type { PlanetId } from "./engine";

export type Stream = "Science (PCM)" | "Science (PCB)" | "Commerce" | "Humanities / Arts" | "Any stream";

export type CareerField = {
  id: string;
  name: string;
  icon: string;
  weights: Partial<Record<PlanetId, number>>;
  houses: number[]; // houses that support this field
  stream: Stream[];
  description: string;
  careers: string[];
  courses: string[];
  skills: string[];
};

export const CAREER_FIELDS: CareerField[] = [
  {
    id: "engineering", name: "Engineering & Technology", icon: "⚙️",
    weights: { Mars: 3, Saturn: 2.5, Mercury: 1.5, Rahu: 2, Sun: 0.5 }, houses: [3, 6, 10],
    stream: ["Science (PCM)"],
    description: "Building, designing and fixing machines, structures and systems. Suits children who like to know how things work and enjoy solving practical problems.",
    careers: ["Mechanical Engineer", "Civil Engineer", "Electrical Engineer", "Robotics Engineer", "Automobile Engineer"],
    courses: ["B.Tech / B.E.", "Diploma in Engineering", "JEE Main / Advanced preparation"],
    skills: ["Logical thinking", "Mathematics", "Hands-on problem solving"],
  },
  {
    id: "computers", name: "Computer Science, AI & Data", icon: "💻",
    weights: { Mercury: 3, Rahu: 3, Saturn: 1.5, Ketu: 1.5, Mars: 1 }, houses: [3, 5, 10, 11],
    stream: ["Science (PCM)", "Commerce"],
    description: "Software, artificial intelligence, data science and cyber security. Suits sharp, curious minds who enjoy puzzles, patterns and new technology.",
    careers: ["Software Developer", "AI / ML Engineer", "Data Scientist", "Cyber Security Analyst", "Game Developer"],
    courses: ["B.Tech CSE / IT", "BCA → MCA", "B.Sc Data Science"],
    skills: ["Coding", "Analytical reasoning", "Continuous learning"],
  },
  {
    id: "medicine", name: "Medicine & Healthcare", icon: "🩺",
    weights: { Sun: 2.5, Moon: 2, Mars: 2, Jupiter: 2, Ketu: 2 }, houses: [1, 6, 8, 12],
    stream: ["Science (PCB)"],
    description: "Healing and caring for people as a doctor, surgeon, dentist or allied health professional. Needs patience, compassion and years of disciplined study.",
    careers: ["Doctor (MBBS)", "Surgeon", "Dentist", "Physiotherapist", "Pharmacist", "Nurse"],
    courses: ["MBBS / BDS via NEET", "B.Pharm", "BPT", "B.Sc Nursing"],
    skills: ["Empathy", "Biology", "Stamina for long study"],
  },
  {
    id: "research", name: "Research & Pure Sciences", icon: "🔬",
    weights: { Ketu: 3, Saturn: 2, Jupiter: 2, Mercury: 1.5, Moon: 0.5 }, houses: [5, 8, 9, 12],
    stream: ["Science (PCM)", "Science (PCB)"],
    description: "Discovering new knowledge in physics, chemistry, biology, space or mathematics. Suits deep thinkers who enjoy spending long hours on one topic.",
    careers: ["Scientist", "ISRO / DRDO Researcher", "Biotechnologist", "Mathematician", "Professor"],
    courses: ["B.Sc → M.Sc → PhD", "IISER / IISc BS-MS", "Integrated M.Sc"],
    skills: ["Curiosity", "Concentration", "Patience"],
  },
  {
    id: "finance", name: "Commerce, Finance & Accounts", icon: "📊",
    weights: { Mercury: 3, Jupiter: 2.5, Venus: 1.5, Saturn: 1 }, houses: [2, 11, 10],
    stream: ["Commerce"],
    description: "Managing money, accounts, taxes and investments. Suits children who are good with numbers, careful with details and interested in how money works.",
    careers: ["Chartered Accountant", "Company Secretary", "Investment Banker", "Financial Analyst", "Actuary"],
    courses: ["CA / CS / CMA", "B.Com (Hons)", "BBA Finance", "B.Sc Economics"],
    skills: ["Numerical ability", "Accuracy", "Ethics"],
  },
  {
    id: "business", name: "Business & Entrepreneurship", icon: "🚀",
    weights: { Mars: 2, Mercury: 2, Sun: 1.5, Rahu: 2.5, Venus: 1 }, houses: [3, 7, 10, 11],
    stream: ["Commerce", "Any stream"],
    description: "Starting and running businesses, sales, marketing and management. Suits confident, risk-taking children who like to lead and convince others.",
    careers: ["Entrepreneur", "Marketing Manager", "Business Analyst", "Sales Leader", "Family business"],
    courses: ["BBA → MBA", "B.Com + Entrepreneurship", "IPM (IIM integrated)"],
    skills: ["Leadership", "Communication", "Risk taking"],
  },
  {
    id: "law", name: "Law & Judiciary", icon: "⚖️",
    weights: { Jupiter: 3, Saturn: 2, Sun: 1.5, Mercury: 1.5 }, houses: [6, 7, 9, 10],
    stream: ["Humanities / Arts", "Commerce"],
    description: "Justice, legal advice and argument in court. Suits children with a strong sense of right and wrong who argue well and love reading.",
    careers: ["Advocate", "Corporate Lawyer", "Judge", "Legal Advisor", "Cyber Law Expert"],
    courses: ["BA LLB / BBA LLB via CLAT", "LLB after graduation"],
    skills: ["Reasoning", "Public speaking", "Reading & writing"],
  },
  {
    id: "civil", name: "Civil Services & Administration", icon: "🏛️",
    weights: { Sun: 3, Saturn: 2, Jupiter: 1.5, Mars: 1.5, Mercury: 0.5 }, houses: [1, 10, 6, 11],
    stream: ["Any stream"],
    description: "Serving the nation as an IAS, IPS, IFS or state officer. Suits children with leadership, discipline and a wish to serve society.",
    careers: ["IAS / IPS / IFS Officer", "State PCS Officer", "Bank PO", "Government Administrator"],
    courses: ["Any graduation + UPSC / State PSC", "BA Political Science / History"],
    skills: ["General awareness", "Discipline", "Decision making"],
  },
  {
    id: "defence", name: "Defence, Police & Sports", icon: "🎖️",
    weights: { Mars: 3.5, Sun: 2, Saturn: 1, Rahu: 0.5 }, houses: [1, 3, 6, 10],
    stream: ["Any stream", "Science (PCM)"],
    description: "Army, Navy, Air Force, police services and professional sports. Suits energetic, brave and physically active children.",
    careers: ["Army / Navy / Air Force Officer", "Police Officer", "Professional Athlete", "Sports Coach", "Fitness Expert"],
    courses: ["NDA after Class 12", "CDS after graduation", "B.P.Ed / Sports academies"],
    skills: ["Courage", "Fitness", "Team spirit"],
  },
  {
    id: "teaching", name: "Teaching, Education & Guidance", icon: "📚",
    weights: { Jupiter: 3.5, Mercury: 1.5, Moon: 1.5, Sun: 0.5 }, houses: [4, 5, 9],
    stream: ["Any stream"],
    description: "Teaching, training and guiding others. Suits kind, patient children who enjoy explaining things to friends and siblings.",
    careers: ["Teacher / Professor", "Education Counsellor", "Corporate Trainer", "EdTech Content Creator", "Principal"],
    courses: ["B.Ed after graduation", "B.El.Ed", "M.A. / M.Sc + NET"],
    skills: ["Patience", "Explaining clearly", "Subject depth"],
  },
  {
    id: "arts", name: "Arts, Design & Fashion", icon: "🎨",
    weights: { Venus: 3.5, Moon: 1.5, Rahu: 1.5, Mercury: 0.5 }, houses: [3, 5, 12],
    stream: ["Humanities / Arts", "Any stream"],
    description: "Painting, design, fashion, architecture, music and performing arts. Suits creative children with a strong sense of beauty and style.",
    careers: ["Graphic / UI Designer", "Fashion Designer", "Architect", "Interior Designer", "Musician / Dancer", "Animator"],
    courses: ["B.Des (NID / NIFT)", "B.Arch via NATA", "BFA", "Animation courses"],
    skills: ["Creativity", "Visual sense", "Practice"],
  },
  {
    id: "media", name: "Media, Writing & Communication", icon: "🎙️",
    weights: { Mercury: 3, Venus: 1.5, Moon: 1.5, Rahu: 1.5, Jupiter: 0.5 }, houses: [2, 3, 5],
    stream: ["Humanities / Arts", "Any stream"],
    description: "Journalism, writing, anchoring, content creation and public relations. Suits talkative, expressive children who love stories and people.",
    careers: ["Journalist", "News Anchor", "Content Writer", "Digital Marketer", "Film Maker", "PR Manager"],
    courses: ["BJMC / Mass Communication", "BA English", "Film & Media courses"],
    skills: ["Expression", "Language", "Confidence on camera"],
  },
  {
    id: "hospitality", name: "Hospitality, Tourism & Food", icon: "🏨",
    weights: { Moon: 2.5, Venus: 2.5, Rahu: 1, Jupiter: 0.5 }, houses: [2, 4, 7, 12],
    stream: ["Any stream"],
    description: "Hotels, travel, events, airlines and the culinary arts. Suits friendly, well-mannered children who enjoy making others comfortable.",
    careers: ["Hotel Manager", "Chef", "Event Manager", "Travel Consultant", "Cabin Crew"],
    courses: ["BHM via NCHMCT JEE", "Culinary Arts", "BBA Tourism"],
    skills: ["Hospitality", "Presentation", "People skills"],
  },
  {
    id: "psychology", name: "Psychology & Social Work", icon: "💞",
    weights: { Moon: 3, Jupiter: 2, Ketu: 1.5, Venus: 0.5 }, houses: [4, 8, 12],
    stream: ["Humanities / Arts", "Science (PCB)"],
    description: "Understanding the mind, counselling and helping communities. Suits sensitive, understanding children who are good listeners.",
    careers: ["Psychologist", "Counsellor", "Social Worker", "NGO Leader", "HR Professional"],
    courses: ["BA / B.Sc Psychology", "MSW", "M.A. Clinical Psychology"],
    skills: ["Listening", "Empathy", "Observation"],
  },
  {
    id: "aviation", name: "Aviation, Shipping & Foreign Careers", icon: "✈️",
    weights: { Rahu: 3, Mars: 1.5, Moon: 1.5, Saturn: 1 }, houses: [9, 12, 3],
    stream: ["Science (PCM)", "Any stream"],
    description: "Flying, merchant navy, international business and careers abroad. Suits adventurous children who dream of travel and new places.",
    careers: ["Commercial Pilot", "Merchant Navy Officer", "Foreign Services", "International Business", "Study & work abroad"],
    courses: ["CPL pilot training", "B.Sc Nautical Science", "International Relations"],
    skills: ["Adaptability", "Alertness", "Language"],
  },
  {
    id: "agri", name: "Agriculture, Environment & Real Estate", icon: "🌱",
    weights: { Saturn: 2, Moon: 1.5, Venus: 1, Mars: 1.5 }, houses: [4, 6, 10],
    stream: ["Science (PCB)", "Science (PCM)", "Any stream"],
    description: "Farming technology, environment, forestry and land or property. Suits grounded children who love nature and practical work.",
    careers: ["Agricultural Scientist", "Environmental Engineer", "Forest Officer", "Real Estate Developer", "Food Technologist"],
    courses: ["B.Sc Agriculture", "B.Tech Environmental", "Food Technology"],
    skills: ["Practicality", "Love for nature", "Consistency"],
  },
];

export type PlanetInfo = {
  karaka: string;
  strengths: string[];
  challenges: string[];
  parentTip: string;
  remedy: string;
  colour: string;
  day: string;
  mantra: string;
  dashaStudent: string;
};

export const PLANET_INFO: Record<PlanetId, PlanetInfo> = {
  Sun: {
    karaka: "Soul, confidence, father, authority, government",
    strengths: ["Natural leadership", "Self-confidence", "Sense of responsibility"],
    challenges: ["Ego or stubbornness", "Dislikes being corrected"],
    parentTip: "Give the child small leadership roles at home and in school. Praise effort in public and correct mistakes in private.",
    remedy: "Offer water to the rising Sun, wake up early, and respect elders and the father.",
    colour: "Orange / Saffron", day: "Sunday", mantra: "Om Suryaya Namah",
    dashaStudent: "Confidence and recognition grow. Good for leadership roles, government exams and science subjects.",
  },
  Moon: {
    karaka: "Mind, emotions, mother, memory, public",
    strengths: ["Imagination", "Good memory", "Caring nature"],
    challenges: ["Mood swings", "Gets affected by others' opinions"],
    parentTip: "Keep a calm, loving home routine. Talk to the child daily about feelings, and avoid comparing them with other children.",
    remedy: "Spend time with the mother, drink enough water, meditate for 10 minutes, and wear white on Mondays.",
    colour: "White / Silver", day: "Monday", mantra: "Om Chandraya Namah",
    dashaStudent: "Emotional growth and creativity. Needs a peaceful study environment; memory-based subjects go well.",
  },
  Mars: {
    karaka: "Energy, courage, siblings, engineering, sports",
    strengths: ["Courage", "High energy", "Technical and competitive spirit"],
    challenges: ["Anger or impatience", "Impulsive decisions"],
    parentTip: "Channel the child's energy into sports, martial arts or robotics. Teach anger management through physical activity.",
    remedy: "Daily exercise or sport, recite the Hanuman Chalisa on Tuesdays, and avoid fights with siblings.",
    colour: "Red", day: "Tuesday", mantra: "Om Mangalaya Namah",
    dashaStudent: "Drive to compete. Good for entrance exams, sports and technical studies; watch for anger and accidents.",
  },
  Mercury: {
    karaka: "Intelligence, speech, logic, mathematics, business",
    strengths: ["Quick learning", "Communication", "Mathematical and analytical ability"],
    challenges: ["Restlessness", "Nervousness or overthinking"],
    parentTip: "Encourage puzzles, reading, debates and learning languages. Break study into short, focused sessions.",
    remedy: "Feed green fodder to cows, respect teachers, and practise writing and speaking every day.",
    colour: "Green", day: "Wednesday", mantra: "Om Budhaya Namah",
    dashaStudent: "Excellent for studies, exams, communication and learning computers, commerce or languages.",
  },
  Jupiter: {
    karaka: "Wisdom, teachers, higher education, ethics, children",
    strengths: ["Wisdom", "Good values", "Love for learning"],
    challenges: ["Over-confidence", "Laziness when things come easily"],
    parentTip: "Connect the child with good mentors and teachers. Encourage reading, value-based stories and higher goals.",
    remedy: "Respect teachers and gurus, feed the needy on Thursdays, and keep books clean and organised.",
    colour: "Yellow", day: "Thursday", mantra: "Om Gurave Namah",
    dashaStudent: "The best period for higher education, guidance from teachers and admissions to good institutions.",
  },
  Venus: {
    karaka: "Arts, beauty, comfort, luxury, creativity",
    strengths: ["Creativity", "Artistic taste", "Charm and diplomacy"],
    challenges: ["Love for comfort", "Distraction through entertainment"],
    parentTip: "Nurture art, music or design hobbies. Set limits on screen time and entertainment during exam months.",
    remedy: "Keep surroundings clean and beautiful, respect women, and wear white or light pink on Fridays.",
    colour: "White / Pink", day: "Friday", mantra: "Om Shukraya Namah",
    dashaStudent: "Creative talents shine. Good for arts, design, media and hospitality; guard against distractions.",
  },
  Saturn: {
    karaka: "Discipline, hard work, patience, technical and public service",
    strengths: ["Discipline", "Persistence", "Deep focus"],
    challenges: ["Slow start", "Fear or low self-belief"],
    parentTip: "Be patient: this child blooms later but lasts longer. Build fixed routines and reward consistency over speed.",
    remedy: "Help elders and workers, be punctual, and light a mustard oil lamp on Saturdays.",
    colour: "Navy blue / Black", day: "Saturday", mantra: "Om Shanaischaraya Namah",
    dashaStudent: "Hard work brings slow but solid results. Excellent for technical and research fields if the child stays disciplined.",
  },
  Rahu: {
    karaka: "Technology, foreign lands, innovation, unconventional paths",
    strengths: ["Out-of-the-box thinking", "Interest in technology", "Ambition"],
    challenges: ["Confusion", "Addiction to gadgets or shortcuts"],
    parentTip: "Guide the child's ambition with clear goals. Monitor internet use while encouraging coding and technology projects.",
    remedy: "Keep the room free of clutter, feed birds, and chant Durga or Saraswati mantras.",
    colour: "Smoky grey / Blue", day: "Saturday", mantra: "Om Rahave Namah",
    dashaStudent: "Sudden opportunities, technology, foreign education and unconventional careers. Needs clarity of goals.",
  },
  Ketu: {
    karaka: "Research, spirituality, intuition, detail and coding",
    strengths: ["Intuition", "Deep research ability", "Detachment from distraction"],
    challenges: ["Lack of direction", "Isolation or low motivation"],
    parentTip: "Give the child space for their deep interests. Encourage research projects and meditation, and include them in family decisions.",
    remedy: "Worship Lord Ganesha, feed stray dogs, and practise meditation or yoga.",
    colour: "Grey / Multicolour", day: "Tuesday", mantra: "Om Ketave Namah",
    dashaStudent: "Deep focus on a few subjects; good for research, computers and spiritual growth. May feel directionless at times.",
  },
};

export const LAGNA_TEXT: string[] = [
  "Aries Lagna gives an energetic, brave and competitive child who loves to be first. They learn by doing and need action-based, challenging goals.",
  "Taurus Lagna gives a calm, steady and practical child with a love for comfort, food and music. Once they start something, they finish it with patience.",
  "Gemini Lagna gives a curious, talkative and quick-witted child who learns many things at once. They are communicators and love variety.",
  "Cancer Lagna gives a sensitive, caring and imaginative child who is strongly attached to family. They do best in an emotionally secure environment.",
  "Leo Lagna gives a confident, generous child who is a natural leader and likes appreciation. They shine on stage and in positions of responsibility.",
  "Virgo Lagna gives an analytical, neat and detail-oriented child who likes perfection. They are excellent at studies that need accuracy and method.",
  "Libra Lagna gives a balanced, charming child who loves fairness and beauty. They are diplomatic and have good taste in art and design.",
  "Scorpio Lagna gives an intense, secretive and determined child with deep research ability. They investigate everything and never give up easily.",
  "Sagittarius Lagna gives an optimistic, honest and freedom-loving child who asks big questions. They love learning, travel and philosophy.",
  "Capricorn Lagna gives a disciplined, ambitious and responsible child who matures early. They plan for the long term and work hard.",
  "Aquarius Lagna gives an innovative, independent and friendly child who thinks differently. They are drawn to technology, science and social causes.",
  "Pisces Lagna gives a gentle, intuitive and creative child with a rich imagination. They are compassionate and artistic, with spiritual depth.",
];

export const MOON_TEXT: string[] = [
  "The mind is quick and enthusiastic but can become impatient. Short-term goals keep them motivated.",
  "The mind is stable and peaceful. They need a comfortable routine and a quiet study place.",
  "The mind is curious and restless, and loves conversation. Variety in study methods helps.",
  "The mind is emotional and nurturing. The mother's support greatly affects their performance.",
  "The mind is proud and warm-hearted. Appreciation works better than criticism.",
  "The mind is practical and a little worried. Checklists and planning reduce their anxiety.",
  "The mind seeks harmony and friends. Group study and a pleasant atmosphere help.",
  "The mind is deep and intense. They need trust and privacy, and they feel things strongly.",
  "The mind is optimistic and philosophical. They need freedom and a big purpose.",
  "The mind is serious and responsible. They may hide their feelings, so check in with them gently.",
  "The mind is independent and idea-driven. Let them experiment and explore.",
  "The mind is dreamy and sensitive. Music, art and meditation calm them.",
];

export const HOUSE_MEANING: Record<number, string> = {
  1: "Self, body and personality",
  2: "Speech, family and early learning",
  3: "Courage, skills and communication",
  4: "Mother, home, happiness and school education",
  5: "Intelligence, creativity and higher studies",
  6: "Competition, exams and service",
  7: "Partnerships and public dealing",
  8: "Research, secrets and sudden changes",
  9: "Luck, higher learning and teachers",
  10: "Career, profession and status",
  11: "Gains, achievements and friends",
  12: "Foreign lands, expenses and spirituality",
};
