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
    this.isPaused = false;
    
    this.initNetwork();
  }

  initNetwork() {
    this.container.innerHTML = '';
    
    this.options = {
      width: '100%',
      height: '100%',
      nodes: {
        shape: 'dot', // Default shape
        margin: { top: 10, bottom: 10, left: 15, right: 15 },
        font: { size: 12, color: '#f0f3f7', face: 'JetBrains Mono', multi: true },
        borderWidth: 2.0,
        shadow: { enabled: true, color: 'rgba(0,0,0,0.3)', size: 10, x: 0, y: 5 },
        color: {
          background: '#0d0e12',
          border: '#222530',
          highlight: { background: '#121620', border: '#00f0ff' },
          hover: { background: '#121620', border: '#00f0ff' }
        },
        shapeProperties: {
          borderRadius: 4
        }
      },
      edges: {
        width: 2.0,
        color: { color: 'rgba(255, 255, 255, 0.15)', highlight: '#00f0ff' },
        smooth: {
          type: 'continuous',
          forceDirection: 'none'
        },
        arrows: { to: { scaleFactor: 0.6 } }
      },
      physics: {
        enabled: true,
        solver: 'repulsion',
        repulsion: {
          nodeDistance: 120,
          springLength: 100,
          springConstant: 0.05
        },
        stabilization: {
          iterations: 100
        }
      },
      interaction: { dragNodes: true, zoomView: true, hover: true, tooltipDelay: 200 }
    };
    
    const data = {
      nodes: this.nodes,
      edges: this.edges
    };
    
    this.network = new Network(this.container, data, this.options);

    // Optional: when user drags or clicks, we can pause the animation
    this.network.on('click', () => {
      this.isPaused = true;
    });
    this.network.on('dragStart', () => {
      this.isPaused = true;
    });
  }

  load(algoId, steps) {
    this.stopInterval();
    this.algoId = algoId;
    this.steps = steps;
    this.currentStep = 0;
    this.isPaused = false;

    this.nodes.clear();
    this.edges.clear();

    this.onStepChange(true);
    this.startInterval();
  }

  goToStep(index) {
    this.stopInterval();
    this.currentStep = index;
    this.isPaused = true; // Pause when user interacts manually with UI
    this.onStepChange(false);
  }

  startInterval() {
    this.interval = setInterval(() => {
      if (this.isPaused) {
        return; // Wait for user to resume (we could add a play button later)
      }
      this.currentStep = (this.currentStep + 1) % this.steps.length;
      this.onStepChange(false);
    }, 5000);
  }

  stopInterval() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
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

  onStepChange(isInitialLoad) {
    this.highlightStepUI();
    
    const stepData = this.steps[this.currentStep];
    if (stepData && stepData.graph) {
      const newNodes = stepData.graph.nodes || [];
      const newEdges = stepData.graph.edges || [];

      // Animate node changes
      const existingNodeIds = this.nodes.getIds();
      const newNodeIds = newNodes.map(n => n.id);
      
      const nodesToRemove = existingNodeIds.filter(id => !newNodeIds.includes(id));
      this.nodes.remove(nodesToRemove);
      this.nodes.update(newNodes);

      // Edges update
      this.edges.clear();
      this.edges.add(newEdges);

      if (isInitialLoad) {
        this.network.stabilize();
      }
      
      // Auto fit the network nicely
      setTimeout(() => {
        this.network.fit({ 
          animation: { duration: 800, easingFunction: 'easeInOutQuad' } 
        });
      }, 100);
    }
  }
}
