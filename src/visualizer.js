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
    this.speedMultiplier = 1;
    
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
        font: { size: 13, color: '#ffffff', face: 'Inter', multi: true, bold: { color: '#ffffff', size: 13, face: 'Inter' } },
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
      interaction: { dragNodes: true, zoomView: false, hover: true, tooltipDelay: 200 } // zoomView disabled to prevent scroll trapping
    };
    
    const data = {
      nodes: this.nodes,
      edges: this.edges
    };
    
    this.network = new Network(this.container, data, this.options);

    // Zoom on wheel ONLY when Ctrl key is held down
    this.container.addEventListener('wheel', (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        const currentScale = this.network.getScale();
        const factor = e.deltaY < 0 ? 1.15 : 0.85;
        
        // Zoom centered on the cursor position
        const pointer = this.network.DOMtoCanvas({ x: e.offsetX, y: e.offsetY });
        this.network.moveTo({
          position: pointer,
          scale: currentScale * factor,
          offset: { x: 0, y: 0 }
        });
      }
    }, { passive: false });

    // Optional: when user drags or clicks, we can pause the animation
    this.network.on('click', () => {
      this.pause();
    });
    this.network.on('dragStart', () => {
      this.pause();
    });
  }

  load(algoId, steps) {
    this.stopInterval();
    this.algoId = algoId;
    this.steps = steps;
    this.currentStep = 0;
    this.isPaused = false;
    this.updatePlayPauseUI();

    this.nodes.clear();
    this.edges.clear();

    this.onStepChange(true);
    this.startInterval();
  }

  goToStep(index) {
    this.currentStep = index;
    this.pause();
    this.onStepChange(false);
  }

  nextStep() {
    this.pause();
    this.currentStep = (this.currentStep + 1) % this.steps.length;
    this.onStepChange(false);
  }

  prevStep() {
    this.pause();
    this.currentStep = (this.currentStep - 1 + this.steps.length) % this.steps.length;
    this.onStepChange(false);
  }

  togglePlay() {
    if (this.isPaused) {
      this.play();
    } else {
      this.pause();
    }
  }

  pause() {
    this.isPaused = true;
    this.updatePlayPauseUI();
    this.stopInterval();
  }

  play() {
    this.isPaused = false;
    this.updatePlayPauseUI();
    this.startInterval();
  }

  setSpeed(multiplier) {
    this.speedMultiplier = parseFloat(multiplier);
    // Visual active state for speed buttons
    document.querySelectorAll('[id^="btn-speed-"]').forEach(btn => {
      const speed = parseFloat(btn.dataset.speed);
      btn.classList.toggle('active', speed === this.speedMultiplier);
    });

    if (!this.isPaused) {
      this.startInterval(); // restart interval with new speed
    }
  }

  updatePlayPauseUI() {
    const pauseIcon = document.getElementById('icon-pause');
    const playIcon = document.getElementById('icon-play');
    if (pauseIcon && playIcon) {
      if (this.isPaused) {
        pauseIcon.classList.add('hidden');
        playIcon.classList.remove('hidden');
      } else {
        pauseIcon.classList.remove('hidden');
        playIcon.classList.add('hidden');
      }
    }
  }

  zoomIn() {
    const currentScale = this.network.getScale();
    this.network.moveTo({ scale: currentScale * 1.2, animation: { duration: 200 } });
  }

  zoomOut() {
    const currentScale = this.network.getScale();
    this.network.moveTo({ scale: currentScale * 0.8, animation: { duration: 200 } });
  }

  zoomFit() {
    this.network.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
  }

  startInterval() {
    this.stopInterval();
    const baseDuration = 5000;
    const duration = baseDuration / this.speedMultiplier;
    this.interval = setInterval(() => {
      if (this.isPaused) {
        return;
      }
      this.currentStep = (this.currentStep + 1) % this.steps.length;
      this.onStepChange(false);
    }, duration);
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
