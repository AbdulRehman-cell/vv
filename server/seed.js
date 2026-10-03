const mongoose = require('mongoose');

// Define inline schemas/models to ensure the seed file runs independently and securely
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true
  },
  slug: {
    type: String,
    required: [true, 'Category slug is required'],
    trim: true,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  icon: {
    type: String,
    trim: true,
    default: '⚡'
  },
  color: {
    type: String,
    trim: true,
    default: '#00F0FF'
  }
});

const questionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category slug or name is required'],
    trim: true,
    index: true
  },
  questionText: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true
  },
  options: {
    type: String,
    required: [true, 'Options are required as a comma-separated string or serialized array'],
    trim: true
  },
  correctOptionIndex: {
    type: Number,
    required: [true, 'Correct option index is required']
  },
  explanation: {
    type: String,
    trim: true,
    default: 'Think faster next time.'
  }
});

const scoreSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    minlength: [2, 'Username must be at least 2 characters']
  },
  category: {
    type: String,
    required: [true, 'Category slug or name is required'],
    trim: true
  },
  score: {
    type: Number,
    required: [true, 'Score is required'],
    min: [0, 'Score cannot be negative'],
    default: 0
  },
  timeTaken: {
    type: Number,
    required: [true, 'Time taken is required']
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

// Check if models are already compiled to avoid Mongoose OverwriteModelError
const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);
const Score = mongoose.models.Score || mongoose.model('Score', scoreSchema);

// Fallback to local MongoDB if environment variable is not defined
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/brainsnap';

async function seedDatabase() {
  try {
    console.log('⚡ BrainSnap Seeding: Connecting to database...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connection established.');

    // 1. SEED CATEGORIES
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      console.log('🌱 Seeding Categories...');
      const sampleCategories = [
        {
          name: 'Science & Cosmos',
          slug: 'science-cosmos',
          description: 'Quantum dynamics, orbital paths, and the bio-mechanical fabric of life.',
          icon: '🧬',
          color: '#00F0FF'
        },
        {
          name: 'Cyberpunk History',
          slug: 'cyberpunk-history',
          description: 'Chronicles of corporate wars, retro-computing, and counter-culture revolutions.',
          icon: '💾',
          color: '#FF2E93'
        },
        {
          name: 'Pop Culture Matrix',
          slug: 'pop-culture',
          description: 'From 80s synthwave masterpieces to legendary sci-fi cinematic universes.',
          icon: '🎬',
          color: '#FFD200'
        },
        {
          name: 'Digital Architecture',
          slug: 'digital-architecture',
          description: 'Microchips, internet protocols, cybernetics, and software design.',
          icon: '⚡',
          color: '#10B981'
        }
      ];
      await Category.insertMany(sampleCategories);
      console.log('✅ Categories seeded successfully.');
    } else {
      console.log('ℹ️ Categories already exist. Skipping.');
    }

    // 2. SEED QUESTIONS (10 high-velocity questions per category to fulfill the PRD's 10-question requirement)
    const questionCount = await Question.countDocuments();
    if (questionCount === 0) {
      console.log('🌱 Seeding Questions (10 per category)...');
      const sampleQuestions = [
        // SCIENCE & COSMOS
        {
          category: 'science-cosmos',
          questionText: 'Which subatomic particle has no electric charge and virtually zero mass?',
          options: 'Proton, Electron, Neutrino, Positron',
          correctOptionIndex: 2,
          explanation: 'Neutrinos are incredibly fast, tiny particles that pass through matter without hitting anything.'
        },
        {
          category: 'science-cosmos',
          questionText: 'What is the absolute cold limit of temperature in the universe?',
          options: '-273.15°C, -459.67°F, 0 Kelvin, All of these are correct',
          correctOptionIndex: 3,
          explanation: 'Absolute zero is 0 Kelvin, which equates precisely to both -273.15°C and -459.67°F.'
        },
        {
          category: 'science-cosmos',
          questionText: 'Which element makes up the majority of the Sun\'s mass?',
          options: 'Helium, Hydrogen, Carbon, Oxygen',
          correctOptionIndex: 1,
          explanation: 'Hydrogen makes up about 73% of the Sun\'s mass, fueling its fusion engine.'
        },
        {
          category: 'science-cosmos',
          questionText: 'How long does it take light from the Sun to reach Earth?',
          options: 'Approximately 8 seconds, Approximately 8 minutes, Approximately 8 hours, Instantly',
          correctOptionIndex: 1,
          explanation: 'Light travels at 300,000 km/s, taking roughly 8 minutes and 20 seconds to cross the void.'
        },
        {
          category: 'science-cosmos',
          questionText: 'What phenomenon causes time to pass slower near massive objects?',
          options: 'Gravitational Time Dilation, Speed Creep, Quantum Entanglement, Redshift',
          correctOptionIndex: 0,
          explanation: 'Einstein\'s General Relativity dictates that stronger gravitational fields warp spacetime and slow time down.'
        },
        {
          category: 'science-cosmos',
          questionText: 'Which molecular structure carries genetic instructions in all living organisms?',
          options: 'RNA, DNA, Protein strands, Ribosomes',
          correctOptionIndex: 1,
          explanation: 'Deoxyribonucleic Acid (DNA) is the primary blueprint storage device for life.'
        },
        {
          category: 'science-cosmos',
          questionText: 'What is the powerhouse organelle of eukaryotic cells?',
          options: 'Golgi Apparatus, Lysosome, Nucleus, Mitochondria',
          correctOptionIndex: 3,
          explanation: 'Mitochondria generate adenosine triphosphate (ATP), the chemical energy currency of cells.'
        },
        {
          category: 'science-cosmos',
          questionText: 'The core of a collapsed supergiant star becomes what dense entity?',
          options: 'Red Giant, White Dwarf, Neutron Star, Gas Planet',
          correctOptionIndex: 2,
          explanation: 'Supernovas leave behind insanely dense cores known as neutron stars, or black holes if massive enough.'
        },
        {
          category: 'science-cosmos',
          questionText: 'What is the escape velocity of Earth?',
          options: '5.2 km/s, 11.2 km/s, 29.8 km/s, 42.1 km/s',
          correctOptionIndex: 1,
          explanation: 'To break free from Earth\'s gravitational grip, a projectile must achieve at least 11.2 km per second.'
        },
        {
          category: 'science-cosmos',
          questionText: 'Which planet is famous for its immense hexagon-shaped storm at its north pole?',
          options: 'Jupiter, Saturn, Neptune, Uranus',
          correctOptionIndex: 1,
          explanation: 'Saturn hosts a bizarre, permanent hexagonal wave pattern storm spanning 30,000 km wide.'
        },

        // CYBERPUNK HISTORY
        {
          category: 'cyberpunk-history',
          questionText: 'Which vacuum-tube computer, built in 1945, weighed over 27 tons and took up 1,800 square feet?',
          options: 'UNIVAC, ENIAC, Colossus, Harvard Mark I',
          correctOptionIndex: 1,
          explanation: 'ENIAC was the first programmable, electronic, general-purpose digital computer.'
        },
        {
          category: 'cyberpunk-history',
          questionText: 'Who coined the iconic futuristic term "Cyberspace" in his 1984 novel Neuromancer?',
          options: 'Neal Stephenson, Philip K. Dick, William Gibson, Bruce Sterling',
          correctOptionIndex: 2,
          explanation: 'William Gibson revolutionized the sci-fi genre by mapping the virtual landscape of "Cyberspace".'
        },
        {
          category: 'cyberpunk-history',
          questionText: 'Which historical computing unit was bypassed by the "Morris Worm" in 1988?',
          options: 'The Arpanet, The Web, Usenet, Minitel',
          correctOptionIndex: 0,
          explanation: 'The Morris Worm was one of the first computer worms distributed via the ARPANET, the precursor to modern internet.'
        },
        {
          category: 'cyberpunk-history',
          questionText: 'What was the name of the first commercial arcade video game released in 1971?',
          options: 'Pong, Computer Space, Space Invaders, Asteroids',
          correctOptionIndex: 1,
          explanation: 'Created by Nolan Bushnell and Ted Dabney (who later founded Atari), Computer Space was the pioneer.'
        },
        {
          category: 'cyberpunk-history',
          questionText: 'Which cybernetic system was the target of the real-world Stuxnet malware?',
          options: 'Nuclear Centrifuges, Power Grids, Air Traffic Control, Stock Exchange Servers',
          correctOptionIndex: 0,
          explanation: 'Stuxnet targetted industrial programmable logic controllers (PLCs) in Iran\'s nuclear enrichment systems.'
        },
        {
          category: 'cyberpunk-history',
          questionText: 'In hacking culture, what color hat represents attackers acting with purely malicious intent?',
          options: 'Red Hat, Grey Hat, Black Hat, White Hat',
          correctOptionIndex: 2,
          explanation: 'Black hat hackers violate computer security for personal gain or sheer disruption.'
        },
        {
          category: 'cyberpunk-history',
          questionText: 'What revolutionary operating system kernel was released for free by a Finnish student in 1991?',
          options: 'GNU, Minix, Linux, BSD',
          correctOptionIndex: 2,
          explanation: 'Linus Torvalds published the initial Linux kernel, reshaping open source technology forever.'
        },
        {
          category: 'cyberpunk-history',
          questionText: 'Which legendary 1982 neon-soaked movie visualized a hacker sucked into a mainframe computer?',
          options: 'WarGames, Blade Runner, TRON, Videodrome',
          correctOptionIndex: 2,
          explanation: 'TRON featured state-of-the-art glowing vector aesthetics and virtual battle arenas.'
        },
        {
          category: 'cyberpunk-history',
          questionText: 'What cryptopunk movement document in 1992 advocated for strong cryptography to defend individual privacy?',
          options: 'The Cypherpunk Manifesto, The Hacker Manifesto, The GNU Declaration, PGP Handbook',
          correctOptionIndex: 0,
          explanation: 'Eric Hughes wrote the Cypherpunk Manifesto, declaring that "Privacy is necessary for an open society in the electronic age."'
        },
        {
          category: 'cyberpunk-history',
          questionText: 'Which storage medium was standard for saving mainframe data in the early 1970s?',
          options: 'Floppy Disks, Magnetic Tape, CD-ROMs, Punch Cards',
          correctOptionIndex: 3,
          explanation: 'Punch cards dominated early digital input/output storage cycles.'
        },

        // POP CULTURE
        {
          category: 'pop-culture',
          questionText: 'In the Matrix franchise, what color pill does Neo take to wake up to reality?',
          options: 'Blue Pill, Red Pill, Green Pill, Yellow Pill',
          correctOptionIndex: 1,
          explanation: 'The Red Pill represents the brutal, unfiltered truth, while the Blue Pill represents blissful ignorance.'
        },
        {
          category: 'pop-culture',
          questionText: 'Which synthwave-fueled movie features Ryan Gosling as a silent, hammer-wielding stunt driver?',
          options: 'Drive, Blade Runner 2049, Only God Forgives, Nightcrawler',
          correctOptionIndex: 0,
          explanation: 'Drive (2011) popularized modern retrowave, neon aesthetics, and synth soundtracks.'
        },
        {
          category: 'pop-culture',
          questionText: 'What cyberpunk anime masterpiece features Shotaro Kaneda riding an iconic red custom motorcycle?',
          options: 'Ghost in the Shell, Akira, Neon Genesis Evangelion, Cowboy Bebop',
          correctOptionIndex: 1,
          explanation: 'Akira (1988) set a global benchmark for hand-drawn futuristic animation.'
        },
        {
          category: 'pop-culture',
          questionText: 'Which retro console featured the infamous "Super FX" chip to render 3D graphics like Star Fox?',
          options: 'Sega Genesis, Super Nintendo (SNES), Atari Jaguar, Neo Geo',
          correctOptionIndex: 1,
          explanation: 'The Super FX was a coprocessor on the SNES cartridge used to accelerate 3D polygonal graphics.'
        },
        {
          category: 'pop-culture',
          questionText: 'Which fictional corporate mega-empire manufactures the replicants in Blade Runner (1982)?',
          options: 'Weyland-Yutani, Tyrell Corporation, Cyberdyne Systems, Omni Consumer Products',
          correctOptionIndex: 1,
          explanation: 'The Tyrell Corporation\'s motto is "More human than human".'
        },
        {
          category: 'pop-culture',
          questionText: 'In the classic sci-fi film Tron, what high-stakes light-emitting vehicles do contestants drive?',
          options: 'Hovercrafts, Light Cycles, Vector Gliders, Grid Speeder',
          correctOptionIndex: 1,
          explanation: 'Light Cycles leave trailing solid walls of light that crash opponents.'
        },
        {
          category: 'pop-culture',
          questionText: 'What synth-heavy 80s hit band released the neon-soaked classic "Blue Monday"?',
          options: 'Depeche Mode, New Order, The Cure, Tears for Fears',
          correctOptionIndex: 1,
          explanation: '"Blue Monday" by New Order is one of the most influential electronic dance tracks of all time.'
        },
        {
          category: 'pop-culture',
          questionText: 'Who directed the hyper-futuristic 1997 cyberpunk thriller "The Fifth Element"?',
          options: 'Luc Besson, Ridley Scott, James Cameron, David Cronenberg',
          correctOptionIndex: 0,
          explanation: 'Luc Besson designed the brilliantly colorful, flying-cab filled future vision of 2263.'
        },
        {
          category: 'pop-culture',
          questionText: 'In Daft Punk\'s legendary visual universe, what are their signatures?',
          options: 'Neon Jackets, Chrome Robot Helmets, Glowing Visors, Golden Keyboards',
          correctOptionIndex: 1,
          explanation: 'The French electronic duo wore custom-built robotic helmets as their public personas.'
        },
        {
          category: 'pop-culture',
          questionText: 'Which game engine is heavily associated with the visual production of virtual environments like Mandalorian?',
          options: 'Unity, Unreal Engine, CryEngine, Frostbite',
          correctOptionIndex: 1,
          explanation: 'Epic Games\' Unreal Engine is used to render real-time virtual backdrops on giant LED walls.'
        },

        // DIGITAL ARCHITECTURE
        {
          category: 'digital-architecture',
          questionText: 'What protocol is responsible for resolving user-friendly URLs into IP addresses?',
          options: 'DHCP, DNS, FTP, HTTP',
          correctOptionIndex: 1,
          explanation: 'The Domain Name System (DNS) maps human-readable names to digital IP destinations.'
        },
        {
          category: 'digital-architecture',
          questionText: 'Which data structure follows the Last-In, First-Out (LIFO) execution order?',
          options: 'Queue, Stack, Binary Tree, Heap',
          correctOptionIndex: 1,
          explanation: 'Stacks operate on LIFO (like a pile of plates); the last item added is the first one retrieved.'
        },
        {
          category: 'digital-architecture',
          questionText: 'What architectural standard limits a single microchip\'s instruction complexity to boost throughput?',
          options: 'CISC, RISC, x86-64, Von Neumann',
          correctOptionIndex: 1,
          explanation: 'Reduced Instruction Set Computer (RISC) architectures simplify instruction complexity for faster execution.'
        },
        {
          category: 'digital-architecture',
          questionText: 'Which component coordinates all communication between the CPU, RAM, and external graphics card?',
          options: 'Southbridge, Motherboard BIOS, Northbridge, Power Phase Unit',
          correctOptionIndex: 2,
          explanation: 'Historically, the Northbridge handled high-speed communication between CPU, RAM, and PCI-E controllers.'
        },
        {
          category: 'digital-architecture',
          questionText: 'What is the binary equivalent of the decimal number 13?',
          options: '1011, 1100, 1101, 1111',
          correctOptionIndex: 2,
          explanation: 'In binary, 1101 is calculated as (8 * 1) + (4 * 1) + (2 * 0) + (1 * 1) = 13.'
        },
        {
          category: 'digital-architecture',
          questionText: 'Which layer of the OSI model is responsible for routing data packets across distinct networks?',
          options: 'Data Link Layer, Network Layer, Transport Layer, Session Layer',
          correctOptionIndex: 1,
          explanation: 'The Network Layer (Layer 3) handles routing, logical addressing, and path determination.'
        },
        {
          category: 'digital-architecture',
          questionText: 'In standard web infrastructure, what does status code 403 represent?',
          options: 'Not Found, Unauthorized, Forbidden, Bad Gateway',
          correctOptionIndex: 2,
          explanation: '403 Forbidden means the server understands the request but refuses to authorize it.'
        },
        {
          category: 'digital-architecture',
          questionText: 'Which encryption model utilizes public and private keys for secure information transit?',
          options: 'Symmetric Encryption, Asymmetric Encryption, Hash Encoding, Salting',
          correctOptionIndex: 1,
          explanation: 'Asymmetric encryption employs paired cryptographic keys (public and private) for secure communication.'
        },
        {
          category: 'digital-architecture',
          questionText: 'What technology creates virtual pathways over public networks, shielding telemetry data?',
          options: 'NAT, SSL/TLS, VPN, Proxy Filter',
          correctOptionIndex: 2,
          explanation: 'A Virtual Private Network (VPN) encrypts internet traffic and masks digital presence.'
        },
        {
          category: 'digital-architecture',
          questionText: 'Which primary database format relies on tabular schemas and SQL queries?',
          options: 'Document Store, Key-Value DB, Relational DB, Graph DB',
          correctOptionIndex: 2,
          explanation: 'Relational Database Management Systems store structured, tabular datasets with strict relationships.'
        }
      ];
      await Question.insertMany(sampleQuestions);
      console.log('✅ 40 High-Voltage Questions seeded successfully.');
    } else {
      console.log('ℹ️ Questions already exist. Skipping.');
    }

    // 3. SEED LEADERBOARDS (HIGH SCORES)
    const scoreCount = await Score.countDocuments();
    if (scoreCount === 0) {
      console.log('🌱 Seeding Scores (Live Leaderboard Spark)...');
      const sampleScores = [
        { username: 'NeoPhreak', category: 'cyberpunk-history', score: 10, timeTaken: 34.2 },
        { username: 'QuantumGamer', category: 'science-cosmos', score: 9, timeTaken: 41.5 },
        { username: 'SynthSorcerer', category: 'pop-culture', score: 10, timeTaken: 28.9 },
        { username: 'ByteBurner', category: 'digital-architecture', score: 8, timeTaken: 38.0 },
        { username: 'ZeroCool', category: 'cyberpunk-history', score: 9, timeTaken: 44.1 },
        { username: 'NovaThinker', category: 'science-cosmos', score: 10, timeTaken: 31.8 }
      ];
      await Score.insertMany(sampleScores);
      console.log('✅ High Scores seeded successfully.');
    } else {
      console.log('ℹ️ Score telemetry already exists. Skipping.');
    }

    console.log('⚡ BrainSnap Seeding Completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed with error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from database.');
  }
}

seedDatabase();