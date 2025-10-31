// questions.js
// This file contains all the quiz questions for the AI Quiz Nexus application.
// To add more questions, follow the existing structure:
// questions["Topic Title"][levelNumber] = [ { q: "...", options: [], answer: "..." }, ... ];
// For demonstration, higher levels reuse questions from lower levels. In a real application, each level would have unique questions.

const questions = {};

// --- Helper to create placeholder levels ---
function createPlaceholderLevels(topic, baseLevelData) {
    for (let i = 2; i <= 30; i++) {
        // Create variations for higher levels by slightly modifying the question text
        questions[topic][i] = baseLevelData.map(q => ({
            ...q,
            q: `(L${i}) ${q.q}` // Add a level indicator to show different data is loading
        }));
    }
}

// --- 1. Programming Languages ---
questions["Programming Languages"] = {};
questions["Programming Languages"][1] = [
    { q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink and Text Markup Language", "Home Tool Markup Language"], answer: "Hyper Text Markup Language" },
    { q: "Which language is primarily used for styling web pages?", options: ["HTML", "JQuery", "CSS", "Python"], answer: "CSS" },
    { q: "What is the correct syntax for a single-line comment in JavaScript?", options: ["// This is a comment", "<!-- This is a comment -->", "# This is a comment", "/* This is a comment */"], answer: "// This is a comment" },
    { q: "Which company developed JavaScript?", options: ["Microsoft", "Apple", "Netscape", "Google"], answer: "Netscape" },
    { q: "What keyword is used to declare a variable in JavaScript that cannot be reassigned?", options: ["const", "var", "let", "static"], answer: "const" },
    { q: "In Python, how do you print 'Hello, World!' to the console?", options: ["console.log('Hello, World!')", "echo 'Hello, World!'", "System.out.println('Hello, World!')", "print('Hello, World!')"], answer: "print('Hello, World!')" },
    { q: "Which of the following is a dynamically typed language?", options: ["C++", "Java", "Python", "C#"], answer: "Python" },
    { q: "What does SQL stand for?", options: ["Stylish Question Language", "Structured Query Language", "Statement Query Language", "Simple Question Language"], answer: "Structured Query Language" },
    { q: "Which tag is used to define an ordered list in HTML?", options: ["<li>", "<ol>", "<ul>", "<list>"], answer: "<ol>" },
    { q: "What is the file extension for a Python file?", options: [".py", ".pt", ".python", ".px"], answer: ".py" }
];
createPlaceholderLevels("Programming Languages", questions["Programming Languages"][1]);

// --- 2. World Knowledge ---
questions["World Knowledge"] = {};
questions["World Knowledge"][1] = [
    { q: "What is the capital of Japan?", options: ["Beijing", "Seoul", "Tokyo", "Bangkok"], answer: "Tokyo" },
    { q: "Which is the largest planet in our solar system?", options: ["Earth", "Mars", "Jupiter", "Saturn"], answer: "Jupiter" },
    { q: "What is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], answer: "Nile" },
    { q: "Who painted the Mona Lisa?", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet"], answer: "Leonardo da Vinci" },
    { q: "How many continents are there?", options: ["5", "6", "7", "8"], answer: "7" },
    { q: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: "Pacific" },
    { q: "In which country are the pyramids of Giza located?", options: ["Mexico", "Egypt", "Peru", "Sudan"], answer: "Egypt" },
    { q: "What is the main currency of the United Kingdom?", options: ["Euro", "Dollar", "Pound Sterling", "Yen"], answer: "Pound Sterling" },
    { q: "Which is the tallest mountain in the world?", options: ["K2", "Kangchenjunga", "Mount Everest", "Lhotse"], answer: "Mount Everest" },
    { q: "What is the national animal of Australia?", options: ["Koala", "Kangaroo", "Wombat", "Emu"], answer: "Kangaroo" }
];
createPlaceholderLevels("World Knowledge", questions["World Knowledge"][1]);

// --- 3. Biological Knowledge ---
questions["Biological Knowledge"] = {};
questions["Biological Knowledge"][1] = [
    { q: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondrion", "Golgi apparatus"], answer: "Mitochondrion" },
    { q: "What process do plants use to make their own food?", options: ["Respiration", "Transpiration", "Photosynthesis", "Pollination"], answer: "Photosynthesis" },
    { q: "What does DNA stand for?", options: ["Deoxyribonucleic Acid", "Dirobonucleic Acid", "Denatured Ribonucleic Acid", "Duonucleic Acid"], answer: "Deoxyribonucleic Acid" },
    { q: "Which part of the blood is responsible for clotting?", options: ["Red Blood Cells", "White Blood Cells", "Plasma", "Platelets"], answer: "Platelets" },
    { q: "Humans are examples of which type of animal?", options: ["Reptiles", "Amphibians", "Mammals", "Birds"], answer: "Mammals" },
    { q: "What is the largest organ in the human body?", options: ["Liver", "Brain", "Heart", "Skin"], answer: "Skin" },
    { q: "Which gas do plants absorb from the atmosphere?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: "Carbon Dioxide" },
    { q: "What is the study of fungi called?", options: ["Botany", "Zoology", "Mycology", "Virology"], answer: "Mycology" },
    { q: "How many bones are in the adult human body?", options: ["206", "212", "198", "220"], answer: "206" },
    { q: "What are the building blocks of proteins?", options: ["Carbohydrates", "Lipids", "Amino Acids", "Nucleotides"], answer: "Amino Acids" }
];
createPlaceholderLevels("Biological Knowledge", questions["Biological Knowledge"][1]);

// --- 4. Space and Astronomy ---
questions["Space and Astronomy"] = {};
questions["Space and Astronomy"][1] = [
    { q: "Which planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Mercury"], answer: "Mars" },
    { q: "What is the name of the galaxy we live in?", options: ["Andromeda", "Triangulum", "Whirlpool", "Milky Way"], answer: "Milky Way" },
    { q: "What is a light-year a unit of?", options: ["Time", "Distance", "Brightness", "Mass"], answer: "Distance" },
    { q: "Who was the first human to walk on the Moon?", options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "Michael Collins"], answer: "Neil Armstrong" },
    { q: "What is the center of our Solar System?", options: ["The Earth", "The Sun", "Jupiter", "A Black Hole"], answer: "The Sun" },
    { q: "Which planet is famous for its prominent rings?", options: ["Uranus", "Neptune", "Jupiter", "Saturn"], answer: "Saturn" },
    { q: "What is the name of the force that holds planets in orbit?", options: ["Electromagnetism", "Gravity", "Friction", "The Strong Force"], answer: "Gravity" },
    { q: "What is a large group of stars, dust, and gas bound together by gravity called?", options: ["A Solar System", "A Constellation", "A Galaxy", "A Nebula"], answer: "A Galaxy" },
    { q: "Which is the smallest planet in our solar system?", options: ["Mercury", "Pluto", "Mars", "Venus"], answer: "Mercury" },
    { q: "What is a shooting star?", options: ["A dying star", "A comet", "A meteoroid burning in the atmosphere", "An asteroid"], answer: "A meteoroid burning in the atmosphere" }
];
createPlaceholderLevels("Space and Astronomy", questions["Space and Astronomy"][1]);

// --- 5. Technology and AI ---
questions["Technology and AI"] = {};
questions["Technology and AI"][1] = [
    { q: "What does 'AI' stand for?", options: ["Automated Intelligence", "Artificial Intelligence", "Algorithmic Interface", "Advanced Intellect"], answer: "Artificial Intelligence" },
    { q: "Who is considered the 'father of Artificial Intelligence'?", options: ["Alan Turing", "John McCarthy", "Geoffrey Hinton", "Tim Berners-Lee"], answer: "John McCarthy" },
    { q: "What is a 'neural network' in AI inspired by?", options: ["Computer circuits", "The human brain", "Social networks", "Ant colonies"], answer: "The human brain" },
    { q: "What does CPU stand for?", options: ["Central Processing Unit", "Computer Personal Unit", "Central Processor Unit", "Control Processing Unit"], answer: "Central Processing Unit" },
    { q: "What is 'Machine Learning'?", options: ["A type of computer hardware", "A field of AI that gives computers the ability to learn without being explicitly programmed", "A new programming language", "A theory that machines can think"], answer: "A field of AI that gives computers the ability to learn without being explicitly programmed" },
    { q: "Which company developed the Python programming language?", options: ["Google", "Microsoft", "It was an open-source project led by Guido van Rossum", "Facebook"], answer: "It was an open-source project led by Guido van Rossum" },
    { q: "What does 'IoT' stand for?", options: ["Internet of Technology", "Interface of Things", "Internet of Things", "Internal Object Tracker"], answer: "Internet of Things" },
    { q: "What is the primary function of a router in a network?", options: ["To store data", "To display web pages", "To connect to the internet", "To direct traffic between devices and networks"], answer: "To direct traffic between devices and networks" },
    { q: "What is 'cloud computing'?", options: ["Storing data on your personal computer", "Using a network of remote servers hosted on the Internet to store, manage, and process data", "A type of weather forecasting technology", "A new type of laptop"], answer: "Using a network of remote servers hosted on the Internet to store, manage, and process data" },
    { q: "What does the term 'Big Data' refer to?", options: ["Large hard drives", "Extremely large and complex data sets that cannot be easily managed with traditional data-processing software", "A popular database company", "A type of computer virus"], answer: "Extremely large and complex data sets that cannot be easily managed with traditional data-processing software" }
];
createPlaceholderLevels("Technology and AI", questions["Technology and AI"][1]);

// --- 6. History and Geography ---
questions["History and Geography"] = {};
questions["History and Geography"][1] = [
    { q: "The Great Wall of China was primarily built to protect against invasions from which group?", options: ["The Romans", "The Mongols", "The Japanese", "The Vikings"], answer: "The Mongols" },
    { q: "In which country would you find the ancient city of Machu Picchu?", options: ["Brazil", "Mexico", "Peru", "Colombia"], answer: "Peru" },
    { q: "World War I took place between which years?", options: ["1905-1910", "1914-1918", "1929-1935", "1939-1945"], answer: "1914-1918" },
    { q: "The Amazon River flows through which continent?", options: ["Africa", "Asia", "North America", "South America"], answer: "South America" },
    { q: "Who was the first President of the United States?", options: ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"], answer: "George Washington" },
    { q: "The Sahara Desert is located on which continent?", options: ["Australia", "Asia", "Africa", "South America"], answer: "Africa" },
    { q: "The Renaissance, a period of great cultural change and artistic activity, began in which country?", options: ["France", "Spain", "Greece", "Italy"], answer: "Italy" },
    { q: "Which country is known as the 'Land of the Rising Sun'?", options: ["China", "South Korea", "Japan", "Thailand"], answer: "Japan" },
    { q: "The ancient Roman civilization was centered in what present-day country?", options: ["Greece", "Egypt", "Turkey", "Italy"], answer: "Italy" },
    { q: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Montreal", "Ottawa"], answer: "Ottawa" }
];
createPlaceholderLevels("History and Geography", questions["History and Geography"][1]);

// --- 7. Mathematics and Logic ---
questions["Mathematics and Logic"] = {};
questions["Mathematics and Logic"][1] = [
    { q: "What is the value of Pi to two decimal places?", options: ["3.12", "3.14", "3.16", "3.18"], answer: "3.14" },
    { q: "What is 12 multiplied by 12?", options: ["144", "124", "169", "132"], answer: "144" },
    { q: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], answer: "6" },
    { q: "What is the square root of 81?", options: ["7", "8", "9", "10"], answer: "9" },
    { q: "In a right-angled triangle, what is the side opposite the right angle called?", options: ["Adjacent", "Opposite", "Hypotenuse", "Base"], answer: "Hypotenuse" },
    { q: "If a train travels at 60 mph, how long does it take to travel 120 miles?", options: ["1 hour", "2 hours", "3 hours", "30 minutes"], answer: "2 hours" },
    { q: "What comes next in the sequence: 2, 4, 8, 16, ...?", options: ["20", "24", "32", "64"], answer: "32" },
    { q: "What is 5! (5 factorial)?", options: ["25", "60", "120", "720"], answer: "120" },
    { q: "How many degrees are in a circle?", options: ["180", "270", "360", "450"], answer: "360" },
    { q: "Which of the following numbers is a prime number?", options: ["9", "15", "21", "23"], answer: "23" }
];
createPlaceholderLevels("Mathematics and Logic", questions["Mathematics and Logic"][1]);

// --- 8. Science and Inventions ---
questions["Science and Inventions"] = {};
questions["Science and Inventions"][1] = [
    { q: "Who is credited with inventing the telephone?", options: ["Thomas Edison", "Nikola Tesla", "Alexander Graham Bell", "Guglielmo Marconi"], answer: "Alexander Graham Bell" },
    { q: "What is the chemical symbol for water?", options: ["H2O", "CO2", "O2", "NaCl"], answer: "H2O" },
    { q: "Who developed the theory of relativity?", options: ["Isaac Newton", "Galileo Galilei", "Albert Einstein", "Stephen Hawking"], answer: "Albert Einstein" },
    { q: "What does a Geiger counter measure?", options: ["Temperature", "Air pressure", "Radiation", "Light intensity"], answer: "Radiation" },
    { q: "Who invented the World Wide Web?", options: ["Bill Gates", "Steve Jobs", "Tim Berners-Lee", "Vint Cerf"], answer: "Tim Berners-Lee" },
    { q: "What is the freezing point of water in Celsius?", options: ["32°C", "0°C", "100°C", "-10°C"], answer: "0°C" },
    { q: "Which of these is a renewable energy source?", options: ["Natural Gas", "Coal", "Solar Power", "Oil"], answer: "Solar Power" },
    { q: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Quartz", "Diamond"], answer: "Diamond" },
    { q: "Who discovered penicillin?", options: ["Marie Curie", "Louis Pasteur", "Alexander Fleming", "Robert Koch"], answer: "Alexander Fleming" },
    { q: "What force opposes motion between two surfaces in contact?", options: ["Gravity", "Friction", "Magnetism", "Tension"], answer: "Friction" }
];
createPlaceholderLevels("Science and Inventions", questions["Science and Inventions"][1]);

// --- 9. Islamic Knowledge ---
questions["Islamic Knowledge"] = {};
questions["Islamic Knowledge"][1] = [
    { q: "How many pillars of Islam are there?", options: ["3", "4", "5", "6"], answer: "5" },
    { q: "What is the holy book of Islam?", options: ["Torah", "Bible", "Quran", "Zabur"], answer: "Quran" },
    { q: "In which city was Prophet Muhammad (PBUH) born?", options: ["Madinah", "Jerusalem", "Makkah", "Taif"], answer: "Makkah" },
    { q: "What is the name of the Islamic month of fasting?", options: ["Shawwal", "Ramadan", "Rajab", "Dhul Hijjah"], answer: "Ramadan" },
    { q: "Which direction do Muslims face during prayer?", options: ["Towards Jerusalem", "Towards the Kaaba in Makkah", "East", "West"], answer: "Towards the Kaaba in Makkah" },
    { q: "What is the annual charity payment in Islam called?", options: ["Hajj", "Sawm", "Salah", "Zakat"], answer: "Zakat" },
    { q: "Who was the first Caliph after Prophet Muhammad (PBUH)?", options: ["Umar ibn al-Khattab", "Ali ibn Abi Talib", "Uthman ibn Affan", "Abu Bakr al-Siddiq"], answer: "Abu Bakr al-Siddiq" },
    { q: "How many times a day are Muslims required to pray?", options: ["3", "4", "5", "6"], answer: "5" },
    { q: "What is the pilgrimage to Makkah called?", options: ["Umrah", "Ziyarah", "Hajj", "Tawaf"], answer: "Hajj" },
    { q: "Which angel is believed to have delivered the revelations to Prophet Muhammad (PBUH)?", options: ["Mika'il (Michael)", "Israfil (Raphael)", "Jibril (Gabriel)", "Azra'il (Azrael)"], answer: "Jibril (Gabriel)" }
];
createPlaceholderLevels("Islamic Knowledge", questions["Islamic Knowledge"][1]);
