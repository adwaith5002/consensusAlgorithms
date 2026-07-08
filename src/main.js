import './style.css';
import Chart from 'chart.js/auto';
import { ConsensusVisualizer } from './visualizer.js';

// Graph helper functions to keep data clean
const createNodes = (arr) => arr.map(n => ({ id: n[0], label: n[1], color: n[2], shape: n[3] || 'dot', size: n[4] || 20 }));
const createEdges = (arr) => arr.map(e => ({ from: e[0], to: e[1], arrows: e[2] || 'to' }));

const C_CYAN = { border: '#d97706', background: 'rgba(217, 119, 6, 0.12)' };
const C_PURP = { border: '#8b5cf6', background: 'rgba(139, 92, 246, 0.12)' };
const C_ORANGE = { border: '#ef4444', background: 'rgba(239, 68, 68, 0.12)' };
const C_GREEN = { border: '#10b981', background: 'rgba(16, 185, 129, 0.12)' };
const C_WHITE = { border: '#a19e95', background: 'rgba(161, 158, 149, 0.08)' };

const consensusData = [
  {
    id: 'pow',
    name: 'Proof of Work (PoW)',
    mechanism: 'Miners compete to solve complex cryptographic puzzles to validate transactions and create new blocks.',
    procedure: 'In Proof of Work, network participants (miners) compete to solve a cryptographic puzzle using computational power. The first to solve it gets the right to bundle pending transactions into a new block and broadcast it to the network. Other nodes verify the solution and add the block to their chain. This process is highly secure but consumes a massive amount of energy.',
    steps: [
      {
        text: 'Users broadcast transactions to the Mempool.',
        graph: {
          nodes: createNodes([[1,'User A',C_CYAN], [2,'User B',C_CYAN], [3,'Mempool',C_PURP, 'box', 30]]),
          edges: createEdges([[1,3], [2,3]])
        }
      },
      {
        text: 'Miners collect transactions and race to solve a hash puzzle.',
        graph: {
          nodes: createNodes([[3,'Mempool',C_PURP,'box',30], [4,'Miner 1',C_ORANGE], [5,'Miner 2',C_ORANGE], [6,'Miner 3',C_ORANGE]]),
          edges: createEdges([[3,4], [3,5], [3,6]])
        }
      },
      {
        text: 'Miner 2 solves the puzzle first!',
        graph: {
          nodes: createNodes([[4,'Miner 1 (Failed)',C_ORANGE], [5,'Miner 2 (Winner!)',C_GREEN, 'star', 35], [6,'Miner 3 (Failed)',C_ORANGE]]),
          edges: []
        }
      },
      {
        text: 'Network nodes verify the solution and append the block.',
        graph: {
          nodes: createNodes([[5,'Miner 2',C_GREEN], [7,'Block #100',C_CYAN,'box'], [8,'Block #101',C_PURP,'box']]),
          edges: createEdges([[7,8], [5,8]])
        }
      }
    ],
    trilemma: { scores: [3, 10, 8], scalability: 'Low: Block creation is slow.', security: 'High: Resistant to 51% attacks.', decentralization: 'High/Medium' },
    blockchains: [{ name: 'Bitcoin (BTC)', reason: 'Digital gold.' }],
    smartContracts: [{ name: 'Rootstock (RSK)', language: 'Solidity' }],
    layer: { type: 'Layer 1', description: 'Base chain settlement.' }
  },
  {
    id: 'pos',
    name: 'Proof of Stake (PoS)',
    mechanism: 'Validators are chosen to create new blocks based on the amount of cryptocurrency they "stake".',
    procedure: 'In Proof of Stake, participants lock up (stake) a certain amount of cryptocurrency as collateral. The protocol randomly selects a validator to propose the next block, with the probability often proportional to their staked amount. Other validators then attest to the block. This eliminates the need for energy-intensive mining while keeping validators financially aligned with the network\'s integrity.',
    steps: [
      {
        text: 'Users broadcast transactions to the network.',
        graph: {
          nodes: createNodes([[1,'Tx',C_CYAN], [2,'Val A (10 ETH)',C_PURP], [3,'Val B (320 ETH)',C_ORANGE, 'dot', 35], [4,'Val C (50 ETH)',C_PURP]]),
          edges: createEdges([[1,2], [1,3], [1,4]])
        }
      },
      {
        text: 'Algorithm randomly selects a validator based on stake size.',
        graph: {
          nodes: createNodes([[2,'Val A',C_PURP], [3,'Val B (Selected)',C_GREEN, 'star', 45], [4,'Val C',C_PURP]]),
          edges: []
        }
      },
      {
        text: 'Selected validator proposes a new block.',
        graph: {
          nodes: createNodes([[3,'Val B',C_GREEN, 'star', 45], [5,'New Block',C_PURP,'box']]),
          edges: createEdges([[3,5]])
        }
      },
      {
        text: 'Other validators attest to the block\'s validity.',
        graph: {
          nodes: createNodes([[2,'Val A',C_CYAN], [3,'Val B',C_GREEN], [4,'Val C',C_CYAN], [5,'New Block',C_PURP,'box']]),
          edges: createEdges([[2,5], [4,5], [3,5]])
        }
      }
    ],
    trilemma: { scores: [7, 8, 7], scalability: 'Medium/High', security: 'High', decentralization: 'Medium' },
    blockchains: [{ name: 'Ethereum (ETH)', reason: 'Shifted from PoW to PoS.' }],
    smartContracts: [{ name: 'Ethereum', language: 'Solidity' }],
    layer: { type: 'Layer 1', description: 'Base layer.' }
  },
  {
    id: 'dpos',
    name: 'Delegated PoS (DPoS)',
    mechanism: 'Token holders vote for a select group of "delegates" who validate transactions.',
    procedure: 'Delegated Proof of Stake works like a digital democracy. Instead of directly validating transactions, token holders vote to elect a small, fixed number of delegates or block producers. These elected nodes take turns proposing and validating blocks in a fast, highly-coordinated schedule, which allows for significantly higher transaction throughput at the cost of some decentralization.',
    steps: [
      {
        text: 'Token holders use balances to vote for delegates.',
        graph: {
          nodes: createNodes([[1,'Voter',C_CYAN], [2,'Voter',C_CYAN], [3,'Voter',C_CYAN], [4,'Delegate A',C_PURP, 'box'], [5,'Delegate B',C_PURP, 'box']]),
          edges: createEdges([[1,4], [2,4], [3,5]])
        }
      },
      {
        text: 'Top delegates (e.g., 21 in EOS) are elected.',
        graph: {
          nodes: createNodes([[4,'Delegate A (Active)',C_GREEN, 'box', 35], [5,'Delegate B (Active)',C_GREEN, 'box', 35], [6,'Delegate C (Active)',C_GREEN, 'box', 35]]),
          edges: createEdges([[4,5,'to,from'], [5,6,'to,from'], [6,4,'to,from']])
        }
      },
      {
        text: 'Delegates take turns proposing blocks instantly.',
        graph: {
          nodes: createNodes([[4,'Delegate A',C_GREEN, 'box'], [7,'Block N',C_PURP,'box']]),
          edges: createEdges([[4,7]])
        }
      }
    ],
    trilemma: { scores: [10, 6, 3], scalability: 'High', security: 'Medium', decentralization: 'Low' },
    blockchains: [{ name: 'Tron (TRX)', reason: 'High throughput.' }],
    smartContracts: [{ name: 'Tron', language: 'Solidity' }],
    layer: { type: 'Layer 1', description: 'High-throughput base layer.' }
  },
  {
    id: 'poh',
    name: 'Proof of History (PoH)',
    mechanism: 'A cryptographic clock proves time has passed between events.',
    procedure: 'Proof of History acts as a decentralized clock. It uses a Verifiable Delay Function (VDF) to generate a cryptographic timestamp, proving that a specific amount of time has passed between events. This allows nodes to agree on the exact order of transactions without needing to constantly communicate with each other, dramatically speeding up the network\'s processing capabilities.',
    steps: [
      {
        text: 'A verifiable delay function (VDF) creates a timeline.',
        graph: {
          nodes: createNodes([[1,'Tick 1',C_PURP], [2,'Tick 2',C_PURP], [3,'Tick 3',C_PURP]]),
          edges: createEdges([[1,2], [2,3]])
        }
      },
      {
        text: 'Transactions are timestamped securely.',
        graph: {
          nodes: createNodes([[1,'Tick 1',C_PURP], [2,'Tick 2',C_PURP], [4,'Tx A',C_CYAN], [5,'Tx B',C_CYAN]]),
          edges: createEdges([[1,2], [4,1], [5,2]])
        }
      },
      {
        text: 'Nodes process transactions concurrently.',
        graph: {
          nodes: createNodes([[4,'Tx A',C_CYAN], [5,'Tx B',C_CYAN], [6,'Validator',C_GREEN, 'star']]),
          edges: createEdges([[4,6], [5,6]])
        }
      }
    ],
    trilemma: { scores: [10, 7, 5], scalability: 'Extremely High', security: 'Medium/High', decentralization: 'Medium' },
    blockchains: [{ name: 'Solana (SOL)', reason: 'Maximum scalability.' }],
    smartContracts: [{ name: 'Solana', language: 'Rust' }],
    layer: { type: 'Layer 1', description: 'Extreme speed base layer.' }
  },
  {
    id: 'dag',
    name: 'DAG / Tangle',
    mechanism: 'A graph structure where each transaction must validate two previous ones.',
    procedure: 'Directed Acyclic Graph (DAG) departs from the traditional linear blockchain structure. Instead of blocks, each new transaction must directly reference and validate two or more previous transactions to be accepted. As more users participate, the network can process transactions in parallel, allowing it to scale infinitely and often removing the need for transaction fees entirely.',
    steps: [
      {
        text: 'User wants to send a transaction (Tx C).',
        graph: {
          nodes: createNodes([[1,'Tx A',C_PURP], [2,'Tx B',C_PURP], [3,'Tx C (New)',C_CYAN]]),
          edges: []
        }
      },
      {
        text: 'Device verifies two random previous transactions.',
        graph: {
          nodes: createNodes([[1,'Tx A',C_PURP], [2,'Tx B',C_PURP], [3,'Tx C',C_CYAN]]),
          edges: createEdges([[3,1], [3,2]])
        }
      },
      {
        text: 'The Tangle grows horizontally.',
        graph: {
          nodes: createNodes([[1,'Tx A',C_PURP], [2,'Tx B',C_PURP], [3,'Tx C',C_PURP], [4,'Tx D',C_CYAN], [5,'Tx E',C_CYAN]]),
          edges: createEdges([[3,1], [3,2], [4,3], [4,1], [5,3], [5,2]])
        }
      }
    ],
    trilemma: { scores: [10, 6, 9], scalability: 'Extremely High', security: 'Medium', decentralization: 'High' },
    blockchains: [{ name: 'IOTA (MIOTA)', reason: 'IoT micro-transactions.' }],
    smartContracts: [{ name: 'IOTA', language: 'Solidity, Rust' }],
    layer: { type: 'Layer 1 (DLT)', description: 'Distributed Ledger Technology.' }
  },
  {
    id: 'avalanche',
    name: 'Avalanche Consensus',
    mechanism: 'Meta-stable protocol repeatedly sub-sampling random nodes.',
    procedure: 'The Avalanche consensus mechanism relies on a meta-stable, sub-sampled voting protocol. When a node receives a transaction, it rapidly polls a small, random sample of other nodes. Those nodes repeat the process, creating a cascading effect until the entire network rapidly converges on a single decision. This results in incredibly fast finality and high throughput while maintaining robust security.',
    steps: [
      {
        text: 'Node asks a random sample of peers.',
        graph: {
          nodes: createNodes([[1,'Node',C_GREEN], [2,'Peer',C_CYAN], [3,'Peer',C_CYAN], [4,'Peer',C_CYAN]]),
          edges: createEdges([[1,2], [1,3], [1,4]])
        }
      },
      {
        text: 'Peers ask other peers, cascading rapidly.',
        graph: {
          nodes: createNodes([[1,'Node',C_GREEN], [2,'Peer',C_CYAN], [3,'Peer',C_CYAN], [4,'Peer',C_CYAN], [5,'Peer',C_PURP], [6,'Peer',C_PURP], [7,'Peer',C_PURP]]),
          edges: createEdges([[1,2], [1,3], [1,4], [2,5], [2,6], [3,7], [4,5]])
        }
      },
      {
        text: 'Network converges on a single decision.',
        graph: {
          nodes: createNodes([[1,'Node',C_GREEN], [2,'Peer',C_GREEN], [3,'Peer',C_GREEN], [4,'Peer',C_GREEN], [5,'Peer',C_GREEN], [6,'Peer',C_GREEN], [7,'Peer',C_GREEN]]),
          edges: createEdges([[1,2], [1,3], [1,4], [2,5], [2,6], [3,7], [4,5]])
        }
      }
    ],
    trilemma: { scores: [9, 8, 9], scalability: 'Very High', security: 'High', decentralization: 'High' },
    blockchains: [{ name: 'Avalanche (AVAX)', reason: 'High-speed DeFi.' }],
    smartContracts: [{ name: 'Avalanche C-Chain', language: 'Solidity' }],
    layer: { type: 'Layer 1', description: 'Highly scalable Layer 1.' }
  },
  {
    id: 'pbft',
    name: 'Practical BFT (pBFT)',
    mechanism: 'Consensus tolerating up to 1/3 malicious nodes.',
    procedure: 'Practical Byzantine Fault Tolerance enables a network to reach consensus even if up to one-third of its nodes are malicious or failing. A primary node receives a request and broadcasts it to secondary nodes, which then communicate back and forth to verify the information. Once a supermajority agrees, the transaction is finalized. It is highly efficient but scales poorly, making it ideal for permissioned enterprise networks.',
    steps: [
      {
        text: 'Client sends request to primary (leader).',
        graph: {
          nodes: createNodes([[1,'Client',C_CYAN], [2,'Leader',C_GREEN, 'star', 35]]),
          edges: createEdges([[1,2]])
        }
      },
      {
        text: 'Leader broadcasts request to secondaries.',
        graph: {
          nodes: createNodes([[2,'Leader',C_GREEN, 'star'], [3,'R1',C_PURP], [4,'R2',C_PURP], [5,'R3',C_PURP]]),
          edges: createEdges([[2,3], [2,4], [2,5]])
        }
      },
      {
        text: 'Client waits for f+1 replies.',
        graph: {
          nodes: createNodes([[1,'Client',C_CYAN], [3,'R1',C_GREEN], [4,'R2',C_GREEN], [5,'R3',C_GREEN]]),
          edges: createEdges([[3,1], [4,1], [5,1]])
        }
      }
    ],
    trilemma: { scores: [8, 8, 4], scalability: 'Medium/High', security: 'High', decentralization: 'Low' },
    blockchains: [{ name: 'Hyperledger', reason: 'Enterprise network.' }],
    smartContracts: [{ name: 'Hyperledger', language: 'Go, Java' }],
    layer: { type: 'Layer 1', description: 'Base layer for enterprise.' }
  },
  {
    id: 'rollups',
    name: 'Rollups (L2)',
    mechanism: 'Executes transactions off-chain and posts data to Layer 1.',
    procedure: 'Rollups are Layer 2 scaling solutions that move transaction execution off the main chain. An L2 sequencer collects hundreds of transactions, bundles them into a single batch, and executes them. It then generates a cryptographic proof of the results and posts only this compressed data back to the Layer 1 blockchain (like Ethereum). This vastly reduces congestion and fees while inheriting the base layer\'s security.',
    steps: [
      {
        text: 'Users submit transactions to Layer 2.',
        graph: {
          nodes: createNodes([[1,'Tx',C_CYAN], [2,'Tx',C_CYAN], [3,'Tx',C_CYAN], [4,'L2 Sequencer',C_PURP, 'box', 30]]),
          edges: createEdges([[1,4], [2,4], [3,4]])
        }
      },
      {
        text: 'Sequencer batches transactions.',
        graph: {
          nodes: createNodes([[4,'L2 Sequencer',C_PURP, 'box'], [5,'Batch Proof',C_GREEN, 'database']]),
          edges: createEdges([[4,5]])
        }
      },
      {
        text: 'Batch posted to L1 for finality.',
        graph: {
          nodes: createNodes([[5,'Batch Proof',C_GREEN, 'database'], [6,'Ethereum L1',C_ORANGE, 'box', 40]]),
          edges: createEdges([[5,6]])
        }
      }
    ],
    trilemma: { scores: [10, 9, 4], scalability: 'Extremely High', security: 'High', decentralization: 'Low/Medium' },
    blockchains: [{ name: 'Arbitrum', reason: 'Optimistic rollup.' }],
    smartContracts: [{ name: 'Arbitrum', language: 'Solidity' }],
    layer: { type: 'Layer 2', description: 'Built on L1 for execution.' }
  },
  {
    id: 'poa',
    name: 'Proof of Authority (PoA)',
    mechanism: 'Identities of designated validators are placed at stake rather than computational power or tokens.',
    procedure: 'In Proof of Authority, blocks and transactions are validated by approved accounts, known as validators. Validators run software allowing them to put transactions in blocks. The process is automated and does not require validators to be constantly monitoring their computers. It requires a high level of trust, as validators\' identities are known and their reputation is at stake. This makes it highly scalable but largely centralized.',
    steps: [
      {
        text: 'User submits a transaction.',
        graph: {
          nodes: createNodes([[1,'Tx',C_CYAN], [2,'Validator A',C_GREEN, 'star', 35]]),
          edges: createEdges([[1,2]])
        }
      },
      {
        text: 'Known validator verifies the transaction instantly.',
        graph: {
          nodes: createNodes([[2,'Validator A',C_GREEN, 'star', 35], [3,'Verified Tx',C_PURP, 'box']]),
          edges: createEdges([[2,3]])
        }
      },
      {
        text: 'Block is proposed and committed by the authority.',
        graph: {
          nodes: createNodes([[2,'Validator A',C_GREEN, 'star'], [4,'Block',C_PURP,'box']]),
          edges: createEdges([[2,4]])
        }
      }
    ],
    trilemma: { scores: [10, 8, 2], scalability: 'Extremely High', security: 'High (reputation-based)', decentralization: 'Low' },
    blockchains: [{ name: 'VeChain (VET)', reason: 'Supply chain tracking.' }, { name: 'BNB Smart Chain', reason: 'Uses a PoS/PoA hybrid.' }],
    smartContracts: [{ name: 'VeChainThor', language: 'Solidity' }],
    layer: { type: 'Layer 1', description: 'Enterprise/Permissioned Base Layer.' }
  },
  {
    id: 'poc',
    name: 'Proof of Space (PoC)',
    mechanism: 'Validators dedicate unused hard drive space to the network to "plot" solutions.',
    procedure: 'Proof of Space (or Capacity) replaces energy-intensive computing with storage space. Miners "plot" their hard drives with cryptographic data ahead of time. When a new block needs to be created, the network issues a challenge. Miners check their plotted drives to see if they have the closest matching solution. Because reading from a hard drive takes very little energy compared to constant hashing, this consensus is highly energy efficient.',
    steps: [
      {
        text: 'Miners plot hard drives with cryptographic hashes.',
        graph: {
          nodes: createNodes([[1,'Plotter',C_CYAN], [2,'HDD 1',C_PURP, 'database', 30], [3,'HDD 2',C_PURP, 'database', 30]]),
          edges: createEdges([[1,2], [1,3]])
        }
      },
      {
        text: 'Network broadcasts a challenge for the next block.',
        graph: {
          nodes: createNodes([[4,'Challenge',C_ORANGE, 'star', 25], [2,'HDD 1',C_PURP, 'database'], [3,'HDD 2',C_PURP, 'database']]),
          edges: createEdges([[4,2], [4,3]])
        }
      },
      {
        text: 'Closest plot match wins the block reward.',
        graph: {
          nodes: createNodes([[2,'HDD 1 (No Match)',C_PURP, 'database'], [3,'HDD 2 (Winner!)',C_GREEN, 'database', 35], [5,'New Block',C_CYAN,'box']]),
          edges: createEdges([[3,5]])
        }
      }
    ],
    trilemma: { scores: [4, 8, 8], scalability: 'Low/Medium', security: 'High', decentralization: 'High' },
    blockchains: [{ name: 'Chia (XCH)', reason: 'Eco-friendly mining.' }],
    smartContracts: [{ name: 'Chialisp', language: 'Lisp-like' }],
    layer: { type: 'Layer 1', description: 'Eco-friendly base layer.' }
  }
];

// Dynamic injection of academic references to keep raw data clean
const referencesMapping = {
  pow: [
    { name: 'Wikipedia: Proof of Work', url: 'https://en.wikipedia.org/wiki/Proof_of_work' },
    { name: 'Bitcoin Whitepaper (Satoshi Nakamoto)', url: 'https://bitcoin.org/bitcoin.pdf' }
  ],
  pos: [
    { name: 'Wikipedia: Proof of Stake', url: 'https://en.wikipedia.org/wiki/Proof_of_stake' },
    { name: 'Ethereum Proof of Stake (ETH Docs)', url: 'https://ethereum.org/en/developers/docs/consensus-mechanisms/pos/' }
  ],
  dpos: [
    { name: 'Wikipedia: Delegated Proof of Stake', url: 'https://en.wikipedia.org/wiki/Proof_of_stake#Delegated_proof_of_stake' },
    { name: 'Delegated Proof of Stake Consensus (BitShares)', url: 'https://bitshares.org/technology/delegated-proof-of-stake-consensus/' }
  ],
  poh: [
    { name: 'Solana Whitepaper (Anatoly Yakovenko)', url: 'https://solana.com/solana-whitepaper.pdf' },
    { name: 'Solana Proof of History Guide', url: 'https://docs.solana.com/developing/programming-model/transactions#proof-of-history' }
  ],
  dag: [
    { name: 'Wikipedia: Directed Acyclic Graph', url: 'https://en.wikipedia.org/wiki/Directed_acyclic_graph' },
    { name: 'The Tangle Whitepaper (IOTA Foundation)', url: 'https://www.iota.org/foundation/research-papers' }
  ],
  avalanche: [
    { name: 'Avalanche Consensus Whitepaper (Team Rocket)', url: 'https://www.avalabs.org/whitepapers' },
    { name: 'Avalanche Consensus Protocol Overview', url: 'https://docs.avax.network/overview/getting-started/avalanche-consensus' }
  ],
  pbft: [
    { name: 'Wikipedia: Byzantine Fault Tolerance', url: 'https://en.wikipedia.org/wiki/Byzantine_fault_tolerance#Practical_Byzantine_fault_tolerance' },
    { name: 'Practical Byzantine Fault Tolerance (Castro & Liskov)', url: 'https://pmg.csail.mit.edu/papers/osdi99.pdf' }
  ],
  rollups: [
    { name: 'Ethereum Scaling Rollups guide', url: 'https://ethereum.org/en/developers/docs/scaling/rollups/' },
    { name: 'Arbitrum Rollup Technology Overview', url: 'https://developer.arbitrum.io/intro/' }
  ],
  poa: [
    { name: 'Wikipedia: Proof of Authority', url: 'https://en.wikipedia.org/wiki/Proof_of_authority' },
    { name: 'BNB Chain Consensus Mechanisms', url: 'https://docs.bnbchain.org/docs/learn/consensus' }
  ],
  poc: [
    { name: 'Wikipedia: Proof of Space', url: 'https://en.wikipedia.org/wiki/Proof_of_space' },
    { name: 'Chia Network Greenpaper (Bram Cohen)', url: 'https://www.chia.net/greenpaper/' }
  ]
};

consensusData.forEach(algo => {
  algo.references = referencesMapping[algo.id] || [];
});

let trilemmaChart = null;
let visualizer = null;
let currentAlgoId = 'pow';

function init() {
  visualizer = new ConsensusVisualizer('vis-network');
  renderFilters();
  renderMatrix();
  setupHUDControls();
  setupMatrixInteractivity();
  setupProtocolSimulator();
  selectAlgorithm(consensusData[0].id);
}

function setupHUDControls() {
  document.getElementById('btn-prev').addEventListener('click', () => visualizer.prevStep());
  document.getElementById('btn-next').addEventListener('click', () => visualizer.nextStep());
  document.getElementById('btn-play-pause').addEventListener('click', () => visualizer.togglePlay());
  
  document.getElementById('btn-speed-half').addEventListener('click', () => visualizer.setSpeed(0.5));
  document.getElementById('btn-speed-1').addEventListener('click', () => visualizer.setSpeed(1));
  document.getElementById('btn-speed-2').addEventListener('click', () => visualizer.setSpeed(2));
  
  document.getElementById('btn-zoom-in').addEventListener('click', () => visualizer.zoomIn());
  document.getElementById('btn-zoom-out').addEventListener('click', () => visualizer.zoomOut());
  document.getElementById('btn-zoom-fit').addEventListener('click', () => visualizer.zoomFit());
}

function setupMatrixInteractivity() {
  const table = document.getElementById('compatibility-matrix');
  if (!table) return;

  table.addEventListener('mouseover', (e) => {
    const cell = e.target.closest('td, th');
    if (!cell) return;
    
    const colIndex = cell.cellIndex;
    if (colIndex === undefined || colIndex === 0) return; // skip row header or empty index
    
    // Highlight all cells in the column
    table.querySelectorAll('tr').forEach(row => {
      const targetCell = row.cells[colIndex];
      if (targetCell) {
        targetCell.classList.add('active-col');
      }
    });
  });

  table.addEventListener('mouseout', (e) => {
    table.querySelectorAll('.active-col').forEach(cell => {
      cell.classList.remove('active-col');
    });
  });
}

function renderFilters() {
  const filtersContainer = document.getElementById('algorithm-filters');
  consensusData.forEach((algo, index) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.id = algo.id;
    btn.textContent = algo.name.split(' (')[0];
    btn.addEventListener('click', () => selectAlgorithm(algo.id));
    filtersContainer.appendChild(btn);
  });
}

function selectAlgorithm(id) {
  currentAlgoId = id;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.id === id);
  });

  const algo = consensusData.find(a => a.id === id);
  if (!algo) return;

  document.querySelectorAll('.panel').forEach(panel => {
    panel.style.animation = 'none';
    void panel.offsetWidth;
    panel.style.animation = null;
  });

  updateOverview(algo);
  updateTrilemma(algo);
  updateEcosystem(algo);
  recalculateSimulationMetrics();
}

function updateOverview(algo) {
  document.getElementById('algo-name').textContent = algo.name;
  document.getElementById('algo-layer').textContent = algo.layer.type;
  document.getElementById('algo-mechanism').textContent = algo.mechanism;
  document.getElementById('algo-procedure').textContent = algo.procedure;
  
  const stepsList = document.getElementById('algo-steps');
  stepsList.innerHTML = '';
  algo.steps.forEach((step, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>Phase 0${idx+1}</span> ${step.text}`;
    li.className = 'step-item';
    li.onclick = () => visualizer.goToStep(idx);
    stepsList.appendChild(li);
  });

  visualizer.load(algo.id, algo.steps);
}

function updateTrilemma(algo) {
  document.getElementById('desc-scalability').textContent = algo.trilemma.scalability;
  document.getElementById('desc-security').textContent = algo.trilemma.security;
  document.getElementById('desc-decentralization').textContent = algo.trilemma.decentralization;

  const ctx = document.getElementById('trilemmaChart').getContext('2d');
  if (trilemmaChart) trilemmaChart.destroy();

  Chart.defaults.color = '#9499a6';
  Chart.defaults.font.family = "'Outfit', sans-serif";

  trilemmaChart = new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Scalability', 'Security', 'Decentralization'],
      datasets: [{
        label: algo.name,
        data: algo.trilemma.scores,
        backgroundColor: 'rgba(47, 128, 237, 0.04)',
        borderColor: 'rgba(47, 128, 237, 0.8)',
        pointBackgroundColor: ['#eb5757', '#8e2de2', '#2f80ed'],
        pointBorderColor: 'rgba(47, 128, 237, 0.8)',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#2f80ed',
        borderWidth: 1.5,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 800, easing: 'easeOutQuart' },
      scales: {
        r: {
          angleLines: { color: 'rgba(255, 255, 255, 0.02)' },
          grid: { color: 'rgba(255, 255, 255, 0.03)', circular: true },
          pointLabels: { color: '#f3f3f7', font: { size: 12, weight: '500' } },
          ticks: { display: false, min: 0, max: 10 }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(8, 8, 12, 0.95)',
          titleColor: '#00e5ff',
          bodyColor: '#f3f3f7',
          borderColor: 'rgba(255, 255, 255, 0.04)',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 6,
          titleFont: { size: 14, family: 'Space Grotesk' },
          bodyFont: { size: 12, family: 'Outfit' }
        }
      }
    }
  });
}

function updateEcosystem(algo) {
  const blockchainsList = document.getElementById('algo-blockchains');
  blockchainsList.innerHTML = '';
  algo.blockchains.forEach((bc) => {
    const li = document.createElement('li');
    li.className = 'info-card';
    li.innerHTML = `<strong>${bc.name}</strong><span>${bc.reason}</span>`;
    blockchainsList.appendChild(li);
  });

  const contractsList = document.getElementById('algo-contracts');
  contractsList.innerHTML = '';
  algo.smartContracts.forEach((sc) => {
    const li = document.createElement('li');
    li.className = 'info-card';
    li.innerHTML = `<strong>${sc.name}</strong><span>${sc.language}</span>`;
    contractsList.appendChild(li);
  });

  const referencesList = document.getElementById('algo-references');
  referencesList.innerHTML = '';
  (algo.references || []).forEach((ref) => {
    const li = document.createElement('li');
    li.className = 'info-card';
    li.innerHTML = `<strong><a href="${ref.url}" target="_blank" rel="noopener noreferrer" class="ref-link">${ref.name} ↗</a></strong>`;
    referencesList.appendChild(li);
  });

  document.getElementById('layer-description').textContent = algo.layer.description;
}

function renderMatrix() {
  const table = document.getElementById('compatibility-matrix');
  table.innerHTML = '';
  const blockchains = [
    { name: 'Bitcoin', group: 'pow' }, { name: 'Ethereum', group: 'pos' },
    { name: 'Cardano', group: 'pos' }, { name: 'Solana', group: 'poh' },
    { name: 'Avalanche', group: 'avalanche' }, { name: 'IOTA', group: 'dag' },
    { name: 'Cosmos', group: 'pbft' }, { name: 'VeChain', group: 'poa' }, 
    { name: 'Chia', group: 'poc' }
  ];

  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const headerRow = document.createElement('tr');
  headerRow.appendChild(document.createElement('th'));
  blockchains.forEach(bc => {
    const th = document.createElement('th');
    th.textContent = bc.name;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  blockchains.forEach(rowBc => {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.className = 'row-header';
    th.textContent = rowBc.name;
    tr.appendChild(th);
    blockchains.forEach(colBc => {
      const td = document.createElement('td');
      if (rowBc.name === colBc.name) {
        td.textContent = 'SELF'; td.className = 'self';
      } else if (rowBc.group === colBc.group) {
        td.innerHTML = '<span class="comp-badge yes">Compatible</span>'; td.className = 'compatible';
      } else {
        td.innerHTML = '<span class="comp-badge no">—</span>'; td.className = 'incompatible';
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}

function setupProtocolSimulator() {
  const nodeSlider = document.getElementById('slider-nodes');
  const latencySlider = document.getElementById('slider-latency');
  
  if (!nodeSlider || !latencySlider) return;

  nodeSlider.addEventListener('input', (e) => {
    document.getElementById('val-nodes').textContent = e.target.value;
    recalculateSimulationMetrics();
  });

  latencySlider.addEventListener('input', (e) => {
    document.getElementById('val-latency').textContent = `${e.target.value} ms`;
    recalculateSimulationMetrics();
  });
}

function recalculateSimulationMetrics() {
  const N = parseInt(document.getElementById('slider-nodes').value);
  const L = parseInt(document.getElementById('slider-latency').value);
  
  const tpsEl = document.getElementById('metric-tps');
  const finalityEl = document.getElementById('metric-finality');
  const powerEl = document.getElementById('metric-power');
  
  if (!tpsEl || !finalityEl || !powerEl) return;

  let tps = 0;
  let finality = '';
  let power = '';

  switch (currentAlgoId) {
    case 'pow':
      tps = 7;
      finality = '60 mins (6 blocks)';
      power = `${(N * 125).toFixed(0)} kW (High)`;
      break;
    case 'pos':
      tps = Math.max(15, Math.round(1500 / (1 + (N * L / 8000))));
      finality = `${((L * 4) / 1000 + 12).toFixed(1)} secs`;
      power = `${(N * 0.05).toFixed(2)} kW (Very Low)`;
      break;
    case 'dpos':
      tps = Math.round(3000 / (1 + L / 100));
      finality = `${((L * 3) / 1000 + 2).toFixed(1)} secs`;
      power = `0.85 kW (Low)`;
      break;
    case 'poh':
      tps = Math.round(65000 / (1 + L / 50));
      finality = `${Math.round(400 + L * 0.5)} ms`;
      power = `2.1 kW (Low)`;
      break;
    case 'dag':
      tps = Math.round((20 * N) / (1 + L / 100));
      finality = `${(1.5 + (L * 8) / (N * 100)).toFixed(2)} secs`;
      power = `0.05 kW (Negligible)`;
      break;
    case 'avalanche':
      tps = Math.round(8000 / (1 + Math.log2(N) * L / 150));
      finality = `${(0.8 + (Math.log2(N) * L) / 500).toFixed(2)} secs`;
      power = `${(N * 0.08).toFixed(2)} kW (Very Low)`;
      break;
    case 'pbft':
      tps = Math.max(1, Math.round(10000 / (N * N * (L / 100))));
      finality = `${((L * N * 2) / 1000).toFixed(2)} secs`;
      power = `0.25 kW (Low)`;
      break;
    case 'rollups':
      tps = Math.round(5000 / (1 + L / 30));
      finality = `~15 mins (L1 confirmation)`;
      power = `0.15 kW (Very Low)`;
      break;
    case 'poa':
      tps = Math.round(4000 / (1 + L / 60));
      finality = `${((L * 2) / 1000 + 1).toFixed(1)} secs`;
      power = `0.45 kW (Low)`;
      break;
    case 'poc':
      tps = Math.round(25 / (1 + L / 120));
      finality = `30 secs (Space Proof)`;
      power = `${(N * 0.12).toFixed(1)} kW (Low)`;
      break;
    default:
      tps = 'N/A';
      finality = 'N/A';
      power = 'N/A';
  }

  tpsEl.textContent = typeof tps === 'number' ? `${tps.toLocaleString()} Tx/sec` : tps;
  finalityEl.textContent = finality;
  powerEl.textContent = power;
}

document.addEventListener('DOMContentLoaded', init);
