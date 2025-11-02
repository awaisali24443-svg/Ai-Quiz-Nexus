// This file contains fallback questions for offline mode.
// For a full implementation, each topic would have question sets for all 30 levels.
// For demonstration, levels 1 (Easy), 2 (Easy), 11 (Intermediate), and 21 (Expert) are populated.

export const QUIZ_DATA = {
    programming: {
        level_1: [
            { q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink and Text Markup Language", "Home Tool Markup Language"], answer: "Hyper Text Markup Language" },
            { q: "Which programming language is known as the language of the web?", options: ["Java", "Python", "C++", "JavaScript"], answer: "JavaScript" },
            { q: "What is 'git'?", options: ["A programming language", "A text editor", "A version control system", "A type of server"], answer: "A version control system" },
            { q: "What does CSS stand for?", options: ["Cascading Style Sheets", "Creative Style System", "Computer Style Syntax", "Colorful Styling Sheets"], answer: "Cascading Style Sheets" },
            { q: "In Python, which keyword is used to define a function?", options: ["func", "def", "function", "define"], answer: "def" },
            { q: "What does 'API' stand for?", options: ["Automated Programming Interface", "Application Programming Interface", "Algorithmic Protocol Interface", "Advanced Program Integration"], answer: "Application Programming Interface" },
            { q: "Which data structure uses LIFO (Last-In, First-Out)?", options: ["Queue", "Array", "Stack", "Linked List"], answer: "Stack" },
            { q: "What is the main purpose of SQL?", options: ["To style web pages", "To create 3D models", "To query and manage databases", "To build mobile applications"], answer: "To query and manage databases" },
            { q: "What does 'OOP' stand for in programming?", options: ["Object-Oriented Programming", "Order of Operations", "Original Online Project", "Open Office Protocol"], answer: "Object-Oriented Programming" },
            { q: "A boolean value can be either True or...?", options: ["Maybe", "False", "Null", "Undefined"], answer: "False" }
        ],
        level_2: [
            { q: "Which symbol is used for single-line comments in JavaScript?", options: ["/* */", "//", "#", "<!-- -->"], answer: "//" },
            { q: "What is the file extension for a Python file?", options: [".java", ".js", ".py", ".html"], answer: ".py" },
            { q: "In HTML, which tag is used to create a hyperlink?", options: ["<link>", "<a>", "<href>", "<p>"], answer: "<a>" },
            { q: "What does the 'cd' command do in the terminal?", options: ["Create directory", "Copy directory", "Change directory", "Clear display"], answer: "Change directory" },
            { q: "Which of these is a statically typed language?", options: ["Python", "JavaScript", "Ruby", "Java"], answer: "Java" },
            { q: "What is the result of 10 % 3 (modulo operator)?", options: ["3", "1", "0", "10"], answer: "1" },
            { q: "An 'array' is an example of a...", options: ["Variable", "Function", "Data structure", "Loop"], answer: "Data structure" },
            { q: "What is the purpose of a 'for' loop?", options: ["To declare a variable", "To define a function", "To iterate over a sequence", "To handle errors"], answer: "To iterate over a sequence" },
            { q: "Which CSS property changes the text color?", options: ["font-color", "text-color", "color", "background-color"], answer: "color" },
            { q: "What is 'null' in programming?", options: ["The number zero", "An empty string", "A value representing no value or object", "An error"], answer: "A value representing no value or object" }
        ],
        level_11: [
            { q: "What is the difference between '==' and '===' in JavaScript?", options: ["No difference", "== is for assignment, === is for comparison", "== compares value, === compares value and type", "=== is faster than =="], answer: "== compares value, === compares value and type" },
            { q: "What is recursion?", options: ["A type of loop", "A data structure", "A function that calls itself", "An error handling method"], answer: "A function that calls itself" },
            { q: "In OOP, what is polymorphism?", options: ["Hiding complexity", "An object's ability to take on many forms", "Bundling data and methods", "Inheriting properties from another class"], answer: "An object's ability to take on many forms" },
            { q: "What is the time complexity of a binary search algorithm?", options: ["O(n)", "O(n^2)", "O(log n)", "O(1)"], answer: "O(log n)" },
            { q: "What does DNS stand for in networking?", options: ["Data Naming System", "Domain Name System", "Dynamic Network Service", "Direct Naming Standard"], answer: "Domain Name System" },
            { q: "What is a 'closure' in JavaScript?", options: ["A syntax error", "A closed web socket", "A way to lock variables", "A function with access to its outer scope, even after the outer function has returned"], answer: "A function with access to its outer scope, even after the outer function has returned" },
            { q: "What is the purpose of an 'index' in a database?", options: ["To count the number of rows", "To provide a backup", "To speed up data retrieval", "To encrypt data"], answer: "To speed up data retrieval" },
            { q: "In Git, what does `git merge` do?", options: ["Deletes a branch", "Creates a new branch", "Joins two or more development histories together", "Reverts a commit"], answer: "Joins two or more development histories together" },
            { q: "What is JSON?", options: ["A Java Script function", "A database system", "JavaScript Object Notation, a lightweight data-interchange format", "A styling language"], answer: "JavaScript Object Notation, a lightweight data-interchange format" },
            { q: "What is the difference between `let` and `const` in JavaScript?", options: ["`let` is for numbers, `const` is for strings", "`let` can be reassigned, `const` cannot", "`const` is for functions, `let` is for variables", "They are interchangeable"], answer: "`let` can be reassigned, `const` cannot" },
            { q: "What is a 'Promise' in JavaScript?", options: ["A guarantee that a function will not have errors", "An object representing the eventual completion or failure of an asynchronous operation", "A variable that cannot be changed", "A type of callback function"], answer: "An object representing the eventual completion or failure of an asynchronous operation" },
            { q: "In CSS, what does the 'box model' define?", options: ["The shape of text boxes", "A box that wraps around every HTML element, consisting of margins, borders, padding, and the content", "A 3D modeling tool in the browser", "A way to organize files"], answer: "A box that wraps around every HTML element, consisting of margins, borders, padding, and the content" },
            { q: "What is the primary purpose of a 'constructor' in an object-oriented class?", options: ["To destroy an object", "To create and initialize an object created from a class", "To copy an object", "To display an object's properties"], answer: "To create and initialize an object created from a class" },
            { q: "What is a Docker container?", options: ["A physical shipping container", "A type of database", "A lightweight, standalone, executable package that includes everything needed to run a piece of software", "A version control system for servers"], answer: "A lightweight, standalone, executable package that includes everything needed to run a piece of software" },
            { q: "What is the difference between 'git pull' and 'git fetch'?", options: ["They are identical commands", "`git pull` downloads remote changes, `git fetch` uploads local changes", "`git fetch` downloads remote changes but doesn't merge, `git pull` does both", "`git pull` is for repositories, `git fetch` is for single files"], answer: "`git fetch` downloads remote changes but doesn't merge, `git pull` does both" },
            { q: "What is an ORM (Object-Relational Mapping)?", options: ["A technique for converting data between incompatible type systems in object-oriented programming languages", "A type of server hardware", "A database optimization tool", "A method for organizing code files"], answer: "A technique for converting data between incompatible type systems in object-oriented programming languages" },
            { q: "What is the difference between a library and a framework?", options: ["There is no difference", "A library is a collection of functions that your code calls; a framework calls your code", "A library is for frontend, a framework is for backend", "A framework is a type of library"], answer: "A library is a collection of functions that your code calls; a framework calls your code" },
            { q: "What is the purpose of the `finally` block in a try-catch-finally statement?", options: ["To declare final variables", "To execute code regardless of whether an exception is thrown or caught", "To catch the final error in a program", "To stop the program execution"], answer: "To execute code regardless of whether an exception is thrown or caught" },
            { q: "What is the difference between REST and SOAP?", options: ["SOAP is a protocol, REST is an architectural style", "REST is older than SOAP", "SOAP is only for JavaScript, REST is for all languages", "They are two names for the same technology"], answer: "SOAP is a protocol, REST is an architectural style" },
            { q: "What is a lambda function (or anonymous function)?", options: ["A function with the name 'lambda'", "A named function that can only be used once", "A function defined without a name, often passed as an argument to another function", "A function that is always asynchronous"], answer: "A function defined without a name, often passed as an argument to another function" }
        ]
    },
    world_knowledge: {
        level_1: [
            { q: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Ottawa", "Montreal"], answer: "Ottawa" },
            { q: "Which river is the longest in the world?", options: ["Amazon River", "Nile River", "Yangtze River", "Mississippi River"], answer: "Nile River" },
            { q: "What is the largest desert in the world?", options: ["Sahara Desert", "Arabian Desert", "Gobi Desert", "Antarctic Polar Desert"], answer: "Antarctic Polar Desert" },
            { q: "Which is the largest ocean on Earth?", options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"], answer: "Pacific Ocean" },
            { q: "What is the most spoken language in the world by number of native speakers?", options: ["English", "Spanish", "Hindi", "Mandarin Chinese"], answer: "Mandarin Chinese" },
            { q: "Mount Everest is located in which mountain range?", options: ["The Andes", "The Rockies", "The Alps", "The Himalayas"], answer: "The Himalayas" },
            { q: "Which country is known as the 'Land of the Rising Sun'?", options: ["China", "South Korea", "Japan", "Thailand"], answer: "Japan" },
            { q: "What is the currency of the United Kingdom?", options: ["Euro", "Dollar", "Pound Sterling", "Yen"], answer: "Pound Sterling" },
            { q: "The Great Wall of China was primarily built to protect against invasions from which group?", options: ["The Romans", "The Vikings", "The Mongols", "The Japanese"], answer: "The Mongols" },
            { q: "How many continents are there in the world?", options: ["5", "6", "7", "8"], answer: "7" }
        ],
        level_2: [
            { q: "Which country is famous for the pyramids of Giza?", options: ["Greece", "Egypt", "Mexico", "Sudan"], answer: "Egypt" },
            { q: "What is the capital of France?", options: ["Berlin", "Madrid", "Rome", "Paris"], answer: "Paris" },
            { q: "The Amazon rainforest is primarily located in which continent?", options: ["Africa", "Asia", "South America", "Australia"], answer: "South America" },
            { q: "Which country gifted the Statue of Liberty to the USA?", options: ["United Kingdom", "France", "Spain", "Italy"], answer: "France" },
            { q: "What is the world's largest island?", options: ["Australia", "Greenland", "Borneo", "Madagascar"], answer: "Greenland" },
            { q: "In which city can you find the Colosseum?", options: ["Athens, Greece", "Cairo, Egypt", "Rome, Italy", "Istanbul, Turkey"], answer: "Rome, Italy" },
            { q: "The kangaroo is a native animal of which country?", options: ["New Zealand", "South Africa", "Australia", "Brazil"], answer: "Australia" },
            { q: "What is the official language of Brazil?", options: ["Spanish", "English", "Portuguese", "French"], answer: "Portuguese" },
            { q: "Which of these countries is in Africa?", options: ["Peru", "Vietnam", "Nigeria", "Pakistan"], answer: "Nigeria" },
            { q: "What is the currency of Japan?", options: ["Won", "Yuan", "Yen", "Ringgit"], answer: "Yen" }
        ],
        level_11: [
            { q: "What is the name of the sea that separates Europe and Africa?", options: ["Red Sea", "Black Sea", "Mediterranean Sea", "Caribbean Sea"], answer: "Mediterranean Sea" },
            { q: "The ancient city of Machu Picchu is located in which modern-day country?", options: ["Bolivia", "Peru", "Colombia", "Ecuador"], answer: "Peru" },
            { q: "What is the world's most populous Muslim country?", options: ["Pakistan", "Saudi Arabia", "Indonesia", "Egypt"], answer: "Indonesia" },
            { q: "What is the term for a country that is completely surrounded by another country?", options: ["Exclave", "Enclave", "Island", "Peninsula"], answer: "Enclave" },
            { q: "The European Union's headquarters are located in which city?", options: ["Paris, France", "Berlin, Germany", "Brussels, Belgium", "Geneva, Switzerland"], answer: "Brussels, Belgium" },
            { q: "What is the longest mountain range in the world?", options: ["The Himalayas", "The Rockies", "The Andes", "The Great Dividing Range"], answer: "The Andes" },
            { q: "Which two countries share the longest international border?", options: ["Russia and China", "Chile and Argentina", "Canada and the United States", "India and Bangladesh"], answer: "Canada and the United States" },
            { q: "What is the name of the strait that connects the Atlantic Ocean and the Mediterranean Sea?", options: ["Strait of Hormuz", "Strait of Gibraltar", "Bering Strait", "Strait of Malacca"], answer: "Strait of Gibraltar" },
            { q: "What is a 'fjord'?", options: ["A type of desert", "A tropical rainforest", "A large, flat area of land", "A long, narrow, deep inlet of the sea between high cliffs"], answer: "A long, narrow, deep inlet of the sea between high cliffs" },
            { q: "Which city is located on two continents?", options: ["Cairo, Egypt", "Moscow, Russia", "Istanbul, Turkey", "Panama City, Panama"], answer: "Istanbul, Turkey" },
            { q: "Which country is the largest producer of coffee in the world?", options: ["Vietnam", "Colombia", "Brazil", "Ethiopia"], answer: "Brazil" },
            { q: "The city of Timbuktu, a historical center of trade and Islamic scholarship, is in which African country?", options: ["Nigeria", "Mali", "Ghana", "Senegal"], answer: "Mali" },
            { q: "What is the official currency of Switzerland?", options: ["Euro", "Swiss Franc", "Crown", "Mark"], answer: "Swiss Franc" },
            { q: "What is the name for the indigenous people of New Zealand?", options: ["Aborigines", "Sami", "Inuit", "Māori"], answer: "Māori" },
            { q: "The Suez Canal connects which two bodies of water?", options: ["Atlantic and Pacific Oceans", "Mediterranean Sea and Red Sea", "Red Sea and Persian Gulf", "Black Sea and Mediterranean Sea"], answer: "Mediterranean Sea and Red Sea" },
            { q: "Which of these countries is generally NOT considered part of Scandinavia?", options: ["Denmark", "Sweden", "Finland", "Norway"], answer: "Finland" },
            { q: "What is the significance of the Prime Meridian?", options: ["It is the hottest line on Earth", "It is the 0° line of longitude, the starting point for measuring distance east and west", "It separates the northern and southern hemispheres", "It is the longest line of latitude"], answer: "It is the 0° line of longitude, the starting point for measuring distance east and west" },
            { q: "What is the largest landlocked country in the world by area?", options: ["Mongolia", "Afghanistan", "Kazakhstan", "Bolivia"], answer: "Kazakhstan" },
            { q: "Victoria Falls is a spectacular waterfall located on the border of which two African countries?", options: ["Kenya and Tanzania", "South Africa and Lesotho", "Zambia and Zimbabwe", "Angola and Namibia"], answer: "Zambia and Zimbabwe" },
            { q: "What is the Trans-Siberian Railway famous for?", options: ["Being the fastest train in the world", "Being the longest railway line in the world", "Being the first underground railway", "Connecting Europe to Africa"], answer: "Being the longest railway line in the world" }
        ],
        level_21: [
            { q: "What is the political and economic theory of Mercantilism?", options: ["A theory of free trade", "A system promoting colonial independence", "A system where a country attempts to amass wealth through trade, exporting more than it imports", "A form of communism"], answer: "A system where a country attempts to amass wealth through trade, exporting more than it imports" },
            { q: "The Scramble for Africa was a period of rapid colonization by European powers in which century?", options: ["18th Century", "19th Century", "17th Century", "20th Century"], answer: "19th Century" },
            { q: "What is the 'Ring of Fire'?", options: ["A famous volcano in Italy", "A series of trade routes in Asia", "A major area in the basin of the Pacific Ocean where many earthquakes and volcanic eruptions occur", "A desert in Africa"], answer: "A major area in the basin of the Pacific Ocean where many earthquakes and volcanic eruptions occur" },
            { q: "Explain the concept of 'soft power' in international relations.", options: ["Military force", "The ability to attract and co-opt, rather than coerce, using cultural or economic influence", "The use of economic sanctions", "Covert intelligence operations"], answer: "The ability to attract and co-opt, rather than coerce, using cultural or economic influence" },
            { q: "What is the demographic transition model?", options: ["A model predicting election outcomes", "A model of climate change", "A model that describes population change over time based on birth and death rates", "A model of economic growth"], answer: "A model that describes population change over time based on birth and death rates" },
            { q: "Which country has the most official languages?", options: ["India", "South Africa", "Bolivia", "Switzerland"], answer: "Bolivia" },
            { q: "What was the 'Silk Road'?", options: ["A famous novel", "A single road in China", "An ancient network of trade routes that connected the East and West", "A shipping company"], answer: "An ancient network of trade routes that connected the East and West" },
            { q: "What is the difference between a federal and a unitary system of government?", options: ["One is democratic, one is not", "Federal divides power between national and local governments; Unitary concentrates power in the national government", "Federal systems have a president, Unitary systems have a prime minister", "There is no significant difference"], answer: "Federal divides power between national and local governments; Unitary concentrates power in the national government" },
            { q: "The exclave of Kaliningrad belongs to which country?", options: ["Poland", "Lithuania", "Germany", "Russia"], answer: "Russia" },
            { q: "What is the Gini coefficient a measure of?", options: ["Population density", "Economic output", "Literacy rates", "Income or wealth inequality within a population"], answer: "Income or wealth inequality within a population" },
            { q: "What is the 'Dutch disease' in economics?", options: ["A pandemic originating in the Netherlands", "A causal relationship between an increase in a country's natural resource exports and a decline in its manufacturing sector", "A common agricultural pest", "A type of financial crisis"], answer: "A causal relationship between an increase in a country's natural resource exports and a decline in its manufacturing sector" },
            { q: "What is the principle of 'Jus Sanguinis' used for determining?", options: ["The rules of war", "Citizenship based on the nationality of one's parents", "Land ownership rights", "Maritime law"], answer: "Citizenship based on the nationality of one's parents" },
            { q: "The Sykes-Picot Agreement was a secret 1916 pact between which two powers that partitioned the Ottoman Empire?", options: ["Germany and Austria-Hungary", "United States and Russia", "United Kingdom and France", "Italy and Greece"], answer: "United Kingdom and France" },
            { q: "What is a 'banana republic'?", options: ["A country that primarily grows bananas", "A politically unstable country whose economy depends on exporting a single limited-resource product", "A popular clothing brand", "A type of island government"], answer: "A politically unstable country whose economy depends on exporting a single limited-resource product" },
            { q: "The 'resource curse' or 'paradox of plenty' refers to what phenomenon?", options: ["Countries with abundant natural resources having worse economic and development outcomes", "The difficulty of extracting resources", "The pollution caused by resource extraction", "Running out of natural resources"], answer: "Countries with abundant natural resources having worse economic and development outcomes" },
            { q: "What is unique about the political status of Svalbard under the Svalbard Treaty?", options: ["It is an independent nation", "It is controlled by the United Nations", "It is Norwegian territory, but citizens of signatory countries have equal rights to exploit its resources", "It is a demilitarized zone"], answer: "It is Norwegian territory, but citizens of signatory countries have equal rights to exploit its resources" },
            { q: "Explain the Malthusian theory of population.", options: ["Population growth is always beneficial for an economy", "Population growth will outpace agricultural production, leading to widespread famine", "Technology will always solve issues of population growth", "Population naturally limits itself through family planning"], answer: "Population growth will outpace agricultural production, leading to widespread famine" },
            { q: "What is a 'Potemkin village'?", options: ["A UNESCO World Heritage site in Russia", "A construction (literal or figurative) built solely to deceive others into thinking a situation is better than it really is", "A type of collective farm", "A historical military fortress"], answer: "A construction (literal or figurative) built solely to deceive others into thinking a situation is better than it really is" },
            { q: "The Hegelian Dialectic is a philosophical concept involving which three stages?", options: ["Reading, Writing, Arithmetic", "Hypothesis, Experiment, Conclusion", "Thesis, Antithesis, Synthesis", "Past, Present, Future"], answer: "Thesis, Antithesis, Synthesis" },
            { q: "What is the Baltic Dry Index an indicator of?", options: ["The weather in the Baltic Sea", "The health of the Polish economy", "Global economic activity, by tracking the cost of shipping raw materials", "The level of dryness in agricultural regions"], answer: "Global economic activity, by tracking the cost of shipping raw materials" }
        ]
    },
    biology: {
        level_1: [
            { q: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondrion", "Chloroplast"], answer: "Mitochondrion" },
            { q: "What is Photosynthesis?", options: ["A process of cell division", "The process plants use to get energy from sunlight", "A type of respiration", "The creation of new animal species"], answer: "The process plants use to get energy from sunlight" },
            { q: "Which part of the blood is responsible for fighting infection?", options: ["Red Blood Cells", "Platelets", "Plasma", "White Blood Cells"], answer: "White Blood Cells" },
            { q: "What is the scientific name for humans?", options: ["Homo Erectus", "Homo Habilis", "Neanderthal", "Homo Sapiens"], answer: "Homo Sapiens" },
            { q: "DNA is short for what?", options: ["Deoxyribonucleic Acid", "Dinitrate Acid", "Deoxyribo Nutrient Acid", "Diatomic Nucleic Acid"], answer: "Deoxyribonucleic Acid" },
            { q: "Which organ in the human body is responsible for pumping blood?", options: ["Lungs", "Brain", "Heart", "Liver"], answer: "Heart" },
            { q: "What are the building blocks of proteins?", options: ["Carbohydrates", "Lipids", "Nucleic acids", "Amino acids"], answer: "Amino acids" },
            { q: "What gas do plants absorb from the atmosphere for photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: "Carbon Dioxide" },
            { q: "How many bones are in the adult human body?", options: ["300", "206", "150", "256"], answer: "206" },
            { q: "What is the largest organ in the human body?", options: ["Brain", "Liver", "Heart", "Skin"], answer: "Skin" }
        ],
        level_2: [
            { q: "Which of these is a mammal?", options: ["Shark", "Lizard", "Whale", "Eagle"], answer: "Whale" },
            { q: "What part of a plant absorbs water and nutrients from the soil?", options: ["Leaves", "Stem", "Flower", "Roots"], answer: "Roots" },
            { q: "Where does digestion primarily occur in the human body?", options: ["Stomach", "Small intestine", "Large intestine", "Esophagus"], answer: "Small intestine" },
            { q: "What is the process by which animals shed their skin?", options: ["Hibernation", "Metamorphosis", "Molting", "Camouflage"], answer: "Molting" },
            { q: "What type of animal is a frog?", options: ["Reptile", "Mammal", "Amphibian", "Fish"], answer: "Amphibian" },
            { q: "What gives leaves their green color?", options: ["Xylem", "Chlorophyll", "Phloem", "Pollen"], answer: "Chlorophyll" },
            { q: "Humans are an example of what type of consumer?", options: ["Herbivore", "Carnivore", "Omnivore", "Producer"], answer: "Omnivore" },
            { q: "What is the main function of the lungs?", options: ["To pump blood", "To digest food", "To filter waste", "To exchange oxygen and carbon dioxide"], answer: "To exchange oxygen and carbon dioxide" },
            { q: "A tadpole is the larval stage of which animal?", options: ["Butterfly", "Salamander", "Frog", "Fish"], answer: "Frog" },
            { q: "What is a habitat?", options: ["An animal's diet", "The natural home or environment of an organism", "A group of animals", "The way an animal behaves"], answer: "The natural home or environment of an organism" }
        ],
        level_11: [
            { q: "What is the difference between a prokaryotic and a eukaryotic cell?", options: ["Prokaryotic cells have a nucleus", "Eukaryotic cells are always smaller", "Eukaryotic cells have a nucleus and membrane-bound organelles, while prokaryotic cells do not", "Prokaryotic cells are multicellular"], answer: "Eukaryotic cells have a nucleus and membrane-bound organelles, while prokaryotic cells do not" },
            { q: "What is meiosis?", options: ["Cellular respiration", "Cell growth", "A type of cell division that results in four daughter cells each with half the number of chromosomes of the parent cell", "The process of creating proteins"], answer: "A type of cell division that results in four daughter cells each with half the number of chromosomes of the parent cell" },
            { q: "What is the role of ATP in a cell?", options: ["It stores genetic information", "It is the main source of energy for most cellular processes", "It helps with cell structure", "It carries oxygen"], answer: "It is the main source of energy for most cellular processes" },
            { q: "What is a 'genotype'?", options: ["The physical appearance of an organism", "A type of cell", "The genetic constitution of an individual organism", "A specific gene"], answer: "The genetic constitution of an individual organism" },
            { q: "What are enzymes?", options: ["Types of sugars", "Fats that store energy", "Proteins that act as biological catalysts", "The building blocks of DNA"], answer: "Proteins that act as biological catalysts" },
            { q: "What is the Linnaean system of classification?", options: ["A system for naming stars", "A geological time scale", "A hierarchical system for classifying organisms", "A method for predicting weather"], answer: "A hierarchical system for classifying organisms" },
            { q: "What is symbiosis?", options: ["The process of evolution", "A state of dormancy", "A long-term interaction between two different biological species", "The competition for resources"], answer: "A long-term interaction between two different biological species" },
            { q: "What is the function of the ribosome?", options: ["Energy production", "Protein synthesis", "Waste disposal", "Cellular transport"], answer: "Protein synthesis" },
            { q: "What is homeostasis?", options: ["The process of cell division", "The body's ability to maintain a stable internal environment", "The inheritance of traits", "The breakdown of food molecules"], answer: "The body's ability to maintain a stable internal environment" },
            { q: "What is an 'autotroph'?", options: ["An organism that eats other organisms", "An organism that can produce its own food", "A single-celled organism", "An organism that lives without oxygen"], answer: "An organism that can produce its own food" },
            { q: "What is the difference between mitosis and meiosis?", options: ["Mitosis produces identical cells, meiosis produces sex cells with half the chromosomes", "Meiosis is for growth, mitosis is for reproduction", "Mitosis occurs in plants, meiosis in animals", "They are the same process with different names"], answer: "Mitosis produces identical cells, meiosis produces sex cells with half the chromosomes" },
            { q: "What is a 'phenotype'?", options: ["The genetic makeup of an organism", "The observable physical properties of an organism", "A section of DNA", "A type of cell organelle"], answer: "The observable physical properties of an organism" },
            { q: "What is the function of the xylem in plants?", options: ["To transport sugars from the leaves", "To transport water and minerals from the roots to the rest of the plant", "Photosynthesis", "Reproduction"], answer: "To transport water and minerals from the roots to the rest of the plant" },
            { q: "What is the role of the nervous system?", options: ["To transport oxygen", "To break down food", "To transmit nerve impulses between parts of the body", "To produce hormones"], answer: "To transmit nerve impulses between parts of the body" },
            { q: "What is a virus?", options: ["A single-celled organism", "A type of bacteria", "An infectious agent that replicates only inside the living cells of other organisms", "A cellular organelle"], answer: "An infectious agent that replicates only inside the living cells of other organisms" },
            { q: "What is natural selection?", options: ["The process where humans choose desirable traits in animals", "The process whereby organisms better adapted to their environment tend to survive and produce more offspring", "A random process of evolution", "The creation of new species in a lab"], answer: "The process whereby organisms better adapted to their environment tend to survive and produce more offspring" },
            { q: "What is the primary function of the kidneys?", options: ["To pump blood", "To digest proteins", "To filter waste products from the blood and produce urine", "To produce insulin"], answer: "To filter waste products from the blood and produce urine" },
            { q: "What is the difference between aerobic and anaerobic respiration?", options: ["Aerobic uses oxygen, anaerobic does not", "Aerobic occurs in plants, anaerobic in animals", "Aerobic produces less energy", "Anaerobic respiration is more efficient"], answer: "Aerobic uses oxygen, anaerobic does not" },
            { q: "What is a 'gene'?", options: ["A type of protein", "A unit of heredity which is transferred from a parent to offspring and is held to determine some characteristic", "A complete set of an organism's DNA", "A cell's nucleus"], answer: "A unit of heredity which is transferred from a parent to offspring and is held to determine some characteristic" },
            { q: "What type of symbiosis is 'mutualism'?", options: ["One organism benefits, the other is harmed", "One organism benefits, the other is unaffected", "Both organisms benefit from the interaction", "Both organisms are harmed"], answer: "Both organisms benefit from the interaction" }
        ],
        level_21: [
            { q: "Explain the process of CRISPR-Cas9 gene editing.", options: ["A method for cloning organisms", "A system used by bacteria to defend against viruses, adapted for editing DNA sequences in other organisms", "A technique for creating vaccines", "A type of polymerase chain reaction"], answer: "A system used by bacteria to defend against viruses, adapted for editing DNA sequences in other organisms" },
            { q: "What is the role of mitochondria in apoptosis?", options: ["They build new proteins for the cell", "They release key proteins that trigger programmed cell death", "They stop the process of apoptosis", "They have no role in apoptosis"], answer: "They release key proteins that trigger programmed cell death" },
            { q: "Describe the difference between allopatric and sympatric speciation.", options: ["One is fast, one is slow", "Allopatric occurs due to geographic isolation; sympatric occurs without it", "One applies to plants, one to animals", "Allopatric is evolution, sympatric is not"], answer: "Allopatric occurs due to geographic isolation; sympatric occurs without it" },
            { q: "What is the central dogma of molecular biology?", options: ["The theory of evolution by natural selection", "The idea that all cells come from pre-existing cells", "The flow of genetic information: DNA → RNA → protein", "The law of independent assortment"], answer: "The flow of genetic information: DNA → RNA → protein" },
            { q: "What is an epigenetic modification?", options: ["A mutation in the DNA sequence", "A change in gene expression that does not involve a change in the DNA sequence itself", "The process of creating a new species", "A change caused by a virus"], answer: "A change in gene expression that does not involve a change in the DNA sequence itself" },
            { q: "Explain the function of the sodium-potassium pump.", options: ["It's a passive channel for sodium ions", "It generates ATP", "It's an active transport protein that moves sodium and potassium ions against their concentration gradients", "It digests sodium and potassium"], answer: "It's an active transport protein that moves sodium and potassium ions against their concentration gradients" },
            { q: "What is the endosymbiotic theory?", options: ["A theory about how dinosaurs went extinct", "The theory that eukaryotic organelles like mitochondria originated as free-living prokaryotes", "A theory explaining the origin of life", "A theory about animal behavior"], answer: "The theory that eukaryotic organelles like mitochondria originated as free-living prokaryotes" },
            { q: "What is quorum sensing in bacteria?", options: ["A type of bacterial movement", "A system of communication correlated to population density, allowing bacteria to coordinate behavior", "How bacteria resist antibiotics", "The process of bacterial reproduction"], answer: "A system of communication correlated to population density, allowing bacteria to coordinate behavior" },
            { q: "Describe the difference between C3, C4, and CAM photosynthesis.", options: ["They occur in different parts of the cell", "They use different types of chlorophyll", "They are three different metabolic pathways for carbon fixation, adapted to different environments", "Only C3 photosynthesis produces oxygen"], answer: "They are three different metabolic pathways for carbon fixation, adapted to different environments" },
            { q: "What are telomeres and what is their function?", options: ["The center part of a chromosome", "Repetitive DNA sequences at the ends of chromosomes that protect them from deterioration", "Genes that code for enzymes", "The part of the cell that contains DNA"], answer: "Repetitive DNA sequences at the ends of chromosomes that protect them from deterioration" },
            { q: "What is the function of RNA interference (RNAi)?", options: ["It helps build proteins", "A biological process in which RNA molecules inhibit gene expression or translation, by neutralizing targeted mRNA molecules", "It repairs damaged DNA", "It is a form of energy storage"], answer: "A biological process in which RNA molecules inhibit gene expression or translation, by neutralizing targeted mRNA molecules" },
            { q: "What are prions?", options: ["A type of virus", "Misfolded proteins that can transmit their misfolded shape onto normal variants of the same protein, leading to neurodegenerative diseases", "A beneficial type of gut bacteria", "A component of the cell membrane"], answer: "Misfolded proteins that can transmit their misfolded shape onto normal variants of the same protein, leading to neurodegenerative diseases" },
            { q: "What is the significance of the lac operon in E. coli?", options: ["It's a model for understanding gene regulation, showing how genes can be turned on and off in response to the environment", "It is the primary source of energy for the bacteria", "It makes the bacteria resistant to antibiotics", "It is involved in cellular movement"], answer: "It's a model for understanding gene regulation, showing how genes can be turned on and off in response to the environment" },
            { q: "What is chemiosmosis?", options: ["The movement of ions across a semipermeable membrane down their electrochemical gradient, used to generate ATP", "A type of chemical reaction", "The process of cells communicating with each other", "A form of passive transport"], answer: "The movement of ions across a semiperme...--- START OF FILE js/3d/sceneManager.js ---


// Caches the loaded modules to avoid re-fetching
const sceneModulesCache = new Map();

let currentSceneModule = null;
let currentContainer = null;

const sceneManager = {
    async init(topicId, container) {
        // If the same scene is already running, do nothing
        if (currentSceneModule && currentSceneModule.topicId === topicId) {
            return;
        }

        // Clean up the previous scene before starting a new one
        if (currentSceneModule) {
            this.destroy();
        }

        currentContainer = container;
        currentContainer.classList.add('visible');

        try {
            let module;
            if (sceneModulesCache.has(topicId)) {
                module = sceneModulesCache.get(topicId);
            } else {
                // Dynamically import the module for the selected topic
                module = await import(`./${topicId}.js`);
                sceneModulesCache.set(topicId, module);
            }
            
            // Store a reference to the active module
            currentSceneModule = {
                ...module,
                topicId: topicId
            };

            // Initialize the 3D scene
            currentSceneModule.init3DScene(container);

            // Add event listeners for interaction
            window.addEventListener('resize', this.handleResize);
            window.addEventListener('mousemove', this.handleMouseMove);

        } catch (error) {
            console.error(`Failed to load or init 3D module for topic: ${topicId}`, error);
            // Fallback: hide the WebGL container if the scene fails to load
            if (currentContainer) {
                currentContainer.classList.remove('visible');
            }
        }
    },

    destroy() {
        if (currentSceneModule && typeof currentSceneModule.destroy3DScene === 'function') {
            currentSceneModule.destroy3DScene();
        }
        
        // Clean up event listeners
        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('mousemove', this.handleMouseMove);

        if (currentContainer) {
            currentContainer.classList.remove('visible');
            // Clear the container's content to ensure the renderer's canvas is removed
            while (currentContainer.firstChild) {
                currentContainer.removeChild(currentContainer.firstChild);
            }
        }
        
        currentSceneModule = null;
        currentContainer = null;
    },

    handleResize() {
        if (currentSceneModule && typeof currentSceneModule.onWindowResize === 'function') {
            currentSceneModule.onWindowResize();
        }
    },

    handleMouseMove(event) {
        if (currentSceneModule && typeof currentSceneModule.onMouseMove === 'function') {
            currentSceneModule.onMouseMove(event);
        }
    },

    // Utility to check for WebGL support
    isWebGLAvailable() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }
};

export default sceneManager;