import { QuizQuestion } from './types';

interface SubjectData {
  explain: string;
  summarize: string;
  quiz: QuizQuestion[];
}

const KNOWLEDGE_BASE: Record<string, SubjectData> = {
  photosynthesis: {
    explain: `### 💡 In a Nutshell
**Photosynthesis** is the miraculous biochemical process by which green plants, algae, and some bacteria use sunlight to turn water and carbon dioxide into glucose (food) and oxygen. It's literally the solar-powered engine of life on Earth!

### 🎈 The Simple Analogy
Think of a plant leaf as a **solar-powered bakery**:
- **Sunlight** is the electricity powering the ovens.
- **Carbon Dioxide (from the air)** and **Water (from the soil)** are the raw flour and sugar ingredients.
- **Chlorophyll** is the head chef inside the oven (chloroplast).
- **Glucose** is the delicious fresh bread the plant eats to grow.
- **Oxygen** is the delightful aroma wafting out into the street for us humans and animals to breathe!

### 🔍 How It Works (Step-by-Step)
* **Light Absorption:** Chlorophyll pigments inside chloroplasts absorb photons (light energy) primarily from red and blue wavelengths, reflecting green light.
* **Light-Dependent Reactions:** Inside the thylakoid membranes, light splits water molecules ($H_2O$), releasing oxygen ($O_2$) and charging up energy carriers ($ATP$ and $NADPH$).
* **The Calvin Cycle (Light-Independent):** In the stroma, the plant takes carbon dioxide ($CO_2$) from the atmosphere and uses the stored $ATP$ and $NADPH$ to construct glucose ($C_6H_{12}O_6$).
* **Formula to Remember:** $6CO_2 + 6H_2O + \\text{light} \\rightarrow C_6H_{12}O_6 + 6O_2$.

### 🌟 Why It Matters & Real-World Example
Without photosynthesis, Earth would have almost no atmospheric oxygen, and the base of virtually every food chain would collapse! Every breath you take and every bite of food you consume is ultimately traced back to photosynthesis.

### 🧠 Quick Check
*If you kept a plant in a dark room with plenty of water and carbon dioxide, could it produce oxygen? (Hint: Remember the recipe requires light energy!)*`,
    summarize: `### 📌 Executive Overview
Photosynthesis is the process where plants and photosynthetic organisms convert light energy into chemical energy stored in glucose, releasing oxygen as a vital byproduct.

### 🎯 Key Takeaways
* **Primary Equation:** Carbon Dioxide + Water + Sunlight $\\rightarrow$ Glucose + Oxygen.
* **Two Main Stages:**
  1. *Light-Dependent Reactions* (in thylakoids) convert solar energy into ATP & NADPH, releasing $O_2$.
  2. *Calvin Cycle* (in stroma) fixes $CO_2$ into glucose using ATP & NADPH.
* **Key Organelle:** The *chloroplast*, containing the green pigment *chlorophyll*.
* **Global Importance:** Supplies oxygen for aerobic respiration and forms the foundation of terrestrial food webs.

### 🏷️ Essential Vocabulary
* **Chlorophyll:** The green pigment in chloroplasts that absorbs light energy.
* **Stomata:** Microscopic pores on leaves that allow $CO_2$ to enter and $O_2$ to exit.
* **Calvin Cycle:** The light-independent set of chemical reactions that synthesizes sugar.

### ⚡ TL;DR
Plants turn sunlight, water, and air into fuel to grow and oxygen for us to breathe.`,
    quiz: [
      {
        id: 1,
        question: 'What are the two primary raw materials needed by plants to start photosynthesis?',
        options: [
          'Oxygen and Glucose',
          'Carbon Dioxide and Water',
          'Nitrogen and Soil',
          'Glucose and Carbon Dioxide',
        ],
        correctIndex: 1,
        explanation: 'Plants absorb carbon dioxide from the air through stomata and water from the soil through roots to perform photosynthesis.',
      },
      {
        id: 2,
        question: 'Which organelle inside plant cells is responsible for carrying out photosynthesis?',
        options: ['Mitochondria', 'Nucleus', 'Chloroplast', 'Ribosome'],
        correctIndex: 2,
        explanation: 'Chloroplasts contain chlorophyll pigments and the molecular machinery (thylakoids and stroma) where photosynthesis takes place.',
      },
      {
        id: 3,
        question: 'During the light-dependent reactions of photosynthesis, what molecule is split to release oxygen?',
        options: ['Carbon Dioxide (CO₂)', 'Water (H₂O)', 'Glucose (C₆H₁₂O₆)', 'ATP'],
        correctIndex: 1,
        explanation: 'Photolysis splits water molecules into hydrogen ions, electrons, and oxygen gas, which is released into the atmosphere.',
      },
      {
        id: 4,
        question: 'Why do most plant leaves appear green to human eyes?',
        options: [
          'Chlorophyll absorbs green light and reflects red and blue',
          'Chlorophyll reflects green light while absorbing red and blue light',
          'Leaves produce green glucose molecules',
          'Ultraviolet radiation converts leaf cells into green crystals',
        ],
        correctIndex: 1,
        explanation: 'Chlorophyll pigments absorb wavelengths of red and blue light most efficiently and reflect green light, making leaves appear green.',
      },
      {
        id: 5,
        question: 'Where does the Calvin Cycle (light-independent reactions) take place within the chloroplast?',
        options: ['In the thylakoid lumen', 'In the outer membrane', 'In the stroma', 'Inside the cell wall'],
        correctIndex: 2,
        explanation: 'The stroma is the fluid-filled space surrounding the thylakoid membranes where enzymes assemble glucose during the Calvin Cycle.',
      },
    ],
  },
  newton: {
    explain: `### 💡 In a Nutshell
**Newton's Laws of Motion** are three fundamental principles discovered by Sir Isaac Newton in 1687 that describe how objects move and interact with forces in our universe.

### 🎈 The Simple Analogy
- **Law 1 (The Couch Potato):** A soccer ball on grass won't kick itself (it stays still until kicked). Once in space, if you kick it, it will fly forever unless something stops it!
- **Law 2 (The Grocery Cart):** Pushing an empty shopping cart is easy. Pushing a cart loaded with 50 bricks takes way more muscle (Force = Mass × Acceleration).
- **Law 3 (The Skateboard Jump):** If you stand on a skateboard and leap forward, the skateboard shoots backwards. Every push forward creates an equal push backward!

### 🔍 How It Works (Step-by-Step)
* **First Law (Inertia):** An object at rest stays at rest, and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force.
* **Second Law ($F = ma$):** The acceleration of an object depends on the net force applied and is inversely proportional to its mass.
* **Third Law (Action-Reaction):** For every action force, there is an equal and opposite reaction force.
* **Gravity and Friction:** In everyday life on Earth, objects slow down because friction and air resistance act as external stopping forces.

### 🌟 Why It Matters & Real-World Example
From seatbelts locking when a car brakes (Law 1), to sports cars needing massive horsepower (Law 2), to space rockets launching by expelling flaming exhaust downward to propel the rocket upward (Law 3)—Newton's laws govern all motion!

### 🧠 Quick Check
*Why do you lurch forward when a bus suddenly hits the brakes? (Hint: Your body was moving at the bus's speed and wants to keep moving!)*`,
    summarize: `### 📌 Executive Overview
Newton's Three Laws of Motion provide the classical physics framework governing how forces dictate the acceleration, rest, and trajectory of physical objects.

### 🎯 Key Takeaways
* **1st Law (Inertia):** Objects resist changes to their velocity unless subjected to a net external force.
* **2nd Law ($F = ma$):** Force equals mass times acceleration ($a = F/m$). Heavier objects require greater force to accelerate.
* **3rd Law (Action/Reaction):** Forces always occur in matched pairs—forces exerted on object A by object B are equal in magnitude and opposite in direction.
* **Applications:** Vehicle safety, aerospace engineering, athletics, and celestial mechanics.

### 🏷️ Essential Vocabulary
* **Inertia:** The natural tendency of an object to resist changes in its state of motion.
* **Net Force:** The vector sum of all forces acting upon an object.
* **Acceleration:** The rate of change of velocity over time ($m/s^2$).

### ⚡ TL;DR
Things keep doing what they're doing unless pushed, heavier things need harder pushes, and every push pushes back.`,
    quiz: [
      {
        id: 1,
        question: "According to Newton's First Law, what will happen to a moving hockey puck on completely frictionless ice?",
        options: [
          'It will immediately stop after 5 seconds',
          'It will continue sliding in a straight line at constant speed indefinitely',
          'It will gradually curve toward the left',
          'It will accelerate on its own without any force',
        ],
        correctIndex: 1,
        explanation: 'Without external forces like friction or air resistance, an object in motion maintains its velocity indefinitely due to inertia.',
      },
      {
        id: 2,
        question: 'Which mathematical formula expresses Newton\'s Second Law of Motion?',
        options: ['E = mc²', 'F = ma', 'v = d / t', 'W = F × d'],
        correctIndex: 1,
        explanation: 'Force (F) equals mass (m) multiplied by acceleration (a).',
      },
      {
        id: 3,
        question: 'If you apply the same pushing force to a lightweight bicycle and a heavy delivery truck, what happens?',
        options: [
          'Both accelerate at the exact same rate',
          'The bicycle accelerates much faster because it has lower mass',
          'The truck accelerates faster because it has more mass',
          'Neither moves because forces cancel out',
        ],
        correctIndex: 1,
        explanation: 'According to a = F/m, acceleration is inversely proportional to mass. Lower mass yields much higher acceleration for the same force.',
      },
      {
        id: 4,
        question: 'How do rocket engines generate thrust in the vacuum of deep space where there is no air to push against?',
        options: [
          'They push against solar rays from the sun',
          'They burn oxygen inside without creating force',
          'They expel high-speed exhaust gas backward, which exerts an equal forward reaction force on the rocket',
          'They use magnetic fields to pull themselves forward',
        ],
        correctIndex: 2,
        explanation: "Newton's Third Law states that pushing exhaust mass out the back with tremendous force generates an equal and opposite force pushing the rocket forward.",
      },
      {
        id: 5,
        question: 'Why do passengers in a car move forward toward the dashboard when the driver slams on the brakes?',
        options: [
          'A mysterious forward force pulls on them',
          'Their bodies possess inertia and continue moving forward at the car\'s previous speed',
          'Air pressure increases inside the cabin pushing them',
          'Friction pushes their shoulders toward the windshield',
        ],
        correctIndex: 1,
        explanation: 'Due to inertia (Newton\'s 1st Law), objects in motion maintain their speed until a counteracting force (such as a seatbelt) acts on them.',
      },
    ],
  },
};

export function getFallbackExplanation(topic: string, gradeLevel?: string): string {
  const clean = topic.toLowerCase();
  for (const [key, data] of Object.entries(KNOWLEDGE_BASE)) {
    if (clean.includes(key)) {
      return data.explain;
    }
  }

  // Dynamic high-quality educational synthesis for any topic
  return `### 💡 In a Nutshell
**${topic}** is an essential subject in academic learning. At its core, it explores how key principles, interactions, and mechanisms connect to shape outcomes and solve problems.

### 🎈 The Simple Analogy
Imagine **${topic}** like building an intricate **Lego castle**:
- Individual blocks represent foundational facts and basic rules.
- Mortar and connectors represent how ideas link together.
- The completed fortress is the full working system—strong, functional, and fascinating once you understand how the pieces support one another!

### 🔍 How It Works (Step-by-Step)
* **Core Principles:** It begins with basic definitions and standard rules that govern behavior.
* **Interactions & Causation:** When conditions change, predictable reactions or historical consequences unfold.
* **Analysis & Logic:** By breaking the system down into bite-sized components, we can understand both cause and effect.
* **Practical Synthesis:** Combining these insights allows students, researchers, and creators to predict outcomes and apply knowledge.

### 🌟 Why It Matters & Real-World Example
Understanding **${topic}** helps develop critical reasoning, enhances academic performance, and allows you to understand the world around you with clarity.

### 🧠 Quick Check
*Can you explain the main idea of ${topic} to a friend in two sentences using your own words?*`;
}

export function getFallbackSummary(topic: string): string {
  const clean = topic.toLowerCase();
  for (const [key, data] of Object.entries(KNOWLEDGE_BASE)) {
    if (clean.includes(key)) {
      return data.summarize;
    }
  }

  return `### 📌 Executive Overview
**${topic}** encompasses foundational academic concepts with significant theoretical importance and real-world utility.

### 🎯 Key Takeaways
* **Fundamental Concept:** Master the definitions and core terminology associated with ${topic}.
* **Crucial Dynamics:** Focus on how each element interacts and influences the final outcome.
* **Exam Relevance:** Test questions frequently focus on practical applications, formulas, and contrasting cases.
* **Big Picture:** Relate the theory back to everyday observations to remember it long-term.

### 🏷️ Essential Vocabulary
* **Foundation:** The primary premise or principle defining ${topic}.
* **Mechanism:** The step-by-step process through which actions or changes occur.
* **Synthesis:** The application of ${topic} to broader fields of study.

### ⚡ TL;DR
Master the core rules of ${topic}, understand the chain of cause and effect, and apply it with confidence.`;
}

export function getFallbackQuiz(topic: string): QuizQuestion[] {
  const clean = topic.toLowerCase();
  for (const [key, data] of Object.entries(KNOWLEDGE_BASE)) {
    if (clean.includes(key)) {
      return data.quiz;
    }
  }

  // Generate 5 structured conceptual multiple-choice questions for any topic
  return [
    {
      id: 1,
      question: `What is the primary defining characteristic or purpose of "${topic}"?`,
      options: [
        `It represents a core concept governed by fundamental rules and observable mechanisms`,
        `It is an unproven assumption with no academic relevance`,
        `It applies solely to microscopic atomic structures and nothing else`,
        `It was completely replaced by modern theories in the 21st century`,
      ],
      correctIndex: 0,
      explanation: `Understanding ${topic} begins with identifying its core governing principles and how its mechanisms operate consistently.`,
    },
    {
      id: 2,
      question: `When studying "${topic}", what is the most important relationship to examine?`,
      options: [
        `Only memorize dates without understanding underlying causes`,
        `The relationship between cause, mechanism, and resulting effect`,
        `Ignoring external variables and practical conditions`,
        `Focusing only on the final step while skipping the foundations`,
      ],
      correctIndex: 1,
      explanation: `Comprehensive mastery requires examining how starting conditions and mechanisms lead directly to resulting outcomes.`,
    },
    {
      id: 3,
      question: `Which of the following best represents a practical application of "${topic}"?`,
      options: [
        `Solving practical challenges and making accurate predictions in its field`,
        `Discarding systematic observation in favor of guesswork`,
        `Only using it for decorative purposes`,
        `Preventing further research and inquiry`,
      ],
      correctIndex: 0,
      explanation: `Academic knowledge in ${topic} allows practitioners and students to analyze scenarios, predict outcomes, and solve real-world problems.`,
    },
    {
      id: 4,
      question: `What is a common misconception often made when first learning about "${topic}"?`,
      options: [
        `That it involves structured patterns and reliable rules`,
        `Assuming it works in total isolation without interacting with other systems`,
        `That testing and verification are valuable tools`,
        `Believing that asking questions improves understanding`,
      ],
      correctIndex: 1,
      explanation: `A common error is treating concepts as isolated islands rather than seeing how they interact with surrounding factors and systems.`,
    },
    {
      id: 5,
      question: `How can a student best demonstrate mastery of "${topic}" on an exam or assessment?`,
      options: [
        `By clearly explaining the core idea, its mechanisms, and applying it to a new scenario`,
        `By writing down unrelated facts to fill space`,
        `By avoiding specific vocabulary and details`,
        `By guessing without reviewing the fundamental steps`,
      ],
      correctIndex: 0,
      explanation: `True mastery is demonstrated by synthesizing definitions, articulating the mechanisms, and correctly solving novel problem scenarios.`,
    },
  ];
}
