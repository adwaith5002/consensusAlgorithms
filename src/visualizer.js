import { Network, DataSet } from 'vis-network/standalone';

export class ConsensusVisualizer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.network = null;
    this.nodes = new DataSet([]);
    this.edges = new DataSet([]);
    this.algoId = null;
    this.currentStep = 0;
    this.steps = [];
    this.interval = null;
    this.animationFrameId = null;
    this.time = 0;
    
    // Animation state variables
    this.particles = [];
    this.colors = {};
    this.timers = {};
    this.state = {};
    
    this.initNetwork();
  }

  initNetwork() {
    this.container.innerHTML = '';
    this.refreshColors();
    const colors = this.colors;
    
    this.options = {
      width: '100%',
      height: '100%',
      nodes: {
        shape: 'box',
        margin: { top: 6, bottom: 6, left: 10, right: 10 },
        font: { size: 9, color: '#f0f3f7', face: 'JetBrains Mono', multi: true },
        borderWidth: 1.0,
        shadow: { enabled: false },
        color: {
          background: '#0d0e12',
          border: '#222530',
          highlight: { background: '#121620', border: '#2f80ed' },
          hover: { background: '#121620', border: '#2f80ed' }
        },
        shapeProperties: {
          borderRadius: 2 // Sharp academic box corners
        },
        widthConstraint: { minimum: 70, maximum: 100 }
      },
      edges: {
        width: 1.0,
        color: { color: 'rgba(255, 255, 255, 0.04)', highlight: '#2f80ed' },
        smooth: {
          type: 'cubicBezier',
          forceDirection: 'horizontal',
          roundness: 0.6
        },
        arrows: { to: { scaleFactor: 0.4 } }
      },
      physics: { enabled: false },
      interaction: { dragNodes: true, zoomView: false, hover: true }
    };
    
    const data = {
      nodes: this.nodes,
      edges: this.edges
    };
    
    this.network = new Network(this.container, data, this.options);
    
    // Bind the canvas redraw callback
    this.network.on("afterDrawing", (ctx) => this.drawCustomAnimations(ctx));

    // Bind animate loop
    this.animate = this.animate.bind(this);
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  refreshColors() {
    const style = getComputedStyle(document.documentElement);
    this.colors = {
      cyan: style.getPropertyValue('--accent-cyan').trim() || '#2f80ed',
      purple: style.getPropertyValue('--accent-purple').trim() || '#8e2de2',
      orange: style.getPropertyValue('--accent-orange').trim() || '#eb5757',
      green: style.getPropertyValue('--accent-green').trim() || '#219653',
      textPrimary: style.getPropertyValue('--text-primary').trim() || '#ffffff',
      textSecondary: style.getPropertyValue('--text-secondary').trim() || '#8c92a0',
      textMuted: style.getPropertyValue('--text-muted').trim() || '#515664',
      border: style.getPropertyValue('--border-color').trim() || '#1e2029',
      bg: '#070709'
    };
  }

  load(algoId, steps) {
    this.stopInterval();
    this.algoId = algoId;
    this.steps = steps;
    this.currentStep = 0;
    this.refreshColors();
    this.initState();

    this.highlightStepUI();
    this.startInterval();
  }

  goToStep(index) {
    this.stopInterval();
    this.currentStep = index;
    this.highlightStepUI();
    this.onStepChange();
    this.startInterval();
  }

  startInterval() {
    this.interval = setInterval(() => {
      this.currentStep = (this.currentStep + 1) % this.steps.length;
      this.highlightStepUI();
      this.onStepChange();
    }, 6000);
  }

  clearStepIntervals() {
    for (const key in this.timers) {
      if (this.timers[key]) {
        clearInterval(this.timers[key]);
        clearTimeout(this.timers[key]);
      }
    }
    this.timers = {};
  }

  stopInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.clearStepIntervals();
  }

  highlightStepUI() {
    document.querySelectorAll('.step-item').forEach((li, idx) => {
      if (idx === this.currentStep) {
        li.classList.add('active-step');
      } else {
        li.classList.remove('active-step');
      }
    });
  }

  updateLegend(items) {
    const legendEl = document.getElementById('vis-legend');
    if (!legendEl) return;
    legendEl.innerHTML = '';

    const label = document.createElement('span');
    label.style.fontWeight = '600';
    label.style.marginRight = '8px';
    label.style.color = this.colors.textPrimary;
    label.textContent = 'LEGEND:';
    legendEl.appendChild(label);

    items.forEach(item => {
      const wrapper = document.createElement('div');
      wrapper.className = 'legend-item';

      const indicator = document.createElement('div');
      if (item.shape === 'box') {
        indicator.className = 'legend-box';
      } else {
        indicator.className = 'legend-dot';
      }
      indicator.style.backgroundColor = item.color;
      if (item.border) {
        indicator.style.border = `1px solid ${item.border}`;
      }

      const text = document.createElement('span');
      text.textContent = item.label;

      wrapper.appendChild(indicator);
      wrapper.appendChild(text);
      legendEl.appendChild(wrapper);
    });
  }

  initState() {
    this.nodes.clear();
    this.edges.clear();
    this.particles = [];
    this.clearStepIntervals();
    this.state = {};

    const colors = this.colors;
    
    switch (this.algoId) {
      case 'pow':
        this.nodes.add([
          { id: 'client', label: 'User Node', title: 'User Node: Submits transactions.', x: -180, y: 0 },
          { id: 'mempool', label: 'Mempool', title: 'Mempool: Holds pending transactions.', x: -70, y: 0 },
          { id: 'puzzle', label: 'Target Hash', title: 'Target Hash: The difficulty target miners try to solve.', x: 40, y: 0 },
          { id: 'minerA', label: 'Miner A', title: 'Miner A: Mining block proposals.', x: 150, y: -65 },
          { id: 'minerB', label: 'Miner B', title: 'Miner B: Mining block proposals.', x: 150, y: 0 },
          { id: 'minerC', label: 'Miner C', title: 'Miner C: Mining block proposals.', x: 150, y: 65 },
          { id: 'ledger', label: 'Ledger', title: 'Ledger: Validated chain.', x: 250, y: 0, shape: 'database' }
        ]);

        this.edges.add([
          { from: 'client', to: 'mempool' },
          { from: 'mempool', to: 'minerA' },
          { from: 'mempool', to: 'minerB' },
          { from: 'mempool', to: 'minerC' },
          { from: 'minerA', to: 'puzzle' },
          { from: 'minerB', to: 'puzzle' },
          { from: 'minerC', to: 'puzzle' },
          { from: 'puzzle', to: 'ledger' }
        ]);

        this.updateLegend([
          { shape: 'box', color: '#0d0e12', border: '#222530', label: 'System Nodes' },
          { shape: 'dot', color: colors.cyan, label: 'Tx Flows' },
          { shape: 'dot', color: colors.orange, label: 'Nonce Attempts' },
          { shape: 'dot', color: colors.green, label: 'Success Block' }
        ]);
        break;

      case 'pos':
        this.nodes.add([
          { id: 'client', label: 'Client Node', title: 'Client Node: Submits txs.', x: -180, y: 0 },
          { id: 'valA', label: 'Val A\n(10% Stake)', title: 'Validator A: Has a 10% Stake.', x: -40, y: -75 },
          { id: 'valB', label: 'Val B\n(60% Stake)', title: 'Validator B: Has a 60% Stake.', x: -40, y: -25 },
          { id: 'valC', label: 'Val C\n(30% Stake)', title: 'Validator C: Has a 30% Stake.', x: -40, y: 25 },
          { id: 'valD', label: 'Val D\n(20% Stake)', title: 'Validator D: Has a 20% Stake.', x: -40, y: 75 },
          { id: 'block', label: 'Block', title: 'Block: Proposed block waiting for validation signatures.', x: 70, y: 0 },
          { id: 'ledger', label: 'Ledger', title: 'Ledger Database.', x: 170, y: 0, shape: 'database' }
        ]);

        this.edges.add([
          { from: 'client', to: 'valA' },
          { from: 'client', to: 'valB' },
          { from: 'client', to: 'valC' },
          { from: 'client', to: 'valD' },
          { from: 'valA', to: 'block' },
          { from: 'valB', to: 'block' },
          { from: 'valC', to: 'block' },
          { from: 'valD', to: 'block' },
          { from: 'block', to: 'ledger' }
        ]);

        this.updateLegend([
          { shape: 'box', color: '#0d0e12', border: '#222530', label: 'System Components' },
          { shape: 'dot', color: colors.cyan, label: 'Tx / Proposed Block' },
          { shape: 'dot', color: colors.green, label: 'Attestations' }
        ]);
        break;

      case 'dpos':
        this.nodes.add([
          { id: 'voter0', label: 'Voter 0', title: 'Voter: Delegates stake weight.', x: -180, y: -50 },
          { id: 'voter1', label: 'Voter 1', title: 'Voter: Delegates stake weight.', x: -180, y: 50 },
          { id: 'candA', label: 'Candidate A', title: 'Candidate A.', x: -70, y: -50 },
          { id: 'candB', label: 'Candidate B', title: 'Candidate B.', x: -70, y: 50 },
          { id: 'bpA', label: 'Active BP A', title: 'Active BP A: Elected block producer.', x: 40, y: -40 },
          { id: 'bpB', label: 'Active BP B', title: 'Active BP B: Elected block producer.', x: 40, y: 40 },
          { id: 'ledger', label: 'Ledger', title: 'Committed Ledger.', x: 150, y: 0, shape: 'database' }
        ]);

        this.edges.add([
          { from: 'voter0', to: 'candA' },
          { from: 'voter1', to: 'candB' },
          { from: 'bpA', to: 'ledger' },
          { from: 'bpB', to: 'ledger' }
        ]);

        this.updateLegend([
          { shape: 'box', color: '#0d0e12', label: 'Voter / Candidates' },
          { shape: 'box', color: colors.green, label: 'Elected Active BPs' },
          { shape: 'dot', color: colors.cyan, label: 'Votes / Blocks' }
        ]);
        break;

      case 'poh':
        for (let i = 0; i < 4; i++) {
          this.nodes.add({
            id: `tick_${i}`,
            label: `Tick #${i * 100}`,
            title: `VDF Tick: Passage of time.`,
            x: -60,
            y: -90 + i * 60
          });
          if (i > 0) {
            this.edges.add({ from: `tick_${i-1}`, to: `tick_${i}` });
          }
        }
        this.nodes.add([
          { id: 'client', label: 'User Node', title: 'User Node.', x: -180, y: 0 },
          { id: 'valX', label: 'Val X', title: 'Validator X.', x: 50, y: -40 },
          { id: 'valY', label: 'Val Y', title: 'Validator Y.', x: 50, y: 40 },
          { id: 'ledger', label: 'Ledger', title: 'Ledger.', x: 160, y: 0, shape: 'database' }
        ]);

        this.edges.add([
          { from: 'client', to: 'tick_1' },
          { from: 'tick_3', to: 'ledger' }
        ]);

        this.updateLegend([
          { shape: 'box', color: '#0d0e12', label: 'VDF Clock Ticks' },
          { shape: 'dot', color: colors.cyan, label: 'Tx Timestamp' },
          { shape: 'dot', color: colors.green, label: 'Parallel Read Verify' }
        ]);
        break;

      case 'dag':
        this.nodes.add([
          { id: 'tx0', label: 'Tx 0', title: 'Confirmed Tx.', x: -160, y: 0 },
          { id: 'tx1', label: 'Tx 1', title: 'Confirmed Tx.', x: -90, y: -40 },
          { id: 'tx2', label: 'Tx 2', title: 'Confirmed Tx.', x: -90, y: 40 },
          { id: 'tipA', label: 'Tip A', title: 'Unconfirmed Tip A.', x: -20, y: -30, color: { background: 'rgba(255,87,34,0.05)', border: colors.orange } },
          { id: 'tipB', label: 'Tip B', title: 'Unconfirmed Tip B.', x: -20, y: 30, color: { background: 'rgba(255,87,34,0.05)', border: colors.orange } },
          { id: 'newTx', label: 'New Tx', title: 'New Tx.', x: 70, y: 0, color: { background: 'rgba(47,128,237,0.1)', border: colors.cyan } }
        ]);

        this.edges.add([
          { from: 'tx1', to: 'tx0' },
          { from: 'tx2', to: 'tx0' },
          { from: 'tipA', to: 'tx1' },
          { from: 'tipB', to: 'tx2' }
        ]);

        this.updateLegend([
          { shape: 'box', color: '#0d0e12', label: 'Confirmed Txs' },
          { shape: 'box', color: 'rgba(255,87,34,0.05)', border: colors.orange, label: 'Tips' },
          { shape: 'box', color: 'rgba(47,128,237,0.1)', border: colors.cyan, label: 'Incoming Tx' }
        ]);
        break;

      case 'avalanche':
        // Clean 3x3 grid matrix
        for (let i = 0; i < 9; i++) {
          const row = Math.floor(i / 3);
          const col = i % 3;
          this.nodes.add({
            id: `node_${i}`,
            label: i === 4 ? 'Query Node' : `Node ${i}`,
            title: i === 4 ? 'Query Node: Polls consensus preferences.' : 'Validator Node.',
            x: -80 + col * 80,
            y: -60 + row * 60,
            color: { background: i % 2 === 0 ? 'rgba(255,87,34,0.05)' : 'rgba(47,128,237,0.05)', border: i % 2 === 0 ? colors.orange : colors.cyan }
          });
        }

        this.updateLegend([
          { shape: 'box', color: 'rgba(255,87,34,0.05)', border: colors.orange, label: 'Preference A' },
          { shape: 'box', color: 'rgba(47,128,237,0.05)', border: colors.cyan, label: 'Preference B' },
          { shape: 'dot', color: colors.cyan, label: 'Sample Polls' }
        ]);
        break;

      case 'pbft':
        this.nodes.add([
          { id: 'client', label: 'Client', title: 'Client.', x: -180, y: 0 },
          { id: 'leader', label: 'Leader', title: 'Leader.', x: -90, y: 0 },
          { id: 'rep1', label: 'Replica 1', title: 'Replica 1.', x: 20, y: -65 },
          { id: 'rep2', label: 'Replica 2', title: 'Replica 2.', x: 20, y: 0 },
          { id: 'rep3', label: 'Faulty Rep', title: 'Faulty Replica.', x: 20, y: 65, color: { background: 'rgba(255,87,34,0.05)', border: colors.orange } }
        ]);

        this.edges.add([
          { from: 'client', to: 'leader' },
          { from: 'leader', to: 'rep1' },
          { from: 'leader', to: 'rep2' },
          { from: 'leader', to: 'rep3' }
        ]);

        this.updateLegend([
          { shape: 'box', color: '#0d0e12', label: 'Active Replicas' },
          { shape: 'box', color: 'rgba(255,87,34,0.05)', border: colors.orange, label: 'Byzantine Nodes' },
          { shape: 'dot', color: colors.purple, label: 'Prepare Phase' },
          { shape: 'dot', color: colors.green, label: 'Commit Phase' }
        ]);
        break;

      case 'rollups':
        this.nodes.add([
          { id: 'userA', label: 'L2 User A', title: 'L2 User.', x: -180, y: -40 },
          { id: 'userB', label: 'L2 User B', title: 'L2 User.', x: -180, y: 40 },
          { id: 'sequencer', label: 'L2 Sequencer', title: 'L2 Sequencer.', x: -40, y: 0 },
          { id: 'l1', label: 'Ethereum L1', title: 'L1 Blockchain.', x: 100, y: 0, shape: 'database' }
        ]);

        this.edges.add([
          { from: 'userA', to: 'sequencer' },
          { from: 'userB', to: 'sequencer' },
          { from: 'sequencer', to: 'l1' }
        ]);

        this.updateLegend([
          { shape: 'box', color: '#0d0e12', label: 'L2 Users' },
          { shape: 'box', color: 'rgba(142,45,226,0.1)', border: colors.purple, label: 'L2 Sequencer' },
          { shape: 'database', color: 'rgba(33,150,83,0.08)', border: colors.green, label: 'Base L1 Chain' }
        ]);
        break;

      case 'poa':
        this.nodes.add([
          { id: 'client', label: 'User Node', title: 'User Node.', x: -180, y: 0 },
          { id: 'authA', label: 'Intel Node', title: 'Authority Node.', x: -40, y: -50 },
          { id: 'authB', label: 'Stripe Node', title: 'Authority Node.', x: -40, y: 50 },
          { id: 'ledger', label: 'Ledger', title: 'Ledger Chain.', x: 80, y: 0, shape: 'database' }
        ]);

        this.edges.add([
          { from: 'client', to: 'authA' },
          { from: 'client', to: 'authB' },
          { from: 'authA', to: 'ledger' },
          { from: 'authB', to: 'ledger' }
        ]);

        this.updateLegend([
          { shape: 'box', color: '#0d0e12', label: 'Authorities' },
          { shape: 'database', color: '#0d0e12', label: 'Ledger' },
          { shape: 'dot', color: colors.green, label: 'Proposals' }
        ]);
        break;

      case 'poc':
        this.nodes.add([
          { id: 'challenge', label: 'Challenger', title: 'Challenger Node.', x: -180, y: 0 },
          { id: 'driveA', label: 'Drive 2TB', title: 'Miner storage disk.', x: -40, y: -50 },
          { id: 'driveB', label: 'Drive 12TB', title: 'Miner storage disk.', x: -40, y: 50 },
          { id: 'ledger', label: 'Ledger', title: 'Ledger.', x: 80, y: 0, shape: 'database' }
        ]);

        this.edges.add([
          { from: 'challenge', to: 'driveA' },
          { from: 'challenge', to: 'driveB' },
          { from: 'driveB', to: 'ledger' }
        ]);

        this.updateLegend([
          { shape: 'box', color: '#0d0e12', label: 'Miner Disk Spaces' },
          { shape: 'dot', color: colors.cyan, label: 'Sweep Hash' },
          { shape: 'dot', color: colors.green, label: 'Solutions' }
        ]);
        break;
    }

    this.onStepChange();

    // Secure fit on load
    setTimeout(() => {
      if (this.network) {
        this.network.fit({ animation: false });
      }
    }, 100);
  }

  // Trigger phase-specific animations when step transitions
  onStepChange() {
    this.clearStepIntervals();
    this.refreshColors();
    const colors = this.colors;
    this.particles = [];
    this.state = {};

    switch (this.algoId) {
      case 'pow':
        this.nodes.update([
          { id: 'puzzle', label: 'Target Hash', size: 28, color: { background: 'rgba(47,128,237,0.1)', border: colors.cyan } },
          { id: 'minerA', label: 'Miner A', color: { background: '#0d0e12', border: '#222530' } },
          { id: 'minerB', label: 'Miner B', color: { background: '#0d0e12', border: '#222530' } },
          { id: 'minerC', label: 'Miner C', color: { background: '#0d0e12', border: '#222530' } }
        ]);

        if (this.currentStep === 0) {
          this.timers.pow_loop = setInterval(() => {
            this.spawnParticle('client', 'mempool', 0.04, colors.cyan, null, 'Tx');
          }, 800);
        } else if (this.currentStep === 1) {
          this.timers.pow_loop = setInterval(() => {
            const randA = Math.floor(Math.random() * 900) + 100;
            const randB = Math.floor(Math.random() * 900) + 100;
            const randC = Math.floor(Math.random() * 900) + 100;
            this.spawnParticle('minerA', 'puzzle', 0.05, colors.orange, null, `n:${randA}`);
            this.spawnParticle('minerB', 'puzzle', 0.05, colors.orange, null, `n:${randB}`);
            this.spawnParticle('minerC', 'puzzle', 0.05, colors.orange, null, `n:${randC}`);
          }, 600);
        } else if (this.currentStep === 2) {
          this.nodes.update([
            { id: 'minerA', label: 'Miner A\n[Idle]' },
            { id: 'minerC', label: 'Miner C\n[Idle]' },
            { id: 'minerB', label: 'Miner B\n[Winner]', color: { background: 'rgba(33,150,83,0.15)', border: colors.green } }
          ]);
          this.state.pulsingNode = 'minerB';
          this.spawnParticle('minerB', 'puzzle', 0.03, colors.green, () => {
            this.nodes.update({
              id: 'puzzle',
              label: 'Hash Solved',
              size: 34,
              color: { background: 'rgba(33,150,83,0.2)', border: colors.green }
            });
          }, 'Block');
        } else if (this.currentStep === 3) {
          this.nodes.update({
            id: 'puzzle',
            label: 'Valid Block',
            size: 28,
            color: { background: 'rgba(33,150,83,0.2)', border: colors.green }
          });
          this.spawnParticle('puzzle', 'ledger', 0.03, colors.green, () => {
            this.nodes.update({
              id: 'ledger',
              color: { background: 'rgba(33,150,83,0.15)', border: colors.green }
            });
            this.timers.ledger_reset = setTimeout(() => {
              if (this.algoId !== 'pow') return;
              this.nodes.update({
                id: 'ledger',
                color: { background: 'rgba(142,45,226,0.1)', border: colors.purple }
              });
            }, 800);
          }, 'Block #101');
        }
        break;

      case 'pos':
        this.nodes.update([
          { id: 'valA', label: 'Val A\n(10% Stake)', color: { background: 'rgba(142,45,226,0.08)', border: colors.purple } },
          { id: 'valB', label: 'Val B\n(60% Stake)', color: { background: 'rgba(142,45,226,0.08)', border: colors.purple } },
          { id: 'valC', label: 'Val C\n(30% Stake)', color: { background: 'rgba(142,45,226,0.08)', border: colors.purple } },
          { id: 'valD', label: 'Val D\n(20% Stake)', color: { background: 'rgba(142,45,226,0.08)', border: colors.purple } },
          { id: 'block', label: 'Block', color: { background: '#0d0e12', border: '#222530' } }
        ]);

        if (this.currentStep === 0) {
          this.timers.pos_loop = setInterval(() => {
            const targets = ['valA', 'valB', 'valC', 'valD'];
            const randomDest = targets[Math.floor(Math.random() * targets.length)];
            this.spawnParticle('client', randomDest, 0.04, colors.cyan, null, 'Tx');
          }, 700);
        } else if (this.currentStep === 1) {
          let count = 0;
          const vals = ['valA', 'valD', 'valC', 'valB'];
          this.timers.pos_loop = setInterval(() => {
            if (count < vals.length) {
              const currentId = vals[count];
              this.nodes.update({
                id: currentId,
                color: { background: 'rgba(47,128,237,0.15)', border: colors.cyan }
              });
              if (count > 0) {
                this.nodes.update({
                  id: vals[count - 1],
                  color: { background: 'rgba(142,45,226,0.08)', border: colors.purple }
                });
              }
              count++;
            } else {
              clearInterval(this.timers.pos_loop);
              this.nodes.update({
                id: 'valB',
                label: 'Val B\n[Slot Leader]',
                color: { background: 'rgba(47,128,237,0.2)', border: colors.cyan }
              });
              this.state.pulsingNode = 'valB';
            }
          }, 350);
        } else if (this.currentStep === 2) {
          this.nodes.update({
            id: 'valB',
            label: 'Val B\n[Slot Leader]',
            color: { background: 'rgba(47,128,237,0.2)', border: colors.cyan }
          });
          this.state.pulsingNode = 'valB';
          this.spawnParticle('valB', 'block', 0.04, colors.green, () => {
            this.nodes.update({
              id: 'block',
              label: 'Block\n[Proposed]',
              color: { background: 'rgba(33,150,83,0.2)', border: colors.green }
            });
          }, 'Block');
        } else if (this.currentStep === 3) {
          this.nodes.update({
            id: 'valB',
            label: 'Val B\n[Slot Leader]',
            color: { background: 'rgba(47,128,237,0.2)', border: colors.cyan }
          });
          this.nodes.update({
            id: 'block',
            label: 'Block\n[Committed]',
            color: { background: 'rgba(33,150,83,0.2)', border: colors.green }
          });

          const attesters = ['valA', 'valC', 'valD'];
          attesters.forEach(id => {
            this.spawnParticle(id, 'block', 0.04, colors.green, null, 'Attest');
          });

          this.timers.pos_timeout = setTimeout(() => {
            if (this.algoId !== 'pos' || this.currentStep !== 3) return;
            this.spawnParticle('block', 'ledger', 0.04, colors.green, () => {
              this.nodes.update({
                id: 'ledger',
                color: { background: 'rgba(33,150,83,0.15)', border: colors.green }
              });
              this.timers.ledger_reset = setTimeout(() => {
                if (this.algoId !== 'pos') return;
                this.nodes.update({
                  id: 'ledger',
                  color: { background: 'rgba(142,45,226,0.1)', border: colors.purple }
                });
              }, 800);
            }, 'Block');
          }, 1200);
        }
        break;

      case 'dpos':
        this.nodes.update([
          { id: 'bpA', label: 'BP A', color: { background: '#0d0e12', border: '#222530' } },
          { id: 'bpB', label: 'BP B', color: { background: '#0d0e12', border: '#222530' } }
        ]);

        if (this.currentStep === 0) {
          this.timers.dpos_loop = setInterval(() => {
            const voters = ['voter0', 'voter1'];
            const randomVoter = voters[Math.floor(Math.random() * voters.length)];
            const targets = ['candA', 'candB'];
            const randomCand = targets[Math.floor(Math.random() * targets.length)];
            this.spawnParticle(randomVoter, randomCand, 0.03, 'rgba(255,255,255,0.4)', null, 'Vote');
          }, 400);
        } else if (this.currentStep === 1) {
          this.nodes.update([
            { id: 'bpA', label: 'Elected BP A', color: { background: 'rgba(33,150,83,0.15)', border: colors.green } },
            { id: 'bpB', label: 'Elected BP B', color: { background: 'rgba(33,150,83,0.15)', border: colors.green } }
          ]);
        } else if (this.currentStep === 2) {
          this.nodes.update([
            { id: 'bpA', label: 'Elected BP A', color: { background: 'rgba(33,150,83,0.15)', border: colors.green } },
            { id: 'bpB', label: 'Elected BP B', color: { background: 'rgba(33,150,83,0.15)', border: colors.green } }
          ]);
          
          let index = 0;
          const activeBPs = ['bpA', 'bpB'];
          this.timers.dpos_loop = setInterval(() => {
            const currentBP = activeBPs[index];
            this.state.pulsingNode = currentBP;
            this.nodes.update({ id: currentBP, label: `BP ${currentBP.charAt(2)}\n[Proposing]` });
            const prevBP = activeBPs[(index + 1) % 2];
            this.nodes.update({ id: prevBP, label: `Elected BP ${prevBP.charAt(2)}` });

            this.spawnParticle(currentBP, 'ledger', 0.05, colors.green, null, 'Block');
            index = (index + 1) % 2;
          }, 1200);
        }
        break;

      case 'poh':
        if (this.currentStep === 0) {
          let count = 0;
          this.timers.poh_loop = setInterval(() => {
            const tickId = `tick_${count}`;
            this.nodes.update({
              id: tickId,
              color: { background: 'rgba(47,128,237,0.25)', border: colors.cyan }
            });
            setTimeout(() => {
              if (this.algoId !== 'poh') return;
              this.nodes.update({
                id: tickId,
                color: { background: 'rgba(142,45,226,0.1)', border: colors.purple }
              });
            }, 300);
            count = (count + 1) % 4;
          }, 500);
        } else if (this.currentStep === 1) {
          this.timers.poh_loop = setInterval(() => {
            const targetTickIdx = Math.floor(Math.random() * 4);
            this.spawnParticle('client', `tick_${targetTickIdx}`, 0.04, colors.cyan, () => {
              this.nodes.update({
                id: `tick_${targetTickIdx}`,
                label: `Tick #${targetTickIdx * 100}\n[Tx Stamped]`,
                color: { background: 'rgba(33,150,83,0.2)', border: colors.green }
              });
              this.timers.poh_reset = setTimeout(() => {
                if (this.algoId !== 'poh') return;
                this.nodes.update({
                  id: `tick_${targetTickIdx}`,
                  label: `Tick #${targetTickIdx * 100}`,
                  color: { background: 'rgba(142,45,226,0.1)', border: colors.purple }
                });
              }, 800);
            }, 'Tx');
          }, 900);
        } else if (this.currentStep === 2) {
          this.timers.poh_loop = setInterval(() => {
            this.spawnParticle('valX', 'tick_1', 0.05, colors.green, null, 'Verify');
            this.spawnParticle('valY', 'tick_2', 0.05, colors.green, null, 'Verify');
          }, 1000);
        }
        break;

      case 'dag':
        this.nodes.update([
          { id: 'tipA', label: 'Tip A', color: { background: 'rgba(255,87,34,0.05)', border: colors.orange } },
          { id: 'tipB', label: 'Tip B', color: { background: 'rgba(255,87,34,0.05)', border: colors.orange } },
          { id: 'newTx', label: 'New Tx', color: { background: 'rgba(47,128,237,0.25)', border: colors.cyan } }
        ]);

        if (this.currentStep === 1) {
          this.spawnParticle('newTx', 'tipA', 0.03, colors.cyan, null, 'Approve');
          this.spawnParticle('newTx', 'tipB', 0.03, colors.cyan, null, 'Approve');
        } else if (this.currentStep === 2) {
          this.nodes.update([
            { id: 'tipA', label: 'Tx A\n[Confirmed]', color: { background: 'rgba(142,45,226,0.15)', border: colors.purple } },
            { id: 'tipB', label: 'Tx B\n[Confirmed]', color: { background: 'rgba(142,45,226,0.15)', border: colors.purple } },
            { id: 'newTx', label: 'Tx C\n[Tip]', color: { background: 'rgba(255,87,34,0.15)', border: colors.orange } }
          ]);
        }
        break;

      case 'avalanche':
        if (this.currentStep === 0) {
          const srcIdx = 4;
          const neighbors = [1, 3, 5, 7];
          neighbors.forEach(nId => {
            this.spawnParticle(`node_${srcIdx}`, `node_${nId}`, 0.04, colors.cyan, null, 'Query');
          });
        } else if (this.currentStep === 1) {
          this.timers.avax_loop = setInterval(() => {
            const src = Math.floor(Math.random() * 9);
            const dest = Math.floor(Math.random() * 9);
            if (src !== dest) {
              this.spawnParticle(`node_${src}`, `node_${dest}`, 0.05, colors.orange, null, 'Poll');
            }
          }, 400);
        } else if (this.currentStep === 2) {
          for (let i = 0; i < 9; i++) {
            this.nodes.update({
              id: `node_${i}`,
              color: { background: 'rgba(47,128,237,0.25)', border: colors.cyan }
            });
          }
        }
        break;

      case 'pbft':
        this.nodes.update({ id: 'leader', label: 'Leader' });
        if (this.currentStep === 0) {
          this.spawnParticle('client', 'leader', 0.03, colors.cyan, null, 'Tx');
        } else if (this.currentStep === 1) {
          this.nodes.update({ id: 'leader', label: 'Leader\n[Pre-Prepare]' });
          this.spawnParticle('leader', 'rep1', 0.04, colors.purple, null, 'Prep');
          this.spawnParticle('leader', 'rep2', 0.04, colors.purple, null, 'Prep');
          this.spawnParticle('leader', 'rep3', 0.04, colors.purple, null, 'Prep');
          
          this.timers.pbft_prep_timeout = setTimeout(() => {
            if (this.algoId !== 'pbft' || this.currentStep !== 1) return;
            this.spawnParticle('rep1', 'rep2', 0.03, colors.purple, null, 'Prep');
            this.spawnParticle('rep2', 'rep1', 0.03, colors.purple, null, 'Prep');
          }, 1000);
        } else if (this.currentStep === 2) {
          this.spawnParticle('rep1', 'client', 0.03, colors.green, null, 'Commit');
          this.spawnParticle('rep2', 'client', 0.03, colors.green, null, 'Commit');
        }
        break;

      case 'rollups':
        this.nodes.update({ id: 'sequencer', label: 'L2 Sequencer' });
        if (this.currentStep === 0) {
          this.timers.rollup_loop = setInterval(() => {
            const users = ['userA', 'userB'];
            const src = users[Math.floor(Math.random() * users.length)];
            this.spawnParticle(src, 'sequencer', 0.04, colors.cyan, null, 'Tx');
          }, 600);
        } else if (this.currentStep === 1) {
          this.nodes.update({ id: 'sequencer', label: 'L2 Sequencer\n[Packing]' });
          this.state.pulsingNode = 'sequencer';
        } else if (this.currentStep === 2) {
          this.spawnParticle('sequencer', 'l1', 0.03, colors.green, () => {
            this.nodes.update({
              id: 'l1',
              label: 'Ethereum L1\n[Verified]',
              color: { background: 'rgba(33,150,83,0.2)', border: colors.green }
            });
            this.timers.l1_reset = setTimeout(() => {
              if (this.algoId !== 'rollups') return;
              this.nodes.update({
                id: 'l1',
                label: 'Ethereum L1',
                color: { background: 'rgba(33,150,83,0.1)', border: colors.green }
              });
            }, 800);
          }, 'ZK-Proof');
        }
        break;

      case 'poa':
        this.nodes.update({ id: 'authB', label: 'Stripe Node', color: { background: '#0d0e12', border: '#222530' } });
        if (this.currentStep === 0) {
          this.spawnParticle('client', 'authB', 0.03, colors.cyan, null, 'Tx');
        } else if (this.currentStep === 1) {
          this.nodes.update({ id: 'authB', label: 'Stripe\n[Signing]', color: { background: 'rgba(33,150,83,0.15)', border: colors.green } });
          this.state.pulsingNode = 'authB';
        } else if (this.currentStep === 2) {
          this.spawnParticle('authB', 'ledger', 0.03, colors.green, () => {
            this.nodes.update({
              id: 'ledger',
              color: { background: 'rgba(33,150,83,0.15)', border: colors.green }
            });
            this.timers.ledger_reset = setTimeout(() => {
              if (this.algoId !== 'poa') return;
              this.nodes.update({
                id: 'ledger',
                color: { background: 'rgba(142,45,226,0.1)', border: colors.purple }
              });
            }, 800);
          }, 'Block');
        }
        break;

      case 'poc':
        this.nodes.update({ id: 'driveB', label: 'Drive 12TB', color: { background: '#0d0e12', border: '#222530' } });
        if (this.currentStep === 1) {
          this.spawnParticle('challenge', 'driveA', 0.03, colors.cyan, null, 'Query');
          this.spawnParticle('challenge', 'driveB', 0.03, colors.cyan, null, 'Query');
        } else if (this.currentStep === 2) {
          this.nodes.update({ id: 'driveB', label: 'Miner B\n[Winner]', color: { background: 'rgba(33,150,83,0.15)', border: colors.green } });
          this.state.pulsingNode = 'driveB';
          this.spawnParticle('driveB', 'ledger', 0.03, colors.green, () => {
            this.nodes.update({
              id: 'ledger',
              color: { background: 'rgba(33,150,83,0.15)', border: colors.green }
            });
            this.timers.ledger_reset = setTimeout(() => {
              if (this.algoId !== 'poc') return;
              this.nodes.update({
                id: 'ledger',
                color: { background: 'rgba(142,45,226,0.1)', border: colors.purple }
              });
            }, 800);
          }, 'Block');
        }
        break;
    }
  }

  animate() {
    if (!this.network) return;

    this.time += 0.05;
    
    // Update particle progress
    let needsRedraw = false;
    const activeParticles = [];
    
    this.particles.forEach(p => {
      p.progress += p.speed || 0.02;
      needsRedraw = true;
      
      if (p.progress < 1.0) {
        activeParticles.push(p);
      } else {
        if (p.onArrival) p.onArrival();
      }
    });
    this.particles = activeParticles;
    
    if (this.state && this.state.pulsingNode) {
      needsRedraw = true;
    }

    if (needsRedraw) {
      this.network.redraw();
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  drawCustomAnimations(ctx) {
    if (!this.network) return;
    const positions = this.network.getPositions();
    const colors = this.colors;

    // Draw active floating particles on the canvas
    this.particles.forEach(p => {
      const start = typeof p.from === 'string' ? positions[p.from] : p.from;
      const end = typeof p.to === 'string' ? positions[p.to] : p.to;

      if (start && end) {
        const x = start.x + (end.x - start.x) * p.progress;
        const y = start.y + (end.y - start.y) * p.progress;

        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, 2 * Math.PI, false);
        ctx.fillStyle = p.color || colors.cyan;
        ctx.fill();

        if (p.label) {
          ctx.font = '500 8px JetBrains Mono';
          ctx.fillStyle = '#f0f3f7';
          ctx.textAlign = 'center';
          ctx.fillText(p.label, x, y - 8);
        }
      }
    });

    // Draw expanding proposer pulsing ring directly on the canvas
    if (this.state && this.state.pulsingNode) {
      const nodePos = positions[this.state.pulsingNode];
      if (nodePos) {
        const radius = 22 + Math.sin(this.time * 5) * 4;
        ctx.beginPath();
        ctx.arc(nodePos.x, nodePos.y, radius, 0, 2 * Math.PI, false);
        ctx.strokeStyle = colors.green;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }
  }

  spawnParticle(from, to, speed, color, onArrival, label) {
    this.particles.push({
      from: from,
      to: to,
      progress: 0,
      speed: speed || 0.02,
      color: color,
      onArrival: onArrival,
      label: label
    });
  }
}
