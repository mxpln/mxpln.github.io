// Page Routes Configuration
export const routes = [
  {
    name: 'HOME',
    path: '/',
    description: 'Digital brutalism meets modern web development. Experience raw, functional design that makes a statement.'
  },
  {
    name: 'GARDEN',
    path: '/garden',
    description: 'Personal collection of saved links — tools, reading and inspiration, organized by section.'
  },
  {
    name: 'WORKS',
    path: '/works',
    description: 'Explore a collection of battle-tested projects showcasing robust architecture and clean functionality.'
  },
  {
    name: 'LABORATORY',
    path: '/lab',
    description: 'Enter the experimental zone where new technologies are tested and digital boundaries are pushed.'
  },
  {
    name: 'STACK',
    path: '/stack',
    description: 'Deep dive into the technical arsenal - tools, frameworks, and methodologies that power the digital craft.'
  },
  {
    name: 'MANIFESTO',
    path: '/manifesto',
    description: 'Discover the philosophy behind digital brutalism and the principles that guide each project.'
  },
  {
    name: 'CONTACT',
    path: '/contact',
    description: 'Initiate direct communication protocols. Available for collaborations and project inquiries.'
  }
];

// Project Data
export const projects = [
  {
    id: 'quantum-vault',
    title: 'QUANTUM_VAULT',
    shortDesc: 'Secure messaging platform with end-to-end encryption',
    fullDesc: 'A next-generation secure communication platform leveraging quantum-resistant encryption algorithms. Built with a focus on privacy and security while maintaining a seamless user experience.',
    tech: ['React', 'Node.js', 'WebRTC', 'TailwindCSS'],
    features: [
      'End-to-end encryption',
      'Zero-knowledge architecture',
      'Real-time secure messaging',
      'File sharing with encryption',
      'Self-destructing messages'
    ],
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80',
    year: '2023',
    link: 'https://quantum-vault.example.com',
    github: 'https://github.com/example/quantum-vault'
  },
  {
    id: 'neural-forge',
    title: 'NEURAL_FORGE',
    shortDesc: 'AI-powered code analysis and optimization platform',
    fullDesc: 'An intelligent development tool that analyzes codebases, suggests optimizations, and automatically refactors code while maintaining functionality. Powered by advanced machine learning models.',
    tech: ['Python', 'TensorFlow', 'FastAPI', 'React'],
    features: [
      'Automated code analysis',
      'Performance optimization suggestions',
      'Security vulnerability detection',
      'Code quality metrics',
      'Integration with major IDEs'
    ],
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80',
    year: '2023',
    link: 'https://neural-forge.example.com',
    github: 'https://github.com/example/neural-forge'
  },
  {
    id: 'cyber-grid',
    title: 'CYBER_GRID',
    shortDesc: 'Distributed computing platform for edge devices',
    fullDesc: 'A revolutionary platform that harnesses the power of edge devices to create a distributed computing network. Perfect for IoT deployments and decentralized applications.',
    tech: ['Rust', 'WebAssembly', 'React', 'GraphQL'],
    features: [
      'Edge computing optimization',
      'Decentralized processing',
      'Real-time data analysis',
      'Automated load balancing',
      'Fault tolerance'
    ],
    image: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?auto=format&fit=crop&q=80',
    year: '2022',
    link: 'https://cyber-grid.example.com',
    github: 'https://github.com/example/cyber-grid'
  }
];