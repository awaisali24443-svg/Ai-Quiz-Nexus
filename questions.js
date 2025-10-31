// questions.js
// This file contains all the quiz questions for the AI Quiz Nexus application.
// To add more questions, follow the existing structure:
// questions["Topic Title"][levelNumber] = [ { q: "...", options: [], answer: "..." }, ... ];

const questions = {};

// --- Programming Languages ---
questions["Programming Languages"] = {};

// Level 1: Easy
questions["Programming Languages"][1] = [
    { q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink and Text Markup Language", "Home Tool Markup Language"], answer: "Hyper Text Markup Language" },
    { q: "Which language is primarily used for styling web pages?", options: ["HTML", "JQuery", "CSS", "Python"], answer: "CSS" },
    { q: "What is the correct syntax for a single-line comment in JavaScript?", options: ["// This is a comment", "<!-- This is a comment -->", "# This is a comment", "/* This is a comment */"], answer: "// This is a comment" },
    { q: "Which company developed JavaScript?", options: ["Microsoft", "Apple", "Netscape", "Google"], answer: "Netscape" },
    { q: "What keyword is used to declare a variable in JavaScript that can be reassigned?", options: ["const", "var", "let", "variable"], answer: "let" },
    { q: "In Python, how do you print 'Hello, World!' to the console?", options: ["console.log('Hello, World!')", "echo 'Hello, World!'", "System.out.println('Hello, World!')", "print('Hello, World!')"], answer: "print('Hello, World!')" },
    { q: "Which of the following is a dynamically typed language?", options: ["C++", "Java", "Python", "C#"], answer: "Python" },
    { q: "What does SQL stand for?", options: ["Stylish Question Language", "Structured Query Language", "Statement Query Language", "Simple Question Language"], answer: "Structured Query Language" },
    { q: "Which tag is used to define an unordered list in HTML?", options: ["<li>", "<ol>", "<ul>", "<list>"], answer: "<ul>" },
    { q: "What is the file extension for a Python file?", options: [".py", ".pt", ".python", ".px"], answer: ".py" }
];

// Level 2: Easy
questions["Programming Languages"][2] = [
    { q: "Which of the following is NOT a programming language?", options: ["TypeScript", "Ruby", "HTML", "Kotlin"], answer: "HTML" },
    { q: "What is the result of '2' + 2 in JavaScript?", options: ["4", "22", "Error", "NaN"], answer: "22" },
    { q: "Which data structure uses LIFO (Last-In, First-Out)?", options: ["Queue", "Stack", "Array", "Linked List"], answer: "Stack" },
    { q: "What does API stand for?", options: ["Application Programming Interface", "Advanced Program Integration", "Application Process Interface", "Automated Programming Interface"], answer: "Application Programming Interface" },
    { q: "Who is known as the creator of Python?", options: ["James Gosling", "Guido van Rossum", "Bjarne Stroustrup", "Brendan Eich"], answer: "Guido van Rossum" },
    { q: "Which CSS property is used to change the text color of an element?", options: ["font-color", "text-color", "color", "background-color"], answer: "color" },
    { q: "What is the purpose of the `git clone` command?", options: ["To create a new branch", "To create a copy of a remote repository", "To merge branches", "To commit changes"], answer: "To create a copy of a remote repository" },
    { q: "Which of these is a popular front-end JavaScript framework?", options: ["Django", "Laravel", "React", "Spring"], answer: "React" },
    { q: "What does 'npm' stand for in the context of JavaScript?", options: ["New Package Manager", "Node Project Manager", "Node Package Manager", "Native Package Manager"], answer: "Node Package Manager" },
    { q: "What symbol is used to access properties of an object in JavaScript?", options: [".", ":", ";", "->"], answer: "." }
];

// Add more levels for Programming... up to 30
for (let i = 3; i <= 30; i++) {
  questions["Programming Languages"][i] = questions["Programming Languages"][i % 2 === 1 ? 1 : 2].map(q => ({...q, q: `(L${i}) ${q.q}`}));
}


// --- World Knowledge ---
questions["World Knowledge"] = {};

// Level 1: Easy
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
// Add more levels for World Knowledge... up to 30
for (let i = 2; i <= 30; i++) {
  questions["World Knowledge"][i] = questions["World Knowledge"][1].map(q => ({...q, q: `(L${i}) ${q.q}`}));
}

// --- Biological Knowledge ---
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
// Add more levels... up to 30
for (let i = 2; i <= 30; i++) {
  questions["Biological Knowledge"][i] = questions["Biological Knowledge"][1].map(q => ({...q, q: `(L${i}) ${q.q}`}));
}

// --- Space and Astronomy ---
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
// Add more levels... up to 30
for (let i = 2; i <= 30; i++) {
  questions["Space and Astronomy"][i] = questions["Space and Astronomy"][1].map(q => ({...q, q: `(L${i}) ${q.q}`}));
}


// --- Technology and AI ---
questions["Technology and AI"] = {};
questions["Technology and AI"][1] = questions["Programming Languages"][1]; // Placeholder
for (let i = 2; i <= 30; i++) {
  questions["Technology and AI"][i] = questions["Technology and AI"][1].map(q => ({...q, q: `(L${i}) ${q.q}`}));
}

// --- History and Geography ---
questions["History and Geography"] = {};
questions["History and Geography"][1] = questions["World Knowledge"][1]; // Placeholder
for (let i = 2; i <= 30; i++) {
  questions["History and Geography"][i] = questions["History and Geography"][1].map(q => ({...q, q: `(L${i}) ${q.q}`}));
}

// --- Mathematics and Logic ---
questions["Mathematics and Logic"] = {};
questions["Mathematics and Logic"][1] = [
    { q: "What is the value of Pi to two decimal places?", options: ["3.12", "3.14", "3.16", "3.18"], answer: "3.14" },
    { q: "What is 12 multiplied by 12?", options: ["144", "124", "169", "132"], answer: "144" },
    { q: "How many sides does a hexagon have?", options: ["5", "6", "7", "8"], answer: "6" },
    { q: "What is the square root of 81?", options: ["7", "8", "9", "10"], answer: "9" },
    { q: "In a right-angled triangle, what is the side opposite the right angle called?", options: ["Adjacent", "Opposite", "Hypotenuse", "Base"], answer: "Hypotenuse" }
];
for (let i = 2; i <= 30; i++) {
  questions["Mathematics and Logic"][i] = questions["Mathematics and Logic"][1].map(q => ({...q, q: `(L${i}) ${q.q}`}));
}

// --- Science and Inventions ---
questions["Science and Inventions"] = {};
questions["Science and Inventions"][1] = questions["Biological Knowledge"][1]; // Placeholder
for (let i = 2; i <= 30; i++) {
  questions["Science and Inventions"][i] = questions["Science and Inventions"][1].map(q => ({...q, q: `(L${i}) ${q.q}`}));
}

// --- Islamic Knowledge ---
questions["Islamic Knowledge"] = {};
questions["Islamic Knowledge"][1] = [
    { q: "How many pillars of Islam are there?", options: ["3", "4", "5", "6"], answer: "5" },
    { q: "What is the holy book of Islam?", options: ["Torah", "Bible", "Quran", "Zabur"], answer: "Quran" },
    { q: "In which city was Prophet Muhammad (PBUH) born?", options: ["Madinah", "Jerusalem", "Makkah", "Taif"], answer: "Makkah" },
    { q: "What is the name of the Islamic month of fasting?", options: ["Shawwal", "Ramadan", "Rajab", "Dhul Hijjah"], answer: "Ramadan" },
    { q: "Which direction do Muslims face during prayer?", options: ["Towards Jerusalem", "Towards the Kaaba in Makkah", "East", "West"], answer: "Towards the Kaaba in Makkah" }
];
for (let i = 2; i <= 30; i++) {
  questions["Islamic Knowledge"][i] = questions["Islamic Knowledge"][1].map(q => ({...q, q: `(L${i}) ${q.q}`}));
}
